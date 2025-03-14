import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import weatherService from '../services/weatherService';
import { Alert } from 'react-native';
import { ProcessedWeatherData, WeatherDataHookResult } from '../types/weather';
import * as midTermForecast from '../../api/midTermForecast';

// 날씨 데이터 캐시 (메모리에 저장)
interface WeatherCache {
  [key: string]: {
    data: any[];
    timestamp: number;
    processedData: ProcessedWeatherData[];
  }
}

let weatherCache: WeatherCache = {};

// 캐시 유효 시간 (3시간 = 10800000 밀리초)
const CACHE_VALIDITY = 10800000;

// 캐시 디버깅 함수
const logCacheStatus = (cacheKey: string) => {
  if (weatherCache[cacheKey]) {
    console.log(`캐시 [${cacheKey}] 상태:`);
    console.log(`- 마지막 업데이트: ${new Date(weatherCache[cacheKey].timestamp).toLocaleString()}`);
    console.log(`- 데이터 항목 수: ${weatherCache[cacheKey].data.length}`);
    console.log(`- 처리된 데이터 항목 수: ${weatherCache[cacheKey].processedData.length}`);
  } else {
    console.log(`캐시 [${cacheKey}]가 존재하지 않습니다.`);
  }
};

/**
 * 날씨 데이터를 가져오는 커스텀 훅
 * @param nx 예보지점 X 좌표
 * @param ny 예보지점 Y 좌표
 * @param landRegId 육상 중기예보 지역 코드 (선택적)
 * @param taRegId 기온 중기예보 지역 코드 (선택적)
 * @returns 날씨 데이터 및 관련 상태
 */
export function useWeatherData(nx: number, ny: number, landRegId?: string, taRegId?: string): WeatherDataHookResult {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  // 캐시 키 생성 (중기예보 지역 코드 포함)
  const cacheKey = `weather_${nx}_${ny}${landRegId ? `_${landRegId}` : ''}${taRegId ? `_${taRegId}` : ''}`;
  
  // 캐시 유효성 확인
  const isCacheValid = useCallback(() => {
    if (!weatherCache[cacheKey]) return false;
    
    const now = Date.now();
    const cacheTime = weatherCache[cacheKey].timestamp;
    
    return (now - cacheTime) < CACHE_VALIDITY;
  }, [cacheKey]);
  
  // 날씨 데이터 가져오기
  const fetchWeatherData = useCallback(async () => {
    
    // 캐시가 유효하면 캐시된 데이터 반환
    if (isCacheValid()) {
      console.log('유효한 캐시 데이터 사용');
      return weatherCache[cacheKey].data;
    }
    
    try {
      // API에서 데이터 가져오기 (nx, ny를 문자열로 변환)
      const data = await weatherService.fetchWeatherForecast(nx.toString(), ny.toString());
      
      // 중기예보 데이터 가져오기 (지역 코드가 있는 경우)
      let midTermData = null;
      if (landRegId && taRegId) {
        try {
          midTermData = await midTermForecast.fetchMidForecastCombined(landRegId, taRegId);
          console.log('중기예보 데이터 가져오기 완료:', midTermData);
        } catch (midTermError) {
          console.error('중기예보 데이터 가져오기 오류:', midTermError);
          // 중기예보 데이터 오류는 전체 데이터 가져오기를 실패시키지 않음
        }
      }
      
      // 캐시 업데이트
      weatherCache[cacheKey] = {
        data: midTermData ? [...data, { midTermData }] : data,
        timestamp: Date.now(),
        processedData: weatherService.processWeatherData(data, midTermData)
      };
      
      return weatherCache[cacheKey].data;
    } catch (error) {
      console.error('날씨 데이터 가져오기 오류:', error);
      throw error;
    }
  }, [nx, ny, landRegId, taRegId, cacheKey, isCacheValid]);
  
  // 처리된 데이터 가져오기
  const getProcessedData = useCallback((): ProcessedWeatherData[] => {
    if (!weatherCache[cacheKey]) return [];
    return weatherCache[cacheKey].processedData;
  }, [cacheKey]);
  
  // React Query 사용
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['weather', nx, ny],
    queryFn: fetchWeatherData,
    staleTime: CACHE_VALIDITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  
  // 좌표가 변경될 때 데이터 다시 가져오기
  useEffect(() => {
    refetch();
  }, [nx, ny, refetch]);
  
  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // 캐시 무효화 후 데이터 다시 가져오기
      if (weatherCache[cacheKey]) {
        weatherCache[cacheKey].timestamp = 0;
      }
      await refetch();
      setLastUpdated(new Date());
    } catch (error) {
      Alert.alert('오류', '날씨 정보를 새로고침하는데 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  }, [cacheKey, refetch]);
  
  // 데이터 로드 완료 시 마지막 업데이트 시간 설정
  useEffect(() => {
    if (!isLoading && !isError && data) {
      setLastUpdated(new Date());
    }
  }, [data, isLoading, isError]);
  
  // 캐시 상태 로깅
  useEffect(() => {
    logCacheStatus(cacheKey);
  }, [cacheKey]);
  
  return {
    processedData: getProcessedData(),
    isLoading,
    isRefreshing,
    isError,
    error,
    lastUpdated,
    refresh: handleRefresh
  };
}

// 기본 내보내기 추가
export default useWeatherData; 
import { useQuery } from '@tanstack/react-query';
import { DailyWeatherData } from '../types/weather';

interface TemperatureData {
  minTempValue: number | null;
  maxTempValue: number | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

/**
 * 특정 날짜의 최저/최고 온도 데이터를 가져오는 훅
 * @param dayData 날짜별 날씨 데이터
 * @returns 온도 관련 데이터 및 상태
 */
function useCampingTemperature(dayData: DailyWeatherData | null): TemperatureData {
  // React Query를 사용하여 데이터 캐싱 및 상태 관리
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['campingTemperature', dayData?.date],
    queryFn: () => processTemperatureData(dayData),
    enabled: !!dayData, // dayData가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 30, // 30분 동안 데이터 유지
  });

  return {
    minTempValue: data?.minTempValue ?? null,
    maxTempValue: data?.maxTempValue ?? null,
    isLoading,
    isError,
    error,
  };
}

/**
 * 온도 데이터 처리 함수
 * @param dayData 날짜별 날씨 데이터
 * @returns 처리된 온도 데이터
 */
async function processTemperatureData(dayData: DailyWeatherData | null): Promise<{ 
  minTempValue: number | null; 
  maxTempValue: number | null; 
}> {
  if (!dayData) {
    return { minTempValue: null, maxTempValue: null };
  }

  // 최저 온도 처리
  let minTempValue = null;
  try {
    if (dayData.minTemp !== null && dayData.minTemp !== undefined) {
      const parsedTemp = Number(dayData.minTemp);
      if (!isNaN(parsedTemp)) {
        minTempValue = Math.round(parsedTemp * 10) / 10; // 소수점 첫째 자리까지 반올림
      }
    }
  } catch (error) {
    console.error('최저 온도 데이터 처리 중 오류:', error);
  }

  // 최고 온도 처리
  let maxTempValue = null;
  try {
    if (dayData.maxTemp !== null && dayData.maxTemp !== undefined) {
      const parsedTemp = Number(dayData.maxTemp);
      if (!isNaN(parsedTemp)) {
        maxTempValue = Math.round(parsedTemp * 10) / 10; // 소수점 첫째 자리까지 반올림
      }
    }
  } catch (error) {
    console.error('최고 온도 데이터 처리 중 오류:', error);
  }

  return { minTempValue, maxTempValue };
}

export default useCampingTemperature; 
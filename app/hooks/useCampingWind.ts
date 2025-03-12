import { useQuery } from '@tanstack/react-query';
import { DailyWeatherData } from '../types/weather';

interface WindData {
  windSpeedValue: number | null;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

/**
 * 특정 날짜의 풍속 데이터를 가져오는 훅
 * @param dayData 날짜별 날씨 데이터
 * @returns 풍속 관련 데이터 및 상태
 */
function useCampingWind(dayData: DailyWeatherData | null): WindData {
  // React Query를 사용하여 데이터 캐싱 및 상태 관리
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['campingWind', dayData?.date],
    queryFn: () => processWindData(dayData),
    enabled: !!dayData, // dayData가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 30, // 30분 동안 데이터 유지
  });

  return {
    windSpeedValue: data?.windSpeedValue ?? null,
    isLoading,
    isError,
    error,
  };
}

/**
 * 풍속 데이터 처리 함수
 * @param dayData 날짜별 날씨 데이터
 * @returns 처리된 풍속 데이터
 */
async function processWindData(dayData: DailyWeatherData | null): Promise<{ 
  windSpeedValue: number | null; 
}> {
  if (!dayData) {
    return { windSpeedValue: null };
  }

  // 풍속 처리
  let windSpeedValue = null;
  try {
    if (dayData.wsd !== null && dayData.wsd !== undefined) {
      const parsedWsd = Number(dayData.wsd);
      if (!isNaN(parsedWsd)) {
        windSpeedValue = Math.round(parsedWsd * 10) / 10; // 소수점 첫째 자리까지 반올림
      }
    }
  } catch (error) {
    console.error('풍속 데이터 처리 중 오류:', error);
  }

  return { windSpeedValue };
}

export default useCampingWind; 
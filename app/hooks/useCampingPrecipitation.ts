import { useQuery } from '@tanstack/react-query';
import { DailyWeatherData } from '../types/weather';
import { fetchUltraSrtNcst } from '../../api/weatherForecast';
import { useLocationStore } from '../stores/locationStore';

interface PrecipitationData {
  pty: string | null;
  pcpCategory: string | null;
  pcpText: string | null;
  pcpValue: string | null;
  snoCategory: string | null;
  snoText: string | null;
  snoValue: string | null;
  maxPcpCategory: string | null;
  maxPcpText: string | null;
  maxSnoCategory: string | null;
  maxSnoText: string | null;
  sky: string | null;
  rn1Value: string | null; // 초단기실황 1시간 강수량
  isLoading: boolean;
  isError: boolean;
  error: any;
}

/**
 * 특정 날짜의 강수량/적설량 데이터를 가져오는 훅
 * @param dayData 날짜별 날씨 데이터
 * @returns 강수량/적설량 관련 데이터 및 상태
 */
function useCampingPrecipitation(dayData: DailyWeatherData | null): PrecipitationData {
  // 현재 선택된 위치 정보 가져오기
  const { selectedLocation } = useLocationStore();
  const nx = selectedLocation?.nx || 60;
  const ny = selectedLocation?.ny || 127;

  // 기존 강수 데이터 처리를 위한 쿼리
  const { data: precipData, isLoading: isPrecipLoading, isError: isPrecipError, error: precipError } = useQuery({
    queryKey: ['campingPrecipitation', dayData?.date],
    queryFn: () => processPrecipitationData(dayData),
    enabled: !!dayData, // dayData가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 30, // 30분 동안 데이터 유지
  });

  // 초단기실황 RN1 데이터를 가져오기 위한 쿼리 (오늘 데이터인 경우에만)
  const isToday = dayData?.date === new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  const { data: rn1Data, isLoading: isRn1Loading } = useQuery({
    queryKey: ['ultraSrtNcst', nx, ny],
    queryFn: () => fetchUltraSrtNcst(nx, ny),
    enabled: !!dayData && isToday, // 오늘 데이터인 경우에만 실행
    staleTime: 1000 * 60 * 10, // 10분 동안 데이터 유지
    refetchInterval: 1000 * 60 * 10, // 10분마다 자동 갱신
  });

  // 로딩 상태 통합
  const isLoading = isPrecipLoading || (isToday && isRn1Loading);

  return {
    pty: precipData?.pty ?? null,
    pcpCategory: precipData?.pcpCategory ?? null,
    pcpText: precipData?.pcpText ?? null,
    pcpValue: precipData?.pcpValue ?? null,
    snoCategory: precipData?.snoCategory ?? null,
    snoText: precipData?.snoText ?? null,
    snoValue: precipData?.snoValue ?? null,
    maxPcpCategory: precipData?.maxPcpCategory ?? null,
    maxPcpText: precipData?.maxPcpText ?? null,
    maxSnoCategory: precipData?.maxSnoCategory ?? null,
    maxSnoText: precipData?.maxSnoText ?? null,
    sky: precipData?.sky ?? null,
    rn1Value: isToday ? rn1Data : null, // 오늘 데이터인 경우에만 RN1 값 사용
    isLoading,
    isError: isPrecipError,
    error: precipError,
  };
}

/**
 * 강수량/적설량 데이터 처리 함수
 * @param dayData 날짜별 날씨 데이터
 * @returns 처리된 강수량/적설량 데이터
 */
async function processPrecipitationData(dayData: DailyWeatherData | null): Promise<{
  pty: string | null;
  pcpCategory: string | null;
  pcpText: string | null;
  pcpValue: string | null;
  snoCategory: string | null;
  snoText: string | null;
  snoValue: string | null;
  maxPcpCategory: string | null;
  maxPcpText: string | null;
  maxSnoCategory: string | null;
  maxSnoText: string | null;
  sky: string | null;
}> {
  if (!dayData) {
    return {
      pty: null,
      pcpCategory: null,
      pcpText: null,
      pcpValue: null,
      snoCategory: null,
      snoText: null,
      snoValue: null,
      maxPcpCategory: null,
      maxPcpText: null,
      maxSnoCategory: null,
      maxSnoText: null,
      sky: null,
    };
  }

  // 강수 관련 데이터 로깅 (디버깅용)
  console.log('강수 데이터 처리:', {
    pty: dayData.pty,
    pcpCategory: dayData.pcpCategory,
    pcpText: dayData.pcpText,
    pcpValue: dayData.pcpValue,
    snoCategory: dayData.snoCategory,
    snoText: dayData.snoText,
    snoValue: dayData.snoValue,
    maxPcpCategory: dayData.maxPcpCategory,
    maxPcpText: dayData.maxPcpText,
    maxSnoCategory: dayData.maxSnoCategory,
    maxSnoText: dayData.maxSnoText,
    sky: dayData.sky,
  });

  return {
    pty: dayData.pty,
    pcpCategory: dayData.pcpCategory,
    pcpText: dayData.pcpText,
    pcpValue: dayData.pcpValue,
    snoCategory: dayData.snoCategory,
    snoText: dayData.snoText,
    snoValue: dayData.snoValue,
    maxPcpCategory: dayData.maxPcpCategory,
    maxPcpText: dayData.maxPcpText,
    maxSnoCategory: dayData.maxSnoCategory,
    maxSnoText: dayData.maxSnoText,
    sky: dayData.sky,
  };
}

export default useCampingPrecipitation; 
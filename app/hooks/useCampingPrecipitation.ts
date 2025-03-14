import { useQuery } from '@tanstack/react-query';
import { DailyWeatherData } from '../types/weather';
import { fetchUltraSrtNcst, fetchVilageFcst } from '../../api/weatherForecast';
import { useLocationStore } from '../stores/locationStore';

/**
 * 강수량 범주 값을 실제 수치로 변환하는 함수
 * @param category 강수량 범주 카테고리
 * @param value 원본 강수량 값
 * @returns 실제 수치로 변환된 강수량 값
 */
function convertPrecipitationToActualValue(category: string | null, value: string | null): string {
  if (!category || !value) return '0';
  
  // 값이 이미 숫자인 경우 (예: '1.1', '0.5' 등)
  if (!isNaN(parseFloat(value)) && value !== '0') {
    return value;
  }
  
  // 범주 값에 따른 변환
  if (value === '1mm 미만') {
    return '0.5';
  } else if (value.includes('~')) {
    // 범위값 (예: '1.0~29.9mm', '30.0~50.0mm')
    const range = value.replace('mm', '').split('~');
    const minValue = parseFloat(range[0]);
    const maxValue = parseFloat(range[1]);
    // 범위의 중간값 반환
    return ((minValue + maxValue) / 2).toFixed(1);
  } else if (value.includes('이상')) {
    // '50.0mm 이상'과 같은 경우
    const baseValue = parseFloat(value.replace('mm 이상', ''));
    return (baseValue + 5).toFixed(1); // 기준값보다 조금 더 큰 값 반환
  } else if (value === '강수없음' || value === '0') {
    return '0';
  }
  
  // 기존 카테고리 기반 변환 (fallback)
  switch (category) {
    case '1': // 1mm 미만
      return '0.5';
    case '2': // 1.0~29.9mm
      return '15.0';
    case '3': // 30.0~50.0mm
      return '40.0';
    case '4': // 50.0mm 이상
      return '55.0';
    default:
      return '0';
  }
}

/**
 * 적설량 범주 값을 실제 수치로 변환하는 함수
 * @param category 적설량 범주 카테고리
 * @param value 원본 적설량 값
 * @returns 실제 수치로 변환된 적설량 값
 */
function convertSnowToActualValue(category: string | null, value: string | null): string {
  if (!category || !value) return '0';
  
  // 값이 이미 숫자인 경우 (예: '1.1', '0.5' 등)
  if (!isNaN(parseFloat(value)) && value !== '0') {
    return value;
  }
  
  // 범주 값에 따른 변환
  if (value === '0.5cm 미만') {
    return '0.3';
  } else if (value.includes('~')) {
    // 범위값 (예: '0.5~4.9cm')
    const range = value.replace('cm', '').split('~');
    const minValue = parseFloat(range[0]);
    const maxValue = parseFloat(range[1]);
    // 범위의 중간값 반환
    return ((minValue + maxValue) / 2).toFixed(1);
  } else if (value.includes('이상')) {
    // '5.0cm 이상'과 같은 경우
    const baseValue = parseFloat(value.replace('cm 이상', ''));
    return (baseValue + 1).toFixed(1); // 기준값보다 조금 더 큰 값 반환
  } else if (value === '적설없음' || value === '0') {
    return '0';
  }
  
  // 기존 카테고리 기반 변환 (fallback)
  switch (category) {
    case '1': // 0.5cm 미만
      return '0.3';
    case '2': // 0.5~4.9cm
      return '2.5';
    case '3': // 5.0cm 이상
      return '6.0';
    default:
      return '0';
  }
}

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
  minPcpValue: string | null; // 최소 강수량
  maxPcpValue: string | null; // 최대 강수량
  pcpTimes: string[] | null; // 강수 시간대
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
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터 유지
    refetchInterval: 1000 * 60 * 5, // 5분마다 자동 갱신
  });

  // 단기예보 데이터를 가져오기 위한 쿼리 (오늘 또는 내일 데이터인 경우)
  const isNearFuture = isToday || 
    dayData?.date === new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString().slice(0, 10).replace(/-/g, '');
  
  const { data: vilageFcstData, isLoading: isVilageFcstLoading } = useQuery({
    queryKey: ['vilageFcst', nx, ny, dayData?.date],
    queryFn: async () => {
      // 현재 시간 기준으로 발표 시간 계산
      const today = new Date();
      const baseDate = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      // 발표 시간 계산 (0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300)
      const hour = today.getHours();
      let baseTime;
      
      if (hour < 2) baseTime = '2300';
      else if (hour < 5) baseTime = '0200';
      else if (hour < 8) baseTime = '0500';
      else if (hour < 11) baseTime = '0800';
      else if (hour < 14) baseTime = '1100';
      else if (hour < 17) baseTime = '1400';
      else if (hour < 20) baseTime = '1700';
      else if (hour < 23) baseTime = '2000';
      else baseTime = '2300';
      
      return fetchVilageFcst(nx, ny, baseDate, baseTime, dayData?.date);
    },
    enabled: !!dayData && isNearFuture, // 오늘 또는 내일 데이터인 경우에만 실행
    staleTime: 1000 * 60 * 15, // 15분 동안 데이터 유지
    refetchInterval: 1000 * 60 * 15, // 15분마다 자동 갱신
  });

  // 로딩 상태 통합
  const isLoading = isPrecipLoading || 
    (isToday && isRn1Loading) || 
    (isNearFuture && isVilageFcstLoading);

  // 강수량 데이터를 실제 수치로 변환
  const actualPcpValue = convertPrecipitationToActualValue(
    precipData?.pcpCategory ?? null,
    precipData?.pcpValue ?? null
  );
  
  // 적설량 데이터를 실제 수치로 변환
  const actualSnoValue = convertSnowToActualValue(
    precipData?.snoCategory ?? null,
    precipData?.snoValue ?? null
  );

  // 단기예보 데이터에서 강수량 정보 추출 (최대값, 최소값, 시간대)
  let vilageFcstPcpValue = null;
  let minPcpValue = null;
  let maxPcpValue = null;
  let pcpTimes: string[] = [];

  if (vilageFcstData && Array.isArray(vilageFcstData)) {
    // PCP 카테고리 데이터 찾기
    const pcpItems = vilageFcstData.filter(item => item.category === 'PCP');
    
    if (pcpItems.length > 0) {
      console.log('단기예보 PCP 항목:', pcpItems);
      
      // 강수량 값이 있는 항목만 필터링
      const validPcpItems = pcpItems.filter(item => {
        const value = item.fcstValue;
        return value && value !== '강수없음' && value !== '0';
      });
      
      console.log('유효한 PCP 항목:', validPcpItems);
      
      if (validPcpItems.length > 0) {
        // 강수량 값 추출 및 변환
        const pcpValues = validPcpItems.map(item => {
          const value = item.fcstValue;
          let pcpValue = 0;
          
          if (value === '1mm 미만') {
            pcpValue = 0.9;
          } else if (value.includes('~')) {
            const range = value.replace('mm', '').split('~');
            pcpValue = parseFloat(range[0]);
          } else if (value.includes('이상')) {
            pcpValue = 50.0;
          } else {
            pcpValue = parseFloat(value.replace('mm', ''));
          }
          
          return {
            value: pcpValue,
            time: item.fcstTime
          };
        });
        
        console.log('변환된 PCP 값:', pcpValues);
        
        // 최대값과 최소값 찾기
        if (pcpValues.length > 0) {
          // 값이 0보다 큰 항목만 필터링
          const nonZeroPcpValues = pcpValues.filter(item => item.value > 0);
          
          if (nonZeroPcpValues.length > 0) {
            // 최대값 찾기
            const maxItem = nonZeroPcpValues.reduce((max, item) => 
              item.value > max.value ? item : max, nonZeroPcpValues[0]);
            maxPcpValue = maxItem.value.toFixed(1);
            
            // 최소값 찾기
            const minItem = nonZeroPcpValues.reduce((min, item) => 
              item.value < min.value ? item : min, nonZeroPcpValues[0]);
            minPcpValue = minItem.value.toFixed(1);
            
            // 강수 시간대 추출 (시간 형식 변환: '0900' -> '09시')
            pcpTimes = nonZeroPcpValues.map(item => {
              const hour = item.time.substring(0, 2);
              return `${hour}시`;
            });
            
            // 대표 강수량 값으로 최대값 사용
            vilageFcstPcpValue = maxPcpValue;
            
            console.log(`강수량 정보: 최소=${minPcpValue}mm, 최대=${maxPcpValue}mm, 시간대=${pcpTimes.join(', ')}`);
          }
        }
      }
    }
  }

  // 실황 데이터 처리 (RN1)
  let realTimeRn1Value = null;
  if (isToday && rn1Data) {
    // 실황값이 문자열 '0'이 아니고, 숫자로 변환했을 때 0보다 큰 경우에만 사용
    const rn1NumValue = parseFloat(rn1Data);
    if (rn1Data !== '0' && !isNaN(rn1NumValue) && rn1NumValue > 0) {
      realTimeRn1Value = rn1Data;
      console.log(`실황 강수량(RN1): ${realTimeRn1Value}mm`);
    } else {
      console.log(`실황 강수량(RN1)이 0이거나 유효하지 않음: ${rn1Data}`);
    }
  }

  // 최종 강수량 값 결정 (우선순위: 초단기실황 > 단기예보 > 기존 데이터)
  let finalPcpValue = actualPcpValue;
  
  if (realTimeRn1Value) {
    // 실황 데이터가 있는 경우 (0보다 큰 값)
    finalPcpValue = realTimeRn1Value;
    console.log(`최종 강수량: ${finalPcpValue}mm (실황 데이터 사용)`);
  } else if (vilageFcstPcpValue) {
    // 단기예보 데이터가 있는 경우 (0보다 큰 값)
    finalPcpValue = vilageFcstPcpValue;
    console.log(`최종 강수량: ${finalPcpValue}mm (단기예보 데이터 사용)`);
  } else {
    // 기존 데이터 사용
    console.log(`최종 강수량: ${finalPcpValue}mm (기존 데이터 사용)`);
  }

  // 강수 형태가 있지만 강수량이 없는 경우, 최소값 설정
  if (precipData?.pty && precipData.pty !== '0' && 
      (finalPcpValue === '0' || finalPcpValue === null || finalPcpValue === undefined)) {
    finalPcpValue = '0.5'; // 최소 강수량 설정
    console.log(`강수 형태가 있지만 강수량이 없어 최소값 설정: ${finalPcpValue}mm`);
  }
  
  // 최종 적설량 값 결정
  let finalSnoValue = actualSnoValue;
  
  // 강수 형태가 눈인 경우 적설량이 0이더라도 최소값 설정
  if ((precipData?.pty === '3' || precipData?.pty === '7') && 
      (finalSnoValue === '0' || finalSnoValue === null || finalSnoValue === undefined)) {
    finalSnoValue = '0.3'; // 최소 적설량 설정 (0.5cm 미만)
    console.log(`강수 형태가 눈이지만 적설량이 없어 최소값 설정: ${finalSnoValue}cm`);
  } else if ((precipData?.pty === '2' || precipData?.pty === '6') && 
      (finalSnoValue === '0' || finalSnoValue === null || finalSnoValue === undefined)) {
    finalSnoValue = '0.1'; // 비/눈 혼합인 경우 더 작은 최소값 설정
    console.log(`강수 형태가 비/눈이지만 적설량이 없어 최소값 설정: ${finalSnoValue}cm`);
  }

  return {
    pty: precipData?.pty ?? null,
    pcpCategory: precipData?.pcpCategory ?? null,
    pcpText: precipData?.pcpText ?? null,
    pcpValue: finalPcpValue, // 최종 결정된 강수량 값 사용
    snoCategory: precipData?.snoCategory ?? null,
    snoText: precipData?.snoText ?? null,
    snoValue: finalSnoValue, // 최종 결정된 적설량 값 사용
    maxPcpCategory: precipData?.maxPcpCategory ?? null,
    maxPcpText: precipData?.maxPcpText ?? null,
    maxSnoCategory: precipData?.maxSnoCategory ?? null,
    maxSnoText: precipData?.maxSnoText ?? null,
    sky: precipData?.sky ?? null,
    rn1Value: realTimeRn1Value, // 실제 관측된 RN1 값 (0보다 큰 경우에만)
    minPcpValue: minPcpValue, // 최소 강수량
    maxPcpValue: maxPcpValue, // 최대 강수량
    pcpTimes: pcpTimes.length > 0 ? pcpTimes : null, // 강수 시간대
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
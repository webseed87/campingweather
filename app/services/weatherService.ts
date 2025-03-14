import axios from 'axios';
import { ProcessedWeatherData } from '../types/weather';

// 기상청 API 인증키
const serviceKey = process.env.EXPO_PUBLIC_API_KEY || '';
const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

// 날짜 포맷팅 함수 (YYYYMMDD)
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// 시간 포맷팅 함수 (HHMM)
export const formatTime = (date: Date): string => {
  // 발표시간은 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
  // 단기예보는 02, 05, 08, 11, 14, 17, 20, 23시에 발표됨
  const hours = date.getHours();
  
  // 가장 최근 발표 시간을 사용
  if (hours < 2) {
    return '2300';
  } else if (hours < 5) {
    return '0200';
  } else if (hours < 8) {
    return '0500';
  } else if (hours < 11) {
    return '0800';
  } else if (hours < 14) {
    return '1100';
  } else if (hours < 17) {
    return '1400';
  } else if (hours < 20) {
    return '1700';
  } else if (hours < 23) {
    return '2000';
  } else {
    return '2300';
  }
};

// 날씨 코드 정보
export const weatherCodes = {
  // 하늘상태
  SKY: {
    '1': '맑음',
    '3': '구름많음',
    '4': '흐림'
  },
  // 강수형태
  PTY: {
    '0': '없음',
    '1': '비',
    '2': '비/눈',
    '3': '눈',
    '4': '소나기'
  },
  // 강수량 범주
  PCP: {
    '0': '강수없음',
    '1': '1mm 미만',
    '2': '1.0~29.9mm',
    '3': '30.0~50.0mm',
    '4': '50.0mm 이상'
  },
  // 적설량 범주
  SNO: {
    '0': '적설없음',
    '1': '0.5cm 미만',
    '2': '0.5~4.9cm',
    '3': '5.0cm 이상'
  },
  // 기타 코드들
  categories: {
    POP: '강수확률',
    PTY: '강수형태',
    PCP: '1시간 강수량',
    RN1: '1시간 강수량',
    REH: '습도',
    SNO: '1시간 신적설',
    SKY: '하늘상태',
    TMP: '1시간 기온',
    TMN: '일 최저기온',
    TMX: '일 최고기온',
    UUU: '풍속(동서성분)',
    VVV: '풍속(남북성분)',
    WAV: '파고',
    VEC: '풍향',
    WSD: '풍속'
  }
};

/**
 * 단기예보 발표일자와 발표시각 계산 함수
 * @returns 발표일자와 발표시각
 */
export const getBaseDateTime = () => {
  // 현재 시간 기준으로 발표 시간 계산
  const today = new Date();
  const date = formatDate(today);
  
  // 발표 시간 계산 (0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300)
  const hour = today.getHours();
  const minute = today.getMinutes();
  
  // 가장 최신 발표 시간 선택
  let time;
  
  if (hour < 2 || (hour === 2 && minute < 10)) {
    // 0시~2시 10분: 전날 23시 발표 데이터
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return {
      date: formatDate(yesterday),
      time: '2300'
    };
  } else if (hour < 5 || (hour === 5 && minute < 10)) {
    time = '0200';
  } else if (hour < 8 || (hour === 8 && minute < 10)) {
    time = '0500';
  } else if (hour < 11 || (hour === 11 && minute < 10)) {
    time = '0800';
  } else if (hour < 14 || (hour === 14 && minute < 10)) {
    time = '1100';
  } else if (hour < 17 || (hour === 17 && minute < 10)) {
    time = '1400';
  } else if (hour < 20 || (hour === 20 && minute < 10)) {
    time = '1700';
  } else if (hour < 23 || (hour === 23 && minute < 10)) {
    time = '2000';
  } else {
    time = '2300';
  }
  
  return { date, time };
};

/**
 * 단기예보 조회 함수
 * @param nx 예보지점 X 좌표
 * @param ny 예보지점 Y 좌표
 * @param baseDate 발표일자
 * @param baseTime 발표시각
 * @returns 단기예보 데이터
 */
export const fetchWeatherForecast = async (
  nx: string,
  ny: string,
  baseDate?: string,
  baseTime?: string
) => {
  try {
    // 현재 시간 기준으로 발표일자와 발표시각 계산
    const { date, time } = getBaseDateTime();
    const finalBaseDate = baseDate || date;
    const finalBaseTime = baseTime || time;

    console.log(`단기예보 API 호출 정보: 발표일자=${finalBaseDate}, 발표시각=${finalBaseTime}, 좌표=(${nx}, ${ny})`);
    
    // API 호출 URL 구성
    const url = `${BASE_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${finalBaseDate}&base_time=${finalBaseTime}&nx=${nx}&ny=${ny}`;
    console.log('단기예보 API 호출 URL:', url);
    
    // 최대 3번 재시도
    let retryCount = 0;
    const maxRetries = 3;
    let lastError;
    
    while (retryCount < maxRetries) {
      try {
        // API 호출
        const response = await axios.get(url, {
          timeout: 30000, // 30초 타임아웃 설정 (증가)
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        console.log('단기예보 API 응답 상태:', response.status);
        
        // 응답 데이터 확인
        if (response.data && response.data.response) {
          const header = response.data.response.header;
          console.log('단기예보 API 응답 코드:', header.resultCode, '메시지:', header.resultMsg);
          
          if (header.resultCode === '00') {
            const items = response.data.response.body.items.item;
            
            if (!items || items.length === 0) {
              console.error('단기예보 API 응답에 데이터가 없습니다.');
              throw new Error('단기예보 데이터가 없습니다.');
            }
            
            return items;
          } else {
            console.error(`단기예보 API 오류: ${header.resultCode} - ${header.resultMsg}`);
            throw new Error(`단기예보 API 오류: ${header.resultMsg}`);
          }
        } else {
          console.error('단기예보 API 응답 형식이 올바르지 않습니다.');
          console.error('응답 데이터:', JSON.stringify(response.data, null, 2));
          throw new Error('단기예보 API 응답 형식이 올바르지 않습니다.');
        }
      } catch (error: any) {
        lastError = error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`단기예보 API 호출 실패 (${retryCount}/${maxRetries}), 재시도 중...`);
          // 지수 백오프 (1초, 2초, 4초...)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        }
      }
    }
    
    // 모든 재시도 실패
    console.error('단기예보 API 호출 오류 (최대 재시도 횟수 초과):', lastError?.message);
    if (lastError?.response) {
      console.error('응답 데이터:', lastError.response.data);
      console.error('응답 상태:', lastError.response.status);
    }
    
    // 기본 데이터 반환 (앱 크래시 방지)
    return [];
  } catch (error: any) {
    console.error('단기예보 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    
    // 기본 데이터 반환 (앱 크래시 방지)
    return [];
  }
};

/**
 * 날씨 데이터 처리 함수
 * @param data 원본 날씨 데이터
 * @param midTermData 중기예보 데이터 (선택적)
 * @returns 처리된 날씨 데이터
 */
export const processWeatherData = (data: any[], midTermData?: any): ProcessedWeatherData[] => {
  // 데이터가 없으면 빈 배열 반환
  if (!data || data.length === 0) {
    return [];
  }
  
  console.log(`총 ${data.length}개의 날씨 데이터를 처리합니다.`);
  
  // 발표 시간 확인 (17시 이후 발표인지)
  const baseTime = data[0]?.baseTime || '';
  const isAfternoonForecast = ['1700', '2000', '2300'].includes(baseTime);
  console.log(`발표 시간: ${baseTime}, 4일 후 예보 포함: ${isAfternoonForecast}`);
  
  // 오늘 날짜 확인
  const today = new Date();
  const todayStr = formatDate(today);
  
  // +4일 날짜 계산
  const day4Date = new Date(today);
  day4Date.setDate(today.getDate() + 4);
  const day4DateStr = formatDate(day4Date);
  
  // 날짜별 데이터 확인
  const uniqueDates = [...new Set(data.map(item => item.fcstDate))];
  console.log(`${uniqueDates.length}개의 날짜에 대한 데이터를 처리합니다:`, uniqueDates.join(', '));
  
  // +4일 데이터가 있는지 확인
  const has4DayData = uniqueDates.includes(day4DateStr);
  console.log(`+4일(${day4DateStr}) 데이터 포함 여부: ${has4DayData}`);
  
  // 먼저 날짜별로 데이터 그룹화
  const dailyData: { [key: string]: any } = {};
  
  // 날짜별 데이터 초기화
  uniqueDates.forEach(date => {
    dailyData[date] = {
      date,
      hourly: [],
      // 일 최고/최저 기온 초기화
      maxTemp: null,
      minTemp: null,
      // TMN/TMX 값 (참고용)
      tmnValue: null,
      tmxValue: null,
      // 강수확률 최대값
      maxPop: 0,
      // RN1 데이터 처리 여부
      hasRN1Data: false,
      // 강수량 최대값 (원본 값)
      maxPcpValue: 0,
      // 강수량 카테고리
      maxPcpCategory: '0',
      // 강수량 표시 문자열
      maxPcpText: '강수없음',
      // 강수량 카테고리 (일별 데이터용)
      pcpCategory: '0',
      // 강수량 표시 문자열 (일별 데이터용)
      pcpText: '강수없음',
      // 적설량 최대값 (원본 값)
      maxSnoValue: 0,
      // 적설량 카테고리
      maxSnoCategory: '0',
      // 적설량 표시 문자열
      maxSnoText: '적설없음',
      // 적설량 카테고리 (일별 데이터용)
      snoCategory: '0',
      // 적설량 표시 문자열 (일별 데이터용)
      snoText: '적설없음',
      // 대표 하늘상태 (가장 많이 나타나는 상태)
      skyCounts: { '1': 0, '3': 0, '4': 0 },
      // 대표 강수형태 (가장 많이 나타나는 형태)
      ptyCounts: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 },
      // 평균 풍속 계산을 위한 변수
      wsdSum: 0,
      wsdCount: 0,
      wsd: null, // 평균 풍속
      // 중기예보 데이터 여부
      isMidTermData: false,
    };
  });
  
  // TMN(최저기온)과 TMX(최고기온) 데이터 먼저 처리 (참고용으로만 저장)
  const tmnData = data.filter(item => item.category === 'TMN');
  const tmxData = data.filter(item => item.category === 'TMX');
  
  console.log(`TMN(최저기온) 데이터 개수: ${tmnData.length}`);
  console.log(`TMX(최고기온) 데이터 개수: ${tmxData.length}`);
  
  // TMN(최저기온) 처리 (참고용으로만 저장)
  tmnData.forEach(item => {
    const date = item.fcstDate;
    const value = parseFloat(item.fcstValue);
    
    if (dailyData[date] && !isNaN(value)) {
      dailyData[date].tmnValue = value;
      console.log(`${date} TMN 값 저장: ${value}°C (참고용)`);
      
      // TMN 값을 최저기온으로 사용 (TMP로 계산된 값이 없거나 TMN 값이 더 낮은 경우)
      if (dailyData[date].minTemp === null || value < dailyData[date].minTemp) {
        dailyData[date].minTemp = value;
        console.log(`${date} 최저기온 업데이트: ${value}°C (TMN)`);
      }
    }
  });
  
  // TMX(최고기온) 처리 (참고용으로만 저장)
  tmxData.forEach(item => {
    const date = item.fcstDate;
    const value = parseFloat(item.fcstValue);
    
    if (dailyData[date] && !isNaN(value)) {
      dailyData[date].tmxValue = value;
      console.log(`${date} TMX 값 저장: ${value}°C (참고용)`);
      
      // TMX 값을 최고기온으로 사용 (TMP로 계산된 값이 없거나 TMX 값이 더 높은 경우)
      if (dailyData[date].maxTemp === null || value > dailyData[date].maxTemp) {
        dailyData[date].maxTemp = value;
        console.log(`${date} 최고기온 업데이트: ${value}°C (TMX)`);
      }
    }
  });
  
  // 오늘 데이터가 있는지 확인
  if (dailyData[todayStr]) {
    console.log(`오늘(${todayStr}) 데이터가 있습니다.`);
  } else {
    console.warn(`오늘(${todayStr}) 데이터가 없습니다.`);
  }
  
  // 나머지 데이터 처리
  data.forEach(item => {
    const date = item.fcstDate;
    const time = item.fcstTime;
    const category = item.category;
    const value = item.fcstValue;
    
    // 이미 처리한 TMN, TMX는 건너뜀
    if (category === 'TMN' || category === 'TMX') {
      return;
    }
    
    if (!dailyData[date]) {
      console.warn(`날짜 ${date}에 대한 데이터가 초기화되지 않았습니다.`);
      return;
    }
    
    // 시간별 데이터 구성
    let hourlyData = dailyData[date].hourly.find((h: any) => h.time === time);
    
    if (!hourlyData) {
      hourlyData = { date, time };
      dailyData[date].hourly.push(hourlyData);
    }
    
    // 카테고리별 데이터 처리
    switch (category) {
      case 'TMP': // 1시간 기온
        const temp = parseFloat(value);
        if (!isNaN(temp)) {
          hourlyData.temp = temp;
          
          // TMP 데이터로 최고/최저 온도 계산
          // 최고기온이 없거나 현재 기온이 더 높은 경우
          if (dailyData[date].maxTemp === null || temp > dailyData[date].maxTemp) {
            dailyData[date].maxTemp = temp;
            console.log(`${date} 최고기온 업데이트: ${temp}°C (TMP)`);
          }
          
          // 최저기온이 없거나 현재 기온이 더 낮은 경우
          if (dailyData[date].minTemp === null || temp < dailyData[date].minTemp) {
            dailyData[date].minTemp = temp;
            console.log(`${date} 최저기온 업데이트: ${temp}°C (TMP)`);
          }
        }
        break;
      
      case 'POP': // 강수확률
        const pop = parseInt(value);
        if (!isNaN(pop)) {
          hourlyData.pop = pop;
          
          // 최대 강수확률 업데이트
          if (pop > dailyData[date].maxPop) {
            dailyData[date].maxPop = pop;
          }
        }
        break;
      
      case 'PTY': // 강수형태
        hourlyData.pty = value;
        // 강수형태 카운트 업데이트
        if (dailyData[date].ptyCounts[value] !== undefined) {
          dailyData[date].ptyCounts[value]++;
        }
        break;
      
      case 'SKY': // 하늘상태
        hourlyData.sky = value;
        // 하늘상태 카운트 업데이트
        if (dailyData[date].skyCounts[value] !== undefined) {
          dailyData[date].skyCounts[value]++;
        }
        break;
      
      case 'WSD': // 풍속
        const wsd = parseFloat(value);
        if (!isNaN(wsd)) {
          hourlyData.wsd = wsd;
          
          // 평균 풍속 계산을 위한 데이터 수집
          dailyData[date].wsdSum += wsd;
          dailyData[date].wsdCount++;
        }
        break;
      
      case 'REH': // 습도
        const reh = parseInt(value);
        if (!isNaN(reh)) {
          hourlyData.reh = reh;
        }
        break;
      
      // 기타 카테고리는 그대로 저장
      default:
        hourlyData[category.toLowerCase()] = value;
        break;
    }
  });
  
  // 각 날짜별로 최고/최저 온도 데이터 확인 및 로그 출력
  Object.entries(dailyData).forEach(([date, day]: [string, any]) => {
    console.log(`${date} 온도 정보:`);
    console.log(`- TMP 기반 최저기온: ${day.minTemp !== null ? day.minTemp + '°C' : '정보 없음'}`);
    console.log(`- TMP 기반 최고기온: ${day.maxTemp !== null ? day.maxTemp + '°C' : '정보 없음'}`);
    console.log(`- TMN 값(참고): ${day.tmnValue !== null ? day.tmnValue + '°C' : '정보 없음'}`);
    console.log(`- TMX 값(참고): ${day.tmxValue !== null ? day.tmxValue + '°C' : '정보 없음'}`);
    
    // 평균 풍속 계산
    if (day.wsdCount > 0) {
      day.wsd = day.wsdSum / day.wsdCount;
    }
  });
  
  console.log(`${Object.keys(dailyData).length}개의 일별 데이터로 그룹화되었습니다.`);
  
  // 대표 하늘상태와 강수형태 결정
  Object.values(dailyData).forEach((day: any) => {
    // 대표 하늘상태 결정 (가장 많이 나타나는 상태)
    let maxSkyCount = 0;
    let representativeSky = '1'; // 기본값: 맑음
    
    Object.entries(day.skyCounts).forEach(([sky, count]: [string, any]) => {
      if (count > maxSkyCount) {
        maxSkyCount = count;
        representativeSky = sky;
      }
    });
    
    day.sky = representativeSky;
    
    // 대표 강수형태 결정 (비/눈이 있으면 우선, 없으면 '없음')
    let hasPrecipitation = false;
    
    for (const [pty, count] of Object.entries(day.ptyCounts)) {
      if (pty !== '0' && (count as number) > 0) {
        day.pty = pty;
        hasPrecipitation = true;
        break;
      }
    }
    
    if (!hasPrecipitation) {
      day.pty = '0';
    }
    
    // 평균 풍속 계산
    if (day.wsdCount > 0) {
      day.wsd = Math.round((day.wsdSum / day.wsdCount) * 10) / 10;
      console.log(`${day.date} 평균 풍속: ${day.wsd}m/s (${day.wsdCount}개 데이터)`);
    }
    
    // 강수량 카테고리와 텍스트 설정
    day.pcpCategory = day.maxPcpCategory;
    day.pcpText = day.maxPcpText;
    
    // 적설량 카테고리와 텍스트 설정
    day.snoCategory = day.maxSnoCategory;
    day.snoText = day.maxSnoText;
    
    // 필요없는 카운트 데이터 삭제
    delete day.skyCounts;
    delete day.ptyCounts;
    delete day.wsdSum;
    delete day.wsdCount;
    
    // 최저/최고 기온 로그 출력
    console.log(`${day.date} 최종 기온 - 최저: ${day.minTemp !== null ? day.minTemp + '°C' : '정보 없음'}, 최고: ${day.maxTemp !== null ? day.maxTemp + '°C' : '정보 없음'}`);
  });
  
  // 날짜순으로 정렬
  const sortedData = Object.values(dailyData).sort((a: any, b: any) => {
    return a.date.localeCompare(b.date);
  });
  
  console.log('날씨 데이터 처리 완료');
  
  // 결과 배열 생성
  const result: ProcessedWeatherData[] = [];
  
  // 날짜별 데이터를 결과 배열에 추가
  Object.values(dailyData).forEach((day: any) => {
    // 기본 데이터 구성
    const processedDay: ProcessedWeatherData = {
      date: day.date,
      time: day.hourly.length > 0 ? day.hourly[0].time : '0000',
      temp: day.hourly.length > 0 ? day.hourly[0].temp : null,
      minTemp: day.minTemp,
      maxTemp: day.maxTemp,
      sky: day.sky || null,
      pty: day.pty || '0',
      pop: day.maxPop,
      reh: day.hourly.length > 0 ? day.hourly[0].reh : null,
      wsd: day.wsd,
      pcpCategory: day.pcpCategory || '0',
      pcpText: day.pcpText || '강수없음',
      pcpValue: day.maxPcpValue ? day.maxPcpValue.toString() : null,
      snoCategory: day.snoCategory || '0',
      snoText: day.snoText || '적설없음',
      snoValue: day.maxSnoValue ? day.maxSnoValue.toString() : null,
      maxPcpValue: day.maxPcpValue ? day.maxPcpValue.toString() : null,
      maxSnoValue: day.maxSnoValue ? day.maxSnoValue.toString() : null,
      isMidTermData: day.isMidTermData || false,
    };
    
    result.push(processedDay);
  });
  
  // 중기예보 데이터가 있는 경우 처리
  if (midTermData && midTermData.forecast) {
    console.log('중기예보 데이터를 처리합니다.');
    
    // 중기예보 데이터 처리
    midTermData.forecast.forEach((forecastDay: any) => {
      if (!forecastDay) return; // null 체크
      
      // 날짜 계산 (오늘 + day)
      const forecastDate = new Date(today);
      forecastDate.setDate(forecastDate.getDate() + forecastDay.day);
      
      // YYYYMMDD 형식으로 변환
      const dateStr = formatDate(forecastDate);
      
      // +4일 데이터인 경우 특별 처리
      const is4DayData = dateStr === day4DateStr;
      
      // 이미 단기예보 데이터가 있는 경우 스킵 (단, +4일 데이터는 예외)
      if (dailyData[dateStr] && !dailyData[dateStr].isMidTermData) {
        // +4일 데이터이고 최저/최고 기온이 없는 경우 중기예보 데이터로 보완
        if (is4DayData || dailyData[dateStr].minTemp === null || dailyData[dateStr].maxTemp === null) {
          if (forecastDay.temperature && (forecastDay.temperature.min !== undefined || forecastDay.temperature.max !== undefined)) {
            console.log(`${dateStr}에 대한 단기예보 데이터의 기온 정보가 없거나 +4일 데이터입니다. 중기예보 데이터로 보완합니다.`);
            
            // 최저/최고 기온 보완
            if (dailyData[dateStr].minTemp === null && forecastDay.temperature.min !== undefined) {
              dailyData[dateStr].minTemp = forecastDay.temperature.min;
              console.log(`${dateStr} 최저기온 업데이트: ${forecastDay.temperature.min}°C (중기예보)`);
            }
            if (dailyData[dateStr].maxTemp === null && forecastDay.temperature.max !== undefined) {
              dailyData[dateStr].maxTemp = forecastDay.temperature.max;
              console.log(`${dateStr} 최고기온 업데이트: ${forecastDay.temperature.max}°C (중기예보)`);
            }
          }
        } else {
          console.log(`${dateStr}에 대한 단기예보 데이터가 이미 있습니다. 중기예보 데이터를 사용하지 않습니다.`);
          return;
        }
      }
      
      // 중기예보 데이터 생성 또는 업데이트
      if (!dailyData[dateStr]) {
        console.log(`${dateStr}에 대한 단기예보 데이터가 없습니다. 중기예보 데이터를 사용합니다.`);
        dailyData[dateStr] = {
          date: dateStr,
          hourly: [],
          isMidTermData: true,
        };
      }
      
      // 중기예보 데이터 설정
      const dayData = dailyData[dateStr];
      dayData.isMidTermData = true;
      
      // 기온 정보 설정
      if (forecastDay.temperature) {
        if (forecastDay.temperature.min !== undefined) {
          dayData.minTemp = forecastDay.temperature.min;
        }
        if (forecastDay.temperature.max !== undefined) {
          dayData.maxTemp = forecastDay.temperature.max;
        }
      }
      
      // 날씨 정보 설정 (오전/오후 구분이 있는 경우)
      if (forecastDay.am && forecastDay.pm) {
        // 강수확률은 오전/오후 중 높은 값 사용
        dayData.maxPop = Math.max(forecastDay.am.rainProb || 0, forecastDay.pm.rainProb || 0);
        
        // 하늘상태는 오후 기준으로 설정
        const weatherText = forecastDay.pm.weather || forecastDay.am.weather;
        
        // 하늘상태 매핑
        if (weatherText.includes('맑음')) {
          dayData.sky = '1'; // 맑음
        } else if (weatherText.includes('구름많음')) {
          dayData.sky = '3'; // 구름많음
        } else {
          dayData.sky = '4'; // 흐림
        }
        
        // 강수형태 매핑
        if (weatherText.includes('비') && weatherText.includes('눈')) {
          dayData.pty = '2'; // 비/눈
        } else if (weatherText.includes('비') || weatherText.includes('소나기')) {
          dayData.pty = '1'; // 비
        } else if (weatherText.includes('눈')) {
          dayData.pty = '3'; // 눈
        } else {
          dayData.pty = '0'; // 없음
        }
      } 
      // 날씨 정보 설정 (전체 날씨만 있는 경우)
      else if (forecastDay.weather) {
        // 강수확률
        dayData.maxPop = forecastDay.rainProb || 0;
        
        // 하늘상태 매핑
        const weatherText = forecastDay.weather;
        
        if (weatherText.includes('맑음')) {
          dayData.sky = '1'; // 맑음
        } else if (weatherText.includes('구름많음')) {
          dayData.sky = '3'; // 구름많음
        } else {
          dayData.sky = '4'; // 흐림
        }
        
        // 강수형태 매핑
        if (weatherText.includes('비') && weatherText.includes('눈')) {
          dayData.pty = '2'; // 비/눈
        } else if (weatherText.includes('비') || weatherText.includes('소나기')) {
          dayData.pty = '1'; // 비
        } else if (weatherText.includes('눈')) {
          dayData.pty = '3'; // 눈
        } else {
          dayData.pty = '0'; // 없음
        }
      }
      
      console.log(`중기예보 데이터 추가: ${dateStr}, 최저: ${dayData.minTemp}°C, 최고: ${dayData.maxTemp}°C, 강수확률: ${dayData.maxPop}%`);
    });
    
    // 중기예보 데이터가 추가된 후 결과 배열 재생성
    result.length = 0; // 기존 결과 초기화
    
    // 날짜별 데이터를 결과 배열에 추가 (날짜순 정렬)
    const sortedDates = Object.keys(dailyData).sort();
    sortedDates.forEach(date => {
      const day = dailyData[date];
      
      // 기본 데이터 구성
      const processedDay: ProcessedWeatherData = {
        date: day.date,
        time: day.hourly.length > 0 ? day.hourly[0].time : '0000',
        temp: day.hourly.length > 0 ? day.hourly[0].temp : null,
        minTemp: day.minTemp,
        maxTemp: day.maxTemp,
        sky: day.sky || null,
        pty: day.pty || '0',
        pop: day.maxPop,
        reh: day.hourly.length > 0 ? day.hourly[0].reh : null,
        wsd: day.wsd,
        pcpCategory: day.pcpCategory || '0',
        pcpText: day.pcpText || '강수없음',
        pcpValue: day.maxPcpValue ? day.maxPcpValue.toString() : null,
        snoCategory: day.snoCategory || '0',
        snoText: day.snoText || '적설없음',
        snoValue: day.maxSnoValue ? day.maxSnoValue.toString() : null,
        maxPcpValue: day.maxPcpValue ? day.maxPcpValue.toString() : null,
        maxSnoValue: day.maxSnoValue ? day.maxSnoValue.toString() : null,
        isMidTermData: day.isMidTermData || false,
      };
      
      result.push(processedDay);
    });
  }
  
  console.log(`총 ${result.length}개의 처리된 날씨 데이터를 반환합니다.`);
  return result;
};

// 강수형태 설명 반환 함수
function getPtyDescription(ptyValue: string): string {
  switch(ptyValue) {
    case '1': return '비';
    case '2': return '비/눈';
    case '3': return '눈';
    case '4': return '소나기';
    case '5': return '빗방울'; // 초단기예보 전용
    case '6': return '빗방울눈날림'; // 초단기예보 전용
    case '7': return '눈날림'; // 초단기예보 전용
    default: return '없음';
  }
}

// 기본 내보내기 추가 (경고 해결용)
export default {
  fetchWeatherForecast,
  processWeatherData,
  formatDate,
  formatTime,
  weatherCodes
}; 
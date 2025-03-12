import axios from 'axios';
import { API_KEY } from '@env';

// 기상청 API 인증키
const serviceKey = API_KEY;
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

// 기상청 API 호출 함수
export const fetchWeatherForecast = async (nx: number, ny: number) => {
  try {
    // 현재 시간 기준으로 발표 시간 계산
    const today = new Date();
    
    // 기본 날짜와 시간 설정
    let baseDate = formatDate(today);
    
    // 발표 시간 계산 (0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300)
    const hour = today.getHours();
    const minute = today.getMinutes();
    
    // 가장 최신 발표 시간 선택
    let baseTime;
    if (hour < 2 || (hour === 2 && minute < 10)) {
      // 0시~2시 10분: 전날 23시 발표 데이터
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      baseDate = formatDate(yesterday);
      baseTime = '2300';
    } else if (hour < 5 || (hour === 5 && minute < 10)) {
      baseTime = '0200';
    } else if (hour < 8 || (hour === 8 && minute < 10)) {
      baseTime = '0500';
    } else if (hour < 11 || (hour === 11 && minute < 10)) {
      baseTime = '0800';
    } else if (hour < 14 || (hour === 14 && minute < 10)) {
      baseTime = '1100';
    } else if (hour < 17 || (hour === 17 && minute < 10)) {
      baseTime = '1400';
    } else if (hour < 20 || (hour === 20 && minute < 10)) {
      baseTime = '1700';
    } else if (hour < 23 || (hour === 23 && minute < 10)) {
      baseTime = '2000';
    } else {
      baseTime = '2300';
    }
    
    console.log(`API 호출 정보: 날짜=${baseDate}, 시간=${baseTime}, nx=${nx}, ny=${ny}`);
    
    // API 호출 URL 직접 구성 (인코딩 문제 해결)
    const url = `${BASE_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
    console.log('API 호출 URL:', url);
    
    // API 호출
    const response = await axios.get(url, {
      timeout: 15000 // 15초 타임아웃 설정
    });
    
    console.log('API 응답 상태:', response.status);
    
    // 응답 데이터 확인
    if (response.data && response.data.response) {
      const header = response.data.response.header;
      console.log('API 응답 코드:', header.resultCode, '메시지:', header.resultMsg);
      
      if (header.resultCode === '00') {
        const items = response.data.response.body.items.item;
        console.log(`API 응답 데이터 개수: ${items.length}개`);
        
        if (!items || items.length === 0) {
          console.error('API 응답에 데이터가 없습니다.');
          
          // 다른 발표 시간으로 재시도
          if (baseTime === '0200') {
            console.log('0200 발표 데이터가 없어 0500 데이터로 재시도합니다.');
            baseTime = '0500';
            const retryUrl = `${BASE_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=0500&nx=${nx}&ny=${ny}`;
            const retryResponse = await axios.get(retryUrl, {
              timeout: 15000
            });
            
            if (retryResponse.data && retryResponse.data.response && 
                retryResponse.data.response.header.resultCode === '00' &&
                retryResponse.data.response.body.items.item.length > 0) {
              return retryResponse.data.response.body.items.item;
            }
          }
          
          throw new Error('날씨 데이터가 없습니다.');
        }
        
        // 날짜별 데이터 확인
        const dates = [...new Set(items.map((item: any) => item.fcstDate))];
        console.log('예보 날짜:', dates);
        
        // 오늘 날짜 데이터가 있는지 확인
        const todayDateStr = formatDate(today);
        if (!dates.includes(todayDateStr)) {
          console.warn(`오늘(${todayDateStr}) 날씨 데이터가 없습니다.`);
        }
        
        // 데이터 카테고리 확인
        const categories = new Set();
        items.slice(0, 100).forEach((item: any) => {
          categories.add(item.category);
        });
        console.log('데이터 카테고리:', Array.from(categories).join(', '));
        
        // TMN/TMX 데이터 확인
        const tmnData = items.filter((item: any) => item.category === 'TMN');
        const tmxData = items.filter((item: any) => item.category === 'TMX');
        console.log(`TMN(최저기온) 데이터 개수: ${tmnData.length}`);
        console.log(`TMX(최고기온) 데이터 개수: ${tmxData.length}`);
        
        return items;
      } else {
        console.error(`API 오류: ${header.resultCode} - ${header.resultMsg}`);
        throw new Error(`API 오류: ${header.resultMsg}`);
      }
    } else {
      console.error('API 응답 형식이 올바르지 않습니다.');
      console.error('응답 데이터:', JSON.stringify(response.data, null, 2));
      throw new Error('API 응답 형식이 올바르지 않습니다.');
    }
  } catch (error: any) {
    console.error('날씨 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    throw error;
  }
};

// 날씨 데이터 가공 함수 - 하루 단위로 그룹화
export const processWeatherData = (data: any[]) => {
  // 데이터가 없는 경우 빈 배열 반환
  if (!data || data.length === 0) {
    console.warn('처리할 날씨 데이터가 없습니다.');
    return [];
  }
  
  console.log(`총 ${data.length}개의 날씨 데이터를 처리합니다.`);
  
  // 먼저 날짜별로 데이터 그룹화
  const dailyData: { [key: string]: any } = {};
  
  // 날짜별 데이터 초기화
  const uniqueDates = [...new Set(data.map(item => item.fcstDate))];
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
    };
  });
  
  console.log(`${uniqueDates.length}개의 날짜에 대한 데이터를 처리합니다:`, uniqueDates.join(', '));
  
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
    }
  });
  
  // TMX(최고기온) 처리 (참고용으로만 저장)
  tmxData.forEach(item => {
    const date = item.fcstDate;
    const value = parseFloat(item.fcstValue);
    
    if (dailyData[date] && !isNaN(value)) {
      dailyData[date].tmxValue = value;
      console.log(`${date} TMX 값 저장: ${value}°C (참고용)`);
    }
  });
  
  // 오늘 날짜 확인
  const today = new Date();
  const todayStr = formatDate(today);
  
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
  return sortedData;
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
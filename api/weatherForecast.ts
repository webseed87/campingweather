import axios from 'axios';
import { API_KEY } from '@env';

// 기상청 API 인증키
const serviceKey = API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const ULTRA_SRT_FCST_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst';
const ULTRA_SRT_NCST_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

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
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // 가장 최근 발표 시간을 사용
  if (hours < 2 || (hours === 2 && minutes < 10)) {
    // 0시~2시 10분: 전날 23시 발표 데이터
    return '2300';
  } else if (hours < 5 || (hours === 5 && minutes < 10)) {
    return '0200';
  } else if (hours < 8 || (hours === 8 && minutes < 10)) {
    return '0500';
  } else if (hours < 11 || (hours === 11 && minutes < 10)) {
    return '0800';
  } else if (hours < 14 || (hours === 14 && minutes < 10)) {
    return '1100';
  } else if (hours < 17 || (hours === 17 && minutes < 10)) {
    return '1400';
  } else if (hours < 20 || (hours === 20 && minutes < 10)) {
    return '1700';
  } else if (hours < 23 || (hours === 23 && minutes < 10)) {
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
    '4': '소나기',
    '5': '빗방울',
    '6': '빗방울눈날림',
    '7': '눈날림'
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

// 초단기실황 API 호출 함수 (RN1 데이터 가져오기 위함)
export const fetchUltraSrtNcst = async (nx: number, ny: number) => {
  try {
    // 현재 시간 기준으로 발표 시간 계산
    const today = new Date();
    
    // 기본 날짜 설정
    let baseDate = formatDate(today);
    
    // 초단기실황은 매시간 정시에 생성되고 10분마다 최신 정보로 업데이트
    const hour = today.getHours();
    const minute = today.getMinutes();
    
    // 가장 최신 발표 시간 선택 (현재 시간 기준 가장 최근 정시)
    let baseTime;
    
    // 현재 시간의 정시를 기준으로 함
    // 단, 현재 시간이 정시로부터 10분 이내라면 이전 시간의 자료를 사용
    if (minute < 10) {
      // 이전 시간의 자료 사용
      const prevHour = (hour - 1 + 24) % 24;
      baseTime = String(prevHour).padStart(2, '0') + '00';
      
      // 0시 이전이면 전날 데이터
      if (hour === 0) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        baseDate = formatDate(yesterday);
      }
    } else {
      // 현재 시간의 자료 사용
      baseTime = String(hour).padStart(2, '0') + '00';
    }
    
    console.log(`초단기실황 API 호출 정보: 날짜=${baseDate}, 시간=${baseTime}, nx=${nx}, ny=${ny}`);
    
    // API 호출 URL 직접 구성
    const url = `${ULTRA_SRT_NCST_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
    console.log('초단기실황 API 호출 URL:', url);
    
    // API 호출
    const response = await axios.get(url, {
      timeout: 15000 // 15초 타임아웃 설정
    });
    
    console.log('초단기실황 API 응답 상태:', response.status);
    
    // 응답 데이터 확인
    if (response.data && response.data.response) {
      const header = response.data.response.header;
      console.log('초단기실황 API 응답 코드:', header.resultCode, '메시지:', header.resultMsg);
      
      if (header.resultCode === '00') {
        const items = response.data.response.body.items.item;
        console.log(`초단기실황 API 응답 데이터 개수: ${items.length}개`);
        
        if (!items || items.length === 0) {
          console.error('초단기실황 API 응답에 데이터가 없습니다.');
          throw new Error('초단기실황 데이터가 없습니다.');
        }
        
        // RN1(1시간 강수량) 데이터 찾기
        const rn1Data = items.find((item: any) => item.category === 'RN1');
        
        if (rn1Data) {
          console.log('RN1 데이터:', rn1Data);
          return rn1Data.obsrValue; // 실제 관측값 반환
        } else {
          console.warn('RN1 데이터를 찾을 수 없습니다.');
          return '0'; // 기본값 반환
        }
      } else {
        console.error(`초단기실황 API 오류: ${header.resultCode} - ${header.resultMsg}`);
        throw new Error(`초단기실황 API 오류: ${header.resultMsg}`);
      }
    } else {
      console.error('초단기실황 API 응답 형식이 올바르지 않습니다.');
      console.error('응답 데이터:', JSON.stringify(response.data, null, 2));
      throw new Error('초단기실황 API 응답 형식이 올바르지 않습니다.');
    }
  } catch (error: any) {
    console.error('초단기실황 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    return '0'; // 오류 발생 시 기본값 반환
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
      // 강수확률
      pop: 0,
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
      dailyData[date].minTemp = value; // 최저기온 설정
      console.log(`${date} TMN 값 저장: ${value}°C`);
    }
  });
  
  // TMX(최고기온) 처리 (참고용으로만 저장)
  tmxData.forEach(item => {
    const date = item.fcstDate;
    const value = parseFloat(item.fcstValue);
    
    if (dailyData[date] && !isNaN(value)) {
      dailyData[date].tmxValue = value;
      dailyData[date].maxTemp = value; // 최고기온 설정
      console.log(`${date} TMX 값 저장: ${value}°C`);
    }
  });
  
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
          
          // TMP 데이터로 최고/최저 온도 계산 (TMN/TMX가 없는 경우 대비)
          // 최고기온이 없거나 현재 기온이 더 높은 경우
          if (dailyData[date].maxTemp === null || temp > dailyData[date].maxTemp) {
            dailyData[date].maxTemp = temp;
          }
          
          // 최저기온이 없거나 현재 기온이 더 낮은 경우
          if (dailyData[date].minTemp === null || temp < dailyData[date].minTemp) {
            dailyData[date].minTemp = temp;
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
            dailyData[date].pop = pop; // 일별 데이터에도 저장
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
      
      case 'PCP': // 1시간 강수량
        hourlyData.pcp = value;
        
        // 강수량 값 처리
        if (value !== '' && value !== '강수없음') {
          let pcpValue = 0;
          let pcpCategory = '0';
          
          if (value === '1mm 미만') {
            pcpValue = 0.9;
            pcpCategory = '1';
          } else if (value.includes('~')) {
            // 범위값 (예: 30.0~50.0mm)
            const range = value.replace('mm', '').split('~');
            pcpValue = parseFloat(range[0]);
            
            if (pcpValue >= 30.0 && pcpValue < 50.0) {
              pcpCategory = '3';
            } else {
              pcpCategory = '2'; // 기본값
            }
          } else if (value.includes('이상')) {
            // 50.0mm 이상
            pcpValue = 50.0;
            pcpCategory = '4';
          } else {
            // 숫자값 (예: 5.0mm)
            pcpValue = parseFloat(value.replace('mm', ''));
            
            if (pcpValue < 1.0) {
              pcpCategory = '1';
            } else if (pcpValue < 30.0) {
              pcpCategory = '2';
            } else if (pcpValue < 50.0) {
              pcpCategory = '3';
            } else {
              pcpCategory = '4';
            }
          }
          
          // 최대 강수량 업데이트
          if (pcpValue > dailyData[date].maxPcpValue) {
            dailyData[date].maxPcpValue = pcpValue;
            dailyData[date].maxPcpCategory = pcpCategory;
            dailyData[date].maxPcpText = value;
            
            // 일별 데이터에도 저장
            dailyData[date].pcpValue = String(pcpValue);
            dailyData[date].pcpCategory = pcpCategory;
            dailyData[date].pcpText = value;
          }
        }
        break;
      
      case 'SNO': // 1시간 신적설
        hourlyData.sno = value;
        
        // 적설량 값 처리
        if (value !== '' && value !== '적설없음') {
          let snoValue = 0;
          let snoCategory = '0';
          
          if (value === '0.5cm 미만') {
            snoValue = 0.4;
            snoCategory = '1';
          } else if (value.includes('~')) {
            // 범위값 (예: 0.5~4.9cm)
            const range = value.replace('cm', '').split('~');
            snoValue = parseFloat(range[0]);
            snoCategory = '2';
          } else if (value.includes('이상')) {
            // 5.0cm 이상
            snoValue = 5.0;
            snoCategory = '3';
          } else {
            // 숫자값 (예: 3.0cm)
            snoValue = parseFloat(value.replace('cm', ''));
            
            if (snoValue < 0.5) {
              snoCategory = '1';
            } else if (snoValue < 5.0) {
              snoCategory = '2';
            } else {
              snoCategory = '3';
            }
          }
          
          // 최대 적설량 업데이트
          if (snoValue > dailyData[date].maxSnoValue) {
            dailyData[date].maxSnoValue = snoValue;
            dailyData[date].maxSnoCategory = snoCategory;
            dailyData[date].maxSnoText = value;
            
            // 일별 데이터에도 저장
            dailyData[date].snoValue = String(snoValue);
            dailyData[date].snoCategory = snoCategory;
            dailyData[date].snoText = value;
          }
        }
        break;
      
      // 기타 카테고리는 그대로 저장
      default:
        hourlyData[category.toLowerCase()] = value;
        break;
    }
  });
  
  // 각 날짜별로 데이터 후처리
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
    }
    
    // 강수량 카테고리와 텍스트 설정
    day.pcpCategory = day.maxPcpCategory;
    day.pcpText = day.maxPcpText;
    
    // 적설량 카테고리와 텍스트 설정
    day.snoCategory = day.maxSnoCategory;
    day.snoText = day.maxSnoText;
    
    // 요일 추가
    const dateObj = new Date(
      parseInt(day.date.substring(0, 4)),
      parseInt(day.date.substring(4, 6)) - 1,
      parseInt(day.date.substring(6, 8))
    );
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    day.dayOfWeek = weekdays[dateObj.getDay()];
    
    // 필요없는 카운트 데이터 삭제
    delete day.skyCounts;
    delete day.ptyCounts;
    delete day.wsdSum;
    delete day.wsdCount;
  });
  
  // 날짜순으로 정렬
  const sortedData = Object.values(dailyData).sort((a: any, b: any) => {
    return a.date.localeCompare(b.date);
  });
  
  console.log('날씨 데이터 처리 완료');
  return sortedData;
};

// 강수형태 설명 반환 함수
export function getPtyDescription(ptyValue: string): string {
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

// 하늘상태 설명 반환 함수
export function getSkyDescription(skyValue: string): string {
  switch(skyValue) {
    case '1': return '맑음';
    case '3': return '구름많음';
    case '4': return '흐림';
    default: return '알 수 없음';
  }
}

// 풍향 설명 반환 함수
export function getWindDirectionDescription(vecValue: number): string {
  if (vecValue >= 0 && vecValue < 45) return 'N-NE';
  if (vecValue >= 45 && vecValue < 90) return 'NE-E';
  if (vecValue >= 90 && vecValue < 135) return 'E-SE';
  if (vecValue >= 135 && vecValue < 180) return 'SE-S';
  if (vecValue >= 180 && vecValue < 225) return 'S-SW';
  if (vecValue >= 225 && vecValue < 270) return 'SW-W';
  if (vecValue >= 270 && vecValue < 315) return 'W-NW';
  if (vecValue >= 315 && vecValue <= 360) return 'NW-N';
  return '알 수 없음';
}

export default {
  fetchWeatherForecast,
  fetchUltraSrtNcst,
  processWeatherData,
  formatDate,
  formatTime,
  weatherCodes,
  getPtyDescription,
  getSkyDescription,
  getWindDirectionDescription
}; 
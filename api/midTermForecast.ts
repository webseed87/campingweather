import axios from 'axios';
import { API_KEY } from '@env';

// 기상청 API 인증키
const serviceKey = API_KEY;
const MID_FCST_BASE_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService';

// 중기육상예보 조회 URL
const MID_LAND_FCST_URL = `${MID_FCST_BASE_URL}/getMidLandFcst`;
// 중기기온 조회 URL
const MID_TA_URL = `${MID_FCST_BASE_URL}/getMidTa`;

// 예보 구역 코드 (전국 주요 지역)
export const MID_FORECAST_REGION_CODES = {
  // 육상 중기예보 구역 코드
  LAND: {
    '서울, 인천, 경기도': '11B00000',
    '강원도 영서': '11D10000',
    '강원도 영동': '11D20000',
    '대전, 세종, 충청남도': '11C20000',
    '충청북도': '11C10000',
    '광주, 전라남도': '11F20000',
    '전라북도': '11F10000',
    '대구, 경상북도': '11H10000',
    '부산, 울산, 경상남도': '11H20000',
    '제주도': '11G00000'
  },
  // 기온 중기예보 구역 코드
  TEMPERATURE: {
    '서울': '11B10101',
    '인천': '11B20201',
    '수원': '11B20601',
    '춘천': '11D10301',
    '강릉': '11D20401',
    '대전': '11C20401',
    '청주': '11C10301',
    '광주': '11F20501',
    '전주': '11F10201',
    '대구': '11H10701',
    '부산': '11H20201',
    '울산': '11H20101',
    '창원': '11H20301',
    '제주': '11G00401'
  }
};

/**
 * 발표시각 생성 함수 (YYYYMMDDHHMM)
 * 중기예보는 06시, 18시에 발표됨
 */
export const getMidForecastBaseTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const hour = now.getHours();
  let baseTime;
  
  // 06시, 18시 발표 시간 기준으로 가장 최근 발표 시간 선택
  if (hour < 6) {
    // 전날 18시 발표 데이터
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayYear = yesterday.getFullYear();
    const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
    baseTime = `${yesterdayYear}${yesterdayMonth}${yesterdayDay}1800`;
  } else if (hour < 18) {
    // 당일 06시 발표 데이터
    baseTime = `${year}${month}${day}0600`;
  } else {
    // 당일 18시 발표 데이터
    baseTime = `${year}${month}${day}1800`;
  }
  
  return baseTime;
};

/**
 * 중기육상예보 조회 함수
 * @param regId 예보구역코드
 * @returns 중기육상예보 데이터
 */
export const fetchMidLandForecast = async (regId: string) => {
  try {
    // 발표시각 계산
    const tmFc = getMidForecastBaseTime();
    console.log(`중기육상예보 API 호출 정보: 발표시각=${tmFc}, 지역코드=${regId}`);
    
    // API 호출 URL 구성
    const url = `${MID_LAND_FCST_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=10&pageNo=1&dataType=JSON&regId=${regId}&tmFc=${tmFc}`;
    console.log('중기육상예보 API 호출 URL:', url);
    
    // API 호출
    const response = await axios.get(url, {
      timeout: 15000 // 15초 타임아웃 설정
    });
    
    console.log('중기육상예보 API 응답 상태:', response.status);
    
    // 응답 데이터 확인
    if (response.data && response.data.response) {
      const header = response.data.response.header;
      console.log('중기육상예보 API 응답 코드:', header.resultCode, '메시지:', header.resultMsg);
      
      if (header.resultCode === '00') {
        const items = response.data.response.body.items.item;
        
        if (!items || items.length === 0) {
          console.error('중기육상예보 API 응답에 데이터가 없습니다.');
          throw new Error('중기육상예보 데이터가 없습니다.');
        }
        
        // 첫 번째 항목 반환 (일반적으로 하나의 항목만 반환됨)
        return items[0];
      } else {
        console.error(`중기육상예보 API 오류: ${header.resultCode} - ${header.resultMsg}`);
        throw new Error(`중기육상예보 API 오류: ${header.resultMsg}`);
      }
    } else {
      console.error('중기육상예보 API 응답 형식이 올바르지 않습니다.');
      console.error('응답 데이터:', JSON.stringify(response.data, null, 2));
      throw new Error('중기육상예보 API 응답 형식이 올바르지 않습니다.');
    }
  } catch (error: any) {
    console.error('중기육상예보 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    throw error;
  }
};

/**
 * 중기기온 조회 함수
 * @param regId 예보구역코드
 * @returns 중기기온 데이터
 */
export const fetchMidTemperature = async (regId: string) => {
  try {
    // 발표시각 계산
    const tmFc = getMidForecastBaseTime();
    console.log(`중기기온 API 호출 정보: 발표시각=${tmFc}, 지역코드=${regId}`);
    
    // API 호출 URL 구성
    const url = `${MID_TA_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=10&pageNo=1&dataType=JSON&regId=${regId}&tmFc=${tmFc}`;
    console.log('중기기온 API 호출 URL:', url);
    
    // API 호출
    const response = await axios.get(url, {
      timeout: 15000 // 15초 타임아웃 설정
    });
    
    console.log('중기기온 API 응답 상태:', response.status);
    
    // 응답 데이터 확인
    if (response.data && response.data.response) {
      const header = response.data.response.header;
      console.log('중기기온 API 응답 코드:', header.resultCode, '메시지:', header.resultMsg);
      
      if (header.resultCode === '00') {
        const items = response.data.response.body.items.item;
        
        if (!items || items.length === 0) {
          console.error('중기기온 API 응답에 데이터가 없습니다.');
          throw new Error('중기기온 데이터가 없습니다.');
        }
        
        // 첫 번째 항목 반환 (일반적으로 하나의 항목만 반환됨)
        return items[0];
      } else {
        console.error(`중기기온 API 오류: ${header.resultCode} - ${header.resultMsg}`);
        throw new Error(`중기기온 API 오류: ${header.resultMsg}`);
      }
    } else {
      console.error('중기기온 API 응답 형식이 올바르지 않습니다.');
      console.error('응답 데이터:', JSON.stringify(response.data, null, 2));
      throw new Error('중기기온 API 응답 형식이 올바르지 않습니다.');
    }
  } catch (error: any) {
    console.error('중기기온 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    throw error;
  }
};

/**
 * 중기예보 데이터 통합 함수 (육상예보 + 기온)
 * @param landRegId 육상예보 구역코드
 * @param taRegId 기온예보 구역코드
 * @returns 통합된 중기예보 데이터
 */
export const fetchMidForecastCombined = async (landRegId: string, taRegId: string) => {
  try {
    // 두 API 동시 호출
    const [landForecast, temperature] = await Promise.all([
      fetchMidLandForecast(landRegId),
      fetchMidTemperature(taRegId)
    ]);
    
    // 발표 시간 확인 (06시 또는 18시)
    const tmFc = getMidForecastBaseTime();
    const isAM6 = tmFc.endsWith('0600');
    
    // 결과 데이터 구조화
    const result = {
      regId: landRegId,
      taRegId: taRegId,
      tmFc,
      // 날씨 예보 데이터
      forecast: [
        // 4일 후 (06시 발표에만 있음)
        isAM6 ? {
          day: 4,
          am: {
            weather: landForecast.wf4Am,
            rainProb: parseInt(landForecast.rnSt4Am)
          },
          pm: {
            weather: landForecast.wf4Pm,
            rainProb: parseInt(landForecast.rnSt4Pm)
          },
          temperature: {
            min: parseInt(temperature.taMin4),
            max: parseInt(temperature.taMax4)
          }
        } : null,
        // 5일 후
        {
          day: 5,
          am: {
            weather: landForecast.wf5Am,
            rainProb: parseInt(landForecast.rnSt5Am)
          },
          pm: {
            weather: landForecast.wf5Pm,
            rainProb: parseInt(landForecast.rnSt5Pm)
          },
          temperature: {
            min: parseInt(temperature.taMin5),
            max: parseInt(temperature.taMax5)
          }
        },
        // 6일 후
        {
          day: 6,
          am: {
            weather: landForecast.wf6Am,
            rainProb: parseInt(landForecast.rnSt6Am)
          },
          pm: {
            weather: landForecast.wf6Pm,
            rainProb: parseInt(landForecast.rnSt6Pm)
          },
          temperature: {
            min: parseInt(temperature.taMin6),
            max: parseInt(temperature.taMax6)
          }
        },
        // 7일 후
        {
          day: 7,
          am: {
            weather: landForecast.wf7Am,
            rainProb: parseInt(landForecast.rnSt7Am)
          },
          pm: {
            weather: landForecast.wf7Pm,
            rainProb: parseInt(landForecast.rnSt7Pm)
          },
          temperature: {
            min: parseInt(temperature.taMin7),
            max: parseInt(temperature.taMax7)
          }
        },
        // 8일 후
        {
          day: 8,
          weather: landForecast.wf8,
          rainProb: parseInt(landForecast.rnSt8),
          temperature: {
            min: parseInt(temperature.taMin8),
            max: parseInt(temperature.taMax8)
          }
        },
        // 9일 후
        {
          day: 9,
          weather: landForecast.wf9,
          rainProb: parseInt(landForecast.rnSt9),
          temperature: {
            min: parseInt(temperature.taMin9),
            max: parseInt(temperature.taMax9)
          }
        },
        // 10일 후
        {
          day: 10,
          weather: landForecast.wf10,
          rainProb: parseInt(landForecast.rnSt10),
          temperature: {
            min: parseInt(temperature.taMin10),
            max: parseInt(temperature.taMax10)
          }
        }
      ].filter(Boolean) // null 값 제거
    };
    
    return result;
  } catch (error) {
    console.error('중기예보 통합 데이터 조회 오류:', error);
    throw error;
  }
};

export default {
  fetchMidLandForecast,
  fetchMidTemperature,
  fetchMidForecastCombined,
  getMidForecastBaseTime,
  MID_FORECAST_REGION_CODES
}; 
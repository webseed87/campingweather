import axios from 'axios';

// 기상청 API 인증키
const serviceKey = process.env.EXPO_PUBLIC_API_KEY || '';
const MID_FCST_BASE_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService';
const SHORT_FCST_BASE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

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
  // 기온 중기예보 구역 코드 (상세)
  TEMPERATURE: {
    '백령도': '11A00101',
    '서울': '11B10101',
    '과천': '11B10102',
    '광명': '11B10103',
    '강화': '11B20101',
    '김포': '11B20102',
    '인천': '11B20201',
    '시흥': '11B20202',
    '안산': '11B20203',
    '부천': '11B20204',
    '의정부': '11B20301',
    '고양': '11B20302',
    '양주': '11B20304',
    '파주': '11B20305',
    '동두천': '11B20401',
    '연천': '11B20402',
    '포천': '11B20403',
    '가평': '11B20404',
    '구리': '11B20501',
    '남양주': '11B20502',
    '양평': '11B20503',
    '하남': '11B20504',
    '수원': '11B20601',
    '안양': '11B20602',
    '오산': '11B20603',
    '화성': '11B20604',
    '성남': '11B20605',
    '평택': '11B20606',
    '의왕': '11B20609',
    '군포': '11B20610',
    '안성': '11B20611',
    '용인': '11B20612',
    '이천': '11B20701',
    '광주(경기)': '11B20702',
    '여주': '11B20703',
    '충주': '11C10101',
    '진천': '11C10102',
    '음성': '11C10103',
    '제천': '11C10201',
    '단양': '11C10202',
    '청주': '11C10301',
    '보은': '11C10302',
    '괴산': '11C10303',
    '증평': '11C10304',
    '추풍령': '11C10401',
    '영동': '11C10402',
    '옥천': '11C10403',
    '서산': '11C20101',
    '태안': '11C20102',
    '당진': '11C20103',
    '홍성': '11C20104',
    '보령': '11C20201',
    '서천': '11C20202',
    '천안': '11C20301',
    '아산': '11C20302',
    '예산': '11C20303',
    '대전': '11C20401',
    '공주': '11C20402',
    '계룡': '11C20403',
    '세종': '11C20404',
    '부여': '11C20501',
    '청양': '11C20502',
    '금산': '11C20601',
    '논산': '11C20602',
    '철원': '11D10101',
    '화천': '11D10102',
    '인제': '11D10201',
    '양구': '11D10202',
    '춘천': '11D10301',
    '홍천': '11D10302',
    '원주': '11D10401',
    '횡성': '11D10402',
    '영월': '11D10501',
    '정선': '11D10502',
    '평창': '11D10503',
    '대관령': '11D20201',
    '태백': '11D20301',
    '속초': '11D20401',
    '고성(강원)': '11D20402',
    '양양': '11D20403',
    '강릉': '11D20501',
    '동해': '11D20601',
    '삼척': '11D20602',
    '울릉도': '11E00101',
    '독도': '11E00102',
    '전주': '11F10201',
    '익산': '11F10202',
    '정읍': '11F10203',
    '완주': '11F10204',
    '장수': '11F10301',
    '무주': '11F10302',
    '진안': '11F10303',
    '남원': '11F10401',
    '임실': '11F10402',
    '순창': '11F10403',
    '군산': '21F10501',
    '김제': '21F10502',
    '고창': '21F10601',
    '부안': '21F10602',
    '함평': '21F20101',
    '영광': '21F20102',
    '진도': '21F20201',
    '완도': '11F20301',
    '해남': '11F20302',
    '강진': '11F20303',
    '장흥': '11F20304',
    '여수': '11F20401',
    '광양': '11F20402',
    '고흥': '11F20403',
    '보성': '11F20404',
    '순천시': '11F20405',
    '광주(전남)': '11F20501',
    '장성': '11F20502',
    '나주': '11F20503',
    '담양': '11F20504',
    '화순': '11F20505',
    '구례': '11F20601',
    '곡성': '11F20602',
    '순천': '11F20603',
    '흑산도': '11F20701',
    '목포': '21F20801',
    '영암': '21F20802',
    '신안': '21F20803',
    '무안': '21F20804',
    '성산': '11G00101',
    '제주': '11G00201',
    '성판악': '11G00302',
    '서귀포': '11G00401',
    '고산': '11G00501',
    '이어도': '11G00601',
    '추자도': '11G00800',
    '울진': '11H10101',
    '영덕': '11H10102',
    '포항': '11H10201',
    '경주': '11H10202',
    '문경': '11H10301',
    '상주': '11H10302',
    '예천': '11H10303',
    '영주': '11H10401',
    '봉화': '11H10402',
    '영양': '11H10403',
    '안동': '11H10501',
    '의성': '11H10502',
    '청송': '11H10503',
    '김천': '11H10601',
    '구미': '11H10602',
    '군위': '11H10707',
    '고령': '11H10604',
    '성주': '11H10605',
    '대구': '11H10701',
    '영천': '11H10702',
    '경산': '11H10703',
    '청도': '11H10704',
    '칠곡': '11H10705',
    '울산': '11H20101',
    '양산': '11H20102',
    '부산': '11H20201',
    '창원': '11H20301',
    '김해': '11H20304',
    '통영': '11H20401',
    '사천': '11H20402',
    '거제': '11H20403',
    '고성(경남)': '11H20404',
    '남해': '11H20405',
    '함양': '11H20501',
    '거창': '11H20502',
    '합천': '11H20503',
    '밀양': '11H20601',
    '의령': '11H20602',
    '함안': '11H20603',
    '창녕': '11H20604',
    '진주': '11H20701',
    '산청': '11H20703',
    '하동': '11H20704'
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
            'Accept': 'application/json, application/xml',
            'Content-Type': 'application/json',
          }
    });
    
    console.log('중기육상예보 API 응답 상태:', response.status);
    
    // 응답 데이터 확인
        if (response.data) {
          // XML 응답 확인
          if (typeof response.data === 'string' && response.data.includes('<OpenAPI_ServiceResponse>')) {
            console.error('중기육상예보 API가 XML 오류 응답을 반환했습니다.');
            console.error('XML 응답:', response.data);
            
            // XML에서 오류 메시지 추출 시도
            const errMsgMatch = response.data.match(/<errMsg>(.*?)<\/errMsg>/);
            const returnReasonCodeMatch = response.data.match(/<returnReasonCode>(.*?)<\/returnReasonCode>/);
            
            const errMsg = errMsgMatch ? errMsgMatch[1] : '알 수 없는 오류';
            const reasonCode = returnReasonCodeMatch ? returnReasonCodeMatch[1] : '알 수 없는 코드';
            
            throw new Error(`API 오류: ${errMsg} (코드: ${reasonCode})`);
          }
          
          // JSON 응답 확인
          if (response.data.response) {
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
        } else {
          console.error('중기육상예보 API 응답이 비어있습니다.');
          throw new Error('중기육상예보 API 응답이 비어있습니다.');
        }
      } catch (error: any) {
        lastError = error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`중기육상예보 API 호출 실패 (${retryCount}/${maxRetries}), 재시도 중...`);
          // 지수 백오프 (1초, 2초, 4초...)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        }
      }
    }
    
    // 모든 재시도 실패
    console.error('중기육상예보 API 호출 오류 (최대 재시도 횟수 초과):', lastError?.message);
    if (lastError?.response) {
      console.error('응답 데이터:', lastError.response.data);
      console.error('응답 상태:', lastError.response.status);
    }
    
    // 오류가 있어도 기본 데이터 반환 (앱 크래시 방지)
    return {
      regId: regId,
      wf3Am: '예보 없음',
      wf3Pm: '예보 없음',
      wf4Am: '예보 없음',
      wf4Pm: '예보 없음',
      wf5Am: '예보 없음',
      wf5Pm: '예보 없음',
      wf6Am: '예보 없음',
      wf6Pm: '예보 없음',
      wf7Am: '예보 없음',
      wf7Pm: '예보 없음',
      wf8: '예보 없음',
      wf9: '예보 없음',
      wf10: '예보 없음',
      rnSt3Am: '0',
      rnSt3Pm: '0',
      rnSt4Am: '0',
      rnSt4Pm: '0',
      rnSt5Am: '0',
      rnSt5Pm: '0',
      rnSt6Am: '0',
      rnSt6Pm: '0',
      rnSt7Am: '0',
      rnSt7Pm: '0',
      rnSt8: '0',
      rnSt9: '0',
      rnSt10: '0'
    };
  } catch (error: any) {
    console.error('중기육상예보 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    
    // 오류가 있어도 기본 데이터 반환 (앱 크래시 방지)
    return {
      regId: regId,
      wf3Am: '예보 없음',
      wf3Pm: '예보 없음',
      wf4Am: '예보 없음',
      wf4Pm: '예보 없음',
      wf5Am: '예보 없음',
      wf5Pm: '예보 없음',
      wf6Am: '예보 없음',
      wf6Pm: '예보 없음',
      wf7Am: '예보 없음',
      wf7Pm: '예보 없음',
      wf8: '예보 없음',
      wf9: '예보 없음',
      wf10: '예보 없음',
      rnSt3Am: '0',
      rnSt3Pm: '0',
      rnSt4Am: '0',
      rnSt4Pm: '0',
      rnSt5Am: '0',
      rnSt5Pm: '0',
      rnSt6Am: '0',
      rnSt6Pm: '0',
      rnSt7Am: '0',
      rnSt7Pm: '0',
      rnSt8: '0',
      rnSt9: '0',
      rnSt10: '0'
    };
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
            'Accept': 'application/json, application/xml',
            'Content-Type': 'application/json',
          }
    });
    
    console.log('중기기온 API 응답 상태:', response.status);
    
    // 응답 데이터 확인
        if (response.data) {
          // XML 응답 확인
          if (typeof response.data === 'string' && response.data.includes('<OpenAPI_ServiceResponse>')) {
            console.error('중기기온 API가 XML 오류 응답을 반환했습니다.');
            console.error('XML 응답:', response.data);
            
            // XML에서 오류 메시지 추출 시도
            const errMsgMatch = response.data.match(/<errMsg>(.*?)<\/errMsg>/);
            const returnReasonCodeMatch = response.data.match(/<returnReasonCode>(.*?)<\/returnReasonCode>/);
            
            const errMsg = errMsgMatch ? errMsgMatch[1] : '알 수 없는 오류';
            const reasonCode = returnReasonCodeMatch ? returnReasonCodeMatch[1] : '알 수 없는 코드';
            
            throw new Error(`API 오류: ${errMsg} (코드: ${reasonCode})`);
          }
          
          // JSON 응답 확인
          if (response.data.response) {
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
        } else {
          console.error('중기기온 API 응답이 비어있습니다.');
          throw new Error('중기기온 API 응답이 비어있습니다.');
        }
      } catch (error: any) {
        lastError = error;
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`중기기온 API 호출 실패 (${retryCount}/${maxRetries}), 재시도 중...`);
          // 지수 백오프 (1초, 2초, 4초...)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
        }
      }
    }
    
    // 모든 재시도 실패
    console.error('중기기온 API 호출 오류 (최대 재시도 횟수 초과):', lastError?.message);
    if (lastError?.response) {
      console.error('응답 데이터:', lastError.response.data);
      console.error('응답 상태:', lastError.response.status);
    }
    
    // 오류가 있어도 기본 데이터 반환 (앱 크래시 방지)
    return {
      regId: regId,
      taMin3: '0',
      taMax3: '0',
      taMin4: '0',
      taMax4: '0',
      taMin5: '0',
      taMax5: '0',
      taMin6: '0',
      taMax6: '0',
      taMin7: '0',
      taMax7: '0',
      taMin8: '0',
      taMax8: '0',
      taMin9: '0',
      taMax9: '0',
      taMin10: '0',
      taMax10: '0'
    };
  } catch (error: any) {
    console.error('중기기온 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    
    // 오류가 있어도 기본 데이터 반환 (앱 크래시 방지)
    return {
      regId: regId,
      taMin3: '0',
      taMax3: '0',
      taMin4: '0',
      taMax4: '0',
      taMin5: '0',
      taMax5: '0',
      taMin6: '0',
      taMax6: '0',
      taMin7: '0',
      taMax7: '0',
      taMin8: '0',
      taMax8: '0',
      taMin9: '0',
      taMax9: '0',
      taMin10: '0',
      taMax10: '0'
    };
  }
};

/**
 * 단기예보에서 3일 후 데이터 가져오기
 * @param nx 예보지점 X 좌표
 * @param ny 예보지점 Y 좌표
 * @returns 3일 후 날씨 데이터
 */
export const fetchShortTermForecastFor3Days = async (nx: number, ny: number) => {
  try {
    // 현재 날짜 및 시간 계산
    const now = new Date();
    console.log(`현재 시간: ${now.toISOString()}`);
    
    // 기상청 API는 02, 05, 08, 11, 14, 17, 20, 23시에 발표됨
    // 가장 최근 발표 시간 계산
    const hours = now.getHours();
    let baseTime;
    
    if (hours < 2) {
      baseTime = "2300";
      // 전날 23시 발표 데이터 사용
      now.setDate(now.getDate() - 1);
    } else if (hours < 5) {
      baseTime = "0200";
    } else if (hours < 8) {
      baseTime = "0500";
    } else if (hours < 11) {
      baseTime = "0800";
    } else if (hours < 14) {
      baseTime = "1100";
    } else if (hours < 17) {
      baseTime = "1400";
    } else if (hours < 20) {
      baseTime = "1700";
    } else if (hours < 23) {
      baseTime = "2000";
    } else {
      baseTime = "2300";
    }
    
    // 날짜 포맷팅 (YYYYMMDD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const baseDate = `${year}${month}${day}`;
    
    // 3일 후 날짜 계산 (정확히 72시간 후)
    const thirdDay = new Date(now);
    thirdDay.setDate(now.getDate() + 3);
    
    // 3일 후 날짜 포맷팅 (YYYYMMDD)
    const thirdDayYear = thirdDay.getFullYear();
    const thirdDayMonth = String(thirdDay.getMonth() + 1).padStart(2, '0');
    const thirdDayDate = String(thirdDay.getDate()).padStart(2, '0');
    const thirdDayFormatted = `${thirdDayYear}${thirdDayMonth}${thirdDayDate}`;
    
    console.log(`단기예보 API 호출 정보: 기준일자=${baseDate}, 기준시간=${baseTime}, 예보지점=(${nx}, ${ny}), 3일 후 날짜=${thirdDayFormatted}`);
    
    // 여러 시간대 시도를 위한 배열
    const baseTimes = ["0200", "0500", "0800", "1100", "1400", "1700", "2000", "2300"];
    let thirdDayItems = [];
    let response;
    
    // 현재 시간대부터 시작하여 데이터 찾기
    for (let i = 0; i < baseTimes.length; i++) {
      // 현재 시간대 이후의 발표 시간은 건너뛰기
      if (parseInt(baseTimes[i]) > parseInt(baseTime) && baseDate === `${year}${month}${day}`) {
        continue;
      }
      
      const tryBaseTime = baseTimes[i];
      
      // API 호출 URL 구성
      const url = `${SHORT_FCST_BASE_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${tryBaseTime}&nx=${nx}&ny=${ny}`;
      console.log(`시도 ${i+1}: 단기예보 API 호출 URL:`, url);
      
      try {
        // API 호출
        response = await axios.get(url, {
          timeout: 15000 // 15초 타임아웃 설정
        });
        
        console.log(`시도 ${i+1}: 단기예보 API 응답 상태:`, response.status);
        
        // 응답 데이터 확인
        if (response.data && 
            response.data.response && 
            response.data.response.header.resultCode === '00' &&
            response.data.response.body.items.item) {
          
          const items = response.data.response.body.items.item;
          
          // 3일 후 데이터 필터링
          thirdDayItems = items.filter((item: any) => item.fcstDate === thirdDayFormatted);
          
          if (thirdDayItems.length > 0) {
            console.log(`시도 ${i+1}: 3일 후(${thirdDayFormatted}) 데이터 ${thirdDayItems.length}개 찾음`);
            break; // 데이터를 찾았으면 반복 중단
          } else {
            console.log(`시도 ${i+1}: 3일 후(${thirdDayFormatted}) 데이터가 없습니다.`);
          }
        }
      } catch (error) {
        console.error(`시도 ${i+1}: API 호출 오류:`, error);
      }
    }
    
    // 데이터를 찾지 못한 경우 전날 데이터 시도
    if (thirdDayItems.length === 0) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayYear = yesterday.getFullYear();
      const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
      const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayFormatted = `${yesterdayYear}${yesterdayMonth}${yesterdayDay}`;
      
      console.log(`전날(${yesterdayFormatted}) 데이터 시도`);
      
      for (const tryBaseTime of ["0500", "1100", "1700", "2300"]) {
        const yesterdayUrl = `${SHORT_FCST_BASE_URL}?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${yesterdayFormatted}&base_time=${tryBaseTime}&nx=${nx}&ny=${ny}`;
        
        console.log('어제 단기예보 API 호출 URL:', yesterdayUrl);
        
        try {
          const yesterdayResponse = await axios.get(yesterdayUrl, {
            timeout: 15000
          });
          
          if (yesterdayResponse.data && 
              yesterdayResponse.data.response && 
              yesterdayResponse.data.response.header.resultCode === '00') {
            
            const yesterdayItems = yesterdayResponse.data.response.body.items.item;
            const yesterdayThirdDayItems = yesterdayItems.filter((item: any) => item.fcstDate === thirdDayFormatted);
            
            if (yesterdayThirdDayItems.length > 0) {
              console.log(`어제 발표 데이터에서 3일 후 데이터 ${yesterdayThirdDayItems.length}개 찾음`);
              thirdDayItems = yesterdayThirdDayItems;
              break;
            }
          }
        } catch (error) {
          console.error('어제 API 호출 오류:', error);
        }
      }
    }
    
    // 데이터가 있는 경우 처리
    if (thirdDayItems.length > 0) {
      // 필요한 데이터 추출 (하늘상태, 강수확률)
      // 정오(1200) 데이터를 우선적으로 사용하되, 없으면 다른 시간대 데이터 사용
      const noonItems = thirdDayItems.filter((item: any) => 
        item.fcstTime === '1200' || item.fcstTime === '1300' || item.fcstTime === '1100');
      
      if (noonItems.length > 0) {
        return processWeatherItems(noonItems);
      } else {
        // 정오 데이터가 없으면 아무 시간대나 사용
        const anyTimeItems = thirdDayItems.filter((item: any) => 
          item.category === 'SKY' || item.category === 'POP' || item.category === 'PTY');
        
        return processWeatherItems(anyTimeItems);
      }
    }
    
    // 모든 시도 실패 시 기본 데이터 반환
    console.log(`3일 후(${thirdDayFormatted}) 데이터를 찾지 못했습니다. 기본값 반환`);
    return {
      weather: "예보 없음",
      rainProb: 0
    };
  } catch (error: any) {
    console.error('단기예보 API 호출 오류:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
      console.error('응답 상태:', error.response.status);
    }
    // 오류 발생 시 기본 데이터 반환
    return {
      weather: "예보 없음",
      rainProb: 0
    };
  }
};

// 날씨 아이템 처리 함수
const processWeatherItems = (items: any[]) => {
  if (!items || items.length === 0) {
    return {
      weather: "예보 없음",
      rainProb: 0
    };
  }
  
  let skyValue = '';
  let popValue = 0;
  
  items.forEach((item: any) => {
    if (item.category === 'SKY') {
      // 하늘상태(SKY) 코드 변환
      switch (item.fcstValue) {
        case '1': skyValue = '맑음'; break;
        case '3': skyValue = '구름많음'; break;
        case '4': skyValue = '흐림'; break;
        default: skyValue = '알 수 없음';
      }
    } else if (item.category === 'POP') {
      // 강수확률(POP)
      popValue = parseInt(item.fcstValue);
    }
  });
  
  // 강수형태(PTY) 확인
  const ptyItem = items.find((item: any) => item.category === 'PTY');
  if (ptyItem && ptyItem.fcstValue !== '0') {
    // 강수형태(PTY) 코드 변환
    switch (ptyItem.fcstValue) {
      case '1': skyValue = '비'; break;
      case '2': skyValue = '비/눈'; break;
      case '3': skyValue = '눈'; break;
      case '4': skyValue = '소나기'; break;
      case '5': skyValue = '빗방울'; break;
      case '6': skyValue = '빗방울눈날림'; break;
      case '7': skyValue = '눈날림'; break;
    }
  }
  
  return {
    weather: skyValue || "예보 없음",
    rainProb: popValue
  };
};

/**
 * 중기예보 데이터 통합 함수 (육상예보 + 기온)
 * @param landRegId 육상예보 구역코드
 * @param taRegId 기온예보 구역코드
 * @param nx 예보지점 X 좌표 (단기예보용)
 * @param ny 예보지점 Y 좌표 (단기예보용)
 * @returns 통합된 중기예보 데이터
 */
export const fetchMidForecastCombined = async (landRegId: string, taRegId: string, nx?: number, ny?: number) => {
  try {
    console.log(`중기예보 통합 데이터 조회 시작 (landRegId=${landRegId}, taRegId=${taRegId})`);
    
    // 두 API 동시 호출 (각각 오류 처리)
    let landForecast;
    let temperature;
    
    try {
      landForecast = await fetchMidLandForecast(landRegId);
      console.log('중기육상예보 데이터 가져오기 성공');
    } catch (landError) {
      console.error('중기육상예보 데이터 가져오기 실패:', landError);
      // 기본 데이터로 대체
      landForecast = {
        regId: landRegId,
        wf3Am: '예보 없음',
        wf3Pm: '예보 없음',
        wf4Am: '예보 없음',
        wf4Pm: '예보 없음',
        wf5Am: '예보 없음',
        wf5Pm: '예보 없음',
        wf6Am: '예보 없음',
        wf6Pm: '예보 없음',
        wf7Am: '예보 없음',
        wf7Pm: '예보 없음',
        wf8: '예보 없음',
        wf9: '예보 없음',
        wf10: '예보 없음',
        rnSt3Am: '0',
        rnSt3Pm: '0',
        rnSt4Am: '0',
        rnSt4Pm: '0',
        rnSt5Am: '0',
        rnSt5Pm: '0',
        rnSt6Am: '0',
        rnSt6Pm: '0',
        rnSt7Am: '0',
        rnSt7Pm: '0',
        rnSt8: '0',
        rnSt9: '0',
        rnSt10: '0'
      };
    }
    
    try {
      temperature = await fetchMidTemperature(taRegId);
      console.log('중기기온 데이터 가져오기 성공');
    } catch (tempError) {
      console.error('중기기온 데이터 가져오기 실패:', tempError);
      // 기본 데이터로 대체
      temperature = {
        regId: taRegId,
        taMin3: '0',
        taMax3: '0',
        taMin4: '0',
        taMax4: '0',
        taMin5: '0',
        taMax5: '0',
        taMin6: '0',
        taMax6: '0',
        taMin7: '0',
        taMax7: '0',
        taMin8: '0',
        taMax8: '0',
        taMin9: '0',
        taMax9: '0',
        taMin10: '0',
        taMax10: '0'
      };
    }
    
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
        // 3일 후 데이터는 제외하고 4일 후부터 시작
        // 4일 후 (06시 발표에만 있음)
        isAM6 ? {
          day: 4,
          am: {
            weather: landForecast.wf4Am,
            rainProb: parseInt(landForecast.rnSt4Am) || 0
          },
          pm: {
            weather: landForecast.wf4Pm,
            rainProb: parseInt(landForecast.rnSt4Pm) || 0
          },
          temperature: {
            min: parseInt(temperature.taMin4) || 0,
            max: parseInt(temperature.taMax4) || 0
          }
        } : null,
        // 5일 후
        {
          day: 5,
          am: {
            weather: landForecast.wf5Am,
            rainProb: parseInt(landForecast.rnSt5Am) || 0
          },
          pm: {
            weather: landForecast.wf5Pm,
            rainProb: parseInt(landForecast.rnSt5Pm) || 0
          },
          temperature: {
            min: parseInt(temperature.taMin5) || 0,
            max: parseInt(temperature.taMax5) || 0
          }
        },
        // 6일 후
        {
          day: 6,
          am: {
            weather: landForecast.wf6Am,
            rainProb: parseInt(landForecast.rnSt6Am) || 0
          },
          pm: {
            weather: landForecast.wf6Pm,
            rainProb: parseInt(landForecast.rnSt6Pm) || 0
          },
          temperature: {
            min: parseInt(temperature.taMin6) || 0,
            max: parseInt(temperature.taMax6) || 0
          }
        },
        // 7일 후
        {
          day: 7,
          am: {
            weather: landForecast.wf7Am,
            rainProb: parseInt(landForecast.rnSt7Am) || 0
          },
          pm: {
            weather: landForecast.wf7Pm,
            rainProb: parseInt(landForecast.rnSt7Pm) || 0
          },
          temperature: {
            min: parseInt(temperature.taMin7) || 0,
            max: parseInt(temperature.taMax7) || 0
          }
        },
        // 8일 후
        {
          day: 8,
          weather: landForecast.wf8,
          rainProb: parseInt(landForecast.rnSt8) || 0,
          temperature: {
            min: parseInt(temperature.taMin8) || 0,
            max: parseInt(temperature.taMax8) || 0
          }
        },
        // 9일 후
        {
          day: 9,
          weather: landForecast.wf9,
          rainProb: parseInt(landForecast.rnSt9) || 0,
          temperature: {
            min: parseInt(temperature.taMin9) || 0,
            max: parseInt(temperature.taMax9) || 0
          }
        },
        // 10일 후
        {
          day: 10,
          weather: landForecast.wf10,
          rainProb: parseInt(landForecast.rnSt10) || 0,
          temperature: {
            min: parseInt(temperature.taMin10) || 0,
            max: parseInt(temperature.taMax10) || 0
          }
        }
      ].filter(Boolean) // null 값 제거
    };
    
    console.log('중기예보 통합 데이터 조회 완료');
    return result;
  } catch (error) {
    console.error('중기예보 통합 데이터 조회 오류:', error);
    
    // 오류 발생 시 기본 데이터 반환 (앱 크래시 방지)
    const tmFc = getMidForecastBaseTime();
    const isAM6 = tmFc.endsWith('0600');
    
    return {
      regId: landRegId,
      taRegId: taRegId,
      tmFc,
      forecast: [
        // 기본 데이터 구조 유지
        isAM6 ? {
          day: 4,
          am: { weather: '예보 없음', rainProb: 0 },
          pm: { weather: '예보 없음', rainProb: 0 },
          temperature: { min: 0, max: 0 }
        } : null,
        {
          day: 5,
          am: { weather: '예보 없음', rainProb: 0 },
          pm: { weather: '예보 없음', rainProb: 0 },
          temperature: { min: 0, max: 0 }
        },
        {
          day: 6,
          am: { weather: '예보 없음', rainProb: 0 },
          pm: { weather: '예보 없음', rainProb: 0 },
          temperature: { min: 0, max: 0 }
        },
        {
          day: 7,
          am: { weather: '예보 없음', rainProb: 0 },
          pm: { weather: '예보 없음', rainProb: 0 },
          temperature: { min: 0, max: 0 }
        },
        {
          day: 8,
          weather: '예보 없음',
          rainProb: 0,
          temperature: { min: 0, max: 0 }
        },
        {
          day: 9,
          weather: '예보 없음',
          rainProb: 0,
          temperature: { min: 0, max: 0 }
        },
        {
          day: 10,
          weather: '예보 없음',
          rainProb: 0,
          temperature: { min: 0, max: 0 }
        }
      ].filter(Boolean) // null 값 제거
    };
  }
};

export default {
  fetchMidLandForecast,
  fetchMidTemperature,
  fetchMidForecastCombined,
  getMidForecastBaseTime,
  MID_FORECAST_REGION_CODES
}; 
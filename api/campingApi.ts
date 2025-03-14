import axios from 'axios';

// 공공데이터포털 API 인증키
const API_KEY = process.env.EXPO_PUBLIC_CAMPING_API_KEY || '';
const BASE_URL = 'https://apis.data.go.kr/B551011/GoCamping';

// 캠핑장 데이터 타입 정의
export interface CampingItem {
  contentId: string;
  facltNm: string;
  addr1: string;
  mapX: number;
  mapY: number;
  nx?: number;
  ny?: number;
  tel?: string;
  homepage?: string;
  resveUrl?: string;
  resveCl?: string;
  induty?: string;
  lctCl?: string;
  facltDivNm?: string;
  lineIntro?: string;
  intro?: string;
  firstImageUrl?: string;
  sbrsCl?: string;
  posblFcltyCl?: string;
  featureNm?: string;
  themaEnvrnCl?: string;
}

export interface CampingResponse {
  items: CampingItem[];
  numOfRows: number;
  pageNo: number;
  totalCount: number;
}

// 캠핑장 검색 함수
export async function searchCampings(keyword: string): Promise<CampingItem[]> {
  try {
    // 검색어가 없으면 빈 배열 반환
    if (!keyword || keyword.trim() === '') {
      return [];
    }
    
    console.log(`캠핑장 검색 API 호출: 키워드=${keyword}`);
    
    // API 호출 파라미터
    const params = {
      serviceKey: encodeURIComponent(API_KEY),
      numOfRows: '20',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'CampCast',
      _type: 'json',
      keyword: keyword
    };
    
    // 쿼리 스트링 생성
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');
    
    // 전체 URL 생성
    const url = `${BASE_URL}/searchList?${queryString}`;
    console.log('API 요청 URL:', url);
    
    // API 호출
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API 응답 처리
    if (data && data.response && data.response.header && data.response.header.resultCode === '0000') {
      let items = [];
      
      // 응답에 items가 있고, item이 배열인 경우
      if (data.response.body && data.response.body.items) {
        if (Array.isArray(data.response.body.items.item)) {
          items = data.response.body.items.item;
        } else if (data.response.body.items.item) {
          // item이 단일 객체인 경우 배열로 변환
          items = [data.response.body.items.item];
        }
      }
      
      console.log(`검색 결과: ${items.length}개의 캠핑장 찾음`);
      
      // 각 캠핑장 항목 처리
      const processedItems = items.map((item: any) => {
        return {
          contentId: item.contentId,
          facltNm: item.facltNm,
          addr1: item.addr1,
          mapX: Number(item.mapX) || 0,
          mapY: Number(item.mapY) || 0,
          tel: item.tel,
          homepage: item.homepage,
          resveUrl: item.resveUrl,
          resveCl: item.resveCl,
          induty: item.induty,
          lctCl: item.lctCl,
          facltDivNm: item.facltDivNm,
          lineIntro: item.lineIntro,
          intro: item.intro,
          firstImageUrl: item.firstImageUrl,
          sbrsCl: item.sbrsCl,
          posblFcltyCl: item.posblFcltyCl,
          featureNm: item.featureNm,
          themaEnvrnCl: item.themaEnvrnCl
        };
      });
      
      // 검색어가 있는 경우 정렬: 이름에 검색어가 포함된 항목을 먼저 표시
      if (keyword) {
        const keywordLower = keyword.toLowerCase();
        processedItems.sort((a: CampingItem, b: CampingItem) => {
          const aNameMatch = a.facltNm.toLowerCase().includes(keywordLower);
          const bNameMatch = b.facltNm.toLowerCase().includes(keywordLower);
          
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          return 0;
        });
      }
      
      return processedItems;
    } else {
      const resultMsg = data?.response?.header?.resultMsg || '알 수 없는 오류';
      throw new Error('API 응답 오류: ' + resultMsg);
    }
  } catch (error: any) {
    console.error('캠핑장 API 호출 오류:', error.message);
    
    // API 호출 실패 시 빈 배열 반환
    console.log('API 호출 실패, 빈 배열 반환');
    return [];
  }
}

// 캠핑장 상세 정보 조회 함수
export async function getCampingDetail(contentId: string): Promise<CampingItem | null> {
  try {
    console.log(`캠핑장 상세 정보 API 호출: contentId=${contentId}`);
    
    // API 호출 파라미터
    const params = {
      serviceKey: encodeURIComponent(API_KEY),
      numOfRows: '10',
      pageNo: '1',
      MobileOS: 'ETC',
      MobileApp: 'CampCast',
      _type: 'json',
      contentId: contentId
    };
    
    // 쿼리 스트링 생성
    const queryString = Object.keys(params)
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&');
    
    // 전체 URL 생성
    const url = `${BASE_URL}/searchList?${queryString}`;
    console.log('API 요청 URL:', url);
    
    // API 호출
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // API 응답 처리
    if (data && data.response && data.response.header && data.response.header.resultCode === '0000') {
      // 응답에 items가 있고, item이 있는 경우
      if (data.response.body && data.response.body.items && data.response.body.items.item) {
        let item;
        
        if (Array.isArray(data.response.body.items.item)) {
          // 배열인 경우 첫 번째 항목 사용
          item = data.response.body.items.item[0];
        } else {
          // 단일 객체인 경우 그대로 사용
          item = data.response.body.items.item;
        }
        
        if (item) {
          return {
            contentId: item.contentId,
            facltNm: item.facltNm,
            addr1: item.addr1,
            mapX: Number(item.mapX) || 0,
            mapY: Number(item.mapY) || 0,
            tel: item.tel,
            homepage: item.homepage,
            resveUrl: item.resveUrl,
            resveCl: item.resveCl,
            induty: item.induty,
            lctCl: item.lctCl,
            facltDivNm: item.facltDivNm,
            lineIntro: item.lineIntro,
            intro: item.intro,
            firstImageUrl: item.firstImageUrl,
            sbrsCl: item.sbrsCl,
            posblFcltyCl: item.posblFcltyCl,
            featureNm: item.featureNm,
            themaEnvrnCl: item.themaEnvrnCl
          };
        }
      }
      
      return null;
    } else {
      const resultMsg = data?.response?.header?.resultMsg || '알 수 없는 오류';
      throw new Error('API 응답 오류: ' + resultMsg);
    }
  } catch (error: any) {
    console.error('캠핑장 상세 정보 API 호출 오류:', error.message);
    return null;
  }
} 
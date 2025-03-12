/**
 * 경도(mapX)와 위도(mapY)를 기상청 좌표(nx, ny)로 변환하는 함수
 * 기상청 API에서 사용하는 격자 좌표계로 변환
 * 
 * @param mapX 경도 (longitude)
 * @param mapY 위도 (latitude)
 * @returns {nx, ny} 기상청 좌표
 */
export function convertToGridCoordinate(mapX: number, mapY: number): { nx: number, ny: number } {
  // LCC DFS 좌표변환 파라미터
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + (mapY) * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = mapX * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  let nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  let ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}

/**
 * 주소에서 추출한 행정구역 정보로 격자 좌표를 찾는 함수
 * 
 * @param address 주소 문자열
 * @returns {nx, ny} 기상청 좌표
 */
export function findGridCoordinatesByAddress(address: string): { nx: number, ny: number } {
  try {
    // 주소가 없는 경우
    if (!address) {
      return { nx: 60, ny: 127 }; // 기본값은 서울
    }

    // 주소에서 시/도, 시/군/구 정보 추출
    let city = '';
    let district = '';
    
    // 특별시, 광역시, 특별자치시, 도 추출
    const cityMatch = address.match(/서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주/);
    if (cityMatch) {
      city = cityMatch[0];
    }
    
    // 시/군/구 추출 (시/도 다음에 오는 단어)
    if (city) {
      const districtRegex = new RegExp(`${city}\\s+([\\w가-힣]+)`, 'u');
      const districtMatch = address.match(districtRegex);
      if (districtMatch && districtMatch[1]) {
        district = districtMatch[1];
      }
    }
    
    // 제주도 특별 처리
    if (city === '제주') {
      return { nx: 52, ny: 38 }; // 제주시 기준 좌표
    }
    
    // 경기도 특별 처리 (구체적인 지역 정보가 없는 경우)
    if (city === '경기' && !district) {
      return { nx: 60, ny: 120 }; // 경기도 중앙 부근 좌표
    }
    
    // 시/도만 있고 구체적인 지역 정보가 없는 경우 대략적인 좌표 반환
    if (city && !district) {
      switch (city) {
        case '서울': return { nx: 60, ny: 127 };
        case '부산': return { nx: 98, ny: 76 };
        case '인천': return { nx: 55, ny: 124 };
        case '대구': return { nx: 89, ny: 90 };
        case '광주': return { nx: 58, ny: 74 };
        case '대전': return { nx: 67, ny: 100 };
        case '울산': return { nx: 102, ny: 84 };
        case '세종': return { nx: 66, ny: 103 };
        case '강원': return { nx: 73, ny: 134 };
        case '충북': return { nx: 69, ny: 107 };
        case '충남': return { nx: 68, ny: 100 };
        case '전북': return { nx: 63, ny: 89 };
        case '전남': return { nx: 51, ny: 67 };
        case '경북': return { nx: 89, ny: 91 };
        case '경남': return { nx: 91, ny: 77 };
        default: return { nx: 60, ny: 127 }; // 기본값은 서울
      }
    }
    
    // 주소 정보가 불충분한 경우
    return { nx: 60, ny: 127 }; // 기본값은 서울
  } catch (error) {
    console.error('주소에서 좌표를 추출하는 중 오류 발생:', error);
    return { nx: 60, ny: 127 }; // 오류 발생 시 서울 좌표 반환
  }
}

/**
 * 경도(mapX)와 위도(mapY)를 이용해 locations.json에서 가장 가까운 nx, ny 좌표를 찾는 함수
 * 
 * @param mapX 경도 (longitude)
 * @param mapY 위도 (latitude)
 * @returns {nx, ny} 기상청 좌표
 */
export function findNearestGridFromLocations(mapX: number, mapY: number): { nx: number, ny: number } {
  try {
    // locations.json 파일 가져오기
    const locationsData = require('../constants/locations.json');
    
    if (!locationsData || !Array.isArray(locationsData)) {
      console.error('locations.json 데이터를 불러올 수 없습니다.');
      return convertToGridCoordinate(mapX, mapY); // 기본 변환 함수 사용
    }
    
    // 가장 가까운 위치 찾기
    let minDistance = Number.MAX_VALUE;
    let closestLocation = null;
    
    for (const location of locationsData) {
      if (location.mapX && location.mapY) {
        // 두 지점 간의 거리 계산 (단순 유클리드 거리)
        const distance = Math.sqrt(
          Math.pow(location.mapX - mapX, 2) + 
          Math.pow(location.mapY - mapY, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = location;
        }
      }
    }
    
    if (closestLocation) {
      console.log(`가장 가까운 위치: ${closestLocation.city} ${closestLocation.district || ''}, 거리: ${minDistance.toFixed(6)}`);
      return { 
        nx: closestLocation.nx, 
        ny: closestLocation.ny 
      };
    }
    
    // 가까운 위치를 찾지 못한 경우 기본 변환 함수 사용
    console.log('locations.json에서 가까운 위치를 찾지 못했습니다. 기본 변환 함수를 사용합니다.');
    return convertToGridCoordinate(mapX, mapY);
  } catch (error) {
    console.error('위치 데이터 처리 중 오류 발생:', error);
    return convertToGridCoordinate(mapX, mapY); // 오류 발생 시 기본 변환 함수 사용
  }
} 
// 계절 타입 정의
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

// 계절별 배경 이미지 가져오기
export const seasonalBackgrounds: Record<Season, any> = {
  spring: require("../../assets/images/spring_bg.png"),
  summer: require("../../assets/images/summer_bg.png"),
  autumn: require("../../assets/images/autumn_bg.png"),
  winter: require("../../assets/images/winter_bg.png"),
};

// 현재 계절 결정 함수
export const getCurrentSeason = (): Season => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth()는 0-11 반환

  // 계절 결정 (한국 기준)
  // 3-5: 봄, 6-8: 여름, 9-11: 가을, 12-2: 겨울
  if (month >= 3 && month <= 5) {
    return 'spring';
  } else if (month >= 6 && month <= 8) {
    return 'summer';
  } else if (month >= 9 && month <= 11) {
    return 'autumn';
  } else {
    return 'winter';
  }
};

// 모든 함수와 상수를 객체로 묶어 기본 내보내기
const seasonalBackgroundUtils = {
  seasonalBackgrounds,
  getCurrentSeason
};

export default seasonalBackgroundUtils; 
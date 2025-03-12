// 캠핑 팁 아이콘
export const campingTipIcons = {
  temperature: {
    verycold: '❄️', // 매우 추울 때
    cold: '❄️', // 추울 때
    mild: '🌡️', // 적당할 때
    hot: '🌡️' // 더울 때
  },
  wind: {
    strong: '💨', // 강한 바람
    moderate: '🌬️', // 적당한 바람
    weak: '🍃' // 약한 바람
  },
  precipitation: {
    rain: {
      light: '🌦', // 약한 비 (1mm 미만)
      moderate: '🌧️', // 보통 비 (1.0~29.9mm)
      heavy: '⛈️', // 강한 비 (30.0mm 이상)
      extreme: '🌊' // 매우 강한 비 (50.0mm 이상)
    },
    snow: {
      light: '❄️', // 가벼운 눈 (0.5cm 미만)
      moderate: '🌨️', // 보통 눈 (0.5~4.9cm)
      heavy: '☃️' // 많은 눈 (5.0cm 이상)
    },
    mixed: '🌨️', // 비/눈 혼합
    none: '☀️' // 맑음
  },
  sky: {
    clear: '☀️',
    cloudy: '⛅',
    overcast: '☁️'
  }
};

export default campingTipIcons; 
// 캠핑 팁 아이콘 (PNG 이미지)
// 이미지 경로 매핑
export const weatherImages = {
  sunny: require('../../assets/weather/weather_sunny.png'),
  partly_cloudy: require('../../assets/weather/weather_partly_cloudy.png'),
  cloudy: require('../../assets/weather/weather_cloudy.png'),
  rain: require('../../assets/weather/weather_rain.png'),
  rain_snow: require('../../assets/weather/weather_rain_snow.png'),
  snow: require('../../assets/weather/weather_snow.png'),
  shower: require('../../assets/weather/weather_shower.png'),
  drizzle: require('../../assets/weather/weather_drizzle.png'),
  drizzle_snow: require('../../assets/weather/weather_drizzle_snow.png'),
  snow_flurry: require('../../assets/weather/weather_snow_flurry.png'),
  temp_verycold: require('../../assets/weather/verycold.png'),
  temp_cold: require('../../assets/weather/cold.png'),
  temp_mild: require('../../assets/weather/mild.png'),
  temp_hot: require('../../assets/weather/hot.png'),
  wind_verystrong: require('../../assets/weather/wind_verystrong.png'),
  wind_strong: require('../../assets/weather/wind_strong.png'),
  wind_moderate: require('../../assets/weather/wind_moderate.png'),
  wind_weak: require('../../assets/weather/wind_weak.png'),
  rain_verystrong: require('../../assets/weather/rain_verystrong.png'),
  rain_strong: require('../../assets/weather/rain_strong.png'),
  rain_moderate: require('../../assets/weather/rain_moderate.png'),
  rain_weak: require('../../assets/weather/rain_moderate.png'),
  rain_sunny: require('../../assets/weather/rain_sunny.png'),
  snow_strong: require('../../assets/weather/snow_strong.png'),
  snow_moderate: require('../../assets/weather/snow_moderate.png'),
  snow_weak: require('../../assets/weather/snow_weak.png'),
};

// 주간 예보 아이콘 매핑
export const weeklyForecastIcons = {
  '맑음': weatherImages.sunny,
  '구름많음': weatherImages.partly_cloudy,
  '구름많고 비': weatherImages.rain,
  '구름많고 눈': weatherImages.snow,
  '구름많고 비/눈': weatherImages.rain_snow,
  '구름많고 소나기': weatherImages.shower,
  '흐림': weatherImages.cloudy,
  '흐리고 비': weatherImages.rain,
  '흐리고 눈': weatherImages.snow,
  '흐리고 비/눈': weatherImages.rain_snow,
  '흐리고 소나기': weatherImages.shower,
  '소나기': weatherImages.shower,
};

export const campingTipIcons = {
  temperature: {
    verycold: weatherImages.temp_verycold, // 매우 추울 때
    cold: weatherImages.temp_cold, // 추울 때
    mild: weatherImages.temp_mild, // 적당할 때
    hot: weatherImages.temp_hot // 더울 때
  },
  wind: {
    verystrong: weatherImages.wind_verystrong, // 강한 바람
    strong: weatherImages.wind_strong, // 적당한 바람
    moderate: weatherImages.wind_moderate, // 약한 바람
    weak: weatherImages.wind_weak// 노바람
  },
  precipitation: {
    rain: {
      light: weatherImages.rain_weak, // 약한 비 (1mm 미만)
      moderate: weatherImages.rain_moderate, // 보통 비 (1.0~29.9mm)
      heavy: weatherImages.rain_strong, // 강한 비 (30.0mm 이상)
      extreme: weatherImages.rain_verystrong // 매우 강한 비 (50.0mm 이상)
    },
    snow: {
      light: weatherImages.snow_flurry, // 가벼운 눈 (0.5cm 미만)
      moderate: weatherImages.snow, // 보통 눈 (0.5~4.9cm)
      heavy: weatherImages.snow // 많은 눈 (5.0cm 이상)
    },
    mixed: weatherImages.rain_snow, // 비/눈 혼합
    none: weatherImages.rain_sunny// 맑음
  },
  sky: {
    clear: weatherImages.sunny,
    cloudy: weatherImages.partly_cloudy,
    overcast: weatherImages.cloudy
  }
};

export default campingTipIcons; 
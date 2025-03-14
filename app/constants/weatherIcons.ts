// 날씨 아이콘 매핑
export const weatherIcons = {
  // 하늘상태
  SKY: {
    '1': 'weather_sunny', // 맑음
    '3': 'weather_partly_cloudy', // 구름많음
    '4': 'weather_cloudy', // 흐림
  },
  // 강수형태
  PTY: {
    '0': '', // 없음
    '1': 'weather_rain', // 비
    '2': 'weather_rain_snow', // 비/눈
    '3': 'weather_snow', // 눈
    '4': 'weather_shower', // 소나기
    '5': 'weather_drizzle', // 빗방울
    '6': 'weather_drizzle_snow', // 빗방울눈날림
    '7': 'weather_snow_flurry', // 눈날림
  },
  // 강수량 범주
  PCP: {
    '0': '', // 강수없음
    '1': 'weather_light_rain', // 1mm 미만
    '2': 'weather_moderate_rain', // 1.0~29.9mm
    '3': 'weather_heavy_rain', // 30.0~50.0mm
    '4': 'weather_very_heavy_rain', // 50.0mm 이상
  },
  // 적설량 범주
  SNO: {
    '0': '', // 적설없음
    '1': 'weather_light_snow', // 0.5cm 미만
    '2': 'weather_moderate_snow', // 0.5~4.9cm
    '3': 'weather_heavy_snow', // 5.0cm 이상
  }
};

export default weatherIcons; 
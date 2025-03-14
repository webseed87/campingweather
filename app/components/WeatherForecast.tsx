import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image,
  Platform,
} from "react-native";
import { useWeatherData } from "../hooks/useWeatherData";
import {
  WeatherForecastProps,
  ProcessedWeatherData,
  DailyWeatherData,
} from "../types/weather";
import weatherIcons from "../constants/weatherIcons";
import CampingTips from "./weather/CampingTips";
import { weatherImages } from "../constants/campingTipIcons";
import WeeklyForecast from "./weather/WeeklyForecast";
import { MID_FORECAST_REGION_CODES } from "../../api/midTermForecast";
import { Colors } from "@/constants/Colors";

// 날씨 아이콘 이미지 매핑
const weatherIconImages = {
  weather_sunny: weatherImages.sunny,
  weather_partly_cloudy: weatherImages.partly_cloudy,
  weather_cloudy: weatherImages.cloudy,
  weather_rain: weatherImages.rain,
  weather_rain_snow: weatherImages.rain_snow,
  weather_snow: weatherImages.snow,
  weather_shower: weatherImages.shower,
  weather_drizzle: weatherImages.drizzle,
  weather_drizzle_snow: weatherImages.drizzle_snow,
  weather_snow_flurry: weatherImages.snow_flurry,
  weather_unknown: weatherImages.cloudy, // 알 수 없는 날씨의 경우 cloudy 이미지 사용
};

export default function WeatherForecast({
  nx,
  ny,
  locationName,
  selectedDate,
  landRegId,
  taRegId,
}: WeatherForecastProps) {
  // 기본 지역 코드 설정 (landRegId와 taRegId가 없는 경우)
  const defaultLandRegId = landRegId || MID_FORECAST_REGION_CODES.LAND['서울, 인천, 경기도'];
  const defaultTaRegId = taRegId || MID_FORECAST_REGION_CODES.TEMPERATURE['서울'];

  // 좌표 확인 로그
  console.log(`WeatherForecast 컴포넌트 좌표: nx=${nx}, ny=${ny}`);

  // selectedDate가 변경될 때마다 날씨 데이터를 다시 가져오도록 의존성 배열에 추가
  const { processedData, isLoading, isError, error, isRefreshing, refresh } =
    useWeatherData(nx, ny, defaultLandRegId, defaultTaRegId);

  // 선택된 날짜의 날씨 데이터를 저장할 상태
  const [selectedWeather, setSelectedWeather] =
    useState<ProcessedWeatherData | null>(null);

  // 선택한 날짜 포맷팅
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    : new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // selectedDate가 변경될 때마다 해당 날짜의 날씨 데이터 찾기
  useEffect(() => {
    if (!processedData || processedData.length === 0 || !selectedDate) return;

    // 선택된 날짜를 YYYYMMDD 형식으로 변환
    const formattedSelectedDate = selectedDate.replace(/-/g, "");

    // 선택된 날짜의 날씨 데이터 찾기
    const weatherForSelectedDate = processedData.find(
      (item) => item.date === formattedSelectedDate
    );

    if (weatherForSelectedDate) {
   
      setSelectedWeather(weatherForSelectedDate);
    } else {
     
      // 데이터가 없으면 가장 가까운 날짜의 데이터 사용
      if (processedData.length > 0) {
        // 날짜 차이가 가장 작은 데이터 찾기
        const selectedDateObj = new Date(selectedDate);
        let closestData = processedData[0];
        let minDiff = Infinity;

        processedData.forEach((item) => {
          const year = parseInt(item.date.substring(0, 4));
          const month = parseInt(item.date.substring(4, 6)) - 1;
          const day = parseInt(item.date.substring(6, 8));
          const itemDate = new Date(year, month, day);
          const diff = Math.abs(selectedDateObj.getTime() - itemDate.getTime());

          if (diff < minDiff) {
            minDiff = diff;
            closestData = item;
          }
        });

        setSelectedWeather(closestData);
      } else {
        setSelectedWeather(null);
      }
    }
  }, [selectedDate, processedData]);

  // 날짜가 변경될 때 로그 출력
  useEffect(() => {
  }, [selectedDate]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
        <Text style={styles.loadingText}>☀️날씨 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 표시
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          날씨 정보를 불러오는데 실패했습니다.
        </Text>
        <Text style={styles.errorDetail}>{error?.toString()}</Text>
      </View>
    );
  }

  // 데이터가 없는 경우
  if (!processedData || processedData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>날씨 정보가 없습니다.</Text>
        <Text style={styles.errorDetail}>잠시 후 다시 시도해주세요.</Text>
      </View>
    );
  }

  // 선택된 날씨 데이터가 없는 경우
  if (!selectedWeather) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          선택한 날짜의 날씨 정보를 찾을 수 없습니다.
        </Text>
        <Text style={styles.errorDetail}>
          다른 날짜를 선택하거나 새로고침을 시도해보세요.
        </Text>
      </View>
    );
  }

  // 최저/최고 온도 계산
  const minTemp =
    selectedWeather?.minTemp !== null && selectedWeather?.minTemp !== undefined
      ? Math.round(Number(selectedWeather.minTemp) * 10) / 10
      : null;

  const maxTemp =
    selectedWeather?.maxTemp !== null && selectedWeather?.maxTemp !== undefined
      ? Math.round(Number(selectedWeather.maxTemp) * 10) / 10
      : null;

  // TMN/TMX 값 (참고용)
  const tmnValue =
    selectedWeather?.tmnValue !== null &&
    selectedWeather?.tmnValue !== undefined
      ? Math.round(Number(selectedWeather.tmnValue) * 10) / 10
      : null;

  const tmxValue =
    selectedWeather?.tmxValue !== null &&
    selectedWeather?.tmxValue !== undefined
      ? Math.round(Number(selectedWeather.tmxValue) * 10) / 10
      : null;

  // 온도 정보 로그
  console.log("온도 정보:", {
    날짜: selectedWeather.date,
    "TMP 기반 최저기온": minTemp,
    "TMP 기반 최고기온": maxTemp,
    "TMN 값(참고)": tmnValue,
    "TMX 값(참고)": tmxValue,
  });

  // 강수확률
  const pop =
    selectedWeather?.pop !== null && selectedWeather?.pop !== undefined
      ? Number(selectedWeather.pop)
      : null;



  // 현재 날씨 아이콘 결정
  let currentWeatherIcon = "";
  let weatherDescription = "";

  if (selectedWeather?.pty && selectedWeather.pty !== "0") {
    currentWeatherIcon =
      weatherIcons.PTY[selectedWeather.pty as keyof typeof weatherIcons.PTY] ||
      "";

    // 강수형태에 따른 설명
    switch (selectedWeather.pty) {
      case "1":
        weatherDescription = "비";
        break;
      case "2":
        weatherDescription = "비/눈";
        break;
      case "3":
        weatherDescription = "눈";
        break;
      case "4":
        weatherDescription = "소나기";
        break;
      case "5":
        weatherDescription = "빗방울";
        break;
      case "6":
        weatherDescription = "빗방울눈날림";
        break;
      case "7":
        weatherDescription = "눈날림";
        break;
      default:
        weatherDescription = "없음";
    }
  } else if (selectedWeather?.sky) {
    currentWeatherIcon =
      weatherIcons.SKY[selectedWeather.sky as keyof typeof weatherIcons.SKY] ||
      "";

    // 하늘상태에 따른 설명
    switch (selectedWeather.sky) {
      case "1":
        weatherDescription = "맑음";
        break;
      case "3":
        weatherDescription = "구름많음";
        break;
      case "4":
        weatherDescription = "흐림";
        break;
      default:
        weatherDescription = "알 수 없음";
    }
  }

  // 온도 데이터 안전하게 처리
  const currentTemp =
    selectedWeather?.temp !== null && selectedWeather?.temp !== undefined
      ? Math.round(Number(selectedWeather.temp) * 10) / 10
      : selectedWeather?._TMP
      ? Math.round(Number(selectedWeather._TMP) * 10) / 10
      : null;



  // 일별 데이터 생성 (캠핑 팁용)
  const dailyData: DailyWeatherData = {
    date: selectedWeather.date,
    dayOfWeek: new Date(selectedWeather.date).toLocaleDateString("ko-KR", {
      weekday: "short",
    }),
    minTemp: selectedWeather.minTemp,
    maxTemp: selectedWeather.maxTemp,
    sky: selectedWeather.sky,
    pty: selectedWeather.pty,
    pop: selectedWeather.pop,
    pcpCategory: selectedWeather.pcpCategory,
    pcpText: selectedWeather.pcpText,
    pcpValue: selectedWeather.pcpValue,
    snoCategory: selectedWeather.snoCategory,
    snoText: selectedWeather.snoText,
    snoValue: selectedWeather.snoValue,
    maxPcpValue: selectedWeather.maxPcpValue,
    maxPcpCategory: selectedWeather.pcpCategory,
    maxPcpText: selectedWeather.pcpText,
    maxSnoValue: selectedWeather.maxSnoValue,
    maxSnoCategory: selectedWeather.snoCategory,
    maxSnoText: selectedWeather.snoText,
    wsd: selectedWeather.wsd,
    hourlyData: [selectedWeather],
  };

  // 날씨 아이콘 경로 가져오기
  const getWeatherIconPath = (iconName: string) => {
    // 이미지 파일이 assets/weather 폴더에 있다고 가정
    return `../assets/weather/${iconName}`;
  };

  const getWeatherIcon = (sky: string | null, pty: string | null) => {
    if (pty === "1") return "weather_rain"; // 비
    if (pty === "2") return "weather_rain_snow"; // 비/눈
    if (pty === "3") return "weather_snow"; // 눈
    if (pty === "4") return "weather_shower"; // 소나기
    if (pty === "5") return "weather_drizzle"; // 빗방울
    if (pty === "6") return "weather_drizzle_snow"; // 빗방울눈날림
    if (pty === "7") return "weather_snow_flurry"; // 눈날림

    // SKY 코드 기반 (맑음(1), 구름많음(3), 흐림(4))
    if (sky === "1") return "weather_sunny";
    if (sky === "3") return "weather_partly_cloudy";
    if (sky === "4") return "weather_cloudy";

    return "weather_unknown";
  };

  const getPrecipMessage = (
    pcp: string | null | number,
    sno: string | null | number,
    pop: string | null | number
  ) => {
    let message = "";

    // 강수량 메시지
    const pcpStr = pcp?.toString() || "0.0";
    if (pcpStr !== "강수없음" && pcpStr !== "0.0") {
      const pcpValue = parseFloat(pcpStr);
      if (pcpValue < 1.0) {
        message += "1mm 미만의 비가 예상됩니다. ";
      } else if (pcpValue < 30.0) {
        message += `${pcpStr}mm의 비가 예상됩니다. `;
      } else if (pcpValue < 50.0) {
        message += "30.0~50.0mm의 비가 예상됩니다. ";
      } else {
        message += "50.0mm 이상의 강한 비가 예상됩니다. ";
      }
    }

    // 적설량 메시지
    const snoStr = sno?.toString() || "0.0";
    if (snoStr !== "적설없음" && snoStr !== "0.0") {
      const snoValue = parseFloat(snoStr);
      if (snoValue < 0.5) {
        message += "0.5cm 미만의 눈이 예상됩니다. ";
      } else if (snoValue < 5.0) {
        message += `${snoStr}cm의 눈이 예상됩니다. `;
      } else {
        message += "5.0cm 이상의 많은 눈이 예상됩니다. ";
      }
    }

    // 강수확률 메시지
    const popValue = pop?.toString() || "0";
    if (parseInt(popValue) > 0) {
      message += `강수확률은 ${popValue}%입니다.`;
    }

    return message || "강수 예상 없음";
  };

  const weatherIcon = getWeatherIcon(selectedWeather.sky, selectedWeather.pty);
  const precipMessage = getPrecipMessage(
    selectedWeather.pcp,
    selectedWeather.sno,
    selectedWeather.pop
  );

  // 날씨 아이콘 텍스트 표시
  const getWeatherIconText = (iconName: string) => {
    switch (iconName) {
      case "weather_sunny": return "☀️";
      case "weather_partly_cloudy": return "⛅";
      case "weather_cloudy": return "☁️";
      case "weather_rain": return "🌧️";
      case "weather_rain_snow": return "🌨️";
      case "weather_snow": return "❄️";
      case "weather_shower": return "☔";
      case "weather_drizzle": return "🌦️";
      case "weather_drizzle_snow": return "🌨️";
      case "weather_snow_flurry": return "❄️";
      default: return "❓";
    }
  };

  // 날씨 아이콘 이미지 가져오기
  const getWeatherIconImage = (iconName: string) => {
    return weatherIconImages[iconName as keyof typeof weatherIconImages] || weatherIconImages.weather_unknown;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["#1890ff"]}
        />
      }
    >
      {/* 현재 날씨 요약 */}
      <View style={styles.currentWeatherContainer}>
        <Image 
          source={getWeatherIconImage(weatherIcon)} 
          style={styles.weatherIconImage} 
        />
            <View style={styles.popContainer}>
             {/* 강수확률 */}
             {pop !== null && !isNaN(pop) && (
            <View style={styles.rainProbabilityContainer}>
              <Text style={styles.rainProbabilityLabel}>강수확률</Text>
              <Text style={styles.rainProbabilityValue}>{Math.round(pop)}%</Text>
            </View>
          )}
          </View>
        <View style={styles.currentWeatherInfo}>
    
          {/* 온도 정보 (최고/최저 온도를 나란히 배치) */}
          <View style={styles.tempContainer}>
      
            {maxTemp !== null && (
              <View style={styles.tempItem}>
                <Text style={styles.tempLabel}>최고</Text>
                <Text style={styles.maxTempLarge}>{maxTemp}°C</Text>
              </View>
            )}
            {minTemp !== null && (
              <View style={styles.tempItem}>
                <Text style={styles.tempLabel}>최저</Text>
                <Text style={styles.minTempLarge}>{minTemp}°C</Text>
              </View>
            )}
          </View>

       
        </View>
      </View>

     

      {/* 캠핑 팁 */}
      <View style={styles.tipsContainer}>
        <CampingTips dayData={dailyData} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff4d4f",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
  },
  locationContainer: {
    padding: 15,
    backgroundColor: Colors.whitebox,
    borderRadius: 8,
    margin: 16,

  },
  locationName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  popContainer:{
    flexDirection: "row",
    justifyContent : "space-between",
    alignItems: "center",
  },
  currentWeatherContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: Colors.whitebox,
    borderRadius: 10,
    marginHorizontal: 15,
  
  },
  currentWeatherIcon: {
    fontSize: 48,
  },
  weatherIconImage: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  currentWeatherInfo: {
    flex: 1,
  },
  tempContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "center",
  },
  tempItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  tempLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  maxTempLarge: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? "SUIT-heavy" : "SUIT-Bold",
    color: "#ff4d4f",
  },
  minTempLarge: {
    fontSize: 32,
    fontFamily: Platform.OS === 'ios' ? "SUIT-heavy" : "SUIT-Bold",
    color: "#1890ff",
  },
  rainProbability: {
    fontSize: 12,
    color: Colors.gary500,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? "SUIT-regular" : "SUIT-Regular",
    marginHorizontal: 10,
  },
  rainProbabilityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  rainProbabilityLabel: {
    fontSize: 12,
    color: Colors.gary500,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? "SUIT-regular" : "SUIT-Regular",
    marginBottom: 2,
  },
  rainProbabilityValue: {
    fontSize: 16,
    color: Colors.gary500,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? "SUIT-medium" : "SUIT-Medium",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tipsContainer: {
    marginBottom: 15,
  },
  weatherDescription: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  weeklyForecastContainer: {
    marginBottom: 16,
  },
});

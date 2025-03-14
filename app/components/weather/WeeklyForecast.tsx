import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchMidForecastCombined, MID_FORECAST_REGION_CODES } from '../../../api/midTermForecast';
import { useLocationStore } from '../../stores/locationStore';
import { IconSymbol } from '../../../components/ui/IconSymbol';
import { weeklyForecastIcons } from '../../constants/campingTipIcons';
import { Colors } from '@/constants/Colors';

interface WeeklyForecastProps {
  landRegId?: string;
  taRegId?: string;
  nx?: number;
  ny?: number;
}

interface WeatherData {
  weather: string;
  rainProb: string;
  temperature: {
    min: string;
    max: string;
  };
  am?: {
    weather: string;
    rainProb: string;
  };
  pm?: {
    weather: string;
    rainProb: string;
  };
  day: number;
}

// 날씨 상태에 따른 아이콘 매핑 (IconSymbol 컴포넌트용 - 백업)
const symbolIcons: { [key: string]: string } = {
  '맑음': 'sun.max.fill',
  '구름많음': 'cloud.sun.fill',
  '구름많고 비': 'cloud.rain.fill',
  '구름많고 눈': 'cloud.snow.fill',
  '구름많고 비/눈': 'cloud.sleet.fill',
  '구름많고 소나기': 'cloud.heavyrain.fill',
  '흐림': 'cloud.fill',
  '흐리고 비': 'cloud.rain.fill',
  '흐리고 눈': 'cloud.snow.fill',
  '흐리고 비/눈': 'cloud.sleet.fill',
  '흐리고 소나기': 'cloud.heavyrain.fill',
  '소나기': 'cloud.heavyrain.fill',
};

// 날짜 포맷팅 함수
const formatDate = (daysToAdd: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  
  return `${month}/${day}(${weekday})`;
};

// 날씨 아이콘 가져오기 함수
const getWeatherIcon = (weather: string) => {
  // @ts-ignore - 타입 오류 무시
  return weeklyForecastIcons[weather] || null;
};

const getSymbolIcon = (weather: string) => {
  return symbolIcons[weather] || 'cloud.fill';
};

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ landRegId, taRegId, nx, ny }) => {
  // 위치 정보 가져오기
  const { selectedLocation } = useLocationStore();
  
  // 지역 코드 매핑 (실제 앱에서는 위치 정보에 따라 적절한 지역 코드 선택 로직 필요)
  const [regionCodes, setRegionCodes] = useState({
    landRegId: landRegId || MID_FORECAST_REGION_CODES.LAND['서울, 인천, 경기도'],
    taRegId: taRegId || MID_FORECAST_REGION_CODES.TEMPERATURE['서울']
  });
  
  // 위치 정보에 따라 지역 코드 업데이트
  useEffect(() => {
    if (landRegId && taRegId) {
      setRegionCodes({
        landRegId,
        taRegId
      });
    } else if (selectedLocation) {
      // 여기서는 간단한 예시로 서울 지역 코드를 사용
      // 실제 앱에서는 위치 정보에 따라 적절한 지역 코드 매핑 로직 구현 필요
      setRegionCodes({
        landRegId: MID_FORECAST_REGION_CODES.LAND['서울, 인천, 경기도'],
        taRegId: MID_FORECAST_REGION_CODES.TEMPERATURE['서울']
      });
    }
  }, [selectedLocation, landRegId, taRegId]);
  
  // 중기예보 데이터 가져오기
  const { data: weeklyForecast, isLoading, error, refetch } = useQuery({
    queryKey: ['weeklyForecast', regionCodes.landRegId, regionCodes.taRegId, nx, ny],
    queryFn: () => fetchMidForecastCombined(regionCodes.landRegId, regionCodes.taRegId, nx, ny),
    staleTime: 1000 * 60 * 60, // 1시간 동안 데이터 유지
    refetchInterval: 1000 * 60 * 60, // 1시간마다 자동 갱신
    retry: 3, // 실패 시 3번 재시도
    retryDelay: 1000, // 재시도 간격 1초
  });
  
  // 컴포넌트 마운트 시 데이터 다시 가져오기
  useEffect(() => {
    console.log('WeeklyForecast 컴포넌트 마운트: 데이터 새로고침');
    refetch();
  }, [refetch]);
  
  // 좌표 변경 시 데이터 다시 가져오기
  useEffect(() => {
    if (nx && ny) {
      console.log(`좌표 변경 감지: nx=${nx}, ny=${ny}, 데이터 새로고침`);
      refetch();
    }
  }, [nx, ny, refetch]);
  
  // 로딩 중 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>주간 예보를 불러오는 중...</Text>
      </View>
    );
  }
  
  // 에러 표시
  if (error) {
    console.error('주간 예보 로딩 오류:', error);
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#ff0000" />
        <Text style={styles.errorText}>주간 예보를 불러오는데 실패했습니다.</Text>
      </View>
    );
  }
  
  // 데이터가 없는 경우
  if (!weeklyForecast || !weeklyForecast.forecast || weeklyForecast.forecast.length === 0) {
    console.error('주간 예보 데이터 없음');
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#ff0000" />
        <Text style={styles.errorText}>주간 예보 데이터가 없습니다.</Text>
      </View>
    );
  }
  
  // 날짜별 데이터 로깅
  console.log('주간 예보 데이터 요약:');
  weeklyForecast.forecast.forEach((day: any) => {
    if (day) {
      const date = new Date();
      date.setDate(date.getDate() + day.day);
      console.log(`${date.getMonth() + 1}/${date.getDate()} (${day.day}일 후): 최저=${day.temperature?.min}°, 최고=${day.temperature?.max}°`);
    }
  });
  
  // 유효한 데이터만 필터링
  const validForecasts = weeklyForecast.forecast.filter((day: any) => day !== null);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 예보</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {/* @ts-ignore - 타입 오류 무시 (null 값 처리를 위해) */}
        {validForecasts.map((day: WeatherData) => {
          // 오전/오후 날씨가 있는 경우 (4-7일)
          if (day.am && day.pm) {
            return (
              <View key={`day-${day.day}`} style={styles.dayCard}>
                <Text style={styles.dateText}>{formatDate(day.day)}</Text>
                
                {/* 오전/오후 날씨를 가로로 배치 */}
                <View style={styles.amPmContainer}>
                  {/* 오전 날씨 */}
                  <View style={styles.halfDay}>
                    <Text style={styles.timeText}>오전</Text>
                    <View style={styles.weatherIconContainer}>
                      {getWeatherIcon(day.am.weather) ? (
                        <Image 
                          source={getWeatherIcon(day.am.weather)} 
                          style={styles.weatherIcon} 
                        />
                      ) : (
                        <IconSymbol 
                          // @ts-ignore - 타입 오류 무시 (아이콘 이름 타입 호환성)
                          name={getSymbolIcon(day.am.weather)} 
                          size={24} 
                          color="#333333" 
                        />
                      )}
                    </View>
                    <Text style={styles.rainProbText}>{day.am.rainProb}%</Text>
                  </View>
                  
                  {/* 오후 날씨 */}
                  <View style={styles.halfDay}>
                    <Text style={styles.timeText}>오후</Text>
                    <View style={styles.weatherIconContainer}>
                      {getWeatherIcon(day.pm.weather) ? (
                        <Image 
                          source={getWeatherIcon(day.pm.weather)} 
                          style={styles.weatherIcon} 
                        />
                      ) : (
                        <IconSymbol 
                          // @ts-ignore - 타입 오류 무시 (아이콘 이름 타입 호환성)
                          name={getSymbolIcon(day.pm.weather)} 
                          size={24} 
                          color="#333333" 
                        />
                      )}
                    </View>
                    <Text style={styles.rainProbText}>{day.pm.rainProb}%</Text>
                  </View>
                </View>
                
                {/* 기온 */}
                <View style={styles.temperatureContainer}>
                  <Text style={styles.maxTempText}>{day.temperature.max}°</Text>
                  <Text style={styles.minTempText}>{day.temperature.min}°</Text>
                </View>
              </View>
            );
          } 
          // 하루 전체 날씨만 있는 경우 (3일, 8-10일)
          else {
            return (
              <View key={`day-${day.day}`} style={styles.dayCard}>
                <Text style={styles.dateText}>{formatDate(day.day)}</Text>
                
                {/* 전체 날씨 */}
                <View style={styles.fullDay}>
                  <View style={styles.amPmContainer}>
                    <View style={styles.halfDay}>
                      <View style={styles.weatherIconContainer}>
                        {getWeatherIcon(day.weather) ? (
                          <Image 
                            source={getWeatherIcon(day.weather)} 
                            style={styles.weatherIcon} 
                          />
                        ) : (
                          <IconSymbol 
                            // @ts-ignore - 타입 오류 무시 (아이콘 이름 타입 호환성)
                            name={getSymbolIcon(day.weather)} 
                            size={24} 
                            color="#333333" 
                          />
                        )}
                      </View>
                      <Text style={styles.rainProbText}>{day.rainProb}%</Text>
                    </View>
                    {day.day >= 8 && (
                      <View style={styles.halfDay}>
                        <View style={styles.weatherIconContainer}>
                          {getWeatherIcon(day.weather) ? (
                            <Image 
                              source={getWeatherIcon(day.weather)} 
                              style={styles.weatherIcon} 
                            />
                          ) : (
                            <IconSymbol 
                              // @ts-ignore - 타입 오류 무시 (아이콘 이름 타입 호환성)
                              name={getSymbolIcon(day.weather)} 
                              size={24} 
                              color="#333333" 
                            />
                          )}
                        </View>
                        <Text style={styles.rainProbText}>{day.rainProb}%</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* 기온 */}
                  <View style={styles.temperatureContainer}>
                    <Text style={styles.maxTempText}>{day.temperature.max}°</Text>
                    <Text style={styles.minTempText}>{day.temperature.min}°</Text>
                  </View>
                </View>
              </View>
            );
          }
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whitebox,
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
   
  },
  title: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? "SUIT-bold" : "SUIT-Bold",
  },
  scrollView: {
    flexDirection: 'row',
  },
  dayCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? "SUIT-Medium" : "SUIT-Medium",
  },
  halfDay: {
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
  },
  fullDay: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? "SUIT-Regular" : "SUIT-Regular",
  },
  weatherIconContainer: {
    marginVertical: 5,
  },
  weatherIcon: {
    width: 30,
    height: 30,
  },
  weatherText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? "SUIT-Regular" : "SUIT-Regular",
  },
  rainProbText: {
    fontSize: 12,
    color: '#1890ff',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? "SUIT-Regular" : "SUIT-Regular",
  },
  temperatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    gap: 10,
  },
  maxTempText: {
    fontSize: 15,
    color: '#ff4d4f',
    fontFamily: Platform.OS === 'ios' ? "SUIT-Medium" : "SUIT-Medium",
  },
  minTempText: {
    fontSize: 15,
    color: '#1890ff',
    fontFamily: Platform.OS === 'ios' ? "SUIT-Medium" : "SUIT-Medium",
  },
  loadingContainer: {
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? "SUIT-Regular" : "SUIT-Regular",
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#ff4d4f',
    fontFamily: Platform.OS === 'ios' ? "SUIT-Regular" : "SUIT-Regular",
  },
  amPmContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
  },
  longTermWeatherIconContainer: {
    marginVertical: 8,
  },
  longTermWeatherIcon: {
    width: 35,
    height: 35,
  },
  longTermRainProbText: {
    fontSize: 13,
    marginTop: 4,
  },
  longTermTemperatureContainer: {
    marginTop: 6,
  },
});

export default WeeklyForecast; 
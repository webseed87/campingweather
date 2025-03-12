import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchMidForecastCombined, MID_FORECAST_REGION_CODES } from '../../../api/midTermForecast';
import { useLocationStore } from '../../stores/locationStore';
import { IconSymbol } from '../../../components/ui/IconSymbol';

interface WeeklyForecastProps {
  // 필요한 props가 있다면 여기에 추가
}

// 날씨 상태에 따른 아이콘 매핑
const weatherIcons: { [key: string]: any } = {
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

// 날씨 상태에 따른 배경색 매핑
const weatherColors: { [key: string]: string } = {
  '맑음': '#f9d71c',
  '구름많음': '#b5cde3',
  '구름많고 비': '#8aa9c1',
  '구름많고 눈': '#e0e0e0',
  '구름많고 비/눈': '#c0c0c0',
  '구름많고 소나기': '#7a9cb3',
  '흐림': '#a0a0a0',
  '흐리고 비': '#7a9cb3',
  '흐리고 눈': '#d0d0d0',
  '흐리고 비/눈': '#b0b0b0',
  '흐리고 소나기': '#6a8ca3',
  '소나기': '#6a8ca3',
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

export const WeeklyForecast: React.FC<WeeklyForecastProps> = () => {
  // 위치 정보 가져오기
  const { selectedLocation } = useLocationStore();
  
  // 지역 코드 매핑 (실제 앱에서는 위치 정보에 따라 적절한 지역 코드 선택 로직 필요)
  const [regionCodes, setRegionCodes] = useState({
    landRegId: MID_FORECAST_REGION_CODES.LAND['서울, 인천, 경기도'],
    taRegId: MID_FORECAST_REGION_CODES.TEMPERATURE['서울']
  });
  
  // 위치 정보에 따라 지역 코드 업데이트
  useEffect(() => {
    if (selectedLocation) {
      // 여기서는 간단한 예시로 서울 지역 코드를 사용
      // 실제 앱에서는 위치 정보에 따라 적절한 지역 코드 매핑 로직 구현 필요
      setRegionCodes({
        landRegId: MID_FORECAST_REGION_CODES.LAND['서울, 인천, 경기도'],
        taRegId: MID_FORECAST_REGION_CODES.TEMPERATURE['서울']
      });
    }
  }, [selectedLocation]);
  
  // 중기예보 데이터 가져오기
  const { data: weeklyForecast, isLoading, error } = useQuery({
    queryKey: ['weeklyForecast', regionCodes.landRegId, regionCodes.taRegId],
    queryFn: () => fetchMidForecastCombined(regionCodes.landRegId, regionCodes.taRegId),
    staleTime: 1000 * 60 * 60, // 1시간 동안 데이터 유지
    refetchInterval: 1000 * 60 * 60, // 1시간마다 자동 갱신
  });
  
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
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#ff0000" />
        <Text style={styles.errorText}>주간 예보를 불러오는데 실패했습니다.</Text>
      </View>
    );
  }
  
  // 데이터가 없는 경우
  if (!weeklyForecast || !weeklyForecast.forecast || weeklyForecast.forecast.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#ff0000" />
        <Text style={styles.errorText}>주간 예보 데이터가 없습니다.</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 예보</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {weeklyForecast.forecast.map((day: any) => {
          // 오전/오후 날씨가 있는 경우 (4-7일)
          if (day.am && day.pm) {
            return (
              <View key={`day-${day.day}`} style={styles.dayCard}>
                <Text style={styles.dateText}>{formatDate(day.day)}</Text>
                
                {/* 오전 날씨 */}
                <View style={styles.halfDay}>
                  <Text style={styles.timeText}>오전</Text>
                  <View style={[
                    styles.weatherIconContainer, 
                    { backgroundColor: weatherColors[day.am.weather] || '#b5cde3' }
                  ]}>
                    <IconSymbol 
                      name={weatherIcons[day.am.weather] || 'cloud.fill'} 
                      size={24} 
                      color="#ffffff" 
                    />
                  </View>
                  <Text style={styles.weatherText}>{day.am.weather}</Text>
                  <Text style={styles.rainProbText}>{day.am.rainProb}%</Text>
                </View>
                
                {/* 오후 날씨 */}
                <View style={styles.halfDay}>
                  <Text style={styles.timeText}>오후</Text>
                  <View style={[
                    styles.weatherIconContainer, 
                    { backgroundColor: weatherColors[day.pm.weather] || '#b5cde3' }
                  ]}>
                    <IconSymbol 
                      name={weatherIcons[day.pm.weather] || 'cloud.fill'} 
                      size={24} 
                      color="#ffffff" 
                    />
                  </View>
                  <Text style={styles.weatherText}>{day.pm.weather}</Text>
                  <Text style={styles.rainProbText}>{day.pm.rainProb}%</Text>
                </View>
                
                {/* 기온 */}
                <View style={styles.temperatureContainer}>
                  <Text style={styles.maxTempText}>{day.temperature.max}°</Text>
                  <Text style={styles.minTempText}>{day.temperature.min}°</Text>
                </View>
              </View>
            );
          } 
          // 하루 전체 날씨만 있는 경우 (8-10일)
          else {
            return (
              <View key={`day-${day.day}`} style={styles.dayCard}>
                <Text style={styles.dateText}>{formatDate(day.day)}</Text>
                
                {/* 전체 날씨 */}
                <View style={styles.fullDay}>
                  <View style={[
                    styles.weatherIconContainer, 
                    { backgroundColor: weatherColors[day.weather] || '#b5cde3' }
                  ]}>
                    <IconSymbol 
                      name={weatherIcons[day.weather] || 'cloud.fill'} 
                      size={24} 
                      color="#ffffff" 
                    />
                  </View>
                  <Text style={styles.weatherText}>{day.weather}</Text>
                  <Text style={styles.rainProbText}>{day.rainProb}%</Text>
                </View>
                
                {/* 기온 */}
                <View style={styles.temperatureContainer}>
                  <Text style={styles.maxTempText}>{day.temperature.max}°</Text>
                  <Text style={styles.minTempText}>{day.temperature.min}°</Text>
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollView: {
    flexDirection: 'row',
  },
  dayCard: {
    width: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  halfDay: {
    alignItems: 'center',
    marginBottom: 8,
  },
  fullDay: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timeText: {
    fontSize: 12,
    marginBottom: 4,
  },
  weatherIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  weatherText: {
    fontSize: 12,
    marginTop: 4,
  },
  rainProbText: {
    fontSize: 12,
    color: '#4a90e2',
  },
  temperatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  maxTempText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  minTempText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#e74c3c',
  },
});

export default WeeklyForecast; 
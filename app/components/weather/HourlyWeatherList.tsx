import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProcessedWeatherData } from '../../types/weather';
import weatherIcons from '../../constants/weatherIcons';

interface HourlyWeatherListProps {
  hourlyData: ProcessedWeatherData[];
}

export const HourlyWeatherList: React.FC<HourlyWeatherListProps> = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>시간별 날씨 정보가 없습니다.</Text>
      </View>
    );
  }

  // 시간 포맷팅 함수
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    // 시간 형식이 "0900"과 같은 경우 "09:00"으로 변환
    if (timeStr.length === 4) {
      return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
    }
    return timeStr;
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {hourlyData.map((item, index) => {
        // 날씨 아이콘 결정 (강수 형태 우선, 그 다음 하늘 상태)
        let weatherIcon = '';
        if (item.pty && item.pty !== '0') {
          weatherIcon = weatherIcons.PTY[item.pty as keyof typeof weatherIcons.PTY] || '';
        } else if (item.sky) {
          weatherIcon = weatherIcons.SKY[item.sky as keyof typeof weatherIcons.SKY] || '';
        }

        return (
          <View key={index} style={styles.hourlyItem}>
            <Text style={styles.timeText}>{formatTime(item.time)}</Text>
            <Text style={styles.weatherIcon}>{weatherIcon}</Text>
            {item.temp !== null && (
              <Text style={styles.tempText}>{item.temp}°</Text>
            )}
            {item.pop !== null && (
              <Text style={styles.popText}>{item.pop}%</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  hourlyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 60,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weatherIcon: {
    fontSize: 24,
    marginVertical: 4,
  },
  tempText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  popText: {
    fontSize: 12,
    color: '#1890ff',
  },
  noDataContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
  },
});

export default HourlyWeatherList; 
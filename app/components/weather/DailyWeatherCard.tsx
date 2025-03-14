import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DailyWeatherData } from '../../types/weather';
import weatherIcons from '../../constants/weatherIcons';

interface DailyWeatherCardProps {
  dayData: DailyWeatherData;
  isSelected: boolean;
  onSelect: () => void;
}

export const DailyWeatherCard: React.FC<DailyWeatherCardProps> = ({ 
  dayData, 
  isSelected, 
  onSelect 
}) => {
  if (!dayData) return null;
  
  const { date, dayOfWeek, minTemp, maxTemp, sky, pty, pop } = dayData;
  
  // 날씨 아이콘 결정 (강수 형태 우선, 그 다음 하늘 상태)
  let weatherIcon = '';
  if (pty && pty !== '0') {
    weatherIcon = weatherIcons.PTY[pty as keyof typeof weatherIcons.PTY] || '';
  } else if (sky) {
    weatherIcon = weatherIcons.SKY[sky as keyof typeof weatherIcons.SKY] || '';
  }
  
  // 강수 확률 표시 여부 결정
  const showPop = pop !== null && pop > 0;
  
  return (
    <TouchableOpacity 
      style={[styles.dayCard, isSelected && styles.selectedDayCard]} 
      onPress={onSelect}
    >
      <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
      <Text style={styles.weatherIcon}>{weatherIcon}</Text>
      <View style={styles.tempContainer}>
        {maxTemp !== null && (
          <Text style={styles.maxTemp}>{maxTemp}°</Text>
        )}
        {minTemp !== null && (
          <Text style={styles.minTemp}>{minTemp}°</Text>
        )}
      </View>
      {showPop && (
        <View style={styles.popContainer}>
          <Text style={styles.popIcon}>💧</Text>
          <Text style={styles.rainProbability}>{pop}%</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayCard: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 70,

  },
  selectedDayCard: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
    borderWidth: 1,
  },
  dayOfWeek: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weatherIcon: {
    fontSize: 24,
    marginVertical: 4,
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginVertical: 4,
  },
  maxTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4d4f',
  },
  minTemp: {
    fontSize: 14,
    color: '#1890ff',
  },
  popContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  popIcon: {
    fontSize: 12,
    marginRight: 2,
    color: '#1890ff',
  },
  rainProbability: {
    fontSize: 12,
    color: '#1890ff',
  },
});

export default DailyWeatherCard; 
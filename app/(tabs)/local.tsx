import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import WeatherForecast from '../components/WeatherForecast';
import LocationSelector from '../components/LocationSelector';

interface SelectedLocation {
  name: string;
  nx: number;
  ny: number;
  date: string;
}

export default function HomeScreen() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [showWeather, setShowWeather] = useState<boolean>(false);
  
  // 이전 포커스 상태를 추적하기 위한 ref
  const prevFocusedRef = useRef<boolean>(true);

  // 홈 탭이 다시 포커스를 받을 때 상태 초기화
  useFocusEffect(
    useCallback(() => {
      // 처음 마운트될 때는 초기화하지 않음
      if (prevFocusedRef.current === false) {
        console.log('홈 탭 다시 포커스, 상태 초기화');
        setSelectedLocation(null);
        setShowWeather(false);
      }
      
      // 포커스 상태 업데이트
      prevFocusedRef.current = true;
      
      // 언마운트될 때 포커스 상태 업데이트
      return () => {
        prevFocusedRef.current = false;
      };
    }, [])
  );

  const handleLocationSelected = (location: string, nx: number, ny: number, date: string) => {
    console.log('지역 선택 완료:', location, nx, ny, date);
    setSelectedLocation({
      name: location,
      nx,
      ny,
      date
    });
    setShowWeather(true);
  };
  
  // 홈으로 돌아가기 (모든 선택 초기화)
  const handleGoHome = () => {
    setSelectedLocation(null);
    setShowWeather(false);
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/winter_bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>지역 날씨</Text>
          <Text style={styles.subtitle}>지역을 선택하고 날씨를 확인하세요</Text>
          {showWeather && (
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={handleGoHome}
            >
              <Text style={styles.homeButtonText}>처음으로</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {!showWeather ? (
          <View style={styles.content}>
            <LocationSelector onLocationSelected={handleLocationSelected} />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{selectedLocation?.name}</Text>
              <Text style={styles.locationDate}>{
                selectedLocation?.date ? 
                new Date(selectedLocation.date).toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                }) : ''
              }</Text>
            </View>
            <WeatherForecast 
              nx={selectedLocation?.nx || 0} 
              ny={selectedLocation?.ny || 0} 
              locationName={selectedLocation?.name || ''}
              selectedDate={selectedLocation?.date || ''} 
            />
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // 완전 투명 배경으로 변경
  },
  header: {
    padding: 15,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#e6f0ff',
    marginTop: 4,
  },
  homeButton: {
    position: 'absolute',
    right: 15,
    top: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  locationInfo: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationDate: {
    fontSize: 14,
    color: '#999',
  },
});

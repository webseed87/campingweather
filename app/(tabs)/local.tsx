import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import WeatherForecast from '../components/WeatherForecast';
import LocationSelector from '../components/LocationSelector';
import SeasonalBackground from '../components/SeasonalBackground';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SeasonalBackground>
      <SafeAreaView style={styles.container}>
      
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
               {showWeather && (
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={handleGoHome}
            >
              <Text style={styles.homeButtonText}>처음으로</Text>
            </TouchableOpacity>
          )}
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
    </SeasonalBackground>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  homeButton: {
    position: "absolute",
    right: 15,
    top: 25,
    backgroundColor: Colors.blue200,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  homeButtonText: {
    fontSize: 13,
    color: Colors.white,
    fontFamily: "SUIT-regular",
  },
  content: {
    flex: 1,
  },
  locationInfo: {
    padding: 16,
    backgroundColor: Colors.whitebox,
    marginBottom: 15,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 16,
   
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

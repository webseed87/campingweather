import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import locationsData from '../constants/locations.json';
import SimpleCalendar from './SimpleCalendar';

interface StepByStepLocationProps {
  onComplete: (location: string, nx: number, ny: number, date: string) => void;
}

interface LocationItem {
  city: string;
  district: string;
  neighborhood: string;
  nx: number;
  ny: number;
  mapX: number;
  mapY: number;
}

const StepByStepLocation: React.FC<StepByStepLocationProps> = ({ onComplete }) => {
  // 선택 단계 (1: 시/도 선택, 2: 구/군 선택, 3: 동/읍/면 선택, 4: 날짜 선택)
  const [step, setStep] = useState<number>(1);
  
  // 선택된 값들
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // 시/도 목록
  const [cities, setCities] = useState<string[]>([]);
  // 구/군 목록
  const [districts, setDistricts] = useState<string[]>([]);
  // 동/읍/면 목록
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  
  // 컴포넌트 마운트 시 시/도 목록 가져오기
  useEffect(() => {
    console.log('locations.json 데이터 길이:', (locationsData as any[]).length);
    // 중복 제거하여 도시 목록 가져오기
    const cityList = [...new Set((locationsData as any[]).map(item => item.city))];
    console.log('시/도 목록:', cityList);
    console.log('시/도 개수:', cityList.length);
    setCities(cityList);
  }, []);
  
  // 시/도 선택 시 구/군 목록 가져오기
  useEffect(() => {
    if (selectedCity) {
      console.log('시/도 선택 변경:', selectedCity);
      // 선택된 도시에 해당하는 구/군 목록 가져오기
      const districtList = [...new Set(
        (locationsData as any[])
          .filter(item => item.city === selectedCity && item.district !== '')
          .map(item => item.district)
      )];
      console.log(`${selectedCity}의 구/군 목록:`, districtList);
      console.log('구/군 개수:', districtList.length);
      setDistricts(districtList);
      // 시/도가 변경되면 구/군과 동/읍/면 선택 초기화
      setSelectedDistrict('');
      setSelectedNeighborhood('');
    }
  }, [selectedCity]);
  
  // 구/군 선택 시 동/읍/면 목록 가져오기
  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      console.log('구/군 선택 변경:', selectedDistrict);
      // 선택된 도시와 구/군에 해당하는 동/읍/면 목록 가져오기
      const neighborhoodList = [...new Set(
        (locationsData as any[])
          .filter(item => item.city === selectedCity && item.district === selectedDistrict && item.neighborhood !== '')
          .map(item => item.neighborhood)
      )];
      console.log(`${selectedCity} ${selectedDistrict}의 동/읍/면 목록:`, neighborhoodList);
      console.log('동/읍/면 개수:', neighborhoodList.length);
      setNeighborhoods(neighborhoodList);
      // 구/군이 변경되면 동/읍/면 선택 초기화
      setSelectedNeighborhood('');
    }
  }, [selectedCity, selectedDistrict]);
  
  // 시/도 선택 핸들러
  const handleCitySelect = (city: string) => {
    console.log('시/도 선택:', city);
    setSelectedCity(city);
    setStep(2); // 다음 단계로 이동
  };
  
  // 구/군 선택 핸들러
  const handleDistrictSelect = (district: string) => {
    console.log('구/군 선택:', district);
    setSelectedDistrict(district);
    setStep(3); // 다음 단계로 이동
  };
  
  // 동/읍/면 선택 핸들러
  const handleNeighborhoodSelect = (neighborhood: string) => {
    console.log('동/읍/면 선택:', neighborhood);
    setSelectedNeighborhood(neighborhood);
    setStep(4); // 다음 단계로 이동
  };
  
  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    console.log('날짜 선택:', date);
    setSelectedDate(date);
    // 날짜 선택 후 바로 완료 콜백을 호출하지 않음
  };
  
  // 선택 완료 핸들러
  const handleComplete = () => {
    if (selectedCity && selectedDistrict && selectedNeighborhood && selectedDate) {
      // 선택된 지역의 nx, ny 값 가져오기
      const locationInfo = (locationsData as any[]).find(item => 
        item.city === selectedCity && 
        item.district === selectedDistrict && 
        item.neighborhood === selectedNeighborhood
      );
      
      if (locationInfo) {
        // 지역 이름에서 중복되는 부분 제거
        const locationName = `${selectedCity} ${selectedDistrict} ${selectedNeighborhood}`;
        onComplete(locationName, locationInfo.nx, locationInfo.ny, selectedDate);
      } else {
        console.error('선택한 지역 정보를 찾을 수 없습니다.');
      }
    }
  };
  
  // 이전 단계로 돌아가기
  const goBack = () => {
    if (step === 2) {
      setSelectedCity('');
      setStep(1);
    } else if (step === 3) {
      setSelectedDistrict('');
      setStep(2);
    } else if (step === 4) {
      setSelectedNeighborhood('');
      setStep(3);
    }
  };
  
  // 시/도 선택 화면
  const renderCitySelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>시/도 선택</Text>
      <FlatList
        data={cities}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemButton}
            onPress={() => handleCitySelect(item)}
          >
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        )}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
  
  // 구/군 선택 화면
  const renderDistrictSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>{selectedCity} 구/군 선택</Text>
      </View>
      
      {districts.length > 0 ? (
        <FlatList
          data={districts}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemButton}
              onPress={() => handleDistrictSelect(item)}
            >
              <Text style={styles.itemText}>{item}</Text>
            </TouchableOpacity>
          )}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>구/군 목록을 불러오는 중...</Text>
          <Text style={styles.emptySubText}>구/군 목록이 없으면 다른 시/도를 선택해보세요.</Text>
        </View>
      )}
    </View>
  );
  
  // 동/읍/면 선택 화면
  const renderNeighborhoodSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>{selectedCity} {selectedDistrict} 동/읍/면 선택</Text>
      </View>
      
      {neighborhoods.length > 0 ? (
        <FlatList
          data={neighborhoods}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemButton}
              onPress={() => handleNeighborhoodSelect(item)}
            >
              <Text style={styles.itemText}>{item}</Text>
            </TouchableOpacity>
          )}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>동/읍/면 목록을 불러오는 중...</Text>
          <Text style={styles.emptySubText}>동/읍/면 목록이 없으면 다른 구/군을 선택해보세요.</Text>
        </View>
      )}
    </View>
  );
  
  // 날짜 선택 화면
  const renderDateSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.stepTitle}>날짜 선택</Text>
      </View>
      <SimpleCalendar onDateSelect={handleDateSelect} />
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>선택한 정보</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>지역:</Text>
          <Text style={styles.summaryValue}>{selectedCity} {selectedDistrict} {selectedNeighborhood}</Text>
        </View>
        {selectedDate && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>날짜:</Text>
            <Text style={styles.summaryValue}>{selectedDate}</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.completeButton,
            !selectedDate && styles.disabledButton
          ]}
          onPress={handleComplete}
          disabled={!selectedDate}
        >
          <Text style={styles.completeButtonText}>날씨 확인하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // 현재 단계에 따라 화면 렌더링
  const renderCurrentStep = () => {
    switch(step) {
      case 1:
        return renderCitySelection();
      case 2:
        return renderDistrictSelection();
      case 3:
        return renderNeighborhoodSelection();
      case 4:
        return renderDateSelection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>현재 단계: {step}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  stepContainer: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4a90e2',
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    flex: 1,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  itemButton: {
    flex: 1,
    margin: 8,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 60,
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 3,
    borderRadius: 3,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
  },
});

export default StepByStepLocation; 
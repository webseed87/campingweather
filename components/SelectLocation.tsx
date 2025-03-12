import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import locations, { LocationInfo, DistrictInfo, CityInfo } from '../constants/Locations';

interface SelectLocationProps {
  onLocationSelect?: (location: string, nx: number, ny: number) => void;
}

const SelectLocation: React.FC<SelectLocationProps> = ({ onLocationSelect }) => {
  const [cities] = useState<string[]>(Object.keys(locations));
  const [selectedCity, setSelectedCity] = useState<string>('서울특별시');
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');

  // 도시가 선택되면 해당 도시의 구 목록을 설정
  useEffect(() => {
    if (selectedCity) {
      const cityData = locations[selectedCity as keyof typeof locations];
      if (cityData) {
        const districtList = Object.keys(cityData);
        setDistricts(districtList);
        setSelectedDistrict('');
        setSelectedNeighborhood('');
      }
    }
  }, [selectedCity]);

  // 구가 선택되면 해당 구의 동 목록을 설정
  useEffect(() => {
    if (selectedCity && selectedDistrict) {
      const cityData = locations[selectedCity as keyof typeof locations];
      if (cityData) {
        const districtData = (cityData as any)[selectedDistrict];
        if (districtData) {
          const neighborhoodList = Object.keys(districtData.neighborhoods);
          setNeighborhoods(neighborhoodList);
          setSelectedNeighborhood('');
        }
      }
    }
  }, [selectedCity, selectedDistrict]);

  // 동이 선택되면 콜백 함수 호출
  useEffect(() => {
    if (selectedCity && selectedDistrict && selectedNeighborhood && onLocationSelect) {
      const cityData = locations[selectedCity as keyof typeof locations];
      if (cityData) {
        const districtData = (cityData as any)[selectedDistrict];
        if (districtData && districtData.neighborhoods[selectedNeighborhood]) {
          const locationInfo = districtData.neighborhoods[selectedNeighborhood];
          onLocationSelect(`${selectedCity} ${selectedDistrict} ${selectedNeighborhood}`, locationInfo.nx, locationInfo.ny);
        }
      }
    }
  }, [selectedCity, selectedDistrict, selectedNeighborhood, onLocationSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>도시</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={(itemValue: string) => setSelectedCity(itemValue)}
            style={styles.picker}
            dropdownIconColor="#4a90e2"
          >
            {cities.map(city => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>구</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDistrict}
            onValueChange={(itemValue: string) => setSelectedDistrict(itemValue)}
            style={styles.picker}
            enabled={districts.length > 0}
            dropdownIconColor="#4a90e2"
          >
            <Picker.Item label="구를 선택하세요" value="" />
            {districts.map(district => (
              <Picker.Item key={district} label={district} value={district} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>동</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedNeighborhood}
            onValueChange={(itemValue: string) => setSelectedNeighborhood(itemValue)}
            style={styles.picker}
            enabled={neighborhoods.length > 0}
            dropdownIconColor="#4a90e2"
          >
            <Picker.Item label="동을 선택하세요" value="" />
            {neighborhoods.map(neighborhood => (
              <Picker.Item key={neighborhood} label={neighborhood} value={neighborhood} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 50,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 45,
    width: '100%',
  },
});

export default SelectLocation; 
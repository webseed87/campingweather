import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StepByStepLocation from '../../components/StepByStepLocation';

interface LocationSelectorProps {
  onLocationSelected: (location: string, nx: number, ny: number, date: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSelected }) => {
  const handleLocationComplete = (location: string, nx: number, ny: number, date: string) => {
    console.log('위치 선택 완료:', location, nx, ny, date);
    onLocationSelected(location, nx, ny, date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationContainer}>
        <StepByStepLocation onComplete={handleLocationComplete} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  locationContainer: {
    flex: 1,
  },
});

export default LocationSelector; 
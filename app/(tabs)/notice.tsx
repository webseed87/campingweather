import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';


export default function WeatherScreen() {



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.locationSelector}>
           <Text>공지글</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  locationSelector: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
}); 
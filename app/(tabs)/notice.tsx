import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import SeasonalBackground from '../components/SeasonalBackground';
import { Colors } from '@/constants/Colors';

export default function WeatherScreen() {
  return (
    <SeasonalBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.locationSelector}>
             <Text style={styles.text}>🙋‍♀️ 캠핑웨더를 사용해주셔서 감사합니다.</Text>
<Text style={styles.text}>📖 기상청 API와 고캠핑API를 사용해서 데이터를 불러오고 있습니다. (출처:https://www.data.go.kr/) </Text>
<Text style={styles.text}>⛅ 캠핑팁은 참고 사항이며 절대적이지 않습니다. 날씨 예보는 틀릴 수 있습니다.</Text>
<Text style={styles.text}>🏕️ 고캠핑에 등록되어있지 않는 캠핑장은 검색이 되지 않습니다. (참고:https://gocamping.or.kr/) </Text>
 <Text style={styles.text}>📫 campingweather25@gmail.com (오류문의)</Text>
          </View>
        </View>
      </SafeAreaView>
    </SeasonalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  content: {
    flex: 1,
  },
  text:{
    fontSize: 16,
    padding: 10,
    fontFamily: 'SUIT-Regular',
  },
  locationSelector: {
    padding: 10,
    backgroundColor: Colors.whitebox,
    borderRadius: 8,
    margin: 10,
  
  },
}); 
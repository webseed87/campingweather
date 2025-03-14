import { Redirect } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Index() {
  // 선언적 리다이렉트 사용 (명령적 방식 대신)
  // 이 방식은 레이아웃이 마운트된 후에 리다이렉트를 수행합니다
  return (
    <View style={styles.container}>
      <Redirect href="/(tabs)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

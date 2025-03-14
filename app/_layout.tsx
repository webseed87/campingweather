import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import QueryProvider from './providers/QueryProvider';

// 스플래시 화면이 자동으로 숨겨지지 않도록 설정
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 오류 무시 */
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SUIT-Thin': require('../assets/fonts/SUIT-Thin.ttf'),
    'SUIT-ExtraLight': require('../assets/fonts/SUIT-ExtraLight.ttf'),
    'SUIT-Light': require('../assets/fonts/SUIT-Light.ttf'),
    'SUIT-Regular': require('../assets/fonts/SUIT-Regular.ttf'),
    'SUIT-Medium': require('../assets/fonts/SUIT-Medium.ttf'),
    'SUIT-SemiBold': require('../assets/fonts/SUIT-SemiBold.ttf'),
    'SUIT-Bold': require('../assets/fonts/SUIT-Bold.ttf'),
    'SUIT-ExtraBold': require('../assets/fonts/SUIT-ExtraBold.ttf'),
    'SUIT-Heavy': require('../assets/fonts/SUIT-Heavy.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      // 스플래시 화면을 숨기기 전에 약간의 지연 시간을 줌
      setTimeout(async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // 오류 무시
          console.warn('스플래시 화면을 숨기는 중 오류 발생:', e);
        }
      }, 500); // 지연 시간 증가
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      onLayoutRootView();
    }
  }, [loaded, onLayoutRootView]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </QueryProvider>
  );
}


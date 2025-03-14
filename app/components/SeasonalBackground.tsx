import React, { ReactNode, useEffect, useState } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { getCurrentSeason, seasonalBackgrounds } from '../utils/seasonalBackground';

interface SeasonalBackgroundProps {
  children: ReactNode;
}

const SeasonalBackground: React.FC<SeasonalBackgroundProps> = ({ children }) => {
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());

  // 계절이 바뀔 때마다 업데이트 (앱이 장시간 실행될 경우를 대비)
  useEffect(() => {
    const checkSeason = () => {
      const newSeason = getCurrentSeason();
      if (newSeason !== currentSeason) {
        setCurrentSeason(newSeason);
      }
    };

    // 매일 자정에 계절 확인
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // 자정에 계절 확인 타이머 설정
    const timer = setTimeout(() => {
      checkSeason();
      // 이후 24시간마다 확인
      const dailyTimer = setInterval(checkSeason, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [currentSeason]);

  return (
    <ImageBackground
      source={seasonalBackgrounds[currentSeason]}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default SeasonalBackground; 
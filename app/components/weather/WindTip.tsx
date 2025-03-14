import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageStyle, Platform } from 'react-native';
import { CampingTip } from '../../types/weather';
import campingTipIcons from '../../constants/campingTipIcons';
import useCampingWind from '../../hooks/useCampingWind';
import { DailyWeatherData } from '../../types/weather';
import { Colors } from '@/constants/Colors';

interface WindTipProps {
  dayData: DailyWeatherData;
}

interface Styles {
  tipCard: ViewStyle;
  tipIcon: ImageStyle;
  tipContent: ViewStyle;
  tipTitle: TextStyle;
  tipMessage: TextStyle;
}

export const WindTip: React.FC<WindTipProps> = ({ dayData }) => {
  // 풍속 데이터 가져오기
  const { windSpeedValue, isLoading } = useCampingWind(dayData);

  if (isLoading || !dayData) {
    return (
      <View style={styles.tipCard}>
        <Image source={campingTipIcons.wind.moderate} style={styles.tipIcon} />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>풍속 정보 로딩 중...</Text>
          <Text style={styles.tipMessage}>잠시만 기다려주세요.</Text>
        </View>
      </View>
    );
  }

  // 풍속에 따른 팁 생성
  let windTip: CampingTip = {
    icon: campingTipIcons.wind.moderate,
    title: `풍속: ${windSpeedValue !== null ? `${windSpeedValue}m/s` : '정보 없음'}`,
    message: windSpeedValue !== null ? '풍속 정보가 있습니다.' : '풍속 정보가 없습니다.',
    style: {} // 기본 스타일
  };
  
  // 풍속에 따른 메시지 설정
  if (windSpeedValue !== null) {
    if (windSpeedValue >= 10) {
      windTip = {
        icon: campingTipIcons.wind.strong,
        title: `바람이 매우 강합니다 (${windSpeedValue}m/s)`,
        message: '캠핑하기 위험한 날씨예요!! 텐트 설치를 피하세요!.',
        style: { backgroundColor: '#ffcccc' } // 연한 빨간색 배경
      };
    } else if (windSpeedValue >= 4) {
      windTip = {
        icon: campingTipIcons.wind.strong,
        title: `바람이 강합니다 (${windSpeedValue}m/s)`,
        message: '텐트 팩과 스트링을 단단히 고정하세요.',
        style: {}
      };
    } else if (windSpeedValue < 3) {
      windTip = {
        icon: campingTipIcons.wind.moderate,
        title: `바람이 약합니다 (${windSpeedValue}m/s)`,
        message: '텐트 설치에 문제가 없어요.',
        style: {}
      };
    } else {
      windTip = {
        icon: campingTipIcons.wind.weak,
        title: `바람이 적당합니다 (${windSpeedValue}m/s)`,
        message: '캠핑 하기 좋은 날씨예요.',
        style: {}
      };
    }
  }

  return (
    <View style={[styles.tipCard, windTip.style]}>
      <Image source={windTip.icon} style={styles.tipIcon} />
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{windTip.title}</Text>
        <Text style={styles.tipMessage}>{windTip.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.whitebox,
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
 
  },
  tipIcon: {
    width: 36,
    height: 36,
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    color: Colors.gary600,
    fontFamily: Platform.OS === 'ios' ? "SUIT-bold" : "SUIT-Bold",
    marginBottom: 4,
  },
  tipMessage: {
    fontSize: 14,
    color: Colors.gary500,
    fontFamily: Platform.OS === 'ios' ? "SUIT-regular" : "SUIT-Regular",
  },
});

export default WindTip; 
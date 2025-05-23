import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageStyle, Platform } from 'react-native';
import { CampingTip } from '../../types/weather';
import campingTipIcons from '../../constants/campingTipIcons';
import useCampingTemperature from '../../hooks/useCampingTemperature';
import { DailyWeatherData } from '../../types/weather';
import { Colors } from '@/constants/Colors';

interface TemperatureTipProps {
  dayData: DailyWeatherData;
}

interface Styles {
  tipCard: ViewStyle;
  tipIcon: ImageStyle;
  tipContent: ViewStyle;
  tipTitle: TextStyle;
  tipMessage: TextStyle;
}

export const TemperatureTip: React.FC<TemperatureTipProps> = ({ dayData }) => {
  // 온도 데이터 가져오기
  const { minTempValue, maxTempValue, isLoading } = useCampingTemperature(dayData);

  if (isLoading || !dayData) {
    return (
      <View style={styles.tipCard}>
        <Image source={campingTipIcons.temperature.mild} style={styles.tipIcon} />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>온도 정보 로딩 중...</Text>
          <Text style={styles.tipMessage}>잠시만 기다려주세요.</Text>
        </View>
      </View>
    );
  }

  // 온도에 따른 팁 생성
  let tempTip: CampingTip = {
    icon: campingTipIcons.temperature.mild,
    title: `최저 기온: ${minTempValue !== null ? `${minTempValue}°C` : '정보 없음'}`,
    message: minTempValue !== null ? '기온 정보가 있습니다.' : '기온 정보가 없습니다.',
    style: {}
  };
  
  // 온도에 따른 메시지 설정
  if (minTempValue !== null) {
    if (minTempValue <= -12) {
      tempTip = {
        icon: campingTipIcons.temperature.verycold,
        title: `혹한기 캠핑 예상 (최저 ${minTempValue}°C)`,
        message: '난로가 있어도 추워요! 캠핑을 추천하지 않아요.',
        style: {}
      };
    } else if (minTempValue <= 10) {
      tempTip = {
        icon: campingTipIcons.temperature.cold,
        title: `추운 날씨 예상 (최저 ${minTempValue}°C)`,
        message: '난로와 방한장비, 핫팩을 준비하세요.',
        style: {}
      };
    } else if (minTempValue >= 25) {
      tempTip = {
        icon: campingTipIcons.temperature.hot,
        title: `더운 날씨 예상 (최저 ${minTempValue}°C)`,
        message: '충분한 물과 타프(그늘막), 선풍기를 준비하세요.',
        style: {}
      };
    } else {
      tempTip = {
        icon: campingTipIcons.temperature.mild,
        title: `적당한 기온 예상 (최저 ${minTempValue}°C)`,
        message: '쾌적한 캠핑이 가능합니다.',
        style: {}
      };
    }
  }

 
  return (
    <View style={[styles.tipCard, tempTip.style]}>
      <Image source={tempTip.icon} style={styles.tipIcon} />
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{tempTip.title}</Text>
        <Text style={styles.tipMessage}>{tempTip.message}</Text>
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

export default TemperatureTip; 
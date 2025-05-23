import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Image, ImageStyle, Platform } from 'react-native';
import { CampingTip } from '../../types/weather';
import campingTipIcons from '../../constants/campingTipIcons';
import useCampingPrecipitation from '../../hooks/useCampingPrecipitation';
import { DailyWeatherData } from '../../types/weather';
import { Colors } from '@/constants/Colors';

interface PrecipitationTipProps {
  dayData: DailyWeatherData;
}

interface Styles {
  tipCard: ViewStyle;
  tipIcon: ImageStyle;
  tipContent: ViewStyle;
  tipTitle: TextStyle;
  tipMessage: TextStyle;
  precipDetail: TextStyle;
  precipTime: TextStyle;
  precipTimeContainer: ViewStyle;
}

export const PrecipitationTip: React.FC<PrecipitationTipProps> = ({ dayData }) => {
  // 강수량 데이터 가져오기
  const { 
    pty, 
    pcpCategory, 
    pcpText, 
    pcpValue, 
    snoCategory, 
    snoText, 
    snoValue, 
    maxPcpCategory, 
    maxPcpText, 
    maxSnoCategory, 
    maxSnoText, 
    sky,
    rn1Value, // 초단기실황 1시간 강수량
    minPcpValue, // 최소 강수량
    maxPcpValue, // 최대 강수량
    pcpTimes, // 강수 시간대
    isLoading 
  } = useCampingPrecipitation(dayData);

  if (isLoading || !dayData) {
    return (
      <View style={styles.tipCard}>
        <Image source={campingTipIcons.precipitation.none} style={styles.tipIcon} />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>강수 정보 로딩 중...</Text>
          <Text style={styles.tipMessage}>잠시만 기다려주세요.</Text>
        </View>
      </View>
    );
  }

  // 강수량에 따른 메시지 생성
  let precipMessage = '강수 정보가 없습니다.';
  
  // 하늘상태와 강수형태에 따른 아이콘 설정
  let weatherIcon = campingTipIcons.precipitation.none;
  let weatherTitle = '맑은 날씨 예상';
  
  // 강수량/적설량 표시를 위한 변수
  let precipAmount = '';
  let precipStyle = {};

  // 실제 강수량과 적설량 값 가져오기
  const pcpVal = parseFloat(pcpValue || '0');
  const snoVal = parseFloat(snoValue || '0');
  
  // 실황값 사용 (RN1)
  const hasRealTimeData = rn1Value && parseFloat(rn1Value) > 0;
  
  // 시간대별 강수량 정보
  const hasPcpTimeData = pcpTimes && pcpTimes.length > 0;
  const hasMinMaxPcpData = minPcpValue && maxPcpValue;

  if (pty && pty !== '0') {
    // 강수가 있는 경우
    if (pty === '1' || pty === '4' || pty === '5') { // 비, 소나기, 빗방울
      const effectivePcpCategory = maxPcpCategory || pcpCategory;
      
      // 강수량 표시 문자열 생성 (실제 수치 사용)
      if (hasRealTimeData) {
        // 실황 데이터가 있는 경우
        precipAmount = `(현재 강수량: ${rn1Value}mm)`;
      } else if (pcpVal > 0) {
        precipAmount = `(강수량: ${pcpVal.toFixed(1)}mm)`;
      } else {
        precipAmount = '(강수량: 0.0mm)';
      }
      
      if (effectivePcpCategory === '1') {
        weatherIcon = campingTipIcons.precipitation.rain.light;
        weatherTitle = '약한 비 예상';
      } else if (effectivePcpCategory === '2') {
        weatherIcon = campingTipIcons.precipitation.rain.moderate;
        weatherTitle = '보통 강도의 비 예상';
      } else if (effectivePcpCategory === '3') {
        weatherIcon = campingTipIcons.precipitation.rain.heavy;
        weatherTitle = '강한 비 예상';
      } else if (effectivePcpCategory === '4') {
        weatherIcon = campingTipIcons.precipitation.rain.extreme;
        weatherTitle = '매우 강한 비 예상';
        precipMessage = `계곡 근처 캠핑이라면 캠핑을 하지 않는걸 추천 드려요.`;
        precipStyle = { backgroundColor: '#ffcccc', padding: 8, borderRadius: 4 };
      } else {
        weatherIcon = campingTipIcons.precipitation.rain.light;
        weatherTitle = '비 예상';
      }
      
      // 메시지 업데이트 (실제 수치 사용)
      if (hasRealTimeData) {
        // 실황 데이터가 있는 경우
        precipMessage = `현재 시간당 강수량은 ${rn1Value}mm입니다.`;
      } else if (hasMinMaxPcpData) {
        // 최소/최대 강수량 데이터가 있는 경우
        precipMessage = `예상 강수량은 ${minPcpValue}mm에서 ${maxPcpValue}mm 사이입니다.`;
      } else if (pcpVal <= 0) {
        precipMessage = '비가 예상되나 강수량은 미미할 것으로 예상됩니다.';
      } else {
        precipMessage = `강수량 ${pcpVal.toFixed(1)}mm의 비가 예상됩니다.`;
      }
    } else if (pty === '2' || pty === '6') { // 비/눈, 빗방울눈날림
      // 강수량과 적설량 모두 표시 (실제 수치 사용)
      let pcpDisplay = pcpVal > 0 ? `${pcpVal.toFixed(1)}mm` : '';
      let snoDisplay = snoVal > 0 ? `${snoVal.toFixed(1)}cm` : '';
      
      if (hasRealTimeData) {
        // 실황 데이터가 있는 경우
        pcpDisplay = `${rn1Value}mm`;
      }
      
      if (pcpDisplay && snoDisplay) {
        precipAmount = `(강수량: ${pcpDisplay}, 적설량: ${snoDisplay})`;
      } else if (pcpDisplay) {
        precipAmount = `(강수량: ${pcpDisplay})`;
      } else if (snoDisplay) {
        precipAmount = `(적설량: ${snoDisplay})`;
      } else {
        precipAmount = '(강수/적설량: 0)';
      }
      
      weatherIcon = campingTipIcons.precipitation.mixed;
      weatherTitle = '비/눈 예상';
      
      // 메시지 업데이트 (실제 수치 사용)
      if (hasRealTimeData) {
        // 실황 데이터가 있는 경우
        precipMessage = `현재 시간당 강수량은 ${rn1Value}mm이며, 적설량은 ${snoVal.toFixed(1)}cm로 예상됩니다.`;
      } else if (hasMinMaxPcpData) {
        // 최소/최대 강수량 데이터가 있는 경우
        precipMessage = `예상 강수량은 ${minPcpValue}mm에서 ${maxPcpValue}mm 사이이며, 적설량은 ${snoVal.toFixed(1)}cm로 예상됩니다.`;
      } else if (pcpVal <= 0 && snoVal <= 0) {
        precipMessage = '비/눈이 예상되나 강수량은 미미할 것으로 예상됩니다.';
      } else {
        precipMessage = `강수량 ${pcpVal.toFixed(1)}mm, 적설량 ${snoVal.toFixed(1)}cm의 비/눈이 예상됩니다.`;
      }
    } else if (pty === '3' || pty === '7') { // 눈, 눈날림
      const effectiveSnoCategory = maxSnoCategory || snoCategory;
      
      // 적설량 표시 문자열 생성 (실제 수치 사용)
      if (snoVal > 0) {
        precipAmount = `(적설량: ${snoVal.toFixed(1)}cm)`;
      } else {
        precipAmount = '(적설량: 0cm)';
      }
      
      if (effectiveSnoCategory === '1') {
        weatherIcon = campingTipIcons.precipitation.snow.light;
        weatherTitle = '약한 눈 예상';
      } else if (effectiveSnoCategory === '2') {
        weatherIcon = campingTipIcons.precipitation.snow.moderate;
        weatherTitle = '보통 강도의 눈 예상';
      } else if (effectiveSnoCategory === '3') {
        weatherIcon = campingTipIcons.precipitation.snow.heavy;
        weatherTitle = '강한 눈 예상';
        precipMessage = `습설예보나 산간지역 캠핑이라면 캠핑 하는걸 추천하지 않아요.`;
        precipStyle = { backgroundColor: '#ffcccc', padding: 8, borderRadius: 4 };
      } else {
        weatherIcon = campingTipIcons.precipitation.snow.light;
        weatherTitle = '눈 예상';
      }
      
      // 메시지 업데이트 (실제 수치 사용)
      if (snoVal <= 0) {
        precipMessage = '눈이 예상되나 적설량은 미미할 것으로 예상되요.';
      } else {
        precipMessage = `적설량 ${snoVal.toFixed(1)}cm의 눈이 예상되요.`;
      }
    }
  } else {
    // 강수가 없는 경우 하늘상태에 따른 아이콘
    if (sky === '1') {
      weatherIcon = campingTipIcons.sky.clear;
      weatherTitle = '맑음';
    } else if (sky === '3') {
      weatherIcon = campingTipIcons.sky.cloudy;
      weatherTitle = '구름많음';
    } else if (sky === '4') {
      weatherIcon = campingTipIcons.sky.overcast;
      weatherTitle = '흐림';
    }
  }
  
  // 제목에 강수량/적설량 정보 추가
  const fullWeatherTitle = precipAmount ? `${weatherTitle} ${precipAmount}` : weatherTitle;
  
  // 최종 강수 팁 생성
  const precipTip: CampingTip = {
    icon: weatherIcon,
    title: fullWeatherTitle,
    message: precipMessage,
    style: precipStyle
  };

  return (
    <View style={[styles.tipCard, precipTip.style]}>
      <Image source={precipTip.icon} style={styles.tipIcon} />
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{precipTip.title}</Text>
        <Text style={styles.tipMessage}>{precipTip.message}</Text>
        
        {/* 시간대별 강수량 정보 표시 */}
        {hasPcpTimeData && hasMinMaxPcpData && (
          <>
            <Text style={styles.precipDetail}>
              {`예상 강수량: 최소 ${minPcpValue}mm ~ 최대 ${maxPcpValue}mm`}
            </Text>
            <View style={styles.precipTimeContainer}>
              <Text style={styles.precipTime}>
                {`강수 예상 시간대: ${pcpTimes.join(', ')}`}
              </Text>
            </View>
          </>
        )}
        
        {/* 실황 데이터 표시 */}
        {hasRealTimeData && (
          <Text style={styles.precipDetail}>
            {`현재 시간당 강수량: ${rn1Value}mm (실황 관측값)`}
          </Text>
        )}
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
    marginBottom: 8,
  },
  precipDetail: {
    fontSize: 13,
    color: Colors.gary500,
    fontFamily: Platform.OS === 'ios' ? "SUIT-regular" : "SUIT-Regular",
    marginTop: 4,
  },
  precipTime: {
    fontSize: 12,
    color: Colors.gary400,
    fontFamily: Platform.OS === 'ios' ? "SUIT-regular" : "SUIT-Regular",
  },
  precipTimeContainer: {
    marginTop: 4,
  }
});

export default PrecipitationTip; 
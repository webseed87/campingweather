import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { CampingTip } from '../../types/weather';
import campingTipIcons from '../../constants/campingTipIcons';
import useCampingPrecipitation from '../../hooks/useCampingPrecipitation';
import { DailyWeatherData } from '../../types/weather';

interface PrecipitationTipProps {
  dayData: DailyWeatherData;
}

interface Styles {
  tipCard: ViewStyle;
  tipIcon: TextStyle;
  tipContent: ViewStyle;
  tipTitle: TextStyle;
  tipMessage: TextStyle;
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
    isLoading 
  } = useCampingPrecipitation(dayData);

  if (isLoading || !dayData) {
    return (
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>{campingTipIcons.precipitation.none}</Text>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>강수 정보 로딩 중...</Text>
          <Text style={styles.tipMessage}>잠시만 기다려주세요.</Text>
        </View>
      </View>
    );
  }

  // 강수량에 따른 메시지 생성
  let precipMessage = '강수 정보가 없습니다.';

  if (pty === '1' || pty === '4' || pty === '5') { // 비, 소나기, 빗방울
    // 강수량 값 처리
    const pcpVal = parseFloat(pcpValue || '0');
    let pcpDisplay = '강수없음';
    
    if (pcpVal > 0) {
      if (pcpVal < 1.0) {
        pcpDisplay = '1mm 미만';
      } else if (pcpVal < 30.0) {
        pcpDisplay = `${pcpVal}mm`;
      } else if (pcpVal < 50.0) {
        pcpDisplay = '30.0~50.0mm';
      } else {
        pcpDisplay = '50.0mm 이상';
      }
    }
    
    if (pcpDisplay === '강수없음') {
      precipMessage = '비가 예상되나 강수량은 미미할 것으로 예상됩니다.';
    } else {
      precipMessage = `강수량 ${pcpDisplay}의 비가 예상됩니다.`;
    }
  } else if (pty === '2' || pty === '6') { // 비/눈, 빗방울눈날림
    // 강수량과 적설량 모두 표시
    const pcpVal = parseFloat(pcpValue || '0');
    const snoVal = parseFloat(snoValue || '0');
    let pcpDisplay = '강수없음';
    let snoDisplay = '적설없음';
    
    if (pcpVal > 0) {
      if (pcpVal < 1.0) {
        pcpDisplay = '1mm 미만';
      } else if (pcpVal < 30.0) {
        pcpDisplay = `${pcpVal}mm`;
      } else if (pcpVal < 50.0) {
        pcpDisplay = '30.0~50.0mm';
      } else {
        pcpDisplay = '50.0mm 이상';
      }
    }
    
    if (snoVal > 0) {
      if (snoVal < 0.5) {
        snoDisplay = '0.5cm 미만';
      } else if (snoVal < 5.0) {
        snoDisplay = `${snoVal}cm`;
      } else {
        snoDisplay = '5.0cm 이상';
      }
    }
    
    if (pcpDisplay === '강수없음' && snoDisplay === '적설없음') {
      precipMessage = '비/눈이 예상되나 강수량과 적설량은 미미할 것으로 예상됩니다.';
    } else {
      precipMessage = `강수량 ${pcpDisplay}, 적설량 ${snoDisplay}의 비/눈이 예상됩니다.`;
    }
  } else if (pty === '3' || pty === '7') { // 눈, 눈날림
    // 적설량 값 처리
    const snoVal = parseFloat(snoValue || '0');
    let snoDisplay = '적설없음';
    
    if (snoVal > 0) {
      if (snoVal < 0.5) {
        snoDisplay = '0.5cm 미만';
      } else if (snoVal < 5.0) {
        snoDisplay = `${snoVal}cm`;
      } else {
        snoDisplay = '5.0cm 이상';
      }
    }
    
    if (snoDisplay === '적설없음') {
      precipMessage = '눈이 예상되나 적설량은 미미할 것으로 예상됩니다.';
    } else {
      precipMessage = `적설량 ${snoDisplay}의 눈이 예상됩니다.`;
    }
  } else {
    precipMessage = '맑은 날씨가 예상됩니다. 야외 활동하기 좋은 날입니다.';
  }

  // 하늘상태와 강수형태에 따른 아이콘 설정
  let weatherIcon = campingTipIcons.precipitation.none;
  let weatherTitle = '맑은 날씨 예상';
  
  // 강수량/적설량 표시를 위한 변수
  let precipAmount = '';
  let precipStyle = {};
  
  if (pty && pty !== '0') {
    // 강수가 있는 경우
    if (pty === '1' || pty === '4' || pty === '5') { // 비, 소나기, 빗방울
      const effectivePcpCategory = maxPcpCategory || pcpCategory;
      const pcpVal = parseFloat(pcpValue || '0');
      
      // 강수량 표시 문자열 생성
      if (rn1Value && rn1Value !== '0') {
        const rn1Val = parseFloat(rn1Value);
        precipAmount = `(강수량: ${rn1Val.toFixed(1)}mm)`;
      } else if (pcpVal > 0) {
        if (pcpVal < 1.0) {
          precipAmount = `(강수량: ${pcpVal.toFixed(1)}mm)`;
        } else if (pcpVal < 30.0) {
          precipAmount = `(강수량: ${pcpVal.toFixed(1)}mm)`;
        } else if (pcpVal < 50.0) {
          precipAmount = `(강수량: ${pcpVal.toFixed(1)}mm)`;
        } else {
          precipAmount = `(강수량: ${pcpVal.toFixed(1)}mm)`;
        }
      } else {
        precipAmount = '(강수량: 0mm)';
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
        precipMessage = `${precipMessage} 계곡 근처 캠핑이라면 캠핑을 하지 않는걸 추천 드려요.`;
        precipStyle = { backgroundColor: '#ffcccc', padding: 8, borderRadius: 4 };
      } else {
        weatherIcon = campingTipIcons.precipitation.rain.light;
        weatherTitle = '비 예상';
      }
    } else if (pty === '2' || pty === '6') { // 비/눈, 빗방울눈날림
      weatherIcon = campingTipIcons.precipitation.mixed;
      weatherTitle = '비/눈 예상';
      
      // 강수량과 적설량 모두 표시
      const pcpVal = parseFloat(pcpValue || '0');
      const snoVal = parseFloat(snoValue || '0');
      let pcpDisplay = '';
      let snoDisplay = '';
      
      if (rn1Value && rn1Value !== '0') {
        const rn1Val = parseFloat(rn1Value);
        pcpDisplay = `${rn1Val.toFixed(1)}mm`;
      } else if (pcpVal > 0) {
        pcpDisplay = `${pcpVal.toFixed(1)}mm`;
      }
      
      if (snoVal > 0) {
        snoDisplay = `${snoVal.toFixed(1)}cm`;
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
    } else if (pty === '3' || pty === '7') { // 눈, 눈날림
      const effectiveSnoCategory = maxSnoCategory || snoCategory;
      const snoVal = parseFloat(snoValue || '0');
      
      // 적설량 표시 문자열 생성
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
        precipMessage = `${precipMessage} 습설예보나 산간지역 캠핑이라면 캠핑 하는걸 추천하지 않아요.`;
        precipStyle = { backgroundColor: '#ffcccc', padding: 8, borderRadius: 4 };
      } else {
        weatherIcon = campingTipIcons.precipitation.snow.light;
        weatherTitle = '눈 예상';
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
  
  const precipTip: CampingTip = {
    icon: weatherIcon,
    title: fullWeatherTitle,
    message: precipMessage,
    style: precipStyle
  };

  return (
    <View style={[styles.tipCard, precipTip.style]}>
      <Text style={styles.tipIcon}>{precipTip.icon}</Text>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{precipTip.title}</Text>
        <Text style={styles.tipMessage}>{precipTip.message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  tipIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipMessage: {
    fontSize: 14,
    color: '#666',
  },
});

export default PrecipitationTip; 
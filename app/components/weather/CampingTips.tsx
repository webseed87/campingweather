import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { DailyWeatherData } from "../../types/weather";
import { TemperatureTip } from './TemperatureTip';
import { WindTip } from './WindTip';
import { PrecipitationTip } from './PrecipitationTip';
import WeeklyForecast from './WeeklyForecast';

interface CampingTipsProps {
  dayData: DailyWeatherData;
}

interface Styles {
  container: ViewStyle;
}

export const CampingTips: React.FC<CampingTipsProps> = ({ dayData }) => {
  if (!dayData) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TemperatureTip dayData={dayData} />
      <WindTip dayData={dayData} />
      <PrecipitationTip dayData={dayData} />
      <WeeklyForecast />
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    padding: 16,
  },
});

export default CampingTips;

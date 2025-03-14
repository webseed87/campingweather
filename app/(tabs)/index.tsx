import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CampingSearch from "../components/CampingSearch";
import WeatherForecast from "../components/WeatherForecast";
import DateSelector from "../components/DateSelector";
import { Colors } from "@/constants/Colors";
import SeasonalBackground from "../components/SeasonalBackground";

interface SelectedCamping {
  name: string;
  nx: number;
  ny: number;
  date: string;
  address?: string;
  landRegId?: string;
  taRegId?: string;
}

export default function CampingScreen() {
  const [selectedCamping, setSelectedCamping] =
    useState<SelectedCamping | null>(null);
  const [showWeather, setShowWeather] = useState<boolean>(false);

  const handleCampingSelected = (
    campingName: string,
    nx: number,
    ny: number,
    address?: string,
    landRegId?: string,
    taRegId?: string
  ) => {

    // 캠핑장은 날짜 선택이 없으므로 오늘 날짜를 기본값으로 사용
    const today = new Date().toISOString().split("T")[0];
    setSelectedCamping({
      name: campingName,
      nx,
      ny,
      date: today,
      address,
      landRegId,
      taRegId,
    });
    setShowWeather(true);
  };

  // 날짜 선택 처리
  const handleDateSelect = (date: string) => {
    if (selectedCamping) {
      setSelectedCamping({
        ...selectedCamping,
        date,
      });
    }
  };

  // 검색 화면으로 돌아가기
  const handleGoBack = () => {
    setSelectedCamping(null);
    setShowWeather(false);
  };

  return (
    <View style={styles.container}>
      <SeasonalBackground>
        <SafeAreaView style={styles.safeArea}>
          {!showWeather ? (
            <View style={styles.content}>
              <CampingSearch onCampingSelected={handleCampingSelected} />
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.campingInfo}>
                <Text style={styles.campingName}>{selectedCamping?.name}</Text>
                {selectedCamping?.address && (
                  <Text style={styles.campingAddress}>
                    {selectedCamping.address}
                  </Text>
                )}
                {showWeather && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                  >
                    <Text style={styles.backButtonText}>다시 선택</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 날짜 선택 컴포넌트 */}
              <View style={styles.dateContainer}>
                <DateSelector
                  onDateSelect={handleDateSelect}
                  initialDate={selectedCamping?.date}
                />
              </View>

              <View style={styles.weatherInfoContainer}>
                <WeatherForecast
                  nx={selectedCamping?.nx || 0}
                  ny={selectedCamping?.ny || 0}
                  locationName={selectedCamping?.name || ""}
                  selectedDate={selectedCamping?.date || ""}
                  landRegId={selectedCamping?.landRegId}
                  taRegId={selectedCamping?.taRegId}
                />
              </View>
            </View>
          )}
        </SafeAreaView>
      </SeasonalBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 30, // 상태 표시줄 높이만큼 패딩 추가
  },
  backButton: {
    position: "absolute",
    right: 15,
    top: 25,
    backgroundColor: Colors.blue200,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 13,
    color: Colors.white,
    fontFamily: "SUIT-regular",
  },
  content: {
    flex: 1,
  },
  campingInfo: {
    padding: 15,
    backgroundColor: Colors.whitebox,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 16,
  },
  campingName: {
    fontSize: 16,
    fontFamily: "SUIT-bold",
    marginBottom: 4,
  },
  campingAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  dateContainer: {
    marginHorizontal: 10,
    marginBottom: 8,
    height: 90,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  weatherInfoContainer: {
    flex: 1,
  },
  dateInfo: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0066cc",
    marginBottom: 8,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    
  },
});

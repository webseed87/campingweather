import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import CampingSearch from "../components/CampingSearch";
import WeatherForecast from "../components/WeatherForecast";
import DateSelector from "../components/DateSelector";

interface SelectedCamping {
  name: string;
  nx: number;
  ny: number;
  date: string;
  address?: string;
}

export default function CampingScreen() {
  const [selectedCamping, setSelectedCamping] =
    useState<SelectedCamping | null>(null);
  const [showWeather, setShowWeather] = useState<boolean>(false);

  const handleCampingSelected = (
    campingName: string,
    nx: number,
    ny: number,
    address?: string
  ) => {
    console.log("캠핑장 선택 완료:", campingName, nx, ny, address);
    // 캠핑장은 날짜 선택이 없으므로 오늘 날짜를 기본값으로 사용
    const today = new Date().toISOString().split("T")[0];
    setSelectedCamping({
      name: campingName,
      nx,
      ny,
      date: today,
      address,
    });
    setShowWeather(true);
  };

  // 날짜 선택 처리
  const handleDateSelect = (date: string) => {
    console.log("선택된 날짜:", date);
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
    <ImageBackground
      source={require("../../assets/images/winter_bg.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
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
                  <Text style={styles.backButtonText}>검색으로</Text>
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
              <Text style={styles.dateInfo}>
                {selectedCamping?.date
                  ? new Date(selectedCamping.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })
                  : ""}
              </Text>
              <WeatherForecast
                nx={selectedCamping?.nx || 0}
                ny={selectedCamping?.ny || 0}
                locationName={selectedCamping?.name || ""}
                selectedDate={selectedCamping?.date || ""}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent", // 완전 투명 배경으로 변경
  },
  header: {
    padding: 15,
    backgroundColor: "#4a90e2",
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#e6f0ff",
    marginTop: 4,
  },
  backButton: {
    position: "absolute",
    right: 15,
    top: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  campingInfo: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  campingName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  campingAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  dateContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  weatherInfoContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  dateInfo: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0066cc",
    marginBottom: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

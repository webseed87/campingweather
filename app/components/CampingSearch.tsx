import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { searchCampings, CampingItem } from "../../api/campingApi";
import {
  findGridCoordinatesByAddress,
  findNearestGridFromLocations,
} from "../utils/coordinateConverter";

interface CampingSearchProps {
  onCampingSelected: (
    campingName: string,
    nx: number,
    ny: number,
    addr1: string
  ) => void;
}

interface LocationItem {
  city: string;
  district: string;
  neighborhood: string;
  nx: number;
  ny: number;
  mapX: number;
  mapY: number;
}

const CampingSearch: React.FC<CampingSearchProps> = ({ onCampingSelected }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<CampingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCamping, setSelectedCamping] = useState<CampingItem | null>(
    null
  );

  // 컴포넌트 마운트 시 초기 데이터 로드하지 않음
  useEffect(() => {
    // 초기 데이터 로드 제거
  }, []);

  // 검색 처리 함수
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim() === "") {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // API 모듈을 사용하여 캠핑장 데이터 가져오기
      const campings = await searchCampings(text);
      setSearchResults(campings);
    } catch (err: any) {
      console.error("캠핑장 데이터 로드 오류:", err);

      // 더 자세한 오류 메시지 표시
      let errorMessage = "캠핑장 데이터를 불러오는 중 오류가 발생했습니다.";

      if (err.response) {
        // 서버가 응답을 반환한 경우
        const status = err.response.status;
        errorMessage += ` (상태 코드: ${status})`;

        // 특정 상태 코드에 따른 메시지
        if (status === 400) {
          errorMessage = "잘못된 요청입니다. 검색어를 확인해주세요.";
        } else if (status === 401 || status === 403) {
          errorMessage = "API 인증에 실패했습니다. 잠시 후 다시 시도해주세요.";
        } else if (status === 404) {
          errorMessage = "요청한 정보를 찾을 수 없습니다.";
        } else if (status >= 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
      } else if (err.request) {
        // 요청이 전송되었지만 응답이 없는 경우
        errorMessage =
          "서버로부터 응답이 없습니다. 인터넷 연결을 확인해주세요.";
      } else if (err.message) {
        // 요청 설정 중 오류가 발생한 경우
        if (err.message.includes("timeout")) {
          errorMessage =
            "서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage += ` (${err.message})`;
        }
      }

      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 캠핑장 선택 처리 함수
  const handleSelectCamping = (camping: any) => {
    try {
      let nx, ny;

      // 경도(mapX)와 위도(mapY)가 있는 경우 이를 사용하여 locations.json에서 가장 가까운 좌표 찾기
      if (
        camping.mapX &&
        camping.mapY &&
        !isNaN(camping.mapX) &&
        !isNaN(camping.mapY)
      ) {
        // locations.json에서 가장 가까운 좌표 찾기
        const coordinates = findNearestGridFromLocations(
          camping.mapX,
          camping.mapY
        );
        nx = coordinates.nx;
        ny = coordinates.ny;
        console.log(
          `locations.json 기반 좌표: nx=${nx}, ny=${ny}, 원본 좌표: mapX=${camping.mapX}, mapY=${camping.mapY}`
        );
      } else {
        // 경도/위도가 없는 경우 주소를 사용하여 좌표 추출
        const coordinates = findGridCoordinatesByAddress(camping.addr1);
        nx = coordinates.nx;
        ny = coordinates.ny;
        console.log(
          `주소 기반 좌표: nx=${nx}, ny=${ny}, 주소: ${camping.addr1}`
        );
      }

      setSelectedCamping(camping);
      onCampingSelected(camping.facltNm, nx, ny, camping.addr1);
    } catch (error) {
      console.error("캠핑장 좌표 변환 중 오류 발생:", error);
      Alert.alert(
        "위치 정보 오류",
        "선택한 캠핑장의 위치 정보를 처리하는 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>어디로 떠나실 생각이신가요?</Text>
      <Text style={styles.subtitle}>
        캠핑장 이름을 검색하고 날씨를 확인하세요.
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="캠핑장 이름을 입력하세요"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>캠핑장 정보를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleSearch(searchText)}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.contentId}
          renderItem={({ item }) => {
            // 주소에서 지역명 추출 (시/군/구)
            const addressParts = item.addr1.split(" ");
            const regionName =
              addressParts.length >= 2
                ? `${addressParts[0]} ${addressParts[1]}`
                : item.addr1;

            // 검색어가 있는 경우 캠핑장 이름에서 검색어와 일치하는 부분 강조
            let campingNameDisplay: React.ReactNode = item.facltNm;
            if (searchText && searchText.trim() !== "") {
              const searchTextLower = searchText.toLowerCase();
              const nameLower = item.facltNm.toLowerCase();
              const index = nameLower.indexOf(searchTextLower);

              if (index !== -1) {
                const before = item.facltNm.substring(0, index);
                const match = item.facltNm.substring(
                  index,
                  index + searchText.length
                );
                const after = item.facltNm.substring(index + searchText.length);

                campingNameDisplay = (
                  <Text>
                    {before}
                    <Text style={{ fontWeight: "bold", color: "#0066cc" }}>
                      {match}
                    </Text>
                    {after}
                  </Text>
                );
              }
            }

            return (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectCamping(item)}
              >
                <View style={styles.resultItemContent}>
                  <View style={styles.campingInfoContainer}>
                    <Text style={styles.campingName}>{campingNameDisplay}</Text>
                    <Text style={styles.campingAddress} numberOfLines={1}>
                      {item.addr1}
                    </Text>
                  </View>
                  <View style={styles.regionContainer}>
                    <Text style={styles.regionName}>{regionName}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText && searchText.trim() !== ""
                  ? `'${searchText}'에 대한 검색 결과가 없습니다`
                  : "캠핑장 이름을 입력하여 검색해주세요"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  title: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resultItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  campingInfoContainer: {
    flex: 1,
    marginRight: 8,
  },
  campingName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  campingAddress: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  regionContainer: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: "center",
  },
  regionName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});

export default CampingSearch;

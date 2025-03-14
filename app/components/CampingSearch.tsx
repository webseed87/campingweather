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
import { Ionicons } from "@expo/vector-icons";
import { searchCampings, CampingItem } from "../../api/campingApi";
import {
  findGridCoordinatesByAddress,
  findNearestGridFromLocations,
} from "../utils/coordinateConverter";
import { MID_FORECAST_REGION_CODES } from "../../api/midTermForecast";
import { Colors } from "@/constants/Colors";

interface CampingSearchProps {
  onCampingSelected: (
    campingName: string,
    nx: number,
    ny: number,
    addr1: string,
    landRegId?: string,
    taRegId?: string
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
  const [isFocused, setIsFocused] = useState(false);

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

  /**
   * 주소에서 중기예보 지역 코드를 찾는 함수
   * @param address 주소 문자열
   * @returns {landRegId, taRegId} 중기예보 지역 코드
   */
  const findMidForecastRegionCodes = (
    address: string
  ): { landRegId?: string; taRegId?: string } => {
    try {
      if (!address) return {};

      // 주소에서 시/도, 시/군/구 정보 추출
      let city = "";
      let district = "";

      // 특별시, 광역시, 특별자치시, 도 추출
      const cityMatch = address.match(
        /서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주/
      );
      if (cityMatch) {
        city = cityMatch[0];
      }

      // 시/군/구 추출 (시/도 다음에 오는 단어)
      if (city) {
        const districtRegex = new RegExp(`${city}\\s+([\\w가-힣]+)`, "u");
        const districtMatch = address.match(districtRegex);
        if (districtMatch && districtMatch[1]) {
          district = districtMatch[1];
        }
      }

      console.log(
        `주소에서 추출한 지역 정보: 시/도=${city}, 시/군/구=${district}`
      );

      // 육상 중기예보 지역 코드 찾기
      let landRegId: string | undefined;

      // 시/도에 따른 육상 중기예보 지역 코드 매핑
      if (city === "서울" || city === "인천" || city === "경기") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["서울, 인천, 경기도"];
      } else if (city === "강원") {
        // 강원도는 영서/영동 구분
        // 영동 지역: 강릉, 속초, 동해, 삼척, 태백, 고성, 양양
        const eastRegions = [
          "강릉",
          "속초",
          "동해",
          "삼척",
          "태백",
          "고성",
          "양양",
        ];
        if (
          district &&
          eastRegions.some((region) => district.includes(region))
        ) {
          landRegId = MID_FORECAST_REGION_CODES.LAND["강원도 영동"];
        } else {
          landRegId = MID_FORECAST_REGION_CODES.LAND["강원도 영서"];
        }
      } else if (city === "대전" || city === "세종" || city === "충남") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["대전, 세종, 충청남도"];
      } else if (city === "충북") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["충청북도"];
      } else if (city === "광주" || city === "전남") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["광주, 전라남도"];
      } else if (city === "전북") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["전라북도"];
      } else if (city === "대구" || city === "경북") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["대구, 경상북도"];
      } else if (city === "부산" || city === "울산" || city === "경남") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["부산, 울산, 경상남도"];
      } else if (city === "제주") {
        landRegId = MID_FORECAST_REGION_CODES.LAND["제주도"];
      }

      // 기온 중기예보 지역 코드 찾기
      let taRegId: string | undefined;

      // 시/군/구 이름으로 기온 중기예보 지역 코드 찾기
      if (district) {
        // 특별한 경우 처리 (예: 광주(전남), 광주(경기) 구분)
        let searchDistrict = district;
        if (district === "광주" && city === "경기") {
          searchDistrict = "광주(경기)";
        } else if (district === "광주" && city === "전남") {
          searchDistrict = "광주(전남)";
        }

        // TEMPERATURE 객체에서 일치하는 지역 찾기
        for (const [regionName, regionCode] of Object.entries(
          MID_FORECAST_REGION_CODES.TEMPERATURE
        )) {
          if (regionName === searchDistrict) {
            taRegId = regionCode;
            break;
          }
        }
      }

      // 시/군/구 코드를 찾지 못한 경우, 시/도 단위로 대표 지역 선택
      if (!taRegId) {
        if (city === "서울") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["서울"];
        } else if (city === "부산") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["부산"];
        } else if (city === "대구") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["대구"];
        } else if (city === "인천") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["인천"];
        } else if (city === "광주") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["광주(전남)"];
        } else if (city === "대전") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["대전"];
        } else if (city === "울산") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["울산"];
        } else if (city === "세종") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["세종"];
        } else if (city === "경기") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["수원"];
        } else if (city === "강원") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["춘천"];
        } else if (city === "충북") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["청주"];
        } else if (city === "충남") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["천안"];
        } else if (city === "전북") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["전주"];
        } else if (city === "전남") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["목포"];
        } else if (city === "경북") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["포항"];
        } else if (city === "경남") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["창원"];
        } else if (city === "제주") {
          taRegId = MID_FORECAST_REGION_CODES.TEMPERATURE["제주"];
        }
      }

      return { landRegId, taRegId };
    } catch (error) {
      return {};
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
     
      } else {
        // 경도/위도가 없는 경우 주소를 사용하여 좌표 추출
        const coordinates = findGridCoordinatesByAddress(camping.addr1);
        nx = coordinates.nx;
        ny = coordinates.ny;
    
      }

      // 중기예보 지역 코드 찾기
      const { landRegId, taRegId } = findMidForecastRegionCodes(camping.addr1);

      setSelectedCamping(camping);
      onCampingSelected(
        camping.facltNm,
        nx,
        ny,
        camping.addr1,
        landRegId,
        taRegId
      );
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
        <View
          style={[
            styles.searchInputContainer,
            isFocused && styles.searchInputContainerFocused,
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={Colors.gary300}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, isFocused && { outline: "none" }]}
            placeholder="캠핑장 이름을 입력하세요"
            placeholderTextColor={Colors.gary300}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>
            🏕️ 캠핑장 정보를 불러오는 중...
          </Text>
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
                    <Text style={{ fontWeight: "bold", color: "#186363" }}>
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
                  : ""}
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
    color: Colors.gary500,
    fontFamily: "SUIT-Bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gary400,
    fontFamily: "SUIT-Regular",
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
  },
  searchInputContainerFocused: {
    borderWidth: 0,
    borderColor: 'transparent',
 
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    fontFamily: "SUIT-Regular",
    outlineColor: "transparent",
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
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  resultItem: {
    backgroundColor: Colors.whitebox,
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gary200,
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
    fontFamily: "SUIT-blod",
    marginBottom: 4,
  },
  campingAddress: {
    fontSize: 13,
    color: Colors.gary500,
    marginBottom: 4,
  },
  regionContainer: {
    backgroundColor: Colors.gary200,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    justifyContent: "center",
  },
  regionName: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "SUIT-regular",
    color: Colors.gary500,
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

import { Colors } from "@/constants/Colors";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";

interface DateSelectorProps {
  onDateSelect: (date: string) => void;
  initialDate?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  onDateSelect,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // YYYY-MM-DD 형식으로 날짜 포맷
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 요일 구하기
  const getDayOfWeek = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    return dayOfWeek[date.getDay()];
  };

  // 오늘부터 5일간의 날짜를 계산
  useEffect(() => {
    // 날짜 배열 초기화
    const dates: string[] = [];

    // 오늘 날짜 가져오기
    const today = new Date();

    // 오늘부터 5일간의 날짜를 생성
    for (let i = 0; i < 5; i++) {
      // 새로운 날짜 객체 생성
      const futureDate = new Date(today);
      // i일 후의 날짜로 설정
      futureDate.setDate(today.getDate() + i);
      // 포맷팅된 날짜 문자열 생성
      const dateStr = formatDate(futureDate);
      // 배열에 추가
      dates.push(dateStr);
    }

    // 날짜 배열 설정
    setAvailableDates(dates);

    // 초기 날짜 설정 (props로 받은 initialDate 또는 오늘 날짜)
    const defaultDate = initialDate || dates[0];
    setSelectedDate(defaultDate);
    onDateSelect(defaultDate);
  }, [initialDate]);

  // 날짜 선택 핸들러
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    onDateSelect(dateStr);
  };

  // 오늘 날짜 확인
  const today = formatDate(new Date());

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.datesContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {availableDates.map((dateStr, index) => {
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const dayOfWeek = getDayOfWeek(dateStr);

          // 날짜 표시 형식 변경 (MM-DD)
          const displayDate = dateStr.substring(5);

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dateItem, 
                isSelected && styles.selectedDateItem,
                Platform.OS === 'android' && styles.androidDateItem,
                isSelected && Platform.OS === 'android' && styles.androidSelectedDateItem
              ]}
              onPress={() => handleDateSelect(dateStr)}
            >
              <Text
                style={[styles.dateText, isSelected && styles.selectedDateText]}
              >
                {displayDate}
              </Text>
              <Text
                style={[styles.dayText, isSelected && styles.selectedDateText]}
              >
                {isToday ? "오늘" : `${dayOfWeek}요일`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    height: 80, // 명시적인 높이 설정
  },
  title: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? "SUIT-bold" : "SUIT-Bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  datesContainer: {
    flexDirection: "row",
  },
  scrollContent: {
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  dateItem: {
    width: 68,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: Colors.whitebox,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    
  },
  androidDateItem: {
 
    backgroundColor: Colors.whitebox,
  },
  selectedDateItem: {
    backgroundColor: Colors.blue300,
    borderColor: Colors.gary200,
   
  },
  androidSelectedDateItem: {

    backgroundColor: Colors.blue300,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? "SUIT-Medium" : "SUIT-Medium",
  },
  dayText: {
    fontSize: 14,
    color: "#666",
    fontFamily: Platform.OS === 'ios' ? "SUIT-Regular" : "SUIT-Regular",
  },
  selectedDateText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? "SUIT-Medium" : "SUIT-Medium",
  },
});

export default DateSelector;

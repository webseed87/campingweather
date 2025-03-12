import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface SimpleCalendarProps {
  onDateSelect: (date: string) => void;
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // YYYY-MM-DD 형식으로 날짜 포맷
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // 요일 구하기
  const getDayOfWeek = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
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
      
      console.log(`날짜 ${i+1}: ${dateStr}`); // 디버깅용 로그
    }
    
    // 날짜 배열 설정
    setAvailableDates(dates);
    
    // 오늘 날짜를 기본 선택
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
      onDateSelect(dates[0]);
    }
  }, []);
  
  // 날짜 선택 핸들러
  const handleDateSelect = (dateStr: string) => {
    console.log('선택한 날짜:', dateStr); // 디버깅용 로그 추가
    setSelectedDate(dateStr);
    onDateSelect(dateStr);
  };
  
  // 오늘 날짜 확인
  const today = formatDate(new Date());
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>날짜 선택</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesContainer}>
        {availableDates.map((dateStr, index) => {
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const dayOfWeek = getDayOfWeek(dateStr);
          
          // 날짜 표시 형식 변경 (MM-DD)
          const displayDate = dateStr.substring(5);
          
          console.log('렌더링 날짜:', dateStr, isSelected ? '(선택됨)' : ''); // 디버깅용 로그 추가
          
          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dateItem,
                isSelected && styles.selectedDateItem
              ]}
              onPress={() => handleDateSelect(dateStr)}
            >
              <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                {displayDate}
              </Text>
              <Text style={[styles.dayText, isSelected && styles.selectedDateText]}>
                {isToday ? '오늘' : `${dayOfWeek}요일`}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  datesContainer: {
    flexDirection: 'row',
    paddingBottom: 10, // 스크롤 영역에 패딩 추가
  },
  dateItem: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, // 간격 증가
    borderRadius: 12, // 더 둥근 모서리
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderWidth: 1, // 테두리 추가
    borderColor: '#e0e0e0',
  },
  selectedDateItem: {
    backgroundColor: '#4a90e2',
    borderColor: '#3a80d2', // 선택된 항목의 테두리 색상 변경
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 18, // 글자 크기 증가
    fontWeight: '600', // 더 굵게
    color: '#333',
    marginBottom: 5,
  },
  dayText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: '600', // 선택된 텍스트 굵게
  },
});

export default SimpleCalendar; 
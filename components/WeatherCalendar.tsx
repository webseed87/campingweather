import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface DateObject {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

interface WeatherCalendarProps {
  onDateSelect: (date: string) => void;
}

const WeatherCalendar: React.FC<WeatherCalendarProps> = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  
  // 오늘부터 5일간의 날짜를 계산
  useEffect(() => {
    const today = new Date();
    const availableDates: {[key: string]: any} = {};
    
    // 오늘 날짜를 기본 선택
    const todayStr = formatDate(today);
    setSelectedDate(todayStr);
    onDateSelect(todayStr);
    
    // 오늘부터 5일간의 날짜를 마킹
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateStr = formatDate(date);
      
      availableDates[dateStr] = {
        marked: true,
        dotColor: '#4a90e2',
        selected: dateStr === todayStr,
        selectedColor: '#4a90e2',
        selectedTextColor: 'white'
      };
    }
    
    setMarkedDates(availableDates);
  }, [onDateSelect]);
  
  // 날짜 선택 핸들러
  const handleDateSelect = (date: DateObject) => {
    const dateStr = date.dateString;
    
    // 선택 가능한 날짜인지 확인 (오늘부터 5일 이내)
    if (markedDates[dateStr]) {
      // 이전 선택 날짜의 스타일 업데이트
      const updatedMarkedDates = { ...markedDates };
      
      if (selectedDate) {
        updatedMarkedDates[selectedDate] = {
          ...updatedMarkedDates[selectedDate],
          selected: false
        };
      }
      
      // 새 선택 날짜의 스타일 업데이트
      updatedMarkedDates[dateStr] = {
        ...updatedMarkedDates[dateStr],
        selected: true,
        selectedColor: '#4a90e2',
        selectedTextColor: 'white'
      };
      
      setMarkedDates(updatedMarkedDates);
      setSelectedDate(dateStr);
      onDateSelect(dateStr);
    }
  };
  
  // YYYY-MM-DD 형식으로 날짜 포맷
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>날짜 선택</Text>
      <Calendar
        current={selectedDate}
        minDate={formatDate(new Date())}
        maxDate={formatDate(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000))}
        onDayPress={handleDateSelect}
        markedDates={markedDates}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#4a90e2',
          selectedDayBackgroundColor: '#4a90e2',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#4a90e2',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#4a90e2',
          selectedDotColor: '#ffffff',
          arrowColor: '#4a90e2',
          monthTextColor: '#4a90e2',
          indicatorColor: '#4a90e2',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
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
    marginBottom: 10,
    textAlign: 'center',
  }
});

export default WeatherCalendar; 
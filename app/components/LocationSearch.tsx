import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import locations from '@/constants/Locations';

interface LocationSearchProps {
  onSelectLocation: (location: { name: string; nx: number; ny: number }) => void;
}

export default function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ key: string; name: string; nx: number; ny: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 검색어가 변경될 때마다 결과 업데이트
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // 검색 로직 (약간의 딜레이를 주어 UI가 더 자연스럽게 보이도록 함)
    const timer = setTimeout(() => {
      const results = Object.entries(locations)
        .filter(([key, location]) => {
          // 검색어를 포함하는 지역명 필터링
          return location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 key.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .map(([key, location]) => ({
          key,
          name: location.name,
          nx: location.nx,
          ny: location.ny
        }));
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 검색 입력 지우기
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // 지역 선택 처리
  const handleSelectLocation = (location: { name: string; nx: number; ny: number }) => {
    onSelectLocation(location);
    clearSearch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="지역명을 입력하세요 (예: 강남구, 서울)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.key}
          style={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.resultItem}
              onPress={() => handleSelectLocation(item)}
            >
              <Text style={styles.resultText}>{item.name}</Text>
              <Text style={styles.resultSubText}>격자 좌표: {item.nx}, {item.ny}</Text>
            </TouchableOpacity>
          )}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  resultsList: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 15,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 15,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 15,
  },
  noResultsText: {
    color: '#666',
    fontSize: 14,
  }
}); 
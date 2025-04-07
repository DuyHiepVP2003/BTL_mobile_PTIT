import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ImageBackground
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

type LocationItem = {
  id: string
  name: string
  country: string
  temp: number
  condition: string
}

export default function WeatherSearchScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Mock recent searches
  const [recentSearches, setRecentSearches] = useState<LocationItem[]>([
    {
      id: '1',
      name: 'Nghe An',
      country: 'Việt Nam',
      temp: 22,
      condition: 'Không ẩm, nắng nhẹ'
    },
    {
      id: '2',
      name: 'Ha Noi',
      country: 'Việt Nam',
      temp: 21,
      condition: 'Hơi mát chút'
    }
  ])

  // Mock search results - in a real app, this would come from an API
  const [searchResults, setSearchResults] = useState<LocationItem[]>([])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // In a real app, you would call your weather API here
      // For now, we'll just mock some results
      setSearchResults([
        {
          id: '3',
          name: 'Hà Nội',
          country: 'Việt Nam',
          temp: 21,
          condition: 'Hơi mát chút'
        },
        {
          id: '4',
          name: 'Hà Giang',
          country: 'Việt Nam',
          temp: 19,
          condition: 'Mát mẻ'
        },
        {
          id: '5',
          name: 'Hà Tĩnh',
          country: 'Việt Nam',
          temp: 24,
          condition: 'Nắng nhẹ'
        }
      ])
    }
  }

  const handleLocationSelect = (location: LocationItem) => {
    // Navigate to the weather detail screen with the selected location
    router.push({
      pathname: '/pages/weather-detail',
      params: { locationId: location.id, locationName: location.name }
    })
  }

  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationCountry}>{item.country}</Text>
        <Text style={styles.locationCondition}>{item.condition}</Text>
      </View>
      <Text style={styles.locationTemp}>{item.temp}°</Text>
    </TouchableOpacity>
  )

  return (
    <ImageBackground
      source={require('../../assets/images/weather-search.jpg')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false
          }}
        />
        <StatusBar barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thời tiết</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {searchQuery.length === 0 && (
          <>
            <Text style={styles.sectionTitle}>Vị trí hiện tại</Text>
            {renderLocationItem({ item: recentSearches[1] })}

            <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
            <FlatList
              data={recentSearches}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        {searchQuery.length > 0 && searchResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
            <FlatList
              data={searchResults}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
            />
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(147, 112, 219, 0.5)' // Semi-transparent purple overlay
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButton: {
    marginRight: 16
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    color: '#333'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16
  },
  locationInfo: {
    flex: 1
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  locationCountry: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4
  },
  locationCondition: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  locationTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  }
})

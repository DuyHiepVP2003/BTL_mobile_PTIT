import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

type WeatherData = {
  location: string
  country: string
  temperature: number
  condition: string
  date: string
  day: string
  night: string
  humidity: number
  windSpeed: number
  feelsLike: number
  forecast: Array<{
    day: string
    temp: number
    condition: string
  }>
}

export default function WeatherDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { locationId, locationName } = params
  
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  
  useEffect(() => {
    // In a real app, you would fetch data from your API here
    // For now, we'll just simulate a network request
    const timer = setTimeout(() => {
      setWeatherData({
        location: locationName as string,
        country: 'Việt Nam',
        temperature: 22,
        condition: 'Không ẩm, nắng nhẹ',
        date: new Date().toLocaleDateString('vi-VN'),
        day: 'Ngày 24°',
        night: 'Tối 18°',
        humidity: 65,
        windSpeed: 10,
        feelsLike: 23,
        forecast: [
          { day: 'Thứ 2', temp: 22, condition: 'sunny' },
          { day: 'Thứ 3', temp: 23, condition: 'partly-sunny' },
          { day: 'Thứ 4', temp: 21, condition: 'cloudy' },
          { day: 'Thứ 5', temp: 20, condition: 'rainy' },
          { day: 'Thứ 6', temp: 22, condition: 'sunny' },
        ]
      })
      setLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [locationId, locationName])
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Đang tải dữ liệu thời tiết...</Text>
      </SafeAreaView>
    )
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#8A2BE2', '#9370DB', '#9400D3']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{weatherData?.location}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mainInfo}>
            <Text style={styles.temperature}>{weatherData?.temperature}°</Text>
            <Text style={styles.condition}>{weatherData?.condition}</Text>
            <Text style={styles.feelsLike}>Cảm giác như {weatherData?.feelsLike}°</Text>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={22} color="#fff" />
              <Text style={styles.detailText}>Độ ẩm</Text>
              <Text style={styles.detailValue}>{weatherData?.humidity}%</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="speedometer-outline" size={22} color="#fff" />
              <Text style={styles.detailText}>Gió</Text>
              <Text style={styles.detailValue}>{weatherData?.windSpeed} km/h</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="sunny-outline" size={22} color="#fff" />
              <Text style={styles.detailText}>UV</Text>
              <Text style={styles.detailValue}>Trung bình</Text>
            </View>
          </View>
          
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>Dự báo 5 ngày</Text>
            {weatherData?.forecast.map((day, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{day.day}</Text>
                <View style={styles.forecastIconContainer}>
                  <Ionicons name={day.condition as any} size={24} color="#fff" />
                </View>
                <Text style={styles.forecastTemp}>{day.temp}°</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9370DB',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  moreButton: {
    padding: 8,
  },
  mainInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  temperature: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#fff',
  },
  condition: {
    fontSize: 24,
    color: '#fff',
    marginTop: 8,
  },
  feelsLike: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 40,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 8,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  forecastContainer: {
    marginHorizontal: 16,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  forecastDay: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  forecastIconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  forecastTemp: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
  },
})
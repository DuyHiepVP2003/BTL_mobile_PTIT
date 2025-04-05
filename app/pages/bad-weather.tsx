import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { ChatBotButton } from '@/components/hieunm/ChatBotButton'

const { width } = Dimensions.get('window')
const cardWidth = width * 0.44

type colorArr = [string, string]

export default function BadWeatherScreen() {
  // Fake data - sẽ được thay thế bằng dữ liệu thực từ API
  const weatherData = {
    airQuality: {
      index: 3,
      level: 'Rủi ro sức khỏe thấp',
      color: ['#4A90E2', '#D0021B']
    },
    uvIndex: {
      value: 4,
      level: 'Trung bình',
      color: ['#4A90E2', '#9013FE']
    },
    pressure: {
      value: 1015,
      unit: 'hPa',
      normal: true
    },
    wind: {
      speed: 9.7,
      unit: 'km/h',
      direction: 'B'
    },
    rainfall: {
      current: 1.8,
      unit: 'mm',
      forecast: 'Dự kiến 1.2 mm trong 24h tới.'
    },
    feelsLike: {
      temperature: 19,
      unit: '°',
      description: 'Tương tự nhiệt độ thực tế.'
    },
    humidity: {
      value: 90,
      unit: '%',
      description: 'Điểm sương hiện tại.'
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Air Quality Card */}
          <View style={styles.airQualityCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="cloud-outline" size={20} color="#fff" />
              <Text style={styles.cardHeaderText}>CHẤT LƯỢNG KHÔNG KHÍ</Text>
            </View>
            <Text style={styles.airQualityValue}>
              {weatherData.airQuality.index}-{weatherData.airQuality.level}
            </Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={weatherData.airQuality.color as colorArr}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressBar}
              />
            </View>
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>Xem thêm</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Grid of smaller cards */}
          <View style={styles.cardsGrid}>
            {/* UV Index Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="sunny-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>CHỈ SỐ UV</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.uvIndex.value}
              </Text>
              <Text style={styles.smallCardDescription}>
                {weatherData.uvIndex.level}
              </Text>
              <View style={styles.smallProgressBarContainer}>
                <LinearGradient
                  colors={weatherData.uvIndex.color as colorArr}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.smallProgressBar}
                />
              </View>
            </View>

            {/* Pressure Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="speedometer-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>ÁP SUẤT</Text>
              </View>
              <View style={styles.pressureGauge}>
                <View style={styles.gaugeCircle}>
                  <View style={styles.gaugeIndicator} />
                </View>
              </View>
            </View>

            {/* Wind Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="leaf-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>GIÓ</Text>
              </View>
              <View style={styles.windDirection}>
                <Text style={styles.directionText}>B</Text>
                <View style={styles.directionRow}>
                  <Text style={styles.directionText}>T</Text>
                  <View style={styles.compassCircle}>
                    <View style={styles.compassNeedle} />
                  </View>
                  <Text style={styles.directionText}>Đ</Text>
                </View>
                <Text style={styles.directionText}>N</Text>
              </View>
              <Text style={styles.windSpeed}>
                {weatherData.wind.speed} {weatherData.wind.unit}
              </Text>
            </View>

            {/* Rainfall Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="water-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>LƯỢNG MƯA</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.rainfall.current} {weatherData.rainfall.unit}
              </Text>
              <Text style={styles.smallCardDescription}>trong giờ qua</Text>
              <Text style={styles.rainfallForecast}>
                {weatherData.rainfall.forecast}
              </Text>
            </View>

            {/* Feels Like Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="thermometer-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>CẢM GIÁC NHIỆT</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.feelsLike.temperature}
                {weatherData.feelsLike.unit}
              </Text>
              <Text style={styles.smallCardDescription}>
                {weatherData.feelsLike.description}
              </Text>
            </View>

            {/* Humidity Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="water-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>ĐỘ ẨM</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.humidity.value}
                {weatherData.humidity.unit}
              </Text>
              <Text style={styles.smallCardDescription}>
                {weatherData.humidity.description}
              </Text>
            </View>
          </View>
        </ScrollView>
        {/* ChatBot Button */}
        <ChatBotButton />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff'
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 80 // Space for ChatBotButton
  },
  airQualityCard: {
    backgroundColor: 'rgba(103, 80, 164, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  cardHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  airQualityValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressBar: {
    height: '100%',
    width: '60%' // This would be dynamic based on the actual value
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  smallCard: {
    width: cardWidth,
    backgroundColor: 'rgba(103, 80, 164, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  smallCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  smallCardHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  },
  smallCardValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold'
  },
  smallCardDescription: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4
  },
  smallProgressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 12
  },
  smallProgressBar: {
    height: '100%',
    width: '40%' // This would be dynamic based on the actual value
  },
  pressureGauge: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100
  },
  gaugeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gaugeIndicator: {
    width: 4,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }]
  },
  windDirection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8
  },
  directionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  compassCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  compassNeedle: {
    width: 2,
    height: 20,
    backgroundColor: '#fff',
    transform: [{ rotate: '0deg' }] // This would be dynamic based on the actual direction
  },
  windSpeed: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8
  },
  rainfallForecast: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8
  }
})

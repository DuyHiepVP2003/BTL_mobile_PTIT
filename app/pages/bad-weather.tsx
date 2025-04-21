import React, { useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { ChatBotButton } from '@/components/hieunm/ChatBotButton'
import * as Notifications from 'expo-notifications'
import { AppState, AppStateStatus } from 'react-native'
import { useBadWeather } from '@/hooks/useBadWeather'

const { width } = Dimensions.get('window')
const cardWidth = width * 0.44

// Cấu hình thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
})

export default function BadWeatherScreen() {
  const {
    weatherData,
    loading,
    error,
    fetchWeatherData,
    checkAndUpdateWeatherIfNeeded
  } = useBadWeather()

  // Yêu cầu quyền gửi thông báo
  useEffect(() => {
    registerForPushNotificationsAsync()
  }, [])

  // Theo dõi trạng thái ứng dụng để cập nhật dữ liệu khi mở lại
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    )
    return () => subscription.remove()
  }, [])

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      checkAndUpdateWeatherIfNeeded()
    }
  }

  // Hàm xin quyền gửi thông báo
  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('weather-warnings', {
        name: 'Weather Warnings',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C'
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Thông báo',
        'Bạn cần cấp quyền thông báo để nhận cảnh báo thời tiết xấu!',
        [{ text: 'OK' }]
      )
      return false
    }

    return true
  }

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Đang tải thông tin thời tiết...</Text>
      </SafeAreaView>
    )
  }

  // Hiển thị thông báo lỗi
  if (error || !weatherData) {
    const errorMessage = error || 'Không thể tải dữ liệu thời tiết'

    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="cloud-offline" size={60} color="#6200EE" />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchWeatherData}
        >
          <Ionicons name="refresh" size={20} color="#6200EE" />
          <Text style={styles.refreshText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
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
              {weatherData.airQuality.index} - {weatherData.airQuality.level}
            </Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={weatherData.airQuality.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, weatherData.airQuality.index / 3)}%`
                  }
                ]}
              />
            </View>
          </View>

          {/* Warnings Section */}
          {weatherData.warnings && weatherData.warnings.length > 0 && (
            <View style={styles.warningsCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="warning-outline" size={20} color="#fff" />
                <Text style={styles.cardHeaderText}>CẢNH BÁO THỜI TIẾT</Text>
              </View>
              {weatherData.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color="#FFF"
                    style={styles.warningIcon}
                  />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

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
                  colors={weatherData.uvIndex.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.smallProgressBar,
                    {
                      width: `${Math.min(100, weatherData.uvIndex.value * 10)}%`
                    }
                  ]}
                />
              </View>
            </View>

            {/* Pressure Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="speedometer-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>ÁP SUẤT</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.pressure.value} {weatherData.pressure.unit}
              </Text>
              <View style={styles.pressureGauge}>
                <View style={styles.gaugeCircle}>
                  <View
                    style={[
                      styles.gaugeIndicator,
                      { transform: [{ rotate: weatherData.pressure.rotation }] }
                    ]}
                  />
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
                    <View
                      style={[
                        styles.compassNeedle,
                        {
                          transform: [
                            { rotate: `${weatherData.wind.directionDeg}deg` }
                          ]
                        }
                      ]}
                    />
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

          {/* Refresh Button */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchWeatherData}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#6200EE" />
            <Text style={styles.refreshText}>Làm mới dữ liệu</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* ChatBot Button */}
        <ChatBotButton />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  // Styles hiện tại
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff'
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    color: '#6200EE'
  },
  errorText: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
    color: '#F44336',
    textAlign: 'center',
    paddingHorizontal: 20
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
    fontSize: 18,
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
  },

  // Styles cho các tính năng mới
  warningsCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)', // Màu đỏ cho cảnh báo
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)'
  },
  warningIcon: {
    marginRight: 8
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    flex: 1
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20
  },
  refreshText: {
    marginLeft: 8,
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '500'
  }
})

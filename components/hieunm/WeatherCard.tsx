import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  AppState,
  AppStateStatus
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  OpenWeatherMapService,
  WeatherData
} from '@/services/api/openWeatherMapService'

export const WeatherCard = () => {
  type IoniconsName = React.ComponentProps<typeof Ionicons>['name']
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState<WeatherData>({
    location: 'Ha Noi, Viet Nam',
    country: 'Việt Nam',
    temperature: 3,
    condition: 'Có mây', // Cloudy
    date: '08/03/2025, 16:14',
    day: 'Ngày 3°',
    night: 'Tối -1°',
    humidity: 78,
    windSpeed: 12,
    feelsLike: 1
  })
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

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

  const checkAndUpdateWeatherIfNeeded = async () => {
    const now = Date.now()
    const THIRTY_MINUTES = 60 * 1000

    if (now - lastFetchTime > THIRTY_MINUTES) {
      fetchWeatherData()
    }
  }

  const fetchWeatherData = async () => {
    try {
      setLoading(true)

      const savedCity = (await AsyncStorage.getItem('lastCity')) || 'Hanoi,vn'

      const weatherService = new OpenWeatherMapService()
      const data = await weatherService.getCurrentWeather(savedCity)

      data.condition = weatherService.translateCondition(data.condition)

      setWeatherData(data)
      setError(null)
      setLastFetchTime(Date.now())

      await AsyncStorage.setItem('cachedWeatherData', JSON.stringify(data))
      await AsyncStorage.setItem('lastFetchTime', Date.now().toString())
    } catch (error) {
      console.error('Error fetching weather data:', error)
      setError('Không thể tải dữ liệu thời tiết')

      try {
        const cachedData = await AsyncStorage.getItem('cachedWeatherData')
        if (cachedData) {
          setWeatherData(JSON.parse(cachedData))
        }
      } catch (cacheError) {
        // Keep using mock data if no cache is available
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initWeatherData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('cachedWeatherData')
        const lastFetch = await AsyncStorage.getItem('lastFetchTime')

        if (cachedData && lastFetch) {
          const parsedData = JSON.parse(cachedData)
          const lastFetchMs = parseInt(lastFetch, 10)
          setWeatherData(parsedData)
          setLastFetchTime(lastFetchMs)

          const now = Date.now()
          const THIRTY_MINUTES = 60 * 1000

          if (now - lastFetchMs < THIRTY_MINUTES) {
            setLoading(false)
            return
          }
        }

        fetchWeatherData()
      } catch (error) {
        console.error('Error initializing weather data:', error)
        fetchWeatherData()
      }
    }

    initWeatherData()
  }, [])

  const getWeatherIcon = (condition: string, conditionMain?: string) => {
    if (conditionMain) {
      switch (conditionMain.toLowerCase()) {
        case 'clear':
          return { name: 'sunny', color: '#FFD700' }
        case 'clouds':
          return { name: 'cloudy', color: '#E0E0E0' }
        case 'rain':
        case 'drizzle':
          return { name: 'rainy', color: '#87CEFA' }
        case 'thunderstorm':
          return { name: 'thunderstorm', color: '#FFD700' }
        case 'snow':
          return { name: 'snow', color: 'white' }
        case 'mist':
        case 'fog':
        case 'haze':
          return { name: 'cloud', color: '#C0C0C0' }
      }
    }

    switch (condition.toLowerCase()) {
      case 'có mây':
      case 'cloudy':
      case 'mây':
      case 'ít mây':
      case 'nhiều mây':
      case 'mây rải rác':
      case 'trời nhiều mây':
        return { name: 'cloudy', color: '#E0E0E0' }
      case 'có nắng':
      case 'sunny':
      case 'nắng':
      case 'trời nắng':
      case 'trời quang':
        return { name: 'sunny', color: '#FFD700' }
      case 'có mưa':
      case 'rainy':
      case 'mưa':
      case 'mưa vừa':
      case 'mưa nhẹ':
      case 'mưa to':
      case 'mưa rào':
      case 'mưa phùn':
      case 'moderate rain':
        return { name: 'rainy', color: '#87CEFA' }
      case 'có tuyết':
      case 'snowy':
      case 'tuyết':
        return { name: 'snow', color: 'white' }
      case 'có sấm sét':
      case 'thunderstorm':
      case 'sấm sét':
      case 'giông bão':
        return { name: 'thunderstorm', color: '#FFD700' }
      case 'có sương mù':
      case 'foggy':
      case 'sương mù':
      case 'sương mờ':
      case 'sương mù dày đặc':
        return { name: 'cloud', color: '#C0C0C0' }
      default:
        return { name: 'partly-sunny', color: '#FFD700' }
    }
  }

  const weatherIcon = getWeatherIcon(
    weatherData.condition,
    (weatherData as any).conditionMain
  )

  const handleSearch = () => {
    router.push('/pages/weather-search')
  }

  if (loading) {
    return (
      <View style={[styles.weatherCard, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Đang tải dữ liệu thời tiết...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.weatherCard, styles.loadingContainer]}>
        <Ionicons name="cloud-offline" size={40} color="#fff" />
        <Text style={styles.loadingText}>{error}</Text>
        <Text style={styles.errorSubtext}>Đang hiển thị dữ liệu mẫu</Text>
      </View>
    )
  }

  return (
    <ImageBackground
      source={require('../../assets/images/bg-weather-app.jpg')}
      style={styles.weatherCard}
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
        style={styles.overlay}
      />

      <View style={styles.locationContainer}>
        <View style={styles.locationTextContainer}>
          <Ionicons
            name="location"
            size={18}
            color="white"
            style={styles.locationIcon}
          />
          <Text style={styles.location}>
            {weatherData.location}, {weatherData.country}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint="light" style={styles.blurView}>
              <Ionicons name="search" size={22} color="white" />
            </BlurView>
          ) : (
            <View style={styles.searchButtonAndroid}>
              <Ionicons name="search" size={22} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.temperatureContainer}>
        <View style={styles.mainTempContainer}>
          <Text style={styles.temperature}>{weatherData.temperature}°</Text>
          <Text style={styles.feelsLike}>
            Cảm giác như {weatherData.feelsLike}°
          </Text>
        </View>

        <View style={styles.conditionContainer}>
          <Ionicons
            name={weatherIcon.name as IoniconsName}
            size={80}
            color={weatherIcon.color}
            style={styles.weatherIcon}
          />
          <Text style={styles.condition}>{weatherData.condition}</Text>
        </View>
      </View>

      <View>
        <Text style={styles.date}>{weatherData.date}</Text>
      </View>

      <View style={styles.additionalInfoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="water-outline" size={18} color="white" />
          <Text style={styles.infoText}>{weatherData.humidity}%</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer-outline" size={18} color="white" />
          <Text style={styles.infoText}>{weatherData.windSpeed} km/h</Text>
        </View>
        {weatherData.rain !== undefined && weatherData.rain > 0 && (
          <View style={styles.infoItem}>
            <Ionicons name="rainy-outline" size={18} color="white" />
            <Text style={styles.infoText}>{weatherData.rain} mm</Text>
          </View>
        )}
      </View>

      <View style={styles.forecastContainer}>
        <View style={styles.forecastItem}>
          <Ionicons
            name="sunny-outline"
            size={16}
            color="white"
            style={styles.forecastIcon}
          />
          <Text style={styles.forecastText}>{weatherData.day}</Text>
        </View>
        <View style={styles.forecastItem}>
          <Ionicons
            name="moon-outline"
            size={16}
            color="white"
            style={styles.forecastIcon}
          />
          <Text style={styles.forecastText}>{weatherData.night}</Text>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  weatherCard: {
    padding: 20,
    height: 350,
    borderRadius: 25,
    marginHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16
  },
  backgroundImage: {
    borderRadius: 25
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 25
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0
  },
  locationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationIcon: {
    marginRight: 5
  },
  location: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  blurView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  searchButtonAndroid: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mainTempContainer: {
    flexDirection: 'column'
  },
  temperature: {
    color: 'white',
    fontSize: 80,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  feelsLike: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: -10,
    marginLeft: 5
  },
  conditionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    padding: 10
  },
  weatherIcon: {
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  condition: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2
  },
  additionalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    padding: 10,
    marginTop: 15,
    alignSelf: 'flex-start'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  infoText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14
  },
  date: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.9,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    textAlign: 'center',
    padding: 5,
  },
  forecastContainer: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 10
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  forecastIcon: {
    marginRight: 5
  },
  forecastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '500'
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 5
  }
})

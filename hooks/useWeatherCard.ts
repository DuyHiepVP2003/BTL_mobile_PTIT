import { useState, useEffect } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WeatherData } from '@/types/weatherCard'
import * as Location from 'expo-location'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
const DEFAULT_LOCATION = 'Hanoi,vn'

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null)

  // Hàm lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    try {
      // Yêu cầu quyền truy cập vị trí
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        console.log('Location permission denied')
        // Nếu không có quyền thì dùng vị trí mặc định
        fetchWeatherData({ useDefault: true })
        return
      }

      // Lấy vị trí hiện tại
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      })

      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })

      // Gọi API thời tiết với tọa độ
      fetchWeatherData({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })

      // Theo dõi thay đổi vị trí để cập nhật thời tiết khi di chuyển
      startLocationTracking()
    } catch (err) {
      console.error('Error getting location:', err)
      fetchWeatherData({ useDefault: true })
    }
  }

  // Bắt đầu theo dõi vị trí
  const startLocationTracking = async () => {
    if (locationSubscription) {
      await locationSubscription.remove()
    }

    // Chỉ theo dõi khi có sự thay đổi đáng kể về vị trí (ít nhất 100m)
    const newLocationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100, // Cập nhật khi di chuyển ít nhất 100m
        timeInterval: 60000 // Hoặc ít nhất 1 phút
      },
      (location) => {
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }

        // Kiểm tra xem vị trí có thay đổi đáng kể không
        if (
          !userLocation ||
          Math.abs(newLocation.latitude - userLocation.latitude) > 0.001 ||
          Math.abs(newLocation.longitude - userLocation.longitude) > 0.001
        ) {
          setUserLocation(newLocation)
          fetchWeatherData(newLocation)
        }
      }
    )

    setLocationSubscription(newLocationSubscription)
  }

  // Hàm dừng theo dõi vị trí
  const stopLocationTracking = async () => {
    if (locationSubscription) {
      await locationSubscription.remove()
      setLocationSubscription(null)
    }
  }

  const fetchWeatherData = async (
    locationParams: {
      latitude?: number
      longitude?: number
      useDefault?: boolean
    } = {}
  ) => {
    try {
      setLoading(true)

      let url = `${API_BASE_URL}/weather`

      // Thêm tham số vị trí nếu có
      if (locationParams.latitude && locationParams.longitude) {
        url += `?lat=${locationParams.latitude}&lon=${locationParams.longitude}`
      } else if (locationParams.useDefault) {
        url += `?location=${DEFAULT_LOCATION}`
      }

      const response = await axios.get(url)

      const data = response.data
      setWeatherData(data)
      setError(null)

      // Lưu thời gian fetch data gần nhất
      const now = Date.now()
      setLastFetchTime(now)

      // Cache dữ liệu để sử dụng offline
      await AsyncStorage.setItem('cachedWeatherData', JSON.stringify(data))
      await AsyncStorage.setItem('lastFetchTime', now.toString())

      // Lưu vị trí đã dùng để gọi API
      if (locationParams.latitude && locationParams.longitude) {
        await AsyncStorage.setItem(
          'lastLocation',
          JSON.stringify({
            latitude: locationParams.latitude,
            longitude: locationParams.longitude
          })
        )
      }
    } catch (err) {
      console.error('Error fetching weather data:', err)
      setError('Không thể tải dữ liệu thời tiết')

      // Thử tải dữ liệu từ cache nếu có lỗi
      try {
        const cachedData = await AsyncStorage.getItem('cachedWeatherData')
        if (cachedData) {
          setWeatherData(JSON.parse(cachedData))
        }
      } catch (cacheError) {
        console.error('Error loading cached weather data:', cacheError)
      }
    } finally {
      setLoading(false)
    }
  }

  const checkAndUpdateWeatherIfNeeded = async () => {
    const now = Date.now()
    const THIRTY_MINUTES = 30 * 60 * 1000 // 30 phút

    if (now - lastFetchTime > THIRTY_MINUTES) {
      // Nếu có vị trí hiện tại thì dùng nó
      if (userLocation) {
        fetchWeatherData(userLocation)
      } else {
        getCurrentLocation()
      }
    }
  }

  // Khởi tạo và dọn dẹp
  useEffect(() => {
    const initWeatherData = async () => {
      try {
        // Kiểm tra dữ liệu cache và thời gian cập nhật gần nhất
        const cachedData = await AsyncStorage.getItem('cachedWeatherData')
        const lastFetch = await AsyncStorage.getItem('lastFetchTime')
        const lastLocationString = await AsyncStorage.getItem('lastLocation')

        let shouldFetchFresh = true

        if (cachedData && lastFetch) {
          const parsedData = JSON.parse(cachedData)
          const lastFetchMs = parseInt(lastFetch, 10)
          setWeatherData(parsedData)
          setLastFetchTime(lastFetchMs)

          const now = Date.now()
          const THIRTY_MINUTES = 30 * 60 * 1000 // 30 phút

          if (now - lastFetchMs < THIRTY_MINUTES) {
            setLoading(false)
            shouldFetchFresh = false

            // Nếu có vị trí đã lưu trước đó, khôi phục nó
            if (lastLocationString) {
              const lastLocation = JSON.parse(lastLocationString)
              setUserLocation(lastLocation)
              // Vẫn bắt đầu theo dõi vị trí, nhưng không gọi API ngay
              startLocationTracking()
            }
          }
        }

        // Luôn lấy vị trí mới, nhưng chỉ gọi API nếu cần
        if (shouldFetchFresh) {
          getCurrentLocation()
        }
      } catch (error) {
        console.error('Error initializing weather data:', error)
        getCurrentLocation()
      }
    }

    initWeatherData()

    // Dọn dẹp khi component unmount
    return () => {
      stopLocationTracking()
    }
  }, [])

  return {
    weatherData,
    loading,
    error,
    fetchWeatherData,
    checkAndUpdateWeatherIfNeeded,
    getCurrentLocation,
    userLocation,
    lastFetchTime
  }
}

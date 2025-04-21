import { useState, useEffect } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { BadWeatherData } from '@/types/badWeather'
import * as Location from 'expo-location'

const API_BASE = process.env.EXPO_PUBLIC_API_URL
const DEFAULT_LOCATION = 'Hanoi, vn'

export const useBadWeather = () => {
  const [weatherData, setWeatherData] = useState<BadWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
    cityName?: string
  } | null>(null)
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null)

  // Hàm lấy tên thành phố từ tọa độ
  const getCityNameFromCoordinates = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const geoLocation = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      })

      if (geoLocation && geoLocation.length > 0) {
        // Lấy city hoặc district hoặc subregion hoặc region, theo thứ tự ưu tiên
        const cityName =
          geoLocation[0].city ||
          geoLocation[0].district ||
          geoLocation[0].subregion ||
          geoLocation[0].region ||
          DEFAULT_LOCATION

        return cityName
      }
      return DEFAULT_LOCATION
    } catch (error) {
      console.error('Error getting city name:', error)
      return DEFAULT_LOCATION
    }
  }

  // Hàm gửi thông báo cảnh báo thời tiết
  const sendWeatherWarningNotification = async (warning: string) => {
    try {
      const { status } = await Notifications.getPermissionsAsync()

      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Cảnh báo thời tiết',
            body: warning,
            data: { type: 'weather-warning' }
          },
          trigger: null // Gửi ngay lập tức
        })
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

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

      const latitude = position.coords.latitude
      const longitude = position.coords.longitude

      // Lấy tên thành phố từ tọa độ
      const cityName = await getCityNameFromCoordinates(latitude, longitude)

      setUserLocation({
        latitude,
        longitude,
        cityName
      })

      // Gọi API thời tiết với tên thành phố
      fetchWeatherData({
        cityName
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
      async (location) => {
        const newLatitude = location.coords.latitude
        const newLongitude = location.coords.longitude

        // Kiểm tra xem vị trí có thay đổi đáng kể không
        if (
          !userLocation ||
          Math.abs(newLatitude - userLocation.latitude) > 0.01 ||
          Math.abs(newLongitude - userLocation.longitude) > 0.01
        ) {
          // Lấy tên thành phố từ tọa độ mới
          const newCityName = await getCityNameFromCoordinates(
            newLatitude,
            newLongitude
          )

          // Kiểm tra nếu tên thành phố thay đổi mới cập nhật
          if (
            !userLocation?.cityName ||
            newCityName !== userLocation.cityName
          ) {
            const newLocation = {
              latitude: newLatitude,
              longitude: newLongitude,
              cityName: newCityName
            }

            setUserLocation(newLocation)
            fetchWeatherData({ cityName: newCityName })
          }
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
    params: {
      latitude?: number
      longitude?: number
      cityName?: string
      useDefault?: boolean
    } = {}
  ) => {
    try {
      setLoading(true)

      let url = `${API_BASE}/bad-weather`

      // Thêm tham số vị trí nếu có
      if (params.cityName) {
        // Chỉ gửi tên thành phố, không gửi tên nước
        url += `?location=${encodeURIComponent(params.cityName)}`
      } else if (params.latitude && params.longitude) {
        // Nếu không có tên thành phố, gửi tọa độ
        url += `?lat=${params.latitude}&lon=${params.longitude}`
      } else if (params.useDefault) {
        url += `?location=${DEFAULT_LOCATION}`
      }

      const response = await axios.get(url)

      const data = response.data
      setWeatherData(data)
      setError(null)

      // Kiểm tra các cảnh báo và gửi thông báo nếu có
      if (data.warnings && data.warnings.length > 0) {
        sendWeatherWarningNotification(data.warnings[0])
      }

      // Lưu thời gian fetch data gần nhất
      const now = Date.now()
      setLastFetchTime(now)

      // Cache dữ liệu để sử dụng offline
      await AsyncStorage.setItem('cachedBadWeatherData', JSON.stringify(data))
      await AsyncStorage.setItem('lastBadWeatherFetchTime', now.toString())

      // Lưu vị trí đã dùng để gọi API
      if (userLocation) {
        await AsyncStorage.setItem(
          'lastBadWeatherLocation',
          JSON.stringify(userLocation)
        )
      }
    } catch (err) {
      console.error('Error fetching bad weather data:', err)
      setError('Không thể tải dữ liệu thời tiết')

      // Thử tải dữ liệu từ cache nếu có lỗi
      try {
        const cachedData = await AsyncStorage.getItem('cachedBadWeatherData')
        if (cachedData) {
          setWeatherData(JSON.parse(cachedData))
        }
      } catch (cacheError) {
        console.error('Error loading cached bad weather data:', cacheError)
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
      if (userLocation?.cityName) {
        fetchWeatherData({ cityName: userLocation.cityName })
      } else if (userLocation) {
        fetchWeatherData(userLocation)
      } else {
        getCurrentLocation()
      }
    }
  }

  // Tải dữ liệu khi hook được sử dụng lần đầu
  useEffect(() => {
    const initWeatherData = async () => {
      try {
        // Kiểm tra dữ liệu cache và thời gian cập nhật gần nhất
        const cachedData = await AsyncStorage.getItem('cachedBadWeatherData')
        const lastFetch = await AsyncStorage.getItem('lastBadWeatherFetchTime')
        const lastLocationString = await AsyncStorage.getItem(
          'lastBadWeatherLocation'
        )

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
        console.error('Error initializing bad weather data:', error)
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

import { useState, useEffect } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { BadWeatherData } from '@/types/badWeather'

const API_BASE = process.env.API_BASE_URL || 'http://172.11.153.128:3000/api/'

export const useBadWeather = () => {
  const [weatherData, setWeatherData] = useState<BadWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

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

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}bad-weather`)

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
      fetchWeatherData()
    }
  }

  // Tải dữ liệu khi hook được sử dụng lần đầu
  useEffect(() => {
    const initWeatherData = async () => {
      try {
        // Kiểm tra dữ liệu cache và thời gian cập nhật gần nhất
        const cachedData = await AsyncStorage.getItem('cachedBadWeatherData')
        const lastFetch = await AsyncStorage.getItem('lastBadWeatherFetchTime')

        if (cachedData && lastFetch) {
          const parsedData = JSON.parse(cachedData)
          const lastFetchMs = parseInt(lastFetch, 10)
          setWeatherData(parsedData)
          setLastFetchTime(lastFetchMs)

          const now = Date.now()
          const THIRTY_MINUTES = 30 * 60 * 1000 // 30 phút

          if (now - lastFetchMs < THIRTY_MINUTES) {
            setLoading(false)
            return
          }
        }

        // Không có cache hoặc cache đã cũ, tải dữ liệu mới
        fetchWeatherData()
      } catch (error) {
        console.error('Error initializing bad weather data:', error)
        fetchWeatherData()
      }
    }

    initWeatherData()
  }, [])

  return {
    weatherData,
    loading,
    error,
    fetchWeatherData,
    checkAndUpdateWeatherIfNeeded,
    lastFetchTime
  }
}

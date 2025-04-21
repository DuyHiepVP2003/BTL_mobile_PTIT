import { useState, useEffect } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WeatherData } from '@/types/weatherCard'

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://172.11.153.128:3000/api/'

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}weather`)

      const data = response.data
      setWeatherData(data)
      setError(null)

      // Lưu thời gian fetch data gần nhất
      const now = Date.now()
      setLastFetchTime(now)

      // Cache dữ liệu để sử dụng offline
      await AsyncStorage.setItem('cachedWeatherData', JSON.stringify(data))
      await AsyncStorage.setItem('lastFetchTime', now.toString())
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
      fetchWeatherData()
    }
  }

  // Tải dữ liệu khi hook được sử dụng lần đầu
  useEffect(() => {
    const initWeatherData = async () => {
      try {
        // Kiểm tra dữ liệu cache và thời gian cập nhật gần nhất
        const cachedData = await AsyncStorage.getItem('cachedWeatherData')
        const lastFetch = await AsyncStorage.getItem('lastFetchTime')

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
        console.error('Error initializing weather data:', error)
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

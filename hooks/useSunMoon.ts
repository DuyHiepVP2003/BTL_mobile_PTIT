import { useState, useEffect } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SunMoonData } from '@/types/sunmoonTypes'

const API_BASE = process.env.API_BASE_URL || 'http://172.11.153.128:3000/api/'

export const useSunMoon = () => {
  const [sunMoonData, setSunMoonData] = useState<SunMoonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  const fetchSunMoonData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}sun-moon`)

      const data = response.data
      setSunMoonData(data)
      setError(null)

      // Lưu thời gian fetch data gần nhất
      const now = Date.now()
      setLastFetchTime(now)

      // Cache dữ liệu để sử dụng offline
      await AsyncStorage.setItem('cachedSunMoonData', JSON.stringify(data))
      await AsyncStorage.setItem('lastSunMoonFetchTime', now.toString())
    } catch (err) {
      console.error('Error fetching sun-moon data:', err)
      setError('Không thể tải dữ liệu mặt trời và mặt trăng')

      // Thử tải dữ liệu từ cache nếu có lỗi
      try {
        const cachedData = await AsyncStorage.getItem('cachedSunMoonData')
        if (cachedData) {
          setSunMoonData(JSON.parse(cachedData))
        }
      } catch (cacheError) {
        console.error('Error loading cached sun-moon data:', cacheError)
      }
    } finally {
      setLoading(false)
    }
  }

  const checkAndUpdateDataIfNeeded = async () => {
    const now = Date.now()
    const SIX_HOURS = 6 * 60 * 60 * 1000 // 6 giờ - dữ liệu mặt trời, mặt trăng thay đổi chậm hơn

    if (now - lastFetchTime > SIX_HOURS) {
      fetchSunMoonData()
    }
  }

  // Tải dữ liệu khi hook được sử dụng lần đầu
  useEffect(() => {
    const initSunMoonData = async () => {
      try {
        // Kiểm tra dữ liệu cache và thời gian cập nhật gần nhất
        const cachedData = await AsyncStorage.getItem('cachedSunMoonData')
        const lastFetch = await AsyncStorage.getItem('lastSunMoonFetchTime')

        if (cachedData && lastFetch) {
          const parsedData = JSON.parse(cachedData)
          const lastFetchMs = parseInt(lastFetch, 10)
          setSunMoonData(parsedData)
          setLastFetchTime(lastFetchMs)

          const now = Date.now()
          const SIX_HOURS = 6 * 60 * 60 * 1000 // 6 giờ

          if (now - lastFetchMs < SIX_HOURS) {
            setLoading(false)
            return
          }
        }

        // Không có cache hoặc cache đã cũ, tải dữ liệu mới
        fetchSunMoonData()
      } catch (error) {
        console.error('Error initializing sun-moon data:', error)
        fetchSunMoonData()
      }
    }

    initSunMoonData()
  }, [])

  return {
    sunMoonData,
    loading,
    error,
    fetchSunMoonData,
    checkAndUpdateDataIfNeeded,
    lastFetchTime
  }
}

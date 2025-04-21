import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = process.env.EXPO_PUBLIC_API_URL

export const useWeather = () => {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getWeatherDetail = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `http://api.weatherapi.com/v1/current.json?key=7ee1943f1ded42e086784930252802&q=hanoi`
      )
      setWeather(res.data)
    } catch (err: any) {
      setError(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    getWeatherDetail()
  }, [])

  return {
    weather,
    loading,
    error,
    getWeatherDetail
  }
}

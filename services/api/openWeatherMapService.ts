import { weatherApiClient } from './client'

// Định nghĩa kiểu dữ liệu chính xác cho phản hồi từ OpenWeatherMap API
export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Format dữ liệu cho ứng dụng
export interface WeatherData {
  location: string
  country: string
  temperature: number
  condition: string
  conditionMain?: string // Added for icon mapping
  date: string
  day: string
  night: string
  humidity: number
  windSpeed: number
  windDeg: number  // Thêm để sử dụng trong bad-weather.tsx
  windGust?: number // Thêm từ API
  feelsLike: number
  rain?: number // Optional for rain data
  clouds?: number // Độ bao phủ của mây
  visibility?: number // Tầm nhìn xa
  pressure?: number // Áp suất
  sunrise?: number // Timestamp Unix của mặt trời mọc
  sunset?: number // Timestamp Unix của mặt trời lặn
  timezone?: number // Múi giờ
  dt?: number // Thời điểm cập nhật dữ liệu
  // Thêm thông tin đầy đủ từ API
  sys?: {
    sunrise: number;
    sunset: number;
    country: string;
  }
  main?: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  }
}

export class OpenWeatherMapService {
  /**
   * Get current weather data for a city
   * @param city - City name (can include country code: 'London,uk')
   * @param units - Units of measurement: 'metric' for Celsius
   */
  async getCurrentWeather(
    city: string,
    units: 'standard' | 'metric' | 'imperial' = 'metric'
  ): Promise<WeatherData> {
    try {
      const response = await weatherApiClient.get('/weather', {
        params: {
          q: city,
          units
        }
      })

      const data: WeatherResponse = response.data

      // Format date
      const currentDate = new Date()
      const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(currentDate)

      // Create temperature estimates for day and night
      // In a real app, this should come from forecast data
      const dayTemp = Math.round(data.main.temp_max)
      const nightTemp = Math.round(data.main.temp_min)

      // Calculate rain amount if available
      let rainAmount = 0
      if (data.rain && data.rain['1h']) {
        rainAmount = data.rain['1h']
      }

      return {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        conditionMain: data.weather[0].main,
        date: formattedDate,
        day: `Ngày ${dayTemp}°`,
        night: `Tối ${nightTemp}°`,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDeg: data.wind.deg, // Thêm độ góc của gió
        windGust: data.wind.gust ? Math.round(data.wind.gust * 3.6) : undefined, // Convert m/s to km/h if available
        feelsLike: Math.round(data.main.feels_like),
        rain: rainAmount > 0 ? rainAmount : undefined,
        clouds: data.clouds?.all, // Độ bao phủ của mây
        visibility: data.visibility ? Math.round(data.visibility / 1000) : undefined, // Convert m to km
        pressure: data.main.pressure,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone,
        dt: data.dt,
        // Thêm thông tin đầy đủ từ API
        sys: {
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          country: data.sys.country
        },
        main: {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          temp_min: data.main.temp_min,
          temp_max: data.main.temp_max,
          pressure: data.main.pressure,
          humidity: data.main.humidity
        }
      }
    } catch (error) {
      console.error('Error fetching current weather:', error)
      throw error
    }
  }

  /**
   * Get weather by geographic coordinates
   * @param lat - Latitude
   * @param lon - Longitude
   * @param units - Units of measurement: 'metric' for Celsius
   */
  async getWeatherByCoords(
    lat: number,
    lon: number,
    units: 'standard' | 'metric' | 'imperial' = 'metric'
  ): Promise<WeatherData> {
    try {
      const response = await weatherApiClient.get('/weather', {
        params: {
          lat,
          lon,
          units
        }
      })

      const data: WeatherResponse = response.data

      // Format date
      const currentDate = new Date()
      const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(currentDate)

      // Create temperature estimates for day and night
      const dayTemp = Math.round(data.main.temp_max)
      const nightTemp = Math.round(data.main.temp_min)

      // Calculate rain amount if available
      let rainAmount = 0
      if (data.rain && data.rain['1h']) {
        rainAmount = data.rain['1h']
      }

      return {
        location: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        conditionMain: data.weather[0].main,
        date: formattedDate,
        day: `Ngày ${dayTemp}°`,
        night: `Tối ${nightTemp}°`,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        windDeg: data.wind.deg, // Thêm độ góc của gió
        windGust: data.wind.gust ? Math.round(data.wind.gust * 3.6) : undefined, // Convert m/s to km/h if available
        feelsLike: Math.round(data.main.feels_like),
        rain: rainAmount > 0 ? rainAmount : undefined,
        clouds: data.clouds?.all, // Độ bao phủ của mây
        visibility: data.visibility ? Math.round(data.visibility / 1000) : undefined, // Convert m to km
        pressure: data.main.pressure,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone,
        dt: data.dt,
        // Thêm thông tin đầy đủ từ API
        sys: {
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          country: data.sys.country
        },
        main: {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          temp_min: data.main.temp_min,
          temp_max: data.main.temp_max,
          pressure: data.main.pressure,
          humidity: data.main.humidity
        }
      }
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error)
      throw error
    }
  }

  /**
   * Get icon URL from OpenWeatherMap icon code
   * @param iconCode - Weather icon code (e.g., '10d')
   * @param size - Size of icon: '2x' or '4x' for larger icons
   */
  getIconUrl(iconCode: string, size: '' | '2x' | '4x' = ''): string {
    const sizePrefix = size ? `@${size}` : ''
    return `https://openweathermap.org/img/wn/${iconCode}${sizePrefix}.png`
  }

  /**
   * Translate weather condition to Vietnamese
   * @param condition English condition text
   * @returns Vietnamese translation
   */
  translateCondition(condition: string): string {
    const translations: Record<string, string> = {
      'clear sky': 'Trời quang',
      'few clouds': 'Ít mây',
      'scattered clouds': 'Mây rải rác',
      'broken clouds': 'Nhiều mây',
      'overcast clouds': 'Trời nhiều mây',
      'light rain': 'Mưa nhẹ',
      'moderate rain': 'Mưa vừa',
      'heavy rain': 'Mưa to',
      'thunderstorm': 'Giông bão',
      'snow': 'Tuyết',
      'mist': 'Sương mù',
      'haze': 'Sương mờ',
      'fog': 'Sương mù dày đặc',
      'drizzle': 'Mưa phùn',
      'shower rain': 'Mưa rào'
    }

    return translations[condition.toLowerCase()] || condition
  }
}

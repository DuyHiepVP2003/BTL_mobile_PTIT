export interface BadWeatherData {
  airQuality: {
    index: number
    level: string
    color: [string, string]
  }
  uvIndex: {
    value: number
    level: string
    color: [string, string]
  }
  pressure: {
    value: number
    unit: string
    normal: boolean
    rotation: string
  }
  wind: {
    speed: number
    unit: string
    direction: string
    directionDeg: number
  }
  rainfall: {
    current: number
    unit: string
    forecast: string
  }
  feelsLike: {
    temperature: number
    unit: string
    description: string
  }
  humidity: {
    value: number
    unit: string
    description: string
  }
  _id: string
  __v: number
  condition: string
  country: string
  date: string
  day: string
  lastUpdated: string
  location: string
  night: string
  temperature: number
  warnings: string[]
}

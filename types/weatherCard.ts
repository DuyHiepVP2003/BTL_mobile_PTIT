export interface WeatherData {
  _id: string
  location: string
  country: string
  temperature: number
  condition: string
  date: string
  day: string
  night: string
  humidity: number
  windSpeed: number
  feelsLike: number
  lastUpdated?: string
}

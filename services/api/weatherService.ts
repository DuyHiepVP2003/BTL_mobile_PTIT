import { weatherApiClient } from './client';
import { WeatherResponse, ForecastResponse } from './types/weatherTypes';

export const weatherService = {
  /**
   * Get current weather for a city
   * @param city - City name (can include country code: 'London,uk')
   * @param units - Units of measurement: 'standard' (Kelvin), 'metric' (Celsius), or 'imperial' (Fahrenheit)
   */
  getCurrentWeather: async (
    city: string, 
    units: 'standard' | 'metric' | 'imperial' = 'metric'
  ): Promise<WeatherResponse> => {
    try {
      const response = await weatherApiClient.get('/weather', {
        params: {
          q: city,
          units: units
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },

  /**
   * Get weather by geographic coordinates
   * @param lat - Latitude
   * @param lon - Longitude
   * @param units - Units of measurement: 'standard' (Kelvin), 'metric' (Celsius), or 'imperial' (Fahrenheit)
   */
  getWeatherByCoords: async (
    lat: number, 
    lon: number, 
    units: 'standard' | 'metric' | 'imperial' = 'metric'
  ): Promise<WeatherResponse> => {
    try {
      const response = await weatherApiClient.get('/weather', {
        params: {
          lat,
          lon,
          units
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      throw error;
    }
  },

  /**
   * Get 5-day weather forecast
   * @param city - City name (can include country code: 'London,uk')
   * @param units - Units of measurement: 'standard' (Kelvin), 'metric' (Celsius), or 'imperial' (Fahrenheit)
   */
  getForecast: async (
    city: string, 
    units: 'standard' | 'metric' | 'imperial' = 'metric'
  ): Promise<ForecastResponse> => {
    try {
      const response = await weatherApiClient.get('/forecast', {
        params: {
          q: city,
          units: units
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },

  /**
   * Get weather data for multiple cities
   * @param ids - Array of city IDs
   * @param units - Units of measurement: 'standard' (Kelvin), 'metric' (Celsius), or 'imperial' (Fahrenheit) 
   */
  getMultiCityWeather: async (
    ids: number[], 
    units: 'standard' | 'metric' | 'imperial' = 'metric'
  ) => {
    try {
      const response = await weatherApiClient.get('/group', {
        params: {
          id: ids.join(','),
          units: units
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching multi-city weather:', error);
      throw error;
    }
  },

  /**
   * Helper method to convert temperature from Kelvin to Celsius
   * @param kelvin - Temperature in Kelvin
   */
  kelvinToCelsius: (kelvin: number): number => {
    return Math.round((kelvin - 273.15) * 10) / 10;
  },

  /**
   * Get icon URL from icon code
   * @param iconCode - Weather icon code (e.g., '10d')
   * @param size - Size of icon: '2x' or '4x' for larger icons
   */
  getIconUrl: (iconCode: string, size: '' | '2x' | '4x' = ''): string => {
    const sizePrefix = size ? `@${size}` : '';
    return `https://openweathermap.org/img/wn/${iconCode}${sizePrefix}.png`;
  }
};
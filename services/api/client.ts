import axios from 'axios';
import Constants from 'expo-constants';

// Access environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY_STUDENT_PACKAGE || 'e6b13c08b47832c3f134130da3c5cbbd';
const WEATHER_BASE_URL = process.env.WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5/';

// Create the API client with default configuration
export const weatherApiClient = axios.create({
  baseURL: WEATHER_BASE_URL,
  params: {
    appid: WEATHER_API_KEY,
  },
  timeout: 10000,
});

// Request interceptor
weatherApiClient.interceptors.request.use(
  (config) => {
    // You can add request logging or other operations here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
weatherApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);
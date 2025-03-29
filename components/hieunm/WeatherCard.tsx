import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform
} from 'react-native'
import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'

export const WeatherCard = () => {
  type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

  // This would come from your API in the future
  const weatherData = {
    location: 'Ha Noi, Viet Nam',
    temperature: 3,
    condition: 'Có mây', // Cloudy
    date: '08/03/2025, 16:14',
    day: 'Ngày 3°',
    night: 'Tối -1°',
    humidity: 78,
    windSpeed: 12,
    feelsLike: 1
  }

  // Function to determine which icon to display based on weather condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'có mây':
      case 'cloudy':
        return { name: 'cloudy', color: '#E0E0E0' }
      case 'có nắng':
      case 'sunny':
        return { name: 'sunny', color: '#FFD700' }
      case 'có mưa':
      case 'rainy':
        return { name: 'rainy', color: '#87CEFA' }
      case 'có tuyết':
      case 'snowy':
        return { name: 'snow', color: 'white' }
      case 'có sấm sét':
      case 'thunderstorm':
        return { name: 'thunderstorm', color: '#FFD700' }
      case 'có sương mù':
      case 'foggy':
        return { name: 'cloud', color: '#C0C0C0' }
      default:
        return { name: 'partly-sunny', color: '#FFD700' }
    }
  }

  const weatherIcon = getWeatherIcon(weatherData.condition)

  const handleSearch = () => {
    console.log('Search location')
    // Implement search functionality here
  }

  return (
    <ImageBackground
      source={require('../../assets/images/bg-weather-app.jpg')}
      style={styles.weatherCard}
      imageStyle={styles.backgroundImage}
    >
      {/* Semi-transparent overlay for better text readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
        style={styles.overlay}
      />

      {/* Header with location and search */}
      <View style={styles.locationContainer}>
        <View style={styles.locationTextContainer}>
          <Ionicons
            name="location"
            size={18}
            color="white"
            style={styles.locationIcon}
          />
          <Text style={styles.location}>{weatherData.location}</Text>
        </View>

        {/* Enhanced search button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint="light" style={styles.blurView}>
              <Ionicons name="search" size={22} color="white" />
            </BlurView>
          ) : (
            <View style={styles.searchButtonAndroid}>
              <Ionicons name="search" size={22} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main temperature display */}
      <View style={styles.temperatureContainer}>
        <View style={styles.mainTempContainer}>
          <Text style={styles.temperature}>{weatherData.temperature}°</Text>
          <Text style={styles.feelsLike}>
            Cảm giác như {weatherData.feelsLike}°
          </Text>
        </View>

        <View style={styles.conditionContainer}>
          <Ionicons
            name={weatherIcon.name as IoniconsName}
            size={80}
            color={weatherIcon.color}
            style={styles.weatherIcon}
          />
          <Text style={styles.condition}>{weatherData.condition}</Text>
        </View>
      </View>

      {/* Additional weather info */}
      <View style={styles.additionalInfoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="water-outline" size={18} color="white" />
          <Text style={styles.infoText}>{weatherData.humidity}%</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer-outline" size={18} color="white" />
          <Text style={styles.infoText}>{weatherData.windSpeed} km/h</Text>
        </View>
      </View>

      {/* Date display */}
      <Text style={styles.date}>{weatherData.date}</Text>

      {/* Forecast */}
      <View style={styles.forecastContainer}>
        <View style={styles.forecastItem}>
          <Ionicons
            name="sunny-outline"
            size={16}
            color="white"
            style={styles.forecastIcon}
          />
          <Text style={styles.forecastText}>{weatherData.day}</Text>
        </View>
        <View style={styles.forecastItem}>
          <Ionicons
            name="moon-outline"
            size={16}
            color="white"
            style={styles.forecastIcon}
          />
          <Text style={styles.forecastText}>{weatherData.night}</Text>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  weatherCard: {
    padding: 20,
    height: 350,
    borderRadius: 25,
    marginHorizontal: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  backgroundImage: {
    borderRadius: 25
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 25
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  locationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationIcon: {
    marginRight: 5
  },
  location: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  blurView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  searchButtonAndroid: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  mainTempContainer: {
    flexDirection: 'column'
  },
  temperature: {
    color: 'white',
    fontSize: 80,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  feelsLike: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: -10,
    marginLeft: 5
  },
  conditionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    padding: 10
  },
  weatherIcon: {
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  condition: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2
  },
  additionalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    padding: 10,
    alignSelf: 'flex-start'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  infoText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14
  },
  date: {
    color: 'white',
    fontSize: 14,
    marginTop: 15,
    opacity: 0.9,
    fontWeight: '500'
  },
  forecastContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 10
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5
  },
  forecastIcon: {
    marginRight: 5
  },
  forecastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '500'
  }
})

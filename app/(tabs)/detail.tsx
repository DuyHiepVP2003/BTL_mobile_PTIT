import {
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export default function TabTwoScreen() {
  const router = useRouter();
  // In the future, you'll need to fetch weather data from an API
  // and replace these hardcoded values with dynamic data
  const weatherData = {
    location: 'Ha Noi, Viet Nam',
    temperature: 3,
    condition: 'Có mây', // Cloudy
    date: '08/03/2025, 16:14',
    day: 'Ngày 3°',
    night: 'Tối -1°'
  }

  const handleClickSunMoon = () => {
    router.push('/hieunm/sunandmoon');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.locationContainer}>
          <Text style={styles.location}>{weatherData.location}</Text>
          <Ionicons name="search" size={24} color="white" />
        </View>

        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{weatherData.temperature}°</Text>
          <View style={styles.conditionContainer}>
            <Image
              source={require('../../assets/images/cwtch.jpg')}
              style={styles.weatherIcon}
            />
            <Text style={styles.condition}>{weatherData.condition}</Text>
          </View>
        </View>

        <Text style={styles.date}>{weatherData.date}</Text>

        <View style={styles.forecastContainer}>
          <Text style={styles.forecastText}>{weatherData.day}</Text>
          <Text style={styles.forecastText}>{weatherData.night}</Text>
        </View>
      </View>

      {/* Function Buttons */}
      <ScrollView style={styles.functionContainer}>
        <TouchableOpacity style={styles.functionButton} onPress={handleClickSunMoon}>
          <Text style={styles.buttonText}>
            Thông tin về mặt trời và mặt trăng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.functionButton}>
          <Text style={styles.buttonText}>Cảnh báo thời tiết xấu hôm nay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.functionButton}>
          <Text style={styles.buttonText}>Hướng dẫn sử dụng chatbot</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.functionButton}>
          <Text style={styles.buttonText}>Cài đặt thông báo cảnh báo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Chatbot Button */}
      <TouchableOpacity style={styles.chatbotButton}>
        <Ionicons name="chatbubbles-outline" size={28} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff'
  },
  weatherCard: {
    backgroundColor: '#6a3de8',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginTop: 10,
    height: 300,
    position: 'relative',
    overflow: 'hidden'
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  location: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500'
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30
  },
  temperature: {
    color: 'white',
    fontSize: 80,
    fontWeight: 'bold'
  },
  conditionContainer: {
    alignItems: 'center'
  },
  weatherIcon: {
    width: 60,
    height: 60,
    marginBottom: 5
  },
  condition: {
    color: 'white',
    fontSize: 18
  },
  date: {
    color: 'white',
    fontSize: 16,
    marginTop: 40
  },
  forecastContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20
  },
  forecastText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'right'
  },
  functionContainer: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  functionButton: {
    backgroundColor: '#e8e3f5',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500'
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute'
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8
  }
})

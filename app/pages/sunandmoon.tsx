import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, Stack } from 'expo-router'
import { WeatherCard } from '@/components/hieunm/WeatherCard'
import { ChatBotButton } from '@/components/hieunm/ChatBotButton'
import { LinearGradient } from 'expo-linear-gradient'
import Clock from '@/components/ui/icons/Clock'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { OpenWeatherMapService } from '@/services/api/openWeatherMapService'

const { width } = Dimensions.get('window')

// Interface for sun and moon data
interface SunMoonData {
  sunrise: string;
  sunset: string;
  dayLength: string;
  nightLength: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  moonPhasePercentage: string;
}

export default function SunAndMoonScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sunMoonData, setSunMoonData] = useState<SunMoonData>({
    sunrise: '7:00 AM',
    sunset: '6:49 PM',
    dayLength: '12:24',
    nightLength: '11:45',
    moonrise: '18:01',
    moonset: '7:21',
    moonPhase: 'Trăng tròn',
    moonPhasePercentage: '100%'
  })

  useEffect(() => {
    fetchSunMoonData()
  }, [])

  const fetchSunMoonData = async () => {
    try {
      setLoading(true)
      
      // Get the last searched city or default to Hanoi
      const savedCity = await AsyncStorage.getItem('lastCity') || 'Hanoi,vn'
      
      // Create service instance
      const weatherService = new OpenWeatherMapService()
      
      // Fetch weather data to get sunrise and sunset
      const weatherData = await weatherService.getCurrentWeather(savedCity)
      
      if (weatherData && weatherData.sys) {
        // Process sunrise and sunset times (convert from Unix timestamp to local time)
        const sunriseDate = new Date(weatherData.sys.sunrise * 1000)
        const sunsetDate = new Date(weatherData.sys.sunset * 1000)
        
        // Format times for display
        const formatTime = (date: Date) => {
          return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        }
        
        const sunrise = formatTime(sunriseDate)
        const sunset = formatTime(sunsetDate)
        
        // Calculate day length (in hours and minutes)
        const dayLengthMs = weatherData.sys.sunset * 1000 - weatherData.sys.sunrise * 1000
        const dayLengthHours = Math.floor(dayLengthMs / (1000 * 60 * 60))
        const dayLengthMinutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60))
        const dayLength = `${dayLengthHours}:${dayLengthMinutes.toString().padStart(2, '0')}`
        
        // Calculate night length (24h - day length)
        const nightLengthHours = 23 - dayLengthHours
        const nightLengthMinutes = 60 - dayLengthMinutes
        const nightLength = `${nightLengthHours}:${nightLengthMinutes.toString().padStart(2, '0')}`
        
        // Generate fake moonrise and moonset data (opposite of sun)
        // In reality, this should come from a proper astronomical calculation
        const moonrise = formatTime(new Date(sunsetDate.getTime() + 1000 * 60 * 30)) // 30 minutes after sunset
        const moonset = formatTime(new Date(sunriseDate.getTime() - 1000 * 60 * 30)) // 30 minutes before sunrise
        
        // Calculate approximate moon phase based on current date
        // This is a very simple approximation - real calculation would be more complex
        const date = new Date()
        const synodic = 29.5 // days in lunar cycle
        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
        const dayInCycle = dayOfYear % synodic
        const phasePercent = Math.round((dayInCycle / synodic) * 100)
        
        // Determine moon phase name based on percentage
        let moonPhase = 'Trăng mới'
        if (phasePercent > 0 && phasePercent < 25) {
          moonPhase = 'Trăng lưỡi liềm đầu tháng'
        } else if (phasePercent >= 25 && phasePercent < 45) {
          moonPhase = 'Trăng bán nguyệt đầu tháng'
        } else if (phasePercent >= 45 && phasePercent < 55) {
          moonPhase = 'Trăng tròn'
        } else if (phasePercent >= 55 && phasePercent < 75) {
          moonPhase = 'Trăng bán nguyệt cuối tháng'
        } else if (phasePercent >= 75) {
          moonPhase = 'Trăng lưỡi liềm cuối tháng'
        }
        
        setSunMoonData({
          sunrise,
          sunset,
          dayLength,
          nightLength,
          moonrise,
          moonset,
          moonPhase,
          moonPhasePercentage: `${phasePercent}%`
        })
        
        // Cache the data
        await AsyncStorage.setItem('cachedSunMoonData', JSON.stringify({
          sunrise,
          sunset,
          dayLength,
          nightLength,
          moonrise,
          moonset,
          moonPhase,
          moonPhasePercentage: `${phasePercent}%`,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Error fetching sun and moon data:', error)
      
      // Try to load from cache if API call fails
      try {
        const cachedData = await AsyncStorage.getItem('cachedSunMoonData')
        if (cachedData) {
          const parsedData = JSON.parse(cachedData)
          setSunMoonData(parsedData)
        }
      } catch (cacheError) {
        console.error('Error loading cached sun/moon data:', cacheError)
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to get moon phase icon based on phase percentage
  const getMoonPhaseIcon = (): string => {
    const percent = parseInt(sunMoonData.moonPhasePercentage) || 0
    
    if (percent < 5 || percent > 95) return "moon-outline" // New moon
    if (percent < 45) return "moon-outline" // Crescent or quarter
    if (percent < 55) return "moon" // Full moon
    if (percent < 95) return "moon-outline" // Quarter or crescent waning
    
    return "moon-outline"
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Weather Card at the top */}
        <WeatherCard />

        {/* Sun and Moon Information */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.infoContainer}>
              <Text style={styles.sectionHeader}>Giờ vàng</Text>

              {/* Sun Information */}
              <View style={styles.styleHour}>
                <View style={styles.styleColumn}>
                  <Text style={styles.sectionTitle}>Mặt trời mọc</Text>
                  <View style={styles.timeMoonSun}>
                    <Clock />
                    <Ionicons name="sunny-outline" size={30} color="#666" />
                    <Text style={styles.timeValue}>{sunMoonData.sunrise}</Text>
                  </View>
                </View>

                <View style={styles.styleColumn}>
                  <Text style={styles.sectionTitle}>Mặt trời lặn</Text>
                  <View style={styles.timeMoonSun}>
                    <Clock />
                    <Ionicons
                      name="partly-sunny-outline"
                      size={30}
                      color="#666"
                    />
                    <Text style={styles.timeValue}>{sunMoonData.sunset}</Text>
                  </View>
                </View>
              </View>

              {/* Day Length Information */}
              <View style={styles.styleHour}>
                <View style={styles.styleColumn}>
                  <Text style={styles.sectionTitle}>Độ dài ngày</Text>
                  <View style={styles.timeRow}>
                    <View style={styles.lineChart}>
                      <LinearGradient
                        colors={['#FFD700', '#FF9500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientLine}
                      />
                    </View>
                    <Text style={styles.timeValue}>{sunMoonData.dayLength}</Text>
                  </View>
                </View>

                <View style={styles.styleColumn}>
                  <Text style={styles.sectionTitle}>Độ dài đêm</Text>
                  <View style={styles.timeRow}>
                    <View style={styles.lineChart}>
                      <LinearGradient
                        colors={['#8E8E93', '#636366']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientLine}
                      />
                    </View>
                    <Text style={styles.timeValue}>
                      {sunMoonData.nightLength}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Moon Rise Information */}
              <View style={styles.styleHour}>
                <View style={styles.styleColumn}>
                  <Text style={styles.sectionTitle}>Mặt trăng mọc</Text>
                  <View style={styles.timeMoonSun}>
                    <Clock />
                    <View style={styles.lineChart}>
                      <LinearGradient
                        colors={['#C7C7CC', '#8E8E93']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientLine}
                      />
                    </View>
                    <Text style={styles.timeValue}>{sunMoonData.moonrise}</Text>
                  </View>
                </View>

                <View style={styles.styleColumn}>
                  <Text style={styles.sectionTitle}>Mặt trăng lặn</Text>
                  <View style={styles.timeMoonSun}>
                    <Clock />
                    <View style={styles.lineChart}>
                      <LinearGradient
                        colors={['#8E8E93', '#C7C7CC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientLine}
                      />
                    </View>
                    <Text style={styles.timeValue}>{sunMoonData.moonset}</Text>
                  </View>
                </View>
              </View>

              {/* Moon Phase Information */}
              <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                  <Text style={styles.sectionTitle}>Pha mặt trăng</Text>
                  <View style={styles.moonPhaseContainer}>
                    <View style={styles.moon}>
                      <Ionicons name={getMoonPhaseIcon() as any} size={24} color="#8E8E93" />
                    </View>
                    <View style={styles.moonPhaseTextContainer}>
                      <Text style={styles.moonPhaseText}>
                        {sunMoonData.moonPhase}
                      </Text>
                      <Text style={styles.moonPhasePercentage}>
                        {sunMoonData.moonPhasePercentage}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Pull to refresh hint */}
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={fetchSunMoonData}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color="#6200EE" />
                <Text style={styles.refreshText}>Làm mới dữ liệu</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ChatBot Button */}
        <ChatBotButton />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff',
    position: 'relative'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6200EE'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10
  },
  infoContainer: {
    marginBottom: 80, // Space for the ChatBotButton
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center'
  },
  infoRow: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16
  },
  styleHour: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20
  },
  infoColumn: {
    marginBottom: 16
  },
  styleColumn: {
    width: width / 3
  },
  timeMoonSun: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f5f0ff',
    borderRadius: 30,
    paddingVertical: 25,
    gap: 20
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12
  },
  lineChart: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
    overflow: 'hidden',
    marginLeft: 5
  },
  gradientLine: {
    flex: 1,
    borderRadius: 1
  },
  moonPhaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  moonIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  moonPhaseTextContainer: {
    marginLeft: 16
  },
  moon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f0ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  moonPhaseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  moonPhasePercentage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0e6ff'
  },
  refreshText: {
    marginLeft: 8,
    color: '#6200EE',
    fontSize: 14,
    fontWeight: '500'
  }
})

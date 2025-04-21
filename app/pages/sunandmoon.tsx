import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, Stack } from 'expo-router'
import { WeatherCard } from '@/components/hieunm/WeatherCard'
import { ChatBotButton } from '@/components/hieunm/ChatBotButton'
import { LinearGradient } from 'expo-linear-gradient'
import Clock from '@/components/ui/icons/Clock'
import { AppState, AppStateStatus } from 'react-native'
import { useSunMoon } from '@/hooks/useSunMoon'

const { width } = Dimensions.get('window')

export default function SunAndMoonScreen() {
  const router = useRouter()
  const { 
    sunMoonData, 
    loading, 
    error, 
    fetchSunMoonData, 
    checkAndUpdateDataIfNeeded
  } = useSunMoon()

  // Theo dõi trạng thái ứng dụng để cập nhật dữ liệu khi mở lại
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      checkAndUpdateDataIfNeeded();
    }
  };

  // Function to get moon phase icon based on phase percentage
  const getMoonPhaseIcon = (): string => {
    if (!sunMoonData) return "moon-outline"; 
    
    const percent = parseInt(sunMoonData.moonPhasePercentage) || 0;
    
    if (percent < 5 || percent > 95) return "moon-outline"; // New moon
    if (percent < 45) return "moon-outline"; // Crescent or quarter
    if (percent < 55) return "moon"; // Full moon
    if (percent < 95) return "moon-outline"; // Quarter or crescent waning
    
    return "moon-outline";
  }

  // Hiển thị trạng thái loading hoặc lỗi
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <WeatherCard />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
          <ChatBotButton />
        </SafeAreaView>
      </>
    );
  }
  
  if (error || !sunMoonData) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <WeatherCard />
          <View style={styles.loadingContainer}>
            <Ionicons name="cloud-offline" size={60} color="#6200EE" />
            <Text style={styles.errorText}>{error || 'Không thể tải dữ liệu'}</Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={fetchSunMoonData}
            >
              <Ionicons name="refresh" size={20} color="#6200EE" />
              <Text style={styles.refreshText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
          <ChatBotButton />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Weather Card at the top */}
        <WeatherCard />

        {/* Sun and Moon Information */}
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

            {/* Location and Date */}
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>{sunMoonData.location}</Text>
              <Text style={styles.dateText}>Ngày {sunMoonData.date}</Text>
            </View>

            {/* Refresh button */}
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
  errorText: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
    color: '#F44336',
    textAlign: 'center',
    paddingHorizontal: 20
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f5f0ff',
    borderRadius: 20
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
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

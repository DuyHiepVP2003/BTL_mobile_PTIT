import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { ChatBotButton } from '@/components/hieunm/ChatBotButton'
import { OpenWeatherMapService } from '@/services/api/openWeatherMapService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'

const { width } = Dimensions.get('window')
const cardWidth = width * 0.44

type colorArr = [string, string]

// Cấu hình thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
})

export default function BadWeatherScreen() {
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState({
    airQuality: {
      index: 0,
      level: 'Đang tải...',
      color: ['#4A90E2', '#D0021B']
    },
    uvIndex: {
      value: 0,
      level: 'Đang tải...',
      color: ['#4A90E2', '#9013FE']
    },
    pressure: {
      value: 0,
      unit: 'hPa',
      normal: true,
      rotation: '0deg'
    },
    wind: {
      speed: 0,
      unit: 'km/h',
      direction: 'B',
      directionDeg: 0
    },
    rainfall: {
      current: 0,
      unit: 'mm',
      forecast: 'Đang tải dự báo mưa...'
    },
    feelsLike: {
      temperature: 0,
      unit: '°',
      description: 'Đang tải...'
    },
    humidity: {
      value: 0,
      unit: '%',
      description: 'Đang tải...'
    },
    warnings: []
  })

  // Yêu cầu quyền gửi thông báo
  useEffect(() => {
    registerForPushNotificationsAsync()
  }, [])

  // Tải dữ liệu thời tiết khi component được mount
  useEffect(() => {
    fetchWeatherData()
  }, [])
  
  // Hàm xin quyền gửi thông báo
  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('weather-warnings', {
        name: 'Weather Warnings',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Thông báo',
        'Bạn cần cấp quyền thông báo để nhận cảnh báo thời tiết xấu!',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  }

  // Hàm gửi thông báo cảnh báo thời tiết
  async function sendWeatherWarningNotification(warning: string) {
    const hasPermission = await registerForPushNotificationsAsync();
    
    if (hasPermission) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Cảnh báo thời tiết',
          body: warning,
          data: { type: 'weather-warning' },
        },
        trigger: null // Gửi ngay lập tức
      });
    }
  }

  // Hàm phân tích dữ liệu thời tiết và tạo cảnh báo
  const analyzeWeatherWarnings = (data: any) => {
    const warnings = [];
    
    // Kiểm tra tốc độ gió
    if (data.wind.speed > 20) {
      warnings.push(`Cảnh báo gió mạnh: ${data.wind.speed}km/h. Hạn chế ra ngoài.`);
    }
    
    // Kiểm tra chỉ số UV
    if (data.uvIndex.value > 8) {
      warnings.push(`Chỉ số UV rất cao (${data.uvIndex.value}). Tránh tiếp xúc trực tiếp với ánh nắng.`);
    }
    
    // Kiểm tra lượng mưa
    if (data.rainfall.current > 10) {
      warnings.push(`Mưa to: ${data.rainfall.current}mm. Có thể gây ngập lụt cục bộ.`);
    }
    
    // Kiểm tra chất lượng không khí
    if (data.airQuality.index > 150) {
      warnings.push(`Chất lượng không khí kém (${data.airQuality.index}). Hạn chế hoạt động ngoài trời.`);
    }
    
    // Nếu có cảnh báo, gửi thông báo
    if (warnings.length > 0) {
      // Chỉ gửi thông báo cảnh báo đầu tiên
      sendWeatherWarningNotification(warnings[0]);
    }
    
    return warnings;
  };

  // Lấy dữ liệu thời tiết từ API
  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      
      // Lấy thành phố đã lưu từ lần trước (hoặc mặc định)
      const savedCity = await AsyncStorage.getItem('lastCity') || 'Hanoi,vn'
      
      // Tạo instance của service
      const weatherService = new OpenWeatherMapService()
      
      // Lấy dữ liệu thời tiết hiện tại
      const currentWeather = await weatherService.getCurrentWeather(savedCity)
      
      // Giả lập lấy dữ liệu chất lượng không khí (trong API thực tế sẽ gọi endpoint riêng)
      const aqi = Math.floor(Math.random() * 200); // Giả lập AQI ngẫu nhiên từ 0-200
      
      let aqiLevel = 'Tốt';
      let aqiColors: colorArr = ['#4CAF50', '#8BC34A']; // Xanh lá - tốt
      
      if (aqi > 50 && aqi <= 100) {
        aqiLevel = 'Trung bình';
        aqiColors = ['#FFEB3B', '#FFC107']; // Vàng - trung bình
      } else if (aqi > 100 && aqi <= 150) {
        aqiLevel = 'Không tốt cho nhóm nhạy cảm';
        aqiColors = ['#FF9800', '#F57C00']; // Cam - không tốt cho nhóm nhạy cảm
      } else if (aqi > 150) {
        aqiLevel = 'Không lành mạnh';
        aqiColors = ['#F44336', '#D32F2F']; // Đỏ - không lành mạnh
      }
      
      // Giả lập chỉ số UV (thực tế sẽ được lấy từ API)
      const uv = Math.floor(currentWeather.temperature / 10 * 3); // Giả lập dựa trên nhiệt độ
      
      let uvLevel = 'Thấp';
      let uvColors: colorArr = ['#4CAF50', '#8BC34A']; // Xanh lá - thấp
      
      if (uv > 2 && uv <= 5) {
        uvLevel = 'Trung bình';
        uvColors = ['#FFEB3B', '#FFC107']; // Vàng - trung bình
      } else if (uv > 5 && uv <= 7) {
        uvLevel = 'Cao';
        uvColors = ['#FF9800', '#F57C00']; // Cam - cao
      } else if (uv > 7) {
        uvLevel = 'Rất cao';
        uvColors = ['#F44336', '#D32F2F']; // Đỏ - rất cao
      }
      
      // Chuyển đổi hướng gió từ độ sang hướng
      const windDeg = currentWeather.windDeg; // Sử dụng trường windDeg đã thêm
      let windDirection = 'B'; // Bắc là mặc định
      
      if (windDeg > 45 && windDeg <= 135) {
        windDirection = 'Đ'; // Đông
      } else if (windDeg > 135 && windDeg <= 225) {
        windDirection = 'N'; // Nam
      } else if (windDeg > 225 && windDeg <= 315) {
        windDirection = 'T'; // Tây
      }
      
      // Kiểm tra có mưa không
      let rainfall = {
        current: 0,
        unit: 'mm',
        forecast: 'Không có mưa trong 24h tới.'
      };
      
      if (currentWeather.rain) {
        rainfall.current = currentWeather.rain;
        rainfall.forecast = `Dự kiến còn mưa ${Math.round(rainfall.current * 0.7)} mm trong 24h tới.`;
      } else if (currentWeather.conditionMain && currentWeather.conditionMain.toLowerCase().includes('rain')) {
        // Nếu không có dữ liệu mưa cụ thể nhưng mô tả thời tiết có mưa
        rainfall.current = 0.5;
        rainfall.forecast = 'Có thể có mưa nhẹ trong 24h tới.';
      }
      
      // Mô tả cảm giác nhiệt
      let feelsLikeDesc = 'Tương tự nhiệt độ thực tế.';
      if (currentWeather.feelsLike > currentWeather.temperature + 2) {
        feelsLikeDesc = 'Cảm giác nóng hơn nhiệt độ thực tế.';
      } else if (currentWeather.feelsLike < currentWeather.temperature - 2) {
        feelsLikeDesc = 'Cảm giác lạnh hơn nhiệt độ thực tế.';
      }
      
      // Mô tả độ ẩm
      let humidityDesc = 'Độ ẩm bình thường.';
      if (currentWeather.humidity > 70) {
        humidityDesc = 'Độ ẩm cao, cảm giác oi bức.';
      } else if (currentWeather.humidity < 30) {
        humidityDesc = 'Độ ẩm thấp, không khí khô.';
      }
      
      // Kiểm tra áp suất
      let pressureNormal = true;
      let pressureRotation = '0deg';
      
      if (currentWeather.pressure && currentWeather.pressure < 1000) {
        pressureNormal = false;
        pressureRotation = '-45deg'; // Kim áp kế chỉ xuống khi áp suất thấp
      } else if (currentWeather.pressure && currentWeather.pressure > 1020) {
        pressureNormal = false;
        pressureRotation = '45deg'; // Kim áp kế chỉ lên khi áp suất cao
      }
      
      // Cập nhật dữ liệu
      const updatedWeatherData = {
        airQuality: {
          index: aqi,
          level: aqiLevel,
          color: aqiColors
        },
        uvIndex: {
          value: uv,
          level: uvLevel,
          color: uvColors
        },
        pressure: {
          value: currentWeather.pressure || 1013, // Giá trị mặc định nếu không có dữ liệu
          unit: 'hPa',
          normal: pressureNormal,
          rotation: pressureRotation
        },
        wind: {
          speed: currentWeather.windSpeed,
          unit: 'km/h',
          direction: windDirection,
          directionDeg: windDeg
        },
        rainfall: rainfall,
        feelsLike: {
          temperature: currentWeather.feelsLike,
          unit: '°',
          description: feelsLikeDesc
        },
        humidity: {
          value: currentWeather.humidity,
          unit: '%',
          description: humidityDesc
        },
        warnings: []
      };
      
      // Phân tích dữ liệu để tạo cảnh báo
      const warnings = analyzeWeatherWarnings(updatedWeatherData);
      updatedWeatherData.warnings = warnings;
      
      setWeatherData(updatedWeatherData);
      
      // Cache dữ liệu
      await AsyncStorage.setItem('cachedBadWeatherData', JSON.stringify({
        data: updatedWeatherData,
        timestamp: Date.now()
      }));
      
    } catch (error) {
      console.error('Error fetching bad weather data:', error);
      
      // Thử tải dữ liệu cache nếu có lỗi
      try {
        const cachedData = await AsyncStorage.getItem('cachedBadWeatherData');
        if (cachedData) {
          const { data } = JSON.parse(cachedData);
          setWeatherData(data);
        }
      } catch (cacheError) {
        console.error('Error loading cached bad weather data:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Air Quality Card */}
          <View style={styles.airQualityCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="cloud-outline" size={20} color="#fff" />
              <Text style={styles.cardHeaderText}>CHẤT LƯỢNG KHÔNG KHÍ</Text>
            </View>
            <Text style={styles.airQualityValue}>
              {weatherData.airQuality.index} - {weatherData.airQuality.level}
            </Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={weatherData.airQuality.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBar, 
                  { width: `${Math.min(100, weatherData.airQuality.index / 3)}%` }
                ]}
              />
            </View>
          </View>
          
          {/* Warnings Section */}
          {weatherData.warnings.length > 0 && (
            <View style={styles.warningsCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="warning-outline" size={20} color="#fff" />
                <Text style={styles.cardHeaderText}>CẢNH BÁO THỜI TIẾT</Text>
              </View>
              {weatherData.warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Ionicons name="alert-circle" size={16} color="#FFF" style={styles.warningIcon} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Grid of smaller cards */}
          <View style={styles.cardsGrid}>
            {/* UV Index Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="sunny-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>CHỈ SỐ UV</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.uvIndex.value}
              </Text>
              <Text style={styles.smallCardDescription}>
                {weatherData.uvIndex.level}
              </Text>
              <View style={styles.smallProgressBarContainer}>
                <LinearGradient
                  colors={weatherData.uvIndex.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.smallProgressBar,
                    { width: `${Math.min(100, weatherData.uvIndex.value * 10)}%` }
                  ]}
                />
              </View>
            </View>

            {/* Pressure Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="speedometer-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>ÁP SUẤT</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.pressure.value} {weatherData.pressure.unit}
              </Text>
              <View style={styles.pressureGauge}>
                <View style={styles.gaugeCircle}>
                  <View 
                    style={[
                      styles.gaugeIndicator,
                      { transform: [{ rotate: weatherData.pressure.rotation }] }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Wind Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="leaf-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>GIÓ</Text>
              </View>
              <View style={styles.windDirection}>
                <Text style={styles.directionText}>B</Text>
                <View style={styles.directionRow}>
                  <Text style={styles.directionText}>T</Text>
                  <View style={styles.compassCircle}>
                    <View 
                      style={[
                        styles.compassNeedle,
                        { transform: [{ rotate: `${weatherData.wind.directionDeg}deg` }] }
                      ]} 
                    />
                  </View>
                  <Text style={styles.directionText}>Đ</Text>
                </View>
                <Text style={styles.directionText}>N</Text>
              </View>
              <Text style={styles.windSpeed}>
                {weatherData.wind.speed} {weatherData.wind.unit}
              </Text>
            </View>

            {/* Rainfall Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="water-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>LƯỢNG MƯA</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.rainfall.current} {weatherData.rainfall.unit}
              </Text>
              <Text style={styles.smallCardDescription}>trong giờ qua</Text>
              <Text style={styles.rainfallForecast}>
                {weatherData.rainfall.forecast}
              </Text>
            </View>

            {/* Feels Like Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="thermometer-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>CẢM GIÁC NHIỆT</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.feelsLike.temperature}
                {weatherData.feelsLike.unit}
              </Text>
              <Text style={styles.smallCardDescription}>
                {weatherData.feelsLike.description}
              </Text>
            </View>

            {/* Humidity Card */}
            <View style={styles.smallCard}>
              <View style={styles.smallCardHeader}>
                <Ionicons name="water-outline" size={16} color="#fff" />
                <Text style={styles.smallCardHeaderText}>ĐỘ ẨM</Text>
              </View>
              <Text style={styles.smallCardValue}>
                {weatherData.humidity.value}
                {weatherData.humidity.unit}
              </Text>
              <Text style={styles.smallCardDescription}>
                {weatherData.humidity.description}
              </Text>
            </View>
          </View>
          
          {/* Refresh Button */}
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchWeatherData}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color="#6200EE" />
            <Text style={styles.refreshText}>Làm mới dữ liệu</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* ChatBot Button */}
        <ChatBotButton />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  // Styles hiện tại
  container: {
    flex: 1,
    backgroundColor: '#f5f0ff'
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 80 // Space for ChatBotButton
  },
  airQualityCard: {
    backgroundColor: 'rgba(103, 80, 164, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  cardHeaderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  airQualityValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12
  },
  progressBar: {
    height: '100%',
    width: '60%' // This would be dynamic based on the actual value
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  seeMoreText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  smallCard: {
    width: cardWidth,
    backgroundColor: 'rgba(103, 80, 164, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  smallCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  smallCardHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  },
  smallCardValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  smallCardDescription: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4
  },
  smallProgressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 12
  },
  smallProgressBar: {
    height: '100%',
    width: '40%' // This would be dynamic based on the actual value
  },
  pressureGauge: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100
  },
  gaugeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gaugeIndicator: {
    width: 4,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }]
  },
  windDirection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8
  },
  directionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  compassCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  compassNeedle: {
    width: 2,
    height: 20,
    backgroundColor: '#fff',
    transform: [{ rotate: '0deg' }] // This would be dynamic based on the actual direction
  },
  windSpeed: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8
  },
  rainfallForecast: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8
  },
  
  // Thêm styles mới cho các tính năng mới
  warningsCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)', // Màu đỏ cho cảnh báo
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)'
  },
  warningIcon: {
    marginRight: 8
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    flex: 1
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20
  },
  refreshText: {
    marginLeft: 8,
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '500'
  }
})

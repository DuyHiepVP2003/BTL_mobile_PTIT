import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;

// API key for WeatherAPI.com
const API_KEY = "9a0e68b9dc00409597822254250303";

// Interfaces for data types
interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
}

interface DailyForecast {
  day: string;
  temp: number;
}

interface SunEvent {
  name: string;
  time: string;
  timeAgo: string;
}

export default function TemperatureDetailsScreen() {
  const router = useRouter();
  type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
  
  // State for real-time data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTemp, setCurrentTemp] = useState(0);
  const [feelsLike, setFeelsLike] = useState(0);
  const [location, setLocation] = useState('Đang tải...');
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [sunEvents, setSunEvents] = useState<SunEvent[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  
  // Fetch weather data on component mount
  useEffect(() => {
    fetchTemperatureData();
  }, []);
  
  // Function to fetch temperature data from API
  const fetchTemperatureData = async () => {
    try {
      setLoading(true);
      
      // Get current location
      const locationResult = await getCurrentLocation();
      const locationQuery = locationResult 
        ? `${locationResult.latitude},${locationResult.longitude}` 
        : 'Hanoi';
      
      // Fetch weather data from API
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${locationQuery}&days=7&aqi=no&alerts=no&lang=vi`
      );
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu thời tiết');
      }
      
      const data = await response.json();
      console.log("API Response:", JSON.stringify(data, null, 2));
      
      // Set location name
      setLocation(`${data.location.name}, ${data.location.country}`);
      
      // Set current temperature data
      setCurrentTemp(Math.round(data.current.temp_c));
      setFeelsLike(Math.round(data.current.feelslike_c));
      
      // Process hourly forecast data (next 5 hours)
      const now = new Date();
      const currentHour = now.getHours();
      
      const processedHourlyData = data.forecast.forecastday[0].hour
        .filter((hour: any) => {
          const hourTime = new Date(hour.time).getHours();
          return hourTime >= currentHour;
        })
        .slice(0, 5)
        .map((hour: any) => {
          const hourTime = new Date(hour.time).getHours();
          const ampm = hourTime >= 12 ? 'PM' : 'AM';
          const hour12 = hourTime % 12 || 12;
          return {
            time: `${hour12}${ampm}`,
            temp: Math.round(hour.temp_c),
            icon: getWeatherIconName(hour.condition.code)
          };
        });
      
      if (processedHourlyData.length < 5 && data.forecast.forecastday.length > 1) {
        // Add hours from next day if needed
        const nextDayHours = data.forecast.forecastday[1].hour
          .slice(0, 5 - processedHourlyData.length)
          .map((hour: any) => {
            const hourTime = new Date(hour.time).getHours();
            const ampm = hourTime >= 12 ? 'PM' : 'AM';
            const hour12 = hourTime % 12 || 12;
            return {
              time: `${hour12}${ampm}`,
              temp: Math.round(hour.temp_c),
              icon: getWeatherIconName(hour.condition.code)
            };
          });
        
        processedHourlyData.push(...nextDayHours);
      }
      
      setHourlyForecast(processedHourlyData);
      
      // Process daily forecast data
      const processedDailyData = data.forecast.forecastday.map((day: any) => {
        const date = new Date(day.date);
        const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return {
          day: dayNames[date.getDay()],
          temp: Math.round(day.day.avgtemp_c)
        };
      });
      
      setDailyForecast(processedDailyData);
      
      // Find current day index
      const today = new Date();
      const currentDay = today.getDay();
      setCurrentDayIndex(0); // Luôn hiển thị ngày đầu tiên là ngày hiện tại
      
      // Process sun events
      try {
        const sunrise = data.forecast.forecastday[0].astro.sunrise;
        const sunset = data.forecast.forecastday[0].astro.sunset;
        
        // Xử lý thời gian mặt trời mọc và lặn
        const sunriseTimeAgo = getSunEventTimeDescription(sunrise);
        const sunsetTimeAgo = getSunEventTimeDescription(sunset);
        
        const processedSunEvents = [
          { name: 'Bình minh', time: sunrise, timeAgo: sunriseTimeAgo },
          { name: 'Hoàng hôn', time: sunset, timeAgo: sunsetTimeAgo },
        ];
        
        setSunEvents(processedSunEvents);
      } catch (sunError) {
        console.error('Error processing sun events:', sunError);
        setSunEvents([
          { name: 'Bình minh', time: '06:00 AM', timeAgo: 'Không có dữ liệu' },
          { name: 'Hoàng hôn', time: '06:00 PM', timeAgo: 'Không có dữ liệu' },
        ]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching temperature data:', err);
      setError('Không thể tải dữ liệu nhiệt độ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        return null;
      }
      
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (err) {
      console.error('Error getting location:', err);
      return null;
    }
  };
  
  // Convert 12-hour time format to 24-hour
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    let hoursNum = parseInt(hours, 10);
    
    if (modifier === 'PM' && hoursNum < 12) {
      hoursNum += 12;
    }
    if (modifier === 'AM' && hoursNum === 12) {
      hoursNum = 0;
    }
    
    return { hours: hoursNum, minutes: parseInt(minutes, 10) };
  };
  
  // Calculate time ago or time until
  const getTimeAgo = (now: Date, eventTime: Date) => {
    const diffMs = eventTime.getTime() - now.getTime();
    const diffHours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
    
    if (diffMs < 0) {
      return `${diffHours} giờ trước`;
    } else {
      return `${diffHours} giờ tới`;
    }
  };
  
  // Get weather icon based on condition code - Sửa têm hàm để tránh xung đột
  const getWeatherIconName = (conditionCode: number): string => {
    // Mã điều kiện thời tiết từ WeatherAPI.com
    if (conditionCode === 1000) { // Sunny/Clear
      return 'sunny';
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) { // Rain
      return 'rainy';
    } else if ([1003, 1006, 1009, 1030, 1069, 1087, 1135, 1273, 1276, 1279, 1282].includes(conditionCode)) { // Cloudy
      return 'cloudy';
    } else if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) { // Snow
      return 'snow';
    } else if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) { // Thunder
      return 'thunderstorm';
    } else {
      return 'partly-sunny';
    }
  };

  // Render custom temperature chart
  const renderTemperatureChart = () => {
    if (dailyForecast.length === 0) {
      return null;
    }
    
    const chartWidth = screenWidth - 55;
    const chartHeight = 180;
    const paddingHorizontal = 20;
    const paddingVertical = 20;
    const graphWidth = chartWidth - (paddingHorizontal * 2);
    const graphHeight = chartHeight - (paddingVertical * 2) - 20; // Thêm không gian cho nhãn ngày
    
    // Find min and max values for scaling
    const temps = dailyForecast.map(day => day.temp);
    const minTemp = Math.min(...temps) - 5; // Biên thấp = nhiệt độ thấp nhất - 10
    const maxTemp = Math.max(...temps) + 5; // Biên cao = nhiệt độ cao nhất + 10
    const range = maxTemp - minTemp;
    
    // Calculate points for the path
    let pathData = '';
    const points = dailyForecast.map((day, index) => {
      const x = paddingHorizontal + (index * (graphWidth / (dailyForecast.length - 1)));
      // Invert Y coordinate (SVG 0,0 is top-left)
      const y = paddingVertical + graphHeight - ((day.temp - minTemp) / range * graphHeight);
      if (index === 0) {
        pathData = `M ${x} ${y}`;
      } else {
        // Use bezier curves for smoother lines
        const prevDay = dailyForecast[index - 1];
        const prevX = paddingHorizontal + ((index - 1) * (graphWidth / (dailyForecast.length - 1)));
        const prevY = paddingVertical + graphHeight - ((prevDay.temp - minTemp) / range * graphHeight);
        
        const cpX1 = prevX + (x - prevX) / 2;
        const cpX2 = prevX + (x - prevX) / 2;
        
        pathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }
      return { x, y, temp: day.temp, day: day.day };
    });
    
    // Tính các giá trị nhiệt độ cho grid lines
    const tempStep = Math.ceil(range / 4); // Chia thành 4 khoảng
    const gridTemps = [];
    
    // Tạo các giá trị nhiệt độ cho grid lines
    for (let temp = minTemp; temp <= maxTemp; temp += tempStep) {
      gridTemps.push(Math.round(temp));
    }
    
    // Đảm bảo có giá trị nhiệt độ cao nhất
    if (gridTemps[gridTemps.length - 1] < maxTemp) {
      gridTemps.push(Math.round(maxTemp));
    }
    
    // Draw horizontal grid lines
    const gridLines = gridTemps.map((temp, index) => {
      const y = paddingVertical + graphHeight - ((temp - minTemp) / range * graphHeight);
      return (
        <Line
          key={index}
          x1={paddingHorizontal}
          y1={y}
          x2={chartWidth - paddingHorizontal}
          y2={y}
          stroke="#ccc"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      );
    });
    
    // Thêm grid line labels (nhiệt độ)
    const gridLabels = gridTemps.map((temp, index) => {
      const y = paddingVertical + graphHeight - ((temp - minTemp) / range * graphHeight);
      return (
        <SvgText
          key={`label-${index}`}
          x={paddingHorizontal - 5}
          y={y + 4}
          fontSize="10"
          fill="#666"
          textAnchor="end"
        >
          {temp}°
        </SvgText>
      );
    });
    
    // Current day marker
    const currentX = paddingHorizontal + (currentDayIndex * (graphWidth / (dailyForecast.length - 1)));
    const currentY = paddingVertical + graphHeight - ((dailyForecast[currentDayIndex].temp - minTemp) / range * graphHeight);
    
    return (
      <View style={{ marginVertical: 10 }}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Background */}
          <Rect
            x={paddingHorizontal}
            y={paddingVertical}
            width={graphWidth}
            height={graphHeight}
            fill="#f8f0ff"
            rx={8}
          />
          
          {/* Grid lines */}
          {gridLines}
          
          {/* Grid labels */}
          {gridLabels}
          
          {/* Temperature line */}
          <Path
            d={pathData}
            fill="none"
            stroke="#6a3093"
            strokeWidth="2.5"
          />
          
          {/* Current day vertical line */}
          <Line
            x1={currentX}
            y1={paddingVertical}
            x2={currentX}
            y2={paddingVertical + graphHeight}
            stroke="#6a3093"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
          
          {/* Current point */}
          <Circle
            cx={currentX}
            cy={currentY}
            r="6"
            fill="#6a3093"
            stroke="#fff"
            strokeWidth="2"
          />
          
          {/* Day labels - Hiển thị ngày và ngày tháng */}
          {dailyForecast.map((day, index) => {
            const x = paddingHorizontal + (index * (graphWidth / (dailyForecast.length - 1)));
            // Tách nhãn ngày thành hai dòng
            const dayParts = day.day.split('\n');
            return (
              <>
                <SvgText
                  key={`day-${index}`}
                  x={x}
                  y={chartHeight - 20}
                  fontSize="10"
                  fill="#333"
                  textAnchor="middle"
                >
                  {dayParts[0]}
                </SvgText>
                <SvgText
                  key={`date-${index}`}
                  x={x}
                  y={chartHeight - 8}
                  fontSize="9"
                  fill="#666"
                  textAnchor="middle"
                >
                  {dayParts[1]}
                </SvgText>
              </>
            );
          })}
          
          {/* Value label for current point */}
          <Circle
            cx={currentX}
            cy={currentY}
            r="16"
            fill="#f0f0f0"
            opacity="0.8"
          />
          <SvgText
            x={currentX}
            y={currentY + 4}
            fontSize="12"
            fill="#333"
            fontWeight="bold"
            textAnchor="middle"
          >
            {dailyForecast[currentDayIndex].temp}°
          </SvgText>
        </Svg>
      </View>
    );
  };

  // Show loading indicator
  if (loading) {
    return (
      <LinearGradient
        colors={['#e0c3ff', '#d9c2ff']}
        style={[styles.container, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#6a3093" />
        <Text style={styles.loadingText}>Đang tải dữ liệu nhiệt độ...</Text>
      </LinearGradient>
    );
  }

  // Show error message
  if (error) {
    return (
      <LinearGradient
        colors={['#e0c3ff', '#d9c2ff']}
        style={[styles.container, styles.errorContainer]}
      >
        <Ionicons name="cloud-offline" size={60} color="#6a3093" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchTemperatureData}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#e0c3ff', '#d9c2ff']}
      style={styles.container}
    >
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{location}</Text>
          <TouchableOpacity onPress={fetchTemperatureData}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Current temperature - Organized in a clear block */}
        <View style={styles.infoBlock}>
          <View style={styles.currentInfo}>
            <Ionicons name="thermometer-outline" size={24} color="#333" />
            <Text style={styles.infoLabel}>Nhiệt độ</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.infoValue}>{currentTemp}°</Text>
            <Text style={styles.feelTemp}>Cảm nhận {feelsLike}°</Text>
            <View style={styles.weatherIcon}>
              <Ionicons name="partly-sunny" size={60} color="#FFD700" />
            </View>
          </View>
        </View>

        {/* Hourly forecast */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="time-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Dự báo theo giờ</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.hourlyContainer}>
              {hourlyForecast.map((item, index) => (
                <View key={index} style={styles.hourlyItem}>
                  <Text style={styles.hourlyTime}>{item.time}</Text>
                  <Ionicons name={item.icon as IoniconsName} size={24} color="#6a3093" style={styles.hourlyIcon} />
                  <Text style={styles.hourlyTemp}>{item.temp}°</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Daily forecast */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Dự báo 7 ngày tới</Text>
          </View>
          
          <View style={styles.chartContainer}>
            {renderTemperatureChart()}
          </View>
        </View>

        {/* Sun events */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="sunny-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Bình minh & Hoàng hôn</Text>
          </View>
          
          <View style={styles.sunEventsContainer}>
            {sunEvents.map((event, index) => (
              <View key={index} style={styles.sunEvent}>
                <Ionicons 
                  name={event.name === 'Bình minh' ? 'sunny-outline' : 'partly-sunny-outline'} 
                  size={24} 
                  color="#6a3093" 
                />
                <View style={styles.sunEventInfo}>
                  <Text style={styles.sunEventName}>{event.name}</Text>
                  <Text style={styles.sunEventTime}>{event.time}</Text>
                  <Text style={styles.sunEventTimeAgo}>{event.timeAgo}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0e6ff',
    paddingTop: 32,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6a3093',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6a3093',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6a3093',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  mainInfo: {
    position: 'relative',
    marginBottom: 10,
  },
  infoValue: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  feelTemp: {
    fontSize: 16,
    color: '#555',
    marginTop: -10,
  },
  weatherIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  hourlyContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 24,
    minWidth: 50,
  },
  hourlyTime: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  hourlyIcon: {
    marginVertical: 8,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisLabels: {
    marginRight: 5,
    height: 150,
    justifyContent: 'space-between',
  },
  yAxisValue: {
    fontSize: 10,
    color: '#666',
    width: 25,
    textAlign: 'right',
  },
  sunEventsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sunEvent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunEventInfo: {
    marginLeft: 12,
  },
  sunEventName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  sunEventTime: {
    fontSize: 16,
    color: '#333',
    marginVertical: 4,
  },
  sunEventTimeAgo: {
    fontSize: 12,
    color: '#666',
  },
});
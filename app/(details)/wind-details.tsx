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

// Interface cho dữ liệu gió theo giờ
interface HourlyWindData {
  hour: number;
  value: number;
}

export default function WindDetailsScreen() {
  const router = useRouter();
  
  // State for real-time data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWind, setCurrentWind] = useState(0);
  const [windDirection, setWindDirection] = useState('');
  const [location, setLocation] = useState('Đang tải...');
  const [hourlyData, setHourlyData] = useState<HourlyWindData[]>([]);
  const [windSummary, setWindSummary] = useState('');
  const [currentHour, setCurrentHour] = useState(0);
  
  // Fetch weather data on component mount
  useEffect(() => {
    fetchWindData();
  }, []);
  
  // Function to fetch wind data from API
  const fetchWindData = async () => {
    try {
      setLoading(true);
      
      // Get current location
      const locationResult = await getCurrentLocation();
      const locationQuery = locationResult 
        ? `${locationResult.latitude},${locationResult.longitude}` 
        : 'Hanoi';
      
      // Fetch weather data from API
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${locationQuery}&days=1&aqi=no&alerts=no&lang=vi`
      );
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu thời tiết');
      }
      
      const data = await response.json();
      
      // Set location name
      setLocation(`${data.location.name}, ${data.location.country}`);
      
      // Set current wind data
      setCurrentWind(Math.round(data.current.wind_kph));
      setWindDirection(data.current.wind_dir);
      
      // Get current hour
      const now = new Date();
      const currentHourValue = now.getHours();
      setCurrentHour(currentHourValue);
      
      // Process hourly wind data
      const processedHourlyData = data.forecast.forecastday[0].hour.map(hourData => {
        const hourTime = new Date(hourData.time).getHours();
        return {
          hour: hourTime,
          value: Math.round(hourData.wind_kph)
        };
      });
      
      setHourlyData(processedHourlyData);
      
      // Create wind summary
      const minWind = Math.min(...processedHourlyData.map(item => item.value));
      const maxWind = Math.max(...processedHourlyData.map(item => item.value));
      
      setWindSummary(
        `Gió hiện tại đang thổi với tốc độ ${Math.round(data.current.wind_kph)} km/h từ hướng ${getWindDirectionInVietnamese(data.current.wind_dir)}. Hôm nay, tốc độ gió dao động từ ${minWind} đến ${maxWind} km/h.`
      );
      
      setError(null);
    } catch (err) {
      console.error('Error fetching wind data:', err);
      setError('Không thể tải dữ liệu gió. Vui lòng thử lại sau.');
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
  
  // Convert wind direction to Vietnamese
  const getWindDirectionInVietnamese = (direction: string) => {
    const directions: Record<string, string> = {
      'N': 'bắc',
      'NNE': 'bắc đông bắc',
      'NE': 'đông bắc',
      'ENE': 'đông đông bắc',
      'E': 'đông',
      'ESE': 'đông đông nam',
      'SE': 'đông nam',
      'SSE': 'nam đông nam',
      'S': 'nam',
      'SSW': 'nam tây nam',
      'SW': 'tây nam',
      'WSW': 'tây tây nam',
      'W': 'tây',
      'WNW': 'tây tây bắc',
      'NW': 'tây bắc',
      'NNW': 'bắc tây bắc'
    };
    
    return directions[direction] || direction;
  };

  // Render custom wind chart
  const renderWindChart = () => {
    const chartWidth = screenWidth - 90;
    const chartHeight = 180;
    const paddingHorizontal = 10;
    const paddingVertical = 20;
    const graphWidth = chartWidth - (paddingHorizontal * 2);
    const graphHeight = chartHeight - (paddingVertical * 2);
    
    // Find min and max values for scaling
    const maxValue = 50; // Fixed max for scale
    
    // Calculate points for the path
    let pathData = '';
    const points = hourlyData.map((item, index) => {
      const x = paddingHorizontal + (item.hour * (graphWidth / 24));
      // Invert Y coordinate (SVG 0,0 is top-left)
      const y = paddingVertical + graphHeight - (item.value / maxValue * graphHeight);
      if (index === 0) {
        pathData = `M ${x} ${y}`;
      } else {
        // Use bezier curves for smoother lines
        const prevPoint = hourlyData[index - 1];
        const prevX = paddingHorizontal + (prevPoint.hour * (graphWidth / 24));
        const prevY = paddingVertical + graphHeight - (prevPoint.value / maxValue * graphHeight);
        
        const cpX1 = prevX + (x - prevX) / 2;
        const cpX2 = prevX + (x - prevX) / 2;
        
        pathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }
      return { x, y, value: item.value, hour: item.hour };
    });
    
    // Draw horizontal grid lines
    const gridLines = [0, 10, 20, 30, 40, 50].map((value, index) => {
      const y = paddingVertical + graphHeight - (value / maxValue * graphHeight);
      return (
        <Line
          key={index}
          x1={paddingHorizontal}
          y1={y}
          x2={chartWidth - paddingHorizontal}
          y2={y}
          stroke="#ccc"
          strokeWidth="1"
          strokeDasharray={index === 0 ? "" : "3,3"}
        />
      );
    });
    
    // Current time marker
    const currentX = paddingHorizontal + (currentHour * (graphWidth / 24));
    
    // Find current wind value
    const currentPoint = hourlyData.find(item => item.hour === currentHour) || { value: 0 };
    const currentY = paddingVertical + graphHeight - (currentPoint.value / maxValue * graphHeight);
    
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
          
          {/* Wind speed line */}
          <Path
            d={pathData}
            fill="none"
            stroke="#6a3093"
            strokeWidth="2.5"
          />
          
          {/* Current time vertical line */}
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
          
          {/* Hour labels */}
          {[0, 6, 12, 18, 24].map((hour, index) => {
            const x = paddingHorizontal + (hour * (graphWidth / 24));
            return (
              <SvgText
                key={index}
                x={x}
                y={chartHeight - 5}
                fontSize="12"
                fill="#333"
                textAnchor="middle"
              >
                {hour}
              </SvgText>
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
            {currentPoint.value}
          </SvgText>
        </Svg>
        
        <Text style={styles.chartXLabel}>giờ</Text>
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
        <Text style={styles.loadingText}>Đang tải dữ liệu gió...</Text>
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
          onPress={fetchWindData}
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
          <TouchableOpacity onPress={fetchWindData}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Current wind speed - Organized in a clear block */}
        <View style={styles.infoBlock}>
          <View style={styles.currentInfo}>
            <MaterialCommunityIcons name="weather-windy" size={24} color="#333" />
            <Text style={styles.infoLabel}>Tốc độ gió</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.infoValue}>{currentWind}km/h</Text>
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
          
          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              <Text style={styles.yAxisLabel}>km/h</Text>
              <Text style={styles.yAxisValue}>50</Text>
              <Text style={styles.yAxisValue}>40</Text>
              <Text style={styles.yAxisValue}>30</Text>
              <Text style={styles.yAxisValue}>20</Text>
              <Text style={styles.yAxisValue}>10</Text>
              <Text style={styles.yAxisValue}>0</Text>
            </View>
            
            {renderWindChart()}
          </View>
        </View>

        {/* Daily summary */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Tóm tắt hàng ngày</Text>
          </View>
          
          <Text style={styles.summaryText}>
            {windSummary}
          </Text>
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
    paddingBottom:15,
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisLabels: {
    marginRight: 5,
    height: 150,
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  yAxisValue: {
    fontSize: 10,
    color: '#666',
    width: 20,
    textAlign: 'right',
  },
  chartXLabel: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
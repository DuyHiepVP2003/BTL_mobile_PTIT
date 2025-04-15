import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;
const API_KEY = "9a0e68b9dc00409597822254250303"; // API key for WeatherAPI.com

export default function UVDetailsScreen() {
  const router = useRouter();
  
  // State for real-time data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUV, setCurrentUV] = useState(7);
  const [location, setLocation] = useState('Hà Nội, Việt Nam');
  const [hourlyData, setHourlyData] = useState([
    { hour: 0, value: 0 },
    { hour: 3, value: 0 },
    { hour: 6, value: 2 },
    { hour: 9, value: 5 },
    { hour: 12, value: 8 },
    { hour: 15, value: 6 },
    { hour: 18, value: 3 },
    { hour: 21, value: 0 },
    { hour: 24, value: 0 },
  ]);
  const [currentHour, setCurrentHour] = useState(15);
  const [maxUV, setMaxUV] = useState({ value: 8, hour: 12 });

  // UV index descriptions
  const uvLevels = [
    { level: "Thấp", range: "0-2", color: "#3EC73E", description: "Không cần bảo vệ" },
    { level: "Trung bình", range: "3-5", color: "#F8E61D", description: "Nên dùng kem chống nắng" },
    { level: "Cao", range: "6-7", color: "#F6921E", description: "Cần bảo vệ da và mắt" },
    { level: "Rất cao", range: "8-10", color: "#ED1C24", description: "Hạn chế ra ngoài" },
    { level: "Cực kỳ cao", range: "11+", color: "#9A1AB2", description: "Tránh ra ngoài" }
  ];

  // Get current UV level
  const currentUVLevel = uvLevels.find(level => {
    const [min, max] = level.range.split('-');
    if (max.includes('+')) {
      return currentUV >= parseInt(min);
    }
    return currentUV >= parseInt(min) && currentUV <= parseInt(max);
  });

  // Fetch weather data on component mount
  useEffect(() => {
    fetchUVData();
  }, []);
  
  // Function to fetch UV data from API
  const fetchUVData = async () => {
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
      console.log("API Response:", JSON.stringify(data, null, 2));
      
      // Set location name
      setLocation(`${data.location.name}, ${data.location.country}`);
      
      // Set current UV data
      setCurrentUV(data.current.uv);
      
      // Process hourly UV data
      const now = new Date();
      const currentHour = now.getHours();
      setCurrentHour(currentHour);
      
      // Get hourly data from API
      const processedHourlyData = [];
      
      // Create data points for every 3 hours
      for (let hour = 0; hour <= 24; hour += 3) {
        let uvValue = 0;
        
        if (hour === 24) {
          // For hour 24, use the first hour of next day
          uvValue = 0; // Usually UV is 0 at midnight
        } else {
          // Find the closest hour in the API data
          const hourData = data.forecast.forecastday[0].hour.find(
            (h: any) => new Date(h.time).getHours() === hour
          );
          
          if (hourData) {
            uvValue = hourData.uv;
          }
        }
        
        processedHourlyData.push({
          hour: hour,
          value: uvValue
        });
      }
      
      setHourlyData(processedHourlyData);
      
      // Find max UV for the day
      const uvValues = data.forecast.forecastday[0].hour.map((hour: any) => ({
        value: hour.uv,
        hour: new Date(hour.time).getHours()
      }));
      
      const maxUVData = uvValues.reduce((max: any, current: any) => 
        current.value > max.value ? current : max, 
        { value: 0, hour: 0 }
      );
      
      setMaxUV(maxUVData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching UV data:', err);
      setError('Không thể tải dữ liệu UV. Vui lòng thử lại sau.');
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

  // Render custom UV chart
  const renderUVChart = () => {
    const chartWidth = screenWidth - 90;
    const chartHeight = 180;
    const paddingHorizontal = 10;
    const paddingVertical = 20;
    const graphWidth = chartWidth - (paddingHorizontal * 2);
    const graphHeight = chartHeight - (paddingVertical * 2);
    
    // Find min and max values for scaling
    const maxValue = 12; // Fixed max for UV scale
    
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
    const gridLines = [0, 3, 6, 9, 12].map((value, index) => {
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
    const currentY = paddingVertical + graphHeight - (currentUV / maxValue * graphHeight);
    
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
          
          {/* UV index line */}
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
            fill={currentUVLevel?.color || "#6a3093"}
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
            {currentUV}
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
        <Text style={styles.loadingText}>Đang tải dữ liệu UV...</Text>
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
          onPress={fetchUVData}
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
          <TouchableOpacity onPress={fetchUVData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Current UV index - Organized in a clear block */}
        <View style={styles.infoBlock}>
          <View style={styles.currentInfo}>
            <Ionicons name="sunny" size={24} color="#333" />
            <Text style={styles.infoLabel}>Chỉ số UV</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.infoValue}>{currentUV}</Text>
            <View style={styles.uvLevelContainer}>
              <Text style={[styles.uvLevel, { color: currentUVLevel?.color }]}>
                {currentUVLevel?.level}
              </Text>
              <Text style={styles.uvDescription}>{currentUVLevel?.description}</Text>
            </View>
            <View style={styles.weatherIcon}>
              <Ionicons name="sunny" size={60} color="#FFD700" />
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
              <Text style={styles.yAxisLabel}>UV</Text>
              <Text style={styles.yAxisValue}>12</Text>
              <Text style={styles.yAxisValue}>9</Text>
              <Text style={styles.yAxisValue}>6</Text>
              <Text style={styles.yAxisValue}>3</Text>
              <Text style={styles.yAxisValue}>0</Text>
            </View>
            
            {renderUVChart()}
          </View>
        </View>
        
        {/* Daily summary */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Tóm tắt hàng ngày</Text>
          </View>
          
          <Text style={styles.summaryText}>
            Chỉ số UV hiện tại là <Text style={styles.highlightText}>{currentUV}</Text>, ở mức <Text style={styles.highlightText}>{currentUVLevel?.level}</Text>. {currentUVLevel?.description}. 
            Chỉ số UV cao nhất trong ngày là <Text style={styles.highlightText}>{maxUV.value}</Text>, dự kiến vào khoảng <Text style={styles.highlightText}>{maxUV.hour} giờ</Text>.
          </Text>
        </View>
        
        {/* UV levels explanation */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Mức độ UV</Text>
          </View>
          
          {uvLevels.map((level, index) => (
            <View key={index} style={styles.uvLevelRow}>
              <View style={[styles.uvColorIndicator, { backgroundColor: level.color }]} />
              <View style={styles.uvLevelInfo}>
                <Text style={styles.uvLevelTitle}>{level.level} ({level.range})</Text>
                <Text style={styles.uvLevelDesc}>{level.description}</Text>
              </View>
            </View>
          ))}
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
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
  uvLevelContainer: {
    marginTop: -10,
  },
  uvLevel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  uvDescription: {
    fontSize: 14,
    color: '#555',
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
  uvLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uvColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  uvLevelInfo: {
    flex: 1,
  },
  uvLevelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  uvLevelDesc: {
    fontSize: 12,
    color: '#666',
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  highlightText: {
    color: '#6a3093',
    fontWeight: 'bold',
  },
});
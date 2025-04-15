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

export default function PressureDetailsScreen() {
  const router = useRouter();
  
  // State for real-time data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPressure, setCurrentPressure] = useState(720);
  const [location, setLocation] = useState('Hà Nội, Việt Nam');
  const [hourlyData, setHourlyData] = useState([
    { hour: 0, value: 5 },
    { hour: 3, value: 7 },
    { hour: 6, value: 8 },
    { hour: 9, value: 9 },
    { hour: 12, value: 10 },
    { hour: 15, value: 14 },
    { hour: 18, value: 16 },
    { hour: 21, value: 12 },
    { hour: 24, value: 10 },
  ]);
  const [currentHour, setCurrentHour] = useState(16);
  const [pressureRange, setPressureRange] = useState({ min: 2, max: 2.3 });
  
  // Fetch weather data on component mount
  useEffect(() => {
    fetchPressureData();
  }, []);
  
  // Function to fetch pressure data from API
  const fetchPressureData = async () => {
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
      
      // Set current pressure data
      setCurrentPressure(Math.round(data.current.pressure_mb));
      
      // Process hourly pressure data
      const now = new Date();
      const currentHour = now.getHours();
      setCurrentHour(currentHour);
      
      // Get hourly data from API
      const processedHourlyData = data.forecast.forecastday[0].hour.map((hour: any) => {
        const hourTime = new Date(hour.time).getHours();
        // Scale down pressure for better visualization (divide by 20)
        return {
          hour: hourTime,
          value: Math.round(hour.pressure_mb / 20)
        };
      });
      
      setHourlyData(processedHourlyData);
      
      // Calculate pressure range for the day
      const pressureValues = data.forecast.forecastday[0].hour.map((hour: any) => hour.pressure_mb);
      const minPressure = Math.min(...pressureValues);
      const maxPressure = Math.max(...pressureValues);
      setPressureRange({ min: minPressure, max: maxPressure });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching pressure data:', err);
      setError('Không thể tải dữ liệu áp suất. Vui lòng thử lại sau.');
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

  // Render custom pressure chart
  const renderPressureChart = () => {
    const chartWidth = screenWidth - 60;
    const chartHeight = 180;
    const paddingHorizontal = 30;
    const paddingVertical = 20;
    const graphWidth = chartWidth - (paddingHorizontal * 2);
    const graphHeight = chartHeight - (paddingVertical * 2);
    
    // Find min and max values for scaling with buffer
    const values = hourlyData.map(item => item.value * 20); // Convert back to actual pressure values
    const minValue = Math.min(...values) - 10;
    const maxValue = Math.max(...values) + 10;
    const range = maxValue - minValue;
    
    // Calculate points for the path
    let pathData = '';
    const points = hourlyData.map((item, index) => {
      const x = paddingHorizontal + (item.hour * (graphWidth / 24));
      // Invert Y coordinate (SVG 0,0 is top-left)
      const actualValue = item.value * 20; // Convert back to actual pressure
      const y = paddingVertical + graphHeight - ((actualValue - minValue) / range * graphHeight);
      
      if (index === 0) {
        pathData = `M ${x} ${y}`;
      } else {
        // Use bezier curves for smoother lines
        const prevPoint = hourlyData[index - 1];
        const prevX = paddingHorizontal + (prevPoint.hour * (graphWidth / 24));
        const prevActualValue = prevPoint.value * 20; // Convert back to actual pressure
        const prevY = paddingVertical + graphHeight - ((prevActualValue - minValue) / range * graphHeight);
        
        const cpX1 = prevX + (x - prevX) / 2;
        const cpX2 = prevX + (x - prevX) / 2;
        
        pathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }
      return { x, y, value: actualValue, hour: item.hour };
    });
    
    // Draw horizontal grid lines - create evenly spaced grid lines
    const stepSize = Math.ceil(range / 5); // 5 grid lines
    const gridValues = [];
    for (let value = Math.floor(minValue / 100) * 100; value <= maxValue; value += stepSize) {
      gridValues.push(value);
    }
    
    const gridLines = gridValues.map((value, index) => {
      const y = paddingVertical + graphHeight - ((value - minValue) / range * graphHeight);
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
    const currentPoint = hourlyData.find(item => item.hour === currentHour) || hourlyData[0];
    const currentX = paddingHorizontal + (currentHour * (graphWidth / 24));
    const currentActualValue = currentPoint.value * 20; // Convert back to actual pressure
    const currentY = paddingVertical + graphHeight - ((currentActualValue - minValue) / range * graphHeight);
    
    // Y-axis labels
    const yAxisLabels = gridValues.map((value, index) => (
      <SvgText
        key={`y-label-${index}`}
        x={paddingHorizontal - 5}
        y={paddingVertical + graphHeight - ((value - minValue) / range * graphHeight) + 4}
        fontSize="10"
        fill="#666"
        textAnchor="end"
      >
        {value}
      </SvgText>
    ));
    
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
          
          {/* Y-axis labels */}
          {yAxisLabels}
          
          {/* Pressure line */}
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
            {currentPoint.value * 20}
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
        <Text style={styles.loadingText}>Đang tải dữ liệu áp suất...</Text>
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
          onPress={fetchPressureData}
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
          <TouchableOpacity onPress={fetchPressureData}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Current pressure - Organized in a clear block */}
        <View style={styles.infoBlock}>
          <View style={styles.currentInfo}>
            <MaterialCommunityIcons name="gauge" size={24} color="#333" />
            <Text style={styles.infoLabel}>Áp suất</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.infoValue}>{currentPressure} hPa</Text>
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
              {/* <Text style={styles.yAxisLabel}>hPa</Text>
              <Text style={styles.yAxisValue}>1000</Text>
              <Text style={styles.yAxisValue}>800</Text>
              <Text style={styles.yAxisValue}>600</Text>
              <Text style={styles.yAxisValue}>400</Text>
              <Text style={styles.yAxisValue}>200</Text>
              <Text style={styles.yAxisValue}>0</Text> */}
            </View>
            
            {renderPressureChart()}
          </View>
        </View>

        {/* Daily summary */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Tóm tắt hàng ngày</Text>
          </View>
          
          <Text style={styles.summaryText}>
            Áp suất hiện tại là {currentPressure} hPa. Hôm nay, áp suất dao động từ {pressureRange.min} đến {pressureRange.max} hPa.
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
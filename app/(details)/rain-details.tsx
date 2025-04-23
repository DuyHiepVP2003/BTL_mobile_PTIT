import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;
type colorArr = [string, string];
const API_KEY = "9a0e68b9dc00409597822254250303"; // API key for WeatherAPI.com

export default function RainDetailsScreen() {
  const router = useRouter();
  
  // State for real-time data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRainChance, setCurrentRainChance] = useState(24);
  const [location, setLocation] = useState('Hà Nội, Việt Nam');
  const [hourlyData, setHourlyData] = useState([
    { hour: 7, value: 27 },
    { hour: 8, value: 44 },
    { hour: 9, value: 56 },
    { hour: 10, value: 88 },
    { hour: 11, value: 70 },
    { hour: 12, value: 50 },
    { hour: 13, value: 30 },
    { hour: 14, value: 20 },
  ]);
  const [currentHour, setCurrentHour] = useState(10);
  const [rainRange, setRainRange] = useState({ min: 27, max: 88, peakHour: 10 });
  
  // Fetch weather data on component mount
  useEffect(() => {
    fetchRainData();
  }, []);
  
  // Function to fetch rain data from API
  const fetchRainData = async () => {
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
      
      // Set current rain chance data
      setCurrentRainChance(data.current.precip_mm > 0 ? 
        Math.round(data.forecast.forecastday[0].hour[new Date().getHours()].chance_of_rain) : 
        Math.round(data.forecast.forecastday[0].day.daily_chance_of_rain));
      
      // Process hourly rain data
      const now = new Date();
      const currentHour = now.getHours();
      setCurrentHour(currentHour);
      
      // Get hourly data from API - get current hour and next 7 hours
      const hourlyForecast = data.forecast.forecastday[0].hour;
      const processedHourlyData = [];
      
      for (let i = 0; i < 8; i++) {
        const hourIndex = (currentHour + i) % 24;
        const hourData = hourlyForecast[hourIndex];
        if (hourData) {
          processedHourlyData.push({
            hour: hourIndex,
            value: hourData.chance_of_rain
          });
        }
      }
      
      setHourlyData(processedHourlyData);
      
      // Calculate rain chance range for the day
      const rainValues = hourlyForecast.map((hour: any) => hour.chance_of_rain);
      const minRain = Math.min(...rainValues);
      const maxRain = Math.max(...rainValues);
      
      // Tìm giờ có lượng mưa cao nhất
      const peakHourIndex = rainValues.indexOf(maxRain);
      const peakHour = peakHourIndex >= 0 ? peakHourIndex : currentHour;
      
      setRainRange({ min: minRain, max: maxRain, peakHour: peakHour });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching rain data:', err);
      setError('Không thể tải dữ liệu mưa. Vui lòng thử lại sau.');
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

  // Render rain chance bars
  const renderRainChanceBars = () => {
    return hourlyData.map((item, index) => (
      <View key={index} style={styles.rainChanceItem}>
        <Text style={styles.hourText}>{item.hour} {item.hour >= 12 ? 'PM' : 'AM'}</Text>
        <View style={styles.barContainer}>
          <LinearGradient
            colors={getGradientColors(item.value) as colorArr}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barGradient, { width: `${item.value}%` }]}
          />
        </View>
        <Text style={[styles.percentText, { color: getTextColor(item.value) }]}>
          {item.value}%
        </Text>
      </View>
    ));
  };

  // Get gradient colors based on rain chance percentage
  const getGradientColors = (percentage: number) => {
    if (percentage < 30) return ['#8e44ad', '#9b59b6'];
    if (percentage < 60) return ['#9b59b6', '#6a3093'];
    return ['#6a3093', '#5438DC'];
  };

  // Get text color based on rain chance percentage
  const getTextColor = (percentage: number) => {
    if (percentage < 30) return '#8e44ad';
    if (percentage < 60) return '#9b59b6';
    return '#6a3093';
  };

  // Render custom rain chart
  const renderRainChart = () => {
    const chartWidth = screenWidth - 90;
    const chartHeight = 180;
    const paddingHorizontal = 10;
    const paddingVertical = 20;
    const graphWidth = chartWidth - (paddingHorizontal * 2);
    const graphHeight = chartHeight - (paddingVertical * 2);
    
    // Find min and max values for scaling
    const maxValue = 100; // Fixed max for percentage
    
    // Calculate points for the path
    let pathData = '';
    let areaPathData = '';
    const points = hourlyData.map((item, index) => {
      const x = paddingHorizontal + (index * (graphWidth / (hourlyData.length - 1)));
      // Invert Y coordinate (SVG 0,0 is top-left)
      const y = paddingVertical + graphHeight - (item.value / maxValue * graphHeight);
      if (index === 0) {
        pathData = `M ${x} ${y}`;
        areaPathData = `M ${x} ${paddingVertical + graphHeight} L ${x} ${y}`;
      } else {
        // Use bezier curves for smoother lines
        const prevPoint = hourlyData[index - 1];
        const prevX = paddingHorizontal + ((index - 1) * (graphWidth / (hourlyData.length - 1)));
        const prevY = paddingVertical + graphHeight - (prevPoint.value / maxValue * graphHeight);
        
        const cpX1 = prevX + (x - prevX) / 2;
        const cpX2 = prevX + (x - prevX) / 2;
        
        pathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
        areaPathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }
      return { x, y, value: item.value, hour: item.hour };
    });
    
    // Close the area path
    const lastX = paddingHorizontal + ((hourlyData.length - 1) * (graphWidth / (hourlyData.length - 1)));
    areaPathData += ` L ${lastX} ${paddingVertical + graphHeight} Z`;
    
    // Draw grid lines
    const gridLines = [0, 25, 50, 75, 100].map((value, index) => {
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
    const currentHourIndex = hourlyData.findIndex(item => item.hour === currentHour);
    const currentIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
    const currentX = paddingHorizontal + (currentIndex * (graphWidth / (hourlyData.length - 1)));
    const currentY = paddingVertical + graphHeight - (hourlyData[currentIndex].value / maxValue * graphHeight);
    
    return (
      <View style={{ marginVertical: 10 }}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#6a3093" stopOpacity="0.6" />
              <Stop offset="1" stopColor="#6a3093" stopOpacity="0.1" />
            </SvgGradient>
            <SvgGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#8e44ad" />
              <Stop offset="1" stopColor="#6a3093" />
            </SvgGradient>
          </Defs>
          
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
          
          {/* Area under the line */}
          <Path
            d={areaPathData}
            fill="url(#areaGradient)"
          />
          
          {/* Rain chance line */}
          <Path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
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
          
          {/* Data points */}
          {hourlyData.map((item, index) => {
            const x = paddingHorizontal + (index * (graphWidth / (hourlyData.length - 1)));
            const y = paddingVertical + graphHeight - (item.value / maxValue * graphHeight);
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#fff"
                stroke="#6a3093"
                strokeWidth="2"
              />
            );
          })}
          
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
          {hourlyData.map((item, index) => {
            const x = paddingHorizontal + (index * (graphWidth / (hourlyData.length - 1)));
            return (
              <SvgText
                key={index}
                x={x}
                y={chartHeight - 5}
                fontSize="12"
                fill="#333"
                textAnchor="middle"
              >
                {item.hour}
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
            {hourlyData[currentIndex].value}%
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
        <Text style={styles.loadingText}>Đang tải dữ liệu mưa...</Text>
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
          onPress={fetchRainData}
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
          <TouchableOpacity onPress={fetchRainData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Current rain chance - Organized in a clear block */}
        <View style={styles.infoBlock}>
          <View style={styles.currentInfo}>
            <MaterialCommunityIcons name="weather-pouring" size={24} color="#333" />
            <Text style={styles.infoLabel}>Khả năng mưa</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.infoValue}>{currentRainChance}<Text style={styles.percentSymbol}>%</Text></Text>
            <View style={styles.rainIconContainer}>
              <MaterialCommunityIcons name="weather-rainy" size={60} color="#6a3093" />
              
            </View>
          </View>
        </View>

        {/* Hourly forecast with bars */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="time-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Khả năng mưa theo giờ</Text>
          </View>
          
          <View style={styles.rainChanceContainer}>
            {renderRainChanceBars()}
          </View>
        </View>

        {/* Hourly forecast with chart */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="analytics-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Biểu đồ theo giờ</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              <Text style={styles.yAxisLabel}>%</Text>
              <Text style={styles.yAxisValue}>100</Text>
              <Text style={styles.yAxisValue}>75</Text>
              <Text style={styles.yAxisValue}>50</Text>
              <Text style={styles.yAxisValue}>25</Text>
              <Text style={styles.yAxisValue}>0</Text>
            </View>
            
            {renderRainChart()}
          </View>
        </View>

        {/* Daily summary */}
        <View style={styles.forecastCard}>
          <View style={styles.forecastHeader}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.forecastTitle}>Tóm tắt hàng ngày</Text>
          </View>
          
          <View style={styles.summaryContainer}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#6a3093" style={styles.summaryIcon} />
            <Text style={styles.summaryText}>
              Khả năng mưa hiện tại là <Text style={styles.highlightText}>{currentRainChance}%</Text>. Hôm nay, khả năng mưa dao động từ <Text style={styles.highlightText}>{rainRange.min}%</Text> đến <Text style={styles.highlightText}>{rainRange.max}%</Text>.
              Cao điểm mưa dự kiến vào khoảng <Text style={styles.highlightText}>{rainRange.peakHour} {rainRange.peakHour >= 12 ? 'PM' : 'AM'}</Text> với xác suất <Text style={styles.highlightText}>{rainRange.max}%</Text>.
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  percentSymbol: {
    fontSize: 30,
    fontWeight: 'normal',
    color: '#555',
  },
  rainIconContainer: {
    position: 'relative',
  },
  rainDrops: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rainDrop: {
    position: 'absolute',
    width: 4,
    height: 10,
    backgroundColor: '#6a3093',
    borderRadius: 2,
    top: 30,
    transform: [{ rotate: '15deg' }],
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
  rainChanceContainer: {
    marginVertical: 10,
  },
  rainChanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hourText: {
    width: 50,
    fontSize: 14,
    color: '#333',
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  barGradient: {
    height: '100%',
    borderRadius: 6,
  },
  percentText: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
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
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
  highlightText: {
    color: '#6a3093',
    fontWeight: 'bold',
  },
});
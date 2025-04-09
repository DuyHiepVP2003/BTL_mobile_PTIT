import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;


export default function TemperatureDetailsScreen() {
  const router = useRouter();
  type IoniconsName = React.ComponentProps<typeof Ionicons>['name']
  
  // Mock hourly forecast data
  const hourlyForecast = [
    { time: '10AM', temp: 10, icon: 'partly-sunny' },
    { time: '11AM', temp: 8, icon: 'partly-sunny' },
    { time: '12PM', temp: 5, icon: 'sunny' },
    { time: '1PM', temp: 12, icon: 'sunny' },
    { time: '2PM', temp: 9, icon: 'partly-sunny' },
  ];

  // Mock daily forecast data
  const dailyForecast = [
    { day: 'Thứ 2', temp: 10 },
    { day: 'Thứ 3', temp: 8 },
    { day: 'Thứ 4', temp: 5 },
    { day: 'Thứ 5', temp: 3 },
    { day: 'Thứ 6', temp: 0 },
    { day: 'Thứ 7', temp: -2 },
    { day: 'CN', temp: 0 },
  ];

  // Sun events data
  const sunEvents = [
    { name: 'Bình minh', time: '4:20 AM', timeAgo: '4 giờ trước' },
    { name: 'Hoàng hôn', time: '4:50 PM', timeAgo: '9 giờ tới' },
  ];

  // Render custom temperature chart
  const renderTemperatureChart = () => {
    const chartWidth = screenWidth - 90;
    const chartHeight = 180;
    const paddingHorizontal = 10;
    const paddingVertical = 20;
    const graphWidth = chartWidth - (paddingHorizontal * 2);
    const graphHeight = chartHeight - (paddingVertical * 2);
    
    // Find min and max values for scaling
    const temps = dailyForecast.map(day => day.temp);
    const minTemp = Math.min(...temps, -10);
    const maxTemp = Math.max(...temps, 10);
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
    
    // Draw horizontal grid lines
    const gridLines = [-10, 0, 10].map((temp, index) => {
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
          strokeDasharray={index === 1 ? "" : "3,3"}
        />
      );
    });
    
    // Current day marker (assuming Thứ 5 is current)
    const currentDayIndex = 3; // Thứ 5
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
          
          {/* Day labels */}
          {dailyForecast.map((day, index) => {
            const x = paddingHorizontal + (index * (graphWidth / (dailyForecast.length - 1)));
            return (
              <SvgText
                key={index}
                x={x}
                y={chartHeight - 5}
                fontSize="12"
                fill="#333"
                textAnchor="middle"
              >
                {day.day}
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
            {dailyForecast[currentDayIndex].temp}°
          </SvgText>
        </Svg>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Hà Nội, Việt Nam</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Current temperature - Organized in a clear block */}
        <View style={styles.infoBlock}>
          <View style={styles.currentInfo}>
            <Ionicons name="thermometer-outline" size={24} color="#333" />
            <Text style={styles.infoLabel}>Nhiệt độ</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.infoValue}>3°</Text>
            <Text style={styles.feelTemp}>Cảm nhận -2°</Text>
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
            <Text style={styles.forecastTitle}>Dự báo theo ngày</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              <Text style={styles.yAxisValue}>10°</Text>
              <Text style={styles.yAxisValue}>0°</Text>
              <Text style={styles.yAxisValue}>-10°</Text>
            </View>
            
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
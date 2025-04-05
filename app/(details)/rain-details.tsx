import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

export default function RainDetailsScreen() {
  const router = useRouter();
  
  // Mock hourly rain chance data
  const hourlyData = [
    { hour: 7, value: 27 },
    { hour: 8, value: 44 },
    { hour: 9, value: 56 },
    { hour: 10, value: 88 },
    { hour: 11, value: 70 },
    { hour: 12, value: 50 },
    { hour: 13, value: 30 },
    { hour: 14, value: 20 },
  ];

  // Render rain chance bars
  const renderRainChanceBars = () => {
    return hourlyData.map((item, index) => (
      <View key={index} style={styles.rainChanceItem}>
        <Text style={styles.hourText}>{item.hour} {item.hour >= 12 ? 'PM' : 'AM'}</Text>
        <View style={styles.barContainer}>
          <LinearGradient
            colors={getGradientColors(item.value)}
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
      const x = paddingHorizontal + ((item.hour - 7) * (graphWidth / (hourlyData.length - 1)));
      // Invert Y coordinate (SVG 0,0 is top-left)
      const y = paddingVertical + graphHeight - (item.value / maxValue * graphHeight);
      if (index === 0) {
        pathData = `M ${x} ${y}`;
        areaPathData = `M ${x} ${paddingVertical + graphHeight} L ${x} ${y}`;
      } else {
        // Use bezier curves for smoother lines
        const prevPoint = hourlyData[index - 1];
        const prevX = paddingHorizontal + ((prevPoint.hour - 7) * (graphWidth / (hourlyData.length - 1)));
        const prevY = paddingVertical + graphHeight - (prevPoint.value / maxValue * graphHeight);
        
        const cpX1 = prevX + (x - prevX) / 2;
        const cpX2 = prevX + (x - prevX) / 2;
        
        pathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
        areaPathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }
      return { x, y, value: item.value, hour: item.hour };
    });
    
    // Close the area path
    const lastX = paddingHorizontal + ((hourlyData[hourlyData.length - 1].hour - 7) * (graphWidth / (hourlyData.length - 1)));
    areaPathData += ` L ${lastX} ${paddingVertical + graphHeight} Z`;
    
    // Draw horizontal grid lines
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
    
    // Current time marker (assuming 10 PM is current)
    const currentHour = 10;
    const currentHourIndex = hourlyData.findIndex(item => item.hour === currentHour);
    const currentX = paddingHorizontal + ((currentHour - 7) * (graphWidth / (hourlyData.length - 1)));
    const currentY = paddingVertical + graphHeight - (hourlyData[currentHourIndex].value / maxValue * graphHeight);
    
    return (
      <View style={{ marginVertical: 10 }}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Definitions for gradients */}
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
            const x = paddingHorizontal + ((item.hour - 7) * (graphWidth / (hourlyData.length - 1)));
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
            const x = paddingHorizontal + ((item.hour - 7) * (graphWidth / (hourlyData.length - 1)));
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
            {hourlyData[currentHourIndex].value}%
          </SvgText>
        </Svg>
        
        <Text style={styles.chartXLabel}>giờ</Text>
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
        </View>

        {/* Current rain chance - Organized in a clear block */}
        <View style={styles.infoBlock}>
          <View style={styles.currentInfo}>
            <MaterialCommunityIcons name="weather-pouring" size={24} color="#333" />
            <Text style={styles.infoLabel}>Khả năng mưa</Text>
          </View>

          <View style={styles.mainInfo}>
            <Text style={styles.infoValue}>24<Text style={styles.percentSymbol}>%</Text></Text>
            <View style={styles.rainIconContainer}>
              <MaterialCommunityIcons name="weather-rainy" size={60} color="#6a3093" />
              <View style={styles.rainDrops}>
                {[...Array(5)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.rainDrop, 
                      { 
                        left: 10 + (i * 10), 
                        animationDelay: `${i * 0.2}s`,
                        opacity: 0.7 - (i * 0.1)
                      }
                    ]} 
                  />
                ))}
              </View>
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
              Khả năng mưa hiện tại là <Text style={styles.highlightText}>24%</Text>. Hôm nay, khả năng mưa dao động từ <Text style={styles.highlightText}>27%</Text> đến <Text style={styles.highlightText}>88%</Text>.
              Cao điểm mưa dự kiến vào khoảng <Text style={styles.highlightText}>10 PM</Text> với xác suất <Text style={styles.highlightText}>88%</Text>.
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
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
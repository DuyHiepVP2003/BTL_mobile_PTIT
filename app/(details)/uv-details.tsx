import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

export default function UVDetailsScreen() {
  const router = useRouter();
  
  // Mock hourly UV data
  const hourlyData = [
    { hour: 0, value: 0 },
    { hour: 3, value: 0 },
    { hour: 6, value: 2 },
    { hour: 9, value: 5 },
    { hour: 12, value: 8 },
    { hour: 15, value: 6 },
    { hour: 18, value: 3 },
    { hour: 21, value: 0 },
    { hour: 24, value: 0 },
  ];

  // UV index descriptions
  const uvLevels = [
    { level: "Thấp", range: "0-2", color: "#3EC73E", description: "Không cần bảo vệ" },
    { level: "Trung bình", range: "3-5", color: "#F8E61D", description: "Nên dùng kem chống nắng" },
    { level: "Cao", range: "6-7", color: "#F6921E", description: "Cần bảo vệ da và mắt" },
    { level: "Rất cao", range: "8-10", color: "#ED1C24", description: "Hạn chế ra ngoài" },
    { level: "Cực kỳ cao", range: "11+", color: "#9A1AB2", description: "Tránh ra ngoài" }
  ];

  // Current UV index
  const currentUV = 7;
  const currentUVLevel = uvLevels.find(level => {
    const [min, max] = level.range.split('-');
    if (max.includes('+')) {
      return currentUV >= parseInt(min);
    }
    return currentUV >= parseInt(min) && currentUV <= parseInt(max);
  });

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
    
    // Current time marker (assuming 15 is current)
    const currentHour = 15;
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
            Chỉ số UV hiện tại là {currentUV}, ở mức {currentUVLevel?.level}. {currentUVLevel?.description}. 
            Chỉ số UV cao nhất trong ngày là 8, dự kiến vào khoảng 12 giờ trưa.
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
});
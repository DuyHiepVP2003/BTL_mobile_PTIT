import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

interface TemperatureChartProps {
  hourlyData: {
    time: string;
    tempC: number;
  }[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ hourlyData }) => {
  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString("vi-VN", { hour: "2-digit" });
  };

  const renderTemperatureChart = () => {
    const chartWidth = screenWidth - 120;
    const chartHeight = 180;
    const paddingHorizontal = 10;
    const paddingVertical = 20;
    const graphWidth = chartWidth - paddingHorizontal * 2;
    const graphHeight = chartHeight - paddingVertical * 2;

    // Find min and max values for scaling
    const maxTemp = Math.max(...hourlyData.map((item) => item.tempC));
    const minTemp = Math.min(...hourlyData.map((item) => item.tempC));
    const maxValue = Math.ceil(maxTemp + 5);
    const minValue = Math.floor(minTemp - 5);

    // Calculate points for the path
    let pathData = "";
    const points = hourlyData.map((item, index) => {
      const hour = new Date(item.time).getHours();
      const x = paddingHorizontal + hour * (graphWidth / 24);
      // Invert Y coordinate (SVG 0,0 is top-left)
      const y =
        paddingVertical +
        graphHeight -
        ((item.tempC - minValue) / (maxValue - minValue)) * graphHeight;

      if (index === 0) {
        pathData = `M ${x} ${y}`;
      } else {
        // Use bezier curves for smoother lines
        const prevPoint = hourlyData[index - 1];
        const prevHour = new Date(prevPoint.time).getHours();
        const prevX = paddingHorizontal + prevHour * (graphWidth / 24);
        const prevY =
          paddingVertical +
          graphHeight -
          ((prevPoint.tempC - minValue) / (maxValue - minValue)) * graphHeight;

        const cpX1 = prevX + (x - prevX) / 2;
        const cpX2 = prevX + (x - prevX) / 2;

        pathData += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`;
      }
      return { x, y, tempC: item.tempC, hour };
    });

    // Draw horizontal grid lines
    const gridLines = [];
    for (let i = minValue; i <= maxValue; i += 5) {
      const y =
        paddingVertical +
        graphHeight -
        ((i - minValue) / (maxValue - minValue)) * graphHeight;
      gridLines.push(
        <Line
          key={i}
          x1={paddingHorizontal}
          y1={y}
          x2={chartWidth - paddingHorizontal}
          y2={y}
          stroke="#ccc"
          strokeWidth="1"
          strokeDasharray={i === minValue ? "" : "3,3"}
        />
      );
    }

    // Current time marker
    const currentHour = new Date().getHours();
    const currentX = paddingHorizontal + currentHour * (graphWidth / 24);
    const currentPoint = points.find((p) => p.hour === currentHour);

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
          <Path d={pathData} fill="none" stroke="#6a3093" strokeWidth="2.5" />

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
          {currentPoint && (
            <Circle
              cx={currentX}
              cy={currentPoint.y}
              r="6"
              fill="#6a3093"
              stroke="#fff"
              strokeWidth="2"
            />
          )}

          {/* Hour labels */}
          {[0, 6, 12, 18, 24].map((hour, index) => {
            const x = paddingHorizontal + hour * (graphWidth / 24);
            return (
              <SvgText
                key={index}
                x={x}
                y={chartHeight - 5}
                fontSize="12"
                fill="#333"
                textAnchor="middle"
              >
                {hour}h
              </SvgText>
            );
          })}

          {/* Temperature label for current point */}
          {currentPoint && (
            <>
              <Circle
                cx={currentX}
                cy={currentPoint.y}
                r="16"
                fill="#f0f0f0"
                opacity="0.8"
              />
              <SvgText
                x={currentX}
                y={currentPoint.y + 4}
                fontSize="12"
                fill="#333"
                fontWeight="bold"
                textAnchor="middle"
              >
                {Math.round(currentPoint.tempC)}°
              </SvgText>
            </>
          )}
        </Svg>

        <Text style={styles.chartXLabel}>giờ</Text>
      </View>
    );
  };

  return (
    <View style={styles.forecastCard}>
      <View style={styles.forecastHeader}>
        <Ionicons name="thermometer-outline" size={20} color="#333" />
        <Text style={styles.forecastTitle}>Nhiệt độ theo giờ</Text>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabels}>
          <Text style={styles.yAxisLabel}>°C</Text>
          {Array.from({ length: 6 }, (_, i) => {
            const value =
              Math.max(...hourlyData.map((item) => item.tempC)) + 5 - i * 5;
            return (
              <Text key={i} style={styles.yAxisValue}>
                {Math.round(value)}
              </Text>
            );
          })}
        </View>

        {renderTemperatureChart()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  forecastCard: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    marginVertical: 15,
  },
  forecastHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  yAxisLabels: {
    marginRight: 5,
    height: 150,
    justifyContent: "space-between",
    // width: 30,
  },
  yAxisLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  yAxisValue: {
    fontSize: 10,
    color: "#666",
    width: 20,
    textAlign: "right",
  },
  chartXLabel: {
    textAlign: "right",
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
});

export default TemperatureChart;

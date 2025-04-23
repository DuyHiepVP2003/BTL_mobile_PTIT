import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import tw from "twrnc";
import { useEffect, useState } from "react";
import * as Location from 'expo-location';

// API key từ weatherapi.com
const API_KEY = "9a0e68b9dc00409597822254250303";
const DEFAULT_LOCATION = "Hanoi";

// Interface cho dữ liệu thời tiết
interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  time: string;
  dayTemp: string;
  nightTemp: string;
  details: {
    title: string;
    value: string;
    change: string;
    icon: string;
    route: string;
  }[];
  conditionCode?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Yêu cầu quyền truy cập vị trí
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Quyền truy cập vị trí bị từ chối');
        // Sử dụng vị trí mặc định nếu không có quyền
        fetchWeatherData(DEFAULT_LOCATION);
        return;
      }
      
      // Lấy vị trí hiện tại
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      // Gọi API thời tiết với tọa độ
      fetchWeatherData(`${position.coords.latitude},${position.coords.longitude}`);
    } catch (err) {
      console.error("Error getting location:", err);
      setError('Không thể lấy vị trí hiện tại. Sử dụng vị trí mặc định.');
      fetchWeatherData(DEFAULT_LOCATION);
    }
  };

  // Hàm lấy dữ liệu thời tiết từ API
  const fetchWeatherData = async (locationQuery: string) => {
    try {
      setLoading(true);
      
      // Gọi API forecast để lấy dữ liệu dự báo
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${locationQuery}&days=3&aqi=yes&alerts=yes&lang=vi`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu thời tiết");
      }

      const data = await response.json();
      
      // Tính toán sự thay đổi giữa hiện tại và trung bình trong ngày hôm nay
      // Tính giá trị trung bình của gió trong ngày hôm nay
      const avgWindToday = data.forecast.forecastday[0].hour.reduce(
        (sum: number, hour: any) => sum + hour.wind_kph, 0
      ) / 24;
      
      // Tính giá trị trung bình của áp suất trong ngày hôm nay
      const avgPressureToday = data.forecast.forecastday[0].hour.reduce(
        (sum: number, hour: any) => sum + hour.pressure_mb, 0
      ) / 24;
      
      // Tính giá trị trung bình của chỉ số UV trong ngày hôm nay (từ các giờ có ánh sáng)
      const dayHours = data.forecast.forecastday[0].hour.filter((hour: any) => 
        new Date(hour.time).getHours() >= 6 && new Date(hour.time).getHours() <= 18
      );
      const avgUvToday = dayHours.reduce(
        (sum: number, hour: any) => sum + hour.uv, 0
      ) / dayHours.length;
      
      // Tính toán sự thay đổi so với trung bình
      const windChange = (data.current.wind_kph - avgWindToday).toFixed(1);
      const pressureChange = (data.current.pressure_mb - avgPressureToday).toFixed(0);
      const rainChange = (data.forecast.forecastday[0].day.daily_chance_of_rain - 
                          data.forecast.forecastday[0].day.daily_chance_of_rain / 2).toFixed(0);
      const uvChange = (data.current.uv - avgUvToday).toFixed(1);
      // Format dữ liệu thời tiết
      const formattedData: WeatherData = {
        location: `${data.location.name}, ${data.location.country}`,
        temperature: Math.round(data.current.temp_c),
        condition: `Cảm nhận ${Math.round(data.current.feelslike_c)}°`,
        time: new Date(data.location.localtime).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        dayTemp: `Ngày ${Math.round(data.forecast.forecastday[0].day.maxtemp_c)}°`,
        nightTemp: `Đêm ${Math.round(data.forecast.forecastday[0].day.mintemp_c)}°`,
        conditionCode: data.current.condition.code,
        details: [
          {
            title: "Tốc độ gió",
            value: `${Math.round(data.current.wind_kph)}km/h`,
            change: `${windChange.startsWith('-') ? '' : '+'}${windChange} km/h`,
            icon: "weather-windy",
            route: "wind-details",
          },
          {
            title: "Áp suất",
            value: `${Math.round(data.current.pressure_mb)} hpa`,
            change: `${pressureChange.startsWith('-') ? '' : '+'}${pressureChange} hpa`,
            icon: "arrow-collapse-down",
            route: "pressure-details",
          },
          {
            title: "Khả năng mưa",
            value: `${data.forecast.forecastday[0].day.daily_chance_of_rain}%`,
            change: `${rainChange.startsWith('-') ? '' : '+'}${rainChange}%`,
            icon: "weather-pouring",
            route: "rain-details",
          },
          {
            title: "Chỉ số UV",
            value: `${data.current.uv}`,
            change: `${uvChange.startsWith('-') ? '' : '+'}${uvChange}`,
            icon: "white-balance-sunny",
            route: "uv-details",
          },
        ],
      };

      setWeatherData(formattedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Không thể lấy dữ liệu thời tiết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Hàm xác định icon thời tiết dựa trên mã condition
  const getWeatherIcon = (conditionCode?: number) => {
    if (!conditionCode) return { name: "partly-sunny", color: "#FFD700" };
    
    // Xác định icon dựa trên mã condition từ API
    // Mã condition: https://www.weatherapi.com/docs/weather_conditions.json
    if (conditionCode === 1000) { // Sunny/Clear
      return { name: "sunny", color: "#FFD700" };
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) { // Rain
      return { name: "rainy", color: "#87CEFA" };
    } else if ([1003, 1006, 1009, 1030, 1069, 1087, 1135, 1273, 1276, 1279, 1282].includes(conditionCode)) { // Cloudy
      return { name: "cloudy", color: "#E0E0E0" };
    } else if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) { // Snow
      return { name: "snow", color: "white" };
    } else if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) { // Thunder
      return { name: "thunderstorm", color: "#FFD700" };
    } else {
      return { name: "partly-sunny", color: "#FFD700" };
    }
  };

  // Navigate to detail page
  const navigateToDetail = (route: string) => {
    router.push(`/(details)/${route}`);
  };

  // Hiển thị loading khi đang lấy dữ liệu
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6a3093" />
        <Text style={styles.loadingText}>Đang tải dữ liệu thời tiết...</Text>
      </View>
    );
  }

  // Hiển thị lỗi nếu có
  if (error || !weatherData) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="cloud-offline" size={60} color="#6a3093" />
        <Text style={styles.errorText}>{error || "Đã xảy ra lỗi"}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={getCurrentLocation}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const weatherIcon = getWeatherIcon(weatherData.conditionCode);

  return (
    <ScrollView style={styles.container}>
      {/* Main Weather Card with Frog Image Background */}
      <TouchableOpacity onPress={() => navigateToDetail("temperature-details")}>
        <ImageBackground
          source={require("@/assets/images/frog.png")}
          style={styles.weatherCard}
          resizeMode="cover"
        >
          <View style={styles.weatherHeader}>
            <Text style={styles.locationText}>{weatherData.location}</Text>
            <TouchableOpacity onPress={getCurrentLocation}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.weatherMain}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperatureText}>
                {weatherData.temperature}°
              </Text>
              <Text style={styles.conditionText}>{weatherData.condition}</Text>
            </View>
            <View style={styles.weatherIcon}>
              <Ionicons name={weatherIcon.name as any} size={80} color={weatherIcon.color} />
              {weatherIcon.name !== "sunny" && (
                <Ionicons
                  name="cloud"
                  size={50}
                  color="white"
                  style={styles.cloudIcon}
                />
              )}
            </View>
          </View>
          <View style={styles.tempRange}>
            <Text style={styles.tempRangeText}>{weatherData.dayTemp}</Text>
            <Text style={styles.tempRangeText}>{weatherData.nightTemp}</Text>
          </View>

          <Text style={styles.dateText}>{weatherData.time}</Text>
        </ImageBackground>
      </TouchableOpacity>
      
      {/* Weather Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Ionicons name="stats-chart" size={20} color="#333" />
          <Text style={styles.detailsTitle}>Các thông số thời tiết</Text>
        </View>

        {weatherData.details.map((detail, index) => (
          <TouchableOpacity
            key={index}
            style={styles.detailItem}
            onPress={() => navigateToDetail(detail.route)}
          >
            <View style={styles.detailLeft}>
              <MaterialCommunityIcons
                name={detail.icon as any}
                size={24}
                color="#6a3093"
              />
              <Text style={styles.detailName}>{detail.title}</Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.detailValue}>{detail.value}</Text>
              <Text style={[
                styles.detailChange, 
                detail.change.startsWith('+') ? styles.positiveChange : 
                detail.change.startsWith('-') ? styles.negativeChange : null
              ]}>
                {detail.change}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  positiveChange: {
    color: '#4CAF50',
  },
  negativeChange: {
    color: '#F44336',
  },
  weatherCard: {
    padding: 16,
    paddingTop: 0,
    height: 380,
    borderRadius: 30,
    overflow: "hidden",
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 65,
    marginBottom: 40,
  },
  locationText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  weatherMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  temperatureContainer: {
    flexDirection: "column",
  },
  temperatureText: {
    fontSize: 100,
    fontWeight: "bold",
    color: "white",
    lineHeight: 100,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  conditionText: {
    fontSize: 18,
    color: "white",
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  weatherIcon: {
    position: "relative",
    marginRight: 20,
  },
  cloudIcon: {
    position: "absolute",
    right: -10,
    top: 10,
  },
  tempRange: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 10,
  },
  tempRangeText: {
    color: "white",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    backgroundColor: "#f0e6ff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    padding: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e6dbff",
    padding: 22,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailName: {
    fontSize: 16,
    color: "#333",
  },
  detailRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailChange: {
    fontSize: 12,
    color: "#666",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

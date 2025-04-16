import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
const API_KEY = "7ee1943f1ded42e086784930252802";

type WeatherData = {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  date: string;
  day: string;
  night: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
};

export default function WeatherDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { locationName } = params;

  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${locationName}&days=3&aqi=no&alerts=no`
      );
      const data = await response.json();

      const weather: WeatherData = {
        location: data.location.name,
        country: data.location.country,
        temperature: data.current.temp_c,
        condition: data.current.condition.text,
        date: new Date(data.location.localtime).toLocaleDateString("vi-VN"),
        day: `${data.forecast.forecastday[0].day.maxtemp_c}°`,
        night: `${data.forecast.forecastday[0].day.mintemp_c}°`,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        feelsLike: data.current.feelslike_c,
        forecast: data.forecast.forecastday.map((day: any) => ({
          day: new Date(day.date).toLocaleDateString("vi-VN", {
            weekday: "long",
          }),
          temp: day.day.avgtemp_c,
          condition: day.day.condition.text,
          icon: day.day.condition.icon,
        })),
      };

      setWeatherData(weather);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [locationName]);

  if (loading || !weatherData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Đang tải dữ liệu thời tiết...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#6A5ACD", "#8A2BE2", "#9370DB"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{weatherData.location}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mainInfo}>
            <Text style={styles.temperature}>{weatherData.temperature}°</Text>
            <Text style={styles.condition}>{weatherData.condition}</Text>
            <Text style={styles.feelsLike}>
              Cảm giác như {weatherData.feelsLike}°
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={22} color="#fff" />
              <Text style={styles.detailText}>Độ ẩm</Text>
              <Text style={styles.detailValue}>{weatherData.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="speedometer-outline" size={22} color="#fff" />
              <Text style={styles.detailText}>Gió</Text>
              <Text style={styles.detailValue}>
                {weatherData.windSpeed} km/h
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="sunny-outline" size={22} color="#fff" />
              <Text style={styles.detailText}>Ban ngày</Text>
              <Text style={styles.detailValue}>{weatherData.day}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="moon-outline" size={22} color="#fff" />
              <Text style={styles.detailText}>Ban đêm</Text>
              <Text style={styles.detailValue}>{weatherData.night}</Text>
            </View>
          </View>

          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>Dự báo 3 ngày</Text>
            {weatherData.forecast.map((day, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{day.day}</Text>
                <View style={styles.forecastIconContainer}>
                  <Image
                    source={{ uri: `https:${day.icon}` }}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.forecastTemp}>{day.temp}°</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9370DB",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  mainInfo: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  temperature: {
    fontSize: 90,
    fontWeight: "bold",
    color: "#fff",
  },
  condition: {
    fontSize: 26,
    color: "#fff",
    marginTop: 8,
    fontStyle: "italic",
  },
  feelsLike: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 40,
  },
  detailItem: {
    alignItems: "center",
    width: "45%",
    marginVertical: 12,
  },
  detailText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginTop: 8,
  },
  detailValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  forecastContainer: {
    marginHorizontal: 16,
    paddingBottom: 30,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  forecastDay: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  forecastIconContainer: {
    flex: 1,
    alignItems: "center",
  },
  forecastTemp: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "right",
  },
});

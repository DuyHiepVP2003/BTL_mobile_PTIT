import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import TemperatureChart from "./TemperatureChart";

const screenWidth = Dimensions.get("window").width;

interface ForecastDetailProps {
  date: string;
}

interface WeatherDetail {
  date: string;
  condition: string;
  avgTempC: number;
  maxTempC: number;
  minTempC: number;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uv: number;
  sunrise: string;
  sunset: string;
}

interface HourlyForecast {
  time: string;
  tempC: number;
  condition: string;
  icon: string;
  isDay: boolean;
  windKph: number;
  humidity: number;
  chanceOfRain: number;
}

interface HourlyRainChance {
  time: string;
  chanceOfRain: number;
  condition: string;
}

const API_KEY = "7ee1943f1ded42e086784930252802";
const BASE_URL = "http://api.weatherapi.com/v1";

const ForecastDetail: React.FC<ForecastDetailProps> = ({ date }) => {
  const [weatherDetail, setWeatherDetail] = useState<WeatherDetail | null>(
    null
  );
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [hourlyRainChances, setHourlyRainChances] = useState<HourlyRainChance[]>([]);
  const [loading, setLoading] = useState(true);

  const translateCondition = (condition: string) => {
    const conditionMap: { [key: string]: string } = {
      sunny: "Có nắng",
      "partly cloudy": "Có mây và nắng",
      cloudy: "Có mây",
      overcast: "Nhiều mây",
      mist: "Sương mù",
      "patchy rain nearby": "Có mưa rải rác",
      "light rain": "Mưa nhẹ",
      "moderate rain": "Mưa vừa",
      "heavy rain": "Mưa to",
      thunderstorm: "Có giông",
      snow: "Có tuyết",
      fog: "Sương mù",
      clear: "Trời quang",
      "light drizzle": "Mưa phùn nhẹ",
      "moderate or heavy rain shower": "Mưa rào vừa hoặc nặng",
      "torrential rain shower": "Mưa rào dữ dội",
      "light sleet": "Mưa tuyết nhẹ",
      "moderate or heavy sleet": "Mưa tuyết vừa hoặc nặng",
      "light snow showers": "Mưa tuyết nhẹ",
      "moderate or heavy snow showers": "Mưa tuyết vừa hoặc nặng",
      "thundery outbreaks possible": "Có thể có giông",
      "blowing snow": "Tuyết bay",
      blizzard: "Bão tuyết",
      foggy: "Sương mù",
      "freezing fog": "Sương mù đóng băng",
      "patchy light drizzle": "Mưa phùn rải rác",
      "freezing drizzle": "Mưa phùn đóng băng",
      "heavy freezing drizzle": "Mưa phùn đóng băng nặng",
      "patchy light rain": "Mưa nhẹ rải rác",
      "light rain shower": "Mưa rào nhẹ",
      "ice pellets": "Mưa đá",
      "light showers of ice pellets": "Mưa đá nhẹ",
      "moderate or heavy showers of ice pellets": "Mưa đá vừa hoặc nặng",
      "patchy light snow": "Tuyết nhẹ rải rác",
      "light snow": "Tuyết nhẹ",
      "patchy moderate snow": "Tuyết vừa rải rác",
      "moderate snow": "Tuyết vừa",
      "patchy heavy snow": "Tuyết nặng rải rác",
      "heavy snow": "Tuyết nặng",
      "light rain and snow": "Mưa và tuyết nhẹ",
      "moderate or heavy rain and snow": "Mưa và tuyết vừa hoặc nặng",
      "patchy light rain with thunder": "Mưa nhẹ và sấm rải rác",
      "moderate or heavy rain with thunder": "Mưa vừa hoặc nặng và sấm",
      "patchy light snow with thunder": "Tuyết nhẹ và sấm rải rác",
      "moderate or heavy snow with thunder": "Tuyết vừa hoặc nặng và sấm",
    };

    return conditionMap[condition.toLowerCase()] || condition;
  };

  async function getWeatherByDate(location: string, date: string) {
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
      location
    )}&days=7&aqi=no&alerts=no`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const forecastDays = data.forecast.forecastday;

      const dayData = forecastDays.find((d: any) => d.date === date);
      if (!dayData) {
        console.warn(`Không tìm thấy dữ liệu cho ngày ${date}`);
        return null;
      }

      return {
        date: dayData.date,
        condition: dayData.day.condition.text,
        avgTempC: dayData.day.avgtemp_c,
        maxTempC: dayData.day.maxtemp_c,
        minTempC: dayData.day.mintemp_c,
        icon: dayData.day.condition.icon,
        humidity: dayData.day.avghumidity,
        windSpeed: dayData.day.maxwind_kph,
        pressure: dayData.day.pressure_mb,
        uv: dayData.day.uv,
        sunrise: dayData.astro.sunrise,
        sunset: dayData.astro.sunset,
      };
    } catch (error: any) {
      console.error("Lỗi khi lấy dữ liệu thời tiết:", error.message);
      return null;
    }
  }

  async function getHourlyForecast(location: string, date: string) {
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
      location
    )}&days=7&aqi=no&alerts=no`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const forecastDays = data.forecast.forecastday;

      const dayData = forecastDays.find((d: any) => d.date === date);
      if (!dayData) {
        console.warn(`Không tìm thấy dữ liệu cho ngày ${date}`);
        return null;
      }

      return dayData.hour.map((h: any) => ({
        time: h.time,
        tempC: h.temp_c,
        condition: h.condition.text,
        icon: h.condition.icon,
        isDay: h.is_day,
        windKph: h.wind_kph,
        humidity: h.humidity,
        chanceOfRain: h.chance_of_rain,
      }));
    } catch (error: any) {
      console.error("Lỗi khi lấy dữ liệu dự báo theo giờ:", error.message);
      return null;
    }
  }

  async function getHourlyRainChances(location: string, date: string) {
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
      location
    )}&days=7&aqi=no&alerts=no`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const forecastDays = data.forecast.forecastday;

      const dayData = forecastDays.find((d: any) => d.date === date);
      if (!dayData) {
        console.warn(`Không tìm thấy dữ liệu cho ngày ${date}`);
        return null;
      }

      return dayData.hour.map((h: any) => ({
        time: h.time,
        chanceOfRain: h.chance_of_rain,
        condition: h.condition.text,
      }));
    } catch (error: any) {
      console.error("Lỗi khi lấy dữ liệu dự báo mưa theo giờ:", error.message);
      return null;
    }
  }

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      const data = await getWeatherByDate("Ha Noi", date);
      const hourlyData = await getHourlyForecast("Ha Noi", date);
      const rainChances = await getHourlyRainChances("Ha Noi", date);
      setWeatherDetail(data);
      setHourlyForecast(hourlyData || []);
      setHourlyRainChances(rainChances || []);
      setLoading(false);
    };

    fetchWeatherData();
  }, [date]);

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString("vi-VN", { hour: "2-digit" });
  };

  const renderHourlyItem = ({ item }: { item: HourlyForecast }) => (
    <View style={styles.hourBlock}>
      <Text style={styles.hourText}>{formatTime(item.time)}</Text>
      <Ionicons
        name={getWeatherIconName(item.condition, item.isDay)}
        size={24}
        color="#FDB813"
      />
      <Text style={styles.hourTemp}>{Math.round(item.tempC)}°</Text>
    </View>
  );

  const getWeatherIconName = (condition: string, isDay: boolean) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return isDay ? "sunny" : "moon";
    } else if (conditionLower.includes("cloud")) {
      return isDay ? "partly-sunny" : "cloudy-night";
    } else if (conditionLower.includes("rain")) {
      return "rainy";
    } else if (conditionLower.includes("snow")) {
      return "snow";
    } else if (conditionLower.includes("thunder")) {
      return "thunderstorm";
    } else if (
      conditionLower.includes("fog") ||
      conditionLower.includes("mist")
    ) {
      return "cloudy";
    }
    return isDay ? "partly-sunny" : "cloudy-night";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!weatherDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không thể tải dữ liệu thời tiết</Text>
      </View>
    );
  }

  const getGradientColors = (percentage: number): [string, string] => {
    if (percentage < 30) return ['#8e44ad', '#9b59b6'];
    if (percentage < 60) return ['#9b59b6', '#6a3093'];
    return ['#6a3093', '#5438DC'];
  };

  const renderRainChanceBars = () => {
    return hourlyRainChances.map((item, index) => {
      const time = new Date(item.time);
      const hour = time.getHours();
      const formattedHour = `${hour}h`;
      
      return (
        <View key={index} style={styles.rainChanceItem}>
          <Text style={styles.hourText}>{formattedHour}</Text>
          <View style={styles.barContainer}>
            <LinearGradient
              colors={getGradientColors(item.chanceOfRain)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.barGradient, { width: `${item.chanceOfRain}%` }]}
            />
          </View>
          <Text style={[styles.percentText, { color: getTextColor(item.chanceOfRain) }]}>
            {item.chanceOfRain}%
          </Text>
        </View>
      );
    });
  };

  const getTextColor = (percentage: number): string => {
    if (percentage < 30) return '#8e44ad';
    if (percentage < 60) return '#9b59b6';
    return '#6a3093';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Chi tiết thời tiết</Text>

      {/* Hourly Forecast */}
      <View style={styles.forecastContainer}>
        <Text style={styles.label}>Dự báo hàng giờ</Text>
        <FlatList
          data={hourlyForecast}
          renderItem={renderHourlyItem}
          keyExtractor={(item) => item.time}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hourRow}
        />
        <TemperatureChart
          hourlyData={hourlyForecast.map((hour) => ({
            time: hour.time,
            tempC: hour.tempC,
          }))}
        />
      </View>

      <View style={styles.forecastCard}>
        <View style={styles.forecastHeader}>
          <Ionicons name="time-outline" size={20} color="#333" />
          <Text style={styles.forecastTitle}>Khả năng mưa theo giờ</Text>
        </View>

        <View style={styles.rainChanceContainer}>{renderRainChanceBars()}</View>
      </View>

      {/* Main Weather Info */}
      <View style={styles.mainInfoContainer}>
        <View style={styles.mainInfoItem}>
          <Ionicons name="thermometer" size={24} color="#885FFC" />
          <Text style={styles.mainInfoLabel}>Nhiệt độ trung bình</Text>
          <Text style={styles.mainInfoValue}>{weatherDetail.avgTempC}°C</Text>
        </View>
        <View style={styles.mainInfoItem}>
          <Ionicons name="water" size={24} color="#885FFC" />
          <Text style={styles.mainInfoLabel}>Độ ẩm</Text>
          <Text style={styles.mainInfoValue}>{weatherDetail.humidity}%</Text>
        </View>
      </View>

      {/* Weather Details */}
      <View style={styles.detailsContainer}>
        {/* Wind & Rain */}
        <View style={styles.row}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="speedometer" size={20} color="#885FFC" />
              <Text style={styles.label}>Tốc độ gió</Text>
            </View>
            <Text style={styles.value}>{weatherDetail.windSpeed} km/h</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="water" size={20} color="#885FFC" />
              <Text style={styles.label}>Áp suất</Text>
            </View>
            <Text style={styles.value}>{weatherDetail.pressure} mb</Text>
          </View>
        </View>

        {/* Pressure & UV */}
        <View style={styles.row}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="speedometer-outline" size={20} color="#885FFC" />
              <Text style={styles.label}>Chỉ số UV</Text>
            </View>
            <Text style={styles.value}>{weatherDetail.uv}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="sunny" size={20} color="#FDB813" />
              <Text style={styles.label}>Điều kiện</Text>
            </View>
            <Text style={styles.value}>
              {translateCondition(weatherDetail.condition)}
            </Text>
          </View>
        </View>

        {/* Sunrise / Sunset */}
        <View style={styles.row}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="arrow-up" size={20} color="#885FFC" />
              <Text style={styles.label}>Mặt trời mọc</Text>
            </View>
            <Text style={styles.value}>{weatherDetail.sunrise}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="arrow-down" size={20} color="#885FFC" />
              <Text style={styles.label}>Mặt trời lặn</Text>
            </View>
            <Text style={styles.value}>{weatherDetail.sunset}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    // padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  mainInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
  },
  mainInfoItem: {
    alignItems: "center",
  },
  mainInfoLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  mainInfoValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
    gap: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 80) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  forecastContainer: {
    // backgroundColor: "#D9C2FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  hourRow: {
    flexDirection: "row",
    paddingRight: 16,
  },
  hourBlock: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
  },
  hourText: {
    fontSize: 12,
    color: "#555",
  },
  hourTemp: {
    fontSize: 14,
    fontWeight: "600",
  },
  forecastCard: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  rainChanceContainer: {
    marginVertical: 10,
  },
  rainChanceItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  barContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    overflow: "hidden",
    marginHorizontal: 10,
  },
  barGradient: {
    height: "100%",
    borderRadius: 6,
  },
  percentText: {
    width: 40,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
});

export default ForecastDetail;

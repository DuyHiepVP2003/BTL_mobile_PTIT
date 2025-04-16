import { StyleSheet, Platform, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Header from "@/components/ducna/Header";
import { useEffect, useState } from "react";
import ForecastDayItem from "@/components/ducna/ForecastDayItem";
import { Ionicons } from "@expo/vector-icons";
import ForecastDetail from "@/components/ducna/ForecastDetail";
import * as Location from "expo-location";

const API_KEY = "7ee1943f1ded42e086784930252802";
const BASE_URL = "http://api.weatherapi.com/v1";

interface WeatherData {
  avgTempC: number;
  condition: string;
  date: string;
  icon: string;
  maxTempC: number;
  minTempC: number;
}

export default function TabTwoScreen() {
  const [activeTab, setActiveTab] = useState("7 ngày tới");
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const [currentLocation, setCurrentLocation] = useState<string>("Ha Noi");
  const [headerData, setHeaderData] = useState<any>(null); // để truyền sang Header

  async function get7DayForecast(location: string) {
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

      console.log("Dữ liệu dự báo thời tiết: alo alo ", forecastDays);

      const result = forecastDays.map((day: any) => ({
        date: day.date,
        condition: day.day.condition.text,
        avgTempC: day.day.avgtemp_c,
        maxTempC: day.day.maxtemp_c,
        minTempC: day.day.mintemp_c,
        icon: day.day.condition.icon,
      }));

      return result;
    } catch (error: any) {
      console.error("Lỗi khi lấy dữ liệu thời tiết:", error.message);
      return null;
    }
  }

  async function fetchLocationAndWeather() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const locationNameRes = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}`
      );
      const locationNameData = await locationNameRes.json();
      const city = locationNameData.location.name;
      setCurrentLocation(city);

      // Gọi luôn forecast 7 ngày
      const data = await get7DayForecast(city);
      setWeatherData(data);

      console.log("Dữ liệu thời tiết:", data);

      // Gọi API hiện tại để truyền lên Header
      const weatherNow = locationNameData.current;

      console.log("Dữ liệu thời tiết hiện tại:", weatherNow);
      const weatherDataForHeader = {
        location: `${city}, ${locationNameData.location.country}`,
        temperature: weatherNow.temp_c,
        condition: weatherNow.condition.text,
        date: new Date().toLocaleString("vi-VN"),
        day: `Ngày ${weatherNow.temp_c}°`,
        night: `Tối ${data?.[0]?.minTempC ?? "-"}°`,
        humidity: weatherNow.humidity,
        windSpeed: weatherNow.wind_kph,
        feelsLike: weatherNow.feelslike_c,
        avgtemp_c: data?.[0]?.avgTempC ?? 0,
      };
      setHeaderData(weatherDataForHeader);
    } catch (error) {
      console.error("Lỗi khi lấy vị trí và dữ liệu thời tiết:", error);
    }
  }

  useEffect(() => {
    // get7DayForecast("Ha Noi").then((data) => setWeatherData(data));
    fetchLocationAndWeather();
  }, []);

  // Function to get weather icon based on condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Ionicons name="sunny" size={28} color="#FDB813" />;
      case "patchy rain nearby":
        return <Ionicons name="rainy" size={28} color="#87CEFA" />;
      default:
        return <Ionicons name="partly-sunny" size={28} color="#FDB813" />;
    }
  };

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
    };

    return conditionMap[condition.toLowerCase()] || condition;
  };

  // Format date to Vietnamese format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  // Get day name in Vietnamese
  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[date.getDay()];
  };

  // Get filtered weather data based on activeTab
  const getFilteredWeatherData = () => {
    if (!weatherData.length) return [];

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    switch (activeTab) {
      case "Hôm nay":
        return weatherData.filter((item) => item.date === today);
      case "Ngày mai":
        return weatherData.filter((item) => item.date === tomorrow);
      case "7 ngày tới":
        return weatherData;
      default:
        return weatherData;
    }
  };

  const renderItem = ({ item }: { item: WeatherData }) => (
    <ForecastDayItem
      day={getDayName(item.date)}
      date={formatDate(item.date)}
      tempDay={`${item.maxTempC}°`}
      tempNight={`${item.minTempC}°`}
      condition={translateCondition(item.condition)}
      IconComponent={getWeatherIcon(item.condition)}
      DetailComponent={
        <ForecastDetail date={item.date} currentLocation={currentLocation} />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchPress={() => {}}
        headerData={headerData}
      />

      <FlatList
        data={getFilteredWeatherData()}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0ff",
  },
  listContainer: {
    paddingVertical: 8,
  },
});

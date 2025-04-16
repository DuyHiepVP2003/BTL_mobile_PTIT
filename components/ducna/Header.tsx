import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HeaderProps {
  onSearchPress: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  headerData: {
    location: string;
    temperature: number;
    condition: string;
    date: string;
    day: string;
    night: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    avgtemp_c: number;
  } | null;
}

const Header: React.FC<HeaderProps> = ({
  onSearchPress,
  activeTab,
  setActiveTab,
  headerData,
}) => {
  type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
  const router = useRouter();
  const tabs = ["Hôm nay", "Ngày mai", "7 ngày tới"];

  // This would come from your API in the future
  const weatherData = {
    location: "Ha Noi, Viet Nam",
    temperature: 3,
    condition: "Cloudy", // Cloudy
    date: "08/03/2025, 16:14",
    day: "Ngày 3°",
    night: "Tối -1°",
    humidity: 78,
    windSpeed: 12,
    feelsLike: 1,
  };

  console.log("Header data: ", headerData);
  // Function to determine which icon to display based on weather condition
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "có mây":
      case "cloudy":
        return { name: "cloudy", color: "#E0E0E0" };
      case "có nắng":
      case "sunny":
        return { name: "sunny", color: "#FFD700" };
      case "có mưa":
      case "rainy":
        return { name: "rainy", color: "#87CEFA" };
      case "có tuyết":
      case "snowy":
        return { name: "snow", color: "white" };
      case "có sấm sét":
      case "thunderstorm":
        return { name: "thunderstorm", color: "#FFD700" };
      case "có sương mù":
      case "foggy":
        return { name: "cloud", color: "#C0C0C0" };
      default:
        return { name: "partly-sunny", color: "#FFD700" };
    }
  };

  const weatherIcon = getWeatherIcon(
    headerData?.condition || weatherData.condition
  );

  const handleSearch = () => {
    router.push("/pages/weather-search");
  };
  return (
    <View style={styles.container}>
      {/* Row 1: Location + Search */}
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Text style={styles.location}> {headerData?.location}</Text>
        </View>
        <TouchableOpacity onPress={handleSearch} style={{ padding: 8 }}>
          {/* Search Icon */}
          <Ionicons name="search" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* Row 2: Temperature + Real feel + Weather Icon */}
      <View style={[styles.rowBetween, styles.tempRow]}>
        <View>
          <Text style={styles.temperature}>{headerData?.temperature}°</Text>
        </View>
        <View>
          <Text style={styles.realFeel}>
            Nhiệt độ thực tế {headerData?.avgtemp_c}
          </Text>
        </View>
        {/* <MaterialCommunityIcons
          name="weather-partly-cloudy"
          size={48}
          color="#FDB813"
        /> */}
        <View>
          <Ionicons
            name={weatherIcon.name as IoniconsName}
            size={50}
            color={weatherIcon.color}
            style={styles.weatherIcon}
          />
        </View>
      </View>

      {/* Row 3: Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#d9c2ff",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tempRow: {
    marginTop: 16,
    marginBottom: 8,
  },
  location: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  temperature: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#000",
  },
  realFeel: {
    fontSize: 14,
    color: "#444",
    marginLeft: -100,
    marginTop: 24,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#CBA3FF",
  },
  tabText: {
    fontSize: 14,
    color: "#000",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  weatherIcon: {
    // marginBottom: 5,
    // textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});

export default Header;

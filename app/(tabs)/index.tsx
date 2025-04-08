import { Image, StyleSheet, Platform, View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import tw from "twrnc";

export default function HomeScreen() {
  const router = useRouter();

  // Mock weather data
  const weatherData = {
    location: "Hà Nội, Việt Nam",
    temperature: 3,
    condition: "Cảm nhận - 2°",
    time: "16:14, 11/03/2025",
    dayTemp: "Ngày 3°",
    nightTemp: "Đêm -1°",
    details: [
      { title: "Tốc độ gió", value: "12km/h", change: "+2 km/h", icon: "weather-windy", route: "wind-details" },
      { title: "Áp suất", value: "720 hpa", change: "+32 hpa", icon: "arrow-collapse-down", route: "pressure-details" },
      { title: "Khả năng mưa", value: "24%", change: "-10%", icon: "weather-pouring", route: "rain-details" },
      { title: "Chỉ số UV", value: "2,3", change: "-0.3", icon: "white-balance-sunny", route: "uv-details" },
    ]
  };

  // Navigate to detail page
  const navigateToDetail = (route: string) => {
    router.push(`/(details)/${route}`);
  };

  return (
    <View style={styles.container}>
      {/* Main Weather Card with Frog Image Background */}
      <TouchableOpacity 
            onPress={() => navigateToDetail("temperature-details")}
          >
      <ImageBackground
        source={require("@/assets/images/frog.png")}
        style={styles.weatherCard}
        resizeMode="cover"
        
      >
        <View style={styles.weatherHeader}>
          <Text style={styles.locationText}>
            {weatherData.location}
          </Text>
          <Ionicons name="search" size={24} color="white" />
        </View>
        
        <View style={styles.weatherMain}>
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperatureText}>
              {weatherData.temperature}°
            </Text>
            <Text style={styles.conditionText}>
              {weatherData.condition}
            </Text>
          </View>
          <View style={styles.weatherIcon}>
            <Ionicons name="sunny" size={80} color="#FFD700" />
            <Ionicons name="cloud" size={50} color="white" style={styles.cloudIcon} />
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
              <MaterialCommunityIcons name={detail.icon} size={24} color="#6a3093" />
              <Text style={styles.detailName}>{detail.title}</Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.detailValue}>{detail.value}</Text>
              <Text style={styles.detailChange}>{detail.change}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    //marginTop: 40, // Added top margin
    // marginHorizontal: 12, // Added horizontal margins
  },
  weatherCard: {
    padding: 16,
    paddingTop: 0,
    height: 380,
    borderRadius: 30,
    overflow: 'hidden',
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  conditionText: {
    fontSize: 18,
    color: "white",
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  weatherIcon: {
    position: 'relative',
    marginRight: 20,
  },
  cloudIcon: {
    position: 'absolute',
    right: -10,
    top: 10,
  },
  tempRange: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 10,
  },
  tempRangeText: {
    color: 'white',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsContainer: {
    backgroundColor: '#f0e6ff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 12
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6dbff',
    padding: 22,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailName: {
    fontSize: 16,
    color: '#333',
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailChange: {
    fontSize: 12,
    color: '#666',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

const API_KEY = "7ee1943f1ded42e086784930252802";

type LocationItem = {
  id: string;
  name: string;
  country: string;
  temp: number;
  condition: string;
};

export default function WeatherSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const [recentSearches, setRecentSearches] = useState<LocationItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationItem | null>(
    null
  );

  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const locations = await res.json();

      if (Array.isArray(locations) && locations.length > 0) {
        // Dùng Promise.all để gọi API cho từng vị trí
        const resultsWithWeather: LocationItem[] = await Promise.all(
          locations.map(async (loc: any) => {
            const weatherRes = await fetch(
              `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${loc.name}`
            );
            const weatherData = await weatherRes.json();
            return {
              id: `${loc.id}-${loc.name}`,
              name: loc.name,
              country: loc.country,
              temp: weatherData.current.temp_c,
              condition: weatherData.current.condition.text,
            };
          })
        );

        setSearchResults(resultsWithWeather);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm thời tiết:", error);
    }
  };

  const handleLocationSelect = (location: LocationItem) => {
    // Cập nhật recentSearches: đẩy location lên đầu, xoá bản trùng nếu có
    setRecentSearches((prev) => {
      const updated = [
        location,
        ...prev.filter((item) => item.id !== location.id),
      ];
      return updated.slice(0, 5); // Giới hạn tối đa 5 mục gần đây
    });
    // Navigate to the weather detail screen with the selected location
    router.push({
      pathname: "/pages/weather-detail",
      params: { locationId: location.id, locationName: location.name },
    });
  };

  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationCountry}>{item.country}</Text>
        <Text style={styles.locationCondition}>{item.condition}</Text>
      </View>
      <Text style={styles.locationTemp}>{item.temp}°</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Call API weather theo toạ độ thật:
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&lang=vi`
        );
        const data = await response.json();

        const locationData: LocationItem = {
          id: `${latitude},${longitude}`,
          name: data.location.name,
          country: data.location.country,
          temp: data.current.temp_c,
          condition: data.current.condition.text,
        };

        setCurrentLocation(locationData);
      } catch (error) {
        console.error("Lỗi lấy vị trí hiện tại:", error);
      }
    })();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/weather-search.jpg")}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <StatusBar barStyle="light-content" />
        {/* Header with back button and title */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thời tiết</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {searchQuery.length === 0 && (
          <>
            {currentLocation && (
              <>
                <Text style={styles.sectionTitle}>Vị trí hiện tại</Text>
                {renderLocationItem({ item: currentLocation })}
              </>
            )}
            <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
            <FlatList
              data={recentSearches}
              renderItem={renderLocationItem || null}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}
        {searchQuery.length > 0 && searchResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
            <FlatList
              data={searchResults}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
            />
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(147, 112, 219, 0.5)", // Semi-transparent purple overlay
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  locationCountry: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  locationCondition: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  locationTemp: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});

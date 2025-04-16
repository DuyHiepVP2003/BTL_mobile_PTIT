import {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import tw from "twrnc";
import { useState } from "react";
import Base from "@/components/music-recomment/Base";
import Playlists from "@/components/music-recomment/Playlists";
import Artist from "@/components/music-recomment/Artist";
import Song from "@/components/music-recomment/Song";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWeather } from "@/hooks/useWeather";

const tabBar = [
  {
    id: 1,
    name: "playlist",
    title: "Playlist",
  },
  {
    id: 2,
    name: "artist",
    title: "Nghệ sĩ",
  },
  {
    id: 3,
    name: "song",
    title: "Ca khúc",
  },
];

export default function TabTwoScreen() {
  const [activeTab, setActiveTab] = useState("");
  const { weather } = useWeather();
  return (
    <View style={tw`bg-[#F6EDFF] flex-1`}>
      <View style={tw`bg-[#E1D3FA] p-[18px]`}>
        <View style={tw`flex-row justify-between items-center mt-[18px]`}>
          <Text style={tw`text-[18px] leading-[28px] text-bold`}>
            {weather?.location?.name}, {weather?.location?.country}
          </Text>
          {/* <Ionicons name="search" size={24} color="white" /> */}
        </View>
        <View style={tw`flex-row justify-between`}>
          <Text style={tw`text-[40px] leading-[64px]`}>
            {weather?.current?.temp_c}°C
          </Text>
          <Image source={require("@/assets/images/cloud_and_sun.png")} />
        </View>
        <View style={tw`flex-row gap-4`}>
          {tabBar.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={tw`flex-1 ${
                activeTab === item.name ? "bg-[#E0B6FF]" : "bg-white"
              } rounded-[14px] py-[8px]`}
              onPress={() => setActiveTab(item.name)}
            >
              <Text style={tw`text-[14px] text-center`}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView
        style={tw`p-[18px]`}
        contentContainerStyle={tw`pb-[24px]`}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "playlist" && <Playlists />}
        {activeTab === "artist" && <Artist />}
        {activeTab === "song" && <Song />}
        {activeTab === "" && <Base />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});

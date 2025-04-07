import {
  StyleSheet,
  Image,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import tw from "twrnc";
import { useState } from "react";
import Base from "@/components/music-recomment/Base";
import Playlists from "@/components/music-recomment/Playlists";
import Artist from "@/components/music-recomment/Artist";
import Song from "@/components/music-recomment/Song";

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image source={require("@/assets/images/bg-image.png")} />}
    >
      <View style={tw`flex-row gap-4`}>
        {tabBar.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={tw`flex-1 ${
              activeTab === item.name ? "bg-[#E0B6FF]" : "bg-white"
            } rounded-[14px] py-[8px]`}
            onPress={() => setActiveTab(item.name)}
          >
            <ThemedText style={tw`text-[14px] text-center`}>
              {item.title}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      {activeTab === "playlist" && <Playlists />}
      {activeTab === "artist" && <Artist />}
      {activeTab === "song" && <Song />}
      {activeTab === "" && <Base />}
    </ParallaxScrollView>
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

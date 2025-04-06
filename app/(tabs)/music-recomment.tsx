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
import CustomFlatList from "@/components/music-recomment/CustomFlatList";

const tabBar = [
  {
    name: "Playlist",
  },
  {
    name: "Nghệ sĩ",
  },
  {
    name: "Ca khúc",
  },
];

const PLAYLIST_DATA = [
  {
    id: 1,
    name: "name",
    album: "album",
  },
  {
    id: 2,
    name: "name",
    album: "album",
  },
  {
    id: 3,
    name: "name",
    album: "album",
  },
];

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Image source={require("@/assets/images/bg-image.png")} />}
    >
      <View style={tw`flex-row gap-4`}>
        {tabBar.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={tw`flex-1 bg-white rounded-[14px] py-[8px]`}
          >
            <ThemedText style={tw`text-[14px] text-center`}>
              {item.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="default">Gợi ý cho hôm nay</ThemedText>
      </ThemedView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="default">Playlist</ThemedText>
      </ThemedView>
      <CustomFlatList data={PLAYLIST_DATA} horizontal />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="default">Ca sĩ</ThemedText>
      </ThemedView>
      <CustomFlatList data={PLAYLIST_DATA} horizontal imageCircle />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="default">Ca khúc</ThemedText>
      </ThemedView>
      <CustomFlatList data={PLAYLIST_DATA} horizontal />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="default">Postcasts</ThemedText>
      </ThemedView>
      <CustomFlatList data={PLAYLIST_DATA} horizontal />
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
  playlist: {
    rowGap: 8,
    columnGap: 8,
  },
});

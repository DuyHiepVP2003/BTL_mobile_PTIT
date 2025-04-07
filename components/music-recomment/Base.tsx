import { StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import CustomFlatList from "./CustomFlatList";

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

const Base = () => {
  return (
    <>
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
    </>
  );
};
export default Base;

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

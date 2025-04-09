import { StyleSheet, Text, View } from "react-native";
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
      <View style={styles.titleContainer}>
        <Text>Gợi ý cho hôm nay</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text>Playlist</Text>
      </View>
      <CustomFlatList data={PLAYLIST_DATA} horizontal />
      <View style={styles.titleContainer}>
        <Text>Ca sĩ</Text>
      </View>
      <CustomFlatList data={PLAYLIST_DATA} horizontal imageCircle />
      <View style={styles.titleContainer}>
        <Text>Ca khúc</Text>
      </View>
      <CustomFlatList data={PLAYLIST_DATA} horizontal />
      <View style={styles.titleContainer}>
        <Text>Postcasts</Text>
      </View>
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

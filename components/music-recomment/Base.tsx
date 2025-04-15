import { StyleSheet, Text, View } from "react-native";
import CustomFlatList from "./CustomFlatList";
import { useArtists } from "@/hooks/useArtist";
import { useAlbums } from "@/hooks/useAlbums";
import { useTracks } from "@/hooks/useTracks";

const Base = () => {
  const { artists } = useArtists();
  const { albums } = useAlbums();
  // const { tracks } = useTracks();
  return (
    <>
      <View style={styles.titleContainer}>
        <Text>Gợi ý cho hôm nay</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text>Albums</Text>
      </View>
      <CustomFlatList
        data={albums.slice(0, 10).map((item: any) => {
          return {
            id: item?._id,
            name: item?.name,
            album: item?.genres[0],
            image: item?.images[0]?.url,
          };
        })}
        horizontal
      />
      <View style={styles.titleContainer}>
        <Text>Ca sĩ</Text>
      </View>
      <CustomFlatList
        data={artists.slice(0, 10).map((item: any) => {
          return {
            id: item?._id,
            name: item?.name,
            album: item?.genres[0],
            image: item?.images[0]?.url,
          };
        })}
        horizontal
        imageCircle
      />
      {/* <View style={styles.titleContainer}>
        <Text>Ca khúc</Text>
      </View>
      <CustomFlatList
        data={tracks?.slice(0, 10)?.map((item: any) => {
          return {
            id: item?._id,
            name: item?.name,
            album: item?.album?.name,
            image: item?.images[0]?.url,
          };
        })}
        horizontal
      /> */}
      {/* <View style={styles.titleContainer}>
        <Text>Postcasts</Text>
      </View>
      <CustomFlatList data={PLAYLIST_DATA} horizontal /> */}
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

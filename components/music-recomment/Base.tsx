import { StyleSheet, Text, View } from "react-native";
import CustomFlatList from "./CustomFlatList";
import { useArtists } from "@/hooks/useArtist";
import { useAlbums, useAlbumsByWeather } from "@/hooks/useAlbums";
import { useTracks } from "@/hooks/useTracks";

export function mapWeatherCondition(
  apiCondition: string,
  tempCelsius: number,
  windKph: number
) {
  const condition = apiCondition?.toLowerCase() || "sunny";

  if (condition.includes("sunny") || condition.includes("clear")) {
    return "sunny";
  }

  if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    condition.includes("shower")
  ) {
    return "rainy";
  }

  if (condition.includes("cloud") || condition.includes("overcast")) {
    return "cloudy";
  }

  if (
    condition.includes("fog") ||
    condition.includes("mist") ||
    condition.includes("haze")
  ) {
    return "foggy";
  }

  if (tempCelsius <= 15) {
    return "cold";
  }

  if (tempCelsius >= 30) {
    return "hot";
  }

  if (windKph > 25) {
    return "windy";
  }

  return "sunny";
}

const Base = ({ weather }: any) => {
  const { artists } = useArtists();
  const weatherCondition = mapWeatherCondition(
    weather?.current?.condition?.text,
    weather?.current?.temp_c,
    weather?.current?.wind_kph
  );
  const { albums } = useAlbumsByWeather(weatherCondition);
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
        data={albums.map((item: any) => {
          return {
            id: item?._id,
            name: item?.name,
            album: item?.genres[0],
            image: item?.images[0]?.url,
            navigate: `/album/${item?._id}`,
          };
        })}
        horizontal
        navigate
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
            navigate: `/singer/${item?._id}`,
          };
        })}
        horizontal
        imageCircle
        navigate
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

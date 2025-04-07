import { SafeAreaView, Text, FlatList, Image, View } from "react-native";
import { ThemedText } from "../ThemedText";
import tw from "twrnc";
import CustomTabList from "./CustomTabList";
const PLAYLIST = [
  {
    id: 1,
    name: "Playlist 1",
    description: "Thông tin chi tiết playlist 1",
  },
  {
    id: 2,
    name: "Playlist 1",
    description: "Thông tin chi tiết playlist 1",
  },
  {
    id: 3,
    name: "Playlist 1",
    description: "Thông tin chi tiết playlist 1",
  },
  {
    id: 4,
    name: "Playlist 1",
    description: "Thông tin chi tiết playlist 1",
  },
  {
    id: 5,
    name: "Playlist 1",
    description: "Thông tin chi tiết playlist 1",
  },
];

const Playlists = () => {
  return (
    <SafeAreaView>
      <Text style={tw`mb-[18px]`}>Playlist</Text>
      <CustomTabList data={PLAYLIST} />
    </SafeAreaView>
  );
};
export default Playlists;

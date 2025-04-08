import { SafeAreaView, Text } from "react-native";
import CustomTabList from "./CustomTabList";
import tw from "twrnc";

const SONG = [
  {
    id: 1,
    name: "SONG 1",
    description: "Thông tin chi tiết SONG 1",
  },
  {
    id: 2,
    name: "SONG 1",
    description: "Thông tin chi tiết SONG 1",
  },
];

const Song = () => {
  return (
    <SafeAreaView>
      <Text style={tw`mb-[18px]`}>Song</Text>
      <CustomTabList data={SONG} />
    </SafeAreaView>
  );
};
export default Song;

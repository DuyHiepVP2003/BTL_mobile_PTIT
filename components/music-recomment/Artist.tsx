import { SafeAreaView, Text } from "react-native";
import CustomTabList from "./CustomTabList";
import tw from "twrnc";
import { useRouter } from "expo-router";

const ARTIST = [
  {
    id: 1,
    name: "ARTIST 1",
    description: "Thông tin chi tiết ARTIST 1",
  },
  {
    id: 2,
    name: "ARTIST 1",
    description: "Thông tin chi tiết ARTIST 1",
  },
  {
    id: 3,
    name: "ARTIST 1",
    description: "Thông tin chi tiết ARTIST 1",
  },
  {
    id: 4,
    name: "ARTIST 1",
    description: "Thông tin chi tiết ARTIST 1",
  },
  {
    id: 5,
    name: "ARTIST 1",
    description: "Thông tin chi tiết ARTIST 1",
  },
];
const Artist = () => {
  const router = useRouter();
  return (
    <SafeAreaView>
      <Text style={tw`mb-[18px]`}>Artist</Text>
      <CustomTabList
        data={ARTIST}
        onPress={() => router.push("/(music)/[id]/singer")}
      />
    </SafeAreaView>
  );
};
export default Artist;

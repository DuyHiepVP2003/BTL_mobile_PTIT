import { SafeAreaView, Text } from "react-native";
import CustomTabList from "./CustomTabList";
import tw from "twrnc";
import { useRouter } from "expo-router";
import { useArtists } from "@/hooks/useArtist";

const Artist = () => {
  const router = useRouter();
  const { artists } = useArtists();
  return (
    <SafeAreaView>
      <Text style={tw`mb-[18px]`}>Artist</Text>
      <CustomTabList
        data={artists.map((item: any) => {
          return {
            id: item?._id,
            name: item?.name,
            description: item?.genres.join(","),
            imageUrl: item?.images[0]?.url,
          };
        })}
        onPress
      />
    </SafeAreaView>
  );
};
export default Artist;

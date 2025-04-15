import { SafeAreaView, Text } from "react-native";
import CustomTabList from "./CustomTabList";
import tw from "twrnc";
import useTracks from "@/hooks/useTracks";

const Song = () => {
  const { tracks } = useTracks();
  return (
    <SafeAreaView>
      <Text style={tw`mb-[18px]`}>Song</Text>
      <CustomTabList
        data={tracks.map((item: any) => {
          return {
            id: item?._id,
            name: item?.name,
            description: `Album: ${item?.album?.name}`,
            imageUrl: item?.album?.images[0].url,
          };
        })}
      />
    </SafeAreaView>
  );
};
export default Song;

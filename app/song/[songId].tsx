import CustomTabList from "@/components/music-recomment/CustomTabList";
import { useAlbums } from "@/hooks/useAlbums";
import { useArtistDetail } from "@/hooks/useArtist";
import { useRoute } from "@react-navigation/native";
import { View, Text, Image, ScrollView, Pressable } from "react-native";
import Slider from "@react-native-community/slider";

import tw from "twrnc";
import { useTrackDetail } from "@/hooks/useTracks";
import { useRouter } from "expo-router";
export default function TabTwoScreen() {
  const route = useRoute();
  const router = useRouter();
  const { songId } = route.params as { songId: string };
  const { albums } = useAlbums();
  const { track } = useTrackDetail(songId);
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60 / 1000);
    const s = Math.floor((seconds / 1000) % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  }
  return (
    <ScrollView>
      <View>
        <View
          style={tw`text-[#222222] text-[20px] p-[18px] py-[50px] bg-[#F6EDFF]`}
        >
          <Text style={tw`text-center text-[18px] font-bold`}>
            Bài hát hiện tại
          </Text>
          <Image
            source={{ uri: track?.album?.images[0].url }}
            style={tw.style("w-[335px] h-[335px] rounded-[30px] mt-3")}
            resizeMode="cover"
          />
          <Text style={tw`text-[18px] mt-3 font-bold`}>{track?.name}</Text>
          <Text style={tw`text-[16px] mt-3`}>{track?.artists[0]?.name}</Text>
          <View style={tw`px-4 mt-6`}>
            <Slider
              style={tw`w-full h-6`}
              minimumValue={0}
              maximumValue={track?.duration_ms}
              value={0}
              minimumTrackTintColor="#8E05C2"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#8E05C2"
            />
            <View style={tw`flex-row justify-between mt-[-4px]`}>
              <Text style={tw`text-xs text-gray-600`}>{formatTime(0)}</Text>
              <Text style={tw`text-xs text-gray-600`}>
                {formatTime(track?.duration_ms)}
              </Text>
            </View>
            <View
              style={tw`flex-row justify-center items-center gap-[30px] mt-[30px]`}
            >
              <Image
                source={require("@/assets/images/pre-song-icon.png")}
                style={tw.style("rounded-md")}
                resizeMode="cover"
              />
              <View
                style={tw`bg-[#E1D3FA] flex justify-center p-[20px] rounded-full`}
              >
                <Image
                  source={require("@/assets/images/pause-icon.png")}
                  style={tw.style("rounded-md")}
                  resizeMode="cover"
                />
              </View>
              <Image
                source={require("@/assets/images/next-song-icon.png")}
                style={tw.style("rounded-md")}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
      </View>
      <View
        style={tw`text-[#222222] text-[20px] p-[18px] pb-[50px] bg-[#F6EDFF]`}
      >
        <Text style={tw`text-[#222222] text-[16px] mb-[20px]`}>Albums</Text>
        {albums.map((item: any, index: number) => (
          <Pressable
            onPress={() => router.navigate(`/album/${item._id}`)}
            key={index}
            style={tw.style("flex-row items-cente rounded-xl mb-[18px]")}
          >
            <Image
              source={{ uri: item?.images[0].url }}
              style={tw.style("w-[55px] h-[55px] rounded-md mr-3")}
              resizeMode="cover"
            />
            <View style={tw.style("flex-1")}>
              <Text style={tw.style("text-[14px] font-bold")}>{item?.name}</Text>
              <Text style={tw.style("text-[12px] text-gray-500")}>
                {item?.release_date}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

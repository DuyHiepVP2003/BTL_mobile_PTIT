import CustomTabList from "@/components/music-recomment/CustomTabList";
import { useAlbums, useAlbumsDetail } from "@/hooks/useAlbums";
import { useArtistDetail } from "@/hooks/useArtist";
import { useRoute } from "@react-navigation/native";
import { View, Text, Image, ScrollView, Pressable } from "react-native";
import Slider from "@react-native-community/slider";

import tw from "twrnc";
import { useTrackDetail, useTrackDetailByAlbumId } from "@/hooks/useTracks";
import { useRouter } from "expo-router";
export default function TabTwoScreen() {
  const route = useRoute();
  const { albumId } = route.params as { albumId: string };
  const { album } = useAlbumsDetail(albumId);
  const { track } = useTrackDetailByAlbumId(albumId);
  const router = useRouter();
  return (
    <ScrollView style={tw`bg-[#F6EDFF]`}>
      <View>
        <View
          style={tw`text-[#222222] text-[20px] w-full flex items-center px-[18px] pt-[50px] bg-[#F6EDFF]`}
        >
          <Text style={tw`text-center text-[18px] font-bold`}>Album</Text>
          <Image
            source={{ uri: album?.images[0].url }}
            style={tw.style("w-[335px] h-[335px] rounded-[30px] mt-3")}
            resizeMode="cover"
          />
          <Text style={tw`text-[18px] mt-3 font-bold`}>{album?.name}</Text>
          <Text style={tw`text-[16px] mt-3`}>{album?.artists[0]?.name}</Text>
        </View>
      </View>
      <View
        style={tw`text-[#222222] text-[20px] p-[18px] pb-[50px] bg-[#F6EDFF]`}
      >
        <Text style={tw`text-[#222222] text-[16px] mb-[20px]`}>
          Bài hát thuộc album
        </Text>
        {track?.map((item: any, index: number) => (
          <Pressable
            onPress={() => router.navigate(`/song/${item?._id}`)}
            key={index}
            style={tw.style("flex-row items-cente rounded-xl mb-[18px]")}
          >
            <Image
              source={{ uri: item?.artists[0]?.images[0].url }}
              style={tw.style("w-[55px] h-[55px] rounded-md mr-3")}
              resizeMode="cover"
            />
            <View style={tw.style("flex-1")}>
              <Text style={tw.style("text-[14px] font-bold")}>{item.name}</Text>
              <Text style={tw.style("text-[12px] text-gray-500")}>
                {item?.artists[0]?.name}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

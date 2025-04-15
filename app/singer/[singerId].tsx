import CustomTabList from "@/components/music-recomment/CustomTabList";
import useAlbums from "@/hooks/useAlbums";
import { useArtistDetail } from "@/hooks/useArtist";
import { useRoute } from "@react-navigation/native";
import { View, Text, Image, ScrollView } from "react-native";

import tw from "twrnc";

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

export default function TabTwoScreen() {
  const route = useRoute();
  const { singerId } = route.params as { singerId: string };
  const { artist } = useArtistDetail(singerId);
  const { albums } = useAlbums(singerId);
  return (
    <>
      <View style={tw`bg-[#F6EDFF]`}>
        <View style={tw`bg-[#ffffff] py-[30px] rounded-b-[54px]`}>
          <View style={tw`flex justify-center items-center`}>
            <Text style={tw`text-[16px] font-semibold text-[#383838]`}>
              Profile
            </Text>
            <Image
              source={{ uri: artist?.images[0].url }}
              style={tw`w-[90px] h-[90px] rounded-full mt-[20px]`}
            />
            <Text style={tw`text-[#222222] text-[20px] font-bold mt-[20px]`}>
              {artist?.name}
            </Text>
            <Text
              style={tw`text-[#222222] text-[12px] my-[20px] max-w-[250px]`}
            >
              {artist?.genres.join(", ")}
            </Text>
            <View style={tw`flex flex-row justify-between gap-[100px]`}>
              <View style={tw`flex justify-center items-center`}>
                <Text style={tw`text-[#222222] text-[20px] font-bold`}>
                  {artist?.followers?.total}
                </Text>
                <Text style={tw`text-[#222222] text-[18px]`}>
                  Người đăng ký
                </Text>
              </View>
              {/* <View style={tw`flex justify-center items-center`}>
                <Text style={tw`text-[#222222] text-[20px] font-bold`}>
                  243
                </Text>
                <Text style={tw`text-[#222222] text-[20px]`}>Followes</Text>
              </View> */}
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        style={tw`text-[#222222] text-[20px] p-[18px] pb-[50px] bg-[#F6EDFF]`}
      >
        <Text style={tw`text-[#222222] text-[16px] mb-[20px]`}>Albums</Text>
        {albums.map((item: any, index: number) => (
          <View
            key={index}
            style={tw.style("flex-row items-cente rounded-xl mb-[18px]")}
          >
            <Image
              source={{ uri: item?.images[0].url }}
              style={tw.style("w-[55px] h-[55px] rounded-md mr-3")}
              resizeMode="cover"
            />
            <View style={tw.style("flex-1")}>
              <Text style={tw.style("text-[14px] font-bold")}>{item.name}</Text>
              <Text style={tw.style("text-[12px] text-gray-500")}>
                {item?.release_date}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

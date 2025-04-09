import CustomTabList from "@/components/music-recomment/CustomTabList";
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
  return (
    <>
      <View style={tw`bg-[#F6EDFF]`}>
        <View style={tw`bg-[#ffffff] py-[30px] rounded-b-[54px]`}>
          <View style={tw`flex justify-center items-center`}>
            <Text style={tw`text-[16px] font-semibold text-[#383838]`}>
              Profile
            </Text>
            <Image
              source={require("@/assets/images/playlist.png")}
              style={tw`w-[90px] h-[90px] rounded-full mt-[20px]`}
            />
            <Text style={tw`text-[#222222] text-[12px] mt-[20px]`}>
              example@gmail.com
            </Text>
            <Text style={tw`text-[#222222] text-[20px] font-bold mt-[20px]`}>
              Artist name
            </Text>
            <View style={tw`flex flex-row justify-between gap-[100px]`}>
              <View style={tw`flex justify-center items-center`}>
                <Text style={tw`text-[#222222] text-[20px] font-bold`}>
                  778
                </Text>
                <Text style={tw`text-[#222222] text-[20px]`}>Followes</Text>
              </View>
              <View style={tw`flex justify-center items-center`}>
                <Text style={tw`text-[#222222] text-[20px] font-bold`}>
                  243
                </Text>
                <Text style={tw`text-[#222222] text-[20px]`}>Followes</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        style={tw`text-[#222222] text-[20px] p-[18px] pb-[50px] bg-[#F6EDFF]`}
      >
        <Text style={tw`text-[#222222] text-[16px] mb-[20px]`}>
          PUBLIC PLAYLISTS
        </Text>
        {PLAYLIST.map((item: any, index: number) => (
          <View
            key={index}
            style={tw.style("flex-row items-cente rounded-xl mb-[18px]")}
          >
            <Image
              source={require("@/assets/images/playlist.png")}
              style={tw.style("w-[55px] h-[55px] rounded-md mr-3")}
              resizeMode="cover"
            />
            <View style={tw.style("flex-1")}>
              <Text style={tw.style("text-[14px] font-bold")}>{item.name}</Text>
              <Text style={tw.style("text-[12px] text-gray-500")}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

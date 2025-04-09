import { FlatList, Image, Pressable, Text, View } from "react-native";
import tw from "twrnc";

type CustomTabListProps = {
  data: any;
  imageCircle?: boolean;
  onPress?: () => void;
};

export default function CustomTabList({
  data,
  imageCircle,
  onPress,
}: CustomTabListProps) {
  return (
    <>
      {data.map((item: any, index: number) => (
        <Pressable
          key={index}
          style={tw.style(
            "flex-row items-center bg-[#F3E8FF] rounded-xl mb-[18px]"
          )}
          onPress={onPress}
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
        </Pressable>
      ))}
    </>
  );
}

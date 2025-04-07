import { FlatList, Image, View } from "react-native";
import { ThemedText } from "../ThemedText";
import tw from "twrnc";

type CustomFlatListProps = {
  data: any;
  horizontal?: boolean;
  imageCircle?: boolean;
};

export default function CustomFlatList({
  data,
  horizontal,
  imageCircle,
}: CustomFlatListProps) {
  return (
    <FlatList
      data={data}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={tw.style("mr-[8px]")}>
          <View style={tw.style("w-full mx-auto")}>
            <Image
              source={require("@/assets/images/playlist.png")}
              style={tw.style(
                `w-[134px] h-[134px] ${imageCircle && "rounded-full"}`
              )}
            />
          </View>
          <ThemedText
            style={tw.style("text-[10px] font-bold w-full text-center")}
          >
            {item.name}
          </ThemedText>
          <ThemedText
            style={tw.style("text-[8px] text-[#A7A7A7] w-full text-center")}
          >
            {item.album}
          </ThemedText>
        </View>
      )}
      keyExtractor={(item) => String(item.id)}
    />
  );
}

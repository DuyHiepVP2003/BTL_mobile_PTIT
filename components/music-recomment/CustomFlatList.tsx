import { FlatList, Image, Text, View } from "react-native";
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
              source={{ uri: item?.image }}
              style={tw.style(
                `w-[134px] h-[134px] ${imageCircle && "rounded-full"}`
              )}
            />
          </View>
          <Text
            style={tw.style(
              "text-[10px] max-w-[134px] font-bold w-full text-center truncate"
            )}
          >
            {item?.name}
          </Text>
          <Text
            style={tw.style(
              "text-[8px] max-w-[134px] text-[#A7A7A7] w-full text-center truncate"
            )}
          >
            {item?.album}
          </Text>
        </View>
      )}
      keyExtractor={(item) => String(item?.id)}
    />
  );
}

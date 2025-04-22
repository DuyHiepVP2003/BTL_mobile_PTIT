import { FlatList, Image, Pressable, Text, View } from "react-native";
import { ThemedText } from "../ThemedText";
import tw from "twrnc";
import { navigate } from "expo-router/build/global-state/routing";
import { useRouter } from "expo-router";

type CustomFlatListProps = {
  data: any;
  horizontal?: boolean;
  imageCircle?: boolean;
  navigate?: boolean;
};

export default function CustomFlatList({
  data,
  horizontal,
  imageCircle,
  navigate,
}: CustomFlatListProps) {
  const router = useRouter();
  return (
    <FlatList
      data={data}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable
          style={tw.style("mr-[8px]")}
          onPress={navigate ? () => router.navigate(item?.navigate) : undefined}
        >
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
        </Pressable>
      )}
      keyExtractor={(item) => String(item?.id)}
    />
  );
}

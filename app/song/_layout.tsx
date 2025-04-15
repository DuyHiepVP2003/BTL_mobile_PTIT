import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="[songId]" options={{ headerShown: false }} />
    </Stack>
  );
}

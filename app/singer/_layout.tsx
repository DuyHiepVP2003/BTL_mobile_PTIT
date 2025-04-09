import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen name="[singerId]" options={{ headerShown: false }} />
    </Stack>
  );
}

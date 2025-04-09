import { Stack } from "expo-router";

export default function DetailsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="temperature-details" 
      />
      <Stack.Screen 
        name="rain-details" 
      />
      <Stack.Screen 
        name="wind-details" 
      />
      <Stack.Screen 
        name="pressure-details" 
      />
      <Stack.Screen 
        name="uv-details" 
      />
    </Stack>
  );
}
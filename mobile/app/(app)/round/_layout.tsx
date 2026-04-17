import { Stack } from 'expo-router';

export default function RoundLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="course-search" />
      <Stack.Screen name="setup" />
      <Stack.Screen name="gps" options={{ gestureEnabled: false }} />
      <Stack.Screen name="scorecard" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}

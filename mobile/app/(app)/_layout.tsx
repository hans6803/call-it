import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/components/theme';

const icon = (emoji: string) => () => <Text style={{ fontSize: 22 }}>{emoji}</Text>;

export default function AppLayout() {
  const session = useAuthStore(s => s.session);
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.blueDeep,
          borderTopColor: Colors.greyDark,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: Colors.white,
        tabBarInactiveTintColor: Colors.grey,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen name="index"   options={{ title: 'Home',     tabBarIcon: icon('⛳') }} />
      <Tabs.Screen name="stats"   options={{ title: 'Stats',    tabBarIcon: icon('📊') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile',  tabBarIcon: icon('👤') }} />
      {/* Round screens hidden from tab bar */}
      <Tabs.Screen name="round"   options={{ href: null }} />
    </Tabs>
  );
}

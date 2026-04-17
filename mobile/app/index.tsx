/**
 * Root index — redirects based on auth state.
 */
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/components/theme';

export default function Root() {
  const { session, loading } = useAuthStore();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.blueDeep }}>
        <ActivityIndicator color={Colors.blue} size="large" />
      </View>
    );
  }

  return session ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/sign-in" />;
}

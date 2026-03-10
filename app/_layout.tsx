import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { theme, font } from '@/constants/Colors';
import { useChildrenStore } from '@/store/childrenStore';
import { useAuthStore } from '@/store/authStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const loadData = useChildrenStore((s) => s.loadData);
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    Promise.all([loadData(), loadSession()]).then(() => {
      setReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!ready) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.primary,
        headerTitleStyle: {
          fontWeight: font.weight.semibold,
          color: theme.text,
        },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="child/new"
        options={{
          title: 'New Record',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="child/[id]"
        options={{
          title: 'Child Details',
        }}
      />
    </Stack>
  );
}

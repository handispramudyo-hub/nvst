import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  },
});

function RootNavigator() {
  const { hydrated, token, wallet, refreshMe } = useAuthStore();
  const isAuthed = !!token;

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [hydrated]);

  useEffect(() => {
    if (isAuthed && !wallet) {
      refreshMe().catch(() => undefined);
    }
  }, [isAuthed, wallet, refreshMe]);

  if (!hydrated) {
    return <Spinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Protected guard={isAuthed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="project/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="investments/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="deposit/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="deposit/confirm/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="deposit/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="withdraw/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="withdraw/confirm" options={{ presentation: 'card' }} />
        <Stack.Screen name="withdraw/success" options={{ presentation: 'card' }} />
        <Stack.Screen name="investments/create" options={{ presentation: 'card' }} />
        <Stack.Screen name="investments/confirm" options={{ presentation: 'card' }} />
        <Stack.Screen name="investments/success" options={{ presentation: 'card' }} />
        <Stack.Screen name="accounts" options={{ presentation: 'modal' }} />
        <Stack.Screen name="transactions" options={{ presentation: 'card' }} />
        <Stack.Screen name="transactions/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="referral" options={{ presentation: 'card' }} />
        <Stack.Screen name="change-password" options={{ presentation: 'modal' }} />
        <Stack.Screen name="change-pin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile-edit" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthed}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <RootNavigator />
    </QueryClientProvider>
  );
}

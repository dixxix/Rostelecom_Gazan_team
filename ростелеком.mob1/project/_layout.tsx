import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ProtectedRoute() {
  const { authState, isLoading } = useAuth();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    console.log('Auth check:', { isAuthenticated: authState.isAuthenticated, pending2FA: authState.pending2FA, segments });

    if (!authState.isAuthenticated && !authState.pending2FA && !inAuthGroup) {
      router.replace('/login');
    } else if (authState.isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [authState.isAuthenticated, authState.pending2FA, segments, isLoading, router]);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Назад',
        headerStyle: {
          backgroundColor: colors.background.card,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '700' as const,
        },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="project/[id]"
        options={{
          headerShown: true,
          title: 'Проект',
        }}
      />
      <Stack.Screen
        name="create-project"
        options={{
          headerShown: true,
          title: 'Создать проект',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <ProjectsProvider>
                <ProtectedRoute />
              </ProjectsProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

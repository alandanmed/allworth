import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useNotificationResponseHandler } from '@/hooks/use-notification-response';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  useNotificationResponseHandler();
  const { isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="transaction/[id]" options={{ title: 'Transaction' }} />
      <Stack.Screen name="budgets" options={{ title: 'Budgets' }} />
      <Stack.Screen name="subscriptions" options={{ title: 'Subscriptions' }} />
      <Stack.Screen name="daily-summary" options={{ title: 'Daily Summary' }} />
      <Stack.Screen name="bank-connections" options={{ title: 'Bank Connections' }} />
    </Stack>
  );
}

// On desktop browsers, keep the phone-sized layout centered instead of stretched.
function WebFrame({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const showingLanding = !isLoading && !user && pathname === '/';
  // The landing page uses the full browser width; the app itself stays phone-sized.
  if (Platform.OS !== 'web' || showingLanding) return <>{children}</>;
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#1D211B' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 480, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <WebFrame>
            <RootLayoutNav />
          </WebFrame>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

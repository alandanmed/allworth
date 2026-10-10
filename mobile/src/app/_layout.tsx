import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, Pressable, Text, useColorScheme, useWindowDimensions, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { leaveApp, useAppEntered } from '@/hooks/use-app-entry';
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

function BackToSite({ compact }: { compact: boolean }) {
  return (
    <Pressable
      onPress={() => {
        leaveApp();
        router.replace('/');
      }}
      accessibilityRole="link"
      accessibilityLabel="Back to the AllWorth site"
      style={({ hovered, pressed, focused }: any) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: focused ? '#F1E9DA' : 'rgba(241,233,218,0.28)',
        backgroundColor: hovered ? 'rgba(241,233,218,0.16)' : 'rgba(241,233,218,0.07)',
        opacity: pressed ? 0.7 : 1,
        transform: [{ translateX: hovered ? -2 : 0 }],
        alignSelf: compact ? 'center' : 'flex-start',
      })}>
      <Text style={{ color: '#F1E9DA', fontSize: 14, fontWeight: '600' }}>{'\u2190 Back to site'}</Text>
    </Pressable>
  );
}

// On desktop browsers, keep the phone-sized layout centered instead of stretched.
// The "back to site" control lives in this frame, beside the app, never inside it.
function WebFrame({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const entered = useAppEntered();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const showingLanding = !isLoading && pathname === '/' && !entered;
  // The landing page uses the full browser width; the app itself stays phone-sized.
  if (Platform.OS !== 'web' || showingLanding) return <>{children}</>;
  const wide = width >= 760;
  return (
    <View style={{ flex: 1, backgroundColor: '#1D211B', alignItems: 'center' }}>
      {!wide && (
        <View style={{ paddingVertical: 8 }}>
          <BackToSite compact />
        </View>
      )}
      <View style={{ flex: 1, width: '100%', maxWidth: 480, overflow: 'hidden' }}>{children}</View>
      {wide && (
        <View style={{ position: 'absolute', top: 24, left: 24 }}>
          <BackToSite compact={false} />
        </View>
      )}
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

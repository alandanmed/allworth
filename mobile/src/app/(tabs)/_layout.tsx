import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { Landing } from '@/components/landing';
import { useAuth } from '@/hooks/use-auth';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) {
    // Signed-out web visitors get the marketing page; native goes straight to login.
    return Platform.OS === 'web' ? <Landing /> : <Redirect href="/auth" />;
  }

  return <AppTabs />;
}

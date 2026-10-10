import { Redirect, usePathname } from 'expo-router';
import { Platform } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { Landing } from '@/components/landing';
import { useAppEntered } from '@/hooks/use-app-entry';
import { useAuth } from '@/hooks/use-auth';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const entered = useAppEntered();
  const pathname = usePathname();

  if (isLoading) return null;

  // On web the site root is always the marketing page, signed in or not.
  // The app starts only after the visitor presses Launch.
  if (Platform.OS === 'web' && pathname === '/' && !entered) return <Landing />;

  if (!user) return <Redirect href="/auth" />;
  return <AppTabs />;
}

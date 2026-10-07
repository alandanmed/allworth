import { Tabs } from 'expo-router';
import { Text, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

const TABS = [
  { name: 'index', title: 'Home', icon: '\u2302' },
  { name: 'accounts', title: 'Accounts', icon: '\u25A4' },
  { name: 'activity', title: 'Activity', icon: '\u2630' },
  { name: 'assistant', title: 'Assistant', icon: '\u2726' },
  { name: 'profile', title: 'Profile', icon: '\u25CE' },
] as const;

// Web replacement for the native tab bar (NativeTabs is iOS/Android only).
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' || !scheme ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#208AEF',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>{tab.icon}</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}

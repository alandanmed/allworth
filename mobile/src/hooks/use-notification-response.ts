import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useNotificationResponseHandler() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'daily-summary' && typeof data.date === 'string') {
        router.push(`/daily-summary?date=${data.date}`);
      }
    });
    return () => subscription.remove();
  }, []);
}

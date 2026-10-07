import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Local notifications aren't available in browsers; every export no-ops on web.
const isWeb = Platform.OS === 'web';

if (!isWeb) Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Fires a LOCAL notification (device-scheduled, not server push — see
 * project notes on Expo Go's remote push limitations). Body is deliberately
 * generic per the privacy requirement: real numbers only appear once the
 * user opens the app and views the summary screen.
 */
export async function fireDailySummaryNotification(date: string) {
  if (isWeb) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'AllWorth',
      body: 'Your daily AllWorth summary is ready.',
      data: { type: 'daily-summary', date },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}

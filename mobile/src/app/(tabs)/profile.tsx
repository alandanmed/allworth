import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { firebaseAuth } from '@/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { useGenerateDailySummary } from '@/hooks/use-daily-summary';
import { useTheme } from '@/hooks/use-theme';
import { useUpdateUserPreferences, useUserPreferences } from '@/hooks/use-user-preferences';
import { todayLocalIsoDate } from '@/utils/date';

function ManageRow({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.menuRow, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="default">{label}</ThemedText>
      <ThemedText type="default" themeColor="textSecondary">
        {'\u203A'}
      </ThemedText>
    </Pressable>
  );
}


export default function ProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const generateDailySummary = useGenerateDailySummary();
  const preferencesQuery = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();
  const [previewSending, setPreviewSending] = useState(false);

  const notificationsEnabled = preferencesQuery.data?.daily_summary_enabled ?? true;

  function toggleNotifications(value: boolean) {
    updatePreferences.mutate(value);
  }

  async function previewDailySummary() {
    setPreviewSending(true);
    generateDailySummary.mutate(undefined, {
      onSuccess: () => {
        router.push(`/daily-summary?date=${todayLocalIsoDate()}`);
        setPreviewSending(false);
      },
      onError: () => setPreviewSending(false),
    });
  }

  return (
    <ScreenContainer>
      <ThemedText type="title" style={styles.header}>
        Profile
      </ThemedText>

      <View style={styles.emailBlock}>
        <ThemedText type="small" themeColor="textSecondary">
          Signed in as
        </ThemedText>
        <ThemedText type="default">{user?.email}</ThemedText>
      </View>

      <ThemedText type="smallBold" style={styles.sectionLabel}>
        Manage
      </ThemedText>
      <View style={styles.manageList}>
        <ManageRow label="Budgets" onPress={() => router.push('/budgets')} />
        <ManageRow label="Subscriptions" onPress={() => router.push('/subscriptions')} />
        <ManageRow label="Bank Connections" onPress={() => router.push('/bank-connections')} />
      </View>

      <ThemedText type="smallBold" style={styles.sectionLabel}>
        Notifications
      </ThemedText>
      <View style={[styles.toggleRow, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.toggleTextBlock}>
          <ThemedText type="default">Daily summary</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            A quiet reminder each day — amounts stay private until you open it.
          </ThemedText>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          disabled={preferencesQuery.isLoading}
          accessibilityLabel="Toggle daily summary notifications"
        />
      </View>

      <AppButton
        label="Preview today's summary"
        variant="outline"
        onPress={previewDailySummary}
        loading={previewSending}
        style={styles.previewButton}
      />

      <AppButton
        label="Log Out"
        variant="destructive"
        onPress={() => signOut(firebaseAuth)}
        style={styles.logoutButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
  emailBlock: { marginBottom: Spacing.five },
  sectionLabel: { marginBottom: Spacing.two },
  manageList: { marginBottom: Spacing.five, gap: Spacing.two },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.medium,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.three,
  },
  toggleTextBlock: { flex: 1 },
  previewButton: { marginBottom: Spacing.five },
  logoutButton: { marginTop: Spacing.two },
});

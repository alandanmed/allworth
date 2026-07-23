import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { firebaseAuth } from '@/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

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
      </View>

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
  logoutButton: { marginTop: Spacing.two },
});

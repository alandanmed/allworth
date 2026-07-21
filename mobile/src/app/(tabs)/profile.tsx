import { signOut } from 'firebase/auth';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { firebaseAuth } from '@/firebase/config';
import { useAuth } from '@/hooks/use-auth';

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

      <AppButton label="Log Out" variant="destructive" onPress={() => signOut(firebaseAuth)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.four,
  },
  emailBlock: {
    marginBottom: Spacing.five,
  },
});

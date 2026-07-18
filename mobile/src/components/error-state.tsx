import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { AppButton } from './app-button';
import { ThemedText } from './themed-text';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = "Something went wrong. Make sure the backend server is running.",
  onRetry,
}: ErrorStateProps) {
  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={`Error: ${message}`}>
      <ThemedText type="smallBold" themeColor="danger">
        Couldn't load data
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {onRetry ? (
        <AppButton label="Try again" onPress={onRetry} variant="outline" style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.three,
  },
});

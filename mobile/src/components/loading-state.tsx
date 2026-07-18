import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container} accessible accessibilityLabel={label}>
      <ActivityIndicator color={theme.primary} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.five,
    alignItems: 'center',
  },
  label: {
    marginTop: Spacing.two,
  },
});

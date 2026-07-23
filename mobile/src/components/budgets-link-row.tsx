import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

export function BudgetsLinkRow() {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/budgets')}
      accessibilityRole="button"
      accessibilityLabel="Manage budgets"
      style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <View>
        <ThemedText type="default">Budgets</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Set monthly limits by category
        </ThemedText>
      </View>
      <ThemedText type="default" themeColor="textSecondary">
        {'\u203A'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
});

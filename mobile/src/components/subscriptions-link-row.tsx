import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/net-worth';
import { ThemedText } from './themed-text';

type SubscriptionsLinkRowProps = {
  count: number;
  totalMonthlyCost: number;
};

export function SubscriptionsLinkRow({ count, totalMonthlyCost }: SubscriptionsLinkRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/subscriptions')}
      accessibilityRole="button"
      accessibilityLabel={`Subscriptions, ${count} detected, ${formatCurrency(totalMonthlyCost)} per month`}
      style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <View>
        <ThemedText type="default">Subscriptions</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {count} detected · {formatCurrency(totalMonthlyCost)}/mo
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

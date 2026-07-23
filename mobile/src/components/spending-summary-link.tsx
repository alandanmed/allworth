import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/net-worth';
import { ThemedText } from './themed-text';

type SpendingSummaryLinkProps = {
  totalSpent: number;
  previousMonthTotalSpent: number;
  percentChange: number | null;
};

const MIN_PREVIOUS_MONTH_FOR_PERCENT = 50;

export function SpendingSummaryLink({
  totalSpent,
  previousMonthTotalSpent,
  percentChange,
}: SpendingSummaryLinkProps) {
  const theme = useTheme();
  const hasComparison = percentChange !== null;
  const dollarDiff = totalSpent - previousMonthTotalSpent;
  const isIncreasing = dollarDiff > 0;
  const showPercent = hasComparison && previousMonthTotalSpent >= MIN_PREVIOUS_MONTH_FOR_PERCENT;

  let trendLabel = 'No prior month to compare';
  if (hasComparison) {
    const diffLabel = `${isIncreasing ? '+' : '-'}${formatCurrency(Math.abs(dollarDiff))}`;
    trendLabel = showPercent
      ? `${diffLabel} (${isIncreasing ? '+' : ''}${percentChange}%) vs last month`
      : `${diffLabel} vs last month`;
  }

  return (
    <Pressable
      onPress={() => router.push('/activity')}
      accessibilityRole="button"
      accessibilityLabel={`Spending this month, ${formatCurrency(totalSpent)}, ${trendLabel}. See details.`}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.left}>
        <ThemedText type="small" themeColor="textSecondary">
          Spending this month
        </ThemedText>
        <ThemedText type="smallBold" style={styles.total}>
          {formatCurrency(totalSpent)}
        </ThemedText>
      </View>
      <View style={styles.rightRow}>
        <ThemedText type="small" themeColor="primary">
          See details
        </ThemedText>
        <ThemedText type="small" themeColor="primary" style={styles.chevron}>
          {'\u203A'}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  total: { marginTop: Spacing.half },
  rightRow: { flexDirection: 'row', alignItems: 'center' },
  chevron: { marginLeft: Spacing.half, fontSize: 16 },
});

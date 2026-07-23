import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/net-worth';
import { ThemedText } from './themed-text';

type InsightCardProps = {
  totalSpent: number;
  percentChange: number | null;
  byCategory: { category: string; total: number }[];
  maxCategories?: number;
};

export function InsightCard({ totalSpent, percentChange, byCategory, maxCategories = 3 }: InsightCardProps) {
  const theme = useTheme();
  const topCategories = byCategory.slice(0, maxCategories);
  const hasComparison = percentChange !== null;
  const isIncreasing = hasComparison && percentChange > 0;

  const trendLabel = hasComparison
    ? `${isIncreasing ? '+' : ''}${percentChange}% vs last month`
    : 'No prior month to compare';

  const trendColor = hasComparison ? (isIncreasing ? 'danger' : 'success') : 'textSecondary';

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="small" themeColor="textSecondary">
        Spending this month
      </ThemedText>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle" style={styles.total}>
          {formatCurrency(totalSpent)}
        </ThemedText>
        <ThemedText type="small" themeColor={trendColor}>
          {trendLabel}
        </ThemedText>
      </View>

      {topCategories.length > 0 ? (
        <View style={styles.categoryList}>
          {topCategories.map((item) => (
            <View key={item.category} style={styles.categoryRow}>
              <ThemedText type="small">{item.category}</ThemedText>
              <ThemedText type="smallBold">{formatCurrency(item.total)}</ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
          No spending recorded yet this month.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.medium, padding: Spacing.three },
  headerRow: { marginTop: Spacing.one, marginBottom: Spacing.three },
  total: { marginBottom: Spacing.half },
  categoryList: { gap: Spacing.two },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emptyText: { marginTop: Spacing.one },
});

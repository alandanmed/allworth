import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/net-worth';
import { ThemedText } from './themed-text';

type BudgetCardProps = {
  categoryName: string;
  monthlyLimit: number;
  spentThisMonth: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  onPress: () => void;
};

export function BudgetCard({
  categoryName,
  monthlyLimit,
  spentThisMonth,
  remaining,
  percentUsed,
  isOverBudget,
  onPress,
}: BudgetCardProps) {
  const theme = useTheme();
  const barColor = isOverBudget ? theme.danger : percentUsed >= 80 ? theme.warning : theme.success;
  const barWidth = Math.min(percentUsed, 100);

  const remainingLabel = isOverBudget
    ? `${formatCurrency(Math.abs(remaining))} over budget`
    : `${formatCurrency(remaining)} remaining`;

  const a11yLabel = `${categoryName}, ${formatCurrency(spentThisMonth)} of ${formatCurrency(
    monthlyLimit
  )} spent, ${remainingLabel}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.headerRow}>
        <ThemedText type="default">{categoryName}</ThemedText>
        <ThemedText type="smallBold">{formatCurrency(monthlyLimit)}</ThemedText>
      </View>

      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View style={[styles.fill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
      </View>

      <View style={styles.footerRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {formatCurrency(spentThisMonth)} spent
        </ThemedText>
        <ThemedText type="small" themeColor={isOverBudget ? 'danger' : 'textSecondary'}>
          {remainingLabel}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.medium,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  track: {
    height: 8,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});

import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/utils/net-worth';

export default function DailySummaryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useDailySummary(date ?? '');

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading your summary..." />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={refetch} />
      </ScreenContainer>
    );
  }

  const hasComparison = data.percentVsAverage !== null;
  const isAboveAverage = hasComparison && data.percentVsAverage! > 0;

  return (
    <ScreenContainer scroll>
      <ThemedText type="small" themeColor="textSecondary">
        {new Date(data.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </ThemedText>
      <ThemedText type="title" style={styles.total}>
        {formatCurrency(data.totalSpent)}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Spent today
      </ThemedText>

      {data.totalIncome > 0 ? (
        <ThemedText type="default" themeColor="success" style={styles.income}>
          +{formatCurrency(data.totalIncome)} received today
        </ThemedText>
      ) : null}

      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold">Compared to your average</ThemedText>
        {hasComparison ? (
          <ThemedText
            type="default"
            themeColor={isAboveAverage ? 'warning' : 'success'}
            style={styles.compareText}>
            {isAboveAverage ? '+' : ''}
            {data.percentVsAverage}% vs your {formatCurrency(data.dailyAverage)}/day average
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.compareText}>
            Not enough history yet to compare.
          </ThemedText>
        )}
      </View>

      {data.byCategory.length > 0 ? (
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            By category
          </ThemedText>
          {data.byCategory.map((c) => (
            <View key={c.category} style={styles.categoryRow}>
              <ThemedText type="small">{c.category}</ThemedText>
              <ThemedText type="smallBold">{formatCurrency(c.total)}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {data.unusualTransactions.length > 0 ? (
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" themeColor="warning" style={styles.cardTitle}>
            Unusual spending
          </ThemedText>
          {data.unusualTransactions.map((t, i) => (
            <View key={i} style={styles.categoryRow}>
              <ThemedText type="small">{t.merchant}</ThemedText>
              <ThemedText type="smallBold">{formatCurrency(t.amount)}</ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {data.budgetWarnings.length > 0 ? (
        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" themeColor="danger" style={styles.cardTitle}>
            Budget warnings
          </ThemedText>
          {data.budgetWarnings.map((b) => (
            <View key={b.category} style={styles.categoryRow}>
              <ThemedText type="small">{b.category}</ThemedText>
              <ThemedText type="smallBold" themeColor={b.isOverBudget ? 'danger' : 'warning'}>
                {b.percentUsed}% used
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {data.byCategory.length === 0 && data.totalSpent === 0 ? (
        <EmptyState title="No spending today" message="Nothing recorded for this date yet." />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  total: { marginTop: Spacing.two },
  subtitle: { marginBottom: Spacing.one },
  income: { marginBottom: Spacing.three },
  card: {
    borderRadius: Radius.medium,
    padding: Spacing.three,
    marginTop: Spacing.three,
  },
  cardTitle: { marginBottom: Spacing.two },
  compareText: { marginTop: Spacing.one },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
});

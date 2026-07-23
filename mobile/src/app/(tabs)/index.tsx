import { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { NetWorthChart } from '@/components/net-worth-chart';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/transaction-row';
import { Radius, Spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useNetWorthHistory, useRecordTodaysSnapshot } from '@/hooks/use-net-worth';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';
import { detectDuplicateTransactionIds } from '@/utils/duplicates';
import { detectRecurringTransactionIds } from '@/utils/recurring';
import {
  calculateNetWorth,
  calculateTotalAssets,
  calculateTotalLiabilities,
  formatCurrency,
} from '@/utils/net-worth';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const theme = useTheme();
  const accountsQuery = useAccounts();
  const transactionsQuery = useTransactions();
  const netWorthHistoryQuery = useNetWorthHistory();
  const recordSnapshot = useRecordTodaysSnapshot();

  useEffect(() => {
    recordSnapshot.mutate();
    // Only on mount — recording today's snapshot once per app open is enough;
    // it's a no-op on the backend anyway if called again the same day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (accountsQuery.isLoading || transactionsQuery.isLoading || netWorthHistoryQuery.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading your dashboard..." />
      </ScreenContainer>
    );
  }

  if (accountsQuery.isError || transactionsQuery.isError || netWorthHistoryQuery.isError) {
    return (
      <ScreenContainer>
        <ErrorState
          onRetry={() => {
            accountsQuery.refetch();
            transactionsQuery.refetch();
            netWorthHistoryQuery.refetch();
          }}
        />
      </ScreenContainer>
    );
  }

  const accounts = accountsQuery.data?.accounts ?? [];
  const transactions = transactionsQuery.data ?? [];
  const netWorthHistory = netWorthHistoryQuery.data ?? [];

  const netWorth = calculateNetWorth(accounts);
  const totalAssets = calculateTotalAssets(accounts);
  const totalLiabilities = calculateTotalLiabilities(accounts);
  const recurringIds = detectRecurringTransactionIds(transactions);
  const duplicateIds = detectDuplicateTransactionIds(transactions);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <ScreenContainer scroll>
      <ThemedText type="small" themeColor="textSecondary">
        {getGreeting()}, Alan
      </ThemedText>
      <ThemedText type="title" style={styles.netWorthValue}>
        {formatCurrency(netWorth)}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.netWorthLabel}>
        Net worth
      </ThemedText>

      {netWorthHistory.length >= 2 ? (
        <View style={styles.chartWrapper}>
          <NetWorthChart history={netWorthHistory} />
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Total assets
          </ThemedText>
          <ThemedText
            type="smallBold"
            themeColor="success"
            style={styles.statValue}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatCurrency(totalAssets)}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Total liabilities
          </ThemedText>
          <ThemedText
            type="smallBold"
            themeColor="danger"
            style={styles.statValue}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatCurrency(totalLiabilities)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Recent transactions
      </ThemedText>
      <FlatList
        data={recentTransactions}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TransactionRow
            transaction={item}
            showBorder={index !== recentTransactions.length - 1}
            isRecurring={recurringIds.has(item.id)}
            isDuplicate={duplicateIds.has(item.id)}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  netWorthValue: { marginTop: Spacing.two },
  netWorthLabel: { marginBottom: Spacing.three },
  chartWrapper: { marginBottom: Spacing.four },
  statsRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.four },
  statCard: { flex: 1, borderRadius: Radius.medium, padding: Spacing.three },
  statValue: { marginTop: Spacing.one, fontSize: 20, lineHeight: 24 },
  sectionTitle: { marginBottom: Spacing.two },
});

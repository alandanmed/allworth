import { FlatList, StyleSheet, View } from 'react-native';

import { NetWorthChart } from '@/components/net-worth-chart';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/transaction-row';
import { mockAccounts } from '@/data/mock-accounts';
import { mockNetWorthHistory } from '@/data/mock-net-worth-history';
import { mockTransactions } from '@/data/mock-transactions';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
  const netWorth = calculateNetWorth(mockAccounts);
  const totalAssets = calculateTotalAssets(mockAccounts);
  const totalLiabilities = calculateTotalLiabilities(mockAccounts);
  const recurringIds = detectRecurringTransactionIds(mockTransactions);
  const duplicateIds = detectDuplicateTransactionIds(mockTransactions);
  const recentTransactions = [...mockTransactions]
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

      <View style={styles.chartWrapper}>
        <NetWorthChart history={mockNetWorthHistory} />
      </View>

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
  netWorthValue: {
    marginTop: Spacing.two,
  },
  netWorthLabel: {
    marginBottom: Spacing.three,
  },
  chartWrapper: {
    marginBottom: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  statValue: {
    marginTop: Spacing.one,
    fontSize: 20,
    lineHeight: 24,
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
});

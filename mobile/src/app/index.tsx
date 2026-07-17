import { FlatList, StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { mockAccounts } from '@/data/mock-accounts';
import { mockTransactions } from '@/data/mock-transactions';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Total assets
          </ThemedText>
          <ThemedText type="subtitle" themeColor="success" style={styles.statValue}>
            {formatCurrency(totalAssets)}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Total liabilities
          </ThemedText>
          <ThemedText type="subtitle" themeColor="danger" style={styles.statValue}>
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
        renderItem={({ item }) => (
          <View style={[styles.transactionRow, { borderBottomColor: theme.border }]}>
            <View>
              <ThemedText type="default">{item.merchant}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.category} · {item.date}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" themeColor={item.amount < 0 ? 'success' : 'text'}>
              {item.amount < 0 ? '+' : '-'}
              {formatCurrency(Math.abs(item.amount))}
            </ThemedText>
          </View>
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
  },
  sectionTitle: {
    marginBottom: Spacing.two,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

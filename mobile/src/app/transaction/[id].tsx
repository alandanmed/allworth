import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppTextInput } from '@/components/app-text-input';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { mockAccounts } from '@/data/mock-accounts';
import { mockTransactions } from '@/data/mock-transactions';
import { Spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/net-worth';

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow} accessible accessibilityLabel={`${label}, ${value}`}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transaction = mockTransactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <ScreenContainer>
        <ThemedText type="default">Transaction not found.</ThemedText>
      </ScreenContainer>
    );
  }

  const account = mockAccounts.find((a) => a.id === transaction.accountId);
  const isIncome = transaction.amount < 0;

  return (
    <ScreenContainer scroll>
      <View style={styles.amountBlock}>
        <ThemedText type="title" themeColor={isIncome ? 'success' : 'text'}>
          {isIncome ? '+' : '-'}
          {formatCurrency(Math.abs(transaction.amount))}
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {transaction.merchant}
        </ThemedText>
      </View>

      <View style={styles.detailsCard}>
        <DetailRow label="Category" value={transaction.category} />
        <DetailRow label="Account" value={account?.name ?? 'Unknown'} />
        <DetailRow label="Date" value={formatDate(transaction.date)} />
        <DetailRow
          label="Status"
          value={transaction.status === 'pending' ? 'Pending' : 'Completed'}
        />
      </View>

      <ThemedText type="smallBold" style={styles.notesLabel}>
        Notes
      </ThemedText>
      <AppTextInput
        placeholder="Add a note..."
        defaultValue={transaction.notes}
        multiline
        style={styles.notesInput}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  amountBlock: {
    alignItems: 'center',
    marginBottom: Spacing.four,
    marginTop: Spacing.three,
  },
  detailsCard: {
    marginBottom: Spacing.four,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000022',
  },
  notesLabel: {
    marginBottom: Spacing.one,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

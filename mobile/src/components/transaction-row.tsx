import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/utils/net-worth';
import { ThemedText } from './themed-text';

type TransactionRowProps = {
  transaction: Transaction;
  showBorder?: boolean;
  isRecurring?: boolean;
  isDuplicate?: boolean;
};

export function TransactionRow({
  transaction,
  showBorder = true,
  isRecurring = false,
  isDuplicate = false,
}: TransactionRowProps) {
  const isIncome = transaction.amount < 0;

  // Duplicate warning takes priority over recurring tag if somehow both apply —
  // a possible accidental double-charge is more urgent to surface than "this is a subscription."
  const tagText = isDuplicate ? 'Possible duplicate' : isRecurring ? 'Recurring' : '';

  const label = `${transaction.merchant}, ${transaction.category}, ${
    tagText ? tagText + ', ' : ''
  }${transaction.date}, ${isIncome ? 'received' : 'spent'} ${formatCurrency(Math.abs(transaction.amount))}`;

  return (
    <Pressable
      onPress={() => router.push(`/transaction/${transaction.id}`)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.row, showBorder && styles.divider]}>
      <View style={styles.left}>
        <ThemedText type="default">{transaction.merchant}</ThemedText>
        <ThemedText
          type="small"
          themeColor={isDuplicate ? 'warning' : 'textSecondary'}
          style={isDuplicate ? styles.duplicateText : undefined}>
          {transaction.category}
          {tagText ? ` · ${tagText}` : ''} · {transaction.date}
          {transaction.status === 'pending' ? ' · Pending' : ''}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor={isIncome ? 'success' : 'text'}>
        {isIncome ? '+' : '-'}
        {formatCurrency(Math.abs(transaction.amount))}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000022',
  },
  left: {
    flex: 1,
    marginRight: Spacing.two,
  },
  duplicateText: {
    fontWeight: '600',
  },
});

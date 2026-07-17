import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/utils/net-worth';
import { ThemedText } from './themed-text';

type TransactionRowProps = {
  transaction: Transaction;
  showBorder?: boolean;
};

export function TransactionRow({ transaction, showBorder = true }: TransactionRowProps) {
  const isIncome = transaction.amount < 0;
  const label = `${transaction.merchant}, ${transaction.category}, ${transaction.date}, ${
    isIncome ? 'received' : 'spent'
  } ${formatCurrency(Math.abs(transaction.amount))}`;

  return (
    <View
      style={[styles.row, showBorder && styles.divider]}
      accessible
      accessibilityLabel={label}>
      <View style={styles.left}>
        <ThemedText type="default">{transaction.merchant}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {transaction.category} · {transaction.date}
          {transaction.status === 'pending' ? ' · Pending' : ''}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor={isIncome ? 'success' : 'text'}>
        {isIncome ? '+' : '-'}
        {formatCurrency(Math.abs(transaction.amount))}
      </ThemedText>
    </View>
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
});

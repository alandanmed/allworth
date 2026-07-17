import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { Account } from '@/types/finance';
import { formatCurrency } from '@/utils/net-worth';
import { ThemedText } from './themed-text';

const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  investment: 'Investment',
  loan: 'Loan',
};

type AccountRowProps = {
  account: Account;
  isLast?: boolean;
};

export function AccountRow({ account, isLast = false }: AccountRowProps) {
  const label = `${account.name}, ending in ${account.lastFourDigits}, balance ${formatCurrency(account.balance)}`;

  return (
    <View
      style={[styles.row, !isLast && styles.divider]}
      accessible
      accessibilityLabel={label}>
      <View style={styles.left}>
        <ThemedText type="default">{account.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {ACCOUNT_TYPE_LABELS[account.type]} · •••• {account.lastFourDigits}
        </ThemedText>
      </View>
      <ThemedText type="smallBold">{formatCurrency(account.balance)}</ThemedText>
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

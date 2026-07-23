import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { formatCurrency } from '@/utils/net-worth';
import { Subscription } from '@/utils/subscriptions';
import { ThemedText } from './themed-text';

type SubscriptionRowProps = {
  subscription: Subscription;
  showBorder?: boolean;
};

export function SubscriptionRow({ subscription, showBorder = true }: SubscriptionRowProps) {
  const isIncrease =
    subscription.priceChanged && subscription.latestAmount > (subscription.previousAmount ?? 0);
  const changeText = subscription.priceChanged
    ? isIncrease
      ? 'Price increased'
      : 'Price decreased'
    : '';

  const changeDetail = subscription.priceChanged
    ? `${changeText} from ${formatCurrency(subscription.previousAmount!)} to ${formatCurrency(
        subscription.latestAmount
      )}`
    : '';

  const a11yLabel = `${subscription.merchant}, ${subscription.category}, ${formatCurrency(
    subscription.latestAmount
  )} per month${subscription.priceChanged ? `, ${changeDetail}` : ''}`;

  return (
    <View
      style={[styles.row, showBorder && styles.divider]}
      accessible
      accessibilityLabel={a11yLabel}>
      <View style={styles.left}>
        <ThemedText type="default">{subscription.merchant}</ThemedText>
        <ThemedText
          type="small"
          themeColor={subscription.priceChanged ? (isIncrease ? 'warning' : 'success') : 'textSecondary'}>
          {subscription.category}
          {subscription.priceChanged ? ` · ${changeText}` : ''}
        </ThemedText>
      </View>
      <ThemedText type="smallBold">{formatCurrency(subscription.latestAmount)}</ThemedText>
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
  left: { flex: 1, marginRight: Spacing.two },
});

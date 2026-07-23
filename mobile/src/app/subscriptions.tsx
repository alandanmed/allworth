import { FlatList } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ScreenContainer } from '@/components/screen-container';
import { SubscriptionRow } from '@/components/subscription-row';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTransactions } from '@/hooks/use-transactions';
import { formatCurrency } from '@/utils/net-worth';
import { calculateTotalMonthlySubscriptionCost, detectSubscriptions } from '@/utils/subscriptions';
import { StyleSheet } from 'react-native';

export default function SubscriptionsScreen() {
  const { data: transactions, isLoading, isError, refetch } = useTransactions();

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading subscriptions..." />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={refetch} />
      </ScreenContainer>
    );
  }

  const subscriptions = detectSubscriptions(transactions ?? []);
  const totalMonthlyCost = calculateTotalMonthlySubscriptionCost(subscriptions);

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.header}>
        Subscriptions
      </ThemedText>

      {subscriptions.length === 0 ? (
        <EmptyState
          title="No subscriptions detected"
          message="Recurring charges will show up here once we spot the same merchant billing you more than once."
        />
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary" style={styles.summary}>
            {subscriptions.length} detected · {formatCurrency(totalMonthlyCost)}/mo
          </ThemedText>
          <FlatList
            data={subscriptions}
            scrollEnabled={false}
            keyExtractor={(item) => item.merchant}
            renderItem={({ item, index }) => (
              <SubscriptionRow subscription={item} showBorder={index !== subscriptions.length - 1} />
            )}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.two },
  summary: { marginBottom: Spacing.three },
});

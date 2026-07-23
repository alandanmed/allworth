import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { AppTextInput } from '@/components/app-text-input';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { InsightCard } from '@/components/insight-card';
import { LoadingState } from '@/components/loading-state';
import { ScreenContainer } from '@/components/screen-container';
import { SuggestionChip } from '@/components/suggestion-chip';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/transaction-row';
import { Spacing } from '@/constants/theme';
import { useSpendingSummary } from '@/hooks/use-spending-summary';
import { useTransactions } from '@/hooks/use-transactions';
import { detectDuplicateTransactionIds } from '@/utils/duplicates';
import { detectRecurringTransactionIds } from '@/utils/recurring';

export default function ActivityScreen() {
  const { data: transactions, isLoading, isError, refetch } = useTransactions();
  const spendingSummaryQuery = useSpendingSummary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const recurringIds = useMemo(
    () => detectRecurringTransactionIds(transactions ?? []),
    [transactions]
  );
  const duplicateIds = useMemo(
    () => detectDuplicateTransactionIds(transactions ?? []),
    [transactions]
  );

  const allCategories = useMemo(
    () => Array.from(new Set((transactions ?? []).map((t) => t.category))).sort(),
    [transactions]
  );

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category]
    );
  }

  const filteredTransactions = useMemo(() => {
    return [...(transactions ?? [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((txn) => {
        const matchesSearch = txn.merchant.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategories.length === 0 || selectedCategories.includes(txn.category);
        return matchesSearch && matchesCategory;
      });
  }, [transactions, searchQuery, selectedCategories]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading transactions..." />
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

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.header}>
        Activity
      </ThemedText>

      {spendingSummaryQuery.data ? (
        <View style={styles.insightWrapper}>
          <InsightCard
            totalSpent={spendingSummaryQuery.data.totalSpent}
            percentChange={spendingSummaryQuery.data.percentChange}
            byCategory={spendingSummaryQuery.data.byCategory}
            maxCategories={5}
          />
        </View>
      ) : null}

      <AppTextInput
        placeholder="Search transactions"
        accessibilityLabel="Search transactions"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={styles.chipRowContent}>
        <SuggestionChip
          label="All"
          selected={selectedCategories.length === 0}
          onPress={() => setSelectedCategories([])}
        />
        {allCategories.map((category) => (
          <SuggestionChip
            key={category}
            label={category}
            selected={selectedCategories.includes(category)}
            onPress={() => toggleCategory(category)}
          />
        ))}
      </ScrollView>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          message="Try a different search term or clear your filters."
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TransactionRow
              transaction={item}
              showBorder={index !== filteredTransactions.length - 1}
              isRecurring={recurringIds.has(item.id)}
              isDuplicate={duplicateIds.has(item.id)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.three },
  insightWrapper: { marginBottom: Spacing.four },
  chipRow: { marginBottom: Spacing.four, marginTop: Spacing.one, flexGrow: 0 },
  chipRowContent: { alignItems: 'center', paddingRight: Spacing.three },
});

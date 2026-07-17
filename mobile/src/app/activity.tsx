import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { AppTextInput } from '@/components/app-text-input';
import { EmptyState } from '@/components/empty-state';
import { ScreenContainer } from '@/components/screen-container';
import { SuggestionChip } from '@/components/suggestion-chip';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/transaction-row';
import { mockTransactions } from '@/data/mock-transactions';
import { Spacing } from '@/constants/theme';

export default function ActivityScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const allCategories = useMemo(
    () => Array.from(new Set(mockTransactions.map((t) => t.category))).sort(),
    []
  );

  function toggleCategory(category: string) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category]
    );
  }

  const filteredTransactions = useMemo(() => {
    return [...mockTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((txn) => {
        const matchesSearch = txn.merchant.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategories.length === 0 || selectedCategories.includes(txn.category);
        return matchesSearch && matchesCategory;
      });
  }, [searchQuery, selectedCategories]);

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.header}>
        Activity
      </ThemedText>

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
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.three,
  },
  chipRow: {
    marginBottom: Spacing.four,
    marginTop: Spacing.one,
  },
  chipRowContent: {
    paddingRight: Spacing.three,
  },
});

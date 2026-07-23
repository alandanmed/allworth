import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { BudgetCard } from '@/components/budget-card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ScreenContainer } from '@/components/screen-container';
import { SuggestionChip } from '@/components/suggestion-chip';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useBudgets, useSaveBudget } from '@/hooks/use-budgets';
import { useCategories } from '@/hooks/use-categories';

export default function BudgetsScreen() {
  const budgetsQuery = useBudgets();
  const categoriesQuery = useCategories();
  const saveBudget = useSaveBudget();

  const [mode, setMode] = useState<'list' | 'add' | { editId: string }>('list');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [limitError, setLimitError] = useState<string | null>(null);

  const isLoading = budgetsQuery.isLoading || categoriesQuery.isLoading;
  const isError = budgetsQuery.isError || categoriesQuery.isError;

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading budgets..." />
      </ScreenContainer>
    );
  }

  if (isError) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={() => { budgetsQuery.refetch(); categoriesQuery.refetch(); }} />
      </ScreenContainer>
    );
  }

  const budgets = budgetsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const categoriesWithoutBudget = categories.filter(
    (c) => !budgets.some((b) => b.categoryId === c.id)
  );

  function startAdd() {
    setSelectedCategoryId(null);
    setLimitInput('');
    setLimitError(null);
    setMode('add');
  }

  function startEdit(budgetId: string, currentLimit: number, categoryId: string) {
    setSelectedCategoryId(categoryId);
    setLimitInput(String(currentLimit));
    setLimitError(null);
    setMode({ editId: budgetId });
  }

  function cancelForm() {
    setMode('list');
  }

  function submitForm() {
    if (!selectedCategoryId) {
      setLimitError('Choose a category.');
      return;
    }
    const parsed = Number(limitInput);
    if (!limitInput || isNaN(parsed) || parsed <= 0) {
      setLimitError('Enter a valid amount greater than $0.');
      return;
    }

    saveBudget.mutate(
      { categoryId: selectedCategoryId, monthlyLimit: parsed },
      { onSuccess: () => setMode('list') }
    );
  }

  const isFormOpen = mode !== 'list';
  const isEditing = typeof mode === 'object';

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.header}>
        Budgets
      </ThemedText>

      {isFormOpen ? (
        <View style={styles.form}>
          <ThemedText type="smallBold" style={styles.formLabel}>
            Category
          </ThemedText>
          {isEditing ? (
            <ThemedText type="default" style={styles.lockedCategory}>
              {budgets.find((b) => b.id === (mode as { editId: string }).editId)?.categoryName}
            </ThemedText>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRowContent}>
              {categoriesWithoutBudget.map((c) => (
                <SuggestionChip
                  key={c.id}
                  label={c.name}
                  selected={selectedCategoryId === c.id}
                  onPress={() => setSelectedCategoryId(c.id)}
                />
              ))}
            </ScrollView>
          )}

          <AppTextInput
            label="Monthly limit"
            placeholder="e.g. 400"
            keyboardType="decimal-pad"
            value={limitInput}
            onChangeText={setLimitInput}
            error={limitError ?? undefined}
            style={styles.limitInput}
          />

          <View style={styles.formButtons}>
            <AppButton
              label="Save"
              onPress={submitForm}
              loading={saveBudget.isPending}
              style={styles.saveButton}
            />
            <AppButton label="Cancel" variant="outline" onPress={cancelForm} />
          </View>
        </View>
      ) : (
        <>
          {budgets.length === 0 ? (
            <EmptyState
              title="No budgets yet"
              message="Set a monthly limit for a category to start tracking your spending against it."
            />
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                categoryName={budget.categoryName}
                monthlyLimit={budget.monthlyLimit}
                spentThisMonth={budget.spentThisMonth}
                remaining={budget.remaining}
                percentUsed={budget.percentUsed}
                isOverBudget={budget.isOverBudget}
                onPress={() => startEdit(budget.id, budget.monthlyLimit, budget.categoryId)}
              />
            ))
          )}

          {categoriesWithoutBudget.length > 0 ? (
            <AppButton label="+ Add Budget" variant="outline" onPress={startAdd} style={styles.addButton} />
          ) : null}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
  form: { marginBottom: Spacing.four },
  formLabel: { marginBottom: Spacing.two },
  lockedCategory: { marginBottom: Spacing.three },
  chipRowContent: { paddingBottom: Spacing.three, alignItems: 'center' },
  limitInput: { marginTop: Spacing.one },
  formButtons: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  saveButton: { flex: 1 },
  addButton: { marginTop: Spacing.two },
});

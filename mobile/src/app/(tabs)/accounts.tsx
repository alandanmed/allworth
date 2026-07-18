import { StyleSheet } from 'react-native';

import { ErrorState } from '@/components/error-state';
import { InstitutionCard } from '@/components/institution-card';
import { LoadingState } from '@/components/loading-state';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/use-accounts';

export default function AccountsScreen() {
  const { data, isLoading, isError, refetch } = useAccounts();

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading accounts..." />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={refetch} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.header}>
        Accounts
      </ThemedText>
      {data.institutions.map((institution) => {
        const accountsForInstitution = data.accounts.filter(
          (account) => account.institutionId === institution.id
        );
        if (accountsForInstitution.length === 0) return null;

        return (
          <InstitutionCard
            key={institution.id}
            institution={institution}
            accounts={accountsForInstitution}
          />
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.four },
});

import { ScreenContainer } from '@/components/screen-container';
import { InstitutionCard } from '@/components/institution-card';
import { ThemedText } from '@/components/themed-text';
import { mockAccounts } from '@/data/mock-accounts';
import { mockInstitutions } from '@/data/mock-institutions';
import { Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export default function AccountsScreen() {
  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.header}>
        Accounts
      </ThemedText>
      {mockInstitutions.map((institution) => {
        const accountsForInstitution = mockAccounts.filter(
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
  header: {
    marginBottom: Spacing.four,
  },
});

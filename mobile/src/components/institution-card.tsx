import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { Account, Institution } from '@/types/finance';
import { useTheme } from '@/hooks/use-theme';
import { AccountRow } from './account-row';
import { ThemedText } from './themed-text';

type InstitutionCardProps = {
  institution: Institution;
  accounts: Account[];
};

export function InstitutionCard({ institution, accounts }: InstitutionCardProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        accessibilityRole="header"
        style={styles.institutionName}>
        {institution.name.toUpperCase()}
      </ThemedText>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        {accounts.map((account, index) => (
          <AccountRow key={account.id} account={account} isLast={index === accounts.length - 1} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.four,
  },
  institutionName: {
    marginBottom: Spacing.two,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
  },
});

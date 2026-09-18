import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import {
  useBankConnections,
  useConnectSandboxBank,
  useDisconnectBank,
  useSyncConnection,
} from '@/hooks/use-plaid';
import { useTheme } from '@/hooks/use-theme';

export default function BankConnectionsScreen() {
  const theme = useTheme();
  const connectionsQuery = useBankConnections();
  const connectSandbox = useConnectSandboxBank();
  const syncConnection = useSyncConnection();
  const disconnectBank = useDisconnectBank();

  function handleConnect() {
    connectSandbox.mutate(undefined, {
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Could not connect to the sandbox bank. Please try again.';
        Alert.alert('Connection failed', message);
      },
    });
  }

  function handleDisconnect(id: string, name: string) {
    Alert.alert(
      'Disconnect bank?',
      `${name}'s accounts will stop syncing, but existing transaction history is kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: () => disconnectBank.mutate(id) },
      ]
    );
  }

  if (connectionsQuery.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading connections..." />
      </ScreenContainer>
    );
  }

  if (connectionsQuery.isError) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={connectionsQuery.refetch} />
      </ScreenContainer>
    );
  }

  const connections = connectionsQuery.data ?? [];

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.header}>
        Bank Connections
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
        Demo mode uses simulated financial data via Plaid Sandbox. No real banking information is stored.
      </ThemedText>

      {connections.length === 0 ? (
        <EmptyState
          title="No banks connected"
          message="Connect a simulated sandbox bank to see how account syncing works."
        />
      ) : (
        <FlatList
          data={connections}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.connectionCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.connectionHeader}>
                <ThemedText type="default">{item.institution_name}</ThemedText>
                <ThemedText
                  type="small"
                  themeColor={item.status === 'active' ? 'success' : 'textSecondary'}>
                  {item.status === 'active' ? 'Connected' : 'Disconnected'}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.accountCount}>
                {item.accounts_synced} account{item.accounts_synced !== 1 ? 's' : ''} synced
              </ThemedText>

              {item.status === 'active' ? (
                <View style={styles.actionRow}>
                  <AppButton
                    label="Sync now"
                    variant="outline"
                    onPress={() => syncConnection.mutate(item.id)}
                    loading={syncConnection.isPending}
                    style={styles.actionButton}
                  />
                  <AppButton
                    label="Disconnect"
                    variant="destructive"
                    onPress={() => handleDisconnect(item.id, item.institution_name)}
                    style={styles.actionButton}
                  />
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      <AppButton
        label="+ Connect Sandbox Bank"
        onPress={handleConnect}
        loading={connectSandbox.isPending}
        style={styles.connectButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.one },
  disclaimer: { marginBottom: Spacing.four },
  connectionCard: {
    borderRadius: Radius.medium,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountCount: { marginTop: Spacing.half },
  actionRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  actionButton: { flex: 1 },
  connectButton: { marginTop: Spacing.three },
});

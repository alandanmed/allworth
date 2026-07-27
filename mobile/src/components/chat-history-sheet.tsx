import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { ChatConversationSummary } from '@/hooks/use-chat';
import { useTheme } from '@/hooks/use-theme';
import { formatRelativeTime } from '@/utils/format-relative-time';
import { AppButton } from './app-button';
import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';
import { ThemedText } from './themed-text';

type ChatHistorySheetProps = {
  visible: boolean;
  conversations: ChatConversationSummary[];
  isLoading: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onStartNewChat: () => void;
  onDeleteConversation: (id: string) => void;
};

export function ChatHistorySheet({
  visible,
  conversations,
  isLoading,
  onClose,
  onSelectConversation,
  onStartNewChat,
  onDeleteConversation,
}: ChatHistorySheetProps) {
  const theme = useTheme();

  function confirmDelete(id: string, preview: string) {
    Alert.alert('Delete chat?', `"${preview}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteConversation(id) },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Chats</ThemedText>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
            <ThemedText type="default" themeColor="primary">
              Done
            </ThemedText>
          </Pressable>
        </View>

        <AppButton label="+ New Chat" variant="outline" onPress={onStartNewChat} style={styles.newChatButton} />

        {isLoading ? (
          <LoadingState label="Loading chats..." />
        ) : conversations.length === 0 ? (
          <EmptyState title="No past chats" message="Start a conversation to see it here." />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => onSelectConversation(item.id)}
                onLongPress={() => confirmDelete(item.id, item.preview)}
                accessibilityRole="button"
                accessibilityLabel={`${item.preview}, ${formatRelativeTime(item.createdAt)}. Long press to delete.`}
                style={[
                  styles.row,
                  { backgroundColor: theme.backgroundElement },
                  index > 0 && styles.rowSpacing,
                ]}>
                <View style={styles.rowText}>
                  <ThemedText type="default" numberOfLines={1}>
                    {item.preview}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatRelativeTime(item.createdAt)}
                  </ThemedText>
                </View>
                <Pressable
                  onPress={() => confirmDelete(item.id, item.preview)}
                  accessibilityRole="button"
                  accessibilityLabel="Delete this chat"
                  hitSlop={10}>
                  <ThemedText type="default" themeColor="danger">
                    {'\u2715'}
                  </ThemedText>
                </Pressable>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    height: '70%',
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  newChatButton: { marginBottom: Spacing.three },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  rowText: { flex: 1, marginRight: Spacing.two, gap: Spacing.half },
  rowSpacing: { marginTop: Spacing.two },
});

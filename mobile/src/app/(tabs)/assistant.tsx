import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/chat-bubble';
import { ChatHistorySheet } from '@/components/chat-history-sheet';
import { ScreenContainer } from '@/components/screen-container';
import { SuggestionChip } from '@/components/suggestion-chip';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  ChatMessage,
  useConversationMessages,
  useConversations,
  useDeleteConversation,
  useSendChatMessage,
} from '@/hooks/use-chat';

const SUGGESTED_PROMPTS = [
  "What's my net worth?",
  'Show my subscriptions',
  'How much did I spend this month?',
  'What are my biggest purchases?',
];

const TAB_BAR_HEIGHT = Platform.select({ ios: 10, android: 17 }) ?? 10;
const CONTROL_HEIGHT = 40;

function TypingIndicator() {
  const theme = useTheme();
  return (
    <View
      style={[styles.typingBubble, { backgroundColor: theme.backgroundElement }]}
      accessible
      accessibilityLabel="Assistant is thinking">
      <ThemedText type="default" themeColor="textSecondary">
        Thinking...
      </ThemedText>
    </View>
  );
}

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const sendMessage = useSendChatMessage();
  const conversationsQuery = useConversations();
  const conversationMessagesQuery = useConversationMessages(conversationId);
  const deleteConversation = useDeleteConversation();
  const listRef = useRef<FlatList>(null);

  function startNewChat() {
    setConversationId(null);
    setMessages([]);
    setInputText('');
    setHistoryVisible(false);
  }

  function openHistory() {
    setHistoryVisible(true);
    conversationsQuery.refetch();
  }

  async function selectConversation(id: string) {
    setConversationId(id);
    setHistoryVisible(false);
    const result = await conversationMessagesQuery.refetch();
    if (result.data) {
      setMessages(result.data);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }

  function handleDeleteConversation(id: string) {
    deleteConversation.mutate(id, {
      onSuccess: () => {
        if (id === conversationId) startNewChat();
        conversationsQuery.refetch();
      },
    });
  }

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sendMessage.isPending) return;

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((current) => [...current, userMessage]);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

    sendMessage.mutate(
      { conversationId, message: trimmed },
      {
        onSuccess: (response) => {
          setConversationId(response.conversation_id);
          setMessages((current) => [
            ...current,
            {
              id: response.message.id,
              role: 'assistant',
              content: response.message.content,
            },
          ]);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        },
        onError: () => {
          setMessages((current) => [
            ...current,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: "Sorry, I couldn't reach the server. Make sure it's running and try again.",
            },
          ]);
        },
      }
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={TAB_BAR_HEIGHT + insets.bottom}>
      <View style={[styles.flex, { backgroundColor: theme.background }]}>
        <ScreenContainer style={styles.screenPadding}>
          <View style={styles.headerRow}>
            <ThemedText type="title">Assistant</ThemedText>
            <View style={styles.headerActions}>
              <Pressable
                onPress={openHistory}
                accessibilityRole="button"
                accessibilityLabel="View chat history">
                <ThemedText type="small" themeColor="primary">
                  History
                </ThemedText>
              </Pressable>
              {messages.length > 0 ? (
                <Pressable
                  onPress={startNewChat}
                  accessibilityRole="button"
                  accessibilityLabel="Start a new chat">
                  <ThemedText type="small" themeColor="primary">
                    New Chat
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.middle}>
            {messages.length === 0 ? (
              <View>
                <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
                  Ask me about your money — net worth, spending, subscriptions, and more.
                </ThemedText>
                <View style={styles.promptGrid}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <SuggestionChip
                      key={prompt}
                      label={prompt}
                      selected={false}
                      onPress={() => submit(prompt)}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <FlatList
                ref={listRef}
                style={styles.flex}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
                ListFooterComponent={sendMessage.isPending ? <TypingIndicator /> : null}
                contentContainerStyle={styles.messageList}
                accessibilityLiveRegion="polite"
              />
            )}
          </View>
        </ScreenContainer>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Ask a question..."
              placeholderTextColor={theme.textSecondary}
              accessibilityLabel="Message input"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => submit(inputText)}
              returnKeyType="send"
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                },
              ]}
            />
            <Pressable
              onPress={() => submit(inputText)}
              disabled={sendMessage.isPending}
              accessibilityRole="button"
              accessibilityLabel="Send"
              style={[styles.sendButton, { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" style={styles.sendButtonText}>
                {sendMessage.isPending ? '...' : 'Send'}
              </ThemedText>
            </Pressable>
          </View>
          <View style={{ height: TAB_BAR_HEIGHT + insets.bottom }} />
        </View>
      </View>

      <ChatHistorySheet
        visible={historyVisible}
        conversations={conversationsQuery.data ?? []}
        isLoading={conversationsQuery.isFetching}
        onClose={() => setHistoryVisible(false)}
        onSelectConversation={selectConversation}
        onStartNewChat={startNewChat}
        onDeleteConversation={handleDeleteConversation}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screenPadding: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  headerActions: { flexDirection: 'row', gap: Spacing.three },
  middle: { flex: 1 },
  emptyText: { marginBottom: Spacing.three },
  promptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  messageList: { flexGrow: 1, paddingBottom: Spacing.two },
  inputSection: {
    paddingHorizontal: Spacing.two,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  textInput: {
    flex: 1,
    height: CONTROL_HEIGHT,
    borderRadius: CONTROL_HEIGHT / 2,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  sendButton: {
    height: CONTROL_HEIGHT,
    paddingHorizontal: Spacing.three,
    borderRadius: CONTROL_HEIGHT / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
  },
  typingBubble: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
  },
});
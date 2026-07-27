import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

type ChatBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const theme = useTheme();
  const isUser = role === 'user';

  return (
    <View
      style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}
      accessible
      accessibilityLabel={`${isUser ? 'You said' : 'Assistant said'}: ${content}`}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.primary }]
            : [styles.assistantBubble, { backgroundColor: theme.backgroundElement }],
        ]}>
        <ThemedText type="default" style={isUser ? styles.userText : undefined}>
          {content}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: Spacing.two,
    flexDirection: 'row',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  userBubble: {
    borderBottomRightRadius: Radius.small,
  },
  assistantBubble: {
    borderBottomLeftRadius: Radius.small,
  },
  userText: {
    color: '#ffffff',
  },
});

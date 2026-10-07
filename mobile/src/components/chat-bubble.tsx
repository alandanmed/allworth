import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

type ChatBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * The assistant replies with light markdown (**bold** and "- " bullets).
 * React Native's <Text> doesn't render markdown, so handle just those two
 * patterns here instead of pulling in a markdown dependency.
 */
function renderAssistantText(content: string) {
  return content.split('\n').map((rawLine, lineIndex, lines) => {
    const line = rawLine.replace(/^\s*[-*]\s+/, '\u2022 ');
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((part) => part.length > 0);
    return (
      <Text key={lineIndex}>
        {parts.map((part, partIndex) =>
          part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
            <Text key={partIndex} style={styles.bold}>
              {part.slice(2, -2)}
            </Text>
          ) : (
            part
          )
        )}
        {lineIndex < lines.length - 1 ? '\n' : ''}
      </Text>
    );
  });
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const theme = useTheme();
  const isUser = role === 'user';

  return (
    <View
      style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}
      accessible
      accessibilityLabel={`${isUser ? 'You said' : 'Assistant said'}: ${content.replace(/\*\*/g, '')}`}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.primary }]
            : [styles.assistantBubble, { backgroundColor: theme.backgroundElement }],
        ]}>
        <ThemedText type="default" style={isUser ? styles.userText : undefined}>
          {isUser ? content : renderAssistantText(content)}
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
  bold: {
    fontWeight: '700',
  },
});

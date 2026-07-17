import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

type AppTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function AppTextInput({ label, error, helperText, style, ...rest }: AppTextInputProps) {
  const theme = useTheme();
  const borderColor = error ? theme.danger : theme.border;

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={label}
        accessibilityHint={error}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <ThemedText type="small" themeColor="danger" style={styles.helper}>
          {error}
        </ThemedText>
      ) : helperText ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.helper}>
          {helperText}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  label: {
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  helper: {
    marginTop: Spacing.one,
  },
});

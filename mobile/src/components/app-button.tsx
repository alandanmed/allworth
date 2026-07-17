import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';
type AppButtonSize = 'small' | 'medium' | 'large';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = {
    primary: theme.primary,
    secondary: theme.backgroundElement,
    outline: 'transparent',
    destructive: theme.danger,
  }[variant];

  const textColor = {
    primary: '#ffffff',
    secondary: theme.text,
    outline: theme.primary,
    destructive: '#ffffff',
  }[variant];

  const borderColor = variant === 'outline' ? theme.primary : 'transparent';

  const paddingVertical = { small: Spacing.one, medium: Spacing.two, large: Spacing.three }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isDisabled ? theme.disabled : backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText type="smallBold" style={{ color: isDisabled ? theme.textSecondary : textColor }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});

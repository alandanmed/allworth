import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { firebaseAuth } from '@/firebase/config';
import { useAuth } from '@/hooks/use-auth';

const authSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormValues = z.infer<typeof authSchema>;

function friendlyErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function AuthScreen() {
  const { user, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;

  async function onSubmit(values: AuthFormValues) {
    setFirebaseError(null);
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password);
      } else {
        await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);
      }
    } catch (error: any) {
      setFirebaseError(friendlyErrorMessage(error.code ?? ''));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <ThemedText type="title">AllWorth</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Your money, one place
        </ThemedText>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppTextInput
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <AppTextInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      {firebaseError ? (
        <ThemedText
          type="small"
          themeColor="danger"
          style={styles.firebaseError}
          accessibilityLiveRegion="polite">
          {firebaseError}
        </ThemedText>
      ) : null}

      <AppButton
        label={isSignUp ? 'Sign Up' : 'Log In'}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.submitButton}
      />

      <Pressable
        onPress={() => {
          setIsSignUp(!isSignUp);
          setFirebaseError(null);
        }}
        accessibilityRole="link"
        style={styles.toggleRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <ThemedText type="smallBold" themeColor="primary">
            {isSignUp ? 'Log in' : 'Sign up'}
          </ThemedText>
        </ThemedText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: Spacing.six, marginBottom: Spacing.six },
  firebaseError: { marginBottom: Spacing.three },
  submitButton: { marginTop: Spacing.two },
  toggleRow: { marginTop: Spacing.four, alignItems: 'center' },
});

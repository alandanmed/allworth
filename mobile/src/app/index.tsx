import { useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppTextInput } from '@/components/app-text-input';
import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const [email, setEmail] = useState('');

  return (
    <ScreenContainer>
      <ThemedText type="title">Home</ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={{ marginBottom: 24 }}>
        Design system test — remove once confirmed
      </ThemedText>

      <AppTextInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        helperText="We'll never share this."
      />

      <AppButton label="Primary" onPress={() => Alert.alert('Primary pressed')} style={{ marginBottom: 12 }} />
      <AppButton
        label="Secondary"
        variant="secondary"
        onPress={() => Alert.alert('Secondary pressed')}
        style={{ marginBottom: 12 }}
      />
      <AppButton
        label="Outline"
        variant="outline"
        onPress={() => Alert.alert('Outline pressed')}
        style={{ marginBottom: 12 }}
      />
      <AppButton label="Destructive" variant="destructive" onPress={() => Alert.alert('Destructive pressed')} />
    </ScreenContainer>
  );
}

import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { isNetworkError } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      // Network failures must not be presented as wrong credentials.
      if (isNetworkError(error)) {
        Alert.alert(t.errors.offlineTitle, t.errors.networkAlert);
      } else {
        Alert.alert(t.auth.signIn, t.auth.invalidCredentials);
      }
    }
    // Success: onAuthStateChange updates the session, the (auth) layout redirects.
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center gap-6 px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text className="font-sans-semibold text-xs uppercase tracking-[3px] text-primary">{t.auth.tagline}</Text>
          <Text className="font-display text-4xl leading-[44px] text-ink">{t.app.name}</Text>
          <Text className="text-text-muted">{t.auth.signIn}</Text>
        </View>
        <View className="gap-4">
          <FormField
            label={t.auth.email}
            placeholder={t.auth.emailPlaceholder}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormField
            label={t.auth.password}
            placeholder={t.auth.passwordPlaceholder}
            autoComplete="current-password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            label={t.auth.signIn}
            onPress={handleSignIn}
            loading={submitting}
            disabled={email.length === 0 || password.length === 0}
          />
        </View>
        <View className="items-center gap-3">
          <Link href="/(auth)/reset-password" className="text-primary">
            {t.auth.forgotPassword}
          </Link>
          <View className="flex-row gap-1.5">
            <Text className="text-text-muted">{t.auth.noAccount}</Text>
            <Link href="/(auth)/sign-up" className="font-semibold text-primary">
              {t.auth.signUp}
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

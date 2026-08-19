import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { isNetworkError } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSignUp() {
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) {
      if (isNetworkError(error)) {
        Alert.alert(t.errors.offlineTitle, t.errors.networkAlert);
      } else {
        Alert.alert(t.auth.signUp, t.auth.signUpFailed);
      }
      return;
    }
    // With email confirmation enabled there is no session yet.
    if (data.session === null) {
      setConfirmationSent(true);
    }
    // Otherwise onAuthStateChange redirects via the (auth) layout.
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
          <Text className="font-script text-2xl leading-7 text-primary">{t.auth.tagline}</Text>
          <Text className="font-display text-4xl leading-[44px] text-ink">{t.app.name}</Text>
          <Text className="text-text-muted">{t.auth.signUp}</Text>
        </View>
        {confirmationSent ? (
          <Text className="rounded-xl border border-border bg-surface p-4 text-text">
            {t.auth.confirmEmailSent}
          </Text>
        ) : (
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
              autoComplete="new-password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Button
              label={t.auth.signUp}
              onPress={handleSignUp}
              loading={submitting}
              disabled={email.length === 0 || password.length === 0}
            />
          </View>
        )}
        <View className="flex-row justify-center gap-1.5">
          <Text className="text-text-muted">{t.auth.haveAccount}</Text>
          <Link href="/(auth)/sign-in" className="font-semibold text-primary">
            {t.auth.signIn}
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

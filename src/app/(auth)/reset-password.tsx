import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { isNetworkError } from '@/lib/errors';
import { t } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setSubmitting(false);
    if (error) {
      if (isNetworkError(error)) {
        Alert.alert(t.errors.offlineTitle, t.errors.networkAlert);
      } else {
        Alert.alert(t.auth.resetPassword, t.errors.genericAlert);
      }
      return;
    }
    setSent(true);
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
          <Text className="text-3xl font-bold text-text">{t.auth.resetPassword}</Text>
        </View>
        {sent ? (
          <Text className="rounded-xl border border-border bg-surface p-4 text-text">
            {t.auth.resetLinkSent}
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
            <Button
              label={t.auth.sendResetLink}
              onPress={handleReset}
              loading={submitting}
              disabled={email.length === 0}
            />
          </View>
        )}
        <View className="items-center">
          <Link href="/(auth)/sign-in" className="text-primary">
            {t.common.back}
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

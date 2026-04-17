import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { TextInput } from '../../src/components/TextInput';
import { Colors, Spacing, Radius } from '../../src/components/theme';

export default function SignIn() {
  const signIn = useAuthStore(s => s.signIn);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      await signIn(email.trim(), password);
      router.replace('/(app)');
    } catch (e: any) {
      setError(e.message ?? 'Sign in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (error) throw error;
      // Create profile on first sign-in
      if (data.user) {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('id', data.user.id);
        if (!count) {
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email ?? '',
            display_name: [credential.fullName?.givenName, credential.fullName?.familyName]
              .filter(Boolean).join(' ') || 'Golfer',
          });
        }
      }
      router.replace('/(app)');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign In failed', e.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo / wordmark */}
          <View style={styles.header}>
            <Text style={styles.logo}>Call It</Text>
            <Text style={styles.tagline}>Your golf game, hands-free.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              style={{ marginTop: Spacing.md }}
            />

            <Button
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              fullWidth
              style={{ marginTop: Spacing.lg }}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Apple Sign-In */}
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={Radius.md}
                style={{ width: '100%', height: 50 }}
                onPress={handleAppleSignIn}
              />
            )}
          </View>

          {/* Sign up link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.blueDeep },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },

  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: {
    fontSize: 52, fontWeight: '900', color: Colors.white,
    letterSpacing: -1,
  },
  tagline: { fontSize: 16, color: Colors.grey, marginTop: 4 },

  form: { gap: 0 },
  errorBanner: {
    backgroundColor: 'rgba(232,64,64,0.15)',
    borderRadius: Radius.sm,
    color: Colors.red,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    fontSize: 13,
    borderWidth: 1, borderColor: Colors.red,
  },

  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.greyMid },
  dividerText: { color: Colors.grey, fontSize: 13 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { color: Colors.grey, fontSize: 14 },
  footerLink: { color: Colors.blue, fontSize: 14, fontWeight: '700' },
});

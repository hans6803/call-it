import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { TextInput } from '../../src/components/TextInput';
import { Colors, Spacing, Radius } from '../../src/components/theme';

export default function SignUp() {
  const signUp = useAuthStore(s => s.signUp);

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())              e.name     = 'Name is required.';
    if (!email.includes('@'))      e.email    = 'Enter a valid email.';
    if (password.length < 8)       e.password = 'Password must be 8+ characters.';
    if (password !== confirm)      e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace('/(app)');
    } catch (e: any) {
      setErrors({ general: e.message ?? 'Sign up failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.sub}>Join Call It and start tracking your game.</Text>
          </View>

          <View style={styles.form}>
            {errors.general && <Text style={styles.errorBanner}>{errors.general}</Text>}

            <TextInput
              label="Display Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              error={errors.name}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
              style={{ marginTop: Spacing.md }}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="8+ characters"
              secureTextEntry
              error={errors.password}
              style={{ marginTop: Spacing.md }}
            />
            <TextInput
              label="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat password"
              secureTextEntry
              error={errors.confirm}
              style={{ marginTop: Spacing.md }}
            />

            <Button
              label="Create Account"
              onPress={handleSignUp}
              loading={loading}
              fullWidth
              style={{ marginTop: Spacing.lg }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.blueDeep },
  scroll: { flexGrow: 1, padding: Spacing.lg },

  back: { marginBottom: Spacing.lg },
  backText: { color: Colors.blue, fontSize: 16, fontWeight: '600' },

  header: { marginBottom: Spacing.xl },
  title: { fontSize: 28, fontWeight: '900', color: Colors.white },
  sub:   { fontSize: 14, color: Colors.grey, marginTop: 4 },

  form: { gap: 0 },
  errorBanner: {
    backgroundColor: 'rgba(232,64,64,0.15)', borderRadius: Radius.sm,
    color: Colors.red, padding: Spacing.sm, marginBottom: Spacing.md,
    fontSize: 13, borderWidth: 1, borderColor: Colors.red,
  },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { color: Colors.grey, fontSize: 14 },
  footerLink: { color: Colors.blue, fontSize: 14, fontWeight: '700' },
});

import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { TextInput } from '../../src/components/TextInput';
import { Colors, Spacing, Radius } from '../../src/components/theme';

export default function Profile() {
  const profile       = useAuthStore(s => s.profile);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const signOut       = useAuthStore(s => s.signOut);

  const [name, setName]         = useState(profile?.display_name ?? '');
  const [ghin, setGhin]         = useState(profile?.ghin_number ?? '');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: name.trim(), ghin_number: ghin.trim() || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>

        {/* Avatar placeholder */}
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>

        {/* Handicap display */}
        {profile?.handicap_index != null && (
          <View style={styles.hcpCard}>
            <Text style={styles.hcpLabel}>HANDICAP INDEX</Text>
            <Text style={styles.hcpValue}>{profile.handicap_index.toFixed(1)}</Text>
            <Text style={styles.hcpSub}>Internal WHS calculation</Text>
          </View>
        )}

        {/* Edit form */}
        <View style={styles.form}>
          <TextInput
            label="Display Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextInput
            label="Email"
            value={profile?.email ?? ''}
            onChangeText={() => {}}
            editable={false}
            style={{ marginTop: Spacing.md, opacity: 0.6 }}
          />
          <View style={styles.ghinRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="GHIN Number"
                value={ghin}
                onChangeText={setGhin}
                placeholder="Optional — required for Phase 2"
                keyboardType="numeric"
                style={{ marginTop: Spacing.md }}
              />
            </View>
          </View>
          <Text style={styles.ghinNote}>
            GHIN integration (automatic score posting) is coming in Phase 2.
          </Text>
        </View>

        <Button
          label={saved ? 'Saved ✓' : 'Save Changes'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          style={{ marginTop: Spacing.lg }}
        />

        {/* App info */}
        <View style={styles.infoCard}>
          {[
            { label: 'App',     value: 'Call It' },
            { label: 'Version', value: '1.0.0 (Phase 1)' },
            { label: 'Phase',   value: 'Foundation' },
          ].map(r => (
            <View key={r.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{r.label}</Text>
              <Text style={styles.infoValue}>{r.value}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.blueDeep },
  scroll: { padding: Spacing.lg, paddingBottom: 60 },
  title:  { fontSize: 26, fontWeight: '900', color: Colors.white, marginBottom: Spacing.lg },

  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  avatarInitial: { fontSize: 34, fontWeight: '900', color: Colors.white },

  hcpCard: {
    backgroundColor: Colors.greyDark, borderRadius: Radius.lg,
    padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.blue,
  },
  hcpLabel: { fontSize: 10, color: Colors.grey, letterSpacing: 2, fontWeight: '700' },
  hcpValue: { fontSize: 52, fontWeight: '900', color: Colors.white },
  hcpSub:   { fontSize: 12, color: Colors.grey },

  form: { gap: 0 },
  ghinRow:  { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' },
  ghinNote: { fontSize: 11, color: Colors.grey, marginTop: Spacing.sm, fontStyle: 'italic' },

  infoCard: {
    backgroundColor: Colors.greyDark, borderRadius: Radius.md,
    padding: Spacing.md, marginTop: Spacing.xl,
    borderWidth: 1, borderColor: Colors.greyMid,
  },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: 13, color: Colors.grey },
  infoValue: { fontSize: 13, color: Colors.white, fontWeight: '600' },
});

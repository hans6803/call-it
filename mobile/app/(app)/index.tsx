/**
 * Home / Dashboard screen.
 * Shows handicap index, quick-start button, and round history.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Colors, Spacing, Radius } from '../../src/components/theme';
import { Round, toPar } from '../../src/types';

export default function Home() {
  const profile   = useAuthStore(s => s.profile);
  const session   = useAuthStore(s => s.session);

  const [rounds, setRounds]       = useState<Round[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('rounds')
      .select('*, courses(name, location)')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .limit(10);
    setRounds((data as any[]) ?? []);
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const hcp = profile?.handicap_index;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.display_name ?? 'Golfer'}</Text>
        </View>
        <View style={styles.hcpBadge}>
          <Text style={styles.hcpLabel}>HCP</Text>
          <Text style={styles.hcpValue}>{hcp != null ? hcp.toFixed(1) : '—'}</Text>
        </View>
      </View>

      {/* Quick-start button */}
      <View style={styles.quickStart}>
        <Button
          label="Start New Round"
          onPress={() => router.push('/(app)/round/course-search')}
          fullWidth
          style={styles.startBtn}
        />
      </View>

      {/* Active round banner */}
      {rounds.find(r => r.status === 'active') && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => router.push('/(app)/round/gps')}
        >
          <Text style={styles.activeBannerText}>⛳  Resume active round →</Text>
        </TouchableOpacity>
      )}

      {/* Round history */}
      <Text style={styles.sectionLabel}>RECENT ROUNDS</Text>
      <FlatList
        data={rounds.filter(r => r.status !== 'active')}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏌️</Text>
            <Text style={styles.emptyText}>No rounds yet. Start your first round above.</Text>
          </View>
        }
        renderItem={({ item: r }) => {
          const courseName = (r as any).courses?.name ?? 'Unknown Course';
          const parTotal = 72; // TODO: derive from course
          const diff = r.total_score != null ? r.total_score - parTotal : null;
          return (
            <TouchableOpacity
              style={styles.roundCard}
              onPress={() => router.push({ pathname: '/(app)/round/summary', params: { roundId: r.id } })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.roundCourse} numberOfLines={1}>{courseName}</Text>
                <Text style={styles.roundDate}>{r.date}</Text>
              </View>
              <View style={styles.roundScore}>
                {r.total_score != null ? (
                  <>
                    <Text style={styles.roundScoreNum}>{r.total_score}</Text>
                    <Text style={[styles.roundToPar, { color: diff! < 0 ? Colors.red : diff! > 0 ? Colors.blue : Colors.grey }]}>
                      {toPar(r.total_score, parTotal)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.roundToPar}>—</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.blueDeep },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: 13, color: Colors.grey },
  name:     { fontSize: 22, fontWeight: '800', color: Colors.white },
  hcpBadge: {
    backgroundColor: Colors.blue, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center',
  },
  hcpLabel: { fontSize: 9, color: Colors.bluePale, letterSpacing: 1.5, fontWeight: '700' },
  hcpValue: { fontSize: 22, fontWeight: '900', color: Colors.white },

  quickStart: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  startBtn:   { height: 56, borderRadius: Radius.lg },

  activeBanner: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: 'rgba(29,185,84,0.15)',
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.green,
  },
  activeBannerText: { color: Colors.green, fontWeight: '700', fontSize: 14 },

  sectionLabel: {
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
    fontSize: 10, color: Colors.grey, fontWeight: '700', letterSpacing: 1.5,
  },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.grey, fontSize: 14, textAlign: 'center' },

  roundCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.greyDark, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.greyMid,
  },
  roundCourse: { fontSize: 15, fontWeight: '700', color: Colors.white },
  roundDate:   { fontSize: 12, color: Colors.grey, marginTop: 2 },
  roundScore:  { alignItems: 'flex-end' },
  roundScoreNum: { fontSize: 24, fontWeight: '900', color: Colors.white },
  roundToPar:    { fontSize: 12, fontWeight: '700' },
});

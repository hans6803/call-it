import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Radius } from '../../src/components/theme';

interface Stats {
  rounds: number;
  avgScore: number | null;
  fhPct: number | null;
  girPct: number | null;
  avgPutts: number | null;
  bestScore: number | null;
  lowDiff: number | null;
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={tile.card}>
      <Text style={tile.value}>{value}</Text>
      <Text style={tile.label}>{label}</Text>
      {sub && <Text style={tile.sub}>{sub}</Text>}
    </View>
  );
}

const tile = StyleSheet.create({
  card:  { flex: 1, minWidth: 140, backgroundColor: Colors.greyDark, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.greyMid },
  value: { fontSize: 30, fontWeight: '900', color: Colors.white },
  label: { fontSize: 11, color: Colors.grey, fontWeight: '600', letterSpacing: 1, marginTop: 2, textAlign: 'center' },
  sub:   { fontSize: 10, color: Colors.grey, marginTop: 1 },
});

export default function Stats() {
  const session = useAuthStore(s => s.session);
  const profile = useAuthStore(s => s.profile);

  const [stats, setStats]       = useState<Stats | null>(null);
  const [refreshing, setRefresh]= useState(false);

  const load = useCallback(async () => {
    if (!session) return;

    const { data: rounds } = await supabase
      .from('rounds')
      .select('total_score, differential, hole_scores(strokes, putts, fairway_hit, gir, par)')
      .eq('user_id', session.user.id)
      .eq('status', 'complete')
      .order('date', { ascending: false })
      .limit(20);

    if (!rounds?.length) { setStats({ rounds: 0, avgScore: null, fhPct: null, girPct: null, avgPutts: null, bestScore: null, lowDiff: null }); return; }

    const scores  = rounds.map((r: any) => r.total_score).filter(Boolean);
    const diffs   = rounds.map((r: any) => r.differential).filter(Boolean);
    const allHoles= rounds.flatMap((r: any) => r.hole_scores ?? []);
    const fhHoles = allHoles.filter((h: any) => h.par >= 4);
    const fhHit   = fhHoles.filter((h: any) => h.fairway_hit).length;
    const girHit  = allHoles.filter((h: any) => h.gir).length;
    const puttHoles = allHoles.filter((h: any) => h.putts != null);

    setStats({
      rounds:    rounds.length,
      avgScore:  scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b) / scores.length) : null,
      bestScore: scores.length ? Math.min(...scores) : null,
      fhPct:     fhHoles.length ? Math.round(fhHit / fhHoles.length * 100) : null,
      girPct:    allHoles.length ? Math.round(girHit / allHoles.length * 100) : null,
      avgPutts:  puttHoles.length ? parseFloat((puttHoles.reduce((a: number, h: any) => a + h.putts, 0) / puttHoles.length).toFixed(1)) : null,
      lowDiff:   diffs.length ? Math.min(...diffs) : null,
    });
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefresh(true); await load(); setRefresh(false); };

  const fmt = (v: number | null, suffix = '') => v != null ? `${v}${suffix}` : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          {profile?.handicap_index != null && (
            <View style={styles.hcpChip}>
              <Text style={styles.hcpLabel}>HCP {profile.handicap_index.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {!stats || stats.rounds === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Complete a round to see your stats.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>SCORING</Text>
            <View style={styles.grid}>
              <StatTile label="Rounds Played"  value={fmt(stats.rounds)}    />
              <StatTile label="Scoring Average" value={fmt(stats.avgScore)} />
            </View>
            <View style={styles.grid}>
              <StatTile label="Best Score"   value={fmt(stats.bestScore)} />
              <StatTile label="Low Diff"     value={fmt(stats.lowDiff)}  />
            </View>

            <Text style={styles.sectionLabel}>ON-COURSE</Text>
            <View style={styles.grid}>
              <StatTile label="Fairways Hit" value={fmt(stats.fhPct, '%')} />
              <StatTile label="GIR"          value={fmt(stats.girPct, '%')} />
            </View>
            <View style={styles.grid}>
              <StatTile label="Avg Putts/Hole" value={fmt(stats.avgPutts)} />
            </View>

            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>Strokes Gained analysis coming in Phase 4</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.blueDeep },
  scroll: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title:  { fontSize: 26, fontWeight: '900', color: Colors.white },
  hcpChip:  { backgroundColor: Colors.blue, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 6 },
  hcpLabel: { fontSize: 13, fontWeight: '800', color: Colors.white },

  sectionLabel: { fontSize: 10, color: Colors.grey, fontWeight: '700', letterSpacing: 1.5, marginBottom: Spacing.sm, marginTop: Spacing.md },
  grid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.grey, fontSize: 14, textAlign: 'center' },

  comingSoon: { backgroundColor: Colors.greyDark, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.greyMid },
  comingSoonText: { color: Colors.grey, fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
});

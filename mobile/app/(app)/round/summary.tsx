import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useRoundStore } from '../../../src/store/roundStore';
import { Button } from '../../../src/components/Button';
import { Colors, Spacing, Radius } from '../../../src/components/theme';
import { Round, toPar } from '../../../src/types';

export default function RoundSummary() {
  const { roundId }  = useLocalSearchParams<{ roundId?: string }>();
  const storeRound   = useRoundStore(s => s.round);
  const clearRound   = useRoundStore(s => s.clearRound);

  const [round, setRound] = useState<Round | null>(storeRound);

  useEffect(() => {
    if (roundId && roundId !== storeRound?.id) {
      supabase.from('rounds').select('*, courses(name, location), hole_scores(*)').eq('id', roundId).single()
        .then(({ data }) => { if (data) setRound(data as any); });
    }
  }, [roundId]);

  if (!round) return null;

  const holes     = round.holes ?? [];
  const totalPar  = holes.reduce((a, h) => a + h.par, 0) || 72;
  const total     = holes.reduce((a, h) => a + (h.strokes ?? 0), 0);
  const diff      = total - totalPar;
  const putts     = holes.reduce((a, h) => a + (h.putts ?? 0), 0);
  const fhHoles   = holes.filter(h => h.par >= 4);
  const fhHit     = fhHoles.filter(h => h.fairway_hit).length;
  const girCount  = holes.filter(h => h.gir).length;

  const scoreCounts = holes.reduce<Record<string, number>>((acc, h) => {
    if (!h.strokes) return acc;
    const d = h.strokes - h.par;
    const key = d <= -2 ? 'Eagle+' : d === -1 ? 'Birdie' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : 'Double+';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const handleShare = async () => {
    await Share.share({
      message: `I shot ${total} (${toPar(total, totalPar)}) at ${(round as any).courses?.name ?? 'the course'} today. Putts: ${putts} · GIR: ${girCount}/18. #CallIt`,
    });
  };

  const handleDone = () => {
    clearRound();
    router.replace('/(app)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Score hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>ROUND COMPLETE</Text>
          <Text style={styles.courseName}>{(round as any).courses?.name ?? 'Round'}</Text>
          <Text style={styles.toPar}>{toPar(total, totalPar)}</Text>
          <Text style={styles.totalScore}>{total}</Text>
          <Text style={styles.parLine}>Par {totalPar}</Text>
        </View>

        {/* Stat grid */}
        <View style={styles.statGrid}>
          {[
            { label: 'Putts',         value: putts },
            { label: 'GIR',           value: `${girCount}/18` },
            { label: 'FWY Hit',       value: fhHoles.length ? `${fhHit}/${fhHoles.length}` : '—' },
            { label: 'Putts/Hole',    value: (putts / Math.max(holes.filter(h=>h.putts!=null).length,1)).toFixed(1) },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Score breakdown */}
        <Text style={styles.sectionLabel}>SCORE BREAKDOWN</Text>
        <View style={styles.breakdownCard}>
          {Object.entries(scoreCounts).map(([k, v]) => (
            <View key={k} style={styles.breakdownRow}>
              <Text style={styles.breakdownKey}>{k}</Text>
              <View style={styles.breakdownBar}>
                <View style={[styles.breakdownFill, { width: `${(v / 18) * 100}%` }]} />
              </View>
              <Text style={styles.breakdownCount}>{v}</Text>
            </View>
          ))}
        </View>

        {/* GHIN banner (Phase 2) */}
        <View style={styles.ghinBanner}>
          <Text style={styles.ghinIcon}>🏌️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.ghinTitle}>GHIN Integration</Text>
            <Text style={styles.ghinSub}>Automatic score posting available in Phase 2.</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button label="Share Scorecard" onPress={handleShare} variant="ghost" fullWidth />
          <Button label="Done" onPress={handleDone} fullWidth style={{ marginTop: Spacing.sm }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.blueDeep },
  scroll: { padding: Spacing.lg },

  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  heroLabel:  { fontSize: 10, color: Colors.grey, letterSpacing: 2, fontWeight: '700' },
  courseName: { fontSize: 18, fontWeight: '800', color: Colors.white, marginTop: 4, textAlign: 'center' },
  toPar: { fontSize: 52, fontWeight: '900', color: Colors.blue, lineHeight: 60, marginTop: Spacing.md },
  totalScore: { fontSize: 80, fontWeight: '900', color: Colors.white, lineHeight: 90 },
  parLine:    { fontSize: 14, color: Colors.grey },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1, minWidth: 140, backgroundColor: Colors.greyDark,
    borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.greyMid,
  },
  statValue: { fontSize: 28, fontWeight: '900', color: Colors.white },
  statLabel: { fontSize: 11, color: Colors.grey, fontWeight: '600', letterSpacing: 1, marginTop: 2 },

  sectionLabel: { fontSize: 10, color: Colors.grey, fontWeight: '700', letterSpacing: 1.5, marginBottom: Spacing.sm },
  breakdownCard: { backgroundColor: Colors.greyDark, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.greyMid },
  breakdownRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: Spacing.sm },
  breakdownKey:  { fontSize: 13, color: Colors.white, width: 68 },
  breakdownBar:  { flex: 1, height: 8, backgroundColor: Colors.greyMid, borderRadius: 4, overflow: 'hidden' },
  breakdownFill: { height: '100%', backgroundColor: Colors.blue, borderRadius: 4 },
  breakdownCount:{ fontSize: 13, fontWeight: '700', color: Colors.grey, width: 20, textAlign: 'right' },

  ghinBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.greyDark, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.greyMid,
  },
  ghinIcon:  { fontSize: 28 },
  ghinTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  ghinSub:   { fontSize: 12, color: Colors.grey, marginTop: 2 },

  actions: { paddingBottom: Spacing.xxl },
});

/**
 * GPS / Hole View — primary in-round screen.
 * Production implementation of the approved mockup.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, AppState,
} from 'react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useRoundStore } from '../../../src/store/roundStore';
import { calcDistances, hazardDistances } from '../../../src/lib/courseApi';
import { Colors, Spacing, Radius, MIN_TOUCH } from '../../../src/components/theme';
import { HoleData } from '../../../src/types';

// ── Sub-components ────────────────────────────────────────────────────────────

function HoleHeader({ hole, holeNumber, totalScore, holesPlayed }:
  { hole: HoleData; holeNumber: number; totalScore: number; holesPlayed: number }) {
  const toParColor = totalScore < 0 ? Colors.red : totalScore > 0 ? Colors.blue : Colors.grey;
  const toParLabel = totalScore === 0 ? 'E' : totalScore > 0 ? `+${totalScore}` : `${totalScore}`;
  return (
    <View style={header.row}>
      <View style={header.block}>
        <Text style={header.label}>HOLE</Text>
        <Text style={header.holeNum}>{holeNumber}</Text>
      </View>
      <View style={[header.block, { flex: 2 }]}>
        <Text style={header.par}>PAR {hole.par}</Text>
        <Text style={header.yardage}>{hole.yardage} yds</Text>
      </View>
      <View style={header.block}>
        <Text style={header.label}>SCORE</Text>
        <Text style={[header.score, { color: toParColor }]}>{toParLabel}</Text>
        <Text style={header.label}>{holesPlayed} holes</Text>
      </View>
    </View>
  );
}

const header = StyleSheet.create({
  row:     { flexDirection: 'row', backgroundColor: Colors.blueDeep, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.greyDark },
  block:   { flex: 1, alignItems: 'center' },
  label:   { fontSize: 9, color: Colors.grey, letterSpacing: 1.5, fontWeight: '700' },
  holeNum: { fontSize: 42, fontWeight: '900', color: Colors.white, lineHeight: 48 },
  par:     { fontSize: 20, fontWeight: '800', color: Colors.white },
  yardage: { fontSize: 14, fontWeight: '600', color: Colors.bluePale },
  score:   { fontSize: 36, fontWeight: '900' },
});

function HoleMap({ hole }: { hole: HoleData }) {
  return (
    <View style={map.container}>
      <View style={[map.rough]} />
      <View style={map.fairwayOuter}><View style={map.fairway} /></View>
      <View style={map.teeBox}><Text style={map.teeLabel}>TEE</Text></View>
      <View style={[map.hazard, map.bunkerLeft]}><Text style={map.hazardLabel}>B</Text></View>
      <View style={[map.hazard, map.waterRight]}><Text style={map.hazardLabel}>~</Text></View>
      <View style={[map.hazard, map.bunkerFront]}><Text style={map.hazardLabel}>B</Text></View>
      <View style={map.green}>
        <Text style={map.greenLabel}>GREEN</Text>
        <View style={map.pin} />
      </View>
      <View style={map.gpsMarker}>
        <View style={map.gpsPulse} />
        <View style={map.gpsDot} />
      </View>
      <View style={map.compass}><Text style={map.compassN}>N</Text></View>
    </View>
  );
}

const map = StyleSheet.create({
  container:   { height: 200, backgroundColor: '#C8DCF0', position: 'relative', overflow: 'hidden' },
  rough:       { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.fairway, opacity: 0.3 },
  fairwayOuter:{ position: 'absolute', top: '10%', left: '30%', width: '40%', height: '75%', alignItems: 'center' },
  fairway:     { width: '60%', height: '100%', backgroundColor: Colors.fairway, borderRadius: 30, opacity: 0.85 },
  teeBox:      { position: 'absolute', bottom: '8%', left: '45%', width: 40, height: 18, backgroundColor: Colors.blueDark, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  teeLabel:    { fontSize: 8, color: Colors.white, fontWeight: '700' },
  hazard:      { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  bunkerLeft:  { left: '15%', top: '38%', width: 32, height: 22, backgroundColor: Colors.sand, borderRadius: 12 },
  waterRight:  { right: '10%', top: '20%', width: 55, height: 38, backgroundColor: Colors.water, borderRadius: 20, opacity: 0.85 },
  bunkerFront: { left: '42%', top: '12%', width: 28, height: 18, backgroundColor: Colors.sand, borderRadius: 10 },
  hazardLabel: { fontSize: 11, fontWeight: '700', color: Colors.white },
  green:       { position: 'absolute', top: '8%', left: '38%', width: 64, height: 46, backgroundColor: Colors.greenColor, borderRadius: 30, borderWidth: 2, borderColor: Colors.white, justifyContent: 'center', alignItems: 'center' },
  greenLabel:  { fontSize: 7, color: Colors.white, fontWeight: '700' },
  pin:         { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.white, marginTop: 3 },
  gpsMarker:   { position: 'absolute', bottom: '25%', left: '47%', width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  gpsDot:      { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.blue, borderWidth: 2, borderColor: Colors.white, position: 'absolute' },
  gpsPulse:    { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.blueLight, opacity: 0.5, position: 'absolute' },
  compass:     { position: 'absolute', top: 8, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,37,84,0.6)', justifyContent: 'center', alignItems: 'center' },
  compassN:    { fontSize: 12, color: Colors.white, fontWeight: '800' },
});

function DistancePanel({ front, centre, back }: { front: number; centre: number; back: number }) {
  return (
    <View style={dist.panel}>
      <DistItem label="FRONT" value={front} />
      <DistItem label="CENTRE" value={centre} primary />
      <DistItem label="BACK" value={back} />
    </View>
  );
}

function DistItem({ label, value, primary }: { label: string; value: number; primary?: boolean }) {
  return (
    <View style={[dist.item, primary && dist.itemPrimary]}>
      <Text style={[dist.label, primary && dist.labelPrimary]}>{label}</Text>
      <Text style={[dist.value, primary && dist.valuePrimary]}>{value || '—'}</Text>
      <Text style={[dist.unit, primary && dist.unitPrimary]}>yds</Text>
    </View>
  );
}

const dist = StyleSheet.create({
  panel:        { flexDirection: 'row', backgroundColor: Colors.blueDark, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  item:         { flex: 1, alignItems: 'center', paddingVertical: 6 },
  itemPrimary:  { backgroundColor: Colors.blue, borderRadius: Radius.md, marginHorizontal: 4, paddingVertical: 8 },
  label:        { fontSize: 9, color: Colors.grey, letterSpacing: 1.5, fontWeight: '700' },
  labelPrimary: { color: Colors.bluePale },
  value:        { fontSize: 34, fontWeight: '900', color: Colors.bluePale, lineHeight: 40 },
  valuePrimary: { fontSize: 44, color: Colors.white, lineHeight: 50 },
  unit:         { fontSize: 11, color: Colors.grey, fontWeight: '600' },
  unitPrimary:  { color: Colors.bluePale, fontSize: 13 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function GPSView() {
  const round       = useRoundStore(s => s.round);
  const currentHole = useRoundStore(s => s.currentHole);
  const advanceHole = useRoundStore(s => s.advanceHole);
  const goToHole    = useRoundStore(s => s.goToHole);

  const [distances, setDistances]     = useState({ front: 0, centre: 0, back: 0 });
  const [hazards, setHazards]         = useState<any[]>([]);
  const [activeTab, setActiveTab]     = useState<'hazards' | 'layups'>('hazards');
  const [gpsGranted, setGpsGranted]   = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const hole: HoleData | undefined = round?.course?.holes?.[currentHole - 1];

  // Request GPS permission and start watching
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('GPS Required', 'Please allow location access for accurate yardages.');
        return;
      }
      setGpsGranted(true);
    })();
    return () => { watchRef.current?.remove(); };
  }, []);

  // Update distances when location changes
  const updateDistances = useCallback((loc: Location.LocationObject) => {
    if (!hole) return;
    const d = calcDistances(loc.coords.latitude, loc.coords.longitude, hole);
    setDistances(d);
    const h = hazardDistances(loc.coords.latitude, loc.coords.longitude, hole);
    setHazards(h);
  }, [hole]);

  useEffect(() => {
    if (!gpsGranted || !hole) return;
    watchRef.current?.remove();
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 2 },
      updateDistances,
    ).then(sub => { watchRef.current = sub; });
    return () => { watchRef.current?.remove(); };
  }, [gpsGranted, hole, updateDistances]);

  if (!round || !hole) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.grey }}>No active round. </Text>
          <TouchableOpacity onPress={() => router.replace('/(app)')}><Text style={{ color: Colors.blue, marginTop: 8 }}>Go Home</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const holesPlayed  = round.holes.filter(h => h.strokes != null).length;
  const totalScore   = round.holes.reduce((a, h) => a + (h.strokes ?? 0), 0)
                     - round.holes.reduce((a, h) => a + (h.strokes != null ? h.par : 0), 0);

  const hazardDotColor: Record<string, string> = {
    bunker: Colors.bunker, water: Colors.water, ob: Colors.ob, dogleg: Colors.grey,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <HoleHeader hole={hole} holeNumber={currentHole} totalScore={totalScore} holesPlayed={holesPlayed} />
      <HoleMap hole={hole} />
      <DistancePanel {...distances} />

      {/* Hazard / Layup tabs */}
      <View style={styles.tabBar}>
        {(['hazards', 'layups'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.hazardList} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: 4 }}>
        {activeTab === 'hazards'
          ? (hazards.length > 0 ? hazards : hole.coordinates?.hazards.map((h, i) => ({
              label: h.label, type: h.type,
              distance: h.distance_from_tee ?? 0,
            })) ?? []).map((h, i) => (
              <View key={i} style={styles.hazardRow}>
                <View style={[styles.hazardDot, { backgroundColor: hazardDotColor[h.type] ?? Colors.grey }]} />
                <Text style={styles.hazardLabel}>{h.label}</Text>
                <Text style={styles.hazardDist}>{h.distance} <Text style={styles.hazardUnit}>yds</Text></Text>
              </View>
            ))
          : (
            <View style={styles.hazardRow}>
              <View style={[styles.hazardDot, { backgroundColor: Colors.blueLight }]} />
              <Text style={styles.hazardLabel}>Layup 150</Text>
              <Text style={styles.hazardDist}>150 <Text style={styles.hazardUnit}>yds</Text></Text>
            </View>
          )
        }
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => goToHole(currentHole - 1)}
          disabled={currentHole === 1}
        >
          <Text style={[styles.navArrow, currentHole === 1 && { opacity: 0.3 }]}>‹</Text>
          <Text style={styles.navLabel}>PREV</Text>
        </TouchableOpacity>

        {/* Mic button — placeholder, wired in Phase 2 */}
        <TouchableOpacity
          style={styles.micBtn}
          onPress={() => router.push('/(app)/round/scorecard')}
          accessibilityLabel="Open scorecard (voice in Phase 2)"
        >
          <View style={styles.micPulse} />
          <Text style={styles.micIcon}>🎙</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(app)/round/scorecard')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>CARD</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.blueDeep },

  tabBar: { flexDirection: 'row', backgroundColor: Colors.blueDark, borderTopWidth: 1, borderTopColor: Colors.blueDeep },
  tab:    { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.white },
  tabText:   { fontSize: 11, color: Colors.grey, letterSpacing: 1.5, fontWeight: '700' },
  tabTextActive: { color: Colors.white },

  hazardList:  { flex: 1, backgroundColor: Colors.blueDeep },
  hazardRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.greyDark, minHeight: MIN_TOUCH },
  hazardDot:   { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  hazardLabel: { flex: 1, fontSize: 15, color: Colors.white, fontWeight: '500' },
  hazardDist:  { fontSize: 20, fontWeight: '800', color: Colors.white },
  hazardUnit:  { fontSize: 13, color: Colors.grey, fontWeight: '400' },

  bottomBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.blueDeep, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.greyDark },
  navBtn:    { flex: 1, alignItems: 'center', paddingVertical: 8, minHeight: MIN_TOUCH, justifyContent: 'center' },
  navArrow:  { fontSize: 30, color: Colors.white, lineHeight: 34 },
  navIcon:   { fontSize: 22 },
  navLabel:  { fontSize: 9, color: Colors.grey, letterSpacing: 1.5, fontWeight: '600', marginTop: 2 },
  micBtn:    { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center', marginHorizontal: Spacing.lg, shadowColor: Colors.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  micPulse:  { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: Colors.blueLight, opacity: 0.4 },
  micIcon:   { fontSize: 32 },
});

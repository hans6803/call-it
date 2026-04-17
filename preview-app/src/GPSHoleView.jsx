/**
 * Call It — GPS / Hole View Mockup
 * Static placeholder data, no backend. Blue/white high-contrast scheme.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ─── Placeholder Data ────────────────────────────────────────────────────────

const HOLE = {
  number: 7,
  par: 4,
  holeYardage: 385,
  teeBox: 'Blue',
  distances: { front: 148, centre: 163, back: 179 },
  hazards: [
    { label: 'Bunker Left',   distance: 112, type: 'bunker' },
    { label: 'Water Right',   distance: 187, type: 'water'  },
    { label: 'Dogleg',        distance: 201, type: 'dogleg' },
    { label: 'Bunker Front',  distance: 134, type: 'bunker' },
    { label: 'OB Right',      distance: 245, type: 'ob'     },
  ],
  layups: [
    { label: 'Layup 150',  distance: 150 },
    { label: 'Layup 100',  distance: 100 },
  ],
};

const ROUND = { currentScore: -1, holesPlayed: 6, totalHoles: 18 };

// ─── Colour Tokens ────────────────────────────────────────────────────────────

const C = {
  blue:       '#0057B8',
  blueDark:   '#003D82',
  blueDeep:   '#002554',
  blueLight:  '#3A7FD5',
  bluePale:   '#D6E8FF',
  white:      '#FFFFFF',
  offWhite:   '#F4F8FF',
  grey:       '#8FA8C8',
  greyLight:  '#E8F0FA',
  text:       '#0A1628',
  // hazard colours
  bunker:     '#D4A017',
  water:      '#0057B8',
  ob:         '#CC2200',
  dogleg:     '#555',
  // course colours (for map)
  fairway:    '#3A7F3A',
  green:      '#5CB85C',
  rough:      '#2D5A27',
  sand:       '#D4B483',
  sky:        '#E8F4FF',
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function Header({ hole, round }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerLabel}>HOLE</Text>
        <Text style={styles.holeNumber}>{hole.number}</Text>
      </View>
      <View style={styles.headerCenter}>
        <Text style={styles.headerPar}>PAR {hole.par}</Text>
        <Text style={styles.headerYardage}>{hole.holeYardage} yds</Text>
        <Text style={styles.headerTee}>{hole.teeBox} Tees</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerLabel}>SCORE</Text>
        <Text style={[
          styles.scoreDisplay,
          round.currentScore < 0 && { color: C.blue },
          round.currentScore > 0 && { color: C.ob },
        ]}>
          {round.currentScore === 0 ? 'E' : round.currentScore > 0 ? `+${round.currentScore}` : round.currentScore}
        </Text>
        <Text style={styles.headerLabel}>{round.holesPlayed} holes</Text>
      </View>
    </View>
  );
}

/** Stylised overhead hole map — drawn with Views */
function HoleMap({ hole }) {
  return (
    <View style={styles.mapContainer}>
      {/* Sky background */}
      <View style={styles.mapBackground}>

        {/* Rough surround */}
        <View style={styles.roughSurround} />

        {/* Fairway — angled corridor */}
        <View style={styles.fairwayOuter}>
          <View style={styles.fairway} />
        </View>

        {/* Tee box */}
        <View style={styles.teeBox}>
          <Text style={styles.teeLabel}>TEE</Text>
        </View>

        {/* Hazard: water right */}
        <View style={[styles.hazardBlob, styles.waterBlob]}>
          <Text style={styles.hazardBlobLabel}>~</Text>
        </View>

        {/* Hazard: bunker left of fairway */}
        <View style={[styles.hazardBlob, styles.bunkerBlobLeft]}>
          <Text style={styles.hazardBlobLabel}>B</Text>
        </View>

        {/* Hazard: bunker front of green */}
        <View style={[styles.hazardBlob, styles.bunkerBlobFront]}>
          <Text style={styles.hazardBlobLabel}>B</Text>
        </View>

        {/* Green */}
        <View style={styles.greenOval}>
          <Text style={styles.greenLabel}>GREEN</Text>
          {/* Pin */}
          <View style={styles.pinDot} />
        </View>

        {/* GPS position marker */}
        <View style={styles.gpsMarker}>
          <View style={styles.gpsMarkerInner} />
          <View style={styles.gpsMarkerPulse} />
        </View>

        {/* Distance line from GPS to green */}
        <View style={styles.distanceLine} />

        {/* Compass */}
        <View style={styles.compass}>
          <Text style={styles.compassN}>N</Text>
        </View>
      </View>
    </View>
  );
}

function DistancePanel({ distances }) {
  return (
    <View style={styles.distancePanel}>
      <DistanceItem label="FRONT" value={distances.front} dimmed />
      <DistanceItem label="CENTRE" value={distances.centre} primary />
      <DistanceItem label="BACK"   value={distances.back}  dimmed />
    </View>
  );
}

function DistanceItem({ label, value, primary, dimmed }) {
  return (
    <View style={[styles.distanceItem, primary && styles.distanceItemPrimary]}>
      <Text style={[styles.distanceLabel, primary && styles.distanceLabelPrimary]}>
        {label}
      </Text>
      <Text style={[styles.distanceValue, primary && styles.distanceValuePrimary, dimmed && styles.distanceValueDimmed]}>
        {value}
      </Text>
      <Text style={[styles.distanceUnit, primary && styles.distanceUnitPrimary]}>yds</Text>
    </View>
  );
}

function HazardRow({ hazard }) {
  const dotColor = {
    bunker: C.bunker,
    water:  C.water,
    ob:     C.ob,
    dogleg: C.dogleg,
  }[hazard.type] ?? C.grey;

  return (
    <View style={styles.hazardRow}>
      <View style={[styles.hazardDot, { backgroundColor: dotColor }]} />
      <Text style={styles.hazardLabel}>{hazard.label}</Text>
      <Text style={styles.hazardDistance}>{hazard.distance} <Text style={styles.hazardUnit}>yds</Text></Text>
    </View>
  );
}

function BottomBar({ onMicPress, onScorecardPress }) {
  return (
    <View style={styles.bottomBar}>
      {/* Left: hole navigation */}
      <TouchableOpacity style={styles.navButton} accessibilityLabel="Previous hole">
        <Text style={styles.navArrow}>‹</Text>
        <Text style={styles.navLabel}>PREV</Text>
      </TouchableOpacity>

      {/* Center: microphone */}
      <TouchableOpacity
        style={styles.micButton}
        onPress={onMicPress}
        accessibilityLabel="Activate voice input"
        accessibilityRole="button"
      >
        <View style={styles.micPulseRing} />
        <View style={styles.micInner}>
          <Text style={styles.micIcon}>🎙</Text>
        </View>
      </TouchableOpacity>

      {/* Right: scorecard */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onScorecardPress}
        accessibilityLabel="Open scorecard"
      >
        <Text style={styles.navIcon}>📋</Text>
        <Text style={styles.navLabel}>CARD</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function GPSHoleView() {
  const [activeTab, setActiveTab] = useState('hazards'); // 'hazards' | 'layups'

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.blueDeep} />

      {/* Header */}
      <Header hole={HOLE} round={ROUND} />

      {/* Hole Map */}
      <HoleMap hole={HOLE} />

      {/* Distance Panel */}
      <DistancePanel distances={HOLE.distances} />

      {/* Tab bar for hazards / layups */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hazards' && styles.tabActive]}
          onPress={() => setActiveTab('hazards')}
        >
          <Text style={[styles.tabText, activeTab === 'hazards' && styles.tabTextActive]}>
            HAZARDS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'layups' && styles.tabActive]}
          onPress={() => setActiveTab('layups')}
        >
          <Text style={[styles.tabText, activeTab === 'layups' && styles.tabTextActive]}>
            LAYUPS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hazard / Layup list */}
      <ScrollView style={styles.hazardList} contentContainerStyle={styles.hazardListContent}>
        {activeTab === 'hazards'
          ? HOLE.hazards.map((h, i) => <HazardRow key={i} hazard={h} />)
          : HOLE.layups.map((l, i) => (
              <View key={i} style={styles.hazardRow}>
                <View style={[styles.hazardDot, { backgroundColor: C.blueLight }]} />
                <Text style={styles.hazardLabel}>{l.label}</Text>
                <Text style={styles.hazardDistance}>{l.distance} <Text style={styles.hazardUnit}>yds</Text></Text>
              </View>
            ))
        }
      </ScrollView>

      {/* Bottom bar */}
      <BottomBar
        onMicPress={() => console.log('mic pressed')}
        onScorecardPress={() => console.log('scorecard pressed')}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.blueDeep,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.blueDeep,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.blueDark,
  },
  headerLeft: { flex: 1, alignItems: 'center' },
  headerCenter: { flex: 2, alignItems: 'center' },
  headerRight: { flex: 1, alignItems: 'center' },
  headerLabel: { fontSize: 10, color: C.grey, letterSpacing: 1.5, fontWeight: '600' },
  holeNumber: { fontSize: 42, fontWeight: '900', color: C.white, lineHeight: 48 },
  headerPar: { fontSize: 20, fontWeight: '800', color: C.white },
  headerYardage: { fontSize: 15, fontWeight: '600', color: C.bluePale },
  headerTee: { fontSize: 11, color: C.grey, marginTop: 1 },
  scoreDisplay: { fontSize: 36, fontWeight: '900', color: C.white },

  // ── Map ──
  mapContainer: {
    height: height * 0.32,
    backgroundColor: C.sky,
    overflow: 'hidden',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: C.sky,
    position: 'relative',
  },
  roughSurround: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.rough,
    opacity: 0.3,
  },
  fairwayOuter: {
    position: 'absolute',
    top: '10%',
    left: '30%',
    width: '40%',
    height: '75%',
    alignItems: 'center',
  },
  fairway: {
    width: '60%',
    height: '100%',
    backgroundColor: C.fairway,
    borderRadius: 30,
    opacity: 0.85,
  },
  teeBox: {
    position: 'absolute',
    bottom: '8%',
    left: '45%',
    width: 40,
    height: 18,
    backgroundColor: C.blueDark,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teeLabel: { fontSize: 8, color: C.white, fontWeight: '700' },
  hazardBlob: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  waterBlob: {
    right: '10%',
    top: '20%',
    width: 55,
    height: 38,
    backgroundColor: '#4A90D9',
    opacity: 0.85,
  },
  bunkerBlobLeft: {
    left: '15%',
    top: '38%',
    width: 32,
    height: 22,
    backgroundColor: C.sand,
    borderRadius: 12,
  },
  bunkerBlobFront: {
    left: '42%',
    top: '12%',
    width: 28,
    height: 18,
    backgroundColor: C.sand,
    borderRadius: 10,
  },
  hazardBlobLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.white,
  },
  greenOval: {
    position: 'absolute',
    top: '8%',
    left: '38%',
    width: 64,
    height: 46,
    backgroundColor: C.green,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenLabel: { fontSize: 7, color: C.white, fontWeight: '700', letterSpacing: 0.5 },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.white,
    marginTop: 3,
  },
  gpsMarker: {
    position: 'absolute',
    bottom: '25%',
    left: '47%',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.blue,
    borderWidth: 2,
    borderColor: C.white,
  },
  gpsMarkerPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.blueLight,
    opacity: 0.5,
  },
  distanceLine: {
    position: 'absolute',
    bottom: '28%',
    left: '49.5%',
    width: 1,
    height: '38%',
    backgroundColor: C.white,
    opacity: 0.5,
  },
  compass: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,37,84,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassN: { fontSize: 12, color: C.white, fontWeight: '800' },

  // ── Distance Panel ──
  distancePanel: {
    flexDirection: 'row',
    backgroundColor: C.blueDark,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  distanceItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  distanceItemPrimary: {
    backgroundColor: C.blue,
    borderRadius: 10,
    marginHorizontal: 4,
    paddingVertical: 8,
  },
  distanceLabel: {
    fontSize: 9,
    color: C.grey,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  distanceLabelPrimary: { color: C.bluePale },
  distanceValue: {
    fontSize: 34,
    fontWeight: '900',
    color: C.bluePale,
    lineHeight: 40,
  },
  distanceValuePrimary: {
    fontSize: 44,
    color: C.white,
    lineHeight: 50,
  },
  distanceValueDimmed: { opacity: 0.7 },
  distanceUnit: { fontSize: 11, color: C.grey, fontWeight: '600' },
  distanceUnitPrimary: { color: C.bluePale, fontSize: 13 },

  // ── Tab bar ──
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.blueDark,
    borderTopWidth: 1,
    borderTopColor: C.blueDeep,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: C.white },
  tabText: {
    fontSize: 11,
    color: C.grey,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  tabTextActive: { color: C.white },

  // ── Hazard List ──
  hazardList: {
    flex: 1,
    backgroundColor: C.blueDeep,
  },
  hazardListContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  hazardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.blueDark,
    minHeight: 48,
  },
  hazardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  hazardLabel: {
    flex: 1,
    fontSize: 15,
    color: C.white,
    fontWeight: '500',
  },
  hazardDistance: {
    fontSize: 20,
    fontWeight: '800',
    color: C.white,
  },
  hazardUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: C.grey,
  },

  // ── Bottom Bar ──
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.blueDeep,
    paddingVertical: 10,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: C.blueDark,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 56,
    justifyContent: 'center',
  },
  navArrow: { fontSize: 30, color: C.white, lineHeight: 34 },
  navIcon: { fontSize: 22 },
  navLabel: {
    fontSize: 9,
    color: C.grey,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginTop: 2,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.blue,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginHorizontal: 16,
  },
  micPulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: C.blueLight,
    opacity: 0.4,
  },
  micInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: { fontSize: 32 },
});

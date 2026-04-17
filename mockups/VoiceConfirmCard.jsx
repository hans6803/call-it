/**
 * Call It — Voice Confirmation Card Mockup
 * Overlay shown after the golfer speaks. Static placeholder data.
 * Blue/white high-contrast, green = confirmed, amber = ambiguous.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';

// ─── Colour Tokens ────────────────────────────────────────────────────────────

const C = {
  blue:       '#0057B8',
  blueDark:   '#003D82',
  blueDeep:   '#002554',
  blueLight:  '#3A7FD5',
  bluePale:   '#D6E8FF',
  white:      '#FFFFFF',
  grey:       '#8FA8C8',
  greyLight:  '#1E3A5F',
  text:       '#FFFFFF',
  // Status
  green:      '#1DB954',
  greenBg:    'rgba(29,185,84,0.12)',
  greenBorder:'rgba(29,185,84,0.35)',
  amber:      '#F5A623',
  amberBg:    'rgba(245,166,35,0.12)',
  amberBorder:'rgba(245,166,35,0.35)',
  // Overlay
  scrim:      'rgba(0,18,40,0.72)',
  sheet:      '#0A2040',
  sheetBorder:'#1E3A5F',
};

// ─── Placeholder Parse Result ─────────────────────────────────────────────────

const TRANSCRIPT = '"Driver off the tee, 6-iron on, two putts, par."';

const PARSED = {
  hole:       { label: 'Hole',       value: '7',           status: 'confirmed' },
  score:      { label: 'Score',      value: '4 — Par',     status: 'confirmed' },
  strokes:    { label: 'Strokes',    value: '4',           status: 'confirmed' },
  putts:      { label: 'Putts',      value: '2',           status: 'confirmed' },
  fairway:    { label: 'Fairway Hit',value: 'Yes',         status: 'confirmed' },
  gir:        { label: 'GIR',        value: 'Yes (on in 2)',status: 'confirmed' },
  clubs:      { label: 'Clubs',      value: 'Driver · 6-iron · Putter', status: 'confirmed' },
  penalties:  { label: 'Penalties',  value: 'None',        status: 'confirmed' },
  sand:       { label: 'Sand Save',  value: 'Tap to add',  status: 'ambiguous' },
};

const AUTO_CONFIRM_SECS = 3;

// ─── Circular Countdown ───────────────────────────────────────────────────────

function CircularCountdown({ seconds, total }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={cd.wrapper}>
      <svg width={80} height={80} style={{ position: 'absolute' }}>
        {/* Track */}
        <circle
          cx={40} cy={40} r={radius}
          fill="none"
          stroke={C.greyLight}
          strokeWidth={4}
        />
        {/* Progress arc */}
        <circle
          cx={40} cy={40} r={radius}
          fill="none"
          stroke={C.green}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
      </svg>
      <Text style={cd.number}>{seconds}</Text>
    </View>
  );
}

const cd = StyleSheet.create({
  wrapper: {
    width: 80, height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  number: {
    fontSize: 26,
    fontWeight: '900',
    color: C.green,
  },
});

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({ field }) {
  const confirmed = field.status === 'confirmed';
  return (
    <View style={[
      row.container,
      confirmed ? row.confirmedBorder : row.ambiguousBorder,
    ]}>
      {/* Status dot */}
      <View style={[row.dot, { backgroundColor: confirmed ? C.green : C.amber }]} />

      {/* Label */}
      <Text style={row.label}>{field.label}</Text>

      {/* Value */}
      <Text style={[row.value, confirmed ? row.valueGreen : row.valueAmber]}>
        {field.value}
      </Text>

      {/* Edit nudge for ambiguous */}
      {!confirmed && (
        <TouchableOpacity style={row.editChip}>
          <Text style={row.editChipText}>+ Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const row = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
  },
  confirmedBorder: {
    backgroundColor: C.greenBg,
    borderColor: C.greenBorder,
  },
  ambiguousBorder: {
    backgroundColor: C.amberBg,
    borderColor: C.amberBorder,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    marginRight: 10,
    flexShrink: 0,
  },
  label: {
    fontSize: 13,
    color: C.grey,
    fontWeight: '600',
    width: 100,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  valueGreen: { color: C.white },
  valueAmber: { color: C.amber },
  editChip: {
    backgroundColor: C.amberBorder,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  editChipText: {
    fontSize: 11,
    color: C.amber,
    fontWeight: '700',
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VoiceConfirmCard() {
  const [countdown, setCountdown] = useState(AUTO_CONFIRM_SECS);
  const [phase, setPhase] = useState('listening'); // 'listening' | 'parsed' | 'confirmed'
  const slideAnim = useRef(new Animated.Value(500)).current;
  const micPulse  = useRef(new Animated.Value(1)).current;

  // Mic pulse animation
  useEffect(() => {
    if (phase !== 'listening') return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    // Auto-advance to parsed after 1.5s for demo
    const t = setTimeout(() => {
      pulse.stop();
      setPhase('parsed');
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    }, 1500);
    return () => { clearTimeout(t); pulse.stop(); };
  }, [phase]);

  // Countdown tick
  useEffect(() => {
    if (phase !== 'parsed') return;
    if (countdown <= 0) { setPhase('confirmed'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const handleConfirm = () => setPhase('confirmed');
  const handleEdit    = () => { setCountdown(AUTO_CONFIRM_SECS); setPhase('parsed'); };
  const handleReset   = () => { setPhase('listening'); setCountdown(AUTO_CONFIRM_SECS); slideAnim.setValue(500); };

  return (
    <View style={styles.root}>

      {/* ── Dimmed GPS background ── */}
      <View style={styles.bgGPS}>
        <View style={styles.bgHeader}>
          <Text style={styles.bgText}>Hole 7  ·  PAR 4  ·  385 yds</Text>
        </View>
        <View style={styles.bgMap} />
        <View style={styles.bgDistances}>
          <Text style={styles.bgDistNum}>148</Text>
          <Text style={[styles.bgDistNum, { fontSize: 36, color: C.white }]}>163</Text>
          <Text style={styles.bgDistNum}>179</Text>
        </View>
      </View>

      {/* ── Scrim ── */}
      <View style={styles.scrim} />

      {/* ── LISTENING STATE ── */}
      {phase === 'listening' && (
        <View style={styles.listeningOverlay}>
          <Animated.View style={[styles.micRing, { transform: [{ scale: micPulse }] }]} />
          <Animated.View style={[styles.micRing2, { transform: [{ scale: micPulse }], opacity: 0.4 }]} />
          <View style={styles.micCircle}>
            <Text style={styles.micEmoji}>🎙</Text>
          </View>
          <Text style={styles.listeningLabel}>Listening…</Text>
          <View style={styles.transcriptLive}>
            <Text style={styles.transcriptText}>Driver off the tee, 6-iron on…</Text>
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setPhase('parsed')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── PARSED STATE ── */}
      {phase === 'parsed' && (
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Transcript */}
          <View style={styles.transcriptBadge}>
            <Text style={styles.transcriptBadgeLabel}>HEARD</Text>
            <Text style={styles.transcriptBadgeText}>{TRANSCRIPT}</Text>
          </View>

          {/* Confidence chip */}
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceChip}>
              <Text style={styles.confidenceText}>● Confidence: High</Text>
            </View>
            <Text style={styles.holeTag}>Hole 7</Text>
          </View>

          {/* Field list */}
          <ScrollView
            style={styles.fieldList}
            contentContainerStyle={styles.fieldListContent}
            showsVerticalScrollIndicator={false}
          >
            {Object.values(PARSED).map((f, i) => <FieldRow key={i} field={f} />)}
          </ScrollView>

          {/* Action row */}
          <View style={styles.actionRow}>
            {/* Edit */}
            <TouchableOpacity style={styles.editBtn} onPress={handleReset}>
              <Text style={styles.editBtnText}>✏  Edit</Text>
            </TouchableOpacity>

            {/* Confirm + countdown */}
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <CircularCountdown seconds={countdown} total={AUTO_CONFIRM_SECS} />
              <Text style={styles.confirmBtnLabel}>CONFIRM</Text>
            </TouchableOpacity>
          </View>

          {/* Voice hint */}
          <Text style={styles.voiceHint}>Say "Yes" to confirm · "Edit" to change</Text>
        </Animated.View>
      )}

      {/* ── CONFIRMED STATE ── */}
      {phase === 'confirmed' && (
        <View style={styles.confirmedOverlay}>
          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedCheck}>✓</Text>
            <Text style={styles.confirmedTitle}>Saved!</Text>
            <Text style={styles.confirmedSub}>Hole 7  ·  Par  ·  Score 4</Text>
            <Text style={styles.confirmedSub2}>Moving to Hole 8…</Text>
            <TouchableOpacity style={styles.undoBtn} onPress={handleReset}>
              <Text style={styles.undoBtnText}>Undo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.blueDeep,
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Fake GPS background ──
  bgGPS: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.blueDeep,
  },
  bgHeader: {
    height: 64,
    backgroundColor: C.blueDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgText: { color: C.bluePale, fontSize: 14, fontWeight: '600' },
  bgMap: {
    flex: 1,
    backgroundColor: '#2B4F2B',
    opacity: 0.4,
  },
  bgDistances: {
    height: 90,
    backgroundColor: C.blueDark,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bgDistNum: { fontSize: 28, fontWeight: '900', color: C.bluePale, opacity: 0.6 },

  // ── Scrim ──
  scrim: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.scrim,
  },

  // ── Listening overlay ──
  listeningOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micRing: {
    position: 'absolute',
    width: 130, height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: C.blue,
  },
  micRing2: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: C.blue,
  },
  micCircle: {
    width: 96, height: 96,
    borderRadius: 48,
    backgroundColor: C.blue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  micEmoji: { fontSize: 40 },
  listeningLabel: {
    marginTop: 20,
    fontSize: 20,
    color: C.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  transcriptLive: {
    marginTop: 12,
    backgroundColor: 'rgba(0,87,184,0.3)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  transcriptText: {
    color: C.bluePale,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.grey,
  },
  cancelBtnText: { color: C.grey, fontSize: 14, fontWeight: '600' },

  // ── Bottom sheet ──
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: C.sheet,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: C.sheetBorder,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '82%',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: C.grey,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 14,
    opacity: 0.5,
  },

  // ── Transcript badge ──
  transcriptBadge: {
    backgroundColor: 'rgba(0,87,184,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.blueDark,
  },
  transcriptBadgeLabel: {
    fontSize: 9,
    color: C.grey,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  transcriptBadgeText: {
    fontSize: 13,
    color: C.bluePale,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // ── Confidence + hole tag ──
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  confidenceChip: {
    flex: 1,
    backgroundColor: C.greenBg,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.greenBorder,
  },
  confidenceText: { fontSize: 12, color: C.green, fontWeight: '700' },
  holeTag: {
    marginLeft: 8,
    fontSize: 13,
    color: C.grey,
    fontWeight: '600',
  },

  // ── Field list ──
  fieldList: { maxHeight: 300 },
  fieldListContent: { paddingBottom: 4 },

  // ── Action row ──
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 12,
  },
  editBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: { fontSize: 16, color: C.white, fontWeight: '700' },
  confirmBtn: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    backgroundColor: C.blueDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.green,
  },
  confirmBtnLabel: {
    fontSize: 11,
    color: C.green,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },

  // ── Voice hint ──
  voiceHint: {
    textAlign: 'center',
    fontSize: 11,
    color: C.grey,
    marginTop: 10,
    fontStyle: 'italic',
  },

  // ── Confirmed overlay ──
  confirmedOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmedBadge: {
    backgroundColor: C.sheet,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: C.green,
    width: '80%',
  },
  confirmedCheck: {
    fontSize: 56,
    color: C.green,
    lineHeight: 64,
  },
  confirmedTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: C.white,
    marginTop: 4,
  },
  confirmedSub: {
    fontSize: 14,
    color: C.bluePale,
    marginTop: 6,
    fontWeight: '600',
  },
  confirmedSub2: {
    fontSize: 12,
    color: C.grey,
    marginTop: 4,
  },
  undoBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.grey,
  },
  undoBtnText: { color: C.grey, fontSize: 14, fontWeight: '600' },
});

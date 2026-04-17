/**
 * Full 18-hole scorecard — production version of approved mockup.
 * Allows editing any hole score.
 */
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useRoundStore } from '../../../src/store/roundStore';
import { ScoreBadge } from '../../../src/components/ScoreBadge';
import { Button } from '../../../src/components/Button';
import { Colors, Spacing, Radius, MIN_TOUCH } from '../../../src/components/theme';
import { HoleScore, toPar } from '../../../src/types';

// ── Hole entry modal ──────────────────────────────────────────────────────────

function HoleModal({
  visible, hole, par, onSave, onClose,
}: {
  visible: boolean;
  hole: HoleScore;
  par: number;
  onSave: (updated: HoleScore) => void;
  onClose: () => void;
}) {
  const [strokes, setStrokes] = useState(hole.strokes ?? par);
  const [putts, setPutts]     = useState(hole.putts ?? 2);
  const [penalties, setPens]  = useState(hole.penalties ?? 0);
  const [fairway, setFairway] = useState(hole.fairway_hit);  // null | true | false
  const [sand, setSand]       = useState(hole.sand_save);

  const save = () => {
    onSave({ ...hole, strokes, putts, penalties, fairway_hit: fairway, sand_save: sand });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.handle} />

          <Text style={modal.title}>Hole {hole.hole_number} — PAR {par}</Text>

          {/* Strokes */}
          <View style={modal.row}>
            <Text style={modal.rowLabel}>Strokes</Text>
            <Stepper value={strokes} onChange={setStrokes} min={1} max={15} />
          </View>

          {/* Putts */}
          <View style={modal.row}>
            <Text style={modal.rowLabel}>Putts</Text>
            <Stepper value={putts} onChange={setPutts} min={0} max={9} />
          </View>

          {/* Penalties */}
          <View style={modal.row}>
            <Text style={modal.rowLabel}>Penalties</Text>
            <Stepper value={penalties} onChange={setPens} min={0} max={5} />
          </View>

          {/* Fairway — only for par 4/5 */}
          {par >= 4 && (
            <View style={modal.row}>
              <Text style={modal.rowLabel}>Fairway Hit</Text>
              <TriToggle value={fairway} onChange={setFairway} labels={['N/A', '✕', '✓']} values={[null, false, true]} />
            </View>
          )}

          {/* Sand save */}
          <View style={modal.row}>
            <Text style={modal.rowLabel}>Sand Save</Text>
            <TriToggle value={sand} onChange={setSand} labels={['N/A', '✕', '✓']} values={[null, false, true]} />
          </View>

          {/* Score preview */}
          <View style={modal.preview}>
            <ScoreBadge strokes={strokes} par={par} size="lg" />
            <Text style={modal.previewToPar}>{toPar(strokes, par)}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <Button label="Cancel" onPress={onClose} variant="ghost" style={{ flex: 1 }} />
            <Button label="Save" onPress={save} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Stepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <TouchableOpacity
        style={stepper.btn} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={stepper.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={stepper.value}>{value}</Text>
      <TouchableOpacity
        style={[stepper.btn, stepper.btnPlus]} onPress={() => onChange(Math.min(max, value + 1))}>
        <Text style={stepper.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const stepper = StyleSheet.create({
  btn:     { width: 44, height: 44, borderRadius: Radius.sm, backgroundColor: Colors.greyDark, justifyContent: 'center', alignItems: 'center' },
  btnPlus: { backgroundColor: Colors.blue },
  btnText: { fontSize: 20, fontWeight: '700', color: Colors.white },
  value:   { fontSize: 22, fontWeight: '800', color: Colors.white, minWidth: 32, textAlign: 'center' },
});

function TriToggle({ value, onChange, labels, values }: {
  value: any; onChange: (v: any) => void;
  labels: string[]; values: any[];
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {values.map((v, i) => (
        <TouchableOpacity
          key={i}
          style={[toggle.btn, value === v && toggle.btnActive]}
          onPress={() => onChange(v)}
        >
          <Text style={[toggle.label, value === v && toggle.labelActive]}>{labels[i]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const toggle = StyleSheet.create({
  btn:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm, backgroundColor: Colors.greyDark, borderWidth: 1, borderColor: Colors.greyMid },
  btnActive:   { backgroundColor: Colors.blue, borderColor: Colors.blue },
  label:       { fontSize: 13, color: Colors.grey, fontWeight: '600' },
  labelActive: { color: Colors.white },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,18,40,0.75)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: Colors.greyDark, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: 36, borderTopWidth: 1, borderColor: Colors.greyMid },
  handle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.grey, alignSelf: 'center', marginBottom: Spacing.lg, opacity: 0.5 },
  title:   { fontSize: 18, fontWeight: '800', color: Colors.white, marginBottom: Spacing.lg },
  row:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.greyMid },
  rowLabel:{ fontSize: 15, color: Colors.white, fontWeight: '500' },
  preview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.lg },
  previewToPar: { fontSize: 24, fontWeight: '900', color: Colors.white },
});

// ── Scorecard table ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={sc.sectionHeader}>
      <Text style={sc.sectionLabel}>{label}</Text>
    </View>
  );
}

function TotalsRow({ holes, label }: { holes: HoleScore[]; label: string }) {
  const total     = holes.reduce((a, h) => a + (h.strokes ?? 0), 0);
  const totalPar  = holes.reduce((a, h) => a + h.par, 0);
  const totalPutts= holes.reduce((a, h) => a + (h.putts ?? 0), 0);
  const diff      = total - totalPar;
  const fhCount   = holes.filter(h => h.fairway_hit === true && h.par >= 4).length;
  const fhPoss    = holes.filter(h => h.par >= 4).length;
  const girCount  = holes.filter(h => h.gir).length;

  return (
    <View style={[sc.row, sc.totalsRow]}>
      <Text style={[sc.cell, sc.cellLabel, { fontWeight: '800', color: Colors.bluePale }]}>{label}</Text>
      <Text style={[sc.cell, { color: Colors.grey }]}>{totalPar}</Text>
      <View style={[sc.cell, { alignItems: 'center' }]}>
        <Text style={{ fontSize: 14, fontWeight: '900', color: Colors.white }}>{total || '—'}</Text>
        {total > 0 && <Text style={{ fontSize: 10, fontWeight: '700', color: diff < 0 ? Colors.red : diff > 0 ? Colors.blue : Colors.grey }}>{toPar(total, totalPar)}</Text>}
      </View>
      <Text style={[sc.cell, { color: Colors.grey, fontSize: 12 }]}>{totalPutts || '—'}</Text>
      <Text style={[sc.cell, { fontSize: 11, color: fhCount / fhPoss >= 0.5 ? Colors.green : Colors.amber }]}>{fhPoss > 0 ? `${Math.round(fhCount/fhPoss*100)}%` : '—'}</Text>
      <Text style={[sc.cell, { fontSize: 11, color: girCount / holes.length >= 0.5 ? Colors.green : Colors.amber }]}>{`${Math.round(girCount/holes.length*100)}%`}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Scorecard() {
  const round       = useRoundStore(s => s.round);
  const currentHole = useRoundStore(s => s.currentHole);
  const goToHole    = useRoundStore(s => s.goToHole);
  const saveHole    = useRoundStore(s => s.saveHoleScore);
  const finishRound = useRoundStore(s => s.finishRound);

  const [editingHole, setEditingHole] = useState<number | null>(null);

  if (!round) return null;

  const holes18: HoleScore[] = Array.from({ length: 18 }, (_, i) => {
    const courseHole = round.course?.holes?.[i];
    const existing   = round.holes.find(h => h.hole_number === i + 1);
    return existing ?? {
      hole_number: i + 1,
      par: courseHole?.par ?? 4,
      strokes: null, putts: null, fairway_hit: null, gir: null, penalties: 0, sand_save: null,
    };
  });

  const front9 = holes18.slice(0, 9);
  const back9  = holes18.slice(9);

  const totalScore = holes18.reduce((a, h) => a + (h.strokes ?? 0), 0);
  const totalPar   = holes18.reduce((a, h) => a + h.par, 0);

  const handleSave = async (updated: HoleScore) => {
    await saveHole(updated);
    setEditingHole(null);
  };

  const handleFinish = () => {
    Alert.alert('Finish Round?', 'This will save the round and calculate your score.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: async () => {
        await finishRound();
        router.replace('/(app)/round/summary');
      }},
    ]);
  };

  const editHole = editingHole ? holes18[editingHole - 1] : null;

  return (
    <SafeAreaView style={sc.safe}>
      {/* Header */}
      <View style={sc.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: MIN_TOUCH, justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, color: Colors.white }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={sc.courseTitle} numberOfLines={1}>{round.course?.name ?? 'Scorecard'}</Text>
          <Text style={sc.courseSub}>{round.tee_box} Tees · {new Date().toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: Spacing.sm }}>
          <Text style={{ color: Colors.blue, fontSize: 14, fontWeight: '700' }}>GPS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Column headers */}
        <View style={[sc.row, sc.headerRow]}>
          {['HO', 'PAR', 'SCORE', 'PUTTS', 'FH', 'GIR'].map(h => (
            <Text key={h} style={sc.colHeader}>{h}</Text>
          ))}
        </View>

        <SectionHeader label="FRONT 9" />
        {front9.map(h => (
          <TouchableOpacity
            key={h.hole_number}
            style={[sc.row, h.hole_number === currentHole && sc.rowCurrent]}
            onPress={() => { setEditingHole(h.hole_number); goToHole(h.hole_number); }}
          >
            <Text style={[sc.cell, sc.cellLabel]}>{h.hole_number}</Text>
            <Text style={[sc.cell, { color: Colors.grey, fontSize: 13 }]}>{h.par}</Text>
            <View style={sc.cell}><ScoreBadge strokes={h.strokes} par={h.par} size="sm" /></View>
            <Text style={[sc.cell, { color: Colors.grey, fontSize: 13 }]}>{h.putts ?? '—'}</Text>
            <Text style={sc.cell}>{h.par < 4 ? '—' : h.fairway_hit === null ? '—' : h.fairway_hit ? '●' : '○'}</Text>
            <Text style={sc.cell}>{h.gir === null ? '—' : h.gir ? '●' : '○'}</Text>
          </TouchableOpacity>
        ))}
        <TotalsRow holes={front9} label="OUT" />

        <SectionHeader label="BACK 9" />
        {back9.map(h => (
          <TouchableOpacity
            key={h.hole_number}
            style={[sc.row, h.hole_number === currentHole && sc.rowCurrent]}
            onPress={() => { setEditingHole(h.hole_number); goToHole(h.hole_number); }}
          >
            <Text style={[sc.cell, sc.cellLabel]}>{h.hole_number}</Text>
            <Text style={[sc.cell, { color: Colors.grey, fontSize: 13 }]}>{h.par}</Text>
            <View style={sc.cell}><ScoreBadge strokes={h.strokes} par={h.par} size="sm" /></View>
            <Text style={[sc.cell, { color: Colors.grey, fontSize: 13 }]}>{h.putts ?? '—'}</Text>
            <Text style={sc.cell}>{h.par < 4 ? '—' : h.fairway_hit === null ? '—' : h.fairway_hit ? '●' : '○'}</Text>
            <Text style={sc.cell}>{h.gir === null ? '—' : h.gir ? '●' : '○'}</Text>
          </TouchableOpacity>
        ))}
        <TotalsRow holes={back9} label="IN" />

        {/* Grand total */}
        <View style={sc.grandTotal}>
          <Text style={sc.gtLabel}>TOTAL</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={sc.gtScore}>{totalScore || '—'}</Text>
            {totalScore > 0 && (
              <Text style={[sc.gtToPar, { color: totalScore - totalPar < 0 ? Colors.red : totalScore - totalPar > 0 ? Colors.blue : Colors.grey }]}>
                {toPar(totalScore, totalPar)}
              </Text>
            )}
          </View>
        </View>

        <View style={{ padding: Spacing.lg }}>
          <Button label="Finish Round" onPress={handleFinish} fullWidth />
        </View>
      </ScrollView>

      {/* Hole entry modal */}
      {editHole && (
        <HoleModal
          visible={editingHole !== null}
          hole={editHole}
          par={editHole.par}
          onSave={handleSave}
          onClose={() => setEditingHole(null)}
        />
      )}
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.blueDeep },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.greyDark },
  courseTitle: { fontSize: 15, fontWeight: '800', color: Colors.white },
  courseSub:   { fontSize: 11, color: Colors.grey },

  sectionHeader: { backgroundColor: Colors.blueDeep, paddingHorizontal: Spacing.md, paddingVertical: 5 },
  sectionLabel:  { fontSize: 10, fontWeight: '800', color: Colors.grey, letterSpacing: 2 },

  headerRow: { backgroundColor: Colors.blueDeep, borderBottomWidth: 1, borderBottomColor: Colors.greyDark },
  colHeader: { flex: 1, fontSize: 9, fontWeight: '700', color: Colors.grey, letterSpacing: 1.5, textAlign: 'center', paddingVertical: 8 },

  row:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 2, minHeight: MIN_TOUCH, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.greyDark },
  rowCurrent: { borderLeftWidth: 3, borderLeftColor: Colors.blue, backgroundColor: Colors.greyDark },
  totalsRow:  { backgroundColor: Colors.blueDark, paddingVertical: 8 },
  cell:       { flex: 1, textAlign: 'center', fontSize: 13, color: Colors.white, alignItems: 'center', justifyContent: 'center' },
  cellLabel:  { fontSize: 12, color: Colors.grey },

  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.blueDark, margin: Spacing.md, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.blue },
  gtLabel: { fontSize: 11, fontWeight: '800', color: Colors.grey, letterSpacing: 2 },
  gtScore: { fontSize: 38, fontWeight: '900', color: Colors.white },
  gtToPar: { fontSize: 20, fontWeight: '800' },
});

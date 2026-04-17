import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getCourse } from '../../../src/lib/courseApi';
import { useAuthStore } from '../../../src/store/authStore';
import { useRoundStore } from '../../../src/store/roundStore';
import { Course } from '../../../src/types';
import { Button } from '../../../src/components/Button';
import { Colors, Spacing, Radius, MIN_TOUCH } from '../../../src/components/theme';

export default function RoundSetup() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const session      = useAuthStore(s => s.session);
  const startRound   = useRoundStore(s => s.startRound);

  const [course, setCourse]       = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState('');
  const [loading, setLoading]     = useState(true);
  const [starting, setStarting]   = useState(false);

  useEffect(() => {
    getCourse(courseId).then(c => {
      setCourse(c);
      setSelectedTee(c.tee_boxes[0]?.name ?? '');
      setLoading(false);
    });
  }, [courseId]);

  const handleStart = async () => {
    if (!course || !session) return;
    setStarting(true);
    try {
      await startRound(course, selectedTee, session.user.id);
      router.replace('/(app)/round/gps');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not start round.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={Colors.blue} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Round Setup</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Course info */}
        <View style={styles.courseCard}>
          <Text style={styles.courseName}>{course?.name}</Text>
          <Text style={styles.courseLocation}>{course?.location}</Text>
        </View>

        {/* Tee box selection */}
        <Text style={styles.sectionLabel}>SELECT TEES</Text>
        <View style={styles.teeGrid}>
          {course?.tee_boxes.map(tee => (
            <TouchableOpacity
              key={tee.name}
              style={[styles.teeCard, selectedTee === tee.name && styles.teeCardSelected]}
              onPress={() => setSelectedTee(tee.name)}
            >
              <View style={[styles.teeColourDot, { backgroundColor: tee.colour }]} />
              <Text style={styles.teeName}>{tee.name}</Text>
              <Text style={styles.teeYardage}>{tee.yardage} yds</Text>
              <Text style={styles.teeRating}>{tee.rating} / {tee.slope}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Round details summary */}
        {selectedTee && course && (
          <View style={styles.summaryCard}>
            {(() => {
              const tee = course.tee_boxes.find(t => t.name === selectedTee)!;
              return (
                <>
                  <Row label="Course"  value={course.name} />
                  <Row label="Tees"    value={`${tee.name} (${tee.yardage} yds)`} />
                  <Row label="Rating"  value={`${tee.rating}`} />
                  <Row label="Slope"   value={`${tee.slope}`} />
                  <Row label="Holes"   value="18" />
                </>
              );
            })()}
          </View>
        )}

        <Button
          label="Start Round"
          onPress={handleStart}
          loading={starting}
          fullWidth
          style={{ marginTop: Spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: Colors.grey, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.blueDeep },
  scroll: { padding: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  back:     { width: 40, height: MIN_TOUCH, justifyContent: 'center' },
  backText: { fontSize: 28, color: Colors.white },
  title:    { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: Colors.white },

  courseCard: {
    backgroundColor: Colors.greyDark, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.blue,
  },
  courseName:     { fontSize: 18, fontWeight: '800', color: Colors.white },
  courseLocation: { fontSize: 13, color: Colors.grey, marginTop: 4 },

  sectionLabel: {
    fontSize: 10, color: Colors.grey, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: Spacing.sm,
  },
  teeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  teeCard: {
    flex: 1, minWidth: 100,
    backgroundColor: Colors.greyDark, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.greyMid,
    alignItems: 'center',
  },
  teeCardSelected: { borderColor: Colors.blue, backgroundColor: Colors.greyMid },
  teeColourDot: { width: 16, height: 16, borderRadius: 8, marginBottom: 6 },
  teeName:    { fontSize: 15, fontWeight: '700', color: Colors.white },
  teeYardage: { fontSize: 12, color: Colors.grey, marginTop: 2 },
  teeRating:  { fontSize: 11, color: Colors.grey },

  summaryCard: {
    backgroundColor: Colors.greyDark, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.greyMid,
  },
});

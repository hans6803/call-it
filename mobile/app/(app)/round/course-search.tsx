import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { searchCourses } from '../../../src/lib/courseApi';
import { Course } from '../../../src/types';
import { Colors, Spacing, Radius, MIN_TOUCH } from '../../../src/components/theme';

export default function CourseSearch() {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchCourses(query.trim());
        setResults(r); setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Course</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Course name or city…"
          placeholderTextColor={Colors.grey}
          style={styles.searchInput}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 6 }}>
            <Text style={{ color: Colors.grey, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator color={Colors.blue} style={{ marginTop: Spacing.lg }} />}

      <FlatList
        data={results}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          searched && !loading ? (
            <Text style={styles.empty}>No courses found for "{query}"</Text>
          ) : !searched ? (
            <Text style={styles.hint}>Search by course name or location</Text>
          ) : null
        }
        renderItem={({ item: course }) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() => router.push({ pathname: '/(app)/round/setup', params: { courseId: course.id, courseName: course.name } })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseLocation}>{course.location}</Text>
            </View>
            <Text style={styles.courseArrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.blueDeep },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  back:     { width: 40, height: MIN_TOUCH, justifyContent: 'center' },
  backText: { fontSize: 28, color: Colors.white },
  title:    { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: Colors.white },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.greyDark, borderRadius: Radius.md,
    marginHorizontal: Spacing.lg, paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.greyMid,
    marginBottom: Spacing.md,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: Colors.white, fontSize: 16, paddingVertical: 14 },

  list:  { paddingHorizontal: Spacing.lg },
  empty: { color: Colors.grey, textAlign: 'center', marginTop: Spacing.xl, fontSize: 14 },
  hint:  { color: Colors.grey, textAlign: 'center', marginTop: Spacing.xxl, fontSize: 14 },

  courseCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.greyDark, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.greyMid, minHeight: MIN_TOUCH,
  },
  courseName:     { fontSize: 15, fontWeight: '700', color: Colors.white },
  courseLocation: { fontSize: 12, color: Colors.grey, marginTop: 2 },
  courseArrow:    { fontSize: 22, color: Colors.grey },
});

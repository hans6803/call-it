/**
 * Active round state — persisted across the in-round session via Zustand.
 * Synced to Supabase on each hole save.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { calcDifferential, calcHandicapIndex } from '../lib/handicap';
import { Course, HoleScore, Round, getScoreName } from '../types';

interface RoundState {
  round: Round | null;
  currentHole: number;   // 1-indexed

  // Actions
  startRound: (course: Course, teeBox: string, userId: string) => Promise<Round>;
  saveHoleScore: (score: HoleScore) => Promise<void>;
  advanceHole: () => void;
  goToHole: (n: number) => void;
  finishRound: () => Promise<void>;
  clearRound: () => void;
}

export const useRoundStore = create<RoundState>((set, get) => ({
  round: null,
  currentHole: 1,

  startRound: async (course, teeBox, userId) => {
    // Upsert course so the foreign key is satisfied
    await supabase.from('courses').upsert({
      id: course.id,
      name: course.name,
      location: course.location,
      country: course.country,
      tee_boxes: course.tee_boxes,
      holes: course.holes,
      source_id: course.source_id,
    }, { onConflict: 'id' });

    // Create round record in Supabase
    const { data, error } = await supabase
      .from('rounds')
      .insert({
        user_id: userId,
        course_id: course.id,
        tee_box: teeBox,
        date: new Date().toISOString().split('T')[0],
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    const round: Round = {
      ...data,
      course,
      holes: [],
    };

    set({ round, currentHole: 1 });
    return round;
  },

  saveHoleScore: async (score) => {
    const { round } = get();
    if (!round) return;

    const enriched: HoleScore = {
      ...score,
      score_name: score.strokes != null
        ? getScoreName(score.strokes, score.par)
        : undefined,
      gir: score.strokes != null
        ? computeGIR(score.strokes, score.par, score.putts ?? 0)
        : null,
    };

    // Upsert into Supabase
    const { error } = await supabase.from('hole_scores').upsert({
      round_id: round.id,
      hole_number: score.hole_number,
      par: score.par,
      strokes: score.strokes,
      putts: score.putts,
      fairway_hit: score.fairway_hit,
      gir: enriched.gir,
      penalties: score.penalties,
      sand_save: score.sand_save,
      score_name: enriched.score_name,
    }, { onConflict: 'round_id,hole_number' });

    if (error) throw error;

    // Update local state
    set(state => {
      if (!state.round) return state;
      const holes = [...state.round.holes];
      const idx = holes.findIndex(h => h.hole_number === score.hole_number);
      if (idx >= 0) holes[idx] = enriched;
      else holes.push(enriched);

      const total = holes.reduce((a, h) => a + (h.strokes ?? 0), 0);
      return { round: { ...state.round, holes, total_score: total } };
    });
  },

  advanceHole: () => {
    set(state => ({
      currentHole: Math.min(state.currentHole + 1, 18),
    }));
  },

  goToHole: (n) => set({ currentHole: Math.max(1, Math.min(n, 18)) }),

  finishRound: async () => {
    const { round } = get();
    if (!round) return;

    const total = round.holes.reduce((a, h) => a + (h.strokes ?? 0), 0);

    // Only calculate a differential for a complete 18-hole round with all strokes entered
    const holesWithStrokes = round.holes.filter(h => h.strokes != null && h.strokes > 0);
    const tee = round.course?.tee_boxes.find(t => t.name === round.tee_box);
    const differential = tee && holesWithStrokes.length === 18
      ? calcDifferential(total, tee.rating, tee.slope)
      : null;

    await supabase
      .from('rounds')
      .update({ status: 'complete', total_score: total, differential })
      .eq('id', round.id);

    // Recalculate handicap index from last 20 complete rounds
    if (differential !== null) {
      const { data: recentRounds } = await supabase
        .from('rounds')
        .select('differential')
        .eq('user_id', round.user_id)
        .eq('status', 'complete')
        .not('differential', 'is', null)
        .order('date', { ascending: false })
        .limit(20);

      const diffs = (recentRounds ?? []).map((r: any) => r.differential as number);
      const newIndex = calcHandicapIndex(diffs);

      if (newIndex !== null) {
        await supabase
          .from('users')
          .update({ handicap_index: newIndex })
          .eq('id', round.user_id);

        await supabase.from('handicap_history').insert({
          user_id: round.user_id,
          handicap_index_after: newIndex,
          differential,
          round_id: round.id,
        });
      }

      // Refresh auth store profile so HCP badge updates immediately
      await useAuthStore.getState().refreshProfile();
    }

    set(state => ({
      round: state.round ? { ...state.round, status: 'complete', total_score: total } : null,
    }));
  },

  clearRound: () => set({ round: null, currentHole: 1 }),
}));

function computeGIR(strokes: number, par: number, putts: number): boolean {
  // GIR = reached green in (par - 2) strokes or fewer
  const approachShots = strokes - putts;
  return approachShots <= par - 2;
}

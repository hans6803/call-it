// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string;
  ghin_number: string | null;
  handicap_index: number | null;
  home_course_id: string | null;
  created_at: string;
}

export interface TeeBox {
  name: string;       // "Blue", "White", "Red"
  colour: string;
  rating: number;
  slope: number;
  yardage: number;
}

export interface HoleData {
  number: number;
  par: number;
  yardage: number;
  stroke_index: number;
  coordinates?: {
    tee: { lat: number; lng: number };
    green_centre: { lat: number; lng: number };
    green_front: { lat: number; lng: number };
    green_back: { lat: number; lng: number };
    hazards: Hazard[];
  };
}

export interface Hazard {
  label: string;
  type: 'bunker' | 'water' | 'ob' | 'dogleg' | 'layup';
  distance_from_tee?: number;
  coordinates?: { lat: number; lng: number };
}

export interface Course {
  id: string;
  name: string;
  location: string;
  country: string;
  tee_boxes: TeeBox[];
  holes: HoleData[];
  source_id: string;
}

export type RoundStatus = 'active' | 'complete' | 'abandoned';

export interface Round {
  id: string;
  user_id: string;
  course_id: string;
  course?: Course;
  tee_box: string;
  date: string;
  status: RoundStatus;
  total_score: number | null;
  differential: number | null;
  posted_to_ghin: boolean;
  holes: HoleScore[];
}

export interface HoleScore {
  id?: string;
  round_id?: string;
  hole_number: number;
  par: number;
  strokes: number | null;
  putts: number | null;
  fairway_hit: boolean | null;   // null = par 3 / N/A
  gir: boolean | null;
  penalties: number;
  sand_save: boolean | null;
  score_name?: ScoreName;
}

export type ScoreName =
  | 'condor' | 'albatross' | 'eagle' | 'birdie'
  | 'par' | 'bogey' | 'double_bogey' | 'triple_bogey' | 'other';

export interface ClubEntry {
  id: string;
  user_id: string;
  club_name: string;
  avg_distance: number;
  shot_count: number;
}

export interface RoundStats {
  fairways_hit: number;
  fairways_hit_pct: number;
  gir: number;
  gir_pct: number;
  putts_total: number;
  putts_per_hole: number;
  penalties_total: number;
  sand_saves: number;
  sand_saves_attempted: number;
}

// ─── GPS Types ────────────────────────────────────────────────────────────────

export interface GreenDistances {
  front: number;
  centre: number;
  back: number;
}

export interface PlayerLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

// ─── Score helpers ────────────────────────────────────────────────────────────

export function getScoreName(strokes: number, par: number): ScoreName {
  const diff = strokes - par;
  if (diff <= -3) return 'albatross';
  if (diff === -2) return 'eagle';
  if (diff === -1) return 'birdie';
  if (diff === 0)  return 'par';
  if (diff === 1)  return 'bogey';
  if (diff === 2)  return 'double_bogey';
  if (diff === 3)  return 'triple_bogey';
  return 'other';
}

export function scoreLabel(name: ScoreName): string {
  const map: Record<ScoreName, string> = {
    condor: 'Condor', albatross: 'Albatross', eagle: 'Eagle', birdie: 'Birdie',
    par: 'Par', bogey: 'Bogey', double_bogey: 'Double', triple_bogey: 'Triple', other: 'Other',
  };
  return map[name] ?? name;
}

export function toPar(score: number, par: number): string {
  const d = score - par;
  if (d === 0) return 'E';
  return d > 0 ? `+${d}` : `${d}`;
}

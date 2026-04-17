/**
 * Golf Course API integration layer.
 * PM to supply COURSE_API_KEY and COURSE_API_BASE_URL in .env.
 *
 * Swap out the mock implementation below for real API calls once credentials
 * are available. The interface contract (Course, HoleData etc.) stays the same.
 */

import Constants from 'expo-constants';
import { Course, HoleData } from '../types';

const BASE_URL: string =
  Constants.expoConfig?.extra?.courseApiBaseUrl ??
  process.env.EXPO_PUBLIC_COURSE_API_URL ?? '';
const API_KEY: string =
  Constants.expoConfig?.extra?.courseApiKey ??
  process.env.EXPO_PUBLIC_COURSE_API_KEY ?? '';

// ── Mock data (used until API key is supplied) ────────────────────────────────

const MOCK_COURSES: Course[] = [
  {
    id: 'mock-1',
    name: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, CA',
    country: 'US',
    source_id: 'pb-001',
    tee_boxes: [
      { name: 'Blue',  colour: '#0057B8', rating: 74.7, slope: 145, yardage: 6828 },
      { name: 'White', colour: '#FFFFFF', rating: 72.1, slope: 136, yardage: 6395 },
      { name: 'Red',   colour: '#E84040', rating: 69.8, slope: 126, yardage: 5197 },
    ],
    holes: generateMockHoles(),
  },
  {
    id: 'mock-2',
    name: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    country: 'US',
    source_id: 'aug-001',
    tee_boxes: [
      { name: 'Masters', colour: '#1DB954', rating: 76.2, slope: 148, yardage: 7435 },
      { name: 'Member',  colour: '#FFFFFF', rating: 73.1, slope: 140, yardage: 6905 },
    ],
    holes: generateMockHoles([4,5,4,3,4,3,4,5,4, 4,4,3,5,4,5,3,4,4]),
  },
  {
    id: 'mock-3',
    name: 'St Andrews Links (Old Course)',
    location: 'St Andrews, Scotland',
    country: 'GB',
    source_id: 'sta-001',
    tee_boxes: [
      { name: 'Championship', colour: '#FFFFFF', rating: 73.1, slope: 132, yardage: 6721 },
      { name: 'Medal',        colour: '#F5A623', rating: 71.6, slope: 128, yardage: 6566 },
    ],
    holes: generateMockHoles(),
  },
];

function generateMockHoles(pars?: number[]): HoleData[] {
  const defaultPars = [4,5,4,4,3,5,4,4,4, 4,3,5,4,4,5,3,4,4];
  const yardages =    [381,502,388,327,166,516,385,431,464, 446,380,202,445,573,397,403,178,543];
  return Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: (pars ?? defaultPars)[i],
    yardage: yardages[i],
    stroke_index: i + 1,
    coordinates: {
      tee:          { lat: 36.567 + i * 0.002, lng: -121.950 + i * 0.001 },
      green_centre: { lat: 36.567 + i * 0.002 + 0.0015, lng: -121.950 + i * 0.001 + 0.0008 },
      green_front:  { lat: 36.567 + i * 0.002 + 0.0013, lng: -121.950 + i * 0.001 + 0.0008 },
      green_back:   { lat: 36.567 + i * 0.002 + 0.0017, lng: -121.950 + i * 0.001 + 0.0008 },
      hazards: [
        { label: 'Bunker L',  type: 'bunker', distance_from_tee: 180 + i * 3 },
        { label: 'Water R',   type: 'water',  distance_from_tee: 220 + i * 2 },
        { label: 'Bunker F',  type: 'bunker', distance_from_tee: (pars?.[i] ?? defaultPars[i]) === 3 ? 130 : 80 },
      ],
    },
  }));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function searchCourses(query: string): Promise<Course[]> {
  if (!BASE_URL || !API_KEY) {
    // Return mock data filtered by query
    const q = query.toLowerCase();
    return MOCK_COURSES.filter(
      c => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    );
  }

  const res = await fetch(
    `${BASE_URL}/courses/search?q=${encodeURIComponent(query)}&limit=20`,
    { headers: { 'x-api-key': API_KEY } },
  );
  if (!res.ok) throw new Error(`Course search failed: ${res.status}`);
  const data = await res.json();
  return data.courses as Course[];
}

export async function getCourse(courseId: string): Promise<Course> {
  if (!BASE_URL || !API_KEY) {
    const found = MOCK_COURSES.find(c => c.id === courseId);
    if (!found) throw new Error('Course not found');
    return found;
  }

  const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
    headers: { 'x-api-key': API_KEY },
  });
  if (!res.ok) throw new Error(`Get course failed: ${res.status}`);
  return (await res.json()) as Course;
}

/** Calculate distances from player position to green targets (metres → yards).
 *  Falls back to the hole's stated yardage when the player is clearly not on
 *  the course (e.g. using mock data from a different location). */
export function calcDistances(
  playerLat: number, playerLng: number, hole: HoleData,
): { front: number; centre: number; back: number } {
  if (!hole.coordinates) {
    // No coordinates at all — use stated yardage
    const c = hole.yardage;
    return { front: c - 15, centre: c, back: c + 15 };
  }

  const centre = haversineYards(playerLat, playerLng, hole.coordinates.green_centre.lat, hole.coordinates.green_centre.lng);

  // If player is more than 800 yards from the green centre they're not on this
  // hole — return the hole's stated yardage as a sensible placeholder.
  if (centre > 800) {
    const c = hole.yardage;
    return { front: c - 15, centre: c, back: c + 15 };
  }

  return {
    front:  haversineYards(playerLat, playerLng, hole.coordinates.green_front.lat,  hole.coordinates.green_front.lng),
    centre,
    back:   haversineYards(playerLat, playerLng, hole.coordinates.green_back.lat,   hole.coordinates.green_back.lng),
  };
}

export function hazardDistances(
  playerLat: number, playerLng: number, hole: HoleData,
): Array<{ label: string; type: string; distance: number }> {
  if (!hole.coordinates) return [];
  return hole.coordinates.hazards
    .filter(h => h.coordinates)
    .map(h => ({
      label: h.label,
      type: h.type,
      distance: haversineYards(playerLat, playerLng, h.coordinates!.lat, h.coordinates!.lng),
    }))
    .sort((a, b) => a.distance - b.distance);
}

function haversineYards(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // metres
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const metres = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(metres * 1.09361);
}

function toRad(deg: number) { return (deg * Math.PI) / 180; }

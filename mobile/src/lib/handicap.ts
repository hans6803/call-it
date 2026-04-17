/**
 * World Handicap System (WHS) differential and index calculation.
 * Internal / unofficial — not a substitute for GHIN.
 */

export function calcDifferential(
  adjustedGrossScore: number,
  courseRating: number,
  slopeRating: number,
): number {
  return parseFloat(
    (((adjustedGrossScore - courseRating - 0) * 113) / slopeRating).toFixed(1),
  );
}

/**
 * Calculate handicap index from the best 8 of the last 20 differentials.
 * Returns null if fewer than 3 differentials available.
 */
export function calcHandicapIndex(differentials: number[]): number | null {
  if (differentials.length < 3) return null;

  const sorted  = [...differentials].sort((a, b) => a - b);
  const count   = sorted.length;
  const useCount = count >= 20 ? 8 : USE_TABLE[count] ?? null;
  if (useCount === null) return null;

  const best = sorted.slice(0, useCount);
  const avg  = best.reduce((a, b) => a + b, 0) / best.length;
  return parseFloat((avg * 0.96).toFixed(1));
}

// WHS table: rounds available → differentials to use
const USE_TABLE: Record<number, number> = {
  3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2,
  9: 3, 10: 3, 11: 3, 12: 4, 13: 4, 14: 4,
  15: 5, 16: 5, 17: 6, 18: 6, 19: 7,
};

/** Equitable Stroke Control — cap per-hole score for handicap purposes. */
export function escCap(strokes: number, par: number, courseHandicap: number): number {
  let maxStrokes: number;
  if (courseHandicap <= 9)       maxStrokes = par + 2;
  else if (courseHandicap <= 19) maxStrokes = par + 3;
  else if (courseHandicap <= 29) maxStrokes = par + 4;
  else if (courseHandicap <= 39) maxStrokes = par + 5;
  else                           maxStrokes = par + 6;
  return Math.min(strokes, maxStrokes);
}

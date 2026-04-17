/**
 * Call It — Apple Watch Face (web preview)
 * 45mm Series 9 form factor: 396 × 484 pts.
 * Primary screen + swipe-right hazard screen.
 */

import React, { useState } from 'react';

const C = {
  blue:      '#0057B8',
  blueDark:  '#003D82',
  blueDeep:  '#001A3A',
  blueLight: '#4A8FE8',
  bluePale:  '#C8DFFF',
  white:     '#FFFFFF',
  grey:      '#6B8BAE',
  greyDim:   '#2A3F58',
  green:     '#1DB954',
  amber:     '#F5A623',
  red:       '#E84040',
  black:     '#000000',
};

const HOLE = { number: 7, par: 4, yds: 385 };
const DIST = { front: 148, centre: 163, back: 179 };
const SCORE = { strokes: 0, label: '—', toPar: null }; // current hole not yet played
const ROUND = { holesPlayed: 6, totalScore: -1 };

const HAZARDS = [
  { label: 'Bunker L',  dist: 112, type: 'bunker' },
  { label: 'Water R',   dist: 187, type: 'water'  },
  { label: 'Dogleg',    dist: 201, type: 'dogleg' },
  { label: 'Bunker F',  dist: 134, type: 'bunker' },
];

// Dot indicator for swipe screen
function PageDot({ active }) {
  return (
    <div style={{
      width: active ? 14 : 6,
      height: 6,
      borderRadius: 3,
      background: active ? C.white : C.grey,
      transition: 'width 0.2s, background 0.2s',
    }} />
  );
}

// ── Screen 1: Distances ───────────────────────────────────────────────────────

function DistanceScreen() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px 10px',
    }}>

      {/* Top: Hole info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, color: C.grey, letterSpacing: 2, fontWeight: 700 }}>HOLE</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: C.white, lineHeight: 1 }}>{HOLE.number}</div>
          <div style={{ fontSize: 11, color: C.grey, fontWeight: 600 }}>PAR {HOLE.par}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: C.grey, letterSpacing: 2, fontWeight: 700 }}>SCORE</div>
          <div style={{
            fontSize: 28, fontWeight: 900, lineHeight: 1,
            color: ROUND.totalScore < 0 ? C.green : ROUND.totalScore > 0 ? C.red : C.white,
          }}>
            {ROUND.totalScore === 0 ? 'E' : ROUND.totalScore > 0 ? `+${ROUND.totalScore}` : ROUND.totalScore}
          </div>
          <div style={{ fontSize: 10, color: C.grey }}>{ROUND.holesPlayed} holes</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: 1, background: C.greyDim }} />

      {/* Centre distance — hero number */}
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 10, color: C.grey, letterSpacing: 2, fontWeight: 700, marginBottom: 2 }}>CENTRE</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: C.white, lineHeight: 1, letterSpacing: -2 }}>
          {DIST.centre}
        </div>
        <div style={{ fontSize: 13, color: C.grey, fontWeight: 600 }}>yards</div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: 1, background: C.greyDim }} />

      {/* Front / Back row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: 8 }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 9, color: C.grey, letterSpacing: 1.5, fontWeight: 700 }}>FRONT</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.bluePale }}>{DIST.front}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: C.grey, letterSpacing: 1.5, fontWeight: 700 }}>BACK</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.bluePale }}>{DIST.back}</div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 2: Hazards ─────────────────────────────────────────────────────────

function HazardScreen() {
  const dotColor = { bunker: C.amber, water: C.blueLight, dogleg: C.grey, ob: C.red };
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '14px 16px 10px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.grey, letterSpacing: 2, fontWeight: 700 }}>HOLE {HOLE.number} · HAZARDS</div>
      </div>

      {/* Hazard rows */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {HAZARDS.map((h, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 8, padding: '8px 10px',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: dotColor[h.type] ?? C.grey,
              marginRight: 10, flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontSize: 14, color: C.white, fontWeight: 500 }}>{h.label}</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: C.white }}>{h.dist}</span>
            <span style={{ fontSize: 10, color: C.grey, marginLeft: 3, alignSelf: 'flex-end', marginBottom: 1 }}>yd</span>
          </div>
        ))}
      </div>

      {/* Distances recap */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        borderTop: `1px solid ${C.greyDim}`, paddingTop: 8, marginTop: 4,
      }}>
        {[['F', DIST.front], ['C', DIST.centre], ['B', DIST.back]].map(([k, v]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: C.grey, fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: k === 'C' ? C.white : C.bluePale }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen 3: Score entry ─────────────────────────────────────────────────────

function ScoreEntryScreen() {
  const [strokes, setStrokes] = useState(0);
  const diff = strokes === 0 ? null : strokes - HOLE.par;
  const label = strokes === 0 ? '—'
    : diff === -2 ? 'Eagle' : diff === -1 ? 'Birdie' : diff === 0 ? 'Par'
    : diff === 1  ? 'Bogey' : diff === 2  ? 'Double' : `+${diff}`;
  const labelColor = strokes === 0 ? C.grey
    : diff <= -1 ? C.green : diff === 0 ? C.white : diff === 1 ? C.amber : C.red;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 10px',
    }}>
      <div style={{ fontSize: 9, color: C.grey, letterSpacing: 2, fontWeight: 700, alignSelf: 'flex-start' }}>
        HOLE {HOLE.number} · SCORE
      </div>

      {/* Score display */}
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: C.white, lineHeight: 1 }}>
          {strokes === 0 ? '—' : strokes}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: labelColor, marginTop: 4 }}>{label}</div>
      </div>

      {/* +/- controls */}
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <button
          onClick={() => setStrokes(s => Math.max(0, s - 1))}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            background: C.greyDim, border: 'none',
            fontSize: 26, fontWeight: 800, color: C.white, cursor: 'pointer',
          }}>−</button>
        <button
          onClick={() => setStrokes(s => s + 1)}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            background: C.blue, border: 'none',
            fontSize: 26, fontWeight: 800, color: C.white, cursor: 'pointer',
          }}>+</button>
      </div>
      {strokes > 0 && (
        <button style={{
          width: '100%', height: 36, borderRadius: 10, marginTop: 6,
          background: C.green, border: 'none',
          fontSize: 13, fontWeight: 800, color: C.white, cursor: 'pointer', letterSpacing: 1,
        }}>SAVE ✓</button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const SCREENS = ['distances', 'hazards', 'score'];
const SCREEN_LABELS = ['Distances', 'Hazards', 'Score'];

export default function WatchFace() {
  const [screen, setScreen] = useState(0);

  // Watch dimensions: 45mm Series 9 = 396×484 logical px, scaled down
  const W = 198, H = 242; // half-scale for the preview frame
  const CORNER = 56; // proportional corner radius

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100%', gap: 20, padding: 20,
      background: '#0D0D14',
    }}>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#4A6A8A', letterSpacing: 2, fontWeight: 700 }}>
          APPLE WATCH · 45MM
        </div>
        <div style={{ fontSize: 14, color: '#6A8AAA', marginTop: 2 }}>
          {SCREEN_LABELS[screen]}
        </div>
      </div>

      {/* Watch shell */}
      <div style={{ position: 'relative' }}>
        {/* Digital crown */}
        <div style={{
          position: 'absolute', right: -10, top: '28%',
          width: 10, height: 36, borderRadius: '0 5px 5px 0',
          background: '#2A2A2A', border: '1px solid #3A3A3A',
          borderLeft: 'none',
        }} />
        {/* Side button */}
        <div style={{
          position: 'absolute', right: -10, top: '52%',
          width: 10, height: 24, borderRadius: '0 4px 4px 0',
          background: '#2A2A2A', border: '1px solid #3A3A3A',
          borderLeft: 'none',
        }} />

        {/* Watch body */}
        <div style={{
          width: W, height: H,
          borderRadius: CORNER,
          background: '#1A1A1A',
          border: '2px solid #333',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Screen */}
          <div style={{
            flex: 1,
            background: C.blueDeep,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Status bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '5px 12px 0',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 9, color: C.grey, fontWeight: 600 }}>9:41</span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ width: 16, height: 7, borderRadius: 2, border: `1px solid ${C.grey}`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 1, right: '20%', background: C.green, borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 8, color: C.grey }}>GPS</span>
              </div>
            </div>

            {/* Active screen */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {screen === 0 && <DistanceScreen />}
              {screen === 1 && <HazardScreen />}
              {screen === 2 && <ScoreEntryScreen />}
            </div>

            {/* Page dots */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 5,
              paddingBottom: 8, flexShrink: 0,
            }}>
              {SCREENS.map((_, i) => <PageDot key={i} active={i === screen} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Screen switcher (simulates Digital Crown / swipe) */}
      <div style={{ display: 'flex', gap: 8 }}>
        {SCREEN_LABELS.map((label, i) => (
          <button key={i} onClick={() => setScreen(i)} style={{
            padding: '7px 14px',
            background: screen === i ? C.blue : '#1E2A3A',
            border: screen === i ? 'none' : `1px solid #2A3A4A`,
            borderRadius: 20,
            color: screen === i ? C.white : C.grey,
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer', letterSpacing: 0.5,
          }}>{label}</button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#3A5A7A', fontStyle: 'italic' }}>
        Switch screens to simulate swipe / Digital Crown
      </div>
    </div>
  );
}

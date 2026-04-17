/**
 * Call It — Scorecard Screen (web preview)
 * Full 18-hole scorecard with two players, running totals, score badges.
 */

import React, { useState } from 'react';

const C = {
  blue:       '#0057B8',
  blueDark:   '#003D82',
  blueDeep:   '#002554',
  blueLight:  '#3A7FD5',
  bluePale:   '#D6E8FF',
  white:      '#FFFFFF',
  offWhite:   '#EAF2FF',
  grey:       '#8FA8C8',
  greyDark:   '#1A3050',
  greyMid:    '#223A58',
  text:       '#FFFFFF',
  // Score colours (golf convention)
  eagle:      '#F5C518',  // gold
  birdie:     '#E84040',  // red
  par:        'transparent',
  bogey:      '#2A6ADE',  // blue
  double:     '#0A2A6A',  // dark blue filled
  triple:     '#6A0A0A',  // dark red filled
  green:      '#1DB954',
  amber:      '#F5A623',
};

// ── Placeholder data ──────────────────────────────────────────────────────────

const COURSE = { name: 'Pebble Beach Golf Links', date: 'Sat 29 Mar 2026', tee: 'Blue' };

const HOLES = [
  // { hole, par, yds, p1score, p1putts, p1fh, p1gir, p2score, p2putts, p2fh, p2gir }
  { n:1,  par:4, yds:381, s1:4,  t1:2, fh1:true,  gi1:true,  s2:5,  t2:2, fh2:false, gi2:false },
  { n:2,  par:5, yds:502, s1:5,  t1:2, fh1:true,  gi1:true,  s2:6,  t2:3, fh2:true,  gi2:false },
  { n:3,  par:4, yds:388, s1:3,  t1:1, fh1:false, gi1:true,  s2:4,  t2:2, fh2:true,  gi2:true  },
  { n:4,  par:4, yds:327, s1:5,  t1:2, fh1:false, gi1:false, s2:4,  t2:2, fh2:true,  gi2:true  },
  { n:5,  par:3, yds:166, s1:3,  t1:2, fh1:null,  gi1:true,  s2:4,  t2:2, fh2:null,  gi2:false },
  { n:6,  par:5, yds:516, s1:4,  t1:1, fh1:true,  gi1:true,  s2:5,  t2:2, fh2:true,  gi2:true  },
  { n:7,  par:4, yds:385, s1:4,  t1:2, fh1:true,  gi1:true,  s2:6,  t2:3, fh2:false, gi2:false },
  { n:8,  par:4, yds:431, s1:5,  t1:2, fh1:false, gi1:false, s2:5,  t2:3, fh2:false, gi2:false },
  { n:9,  par:4, yds:464, s1:4,  t1:2, fh1:true,  gi1:true,  s2:5,  t2:2, fh2:true,  gi2:false },
  { n:10, par:4, yds:446, s1:4,  t1:2, fh1:true,  gi1:true,  s2:4,  t2:1, fh2:true,  gi2:true  },
  { n:11, par:4, yds:380, s1:5,  t1:3, fh1:false, gi1:false, s2:5,  t2:2, fh2:true,  gi2:false },
  { n:12, par:3, yds:202, s1:3,  t1:2, fh1:null,  gi1:true,  s2:3,  t2:1, fh2:null,  gi2:true  },
  { n:13, par:5, yds:445, s1:4,  t1:1, fh1:true,  gi1:true,  s2:6,  t2:2, fh2:false, gi2:false },
  { n:14, par:4, yds:573, s1:4,  t1:2, fh1:true,  gi1:true,  s2:5,  t2:3, fh2:true,  gi2:false },
  { n:15, par:4, yds:397, s1:5,  t1:2, fh1:false, gi1:false, s2:4,  t2:2, fh2:false, gi2:true  },
  { n:16, par:4, yds:403, s1:4,  t1:2, fh1:true,  gi1:true,  s2:4,  t2:2, fh2:true,  gi2:true  },
  { n:17, par:3, yds:178, s1:2,  t1:1, fh1:null,  gi1:true,  s2:3,  t2:1, fh2:null,  gi2:true  },
  { n:18, par:5, yds:543, s1:5,  t1:2, fh1:true,  gi1:true,  s2:6,  t2:3, fh2:false, gi2:false },
];

const PLAYERS = [
  { id: 0, name: 'J. Mitchell', hcp: 8,  scoreKey: 's1', puttKey: 't1', fhKey: 'fh1', girKey: 'gi1' },
  { id: 1, name: 'R. Carver',  hcp: 14, scoreKey: 's2', puttKey: 't2', fhKey: 'fh2', girKey: 'gi2' },
];

// ── Score badge logic ─────────────────────────────────────────────────────────

function scoreBadge(score, par) {
  const diff = score - par;
  if (diff <= -2) return { bg: C.eagle,  border: C.eagle,  color: '#000', shape: 'dbl-circle', label: score };
  if (diff === -1) return { bg: C.birdie, border: C.birdie, color: C.white, shape: 'circle',     label: score };
  if (diff === 0)  return { bg: 'transparent', border: 'transparent', color: C.white, shape: 'none', label: score };
  if (diff === 1)  return { bg: 'transparent', border: C.bogey,  color: C.white, shape: 'square',  label: score };
  if (diff === 2)  return { bg: C.double, border: C.double, color: C.white, shape: 'dbl-square', label: score };
  return              { bg: C.triple, border: C.triple, color: C.white, shape: 'dbl-square', label: score };
}

function ScoreBadge({ score, par }) {
  const b = scoreBadge(score, par);
  const isCircle = b.shape === 'circle' || b.shape === 'dbl-circle';
  const isSquare = b.shape === 'square' || b.shape === 'dbl-square';
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {b.shape === 'dbl-circle' && (
        <div style={{
          position: 'absolute',
          width: 28, height: 28, borderRadius: '50%',
          border: `2px solid ${C.eagle}`,
        }} />
      )}
      {b.shape === 'dbl-square' && (
        <div style={{
          position: 'absolute',
          width: 28, height: 28,
          border: `2px solid ${b.border}`,
          borderRadius: 3,
        }} />
      )}
      <div style={{
        width: 22, height: 22,
        borderRadius: isCircle ? '50%' : isSquare ? 3 : 0,
        background: b.bg,
        border: (isCircle || isSquare) ? `2px solid ${b.border}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: b.color }}>{b.label}</span>
      </div>
    </div>
  );
}

// ── Fairway / GIR dot ─────────────────────────────────────────────────────────

function Dot({ value }) {
  if (value === null) return <span style={{ color: C.grey, fontSize: 11 }}>—</span>;
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%',
      background: value ? C.green : C.grey,
      margin: '0 auto',
    }} />
  );
}

// ── Running total chip ────────────────────────────────────────────────────────

function ToPar({ val }) {
  const color = val < 0 ? C.birdie : val > 0 ? C.bogey : C.grey;
  const label = val === 0 ? 'E' : val > 0 ? `+${val}` : `${val}`;
  return <span style={{ fontSize: 11, fontWeight: 800, color }}>{label}</span>;
}

// ── Section row (front/back label) ────────────────────────────────────────────

function SectionHeader({ label }) {
  return (
    <tr>
      <td colSpan={10} style={{
        background: C.blueDeep,
        padding: '5px 10px',
        fontSize: 10, fontWeight: 800,
        color: C.grey, letterSpacing: 2,
        textTransform: 'uppercase',
      }}>{label}</td>
    </tr>
  );
}

// ── Totals row ────────────────────────────────────────────────────────────────

function TotalsRow({ holes, player, label }) {
  const totalPar   = holes.reduce((a, h) => a + h.par, 0);
  const totalScore = holes.reduce((a, h) => a + h[player.scoreKey], 0);
  const totalPutts = holes.reduce((a, h) => a + h[player.puttKey], 0);
  const fhPct = Math.round(holes.filter(h => h[player.fhKey] === true && h.par !== 3).length /
                            Math.max(holes.filter(h => h.par !== 3).length, 1) * 100);
  const girPct = Math.round(holes.filter(h => h[player.girKey]).length / holes.length * 100);

  return (
    <tr style={{ background: C.blueDark }}>
      <td style={{ ...td, fontWeight: 800, color: C.bluePale, fontSize: 11, padding: '8px 6px' }}>{label}</td>
      <td style={{ ...td, color: C.grey }}>{totalPar}</td>
      <td style={{ ...td }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: C.white }}>{totalScore}</span>
          <ToPar val={totalScore - totalPar} />
        </div>
      </td>
      <td style={{ ...td, color: C.grey, fontSize: 12 }}>{totalPutts}</td>
      <td style={{ ...td, fontSize: 10, color: fhPct >= 50 ? C.green : C.amber }}>{fhPct}%</td>
      <td style={{ ...td, fontSize: 10, color: girPct >= 50 ? C.green : C.amber }}>{girPct}%</td>
    </tr>
  );
}

// ── Hole row ──────────────────────────────────────────────────────────────────

function HoleRow({ hole, player, selected, onClick }) {
  const score = hole[player.scoreKey];
  const putts = hole[player.puttKey];
  const fh    = hole[player.fhKey];
  const gir   = hole[player.girKey];

  return (
    <tr
      onClick={onClick}
      style={{
        background: selected ? C.greyDark : hole.n % 2 === 0 ? C.greyMid : 'transparent',
        cursor: 'pointer',
        borderLeft: selected ? `3px solid ${C.blue}` : '3px solid transparent',
        transition: 'background 0.1s',
      }}
    >
      <td style={{ ...td, color: C.grey, fontSize: 12 }}>{hole.n}</td>
      <td style={{ ...td, color: C.grey, fontSize: 12 }}>{hole.par}</td>
      <td style={{ ...td }}><ScoreBadge score={score} par={hole.par} /></td>
      <td style={{ ...td, color: C.grey, fontSize: 12 }}>{putts}</td>
      <td style={{ ...td }}><Dot value={fh} /></td>
      <td style={{ ...td }}><Dot value={gir} /></td>
    </tr>
  );
}

const td = {
  padding: '9px 6px',
  textAlign: 'center',
  fontSize: 13,
  color: C.white,
  borderBottom: `1px solid rgba(255,255,255,0.05)`,
  whiteSpace: 'nowrap',
};

// ── Detail panel for selected hole ───────────────────────────────────────────

function HoleDetail({ hole, players }) {
  if (!hole) return null;
  return (
    <div style={{
      background: C.greyDark,
      borderTop: `2px solid ${C.blue}`,
      padding: '12px 14px',
      display: 'flex', gap: 10, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ fontSize: 10, color: C.grey, letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>
          HOLE {hole.n} — PAR {hole.par}
        </div>
        <div style={{ fontSize: 11, color: C.grey }}>{hole.yds} yds</div>
      </div>
      {players.map(p => {
        const score = hole[p.scoreKey];
        const diff  = score - hole.par;
        const label = diff === -2 ? 'Eagle' : diff === -1 ? 'Birdie' : diff === 0 ? 'Par' :
                      diff === 1 ? 'Bogey' : diff === 2 ? 'Double' : 'Triple+';
        return (
          <div key={p.id} style={{
            flex: 1, minWidth: 130,
            background: 'rgba(0,87,184,0.15)',
            borderRadius: 10, padding: '8px 10px',
            border: `1px solid rgba(0,87,184,0.3)`,
          }}>
            <div style={{ fontSize: 11, color: C.grey, fontWeight: 700, marginBottom: 6 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { k: 'Score',  v: `${score} (${label})` },
                { k: 'Putts',  v: hole[p.puttKey] },
                { k: 'FH',     v: hole[p.fhKey] === null ? '—' : hole[p.fhKey] ? '✓' : '✗' },
                { k: 'GIR',    v: hole[p.girKey] ? '✓' : '✗' },
              ].map(item => (
                <div key={item.k} style={{ textAlign: 'center', minWidth: 44 }}>
                  <div style={{ fontSize: 9, color: C.grey, letterSpacing: 1 }}>{item.k}</div>
                  <div style={{
                    fontSize: 14, fontWeight: 800,
                    color: item.k === 'FH' || item.k === 'GIR'
                      ? item.v === '✓' ? C.green : item.v === '—' ? C.grey : C.amber
                      : C.white,
                  }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Grand total banner ────────────────────────────────────────────────────────

function GrandTotal({ players }) {
  const totalPar = HOLES.reduce((a, h) => a + h.par, 0);
  return (
    <div style={{
      background: C.blueDark,
      borderTop: `2px solid ${C.blue}`,
      padding: '12px 14px',
      display: 'flex', gap: 10,
    }}>
      {players.map(p => {
        const total = HOLES.reduce((a, h) => a + h[p.scoreKey], 0);
        const diff  = total - totalPar;
        return (
          <div key={p.id} style={{
            flex: 1,
            background: 'rgba(0,87,184,0.2)',
            borderRadius: 12, padding: '10px 14px',
            border: `1px solid ${C.blue}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 10, color: C.grey, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>
                {p.name} · HCP {p.hcp}
              </div>
              <div style={{ fontSize: 11, color: C.grey }}>Total par {totalPar}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.white, lineHeight: 1 }}>{total}</div>
              <ToPar val={diff} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Scorecard() {
  const [activePlayer, setActivePlayer] = useState(0);
  const [selectedHole, setSelectedHole] = useState(7); // 1-indexed

  const player  = PLAYERS[activePlayer];
  const front9  = HOLES.slice(0, 9);
  const back9   = HOLES.slice(9, 18);
  const selHole = HOLES.find(h => h.n === selectedHole);

  const thStyle = {
    padding: '8px 6px',
    fontSize: 9, fontWeight: 700,
    color: C.grey, letterSpacing: 1.5,
    textAlign: 'center', whiteSpace: 'nowrap',
    borderBottom: `1px solid ${C.greyDark}`,
    position: 'sticky', top: 0,
    background: C.blueDeep, zIndex: 2,
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: C.blueDeep, color: C.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden', height: '100%',
    }}>

      {/* ── Header ── */}
      <div style={{ background: C.blueDeep, padding: '10px 14px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: C.grey, marginBottom: 1 }}>{COURSE.date} · {COURSE.tee} Tees</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.white, marginBottom: 8 }}>{COURSE.name}</div>

        {/* Player tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 0 }}>
          {PLAYERS.map((p, i) => {
            const total    = HOLES.reduce((a, h) => a + h[p.scoreKey], 0);
            const totalPar = HOLES.reduce((a, h) => a + h.par, 0);
            const diff     = total - totalPar;
            const active   = i === activePlayer;
            return (
              <button key={i} onClick={() => setActivePlayer(i)} style={{
                flex: 1, padding: '8px 10px',
                background: active ? C.blue : C.greyMid,
                border: 'none', borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: active ? C.white : C.grey }}>{p.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: C.white }}>{total}</span>
                  <ToPar val={diff} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable scorecard table ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['HO', 'PAR', 'SCORE', 'PUTTS', 'FH', 'GIR'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SectionHeader label="Front 9" />
            {front9.map(hole => (
              <HoleRow
                key={hole.n} hole={hole} player={player}
                selected={selectedHole === hole.n}
                onClick={() => setSelectedHole(hole.n === selectedHole ? null : hole.n)}
              />
            ))}
            <TotalsRow holes={front9} player={player} label="OUT" />

            <SectionHeader label="Back 9" />
            {back9.map(hole => (
              <HoleRow
                key={hole.n} hole={hole} player={player}
                selected={selectedHole === hole.n}
                onClick={() => setSelectedHole(hole.n === selectedHole ? null : hole.n)}
              />
            ))}
            <TotalsRow holes={back9} player={player} label="IN" />
          </tbody>
        </table>
      </div>

      {/* ── Selected hole detail ── */}
      {selHole && <HoleDetail hole={selHole} players={PLAYERS} />}

      {/* ── Grand totals ── */}
      <GrandTotal players={PLAYERS} />
    </div>
  );
}

/**
 * Call It — Voice Confirmation Card (web preview version)
 * Rendered as plain React/HTML for the browser mockup.
 * The authoritative RN version lives in /mockups/VoiceConfirmCard.jsx
 */

import React, { useState, useEffect } from 'react';

const C = {
  blue:         '#0057B8',
  blueDark:     '#003D82',
  blueDeep:     '#002554',
  blueLight:    '#3A7FD5',
  bluePale:     '#D6E8FF',
  white:        '#FFFFFF',
  grey:         '#8FA8C8',
  greyMid:      '#2A4A6A',
  text:         '#FFFFFF',
  green:        '#1DB954',
  greenBg:      'rgba(29,185,84,0.13)',
  greenBorder:  'rgba(29,185,84,0.35)',
  amber:        '#F5A623',
  amberBg:      'rgba(245,166,35,0.13)',
  amberBorder:  'rgba(245,166,35,0.4)',
  scrim:        'rgba(0,18,40,0.75)',
  sheet:        '#0A2040',
};

const TRANSCRIPT = '"Driver off the tee, 6-iron on, two putts, par."';

const PARSED = [
  { label: 'Hole',        value: '7',                    status: 'confirmed' },
  { label: 'Score',       value: '4 — Par',              status: 'confirmed' },
  { label: 'Strokes',     value: '4',                    status: 'confirmed' },
  { label: 'Putts',       value: '2',                    status: 'confirmed' },
  { label: 'Fairway Hit', value: 'Yes',                  status: 'confirmed' },
  { label: 'GIR',         value: 'Yes (on in 2)',        status: 'confirmed' },
  { label: 'Clubs',       value: 'Driver · 6-iron · Putter', status: 'confirmed' },
  { label: 'Penalties',   value: 'None',                 status: 'confirmed' },
  { label: 'Sand Save',   value: 'Tap to add',           status: 'ambiguous' },
];

const AUTO_CONFIRM_SECS = 60; // extended for preview screenshots

// ── Conic-gradient countdown ring ────────────────────────────────────────────

function Countdown({ seconds, total }) {
  const pct = Math.round((seconds / total) * 100);
  return (
    <div style={{
      width: 72, height: 72, borderRadius: '50%',
      background: `conic-gradient(${C.green} ${pct}%, #1E3A5F ${pct}%)`,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: C.blueDark,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{seconds}</span>
      </div>
    </div>
  );
}

// ── Parsed field row ──────────────────────────────────────────────────────────

function FieldRow({ field }) {
  const ok = field.status === 'confirmed';
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '9px 12px',
      borderRadius: 10,
      marginBottom: 5,
      border: `1px solid ${ok ? C.greenBorder : C.amberBorder}`,
      background: ok ? C.greenBg : C.amberBg,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: ok ? C.green : C.amber,
        flexShrink: 0, marginRight: 10,
      }} />
      <span style={{
        fontSize: 12, color: C.grey, fontWeight: 600,
        width: 96, flexShrink: 0,
      }}>{field.label}</span>
      <span style={{
        flex: 1, fontSize: 14, fontWeight: 700,
        color: ok ? C.white : C.amber,
      }}>{field.value}</span>
      {!ok && (
        <div style={{
          background: 'rgba(245,166,35,0.2)',
          border: `1px solid ${C.amberBorder}`,
          borderRadius: 6, padding: '2px 8px', marginLeft: 8,
        }}>
          <span style={{ fontSize: 11, color: C.amber, fontWeight: 700 }}>+ Add</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VoiceConfirmCard() {
  // phases: 'listening' → 'parsed' → 'confirmed'
  const [phase, setPhase]       = useState('parsed');
  const [countdown, setCd]      = useState(AUTO_CONFIRM_SECS);
  const [sheetY, setSheetY]     = useState(0);
  const [micScale, setMicScale] = useState(1);

  // Mic pulse while listening
  useEffect(() => {
    if (phase !== 'listening') return;
    let up = true;
    const id = setInterval(() => {
      setMicScale(s => { up = s >= 1.18 ? false : s <= 1.0 ? true : up; return up ? s + 0.03 : s - 0.03; });
    }, 40);
    const advance = setTimeout(() => { clearInterval(id); setMicScale(1); setPhase('parsed'); setSheetY(0); }, 1800);
    return () => { clearInterval(id); clearTimeout(advance); };
  }, [phase]);

  // Countdown while parsed
  useEffect(() => {
    if (phase !== 'parsed') return;
    if (countdown <= 0) { setPhase('confirmed'); return; }
    const id = setTimeout(() => setCd(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  const reset = () => { setPhase('listening'); setCd(AUTO_CONFIRM_SECS); setSheetY(500); };

  // ── Shared wrapper (GPS dim background + scrim) ───────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', height: '100%' }}>

      {/* Dimmed GPS bg */}
      <div style={{ position: 'absolute', inset: 0, background: C.blueDeep, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 56, background: C.blueDark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: C.bluePale, fontSize: 13, fontWeight: 600 }}>Hole 7  ·  PAR 4  ·  385 yds</span>
        </div>
        <div style={{ flex: 1, background: '#2B4F2B', opacity: 0.4 }} />
        <div style={{
          height: 80, background: C.blueDark, opacity: 0.6,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 32px',
        }}>
          {['148', '163', '179'].map((d, i) => (
            <span key={i} style={{ fontSize: i === 1 ? 34 : 26, fontWeight: 900, color: C.white, opacity: i === 1 ? 1 : 0.5 }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Scrim */}
      <div style={{ position: 'absolute', inset: 0, background: C.scrim }} />

      {/* ── LISTENING phase ───────────────────────────────────────────────── */}
      {phase === 'listening' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0,
        }}>
          {/* Pulse rings */}
          {[160, 130].map((sz, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: sz * micScale, height: sz * micScale,
              borderRadius: '50%',
              border: `2px solid ${C.blue}`,
              opacity: 0.3 + i * 0.1,
              transition: 'width 0.04s, height 0.04s',
            }} />
          ))}
          {/* Mic button */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: C.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42,
            boxShadow: `0 0 32px ${C.blue}`,
            transform: `scale(${micScale})`,
            transition: 'transform 0.04s',
            zIndex: 1,
          }}>🎙</div>
          <div style={{ height: 20 }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: 0.5 }}>Listening…</span>
          <div style={{ height: 12 }} />
          <div style={{
            background: 'rgba(0,87,184,0.28)', borderRadius: 10,
            padding: '8px 18px', maxWidth: '76%',
          }}>
            <span style={{ color: C.bluePale, fontSize: 13, fontStyle: 'italic' }}>
              Driver off the tee, 6-iron on…
            </span>
          </div>
          <div style={{ height: 28 }} />
          <button
            onClick={reset}
            style={{
              background: 'transparent', border: `1px solid ${C.grey}`,
              borderRadius: 20, padding: '8px 24px',
              color: C.grey, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
        </div>
      )}

      {/* ── PARSED phase (bottom sheet) ───────────────────────────────────── */}
      {phase === 'parsed' && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: C.sheet,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderTop: `1px solid #1E3A5F`,
          padding: '0 14px 18px',
          transform: `translateY(${sheetY}px)`,
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          maxHeight: '86%',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          {/* Drag handle */}
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: C.grey, opacity: 0.4,
            margin: '10px auto 14px',
          }} />

          {/* Transcript */}
          <div style={{
            background: 'rgba(0,87,184,0.18)',
            border: `1px solid ${C.blueDark}`,
            borderRadius: 10, padding: '10px 12px', marginBottom: 8,
          }}>
            <div style={{ fontSize: 9, color: C.grey, letterSpacing: 1.5, fontWeight: 700, marginBottom: 4 }}>HEARD</div>
            <div style={{ fontSize: 13, color: C.bluePale, fontStyle: 'italic', lineHeight: 1.4 }}>{TRANSCRIPT}</div>
          </div>

          {/* Confidence + hole tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              flex: 1, background: C.greenBg,
              border: `1px solid ${C.greenBorder}`,
              borderRadius: 6, padding: '5px 10px',
            }}>
              <span style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>● Confidence: High</span>
            </div>
            <span style={{ fontSize: 13, color: C.grey, fontWeight: 600 }}>Hole 7</span>
          </div>

          {/* Field rows */}
          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {PARSED.map((f, i) => <FieldRow key={i} field={f} />)}
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'stretch' }}>
            {/* Edit button */}
            <button
              onClick={reset}
              style={{
                flex: 1, height: 54,
                background: 'transparent',
                border: `2px solid ${C.blueLight}`,
                borderRadius: 14,
                color: C.white, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>✏ Edit</button>

            {/* Confirm + countdown */}
            <button
              onClick={() => setPhase('confirmed')}
              style={{
                flex: 1, height: 82,
                background: C.blueDark,
                border: `2px solid ${C.green}`,
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
              <Countdown seconds={countdown} total={AUTO_CONFIRM_SECS} />
              <span style={{ fontSize: 10, color: C.green, fontWeight: 800, letterSpacing: 2 }}>CONFIRM</span>
            </button>
          </div>

          {/* Voice hint */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: C.grey, fontStyle: 'italic' }}>
              Say "Yes" to confirm · "Edit" to change
            </span>
          </div>
        </div>
      )}

      {/* ── CONFIRMED phase ───────────────────────────────────────────────── */}
      {phase === 'confirmed' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: C.sheet,
            border: `2px solid ${C.green}`,
            borderRadius: 24, padding: '32px 28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            width: '78%', boxSizing: 'border-box',
          }}>
            <span style={{ fontSize: 58, color: C.green, lineHeight: 1 }}>✓</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: C.white, marginTop: 4 }}>Saved!</span>
            <span style={{ fontSize: 14, color: C.bluePale, fontWeight: 600 }}>Hole 7 · Par · Score 4</span>
            <span style={{ fontSize: 12, color: C.grey }}>Moving to Hole 8…</span>
            <button
              onClick={reset}
              style={{
                marginTop: 16, background: 'transparent',
                border: `1px solid ${C.grey}`,
                borderRadius: 20, padding: '8px 24px',
                color: C.grey, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Undo</button>
          </div>
        </div>
      )}
    </div>
  );
}

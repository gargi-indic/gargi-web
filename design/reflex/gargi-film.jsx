// Gargi Reflex — launch film. All choreography keyed to T / CUES.
const E = { enter: Easing.easeOutCubic, draw: Easing.easeInOutCubic, pop: Easing.easeOutBack };
const prog = (T, a, d, ease = E.enter) => ease(clamp((T - a) / d, 0, 1));
const win = (T, a, b, fi = 0.6, fo = 0.5) => Math.min(prog(T, a, fi), 1 - prog(T, b - fo, fo, E.draw));

const THEMES = {
  Paper: { bg: '#f4f1e9', ink: '#1d1c19', muted: '#66625a', faint: '#a39e92', line: '#d9d3c6', grid: 'rgba(29,28,25,0.05)', card: '#faf8f3', llm: '#3a70bb', rx: '#cf5d24', ho: '#8f8a80', inv: '#1d1c19', invInk: '#f4f1e9', invMuted: '#a39e92' },
  Ink: { bg: '#131311', ink: '#ede9df', muted: '#a09b90', faint: '#6b675f', line: '#34322d', grid: 'rgba(237,233,223,0.045)', card: '#1b1b18', llm: '#72a0e0', rx: '#ee8452', ho: '#8d887e', inv: '#ede9df', invInk: '#131311', invMuted: '#66625a' },
};
const SERIF = "'Newsreader', Georgia, serif";
const SANS = "'Hanken Grotesk', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const rgba = (hex, al) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${al})`; };
const hash = (k) => { let x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const QUERIES = [
  ['My card still hasn’t arrived', 'card_arrival'],
  ['Why do you need to verify me?', 'why_verify_identity'],
  ['I think someone used my card', 'compromised_card'],
  ['Top-up didn’t go through', 'top_up_failed'],
  ['What rate do you use for euros?', 'exchange_rate'],
  ['I was charged a fee at the shop', 'card_payment_fee_charged'],
  ['Lost my card on the train', 'lost_or_stolen_card'],
  ['Payment declined at checkout', 'declined_card_payment'],
  ['When will my new card come?', 'card_delivery_estimate'],
  ['The ATM charged me for cash', 'cash_withdrawal_charge'],
  ['My transfer hasn’t landed', 'transfer_not_received_by_recipient'],
  ['How do I verify my identity?', 'verify_my_identity'],
];

// demo-swap_rate data (Banking77 end-to-end demo)
const SERVED = [[328,0],[656,0],[984,0],[1312,0],[1640,0],[1968,0],[2296,0],[2624,0],[2952,0],[3280,0],[3608,0],[3936,0],[4264,0],[4592,0],[4920,0],[5248,0],[5576,0],[5904,0],[6232,0.0762],[6560,0.8171],[6888,0.8293],[7216,0.7988],[7544,0.8171],[7872,0.7652],[8200,0.7896],[8528,0.7896],[8856,0.7805],[9184,0.8384],[9512,0.8079],[9840,0.8049],[10168,0.7805],[10496,0.8018],[10824,0.8415],[11152,0.7652],[11480,0.7988],[11808,0.8476],[12136,0.814],[12464,0.8323],[12792,0.7835],[13082,0.8586]];
const HOLD = [[6560,0.88],[6888,0.8919],[7216,0.9138],[7544,0.8955],[7872,0.9167],[8200,0.9263],[8528,0.9358],[8856,0.9435],[9184,0.9478],[9512,0.9463],[9840,0.9509],[10168,0.9558],[10496,0.96],[10824,0.955],[11152,0.97],[11480,0.965],[11808,0.98],[12136,0.98],[12464,0.98],[12792,0.98],[13082,0.975]];
const XMAX = 13082;

function Tag({ route, P, size = 20 }) {
  const c = route === 'rx' ? P.rx : route === 'ho' ? P.ho : P.llm;
  const label = route === 'rx' ? 'REFLEX' : route === 'ho' ? 'HOLDOUT' : 'LLM';
  return <span style={{ font: `600 ${size}px ${MONO}`, letterSpacing: '0.06em', color: route === 'rx' ? P.bg : c, background: route === 'rx' ? c : 'transparent', border: `2px solid ${c}`, borderRadius: 6, padding: '3px 10px', minWidth: size * 5.6, textAlign: 'center', boxSizing: 'border-box', display: 'inline-block' }}>{label}</span>;
}

// Log stream: newest row on top, pushing older rows down.
function Stream({ T, P, start, interval, count, route, compact, x, y, w, maxRows = 8, rowH = 66 }) {
  const ents = [];
  for (let k = 0; k < count; k++) ents.push(prog(T, start + k * interval, 0.35));
  const rows = [];
  let below = 0;
  for (let k = count - 1; k >= 0; k--) {
    const e = ents[k];
    if (e > 0) {
      const op = e * clamp(maxRows - below, 0, 1);
      if (op > 0.01) {
        const r = route(k);
        const q = QUERIES[k % QUERIES.length];
        rows.push(
          <div key={k} style={{ position: 'absolute', left: 0, right: 0, top: below * rowH, height: rowH, opacity: op, display: 'grid', gridTemplateColumns: compact ? '150px minmax(0,1fr) 120px' : '110px minmax(0,1fr) 470px 150px 150px', alignItems: 'center', columnGap: 24, borderBottom: `1px solid ${P.line}`, transform: `translateY(${(1 - e) * -14}px)` }}>
            {compact ? null : <span style={{ font: `400 20px ${MONO}`, color: P.faint }}>{String(1040 + k * 7).padStart(5, '0')}</span>}
            {compact ? <Tag route={r} P={P} size={18} /> : <span style={{ font: `400 28px ${SANS}`, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q[0]}</span>}
            <span style={{ font: `400 ${compact ? 20 : 22}px ${MONO}`, color: P.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{compact ? q[1] : `→ ${q[1]}`}</span>
            {compact ? null : <Tag route={r} P={P} />}
            <span style={{ font: `500 ${compact ? 22 : 24}px ${MONO}`, color: r === 'rx' ? P.rx : P.llm, textAlign: 'right' }}>{r === 'rx' ? '5 ms' : '3,600 ms'}</span>
          </div>
        );
      }
    }
    below += e;
  }
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: maxRows * rowH }}>{rows}</div>;
}

function Scene({ o, children, style }) {
  return <div style={Object.assign({ position: 'absolute', inset: 0, opacity: o, display: o <= 0.001 ? 'none' : 'block' }, style)}>{children}</div>;
}

function Title({ T, at, P, children, sub, y = 150, size = 84 }) {
  const e = prog(T, at, 0.8);
  return <div style={{ position: 'absolute', left: 140, top: y, right: 140, opacity: e, transform: `translateY(${(1 - e) * 24}px)` }}>
    <div style={{ font: `400 ${size}px/1.05 ${SERIF}`, color: P.ink, letterSpacing: '-0.015em', textWrap: 'pretty' }}>{children}</div>
    {sub ? <div style={{ marginTop: 22, font: `400 30px/1.4 ${SANS}`, color: P.muted, maxWidth: 1180, opacity: prog(T, at + 0.4, 0.8), textWrap: 'pretty' }}>{sub}</div> : null}
  </div>;
}

/* 01 — the repeated call */
function Calls({ T, C, P }) {
  const S = C.Calls, o = win(T, S, C.Thesis + 0.4, 0.4, 0.8);
  const cam = 1 + 0.035 * clamp((T - S) / 7, 0, 1);
  return <Scene o={o}>
    <Title T={T} at={S + 0.2} P={P} sub="Routing, intent, moderation, extraction. Near-identical questions, thousands of times a day. Every one billed, every one waited on.">The same question, again.</Title>
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${cam})`, transformOrigin: '50% 80%' }}>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 452, display: 'grid', gridTemplateColumns: '110px minmax(0,1fr) 470px 150px 150px', columnGap: 24, font: `500 18px ${MONO}`, letterSpacing: '0.1em', color: P.faint, opacity: prog(T, S + 0.8, 0.6), borderBottom: `1px solid ${P.ink}`, paddingBottom: 12 }}>
        <span>CALL</span><span>INPUT</span><span>TYPED ANSWER</span><span>SERVED BY</span><span style={{ textAlign: 'right' }}>LATENCY</span>
      </div>
      <Stream T={T} P={P} start={S + 1.0} interval={0.42} count={20} route={(k) => 'llm'} x={140} y={500} w={1640} maxRows={7} />
    </div>
    <div style={{ position: 'absolute', right: 140, bottom: 70, font: `400 20px ${MONO}`, color: P.muted, opacity: prog(T, S + 3, 0.8) }}>3.6 s median · Vertex AI Gemini Flash, n=30 · Phase 0</div>
  </Scene>;
}

/* 02 — thesis */
function Thesis({ T, C, P }) {
  const S = C.Thesis, o = win(T, S + 0.3, C.Loop + 0.3, 0.5, 0.7);
  const line = (at, content) => { const e = prog(T, at, 0.9); return <div style={{ opacity: e, transform: `translateY(${(1 - e) * 30}px)`, font: `400 104px/1.12 ${SERIF}`, letterSpacing: '-0.02em', color: P.ink }}>{content}</div>; };
  return <Scene o={o}>
    <div style={{ position: 'absolute', left: 160, top: 250, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {line(S + 0.4, <span>Let the frontier labs build the <span style={{ color: P.llm, fontStyle: 'italic' }}>intelligence.</span></span>)}
      {line(S + 1.7, <span>You build the product.</span>)}
      {line(S + 3.0, <span>Gargi learns the <span style={{ color: P.rx, fontStyle: 'italic' }}>repetitive part.</span></span>)}
    </div>
    <div style={{ position: 'absolute', left: 160, top: 760, display: 'flex', gap: 28, alignItems: 'center', opacity: prog(T, S + 4.0, 0.8) }}>
      <span style={{ width: 60, height: 2, background: P.ink }}></span>
      <span style={{ font: `500 26px ${MONO}`, color: P.muted, letterSpacing: '0.08em' }}>GARGI REFLEX · AUTONOMOUS DISTILLATION FOR LLM DECISIONS</span>
    </div>
  </Scene>;
}

/* 03 — the loop */
const STEPS = [
  ['Collect', 'Every call goes to your LLM as today. Gargi logs the input and the typed answer.', 'teacher'],
  ['Train', 'A frozen sentence encoder plus one head per field. On CPU, in minutes.', 'teacher'],
  ['Prove', 'It tests the model on data it never trained on. No pass, no swap.', 'teacher'],
  ['Shadow', 'The model predicts next to the LLM on live traffic. Nothing user-visible changes.', 'shadow'],
  ['Swap', 'Calls where every field clears the confidence bar are served locally.', 'assist'],
  ['Watch', 'A holdout slice keeps asking the LLM. If agreement drops more than 5 points, the LLM takes back over.', 'assist'],
];
function Loop({ T, C, P }) {
  const S = C.Loop, o = win(T, S + 0.2, C.Swap + 0.3, 0.6, 0.6);
  const STEP = 1.55, t0 = S + 1.0;
  let pos = 0;
  for (let i = 1; i <= 6; i++) pos += prog(T, t0 + i * STEP - 0.55, 0.55, E.draw);
  const cx = 1350, cy = 600, R = 290;
  const ang = (p) => (-90 + p * 60) * Math.PI / 180;
  const ring = prog(T, S + 0.3, 1.2, E.draw);
  const stColor = (s) => s === 'assist' ? P.rx : s === 'shadow' ? P.ho : P.llm;
  const nodeCol = (i) => i === 0 ? P.llm : i === 4 ? P.rx : i === 5 ? P.ho : P.ink;
  const circ = 2 * Math.PI * R;
  const dot = [cx + R * Math.cos(ang(pos)), cy + R * Math.sin(ang(pos))];
  const driftO = prog(T, t0 + 5 * STEP + 0.6, 0.6) * (1 - prog(T, C.Swap - 0.2, 0.3));
  return <Scene o={o}>
    <div style={{ position: 'absolute', left: 140, top: 150, font: `500 22px ${MONO}`, letterSpacing: '0.1em', color: P.muted, opacity: prog(T, S + 0.3, 0.6) }}>WHAT IT AUTOMATES · EACH STEP A DATA SCIENTIST WOULD DO BY HAND</div>
    {STEPS.map((s, i) => {
      const d = Math.abs(pos - i), op = clamp(1 - d * 1.6, 0, 1) * prog(T, S + 0.6, 0.6);
      return <div key={i} style={{ position: 'absolute', left: 140, top: 330, width: 700, opacity: op, transform: `translateY(${(pos - i) * -40}px)` }}>
        <div style={{ font: `500 26px ${MONO}`, color: P.faint }}>{String(i + 1).padStart(2, '0')} / 06</div>
        <div style={{ font: `400 136px/1 ${SERIF}`, color: nodeCol(i) === P.ink ? P.ink : nodeCol(i), letterSpacing: '-0.02em', margin: '18px 0 30px' }}>{s[0]}.</div>
        <div style={{ font: `400 36px/1.4 ${SANS}`, color: P.ink, textWrap: 'pretty' }}>{s[1]}</div>
      </div>;
    })}
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={P.line} strokeWidth="2" strokeDasharray={`${circ * ring} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={P.ink} strokeWidth="2.5" strokeDasharray={`${circ * pos / 6} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} />
      {STEPS.map((s, i) => {
        const a = ang(i), nx = cx + R * Math.cos(a), ny = cy + R * Math.sin(a);
        const on = prog(T, S + 0.5 + i * 0.12, 0.5, E.pop);
        const active = clamp(1 - Math.abs(pos - i) * 1.4, 0, 1) || (i === 0 && pos > 5.6 ? 1 : 0);
        const lx = cx + (R + 62) * Math.cos(a), ly = cy + (R + 62) * Math.sin(a);
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        return <g key={i} opacity={on}>
          <circle cx={nx} cy={ny} r={14 + active * 8} fill={active > 0.5 ? nodeCol(i) : P.bg} stroke={nodeCol(i)} strokeWidth="2.5" />
          <text x={lx} y={ly + 9} textAnchor={anchor} style={{ font: `600 24px ${MONO}`, letterSpacing: '0.08em' }} fill={active > 0.5 ? P.ink : P.muted}>{s[0].toUpperCase()}</text>
        </g>;
      })}
      <circle cx={dot[0]} cy={dot[1]} r="7" fill={P.ink} opacity={prog(T, t0, 0.4)} />
    </svg>
    <div style={{ position: 'absolute', left: cx - 200, top: cy - 60, width: 400, textAlign: 'center', opacity: prog(T, S + 0.9, 0.6) }}>
      <div style={{ font: `500 20px ${MONO}`, letterSpacing: '0.12em', color: P.faint }}>STATE</div>
      <div style={{ position: 'relative', height: 80 }}>
        {['teacher', 'shadow', 'assist'].map((st) => {
          const own = STEPS.map((s, i) => s[2] === st ? clamp(1 - Math.abs(pos - i) * 1.6, 0, 1) : 0);
          const op = Math.max(...own, st === 'teacher' && pos > 5.6 ? clamp((pos - 5.6) * 2.5, 0, 1) : 0) * (st === 'assist' && pos > 5.6 ? clamp(1 - (pos - 5.6) * 2.5, 0, 1) : 1);
          return <div key={st} style={{ position: 'absolute', inset: 0, opacity: op, font: `italic 400 64px/80px ${SERIF}`, color: stColor(st) }}>{st}</div>;
        })}
      </div>
    </div>
    <div style={{ position: 'absolute', left: cx - 450, top: cy + R + 84, width: 900, whiteSpace: 'nowrap', textAlign: 'center', font: `500 22px ${MONO}`, color: P.llm, opacity: driftO }}>drift detected → the decision goes back to the LLM</div>
  </Scene>;
}

/* 04 — swap rate */
function pathTo(pts, xCur, X, Y) {
  let d = '', last = null;
  for (let i = 0; i < pts.length; i++) {
    const [x, v] = pts[i];
    if (x <= xCur) { d += (d ? ' L' : 'M') + X(x).toFixed(1) + ',' + Y(v).toFixed(1); last = [x, v]; }
    else { if (i > 0 && last) { const [x0, v0] = pts[i - 1]; const f = (xCur - x0) / (x - x0); const v1 = v0 + (v - v0) * f; d += ' L' + X(xCur).toFixed(1) + ',' + Y(v1).toFixed(1); last = [xCur, v1]; } break; }
  }
  return { d, last };
}
function Swap({ T, C, P }) {
  const S = C.Swap, o = win(T, S + 0.2, C.Gates + 0.3, 0.6, 0.6);
  const d0 = S + 1.4, d1 = S + 8.2;
  const p = prog(T, d0, d1 - d0, E.draw);
  const xCur = p * XMAX;
  const x0 = 140, x1 = 1120, yb = 880, yt = 400;
  const X = (x) => x0 + (x / XMAX) * (x1 - x0), Y = (v) => yb - v * (yb - yt);
  const sv = pathTo(SERVED, xCur, X, Y), hd = pathTo(HOLD, xCur, X, Y);
  const state = xCur < 5999 ? 'teacher' : xCur < 6199 ? 'shadow' : 'assist';
  const stC = state === 'assist' ? P.rx : state === 'shadow' ? P.ho : P.llm;
  const axisO = prog(T, S + 0.6, 0.6);
  const route = (k) => { const t = S + 1.6 + k * 0.3; const xc = prog(t, d0, d1 - d0, E.draw) * XMAX; if (xc < 6300) return 'llm'; const h = hash(k); return h < 0.82 ? 'rx' : h < 0.9 ? 'ho' : 'llm'; };
  const ev = (x, label, dy) => xCur >= x ? <g key={label}><line x1={X(x)} x2={X(x)} y1={yt} y2={yb} stroke={P.faint} strokeWidth="1.5" /><text x={X(x) + (label === 'assist' ? 10 : -10)} y={yt - dy} textAnchor={label === 'assist' ? 'start' : 'end'} style={{ font: `500 20px ${MONO}` }} fill={P.muted}>{label}</text></g> : null;
  return <Scene o={o}>
    <Title T={T} at={S + 0.3} P={P} y={130} size={76} sub={null}>Seconds become milliseconds.</Title>
    <div style={{ position: 'absolute', left: 140, top: 236, display: 'flex', gap: 36, font: `400 24px ${SANS}`, color: P.muted, opacity: axisO }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ width: 28, height: 4, background: P.rx, borderRadius: 2 }}></span>Served locally</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ width: 28, height: 4, background: P.ho, borderRadius: 2 }}></span>Agreement with teacher, holdout</span>
    </div>
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={axisO}>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} stroke={P.line} strokeWidth="1" /><text x={x0 - 16} y={Y(v) + 7} textAnchor="end" style={{ font: `400 20px ${MONO}` }} fill={P.faint}>{v * 100}%</text></g>)}
        <line x1={x0} x2={x1} y1={Y(0.95)} y2={Y(0.95)} stroke={P.ink} strokeWidth="1.5" strokeDasharray="6 6" />
        <text x={x0 + 8} y={Y(0.95) - 10} style={{ font: `500 18px ${MONO}` }} fill={P.ink}>95% agreement bar</text>
        {[0, 2500, 5000, 7500, 10000, 12500].map((x) => <text key={x} x={X(x)} y={yb + 36} textAnchor="middle" style={{ font: `400 20px ${MONO}` }} fill={P.faint}>{x ? x / 1000 + 'k' : '0'}</text>)}
        <text x={x1 + 14} y={yb + 36} style={{ font: `400 20px ${MONO}` }} fill={P.faint}>calls</text>
      </g>
      {ev(5999, 'shadow', 34)}{ev(6199, 'assist', 12)}
      {[6999, 7999, 8999, 9999].map((x) => xCur >= x ? <line key={x} x1={X(x)} x2={X(x)} y1={yt} y2={yt + 12} stroke={P.faint} strokeWidth="1.5" /> : null)}
      <path d={hd.d} fill="none" stroke={P.ho} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path d={sv.d} fill="none" stroke={P.rx} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      {sv.last && p > 0 ? <g><circle cx={X(sv.last[0])} cy={Y(sv.last[1])} r="9" fill={P.rx} stroke={P.bg} strokeWidth="3" />{p > 0.985 ? <text x={X(sv.last[0]) + 20} y={Y(sv.last[1]) + 9} style={{ font: `600 26px ${MONO}` }} fill={P.rx}>{Math.round(sv.last[1] * 100)}%</text> : null}</g> : null}
      {hd.last ? <g><circle cx={X(hd.last[0])} cy={Y(hd.last[1])} r="7" fill={P.ho} stroke={P.bg} strokeWidth="3" />{p > 0.985 ? <text x={X(hd.last[0]) + 20} y={Y(hd.last[1]) + 9} style={{ font: `600 26px ${MONO}` }} fill={P.muted}>{Math.round(hd.last[1] * 100)}%</text> : null}</g> : null}
    </svg>
    <div style={{ position: 'absolute', left: 1270, top: 300, width: 510, opacity: axisO }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${P.ink}`, paddingBottom: 14 }}>
        <span style={{ font: `500 20px ${MONO}`, letterSpacing: '0.1em', color: P.faint }}>STATE</span>
        <span style={{ font: `italic 400 44px ${SERIF}`, color: stC }}>{state}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '14px 0 10px' }}>
        <span style={{ font: `500 20px ${MONO}`, letterSpacing: '0.1em', color: P.faint }}>CALLS</span>
        <span style={{ font: `500 30px ${MONO}`, color: P.ink }}>{Math.round(xCur).toLocaleString('en-US')}</span>
      </div>
    </div>
    <Stream T={T} P={P} start={S + 1.6} interval={0.3} count={30} route={route} compact x={1270} y={430} w={510} maxRows={7} rowH={62} />
    <div style={{ position: 'absolute', left: 140, bottom: 64, font: `400 20px ${MONO}`, color: P.muted, opacity: axisO }}>Banking77 end-to-end demo · stub teacher · laptop CPU · 4.7 ms p50 local</div>
  </Scene>;
}

/* 05 — gates */
function Gates({ T, C, P }) {
  const S = C.Gates, o = win(T, S + 0.2, C.Contract + 0.4, 0.6, 0.6);
  const rows = [['Agreement on the calls it would serve', '≥ 95%'], ['Calibration error', '≤ 0.05'], ['Coverage', '≥ 30%']];
  const runs = ['v1', 'v2', 'v3', 'v4'];
  return <Scene o={o}>
    <Title T={T} at={S + 0.3} P={P} y={140} size={84} sub="A model goes live only if, for every field, on held-out data:">Proof before promotion.</Title>
    <div style={{ position: 'absolute', left: 140, top: 420, width: 1640 }}>
      {rows.map((r, i) => { const e = prog(T, S + 1.0 + i * 0.3, 0.6); return <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '22px 0', borderBottom: `1px solid ${P.line}`, opacity: e, transform: `translateX(${(1 - e) * -30}px)` }}>
        <span style={{ font: `400 40px ${SANS}`, color: P.ink }}>{r[0]}</span>
        <span style={{ font: `500 40px ${MONO}`, color: P.ink }}>{r[1]}</span>
      </div>; })}
    </div>
    <div style={{ position: 'absolute', left: 140, top: 790, display: 'flex', gap: 20, alignItems: 'center' }}>
      <span style={{ font: `500 20px ${MONO}`, letterSpacing: '0.1em', color: P.faint, marginRight: 12, opacity: prog(T, S + 2.2, 0.5) }}>TRAINING RUNS</span>
      {runs.map((v, i) => { const e = prog(T, S + 2.5 + i * 0.55, 0.45, E.pop); const pass = i === 3; return <span key={v} style={{ opacity: clamp(e, 0, 1), transform: `scale(${0.8 + 0.2 * e})`, font: `600 24px ${MONO}`, padding: '12px 22px', borderRadius: 8, border: `2px solid ${pass ? P.rx : P.faint}`, background: pass ? P.rx : 'transparent', color: pass ? P.bg : P.muted, textDecoration: pass ? 'none' : 'line-through' }}>{v} · {pass ? 'passed → shadow' : 'refused'}</span>; })}
    </div>
    <div style={{ position: 'absolute', left: 140, top: 880, font: `italic 400 36px ${SERIF}`, color: P.ink, opacity: prog(T, S + 4.8, 0.7) }}>In the demo, the first three training runs are refused.</div>
  </Scene>;
}

/* 06 — the contract */
function Contract({ T, C, P }) {
  const S = C.Contract;
  const up = prog(T, S - 0.1, 0.9, E.draw), down = prog(T, C.Evidence - 0.5, 0.8, E.draw);
  const vis = up > 0 && down < 1;
  const tx = prog(T, S + 0.6, 1.0);
  return <div style={{ position: 'absolute', inset: 0, display: vis ? 'block' : 'none', clipPath: `inset(${(1 - up) * 100}% 0 ${down * 100}% 0)`, background: P.inv }}>
    <div style={{ position: 'absolute', left: 160, top: 150, font: `500 22px ${MONO}`, letterSpacing: '0.12em', color: P.invMuted, opacity: tx }}>THE CONTRACT</div>
    <div style={{ position: 'absolute', left: 160, top: 240, width: 1560, font: `400 66px/1.22 ${SERIF}`, color: P.invInk, letterSpacing: '-0.01em', opacity: tx, transform: `translateY(${(1 - tx) * 24}px)`, textWrap: 'pretty' }}>
      If anything in Gargi fails <span style={{ color: P.invMuted }}>(no model, low confidence, a model that won’t load, a corrupt database, a bug)</span>, the call goes to your function, <span style={{ fontStyle: 'italic', color: P.llm }}>exactly once.</span> Your exceptions propagate unchanged.
    </div>
    <div style={{ position: 'absolute', left: 160, bottom: 110, font: `400 24px ${MONO}`, color: P.invMuted, opacity: prog(T, S + 2.6, 0.8) }}>Tested by injecting faults at 19 points of the request path, in every lifecycle state.</div>
  </div>;
}

/* 07 — evidence */
function Evidence({ T, C, P }) {
  const S = C.Evidence, o = win(T, S + 0.2, C.Close + 0.3, 0.6, 0.6);
  const bars = [
    ['Banking77', 'Gemini Flash teacher', 0.890, P.rx, '77 intents · untouched test split · CI 85.2–92.8%'],
    ['Banking77', 'clean-label ceiling', 0.951, P.ho, 'dataset labels as the teacher'],
    ['Tickets', 'Gemini Flash teacher', 0.105, P.rx, '3 fields · Flash and Pro agree on all three only 57.7% of the time'],
  ];
  const bx = 700, bw = 1040;
  const stamp = prog(T, S + 4.4, 0.5, E.pop);
  return <Scene o={o}>
    <Title T={T} at={S + 0.3} P={P} y={130} size={84} sub="Share of calls a local model can serve at 95% agreement. Phase 0, test split.">Where it works, and where it doesn’t.</Title>
    <div style={{ position: 'absolute', left: bx + bw * 0.95, top: 400, height: 470, borderLeft: `2px dashed ${P.ink}`, opacity: prog(T, S + 1.0, 0.6) }}>
      <span style={{ position: 'absolute', top: -34, left: -60, width: 120, textAlign: 'center', font: `600 18px ${MONO}`, color: P.ink }}>95% target</span>
    </div>
    {bars.map((b, i) => {
      const top = 430 + i * 150, g = prog(T, S + 1.2 + i * 0.5, 1.4, E.draw);
      return <div key={i}>
        <div style={{ position: 'absolute', left: 140, top: top + 2, width: bx - 180, textAlign: 'right', opacity: prog(T, S + 1.0 + i * 0.5, 0.5) }}>
          <div style={{ font: `500 32px ${SANS}`, color: P.ink }}>{b[0]}</div>
          <div style={{ font: `400 24px ${SANS}`, color: P.muted }}>{b[1]}</div>
        </div>
        <div style={{ position: 'absolute', left: bx, top, width: bw * b[2] * g, height: 58, background: b[3], borderRadius: 3 }}></div>
        <div style={{ position: 'absolute', left: bx + bw * b[2] * g + 18, top: top + 8, font: `600 34px ${MONO}`, color: P.ink, opacity: g }}>{(b[2] * 100 * g).toFixed(1)}%</div>
        <div style={{ position: 'absolute', left: bx, top: top + 70, font: `400 19px ${MONO}`, color: P.muted, opacity: prog(T, S + 2.2 + i * 0.4, 0.6) }}>{b[4]}</div>
      </div>;
    })}
    <div style={{ position: 'absolute', left: bx + 300, top: 430 + 300 + 4, opacity: clamp(stamp, 0, 1), transform: `rotate(-3deg) scale(${0.7 + 0.3 * stamp})`, transformOrigin: 'left center', font: `600 24px ${MONO}`, letterSpacing: '0.08em', color: P.ink, border: `2.5px solid ${P.ink}`, borderRadius: 6, padding: '8px 16px' }}>GATES REFUSE TO SWAP</div>
    <div style={{ position: 'absolute', left: 140, bottom: 70, font: `italic 400 38px ${SERIF}`, color: P.ink, opacity: prog(T, S + 6.0, 0.8) }}>“Before you distill an LLM, check whether it agrees with itself.”</div>
  </Scene>;
}

/* 08 — close */
function Close({ T, C, P, headline }) {
  const S = C.Close, end = C.Close + 7.5;
  const o = win(T, S + 0.3, end, 0.6, 0.9);
  const cmd = 'pip install gargi';
  const n = Math.floor(clamp((T - (S + 2.0)) / 1.1, 0, 1) * cmd.length);
  const caret = Math.floor(T * 2.2) % 2 === 0;
  const h = prog(T, S + 0.5, 1.0);
  return <Scene o={o}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center' }}>
      <div style={{ font: `500 24px ${MONO}`, letterSpacing: '0.12em', color: P.muted, opacity: prog(T, S + 0.3, 0.7) }}>GARGI REFLEX · AUTONOMOUS DISTILLATION FOR LLM DECISIONS</div>
      <div style={{ marginTop: 40, font: `400 116px/1.02 ${SERIF}`, letterSpacing: '-0.025em', color: P.ink, opacity: h, transform: `translateY(${(1 - h) * 30}px)` }}>{headline}</div>
      <div style={{ marginTop: 70, display: 'inline-flex', alignItems: 'center', gap: 18, font: `500 38px ${MONO}`, whiteSpace: 'nowrap', color: P.ink, background: P.card, border: `1.5px solid ${P.line}`, borderRadius: 10, padding: '22px 36px', opacity: prog(T, S + 1.6, 0.6) }}>
        <span style={{ color: P.rx }}>$</span><span>{cmd.slice(0, n)}<span style={{ opacity: caret ? 1 : 0, color: P.rx }}>▍</span></span>
      </div>
      <div style={{ marginTop: 34, font: `400 26px ${SANS}`, color: P.muted, opacity: prog(T, S + 3.2, 0.7) }}>Apache-2.0 · Python · runs on a laptop CPU</div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', font: `400 24px ${SANS}`, color: P.muted, opacity: prog(T, S + 4.0, 0.8) }}>Gargi is a lab building AI infrastructure that proves itself. Named for Gargi Vachaknavi, who kept asking.</div>
  </Scene>;
}

const FIGS = [['Calls', 'the repeated call'], ['Thesis', 'thesis'], ['Loop', 'the loop'], ['Swap', 'swap rate'], ['Gates', 'gates'], ['Contract', 'the contract'], ['Evidence', 'evidence'], ['Close', 'install']];
function Chrome({ T, C, P }) {
  let idx = 0;
  FIGS.forEach((f, i) => { if (T >= C[f[0]] + 0.5) idx = i; });
  const onInk = T >= C.Contract + 0.3 && T < C.Evidence - 0.2;
  const ink = onInk ? P.invInk : P.ink, mut = onInk ? P.invMuted : P.muted;
  return <div style={{ position: 'absolute', left: 80, right: 80, top: 44, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 18, borderBottom: `1px solid ${onInk ? rgba(P.invInk, 0.2) : P.line}`, zIndex: 5 }}>
    <span style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
      <span style={{ font: `500 34px ${SERIF}`, color: ink, letterSpacing: '-0.01em' }}>Gargi</span>
      <span style={{ font: `400 22px 'Noto Serif Devanagari', ${SERIF}`, color: mut }}>गार्गी</span>
      <span style={{ font: `500 20px ${MONO}`, color: mut, marginLeft: 10 }}>/ Reflex</span>
    </span>
    <span style={{ font: `500 20px ${MONO}`, color: mut, letterSpacing: '0.04em' }}>fig. {String(idx + 1).padStart(2, '0')} — {FIGS[idx][1]}</span>
  </div>;
}

function Piece({ tw }) {
  const { T, CUES } = useComposition();
  const P = THEMES[tw.theme] || THEMES.Paper;
  const bgImg = tw.grid ? `linear-gradient(${P.grid} 1px, transparent 1px), linear-gradient(90deg, ${P.grid} 1px, transparent 1px)` : 'none';
  return <div data-screen-label={`t=${Math.floor(T)}s`} style={{ position: 'absolute', inset: 0, background: P.bg, backgroundImage: bgImg, backgroundSize: '48px 48px', overflow: 'hidden' }}>
    <Calls T={T} C={CUES} P={P} />
    <Thesis T={T} C={CUES} P={P} />
    <Loop T={T} C={CUES} P={P} />
    <Swap T={T} C={CUES} P={P} />
    <Gates T={T} C={CUES} P={P} />
    <Contract T={T} C={CUES} P={P} />
    <Evidence T={T} C={CUES} P={P} />
    <Close T={T} C={CUES} P={P} headline={tw.headline} />
    <Chrome T={T} C={CUES} P={P} />
  </div>;
}

function GargiFilm() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const P = THEMES[tw.theme] || THEMES.Paper;
  return <React.Fragment>
    <CompositionStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={P.bg}>
      <Piece tw={tw} />
    </CompositionStage>
    <TweaksPanel>
      <TweakSection label="Film" />
      <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      <TweakRadio label="Theme" value={tw.theme} options={['Paper', 'Ink']} onChange={(v) => setTweak('theme', v)} />
      <TweakToggle label="Notebook grid" value={tw.grid} onChange={(v) => setTweak('grid', v)} />
      <TweakSelect label="Closing headline" value={tw.headline} options={['Make every LLM call swappable.', 'Let frontier models think. Let Gargi remember.']} onChange={(v) => setTweak('headline', v)} />
    </TweaksPanel>
  </React.Fragment>;
}

window.GargiFilm = GargiFilm;

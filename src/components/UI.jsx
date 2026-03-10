import { usd, pressureColors } from '../data.js';

export function Card({ children, style = {}, glow }) {
  return (
    <div style={{
      background:   'var(--bg-raised)',
      border:       '1px solid var(--border)',
      borderRadius: 14,
      padding:      16,
      boxShadow:    glow ? `0 0 0 1px ${glow}20, 0 4px 24px ${glow}10` : '0 2px 8px rgba(0,0,0,0.2)',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)',
      marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

export function SectionHead({ title, sub, icon }) {
  return (
    <div style={{ marginBottom: 12, marginTop: 28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {icon && <span style={{ fontSize:14, opacity:0.5 }}>{icon}</span>}
        <h2 style={{ fontFamily:'var(--font-serif)', fontSize:19, color:'var(--ink)',
          fontWeight:400, letterSpacing:'-0.3px', margin:0 }}>
          {title}
        </h2>
      </div>
      {sub && <p style={{ fontSize:11, color:'var(--ink-muted)', marginTop:3, marginLeft: icon ? 22 : 0 }}>{sub}</p>}
    </div>
  );
}

export function Divider({ my = 12 }) {
  return <div style={{ height:1, background:'var(--border-soft)', margin:`${my}px 0` }}/>;
}

export function PressureBadge({ label }) {
  const c = pressureColors(label);
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      background:c.bg, border:`1px solid ${c.border}`,
      color:c.text, borderRadius:100, padding:'3px 10px 3px 7px',
      fontSize:11, fontWeight:500, fontFamily:'var(--font-mono)',
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:c.dot }}/>
      {label}
    </span>
  );
}

export function BudgetBar({ label, spent, total, left, period }) {
  const pct  = total > 0 ? Math.min(1, spent / total) : 0;
  const warn = pct > 0.85;
  const color = warn ? 'var(--amber)' : 'var(--olive)';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:7 }}>
        <span style={{ fontSize:12, color:'var(--ink)' }}>{label}</span>
        <div style={{ textAlign:'right' }}>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:16, color: warn ? 'var(--amber)' : 'var(--ink)' }}>
            {usd(left)}
          </span>
          <span style={{ fontSize:10, color:'var(--ink-muted)', marginLeft:4 }}>left {period}</span>
        </div>
      </div>
      <div style={{ height:4, background:'var(--bg-float)', borderRadius:2, overflow:'hidden',
        border:'1px solid var(--border-soft)' }}>
        <div style={{ height:'100%', width:`${pct * 100}%`, borderRadius:2,
          background:color, opacity:0.7, transition:'width 1.4s ease' }}/>
      </div>
      <div style={{ fontSize:10, color:'var(--ink-muted)', marginTop:4,
        fontFamily:'var(--font-mono)', display:'flex', justifyContent:'space-between' }}>
        <span>{usd(spent)} spent</span>
        <span>{usd(total)} budget</span>
      </div>
    </div>
  );
}

export function MetricRow({ label, value, valueColor, sub }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'9px 0', borderBottom:'1px solid var(--border-soft)' }}>
      <span style={{ fontSize:11, color:'var(--ink-muted)', fontFamily:'var(--font-mono)' }}>
        {label}
      </span>
      <div style={{ textAlign:'right' }}>
        <span style={{ fontFamily:'var(--font-serif)', fontSize:15,
          color: valueColor || 'var(--ink)' }}>
          {value}
        </span>
        {sub && <div style={{ fontSize:9, color:'var(--ink-faint)',
          fontFamily:'var(--font-mono)' }}>{sub}</div>}
      </div>
    </div>
  );
}

export function PressureArc({ score, label }) {
  // SVG arc gauge 0–100
  const pct    = Math.min(100, Math.max(0, score)) / 100;
  const R      = 38, CX = 50, CY = 50;
  const start  = Math.PI * 0.75;
  const sweep  = Math.PI * 1.5;
  const end    = start + sweep * pct;
  const x1     = CX + R * Math.cos(start);
  const y1     = CY + R * Math.sin(start);
  const x2     = CX + R * Math.cos(end);
  const y2     = CY + R * Math.sin(end);
  const large  = sweep * pct > Math.PI ? 1 : 0;
  const arcEnd = { x: CX + R * Math.cos(start + sweep), y: CY + R * Math.sin(start + sweep) };

  const color = pct < 0.4 ? '#6B8F5E' : pct < 0.65 ? '#C9A84C' : pct < 0.85 ? '#D4813A' : '#C45A4A';

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg viewBox="0 0 100 60" style={{ width:110 }}>
        {/* Track */}
        <path d={`M ${x1} ${y1} A ${R} ${R} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none" stroke="var(--bg-float)" strokeWidth="7" strokeLinecap="round"/>
        {/* Fill */}
        {pct > 0 && (
          <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`}
            fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
        )}
        {/* Score */}
        <text x="50" y="46" textAnchor="middle" fontFamily="var(--font-serif)"
          fontSize="16" fill="var(--ink)">{score}</text>
      </svg>
      <div style={{ fontSize:10, color:'var(--ink-muted)', fontFamily:'var(--font-mono)',
        marginTop:-4, textAlign:'center', lineHeight:1.4 }}>
        pressure score · <span style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

export function Skeleton({ h = 80, radius = 12, mb = 10 }) {
  return (
    <div style={{
      height: h, borderRadius: radius, marginBottom: mb,
      background: 'linear-gradient(90deg, var(--bg-raised) 25%, var(--bg-float) 50%, var(--bg-raised) 75%)',
      backgroundSize: '400px 100%',
      animation: 'shimmer 1.5s infinite',
    }}/>
  );
}

export function CompassMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--gold-dim)" strokeWidth="1"/>
      <circle cx="12" cy="12" r="6"  stroke="var(--gold-dim)" strokeWidth="0.5" opacity="0.5"/>
      <line x1="12" y1="2"  x2="12" y2="5"  stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="22" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="2"  y1="12" x2="5"  y2="12" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round"/>
      <line x1="19" y1="12" x2="22" y2="12" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round"/>
      <polygon points="12,3 13,10 12,13 11,10" fill="var(--gold)"/>
      <polygon points="12,21 11,14 12,11 13,14" fill="var(--gold-dim)" opacity="0.5"/>
      <circle cx="12" cy="12" r="1.5" fill="var(--gold)"/>
    </svg>
  );
}

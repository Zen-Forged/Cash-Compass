import { useState } from 'react';
import { fmt, usd } from '../data.js';

export default function ForecastChart({ forecast, buffer, windowDays, startDate }) {
  const [tip, setTip] = useState(null);
  const W = 320, H = 140, PAD_L = 36;

  const origin = new Date(startDate + 'T12:00:00');
  const cutoff = new Date(origin); cutoff.setDate(cutoff.getDate() + windowDays);
  const items  = forecast.filter(f => {
    if (!f.date) return false;
    const d = new Date(f.date + 'T12:00:00');
    return d >= origin && d <= cutoff;
  });

  if (items.length < 2) return (
    <div style={{ height: H, display:'flex', alignItems:'center', justifyContent:'center',
      color:'var(--ink-muted)', fontSize:12, fontFamily:'var(--font-mono)' }}>
      no forecast data
    </div>
  );

  const bals   = items.map(f => f.runningBalance).filter(v => v != null);
  const minV   = Math.min(...bals, buffer) - 200;
  const maxV   = Math.max(...bals) + 400;
  const scaleX = i => PAD_L + (i / (items.length - 1)) * (W - PAD_L);
  const scaleY = v => H - ((v - minV) / (maxV - minV)) * H;
  const bufY   = scaleY(buffer);

  const pts = items.map((f, i) => `${scaleX(i).toFixed(1)},${scaleY(f.runningBalance).toFixed(1)}`).join(' ');
  const area = `M ${scaleX(0)},${H} L ${pts.split(' ').join(' L ')} L ${scaleX(items.length-1)},${H} Z`;

  const lowIdx = items.reduce((li, f, i) => f.runningBalance < items[li].runningBalance ? i : li, 0);

  // Tick every 7 days
  const ticks = [];
  for (let i = 0; i < items.length; i += 7) ticks.push(i);

  // Compression zone (near-buffer region)
  const nearBuf = items.map(f => f.runningBalance < buffer + 600);

  return (
    <div style={{ position:'relative', marginLeft:-4 }}>
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width:'100%', overflow:'visible', display:'block' }}
        onMouseLeave={() => setTip(null)}>
        <defs>
          <linearGradient id="cg-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6B8F5E" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#6B8F5E" stopOpacity="0.01"/>
          </linearGradient>
          <linearGradient id="cg-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#6B8F5E"/>
            <stop offset="55%"  stopColor="#8FB07A"/>
            <stop offset="100%" stopColor="#C9A84C"/>
          </linearGradient>
          <linearGradient id="cg-comp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.03"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Y-axis grid */}
        {[0, 0.33, 0.66, 1].map((t, i) => {
          const v = minV + t * (maxV - minV);
          const y = scaleY(v);
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={W} y2={y} stroke="#1C2332" strokeWidth="1"/>
              <text x={PAD_L - 5} y={y + 4} fill="#3D4858" fontSize="8"
                textAnchor="end" fontFamily="var(--font-mono)">
                {Math.abs(v) >= 1000 ? `${(v/1000).toFixed(0)}k` : Math.round(v)}
              </text>
            </g>
          );
        })}

        {/* Compression zone */}
        {(() => {
          let start = -1, end = -1;
          items.forEach((f, i) => {
            if (f.runningBalance < buffer + 600) {
              if (start < 0) start = i;
              end = i;
            }
          });
          if (start < 0 || end <= start) return null;
          return (
            <rect x={scaleX(start)} y={bufY - 2}
              width={Math.max(3, scaleX(end) - scaleX(start))}
              height={H - bufY + 2}
              fill="url(#cg-comp)" rx="2"/>
          );
        })()}

        {/* Area */}
        <path d={area} fill="url(#cg-area)"/>

        {/* Buffer line */}
        <line x1={PAD_L} y1={bufY} x2={W} y2={bufY}
          stroke="#C9A84C" strokeWidth="1" strokeDasharray="5 4" opacity="0.5"/>
        <text x={PAD_L + 4} y={bufY - 4} fill="#C9A84C" fontSize="7.5" opacity="0.7"
          fontFamily="var(--font-mono)">buffer ${buffer.toLocaleString()}</text>

        {/* Line (glowing) */}
        <polyline points={pts} fill="none" stroke="rgba(107,143,94,0.3)"
          strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"/>
        <polyline points={pts} fill="none" stroke="url(#cg-line)"
          strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>

        {/* Income event dots */}
        {items.map((f, i) => f.type === 'Income' ? (
          <g key={i}>
            <circle cx={scaleX(i)} cy={scaleY(f.runningBalance)} r="4"
              fill="var(--bg-raised)" stroke="#6B8F5E" strokeWidth="1.5"/>
          </g>
        ) : null)}

        {/* Lowest point callout */}
        {(() => {
          const lx = scaleX(lowIdx), ly = scaleY(items[lowIdx].runningBalance);
          return (
            <g>
              <line x1={lx} y1={ly - 6} x2={lx} y2={ly - 20}
                stroke="#C9A84C" strokeWidth="1" strokeDasharray="2 2" opacity="0.7"/>
              <rect x={lx - 28} y={ly - 34} width={56} height={15} rx={3}
                fill="#C9A84C" opacity="0.95"/>
              <text x={lx} y={ly - 24} fill="#0D1117" fontSize="8" textAnchor="middle"
                fontFamily="var(--font-mono)" fontWeight="500">
                {usd(items[lowIdx].runningBalance)}
              </text>
              <circle cx={lx} cy={ly} r="5" fill="var(--bg-raised)" stroke="#C9A84C" strokeWidth="2"/>
              <circle cx={lx} cy={ly} r="2" fill="#C9A84C"/>
            </g>
          );
        })()}

        {/* Start dot */}
        <circle cx={scaleX(0)} cy={scaleY(items[0].runningBalance)} r="4"
          fill="var(--bg-raised)" stroke="#6B8F5E" strokeWidth="2"/>

        {/* Date ticks */}
        {ticks.map(i => (
          <text key={i} x={scaleX(i)} y={H + 16} fill="#3D4858" fontSize="8"
            textAnchor="middle" fontFamily="var(--font-mono)">
            {fmt(items[i].date)}
          </text>
        ))}

        {/* Hover zones */}
        {items.map((f, i) => (
          <rect key={i} x={Math.max(PAD_L, scaleX(i) - 8)} y={0} width={16} height={H}
            fill="transparent"
            onMouseEnter={() => setTip({ f, x: scaleX(i), y: scaleY(f.runningBalance) })}/>
        ))}
      </svg>

      {tip && (
        <div style={{
          position:'absolute',
          left:`${((tip.x) / W) * 100}%`,
          top:`${(tip.y / (H + 24)) * 100}%`,
          transform:'translate(-50%, -115%)',
          background:'var(--bg-float)',
          border:'1px solid var(--border)',
          borderRadius:8, padding:'8px 12px',
          fontSize:11, fontFamily:'var(--font-mono)',
          pointerEvents:'none', whiteSpace:'nowrap', zIndex:20,
          boxShadow:'0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ color:'var(--ink-muted)', marginBottom:3, fontSize:10 }}>{fmt(tip.f.date)}</div>
          <div style={{ fontSize:15, fontFamily:'var(--font-serif)', color:'var(--ink)' }}>
            {usd(tip.f.runningBalance)}
          </div>
          <div style={{ color: tip.f.type === 'Income' ? '#6B8F5E' : '#8A8278', marginTop:2 }}>
            {tip.f.description}
          </div>
        </div>
      )}
    </div>
  );
}

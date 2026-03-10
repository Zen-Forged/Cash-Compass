import { useState } from 'react';
import { usd, fmt } from '../data.js';

const ICONS = {
  Credit:            '◈',
  Housing:           '⌂',
  Education:         '◎',
  Transportation:    '◷',
  Subscriptions:     '∞',
  Food:              '◉',
  Shopping:          '◇',
  'Rental Property': '⌂',
  'Gig Income':      '↑',
  Employment:        '↑',
};

function dayLabel(dateStr, startIso) {
  const origin = new Date(startIso + 'T12:00:00');
  const d      = new Date(dateStr  + 'T12:00:00');
  const diff   = Math.round((d - origin) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
}

export default function UpcomingItems({ weeks, startDate }) {
  const [page, setPage] = useState(0);
  if (!weeks.length) return (
    <p style={{ color:'var(--ink-muted)', fontSize:12, padding:'16px 0',
      fontFamily:'var(--font-mono)' }}>No items in window.</p>
  );

  const week = weeks[Math.min(page, weeks.length - 1)];
  const bals = week.sortedDays.flatMap(([, items]) => items).map(i => i.runningBalance).filter(Boolean);
  const low  = bals.length ? Math.min(...bals) : null;
  const total = weeks.length;

  return (
    <div>
      {/* Navigation */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
          style={{ width:28, height:28, borderRadius:6, border:'1px solid var(--border)',
            background: page === 0 ? 'transparent' : 'var(--bg-float)',
            color: page === 0 ? 'var(--ink-faint)' : 'var(--ink-muted)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, transition:'all 0.15s' }}>‹</button>

        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--ink)', letterSpacing:'-0.2px' }}>
            {week.label}
          </div>
          <div style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--ink-muted)', marginTop:1 }}>
            wk {page+1}/{total}
            {low != null && (
              <span style={{ marginLeft:8, color: low < 1500 ? 'var(--gold)' : '#6B8F5E' }}>
                · low {usd(low)}
              </span>
            )}
          </div>
        </div>

        <button onClick={() => setPage(p => Math.min(total-1, p+1))} disabled={page === total-1}
          style={{ width:28, height:28, borderRadius:6, border:'1px solid var(--border)',
            background: page === total-1 ? 'transparent' : 'var(--bg-float)',
            color: page === total-1 ? 'var(--ink-faint)' : 'var(--ink-muted)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, transition:'all 0.15s' }}>›</button>
      </div>

      {/* Week net */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background: week.net >= 0 ? 'var(--olive-bg)' : 'var(--amber-bg)',
        border:`1px solid ${week.net >= 0 ? 'rgba(107,143,94,0.2)' : 'rgba(212,129,58,0.2)'}`,
        borderRadius:8, padding:'7px 12px', marginBottom:16,
      }}>
        <span style={{ fontSize:11, color:'var(--ink-muted)', fontFamily:'var(--font-mono)' }}>
          week net
        </span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:500,
          color: week.net >= 0 ? '#6B8F5E' : '#D4813A' }}>
          {week.net >= 0 ? '+' : ''}{usd(week.net)}
        </span>
      </div>

      {/* Days */}
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {week.sortedDays.map(([dateKey, dayItems]) => {
          const dayNet = dayItems.reduce((s, i) => s + (i.usedAmount || 0), 0);
          const endBal = dayItems[dayItems.length - 1]?.runningBalance;

          return (
            <div key={dateKey}>
              {/* Day header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline',
                paddingBottom:7, borderBottom:'1px solid var(--border-soft)', marginBottom:2 }}>
                <span style={{ fontSize:11, fontWeight:500, color:'var(--ink)',
                  fontFamily:'var(--font-mono)', letterSpacing:'0.03em' }}>
                  {dayLabel(dateKey, startDate)}
                </span>
                <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                  {endBal != null && (
                    <span style={{ fontSize:9, color:'var(--ink-faint)',
                      fontFamily:'var(--font-mono)' }}>
                      bal {usd(endBal)}
                    </span>
                  )}
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10,
                    color: dayNet >= 0 ? '#6B8F5E' : '#8A8278' }}>
                    {dayNet >= 0 ? '+' : ''}{usd(dayNet)}
                  </span>
                </div>
              </div>

              {dayItems.map((item, idx) => {
                const isIncome = item.type === 'Income';
                const amt = item.usedAmount || item.plannedAmount || 0;
                const icon = ICONS[item.category] || '·';

                return (
                  <div key={idx} style={{ display:'flex', alignItems:'center', gap:10,
                    padding:'8px 0',
                    borderBottom: idx < dayItems.length - 1 ? '1px solid var(--border-soft)' : 'none' }}>

                    {/* Icon */}
                    <div style={{
                      width:28, height:28, borderRadius:7, flexShrink:0,
                      background: isIncome ? 'var(--olive-bg)' : 'var(--bg-float)',
                      border:`1px solid ${isIncome ? 'rgba(107,143,94,0.2)' : 'var(--border-soft)'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, color: isIncome ? '#6B8F5E' : 'var(--ink-muted)',
                    }}>
                      {icon}
                    </div>

                    {/* Label */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:400, color:'var(--ink)',
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                        display:'flex', alignItems:'center', gap:5 }}>
                        {item.description}
                        {item.notes?.toLowerCase().includes('pending') && (
                          <span style={{ fontSize:8, background:'var(--gold-bg)',
                            color:'var(--gold)', borderRadius:3, padding:'1px 4px',
                            border:'1px solid var(--gold-dim)', flexShrink:0 }}>
                            pending
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:10, color:'var(--ink-muted)',
                        fontFamily:'var(--font-mono)', marginTop:1 }}>
                        {item.category}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:500,
                      flexShrink:0, color: amt >= 0 ? '#6B8F5E' : 'var(--ink)' }}>
                      {amt >= 0 ? '+' : '−'}{usd(Math.abs(amt))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:18 }}>
        {weeks.map((_, i) => (
          <button key={i} onClick={() => setPage(i)} style={{
            width: i === page ? 18 : 5, height:5, borderRadius:3, border:'none',
            background: i === page ? 'var(--gold)' : 'var(--border)', padding:0,
            transition:'all 0.22s ease', cursor:'pointer',
          }}/>
        ))}
      </div>
    </div>
  );
}

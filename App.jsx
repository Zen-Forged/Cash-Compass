import { useState, useEffect } from 'react';
import { fetchData, groupByWeek, fmt, fmtLong, usd, WEBHOOK_URL } from './data.js';
import ForecastChart from './components/ForecastChart.jsx';
import UpcomingItems from './components/UpcomingItems.jsx';
import {
  Card, SectionLabel, SectionHead, Divider,
  PressureBadge, PressureArc, BudgetBar, MetricRow,
  Skeleton, CompassMark,
} from './components/UI.jsx';

export default function App() {
  const [payload,  setPayload]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [mounted,  setMounted]  = useState(false);
  const [win,      setWin]      = useState(45);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    fetchData().then(r => { setPayload(r); setLoading(false); });
  }, []);

  const D   = payload?.data;
  const db  = D?.dashboard  || {};
  const st  = D?.settings   || {};
  const ins = D?.insights   || {};
  const fc  = D?.forecast   || [];
  const src = payload?.source;

  const weeks    = D ? groupByWeek(fc, win, db.forecastStartDate || st.balanceAsOfDate) : [];
  const endDelta = (db.forecastEndingBalance || 0) - (db.currentBalance || 0);
  const isLive   = src === 'live';

  // Stagger animation
  const anim = (delay) => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? 'none' : 'translateY(10px)',
    transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', maxWidth:430,
      margin:'0 auto', position:'relative' }}>

      {/* Subtle paper texture */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.5,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
      }}/>

      <div style={{ position:'relative', zIndex:1, padding:'0 18px 80px' }}>

        {/* ── BANNER ── */}
        {!loading && src !== 'live' && (
          <div style={{ ...anim(0), background:'var(--gold-bg)', border:'1px solid var(--gold-dim)',
            borderRadius:10, padding:'9px 13px', marginTop:14, fontSize:11,
            color:'var(--gold)', fontFamily:'var(--font-mono)',
            display:'flex', alignItems:'center', gap:8 }}>
            <span>◉</span>
            <span>
              {src === 'fallback'
                ? 'Webhook unreachable — showing demo data.'
                : <>Demo mode — set <code>WEBHOOK_URL</code> in <code>src/data.js</code></>
              }
            </span>
          </div>
        )}

        {/* ── HEADER ── */}
        <div style={{ ...anim(0.05), paddingTop: src !== 'live' ? 14 : 42, paddingBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <CompassMark size={22}/>
              <div>
                <h1 style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:400,
                  color:'var(--ink)', letterSpacing:'-0.4px', lineHeight:1 }}>
                  Cash Compass
                </h1>
                {!loading && (
                  <p style={{ fontSize:10, color:'var(--ink-muted)', fontFamily:'var(--font-mono)',
                    marginTop:3 }}>
                    {win}d view · {fmt(db.forecastStartDate)}
                    {isLive && <span style={{ color:'var(--olive)', marginLeft:6 }}>● live</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Window toggle */}
            <div style={{ display:'flex', background:'var(--bg-raised)', border:'1px solid var(--border)',
              borderRadius:8, padding:2, gap:1 }}>
              {[14, 30, 45].map(w => (
                <button key={w} onClick={() => setWin(w)} style={{
                  border:'none', borderRadius:6, padding:'4px 11px',
                  fontFamily:'var(--font-mono)', fontSize:11,
                  color:      win === w ? 'var(--ink)'   : 'var(--ink-muted)',
                  background: win === w ? 'var(--bg-float)' : 'transparent',
                  boxShadow:  win === w ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.15s',
                }}>{w}d</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── SKELETONS ── */}
        {loading && (
          <div>
            <Skeleton h={180} mb={10}/><Skeleton h={100} mb={10}/>
            <Skeleton h={180} mb={10}/><Skeleton h={140} mb={10}/><Skeleton h={260}/>
          </div>
        )}

        {!loading && D && (
          <>
            {/* ── HERO BLOCK ── */}
            <div style={anim(0.12)}>

              {/* Primary balance card — compressed, neutral */}
              <div style={{
                background:'var(--bg-raised)',
                border:'1px solid var(--border)',
                borderRadius:16, padding:'16px 18px 14px',
                position:'relative', overflow:'hidden', marginBottom:10,
                boxShadow:'0 1px 8px rgba(0,0,0,0.05)',
              }}>
                {/* Decorative arc */}
                <svg style={{ position:'absolute', top:-20, right:-20, opacity:0.08 }}
                  width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="var(--gold)" strokeWidth="1"/>
                  <circle cx="60" cy="60" r="36" fill="none" stroke="var(--gold)" strokeWidth="0.5"/>
                </svg>

                <div style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase',
                  color:'var(--ink-faint)', fontFamily:'var(--font-mono)', marginBottom:8 }}>
                  {fmtLong(db.forecastStartDate)}
                </div>

                {/* Balance + safe-to-spend on same row */}
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
                  <div>
                    <SectionLabel>Checking Balance</SectionLabel>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:38, color:'var(--ink)',
                      lineHeight:1, letterSpacing:'-1.5px' }}>
                      {usd(db.currentBalance)}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', paddingBottom:2 }}>
                    <SectionLabel>Safe to Spend</SectionLabel>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:24,
                      color: db.safeToSpend < 200 ? 'var(--gold)' : 'var(--olive)', lineHeight:1 }}>
                      {usd(db.safeToSpend)}
                    </div>
                    <div style={{ fontSize:9, color:'var(--ink-faint)', fontFamily:'var(--font-mono)',
                      marginTop:2 }}>above lowest</div>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
                  <PressureBadge label={db.pressureLabel}/>
                </div>
              </div>

              {/* Tightest cash day */}
              <Card style={{ borderLeft:'2px solid var(--gold-dim)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                  marginBottom:12 }}>
                  <div>
                    <SectionLabel>Tightest Cash Day</SectionLabel>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:28,
                      color:'var(--gold)', letterSpacing:'-0.5px', lineHeight:1 }}>
                      {usd(db.lowestBalance)}
                    </div>
                    <div style={{ fontSize:11, color:'var(--ink-muted)', marginTop:3,
                      fontFamily:'var(--font-mono)' }}>
                      {fmt(db.tightestCashDay)} · {db.compressionType}
                    </div>
                  </div>
                  <div style={{ background:'var(--gold-bg)', border:'1px solid var(--gold-dim)',
                    borderRadius:10, padding:'8px 12px', textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontSize:9, fontFamily:'var(--font-mono)',
                      color:'var(--gold-dim)', marginBottom:3 }}>buffer gap</div>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:17,
                      color: db.bufferGapAtLowPoint > 0 ? 'var(--amber)' : 'var(--olive)' }}>
                      {db.bufferGapAtLowPoint > 0 ? usd(db.bufferGapAtLowPoint) : 'None'}
                    </div>
                  </div>
                </div>

                <Divider my={10}/>

                {/* AI Compass Read — summary only */}
                <div style={{ background:'var(--gold-bg)', border:'1px dashed var(--gold-dim)',
                  borderRadius:10, padding:'12px 13px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                    <span style={{ fontSize:12 }}>✦</span>
                    <span style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase',
                      color:'var(--gold)', fontFamily:'var(--font-mono)', fontWeight:500 }}>
                      Compass Read
                    </span>
                    {ins.lastUpdated && (
                      <span style={{ fontSize:9, color:'var(--ink-muted)',
                        fontFamily:'var(--font-mono)', marginLeft:'auto' }}>
                        {fmt(ins.lastUpdated)}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize:12.5, color:'var(--gold)', lineHeight:1.75, margin:0,
                    fontFamily:'var(--font-serif)', fontStyle:'italic' }}>
                    {ins.summary || db.compressionSummary || 'Insight will appear once webhook is connected.'}
                  </p>
                </div>
              </Card>
            </div>

            {/* ── FORECAST CHART ── */}
            <div style={anim(0.22)}>
              <SectionHead icon="◌" title="Cash Flow Horizon"
                sub={`${win}-day trajectory from ${fmt(db.forecastStartDate)}`}/>
              <Card style={{ padding:'16px 8px 12px 12px' }}>
                <ForecastChart forecast={fc} buffer={st.minimumBuffer}
                  windowDays={win} startDate={db.forecastStartDate || st.balanceAsOfDate}/>
              </Card>
              <p style={{ fontSize:11, color:'var(--ink-muted)', lineHeight:1.65,
                marginTop:9, paddingLeft:2 }}>
                {db.daysBelowBuffer > 0
                  ? `Balance dips below the $${st.minimumBuffer?.toLocaleString()} buffer for ${db.daysBelowBuffer} day${db.daysBelowBuffer > 1 ? 's' : ''}.`
                  : db.compressionSummary
                }
              </p>
            </div>

            {/* ── PRESSURE PANEL ── */}
            <div style={anim(0.30)}>
              <SectionHead icon="⊙" title="Pressure Summary"/>
              <Card>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  marginBottom:12 }}>
                  <PressureArc score={db.pressureScore} label={db.pressureLabel}/>
                  <div style={{ flex:1, paddingLeft:16 }}>
                    <MetricRow label="lowest balance"
                      value={usd(db.lowestBalance)}
                      valueColor={db.bufferGapAtLowPoint > 0 ? 'var(--amber)' : 'var(--olive)'}/>
                    <MetricRow label="tightest day"    value={fmt(db.tightestCashDay)}/>
                    <MetricRow label="days below buffer" value={db.daysBelowBuffer}
                      valueColor={db.daysBelowBuffer > 0 ? 'var(--amber)' : 'var(--olive)'}/>
                    <MetricRow label="compression"     value={db.compressionType}
                      valueColor="var(--ink-muted)" style={{ borderBottom:'none' }}/>
                  </div>
                </div>

                {/* Transactions driving pressure on tightest day */}
                {(() => {
                  const tight = db.tightestCashDay;
                  const dayTx = fc.filter(f => f.date === tight && f.type === 'Expense');
                  if (!dayTx.length) return null;
                  const total = dayTx.reduce((s, f) => s + Math.abs(f.usedAmount || f.plannedAmount || 0), 0);
                  return (
                    <div style={{ marginTop:12, background:'var(--gold-bg)',
                      border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px' }}>
                      <div style={{ fontSize:9, fontFamily:'var(--font-mono)', letterSpacing:'0.1em',
                        textTransform:'uppercase', color:'var(--ink-faint)', marginBottom:8 }}>
                        What hits on {fmt(tight)} · {dayTx.length} transaction{dayTx.length > 1 ? 's' : ''} · {usd(total)} out
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {dayTx.map((f, i) => (
                          <div key={i} style={{ display:'flex', justifyContent:'space-between',
                            alignItems:'center', fontSize:11 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <span style={{ fontSize:9, color:'var(--ink-faint)',
                                fontFamily:'var(--font-mono)' }}>{f.category}</span>
                              <span style={{ color:'var(--ink)' }}>{f.description}</span>
                            </div>
                            <span style={{ fontFamily:'var(--font-mono)', fontSize:11,
                              color:'var(--amber)', flexShrink:0 }}>
                              −{usd(Math.abs(f.usedAmount || f.plannedAmount || 0))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {db.unclearedTransactions > 0 && (
                  <div style={{ background:'var(--gold-bg)', border:'1px solid var(--gold-dim)',
                    borderRadius:8, padding:'8px 11px', fontSize:11, marginTop:10,
                    color:'var(--gold)', fontFamily:'var(--font-mono)',
                    display:'flex', justifyContent:'space-between' }}>
                    <span>uncleared transactions</span>
                    <span>{usd(db.unclearedTransactions)}</span>
                  </div>
                )}
              </Card>
            </div>

            {/* ── UPCOMING ── */}
            <div style={anim(0.38)}>
              <SectionHead icon="⟳" title="The Journey Ahead"
                sub="Week-by-week scheduled items"/>
              <Card>
                <UpcomingItems weeks={weeks}
                  startDate={db.forecastStartDate || st.balanceAsOfDate}/>
              </Card>
            </div>

            {/* ── BUDGET ── */}
            <div style={anim(0.46)}>
              <SectionHead icon="◧" title="Budget Snapshot"/>
              <Card style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <BudgetBar label="Food This Week"
                  spent={db.foodSpentThisWeek} total={st.foodWeeklyBudget}
                  left={db.foodLeftThisWeek} period="this week"/>
                <Divider my={0}/>
                <BudgetBar label="Life Budget"
                  spent={db.lifeSpentThisMonth} total={st.lifeMonthlyBudget}
                  left={db.lifeLeftThisMonth} period="this month"/>
              </Card>
            </div>

            {/* ── INSIGHTS ── */}
            {(ins.insight1 || ins.insight2 || ins.insight3) && (
              <div style={anim(0.50)}>
                <SectionHead icon="✦" title="What to Know"/>
                <Card>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[ins.insight1, ins.insight2, ins.insight3].filter(Boolean).map((text, i) => (
                      <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start',
                        paddingBottom: i < 2 ? 12 : 0,
                        borderBottom: i < 2 ? '1px solid var(--border-soft)' : 'none' }}>
                        <span style={{ color:'var(--gold)', fontSize:11, marginTop:1,
                          flexShrink:0, fontFamily:'var(--font-mono)' }}>{i + 1}</span>
                        <p style={{ fontSize:12, color:'var(--ink-muted)', lineHeight:1.7, margin:0 }}>
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── WHERE YOU LAND ── */}
            <div style={anim(0.54)}>
              <SectionHead icon="◎" title="Where You Land"
                sub={`Projected balance by ${fmt(db.forecastEndDate)}`}/>
              <Card style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <SectionLabel>Ending Balance</SectionLabel>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:32,
                    color: endDelta >= 0 ? '#8FB07A' : 'var(--gold)',
                    letterSpacing:'-0.5px', lineHeight:1 }}>
                    {usd(db.forecastEndingBalance)}
                  </div>
                  <div style={{ fontSize:10, color:'var(--ink-muted)',
                    fontFamily:'var(--font-mono)', marginTop:4 }}>
                    {fmt(db.forecastEndDate)}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <SectionLabel>Net Change</SectionLabel>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:22,
                    color: endDelta >= 0 ? '#8FB07A' : 'var(--amber)' }}>
                    {endDelta >= 0 ? '+' : ''}{usd(endDelta)}
                  </div>
                  <div style={{ fontSize:10, color:'var(--ink-muted)', marginTop:2 }}>
                    {endDelta >= 0 ? 'building' : 'drawdown'}
                  </div>
                </div>
              </Card>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ ...anim(0.60), marginTop:48, textAlign:'center', paddingBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
                gap:10, marginBottom:8, opacity:0.3 }}>
                <div style={{ height:'1px', width:40, background:'var(--border)' }}/>
                <CompassMark size={14}/>
                <div style={{ height:'1px', width:40, background:'var(--border)' }}/>
              </div>
              <p style={{ fontSize:10, color:'var(--ink-faint)', fontFamily:'var(--font-mono)' }}>
                Cash Compass ·{' '}
                {isLive
                  ? `synced ${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}`
                  : 'demo data'
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

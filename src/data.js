// ─── WEBHOOK CONFIG ───────────────────────────────────────────────────────────
// Set this to your Cloudflare Worker (or Apps Script Web App) URL.
// Leave empty ('') to run on demo data — great for local preview.
export const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxP-IMxZtYk-F1MbmgDsbch22lyqeMyxpVfoXVUGisogpVcAbPFJJAAPoFGgBayUHmc/exec';
// Example: 'https://script.google.com/macros/s/AKfycbzbw7fhkZFW3xP8dR9ZR_3u95jW1aAGslTE9ailbwCvK-ennXlzHhaeoYMhFxtnBjqSzw/exec'

// ─── PARSERS ──────────────────────────────────────────────────────────────────

/** "$2,057.74" | "($292.00)" | "-" → number */
export function parseMoney(str) {
  if (!str || str === '-' || str === '') return 0;
  const s = String(str).trim();
  const neg = s.startsWith('(') || s.startsWith('-');
  const n = parseFloat(s.replace(/[$(),\s]/g, ''));
  return isNaN(n) ? 0 : neg ? -n : n;
}

/** "3/10/2026" → "2026-03-10" */
export function parseDate(str) {
  if (!str || str === '-') return null;
  const p = String(str).trim().split('/');
  if (p.length !== 3) return str;
  return `${p[2]}-${p[0].padStart(2,'0')}-${p[1].padStart(2,'0')}`;
}

/** "2026-03-10" → "Mar 10" */
export function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "2026-03-10" → "March 10, 2026" */
export function fmtLong(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** number → "$2,057" or "$2,057.74" */
export function usd(n, dec = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  }).format(n);
}

// ─── DEMO DATA — mirrors CSVs exactly ────────────────────────────────────────
export const DEMO = {
  settings: {
    balanceAsOfDate:   '2026-03-10',
    checkingBalance:   2057.74,
    forecastWindowDays: 45,
    minimumBuffer:     500,
    foodWeeklyBudget:  150,
    lifeMonthlyBudget: 200,
  },
  dashboard: {
    forecastStartDate:      '2026-03-10',
    forecastEndDate:        '2026-04-24',
    currentBalance:          2057.74,
    lowestBalance:            608.95,
    tightestCashDay:        '2026-03-20',
    forecastEndingBalance:   4180.03,  // final row of forecast
    bufferGapAtLowPoint:       0,      // '-' in CSV = 0
    safeToSpend:              108.95,
    unclearedTransactions:     35.00,
    foodSpentThisWeek:          0,     // '-' in CSV
    foodLeftThisWeek:         150.00,
    lifeSpentThisMonth:        60.21,
    lifeLeftThisMonth:        139.79,
    daysBelowBuffer:            0,
    daysUntilLowest:            0,
    pressureScore:             84.3,
    pressureLabel:           'Stable',
    compressionType:         'Stable',
    compressionSummary:      'Forecast remains above buffer through the window.',
  },
  insights: {
    summary:     'Cash flow remains stable across the next 45 days with the balance staying comfortably above the buffer and about $1.4K of safe spending flexibility.',
    insight1:    'The tightest point occurs March 20 with a projected balance near $1,957, which still maintains a strong cushion above the protected minimum.',
    insight2:    'Spending flexibility remains healthy with roughly $1,457 available above the lowest projected balance, allowing discretionary spending with reasonable caution.',
    insight3:    'Only minimal uncleared transactions are currently affecting the forecast, and both weekly food and monthly life budgets remain largely intact.',
    lastUpdated: '2026-03-10',
  },
  forecast: [
    { date:'2026-03-14', description:'Louisville Gas & Electric', source:'Recurring', type:'Expense', category:'Housing',         usedAmount:-292,     runningBalance:1765.74 },
    { date:'2026-03-14', description:'Progressive',               source:'Recurring', type:'Expense', category:'Transportation',  usedAmount:-135,     runningBalance:1630.74 },
    { date:'2026-03-15', description:'American Express Business', source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-40,      runningBalance:1590.74 },
    { date:'2026-03-15', description:'Shopify',                   source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-9,       runningBalance:1581.74 },
    { date:'2026-03-15', description:'Student Loan Payment',      source:'Recurring', type:'Expense', category:'Education',       usedAmount:-170,     runningBalance:1411.74 },
    { date:'2026-03-15', description:'DoorDash',                  source:'Recurring', type:'Income',  category:'Gig Income',      usedAmount:750,      runningBalance:2161.74 },
    { date:'2026-03-16', description:'Credit Repayment',          source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-497,     runningBalance:1664.74 },
    { date:'2026-03-18', description:'ChatGPT',                   source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-21.20,   runningBalance:1643.54 },
    { date:'2026-03-19', description:'Xfinity',                   source:'Recurring', type:'Expense', category:'Rental Property', usedAmount:-170,     runningBalance:1473.54 },
    { date:'2026-03-20', description:'American Express',          source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-241,     runningBalance:1232.54 },
    { date:'2026-03-20', description:'Third Federal',             source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-623.59,  runningBalance:608.95  },
    { date:'2026-03-20', description:'Aline Ops',                 source:'Recurring', type:'Income',  category:'Employment',      usedAmount:2088,     runningBalance:2696.95 },
    { date:'2026-03-22', description:'DoorDash',                  source:'Recurring', type:'Income',  category:'Gig Income',      usedAmount:750,      runningBalance:3446.95 },
    { date:'2026-03-26', description:'Car Payment',               source:'Recurring', type:'Expense', category:'Transportation',  usedAmount:-492.53,  runningBalance:2954.42 },
    { date:'2026-03-29', description:'DoorDash',                  source:'Recurring', type:'Income',  category:'Gig Income',      usedAmount:750,      runningBalance:3704.42 },
    { date:'2026-03-30', description:'Apple Card',                source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-125,     runningBalance:3579.42 },
    { date:'2026-03-30', description:'Credit Repayment',          source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-497,     runningBalance:3082.42 },
    { date:'2026-03-30', description:'LinkedIn',                  source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-41,      runningBalance:3041.42 },
    { date:'2026-04-01', description:'Rent',                      source:'Recurring', type:'Expense', category:'Housing',         usedAmount:-2293,    runningBalance:748.42  },
    { date:'2026-04-01', description:'Rental Income',             source:'Recurring', type:'Income',  category:'Rental Property', usedAmount:2500,     runningBalance:3248.42 },
    { date:'2026-04-03', description:'Aline Ops',                 source:'Recurring', type:'Income',  category:'Employment',      usedAmount:2088,     runningBalance:5336.42 },
    { date:'2026-04-04', description:'Amazon Prime',              source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-20,      runningBalance:5316.42 },
    { date:'2026-04-05', description:'Core Electric',             source:'Recurring', type:'Expense', category:'Housing',         usedAmount:-118.13,  runningBalance:5198.29 },
    { date:'2026-04-05', description:'Netflix',                   source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-24.99,   runningBalance:5173.30 },
    { date:'2026-04-05', description:'DoorDash',                  source:'Recurring', type:'Income',  category:'Gig Income',      usedAmount:750,      runningBalance:5923.30 },
    { date:'2026-04-06', description:'Montessori',                source:'Recurring', type:'Expense', category:'Education',       usedAmount:-1180,    runningBalance:4743.30 },
    { date:'2026-04-06', description:'Xcel Energy',               source:'Recurring', type:'Expense', category:'Rental Property', usedAmount:-78.59,   runningBalance:4664.71 },
    { date:'2026-04-09', description:'Boost Mobile',              source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-2.53,    runningBalance:4662.18 },
    { date:'2026-04-09', description:'Mortgage',                  source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-1871.36, runningBalance:2790.82 },
    { date:'2026-04-12', description:'DoorDash',                  source:'Recurring', type:'Income',  category:'Gig Income',      usedAmount:750,      runningBalance:3540.82 },
    { date:'2026-04-13', description:'Credit Repayment',          source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-497,     runningBalance:3043.82 },
    { date:'2026-04-14', description:'Louisville Gas & Electric', source:'Recurring', type:'Expense', category:'Housing',         usedAmount:-292,     runningBalance:2751.82 },
    { date:'2026-04-14', description:'Progressive',               source:'Recurring', type:'Expense', category:'Transportation',  usedAmount:-135,     runningBalance:2616.82 },
    { date:'2026-04-15', description:'American Express Business', source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-40,      runningBalance:2576.82 },
    { date:'2026-04-15', description:'Shopify',                   source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-9,       runningBalance:2567.82 },
    { date:'2026-04-15', description:'Student Loan Payment',      source:'Recurring', type:'Expense', category:'Education',       usedAmount:-170,     runningBalance:2397.82 },
    { date:'2026-04-17', description:'Aline Ops',                 source:'Recurring', type:'Income',  category:'Employment',      usedAmount:2088,     runningBalance:4485.82 },
    { date:'2026-04-18', description:'ChatGPT',                   source:'Recurring', type:'Expense', category:'Subscriptions',   usedAmount:-21.20,   runningBalance:4464.62 },
    { date:'2026-04-19', description:'Xfinity',                   source:'Recurring', type:'Expense', category:'Rental Property', usedAmount:-170,     runningBalance:4294.62 },
    { date:'2026-04-19', description:'DoorDash',                  source:'Recurring', type:'Income',  category:'Gig Income',      usedAmount:750,      runningBalance:5044.62 },
    { date:'2026-04-20', description:'American Express',          source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-241,     runningBalance:4803.62 },
    { date:'2026-04-20', description:'Third Federal',             source:'Recurring', type:'Expense', category:'Credit',          usedAmount:-623.59,  runningBalance:4180.03 },
  ],
  transactions: [
    { date:'2026-03-06', item:'Yearbook',  category:'Education',    amount:-35,     cleared:'No'  },
    { date:'2026-03-06', item:'Disney+',   category:'Subscription', amount:-20.59,  cleared:'Yes' },
    { date:'2026-03-07', item:'McDonalds', category:'Food',         amount:-27.75,  cleared:'Yes' },
    { date:'2026-03-08', item:'Target',    category:'Shopping',     amount:-60.21,  cleared:'Yes' },
    { date:'2026-03-08', item:'Kroger',    category:'Food',         amount:-116.26, cleared:'Yes' },
  ],
};

// ─── WEBHOOK ADAPTER ─────────────────────────────────────────────────────────
// Maps the raw Google Sheets JSON response → the same shape as DEMO above.
// The Worker returns rows keyed by the sheet column names.
export function adaptWebhook(json) {
  const kv = (arr, key) => {
    const row = (arr || []).find(r => r[0] === key || r.Metric === key || r.Setting === key || r.Field === key);
    return row ? (row[1] ?? row.Value ?? '') : '';
  };

  const db  = json.dashboard    || [];
  const st  = json.settings     || [];
  const ins = json.insights     || [];
  const fc  = json.forecast     || [];
  const tx  = json.transactions || [];

  return {
    settings: {
      balanceAsOfDate:    parseDate(kv(st, 'Balance As of Date')),
      checkingBalance:    parseMoney(kv(st, 'Checking Balance')),
      forecastWindowDays: parseInt(kv(st, 'Forecast Window Days')) || 45,
      minimumBuffer:      parseMoney(kv(st, 'Minimum Buffer')),
      foodWeeklyBudget:   parseMoney(kv(st, 'Food Weekly Budget')),
      lifeMonthlyBudget:  parseMoney(kv(st, 'Life Monthly Budget')),
    },
    dashboard: {
      forecastStartDate:      parseDate(kv(db, 'Forecast Start Date')),
      forecastEndDate:        parseDate(kv(db, 'Forecast End Date')),
      currentBalance:         parseMoney(kv(db, 'Current Balance')),
      lowestBalance:          parseMoney(kv(db, 'Lowest Balance')),
      tightestCashDay:        parseDate(kv(db, 'Tightest Cash Day')),
      forecastEndingBalance:  parseMoney(kv(db, 'Forecast Ending Balance')),
      bufferGapAtLowPoint:    parseMoney(kv(db, 'Buffer Gap at Low Point')),
      safeToSpend:            parseMoney(kv(db, 'Safe to Spend')),
      unclearedTransactions:  parseMoney(kv(db, 'Uncleared Transactions')),
      foodSpentThisWeek:      parseMoney(kv(db, 'Food Spent This Week')),
      foodLeftThisWeek:       parseMoney(kv(db, 'Food Left This Week')),
      lifeSpentThisMonth:     parseMoney(kv(db, 'Life Spent This Month')),
      lifeLeftThisMonth:      parseMoney(kv(db, 'Life Left This Month')),
      daysBelowBuffer:        parseInt(kv(db, 'Days Below Buffer'))         || 0,
      daysUntilLowest:        parseInt(kv(db, 'Days Until Lowest Balance')) || 0,
      pressureScore:          parseFloat(kv(db, 'Pressure Score'))          || 0,
      pressureLabel:          kv(db, 'Pressure Label')   || 'Stable',
      compressionType:        kv(db, 'Compression Type') || 'Stable',
      compressionSummary:     kv(db, 'Compression Summary') || '',
    },
    insights: {
      summary:     kv(ins, '45-Day Summary'),
      insight1:    kv(ins, 'Insight 1'),
      insight2:    kv(ins, 'Insight 2'),
      insight3:    kv(ins, 'Insight 3'),
      lastUpdated: parseDate(kv(ins, 'Last Updated')),
    },
    forecast: fc.map(r => ({
      date:           parseDate(r.Date        || r[0]),
      description:    r.Description           || r[1] || '',
      source:         r.Source                || r[2] || '',
      type:           r.Type                  || r[3] || '',
      category:       r.Category              || r[4] || '',
      plannedAmount:  parseMoney(r.Planned_Amount  || r[6]),
      usedAmount:     parseMoney(r.Used_Amount     || r[8]),
      runningBalance: parseMoney(r.Running_Balance || r[9]),
      notes:          r.Notes                 || r[10] || '',
    })),
    transactions: tx.map(r => ({
      date:     parseDate(r.Date     || r[0]),
      item:     r.Item               || r[1] || '',
      category: r.Category           || r[3] || '',
      amount:   parseMoney(r.Amount  || r[4]),
      cleared:  r.Cleared            || r[5] || 'No',
    })),
  };
}

// ─── FETCH ────────────────────────────────────────────────────────────────────
export async function fetchData() {
  if (!WEBHOOK_URL) {
    await new Promise(r => setTimeout(r, 550)); // simulate load
    return { data: DEMO, source: 'demo' };
  }
  try {
    const res = await fetch(WEBHOOK_URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { data: adaptWebhook(json), source: 'live' };
  } catch (e) {
    console.warn('Webhook failed, using demo data:', e.message);
    return { data: DEMO, source: 'fallback' };
  }
}

// ─── GROUPING ─────────────────────────────────────────────────────────────────
export function groupByWeek(items, windowDays, startIso) {
  const origin  = new Date(startIso + 'T12:00:00');
  const cutoff  = new Date(origin);
  cutoff.setDate(cutoff.getDate() + windowDays);

  const visible = items.filter(f => {
    if (!f.date) return false;
    const d = new Date(f.date + 'T12:00:00');
    return d >= origin && d <= cutoff;
  });

  const map = new Map();
  visible.forEach(item => {
    const d   = new Date(item.date + 'T12:00:00');
    const dow = d.getDay();
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((dow + 6) % 7));
    const key = mon.toISOString().split('T')[0];

    if (!map.has(key)) {
      const end = new Date(mon); end.setDate(end.getDate() + 6);
      const f   = dt => dt.toLocaleDateString('en-US', { month:'short', day:'numeric' });
      map.set(key, { key, label:`${f(mon)} – ${f(end)}`, days: new Map(), net: 0 });
    }
    const wk = map.get(key);
    if (!wk.days.has(item.date)) wk.days.set(item.date, []);
    wk.days.get(item.date).push(item);
    wk.net += item.usedAmount || 0;
  });

  return Array.from(map.values()).map(w => ({
    ...w,
    sortedDays: Array.from(w.days.entries()).sort(([a],[b]) => a.localeCompare(b)),
  }));
}

// Pressure label → colors
export function pressureColors(label) {
  const map = {
    'Stable':        { text:'#6B8F5E', bg:'rgba(107,143,94,0.12)',  border:'rgba(107,143,94,0.25)',  dot:'#6B8F5E' },
    'Watch':         { text:'#C9A84C', bg:'rgba(201,168,76,0.12)',  border:'rgba(201,168,76,0.25)',  dot:'#C9A84C' },
    'Tight':         { text:'#D4813A', bg:'rgba(212,129,58,0.12)',  border:'rgba(212,129,58,0.25)',  dot:'#D4813A' },
    'High Pressure': { text:'#C45A4A', bg:'rgba(196,90,74,0.12)',   border:'rgba(196,90,74,0.25)',   dot:'#C45A4A' },
  };
  return map[label] || map['Stable'];
}

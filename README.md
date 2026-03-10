# Cash Compass

Personal 45-day cash flow clarity dashboard. Connects to Google Sheets via webhook, deployed via GitHub Pages.

---

## Quick Start (local preview — no backend needed)

```bash
npm install
npm run dev
# → http://localhost:5173
```

The dashboard runs on demo data from your CSVs immediately.

---

## File Structure

```
cash-compass/
├── .github/workflows/deploy.yml   GitHub Actions → GitHub Pages
├── src/
│   ├── main.jsx                   React entry
│   ├── App.jsx                    Main dashboard
│   ├── index.css                  Global styles + fonts
│   ├── data.js                    ← DATA LAYER: set WEBHOOK_URL here
│   └── components/
│       ├── ForecastChart.jsx      SVG line chart
│       ├── UpcomingItems.jsx      Week paginator
│       └── UI.jsx                 Card, Badge, BudgetBar, etc.
├── index.html
├── vite.config.js
└── package.json
```

---

## Connecting to Google Sheets

### 1 — Set your webhook URL

Open `src/data.js` and update line ~8:

```js
export const WEBHOOK_URL = 'https://your-worker.your-name.workers.dev';
```

### 2 — Webhook response format

Your Cloudflare Worker (or Apps Script Web App) must return JSON
with these top-level keys:

```json
{
  "settings":     [ ["Setting", "Value"], ... ],
  "dashboard":    [ ["Metric",  "Value"], ... ],
  "insights":     [ ["Field",   "Value"], ... ],
  "forecast":     [ { "Date":"3/14/2026", "Description":"...", "Type":"Expense", "Category":"Housing", "Used_Amount":"($292.00)", "Running_Balance":"$1,765.74" }, ... ],
  "transactions": [ { "Date":"3/6/2026",  "Item":"Yearbook", "Category":"Education", "Amount":"($35.00)", "Cleared":"No" }, ... ]
}
```

The `adaptWebhook()` function in `src/data.js` handles all parsing
(currency strings, date formats, etc.) automatically.

### 3 — Expected sheet column names

**Settings tab:** Balance As of Date · Checking Balance · Forecast Window Days · Minimum Buffer · Food Weekly Budget · Life Monthly Budget

**Dashboard_Data tab:** Forecast Start Date · Forecast End Date · Current Balance · Lowest Balance · Tightest Cash Day · Forecast Ending Balance · Buffer Gap at Low Point · Safe to Spend · Uncleared Transactions · Food Spent This Week · Food Left This Week · Life Spent This Month · Life Left This Month · Days Below Buffer · Days Until Lowest Balance · Pressure Score · Pressure Label · Compression Type · Compression Summary

**AI_Insights tab:** 45-Day Summary · Insight 1 · Insight 2 · Insight 3 · Last Updated

---

## Deploying to GitHub Pages

### Automated (recommended)

1. Push repo to GitHub
2. Go to **Settings → Pages → Source** → select **GitHub Actions**
3. Every push to `main` triggers a build + deploy automatically

Live URL: `https://yourname.github.io/cash-compass/`

**Important:** If deploying to a subdirectory, update `vite.config.js`:
```js
base: '/cash-compass/',
```
For root domain / custom domain, keep `base: '/'`.

### Manual

```bash
npm run build
# Upload dist/ contents to any static host
```

---

## Customising

**Default forecast window:** Change `useState(45)` in `src/App.jsx`

**Category icons:** Edit the `ICONS` map in `src/components/UpcomingItems.jsx`

**Pressure label thresholds:** Edit `pressureColors()` in `src/data.js`

**Demo data:** Edit the `DEMO` object in `src/data.js` — mirrors your CSV structure exactly

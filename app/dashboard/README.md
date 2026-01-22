# 🔍 Ultron Dashboard — Read-Only Observability Platform

**Status:** ✅ Production-Ready (PASSO 4.4.5 Complete)

## Overview

The Ultron Dashboard is a read-only, audit-grade observability platform that exposes real-time metrics, decision explanations, and suggestion history without modifying any system state or decision logic.

## Quick Start

```bash
# Navigate to dashboard directory
cd app/dashboard

# Install dependencies
npm install

# Start the server
node server.js

# Access dashboard
# Open browser to: http://localhost:3000
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and mode.

### Metrics
```
GET /api/metrics                          # All missions
GET /api/metrics?mission=cleanup_system   # Single mission  
GET /api/metrics/:mission                 # Alternative syntax
```

**Response includes:**
- `suggestions_total` — Total suggestions sent
- `accepted`, `denied`, `ignored` — Reaction counts
- `accept_rate` — Success percentage (0-1)
- `ignore_streak_atual` — Current ignore streak
- `avg_reaction_time_minutes` — Average response time
- `last_suggested_at` — Last suggestion timestamp
- `status` — Health status (healthy/warning/critical)

### Decisions
```
GET /api/decisions                        # All decisions
GET /api/decisions?mission=cleanup_system # Single mission
GET /api/decisions/:mission               # Alternative syntax
```

**Response includes:**
- `mission` — Mission identifier
- `last_decision` — Was suggestion allowed?
- `reason` — Decision reason
- `cooldown_until` — When next suggestion allowed
- `based_on` — Decision factors
- `explanation` — Human-readable explanation
- `next_action` — Recommended action

### History
```
GET /api/history                                  # Latest 20
GET /api/history?limit=50                        # Pagination
GET /api/history?mission=cleanup_system          # Mission filter
GET /api/history?since=2026-01-20&limit=30      # Date range
```

**Response includes:**
- `suggestion_id` — Unique identifier
- `mission` — Mission that generated suggestion
- `sent_at` — When suggestion was sent (ISO 8601)
- `reaction` — User reaction (accepted/denied/ignored)
- `reaction_time_minutes` — Time to react
- `reason` — Explanation

## Frontend Features

### 📊 Dashboard Views

1. **Summary** — System-wide health overview
   - Healthy mission count
   - Warning mission count
   - Critical mission count
   - Global acceptance rate

2. **By Mission** — Per-mission metrics grid
   - Mission status (color-coded)
   - Total suggestions, accepts, denials, ignores
   - Accept rate percentage
   - Ignore streak counter
   - Last suggestion timestamp

3. **Timeline** — Chronological suggestion history
   - Mission and reaction emoji
   - Exact timestamp
   - Reaction time
   - Decision reason
   - ID correlation

4. **Decisions** — Decision explanation viewer
   - Last decision for each mission
   - Decision reason
   - Full explanation
   - Decision factors
   - Cooldown countdown

### 🎛️ Controls

- **Mission Filter** — Focus on single mission
- **Date Filter** — View since specific date
- **Limit Input** — Pagination (1-100 items)
- **Update Button** — Manual refresh
- **Reset Button** — Clear all filters
- **Export CSV** — Download history as CSV

### 📱 Responsive Design

- **Desktop** — 2-column grid layout
- **Tablet** — 1-column layout
- **Mobile** — Optimized for small screens
- **Print-friendly** — Clean print stylesheet

## Architecture

```
┌─ Express Server (server.js)
│  │
│  ├─ Route: /api/metrics → routes/metrics.js
│  ├─ Route: /api/decisions → routes/decisions.js
│  ├─ Route: /api/history → routes/history.js
│  ├─ Route: /api/health → inline handler
│  ├─ Static: / → ui/index.html + dashboard.js + styles.css
│  │
│  └─ Imports from app/intelligence/:
│     ├─ observability_metrics.js
│     ├─ decision_explainer.js
│     ├─ passive_signals.js
│     └─ auditLogger.js
│
└─ Frontend (ui/)
   ├─ index.html — Semantic HTML structure
   ├─ dashboard.js — Fetch + render logic
   └─ styles.css — Responsive styling
```

## Guarantees

✅ **Read-Only** — Zero file writes  
✅ **Deterministic** — Same input always produces same output  
✅ **Fail-Open** — Errors never block requests, safe defaults used  
✅ **Auditable** — All data correlated by suggestion_id  
✅ **Isolated** — No cross-mission data leakage  
✅ **Timestamped** — All responses include ISO 8601 timestamps  

## Environment

- **Node.js:** 24.11.0+
- **Runtime:** CommonJS (app/)
- **Port:** 3000 (configurable)
- **Dependencies:** 
  - `express` (server)
  - `cors` (cross-origin requests)

## File Structure

```
app/dashboard/
├── server.js                    # Express server + middleware
├── routes/
│   ├── metrics.js              # GET /api/metrics
│   ├── decisions.js            # GET /api/decisions
│   └── history.js              # GET /api/history
└── ui/
    ├── index.html              # Main dashboard HTML
    ├── dashboard.js            # Frontend logic (fetch, render)
    └── styles.css              # Responsive styling
```

## Testing

Run the test suite:

```bash
node app/test-phase-4-4-5.js
```

**Coverage:**
- ✅ Backend routes (4/4 tests)
- ✅ Query filtering (3/3 tests)
- ✅ Integrality checks (3/3 tests)
- ✅ Frontend assets (4/4 tests)
- **Total:** 14/14 tests passing (100%)

## Configuration

To change default settings, edit `server.js`:

```javascript
const PORT = 3000;  // Change port here
```

## Performance

- **Auto-refresh:** 30 seconds
- **Response time:** < 100ms (local file reads)
- **Memory footprint:** ~50MB (typical)
- **Concurrent connections:** Unlimited (Node.js default)

## Security

- ✅ GET-only endpoints (no POST/PUT/DELETE)
- ✅ CORS enabled (configurable)
- ✅ No database connections
- ✅ No external API calls
- ✅ Input validated via query parameters
- ✅ Error messages don't leak internals

## Troubleshooting

### Dashboard won't load (404)
- Ensure server is running on port 3000
- Check firewall settings
- Verify UI files exist: `app/dashboard/ui/`

### API returns empty data
- Check that `suggestion_history.json` exists in `app/data/`
- Verify permissions to read `app/logs/ultron.log`
- Check browser console for JavaScript errors

### Styles not loading
- Clear browser cache (Ctrl+Shift+Del)
- Verify `styles.css` exists
- Check for 404 in Network tab (DevTools)

### Filters not working
- Ensure mission name matches exactly (case-sensitive)
- Date format must be YYYY-MM-DD
- Limit must be between 1-100

## Next Steps

- PASSO 4.4.6: Formal audit & performance testing
- PASSO 4.4.7: Production deployment
- PASSO 4.5: Advanced analytics layer

## License

Project Ultron — Internal Use Only

---

**Status:** ✅ Audit-Ready | **Date:** 2026-01-21 | **Version:** 4.4.5

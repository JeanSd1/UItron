/**
 * PASSO 4.4.4 — Exportadores de eventos
 * 
 * FASE 4: Export Decisions
 * 
 * Uso:
 * node app/tools/export-decisions.js --format=json [--since=2026-01-20] [--mission=cleanup]
 * node app/tools/export-decisions.js --format=csv > decisions.csv
 * 
 * Lê logs de auditoria e agrupa por decisão/missão
 */

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../logs/ultron.log');

/**
 * Carregar logs com fail-open
 */
function loadLogs() {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return [];
    }

    const rawData = fs.readFileSync(LOG_PATH, 'utf8');
    if (!rawData || rawData.trim() === '') {
      return [];
    }

    return rawData
      .split('\n')
      .filter(l => l.trim())
      .map(l => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return null;
        }
      })
      .filter(l => l !== null);
  } catch (err) {
    console.error(`[ERROR] Failed to load logs: ${err.message}`);
    return [];
  }
}

/**
 * Extrair decisões dos logs de policy
 */
function extractDecisions(logs) {
  return logs.filter(l =>
    l.level === 'POLICY' &&
    l.event_type === 'suggestion_policy_decision'
  ).map(l => ({
    timestamp: l.timestamp,
    suggestion_id: l.suggestion_id || null,
    mission: l.mission || null,
    decision: l.decision,
    policy_name: l.policy_name || null,
    metrics: l.metrics || {},
    next_allowed_at: l.next_allowed_at || null
  }));
}

/**
 * Filtrar decisões por critérios
 */
function filterDecisions(decisions, options = {}) {
  let filtered = decisions;

  // Filtrar por missão
  if (options.mission) {
    filtered = filtered.filter(d => d.mission === options.mission);
  }

  // Filtrar por decisão
  if (options.decision) {
    filtered = filtered.filter(d => d.decision === options.decision);
  }

  // Filtrar por data (desde)
  if (options.since) {
    const sinceDate = new Date(options.since);
    filtered = filtered.filter(d => new Date(d.timestamp) >= sinceDate);
  }

  return filtered;
}

/**
 * Exportar como JSON
 */
function exportAsJson(decisions) {
  // Agrupar por missão
  const byMission = {};
  decisions.forEach(d => {
    if (!byMission[d.mission]) {
      byMission[d.mission] = [];
    }
    byMission[d.mission].push(d);
  });

  // Contar decisões
  const summary = {
    total_decisions: decisions.length,
    allowed: decisions.filter(d => d.decision === 'allowed').length,
    blocked: decisions.filter(d => d.decision === 'blocked').length,
    by_mission: Object.keys(byMission).reduce((acc, mission) => {
      acc[mission] = {
        total: byMission[mission].length,
        allowed: byMission[mission].filter(d => d.decision === 'allowed').length,
        blocked: byMission[mission].filter(d => d.decision === 'blocked').length
      };
      return acc;
    }, {})
  };

  return JSON.stringify({
    export_timestamp: new Date().toISOString(),
    summary,
    decisions: decisions
  }, null, 2);
}

/**
 * Exportar como CSV (RFC 4180)
 */
function exportAsCsv(decisions) {
  const headers = [
    'timestamp',
    'suggestion_id',
    'mission',
    'decision',
    'policy_name',
    'next_allowed_at'
  ];

  const escapeField = (field) => {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [headers.join(',')];

  decisions.forEach(d => {
    const row = [
      d.timestamp,
      d.suggestion_id || '',
      d.mission,
      d.decision,
      d.policy_name || '',
      d.next_allowed_at || ''
    ].map(escapeField);
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2);
  let format = 'json';
  let mission = null;
  let decision = null;
  let since = null;

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--format=')) {
      format = arg.split('=')[1];
    } else if (arg.startsWith('--mission=')) {
      mission = arg.split('=')[1];
    } else if (arg.startsWith('--decision=')) {
      decision = arg.split('=')[1];
    } else if (arg.startsWith('--since=')) {
      since = arg.split('=')[1];
    }
  });

  // Validar format
  if (!['json', 'csv'].includes(format)) {
    console.error(`[ERROR] Invalid format: ${format}. Use json or csv.`);
    process.exit(1);
  }

  // Carregar, extrair e filtrar
  const logs = loadLogs();
  const decisions = extractDecisions(logs);
  const filtered = filterDecisions(decisions, { mission, decision, since });

  // Exportar
  let output;
  if (format === 'json') {
    output = exportAsJson(filtered);
  } else if (format === 'csv') {
    output = exportAsCsv(filtered);
  }

  console.log(output);
}

// Exportar para uso programático também
module.exports = {
  loadLogs,
  extractDecisions,
  filterDecisions,
  exportAsJson,
  exportAsCsv
};

// Executar CLI se chamado diretamente
if (require.main === module) {
  main();
}

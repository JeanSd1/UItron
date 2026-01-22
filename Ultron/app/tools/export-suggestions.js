/**
 * PASSO 4.4.4 — Exportadores de eventos
 * 
 * FASE 4: Export Suggestions
 * 
 * Uso:
 * node app/tools/export-suggestions.js --format=json [--mission=cleanup_system]
 * node app/tools/export-suggestions.js --format=csv > suggestions.csv
 * 
 * Formatos suportados:
 * - json: Array de sugestões com metadados
 * - csv: RFC 4180 (Excel-compatible)
 */

const fs = require('fs');
const path = require('path');

const HISTORY_PATH = path.join(__dirname, '../data/suggestion_history.json');

/**
 * Carregar sugestões com fail-open
 */
function loadSuggestions() {
  try {
    if (!fs.existsSync(HISTORY_PATH)) {
      return [];
    }

    const rawData = fs.readFileSync(HISTORY_PATH, 'utf8');
    if (!rawData || rawData.trim() === '') {
      return [];
    }

    const data = JSON.parse(rawData);
    return Array.isArray(data.suggestions) ? data.suggestions : [];
  } catch (err) {
    console.error(`[ERROR] Failed to load suggestions: ${err.message}`);
    return [];
  }
}

/**
 * Filtrar sugestões por critérios
 */
function filterSuggestions(suggestions, options = {}) {
  let filtered = suggestions;

  // Filtrar por missão
  if (options.mission) {
    filtered = filtered.filter(s => s.mission === options.mission);
  }

  // Filtrar por reação
  if (options.reaction) {
    filtered = filtered.filter(s => s.reaction === options.reaction);
  }

  // Filtrar por data (desde)
  if (options.since) {
    const sinceDate = new Date(options.since);
    filtered = filtered.filter(s => new Date(s.sent_at || 0) >= sinceDate);
  }

  return filtered;
}

/**
 * Exportar como JSON
 */
function exportAsJson(suggestions) {
  const export_data = {
    export_timestamp: new Date().toISOString(),
    total_records: suggestions.length,
    suggestions: suggestions.map(s => ({
      suggestion_id: s.suggestion_id || null,
      mission: s.mission,
      sent_at: s.sent_at,
      reaction: s.reaction || null,
      reaction_time_minutes: s.reaction_time_minutes || null,
      reason: s.reason || null
    }))
  };

  return JSON.stringify(export_data, null, 2);
}

/**
 * Exportar como CSV (RFC 4180)
 */
function exportAsCsv(suggestions) {
  const headers = [
    'suggestion_id',
    'mission',
    'sent_at',
    'reaction',
    'reaction_time_minutes',
    'reason'
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

  suggestions.forEach(s => {
    const row = [
      s.suggestion_id || '',
      s.mission || '',
      s.sent_at || '',
      s.reaction || '',
      s.reaction_time_minutes !== undefined ? s.reaction_time_minutes : '',
      s.reason || ''
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
  let reaction = null;
  let since = null;

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--format=')) {
      format = arg.split('=')[1];
    } else if (arg.startsWith('--mission=')) {
      mission = arg.split('=')[1];
    } else if (arg.startsWith('--reaction=')) {
      reaction = arg.split('=')[1];
    } else if (arg.startsWith('--since=')) {
      since = arg.split('=')[1];
    }
  });

  // Validar format
  if (!['json', 'csv'].includes(format)) {
    console.error(`[ERROR] Invalid format: ${format}. Use json or csv.`);
    process.exit(1);
  }

  // Carregar e filtrar
  const suggestions = loadSuggestions();
  const filtered = filterSuggestions(suggestions, { mission, reaction, since });

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
  loadSuggestions,
  filterSuggestions,
  exportAsJson,
  exportAsCsv
};

// Executar CLI se chamado diretamente
if (require.main === module) {
  main();
}

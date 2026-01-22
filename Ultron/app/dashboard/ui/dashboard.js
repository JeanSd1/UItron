/**
 * Ultron Dashboard — Client-Side Logic (Read-Only)
 */

// Estado global
let currentState = {
  metrics: null,
  decisions: null,
  history: null,
  filters: {
    mission: '',
    since: '',
    limit: 20
  }
};

// === Inicialização ===
document.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  loadAllData();
  // Auto-refresh a cada 30s
  setInterval(loadAllData, 30000);
});

// === Health Check ===
async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    
    if (data.status === 'ok') {
      statusDot.classList.add('online');
      statusText.textContent = '🟢 Online';
    }
  } catch (err) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    statusDot.classList.remove('online');
    statusText.textContent = '🔴 Offline';
  }
}

// === Carregar Dados ===
async function loadAllData() {
  try {
    // Parallel fetch
    const [metricsRes, decisionsRes, historyRes] = await Promise.all([
      fetch('/api/metrics'),
      fetch('/api/decisions'),
      fetch(`/api/history?mission=${currentState.filters.mission}&limit=${currentState.filters.limit}${currentState.filters.since ? `&since=${currentState.filters.since}` : ''}`)
    ]);

    currentState.metrics = await metricsRes.json();
    currentState.decisions = await decisionsRes.json();
    currentState.history = await historyRes.json();

    renderAllViews();
    updateLastUpdate();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    showError('Falha ao carregar dados do servidor');
  }
}

// === Filtros ===
function applyFilters() {
  currentState.filters.mission = document.getElementById('missionFilter').value;
  currentState.filters.since = document.getElementById('sinceFilter').value;
  currentState.filters.limit = parseInt(document.getElementById('limitFilter').value) || 20;
  loadAllData();
}

function resetFilters() {
  document.getElementById('missionFilter').value = '';
  document.getElementById('sinceFilter').value = '';
  document.getElementById('limitFilter').value = '20';
  currentState.filters = { mission: '', since: '', limit: 20 };
  loadAllData();
}

// === Renderização ===
function renderAllViews() {
  renderSummary();
  renderMissions();
  renderTimeline();
  renderDecisions();
}

// View 1: Resumo Geral
function renderSummary() {
  const container = document.getElementById('summaryContent');
  
  if (!currentState.metrics || !currentState.metrics.data) {
    container.innerHTML = '<p class="error">Nenhum dado disponível</p>';
    return;
  }

  const health = currentState.metrics.data.health;
  
  const html = `
    <div class="summary-grid">
      <div class="summary-card healthy">
        <div class="card-value">${health.healthy}</div>
        <div class="card-label">✅ Saudáveis</div>
      </div>
      <div class="summary-card warning">
        <div class="card-value">${health.warning}</div>
        <div class="card-label">⚠️ Aviso</div>
      </div>
      <div class="summary-card critical">
        <div class="card-value">${health.critical}</div>
        <div class="card-label">🔴 Crítico</div>
      </div>
      <div class="summary-card info">
        <div class="card-value">${health.total}</div>
        <div class="card-label">📊 Total</div>
      </div>
    </div>
    <div class="summary-stats">
      <p><strong>Taxa de Aceitação Global:</strong> ${(health.overall_accept_rate * 100).toFixed(1)}%</p>
      <p><strong>Status do Sistema:</strong> ${health.system_status}</p>
    </div>
  `;
  
  container.innerHTML = html;
}

// View 2: Métricas por Missão
function renderMissions() {
  const container = document.getElementById('missionsContent');
  
  if (!currentState.metrics || !currentState.metrics.data || !currentState.metrics.data.missions) {
    container.innerHTML = '<p class="error">Nenhum dado disponível</p>';
    return;
  }

  const missions = currentState.metrics.data.missions;
  let html = '<div class="missions-list">';
  
  missions.forEach(m => {
    const statusIcon = m.status === 'healthy' ? '✅' : m.status === 'warning' ? '⚠️' : '🔴';
    html += `
      <div class="mission-card ${m.status}">
        <div class="mission-header">
          <span class="mission-name">${statusIcon} ${m.mission}</span>
          <span class="mission-status">${m.status.toUpperCase()}</span>
        </div>
        <div class="mission-metrics">
          <p>Total: <strong>${m.suggestions_total}</strong></p>
          <p>Aceitas: <strong>${m.accepted}</strong> | Negadas: <strong>${m.denied}</strong> | Ignoradas: <strong>${m.ignored}</strong></p>
          <p>Taxa: <strong>${(m.accept_rate * 100).toFixed(1)}%</strong></p>
          <p>Streak Ignorado: <strong>${m.ignore_streak_atual}</strong></p>
          <p>Última sugestão: <strong>${new Date(m.last_suggested_at).toLocaleString()}</strong></p>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// View 3: Linha do Tempo
function renderTimeline() {
  const container = document.getElementById('timelineContent');
  
  if (!currentState.history || !currentState.history.data) {
    container.innerHTML = '<p class="error">Nenhum histórico disponível</p>';
    return;
  }

  const suggestions = currentState.history.data;
  
  if (suggestions.length === 0) {
    container.innerHTML = '<p class="info">Nenhuma sugestão encontrada com os filtros aplicados</p>';
    return;
  }

  let html = '<div class="timeline-list">';
  
  suggestions.forEach((s, idx) => {
    const reactionIcon = s.reaction === 'accepted' ? '✅' : s.reaction === 'denied' ? '❌' : s.reaction === 'ignored' ? '⏭️' : '❓';
    html += `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-mission">${s.mission}</span>
            <span class="timeline-reaction">${reactionIcon} ${s.reaction || 'sem reação'}</span>
            <span class="timeline-time">${new Date(s.sent_at).toLocaleString()}</span>
          </div>
          <div class="timeline-details">
            <p>ID: <code>${s.suggestion_id || 'N/A'}</code></p>
            ${s.reaction_time_minutes ? `<p>Tempo: <strong>${s.reaction_time_minutes.toFixed(1)}m</strong></p>` : ''}
            ${s.reason ? `<p>Motivo: <em>${s.reason}</em></p>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// View 4: Explicações de Decisão
function renderDecisions() {
  const container = document.getElementById('decisionsContent');
  
  if (!currentState.decisions || !currentState.decisions.data) {
    container.innerHTML = '<p class="error">Nenhuma decisão disponível</p>';
    return;
  }

  const decisions = currentState.decisions.data;
  
  if (decisions.length === 0) {
    container.innerHTML = '<p class="info">Nenhuma decisão encontrada com os filtros aplicados</p>';
    return;
  }

  let html = '<div class="decisions-list">';
  
  decisions.forEach(d => {
    const icon = d.last_decision === 'allowed' ? '✅' : '❌';
    html += `
      <div class="decision-card">
        <div class="decision-header">
          <span class="decision-mission">${d.mission}</span>
          <span class="decision-status">${icon} ${d.last_decision}</span>
        </div>
        <div class="decision-body">
          <p><strong>Motivo:</strong> ${d.reason}</p>
          <p><strong>Explicação:</strong> ${d.explanation}</p>
          <p><strong>Baseado em:</strong> ${d.based_on.join(', ')}</p>
          ${d.cooldown_until ? `<p><strong>Cooldown até:</strong> ${new Date(d.cooldown_until).toLocaleString()}</p>` : ''}
          <p><strong>Próxima ação:</strong> ${d.next_action}</p>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// === Exportação ===
function exportData() {
  if (!currentState.history || !currentState.history.data) {
    alert('Nenhum dado para exportar');
    return;
  }

  const suggestions = currentState.history.data;
  const csv = convertToCSV(suggestions);
  downloadCSV(csv, 'ultron-history.csv');
}

function convertToCSV(data) {
  const headers = ['suggestion_id', 'mission', 'sent_at', 'reaction', 'reaction_time_minutes', 'reason'];
  const rows = data.map(s => [
    s.suggestion_id || '',
    s.mission,
    s.sent_at,
    s.reaction || '',
    s.reaction_time_minutes || '',
    s.reason || ''
  ]);

  const csv = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.map(cell => {
      const str = String(cell);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(','))
  ].join('\n');

  return csv;
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// === Helpers ===
function updateLastUpdate() {
  document.getElementById('lastUpdate').textContent = `Última atualização: ${new Date().toLocaleString()}`;
}

function showError(message) {
  console.error(message);
  // Poderia mostrar toast/modal
}

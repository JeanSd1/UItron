/**
 * PASSO 5.1.1 — Intent Router (Read-Only)
 * 
 * Parse voice input into intents
 * Whitelist/Blacklist enforcement
 * No execution, only explanation
 * Deterministic routing
 */

const { auditLog } = require('./voice_logger');

class IntentRouter {
  constructor(config = {}) {
    this.config = {
      command_whitelist: config.command_whitelist || [
        'status',
        'metrics',
        'explain',
        'report',
        'help',
        'history',
        'decisions'
      ],
      command_blacklist: config.command_blacklist || [
        'execute',
        'run',
        'modify',
        'change',
        'delete',
        'create',
        'write'
      ]
    };

    this.intent_patterns = this.buildPatterns();
  }

  /**
   * Build intent recognition patterns
   */
  buildPatterns() {
    return {
      status: {
        patterns: ['estado', 'status', 'como está', 'situação', 'current'],
        keywords: ['sistema', 'ultron', 'geral']
      },
      metrics: {
        patterns: ['metrica', 'metrics', 'numeros', 'dados', 'volume', 'mostrar'],
        keywords: ['sugestao', 'missao', 'aceita', 'negada']
      },
      explain: {
        patterns: ['explica', 'por quê', 'motivo', 'razão', 'explain', 'why'],
        keywords: ['bloqueado', 'negado', 'descisão', 'sugestão']
      },
      history: {
        patterns: ['histórico', 'history', 'passado', 'último', 'recente'],
        keywords: ['sugestão', 'evento', 'log']
      },
      decisions: {
        patterns: ['decisão', 'decision', 'escolha', 'determina'],
        keywords: ['policy', 'regra', 'critério']
      },
      help: {
        patterns: ['ajuda', 'help', 'como usar', 'comando', 'o que você faz'],
        keywords: ['ultron', 'voz', 'interface']
      }
    };
  }

  /**
   * Route text to intent (deterministic)
   */
  routeIntent(text) {
    const start_time = Date.now();

    try {
      const normalized = this.normalizeText(text);

      auditLog({
        event_type: 'intent_routing_start',
        input_text: text,
        normalized_text: normalized
      });

      // Check blacklist first (safety)
      const blacklistMatch = this.checkBlacklist(normalized);
      if (blacklistMatch) {
        auditLog({
          event_type: 'intent_routing_blocked',
          reason: 'blacklist_match',
          matched_word: blacklistMatch,
          processing_time_ms: Date.now() - start_time
        });

        return {
          success: false,
          intent: 'blocked',
          reason: `Command contains blocked word: "${blacklistMatch}"`,
          confidence: 1.0,
          allowed: false
        };
      }

      // Check whitelist (primary routing)
      const intent = this.findIntent(normalized);

      if (!intent) {
        auditLog({
          event_type: 'intent_routing_unrecognized',
          normalized_text: normalized,
          processing_time_ms: Date.now() - start_time
        });

        return {
          success: false,
          intent: 'unknown',
          reason: 'Could not determine intent',
          confidence: 0.0,
          allowed: false
        };
      }

      auditLog({
        event_type: 'intent_routing_success',
        intent,
        confidence: 0.95,
        processing_time_ms: Date.now() - start_time
      });

      return {
        success: true,
        intent,
        reason: 'Intent recognized',
        confidence: 0.95,
        allowed: true
      };
    } catch (err) {
      auditLog({
        event_type: 'intent_routing_error',
        error: err.message,
        processing_time_ms: Date.now() - start_time
      });

      return {
        success: false,
        intent: 'error',
        reason: err.message,
        confidence: 0.0,
        allowed: false
      };
    }
  }

  /**
   * Find matching intent from patterns (deterministic)
   */
  findIntent(normalized) {
    for (const [intentName, intentData] of Object.entries(this.intent_patterns)) {
      // Check if any pattern matches
      for (const pattern of intentData.patterns) {
        if (normalized.includes(pattern)) {
          return intentName;
        }
      }
    }
    return null;
  }

  /**
   * Check if text contains blacklisted words (safety first)
   */
  checkBlacklist(normalized) {
    for (const word of this.config.command_blacklist) {
      if (normalized.includes(word)) {
        return word;
      }
    }
    return null;
  }

  /**
   * Normalize text for intent matching (deterministic)
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Convert intent to query parameters for Ultron Core
   */
  intentToQuery(intent) {
    const queryMap = {
      status: {
        type: 'read',
        query: 'system_status',
        module: 'observability_metrics'
      },
      metrics: {
        type: 'read',
        query: 'all_missions_metrics',
        module: 'observability_metrics'
      },
      explain: {
        type: 'read',
        query: 'decision_explanations',
        module: 'decision_explainer'
      },
      history: {
        type: 'read',
        query: 'recent_history',
        module: 'suggestion_history',
        limit: 10
      },
      decisions: {
        type: 'read',
        query: 'decision_log',
        module: 'decision_explainer'
      },
      help: {
        type: 'read',
        query: 'voice_help',
        module: 'voice_interface'
      }
    };

    return queryMap[intent] || null;
  }

  /**
   * Enforce safety: no execution intents allowed
   */
  enforceReadOnly(intent) {
    const executionIntents = ['run', 'execute', 'modify', 'change', 'delete'];
    return !executionIntents.includes(intent);
  }
}

module.exports = IntentRouter;

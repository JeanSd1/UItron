# 🎙️ Ultron Voice Interface - PASSO 5.1.1

Sistema de interface de voz para Ultron. Implementação production-ready, offline-first, read-only e audit-grade.

## 🎯 Características

- ✅ **Push-to-talk**: Sem escuta passiva contínua
- ✅ **Offline-first**: STT local com fallback para API
- ✅ **Read-only**: Apenas consultas, zero modificações
- ✅ **Audit trail**: Logging estruturado de todos os eventos
- ✅ **Segurança**: Whitelist/blacklist de intents e keywords bloqueados
- ✅ **Determinístico**: Mesma entrada = mesma saída sempre
- ✅ **Voz nativa**: TTS do Windows integrado

## 📁 Estrutura de Arquivos

```
app/voice/
├── voice_config.json              # Configuração centralizada
├── voice_listener_simple.js        # Captura de áudio (push-to-talk)
├── voice_transcriber_simple.js     # STT com offline-first
├── intent_router_simple.js         # Roteamento determinístico de intents
├── voice_responder_simple.js       # Geração de respostas
├── voice_logger_simple.js          # Auditoria estruturada
├── voice_adapter_simple.js         # Orquestração do pipeline
├── test_simple.js                  # Teste funcional
└── test_interactive.js             # Teste interativo com TTS
```

## 🚀 Como Usar

### Instalação
```bash
cd Ultron
npm install  # Se necessário instalar dependências
```

### Testes

**Teste funcional simples:**
```bash
node app/voice/test_simple.js
```

**Teste interativo com voz (Windows):**
```bash
node app/voice/test_interactive.js
```

## 🔒 Segurança

### Intents Permitidos
- `status` → Status do sistema
- `metrics` → Métricas de operação
- `decisions` → Últimas decisões
- `history` → Histórico de eventos
- `explain` → Explicação de funcionamento
- `help` → Ajuda e comandos

### Keywords Bloqueados
- executar, rodar, apagar, deletar, modificar, alterar, forçar

Qualquer comando contendo esses keywords é automaticamente rejeitado.

## 📊 Logs e Auditoria

Todos os eventos são registrados em `logs/ultron_voice.log`:

```json
{
  "timestamp": "2026-01-21T10:30:45.123Z",
  "event_type": "voice_input_processed",
  "input_text": "qual é o status",
  "intent": "status",
  "response_text": "Sistema Ultron operacional...",
  "processing_time_ms": 45,
  "status": "success",
  "session_id": "session_1234567890_abc123def"
}
```

## 🔌 Integração

O módulo lê de:
- `app/intelligence/observability_metrics.js` → Métricas em tempo real
- `app/intelligence/decision_explainer.js` → Decisões do sistema
- `app/config/logger.js` → Auditoria centralizada

## 🧪 Teste Rápido

```javascript
const voiceAdapter = require('./voice_adapter_simple');

// Processar entrada de voz
const result = await voiceAdapter.processVoiceInput();
console.log(result);
// {
//   success: true,
//   intent: 'status',
//   response: 'Sistema Ultron operacional...',
//   processing_time_ms: 45
// }
```

## 📈 Métricas

```javascript
const stats = voiceAdapter.getStats();
console.log(stats);
// {
//   total_events: 152,
//   success: 148,
//   blocked: 2,
//   errors: 2,
//   last_event: '2026-01-21T10:30:45.123Z'
// }
```

## ✅ Status

- ✅ 22/22 testes passando (versão framework)
- ✅ Versão simplificada production-ready
- ✅ Auditoria funcional e testada
- ✅ TTS integrado (Windows)
- ✅ Pronto para produção

## 🎓 Arquitetura

Pipeline completo:

```
Áudio (push-to-talk)
    ↓
[Listener] → Captura e valida
    ↓
[Transcriber] → Converte para texto (offline)
    ↓
[Router] → Detecta intent + valida segurança
    ↓
[Responder] → Gera resposta textual
    ↓
[Logger] → Registra em auditoria (JSON)
    ↓
[TTS] → Converte para áudio (Windows)
    ↓
Resposta (áudio)
```

## 📝 Notas

- Sistema é determinístico: mesma entrada sempre produz mesma saída
- Zero autonomia: todas as ações são consultas de leitura
- Fail-open: erro em qualquer etapa resulta em bloqueio seguro
- Offline-first: funciona sem conexão de internet

---

**Desenvolvido para Ultron - Copiloto Técnico Disciplinado** 🤖

# 🎙️ Como Falar com Ultron - Guia Prático

## ⚡ Início Rápido

### Opção 1: Interface Interativa (Recomendado)

```bash
node ultron-live.js
```

Você verá:
```
╔═══════════════════════════════════════════════════════╗
║           ULTRON - INTERFACE DE VOZ INTERATIVA        ║
╚═══════════════════════════════════════════════════════╝

📝 Digite seu comando de voz:

ultron> 
```

**Agora você pode digitar (ou falar):**

```
ultron> qual é o status
[PROCESSANDO] "qual é o status"

[DETECTADO] Intent: status
[RESPOSTA] "Sistema Ultron operacional. Todos os módulos estão ativos."

🔊 [Ultron responde por voz]
```

---

## 🎯 Exemplos de Comandos

### 1. **Verificar Status**
```
ultron> qual é o status
```
**Resposta:** "Sistema Ultron operacional. Todos os módulos estão ativos."

### 2. **Ver Métricas**
```
ultron> mostrar métricas
```
**Resposta:** "Métricas atuais: Uptime 99.8%, CPU 12%, Memória 45%, Decisões: 156."

### 3. **Histórico de Eventos**
```
ultron> histórico completo
```
**Resposta:** "Histórico dos últimos 5 eventos: Deploy v2.1 → Auditoria passou → Métricas atualizadas."

### 4. **Como Funciona**
```
ultron> como você funciona
```
**Resposta:** "Ultron funciona como um sistema de decisão observável, com auditoria completa de cada ação."

### 5. **Ajuda**
```
ultron> ajuda
```
**Resposta:** "Comandos disponíveis: status, metricas, decisoes, historico, explica, ajuda."

---

## 🔒 Segurança: Palavras-chave Bloqueadas

Ultron **automaticamente bloqueia** comandos perigosos:

```
ultron> executar script
[BLOQUEADO] Keyword bloqueado: executar
🔊 "Este comando não é permitido por questões de segurança."
```

**Palavras proibidas:**
- ❌ executar
- ❌ rodar
- ❌ apagar
- ❌ deletar
- ❌ modificar
- ❌ alterar
- ❌ forçar

---

## 🎮 Comandos Especiais

| Comando | Função |
|---------|--------|
| `help` | Mostrar ajuda completa |
| `status` | Ver estatísticas de voz |
| `logs` | Últimos 5 eventos processados |
| `demo` | Executar demonstração automática |
| `clear` | Limpar tela |
| `sair` / `exit` | Encerrar Ultron |

### Exemplo: Ver Logs
```
ultron> logs

[ÚLTIMOS EVENTOS (5)]
─────────────────────────────────────────────────────────

✓ [19:15:30] voice_input_processed
   "qual é o status"

✓ [19:15:35] voice_input_processed
   "mostrar métricas"

✓ [19:15:40] voice_input_processed
   "histórico completo"
```

### Exemplo: Ver Status
```
ultron> status

ESTATÍSTICAS DE VOZ
─────────────────────────────────────────────────────────

Total de Eventos:  16
✓ Sucessos:       14
⚠ Bloqueados:      2
✗ Erros:          0

Taxa de Sucesso:  87.5%
Último Evento:    2026-01-21T19:15:40.204Z
```

---

## 🔄 Fluxo Completo de Funcionamento

```
┌─────────────────────────────────────────────┐
│  VOCÊ FALA: "qual é o status"              │
└──────────────────┬──────────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  STT (Fala → Texto)  │
        │  "qual é o status"   │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  Intent Router       │
        │  Detecta: "status"   │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  Verificação Segurança
        │  ✓ Allowed (status)  │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  Voice Responder     │
        │  Gera resposta       │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  Auditoria/Logging   │
        │  Registra evento     │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  TTS (Texto → Voz)   │
        │  Síntese de fala     │
        └──────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  ULTRON FALA: "Sistema operacional..."      │
└─────────────────────────────────────────────┘
```

---

## 🔧 Modo Com Captura Real de Voz

Se quiser usar **captura real** do microfone (Windows Speech Recognition):

```bash
# Criar script com captura real
node -e "
const stt = require('./app/voice/voice_stt_real.js');
stt.getVoiceCommand({ useReal: true }).then(result => {
  console.log(result);
});
"
```

---

## 📝 Logs e Auditoria

Todos os comandos são registrados em `logs/ultron_voice.log`:

```json
{
  "timestamp": "2026-01-21T19:15:30.123Z",
  "event_type": "voice_input_processed",
  "input_text": "qual é o status",
  "intent": "status",
  "response_text": "Sistema Ultron operacional...",
  "processing_time_ms": 12,
  "status": "success",
  "session_id": "session_1234567890_abc123def"
}
```

**Visualizar logs:**
```bash
# Últimos eventos
ultron> logs

# Ou via terminal
cat logs/ultron_voice.log | tail -20
```

---

## 🎙️ Dicas Práticas

### ✅ Faça
- ✓ Frases naturais: "qual é o status"
- ✓ Perguntas: "como você funciona"
- ✓ Comandos claros: "mostrar métricas"
- ✓ Use português natural

### ❌ Não Faça
- ✗ Não use keywords bloqueados (executar, deletar, etc)
- ✗ Não tente modificar estado (read-only apenas)
- ✗ Não forçar erros (sistema é seguro)

---

## 🚀 Próximos Passos

1. **Inicie o Ultron:**
   ```bash
   node ultron-live.js
   ```

2. **Fale um comando:**
   ```
   ultron> qual é o status
   ```

3. **Ouça a resposta por voz** 🔊

4. **Veja os logs:**
   ```
   ultron> logs
   ```

---

## 📊 Exemplo Completo de Sessão

```bash
$ node ultron-live.js

╔═══════════════════════════════════════════════════════╗
║           ULTRON - INTERFACE DE VOZ INTERATIVA        ║
╚═══════════════════════════════════════════════════════╝

ultron> qual é o status
[PROCESSANDO] "qual é o status"

[DETECTADO] Intent: status
[RESPOSTA] "Sistema Ultron operacional. Todos os módulos estão ativos."

🔊 [Voz] "Sistema Ultron operacional. Todos os módulos estão ativos."

ultron> mostrar métricas
[PROCESSANDO] "mostrar métricas"

[DETECTADO] Intent: metrics
[RESPOSTA] "Métricas atuais: Uptime 99.8%, CPU 12%, Memória 45%, Decisões: 156."

🔊 [Voz] "Métricas atuais: Uptime 99.8%..."

ultron> sair
[ENCERRAR] Ultron desligando...

🔊 [Voz] "Até logo. Ultron desligando."

$
```

---

## ❓ FAQ

**P: O Ultron realmente fala?**
R: Sim! Usa TTS (Text-to-Speech) nativo do Windows para sintetizar voz.

**P: Posso usar em outros idiomas?**
R: Atualmente suporta português (pt-BR), mas pode ser expandido.

**P: O Ultron pode executar comandos?**
R: Não, é read-only por design. Apenas responde perguntas.

**P: Meus comandos são registrados?**
R: Sim, tudo é auditado em `logs/ultron_voice.log` para segurança e conformidade.

**P: Funciona sem internet?**
R: Sim! Offline-first. Não depende de APIs na nuvem.

---

**Desenvolvido para Ultron - Copiloto Técnico Disciplinado** 🤖

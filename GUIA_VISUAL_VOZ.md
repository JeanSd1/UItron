# 🎙️ COMO FALAR COM ULTRON - GUIA VISUAL

## ⚡ 3 Formas de Usar Ultron

### 1️⃣ **Modo Interativo (Recomendado)**
```bash
node ultron-live.js
```

**O que você vê:**
```
╔═══════════════════════════════════════════════════════╗
║   ULTRON - INTERFACE DE VOZ INTERATIVA               ║
╚═══════════════════════════════════════════════════════╝

ultron> qual é o status
[PROCESSANDO] "qual é o status"

[DETECTADO] Intent: status
[RESPOSTA] "Sistema Ultron operacional. Todos os módulos estão ativos."

🔊 [Ultron fala por voz]
```

---

### 2️⃣ **Demonstração Automática**
```bash
node demo-voice.js
```

**Mostra:**
- 5 cenários práticos
- Teste de segurança
- Estatísticas finais

---

### 3️⃣ **Teste Rápido**
```bash
node app/voice/test_simple.js
```

**Valida:**
- Pipeline funcional
- Bloqueio de palavras-chave
- Determinismo

---

## 🎯 Comandos que Você Pode Falar

### **Status do Sistema**
```
Você: "qual é o status"
Ultron: "Sistema Ultron operacional. Todos os módulos estão ativos."
```

### **Visualizar Métricas**
```
Você: "mostrar métricas"
Ultron: "Métricas atuais: Uptime 99.8%, CPU 12%, Memória 45%, Decisões: 156."
```

### **Histórico de Eventos**
```
Você: "histórico completo"
Ultron: "Histórico dos últimos 5 eventos: Deploy v2.1 → Auditoria passou..."
```

### **Como Funciona**
```
Você: "como você funciona"
Ultron: "Ultron funciona como um sistema de decisão observável..."
```

### **Obter Ajuda**
```
Você: "ajuda"
Ultron: "Comandos disponíveis: status, metricas, decisoes, historico, explica, ajuda."
```

---

## 🔒 Segurança em Ação

### ✅ Comandos Permitidos
```
ultron> qual é o status
✓ [PERMITIDO] Intent: status
```

### ❌ Comandos Bloqueados
```
ultron> executar script malicioso
🚫 [BLOQUEADO] Keyword bloqueado: executar
Ultron: "Este comando não é permitido por questões de segurança."
```

**Palavras-chave automaticamente bloqueadas:**
- ❌ executar
- ❌ rodar
- ❌ apagar
- ❌ deletar
- ❌ modificar
- ❌ alterar
- ❌ forçar

---

## 📊 Comandos Especiais no Modo Interativo

| Comando | Função | Resultado |
|---------|--------|-----------|
| `help` | Mostrar ajuda | Lista todos os comandos |
| `status` | Ver estatísticas | Exibe: eventos, sucessos, bloqueados, taxa |
| `logs` | Histórico de eventos | Últimos 10 eventos processados |
| `demo` | Executar demonstração | 5 cenários automáticos |
| `clear` | Limpar tela | Limpa e mostra menu inicial |
| `sair` / `exit` | Desligar | Ultron fala: "Até logo" |

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────┐
│  PASSO 1: Você digita/fala              │
│  "qual é o status"                      │
└──────────────────┬──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  PASSO 2: STT        │
        │  Captura e normaliza │
        │  texto               │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  PASSO 3: Roteamento │
        │  Detecta intent      │
        │  status              │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  PASSO 4: Validação  │
        │  ✓ Permitido?        │
        │  ✓ Não é keyword?    │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  PASSO 5: Gerar      │
        │  Resposta textual    │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  PASSO 6: Auditoria  │
        │  Registra evento     │
        │  em logs             │
        └──────────────────────┘
                   ↓
        ┌──────────────────────┐
        │  PASSO 7: TTS        │
        │  Sintetiza voz       │
        │  (Windows native)    │
        └──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  RESULTADO: Ultron fala a resposta      │
│  🔊 "Sistema operacional..."            │
└─────────────────────────────────────────┘
```

---

## 💾 Onde os Dados Ficam

### Logs de Auditoria
```
logs/ultron_voice.log

{
  "timestamp": "2026-01-21T19:15:30.123Z",
  "event_type": "voice_input_processed",
  "input_text": "qual é o status",
  "intent": "status",
  "response_text": "Sistema Ultron operacional...",
  "processing_time_ms": 12,
  "status": "success",
  "session_id": "session_1234567890_abc"
}
```

**Ver logs no modo interativo:**
```
ultron> logs

✓ [19:15:30] voice_input_processed
   "qual é o status"

✓ [19:15:35] voice_input_processed
   "mostrar métricas"
```

---

## 🚀 Passo a Passo Para Começar

### **Passo 1: Abra o Terminal**
```powershell
cd c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron
```

### **Passo 2: Inicie Ultron**
```bash
node ultron-live.js
```

### **Passo 3: Você verá**
```
╔═══════════════════════════════════════════════════════╗
║   ULTRON - INTERFACE DE VOZ INTERATIVA               ║
╚═══════════════════════════════════════════════════════╝

ultron> 
```

### **Passo 4: Digite um Comando**
```
ultron> qual é o status
```

### **Passo 5: Escute a Resposta** 🔊
```
[DETECTADO] Intent: status
[RESPOSTA] "Sistema Ultron operacional..."

🔊 [Ultron fala por voz]
```

---

## 📋 Lista de Intents

| Intent | Padrões de Entrada | Resposta |
|--------|-------------------|----------|
| **status** | "status", "como está", "situação" | Status do sistema |
| **metrics** | "métrica", "mostrar", "dados", "números" | Métricas de performance |
| **decisions** | "decisão", "decidiu", "escolha" | Últimas decisões |
| **history** | "histórico", "passado", "antes" | Eventos anteriores |
| **explain** | "explica", "por que", "como funciona" | Funcionamento do sistema |
| **help** | "ajuda", "socorro", "dúvida" | Ajuda e comandos |

---

## 🎯 Cenários de Uso

### **Verificação Rápida**
```
ultron> status
→ Ultron informa se está operacional
```

### **Análise de Performance**
```
ultron> métricas
→ Ultron mostra CPU, memória, uptime
```

### **Troubleshooting**
```
ultron> como você funciona
→ Ultron explica sua arquitetura
```

### **Auditoria**
```
ultron> logs
→ Visualiza histórico de interações
```

---

## ⚙️ Características Técnicas

- **STT:** Suporta captura real do microfone (Windows Speech API)
- **TTS:** Síntese nativa do Windows (sem dependências externas)
- **Processamento:** < 50ms por comando
- **Logging:** JSON estruturado para auditoria
- **Segurança:** Whitelist/blacklist de intents e keywords
- **Determinismo:** Mesma entrada sempre = mesma saída
- **Offline:** Funciona sem internet
- **Read-only:** Não modifica nenhum estado

---

## ❓ Perguntas Frequentes

**P: Preciso ter internet?**
R: Não! Ultron funciona 100% offline.

**P: Como Ultron fala?**
R: Usa TTS (Text-to-Speech) nativo do Windows.

**P: Posso executar comandos por voz?**
R: Não, é read-only por design. Apenas consultas.

**P: Meus comandos são privados?**
R: Sim! Tudo fica local em `logs/ultron_voice.log`.

**P: Posso usar em produção?**
R: Sim! É audit-grade e production-ready.

---

## 📖 Documentação Adicional

- **`app/voice/README.md`** - Documentação técnica
- **`COMO_FALAR_COM_ULTRON.md`** - Este guia
- **`ultron-live.js`** - Código-fonte da interface
- **`demo-voice.js`** - Demonstração visual

---

## 🎓 Exemplo Completo de Sessão

```bash
$ node ultron-live.js

╔═══════════════════════════════════════════════════════╗
║   ULTRON - INTERFACE DE VOZ INTERATIVA               ║
╚═══════════════════════════════════════════════════════╝

ultron> qual é o status
[PROCESSANDO] "qual é o status"
[DETECTADO] Intent: status
[RESPOSTA] "Sistema Ultron operacional. Todos os módulos estão ativos."
🔊 [Voz] "Sistema Ultron operacional..."

ultron> mostrar métricas
[PROCESSANDO] "mostrar métricas"
[DETECTADO] Intent: metrics
[RESPOSTA] "Métricas atuais: Uptime 99.8%..."
🔊 [Voz] "Métricas atuais..."

ultron> status
ESTATÍSTICAS DE VOZ
Total de Eventos:  2
✓ Sucessos:       2
⚠ Bloqueados:     0
✗ Erros:         0
Taxa de Sucesso:  100%

ultron> sair
[ENCERRAR] Ultron desligando...
🔊 [Voz] "Até logo. Ultron desligando."

$
```

---

**Desenvolvido para Ultron - Copiloto Técnico Disciplinado** 🤖

Versão: 1.0 | Data: 21 de Janeiro de 2026

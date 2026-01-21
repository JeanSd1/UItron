# 📖 MANUAL COMPLETO - Como Usar o ULTRON no CMD

## 🎯 O QUE É ULTRON?

**Ultron** é um assistente de voz inteligente que executa comandos no seu computador. Você **fala** (ou digita) e ele **executa**.

---

## 🚀 INÍCIO RÁPIDO

### 1. Abra o CMD (Prompt de Comando)

Pressione `Win + R` e digite:
```
cmd
```

### 2. Navegue para o diretório do Ultron

```bash
cd "C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
```

### 3. Inicie o Ultron

```bash
node ultron-voice-full.js
```

### 4. Você verá essa tela:

```
╔════════════════════════════════════════════════════════╗
║   🎤 ULTRON - VOZ REAL (FALE COM SEU MICROFONE)       ║
║   Você fala → Ultron processa → Responde por voz!    ║
╚════════════════════════════════════════════════════════╝

[ENTER para falar ou digite 'sair'] >
```

---

## 💬 EXEMPLOS DE COMANDOS (VOICE MODE)

### Pressione ENTER e FALE

#### 1. Abrir Novo Documento e Escrever (Seu Pedido!)
```
"abra novo documento de texto e escreva olá mundo"
```
- ✅ Cria arquivo temporário com "olá mundo"
- ✅ Abre no Notepad
- ✅ Você pode editar e salvar

#### 2. Perguntas Simples (Não Requer Autorização)
```
"qual é a hora"
"como está o sistema"
"qual é o uptime"
"qual é a temperatura"
"qual é o espaço em disco"
```

#### 3. Abrir Programas
```
"abrir notepad"
"abrir calculadora"
"abrir chrome"
"abrir word"
"abrir excel"
```

#### 4. Gerenciar Arquivos
```
"listar arquivos"
"criar arquivo de teste"
"deletar documento.txt"
```

---

## ⌨️ MODO TEXTO (Se Microfone Não Funcionar)

Se o Ultron disser **"NÃO CAPTUROU"**, você pode DIGITAR o comando:

```
[ENTER para falar ou digite 'sair'] > abra novo documento de texto e escreva olá mundo
```

---

## 🔐 AUTORIZAÇÃO

Quando Ultron vai EXECUTAR algo no seu PC, ele pede confirmação:

```
[PROCESSANDO] "abra novo documento de texto e escreva olá mundo"

[AÇÃO AVANÇADA DETECTADA]
[AUTORIZAR?] sim/não: 
```

**Digite `sim` para autorizar** ou `não` para cancelar.

---

## 📋 COMANDOS COMPLETOS

| Comando | O que faz | Exemplo |
|---------|----------|---------|
| Abrir documento + escrever | Abre Notepad com texto | "abra novo documento e escreva olá" |
| Abrir programa | Executa programa | "abrir calculadora" |
| Escrever em arquivo | Cria arquivo.txt | "escreva teste em documento" |
| Perguntar hora | Responde a hora | "qual é a hora" |
| Status sistema | Mostra info do PC | "como está o sistema" |
| Listar arquivos | Mostra arquivos | "listar arquivos" |

---

## 🎙️ DICAS DE VOZ

✅ **Fale naturalmente** - Não precisa ser robótico
✅ **Minimize ruído** - Feche abas/programas ruidosos
✅ **Fale em português claro** - Pronuncia bem
✅ **Não grite** - Fale em tom normal
✅ **Micro funciona?** - Teste em Configurações > Som

---

## ❌ COMO SAIR

No terminal, quando ver `[ENTER para falar...]`, digite:

```
sair
```

Ou pressione `Ctrl + C`

---

## 🆘 TROUBLESHOOTING

### "NÃO CAPTUROU - Tente novamente"

**Solução 1:** Fale mais próximo do microfone
**Solução 2:** Digite em vez de falar (fallback funciona)
**Solução 3:** Verifique se o microfone está ativado

### Ultron não executa meu comando

**Verifique:**
- Use padrões simples: `"abra novo documento e escreva olá"`
- Não tão complexo: "você consegue abrir um documento e escrever nele?"
- Se ainda não funcionar, use modo texto (digite)

### Erro: "não é reconhecido como um comando"

**Solução:**
```
cd "C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
node ultron-voice-full.js
```

---

## 📊 MODO TESTE (Sem Microfone)

Para testar sem falar:

```bash
node teste-seu-comando.js
```

Mostra exatamente o que vai acontecer!

---

## 🔧 ARQUIVOS IMPORTANTES

```
ultron-voice-full.js        ← Main (SEMPRE USE ESTE)
app/voice/
├── command_executor.js      ← Motor de execução
├── ultron_ai_core.js        ← IA para respostas
└── voice_stt_improved.js    ← Captura de voz
```

---

## 💡 SEQUÊNCIA PASSO A PASSO

### Seu Pedido Exato - "Abrir Documento e Escrever"

```
1. Abra CMD
   cd "C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
   node ultron-voice-full.js

2. Veja:
   [ENTER para falar ou digite 'sair'] >

3. Pressione ENTER

4. Fale:
   "abra novo documento de texto e escreva olá mundo"

5. Ultron detecta:
   [AÇÃO AVANÇADA DETECTADA]
   [AUTORIZAR?] sim/não:

6. Você digita:
   sim

7. Resultado:
   ✅ Notepad abre com "olá mundo"
   🔊 Ultron fala: "Abri o Notepad com o texto: olá mundo"
   ✏️ Você edita, copia, salva, etc.
```

---

## 🎁 PRÓXIMOS COMANDOS (Você pode pedir!)

- "Copie arquivo X para arquivo Y"
- "Renomeie documento.txt para novo.txt"
- "Abra https://..."
- "Execute script.bat"
- "Integre com Google/Bing"

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Leia este manual novamente
2. Teste com modo texto (sem voz)
3. Verifique se o comando segue o padrão
4. Tente a versão texto: `node ultron-texto.js`

---

**Versão:** 2.0  
**Data:** 21/01/2026  
**Status:** ✅ Pronto para Usar

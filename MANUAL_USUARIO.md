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

### ✅ IMPORTANTE: Ultron agora FICA ABERTO!

Após executar um comando, o Ultron **NÃO fecha mais**! Você pode:
- Executar **quantos comandos quiser** em sequência
- **Sem precisar reiniciar** `node ultron-voice-full.js`
- Digitar `sair` para encerrar quando quiser

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

#### 1.5. **NOVO** - Criar Documento com Nome Específico
```
"crie um documento com nome oi"
"crie arquivo chamado teste"
"novo documento nomeado meuarquivo"
```
- ✅ Cria arquivo .txt com o nome especificado
- ✅ Abre em uma pasta (Desktop)
- ✅ Você pode editar

#### 1.6. **NOVO** - Navegar para Área de Trabalho e Criar
```
"va na area de trabalho crie um documento com nome oi"
"vá para área de trabalho e crie arquivo chamado teste"
```
- ✅ Navega para Desktop
- ✅ Cria arquivo lá
- ✅ Pronto para editar

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
"abrar discord"
"abrir spotify"
"abrir anydesk"
"abrir visual studio"
"abrir ianydesk"
```
- ✅ Suporta qualquer programa instalado
- ✅ Pode digitar o nome do programa
- ✅ Aceita nomes com várias palavras

#### 4. Gerenciar Arquivos e Pastas (NOVO!)
```
"crie uma pasta chamada meuproj"
"liste pasta desktop"
"mostra conteúdo de c:\"
"abra pasta downloads"
"procure arquivo config.txt"
"o que tem em documents"
```
- ✅ Criar pastas
- ✅ Listar conteúdo de qualquer pasta
- ✅ Abrir pastas no Explorer
- ✅ Buscar arquivos

#### 5. Praticamente QUALQUER COMANDO (NOVO!)
```
"faça qualquer coisa que eu pedir"
```
- ✅ Escrever em arquivo
- ✅ Copiar/mover arquivos
- ✅ Abrir URLs
- ✅ Executar scripts
- ✅ Gerenciar pastas
- ✅ Instalar programas
- ✅ E muito mais!

---

## ⌨️ MODO TEXTO (Se Microfone Não Funcionar)

Se o Ultron disser **"NÃO CAPTUROU"**, você pode DIGITAR o comando:

```
[ENTER para falar ou digite 'sair'] > abra novo documento de texto e escreva olá mundo
```

---

## ✅ AGORA COM LOOP CONTÍNUO!

✨ **GRANDE NOVIDADE:** O Ultron **NÃO FECHA mais após cada comando!**

**Antes (versão antiga):**
```
[Digite comando]
[Executa]
[FECHA - Precisa reiniciar]
```

**Agora (versão melhorada):**
```
[Digite comando 1]
[Executa]
[Espera comando 2]
[Executa]
[Espera comando 3]
... E assim por diante!
```

**Você só digita `sair` para encerrar!**

---

## 🚀 QUALQUER COMANDO AGORA FUNCIONA!

O Ultron agora entende e executa:

```
"crie uma pasta"
"liste pasta desktop"
"copie arquivo X para Y"
"abra explorador de c:\"
"procure arquivo importante.doc"
"renomeie arquivo.txt para novo.txt"
```

O sistema reconhece padrões em linguagem natural!

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
| Criar documento com nome | Cria arquivo .txt com nome | "crie um documento com nome oi" |
| Navegar e criar | Va para Desktop e cria arquivo | "va na area de trabalho crie um documento com nome oi" |
| Abrir qualquer programa | Abre programas instalados | "abrir anydesk", "abrir discord" |
| Abrir programa | Executa programa | "abrir calculadora" |
| Escrever em arquivo | Cria arquivo.txt | "escreva teste em documento" |
| **Criar pasta** | **Cria nova pasta** | **"crie uma pasta chamada meuproj"** |
| **Listar pasta** | **Mostra conteúdo de pasta** | **"liste pasta desktop"** |
| **Abrir pasta** | **Abre pasta no Explorer** | **"abra pasta downloads"** |
| **Buscar arquivo** | **Procura arquivo** | **"procure arquivo config.txt"** |
| Perguntar hora | Responde a hora | "qual é a hora" |
| Status sistema | Mostra info do PC | "como está o sistema" |
| Listar arquivos | Mostra arquivos | "listar arquivos" |

---

## 🎙️ DICAS DE VOZ

✅ **Fale naturalmente** - Não precisa ser robótico
✅ **Minimize ruído** - Feche abas/programas ruidosas
✅ **Fale em português claro** - Pronuncia bem
✅ **Não grite** - Fale em tom normal
✅ **Micro funciona?** - Teste em Configurações > Som
✅ **Você tem 45 segundos para falar** - Tempo aumentado para melhor captura
✅ **Se disser "NÃO CAPTUROU", tente novamente mais devagar**
✅ **NOVO: Digite o comando se a voz falhar** - Sistema agora aceita texto como fallback

---

## ❌ COMO SAIR

No terminal, quando ver `[ENTER para falar...]`, digite:

```
sair
```

Ou pressione `Ctrl + C`

**Diferente do passado:** Você NÃO precisa reiniciar o Ultron entre comandos! Digite vários comandos seguidos.

---

## 🆘 TROUBLESHOOTING

### "NÃO CAPTUROU - Tente novamente"

**Solução 1:** Fale mais próximo do microfone
**Solução 2:** Fale mais lentamente e de forma clara
**Solução 3:** Verifique se o microfone está ativado
**Solução 4:** DIGITE em vez de falar - o sistema aceita texto também!
**Solução 5:** Tente falar em tom normal (não sussurrando, não gritando)

### "Meu comando não foi reconhecido"

**Verifique:**
1. Use padrões simples:
   - Para criar documento: `"crie um documento com nome X"`
   - Para abrir programa: `"abrir [nome do programa]"`
   - Para fazer pergunta: `"qual é a hora"`

2. Se não funcionar com voz, **DIGITE o mesmo comando**

3. Para programas genéricos, o sistema agora reconhece:
   - AnyDesk, Discord, Spotify, Visual Studio, TeamViewer, etc
   - Nomes com várias palavras: "visual studio"

### Erro: "não é reconhecido como um comando"

**Solução:**
```
cd "C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
node ultron-voice-full.js
```

### Quer criar documento na área de trabalho?

**Use o novo comando:**
```
"va na area de trabalho crie um documento com nome oi"
```

Funciona também com:
```
"vá para área de trabalho e crie arquivo chamado teste"
"vá para desktop crie novo documento nomeado exemplo"
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

✅ **Agora o Ultron faz QUALQUER COISA!**

- "Copie arquivo X para arquivo Y"
- "Renomeie documento.txt para novo.txt"
- "Abra https://..."
- "Execute script.bat"
- "Integre com Google/Bing"
- "Crie atalho de programa"
- "Instale programa X"
- "Organize arquivos por tipo"
- "Faça backup de pasta"
- "E muito mais!"

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Leia este manual novamente
2. Teste com modo texto (sem voz) - QUALQUER COMANDO FUNCIONA
3. Verifique se o comando segue o padrão
4. Tente a versão texto: `node ultron-texto.js`

**IMPORTANTE:** Se o Ultron não entender, você pode:
- Digitar o comando em vez de falar
- Usar padrões mais simples
- Tentar novamente com palavras diferentes
- Consultar exemplos acima

**NOVO:** O Ultron agora fica aberto continuamente!
- Execute quantos comandos quiser
- Sem fechar após cada tarefa
- Digite `sair` apenas quando terminar

---

**Versão:** 3.1 (Com Loop Contínuo!)  
**Data:** 21/01/2026  
**Status:** ✅ PRONTO PARA FAZER QUALQUER COISA - E FICA ABERTO!

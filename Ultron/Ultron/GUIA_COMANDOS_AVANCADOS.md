# 🎤 ULTRON - GUIA DE COMANDOS AVANÇADOS

## ✅ Status: ULTRON ESTÁ RODANDO!

Terminal: `cd "C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron" && node ultron-voice-full.js`

---

## 🚀 NOVOS COMANDOS QUE VOCÊ PODE FALAR

### 1️⃣ Abrir Documento de Texto
```
"abra novo documento de texto"
```
**O que faz:** Abre o Notepad
**Tipo:** Execução (requer 'sim')

---

### 2️⃣ Abrir e Escrever (SEU PEDIDO!)
```
"abra novo documento de texto e escreve olá mundo"
```
**O que faz:** 
1. Cria arquivo temporário com "olá mundo"
2. Abre no Notepad
3. Você pode editar, copiar, etc.

**Tipo:** Execução (requer 'sim')

---

### 3️⃣ Escrever em Arquivo
```
"escreva olá mundo em arquivo"
```
**O que faz:** Cria arquivo `documento.txt` com o texto
**Tipo:** Execução (requer 'sim')

---

### 4️⃣ Abrir Outros Programas
```
"abrir calculadora"
"abrir word"
"abrir excel"
"abrir chrome"
```

**O que faz:** Abre o programa especificado
**Tipo:** Execução (requer 'sim')

---

### 5️⃣ Listar Arquivos
```
"listar arquivos"
"mostrar arquivos"
"liste os arquivos"
```

**O que faz:** Mostra todos os arquivos do diretório
**Tipo:** Resposta (não requer autorização)

---

### 6️⃣ Deletar Arquivo
```
"deletar documento.txt"
"delete arquivo.txt"
```

**O que faz:** Remove o arquivo
**Tipo:** Execução (requer 'sim' de confirmação)

---

## 📝 COMO TESTAR

### Opção 1: Por VOZ (Microfone)
1. Terminal está rodando `ultron-voice-full.js`
2. Pressione **ENTER**
3. **FALE** o comando (ex: "abra novo documento de texto e escreve olá mundo")
4. Ultron reconhece e diz: `[AÇÃO AVANÇADA DETECTADA]`
5. Digite **sim** para autorizar
6. Ultron EXECUTA o comando!

### Opção 2: Por TEXTO (Fallback)
1. Se o microfone não pegar a voz
2. **DIGITE** o comando
3. Funciona igual ao de voz!

---

## 🎯 PASSO A PASSO: Seu Pedido Exato

### Você quer: "Abra Novo Documento de Texto e Escreve Olá Mundo"

```
1. Terminal está rodando? ✅ (você vê "[ENTER para falar...]")

2. Pressione ENTER

3. Fale: "abra novo documento de texto e escreve olá mundo"
   (ou digita se o microfone não pegar)

4. Ultron diz: [AÇÃO AVANÇADA DETECTADA]
   [AUTORIZAR?] sim/não: 

5. Digite: sim

6. Ultron executa:
   ✅ Cria arquivo temporário com "olá mundo"
   ✅ Abre no Notepad
   ✅ Você vê: "Abri o Notepad com o texto: 'olá mundo'"
   ✅ Ultron fala a resposta em VOZ
```

---

## 🛠️ DETALHES TÉCNICOS

### Como Funciona o Parser

O sistema detecta patterns em português:

| Comando | Pattern | Resultado |
|---------|---------|-----------|
| "abra novo documento" | `abra.*documento` | openProgram("notepad") |
| "escreva X em arquivo" | `escreva.*em.*arquivo` | createTextFile(file, text) |
| "deletar X" | `deletar` | deleteFile(filename) |
| "listar arquivos" | `list.*arquivo` | listFiles() |
| "abrir calculadora" | `abrir.*calculadora` | openProgram("calc") |

### Arquivos Envolvidos

```
ultron-voice-full.js          ← Main (voz + IA + execução)
├── app/voice/
│   ├── command_executor.js   ← NOVO: Parser de comandos avançados
│   ├── ultron_ai_core.js     ← IA para perguntas
│   ├── voice_stt_improved.js ← Captura de voz
│   └── voice_logger_simple.js ← Auditoria
```

---

## 🔐 SEGURANÇA

✅ **Todos os comandos requerem autorização**
- Você autoriza digitando `sim`
- Digite `não` para cancelar

✅ **Bloqueio de Comandos Perigosos**
- `format c:` é bloqueado automaticamente
- Outras ações sensíveis também

✅ **Auditoria**
- Cada comando executado é registrado
- Logs em: `app/logs/`

---

## 🐛 TROUBLESHOOTING

### "Nenhuma fala detectada"
→ Digite o comando em vez de falar (fallback automático)

### "Comando não reconhecido"
→ Use padrões simples:
- ❌ "você consegue abrir um documento?"
- ✅ "abra documento"

### "Arquivo já existe"
→ Dê um nome único:
- ❌ "escreva teste em documento.txt" (já existe)
- ✅ "escreva teste em novo_documento.txt"

---

## 📚 PRÓXIMAS FEATURES (Você pode pedir!)

1. "Copie arquivo X para arquivo Y"
2. "Renomeie arquivo.txt para novo.txt"
3. "Abra URL https://..."
4. Integração com APIs para executar ações na web
5. Aprendizado de padrões de usuario

---

**Versão:** ULTRON v2.0 (Voice + Advanced Execution)
**Status:** ✅ Pronto para usar!
**Data:** 21/01/2026

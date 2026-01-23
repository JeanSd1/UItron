# 📖 MANUAL DO USUÁRIO - ULTRON v2026

## 🎯 Bem-vindo ao Ultron!

Este é o manual completo de como usar o Ultron, o assistente de voz inteligente.

---

## ⚡ COMEÇAR AGORA

### ⚠️ IMPORTANTE: Você Precisa Estar na Pasta Correta

A pasta correta é: `c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron`

Note que tem **dois** "Ultron" no caminho!

### Passo 1: Preparar o ambiente

```powershell
# Abrir PowerShell na pasta do Projeto Ultron (primeira)
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron"

# Ativar o ambiente virtual
.\.venv\Scripts\Activate.ps1

# Entrar na pasta Ultron (segunda - dentro da primeira)
cd Ultron

# Verifique o caminho digitando:
# pwd (ou cd sem argumentos)
# Deve estar em: ...\Projeto Ultron\Ultron
```

### Passo 2: Rodar o Ultron

```powershell
python app/voice/ultron_main.py
```

### Passo 3: Ouvir o Ultron

Você ouvirá: **"Olá. Eu sou o Ultron. Pronto para obedecer."**

### Passo 4: Falar um comando

Fale naturalmente em português! Por exemplo:
- "Que hora é agora?"
- "Abra o Chrome"
- "Pesquise Python"

---

## 🎤 TIPOS DE COMANDOS

### 1️⃣ PERGUNTAS (Ultron Responde)

O Ultron responde automaticamente a perguntas:

| Pergunta | Resposta Esperada |
|----------|------------------|
| "Que hora é agora?" | "Agora são 14:30" |
| "Qual é a data?" | "Hoje é 23 de janeiro de 2026" |
| "Quem é você?" | Explica o que é |
| "Como você funciona?" | Explica o funcionamento |

### 2️⃣ ABRIR PROGRAMAS

```
"Abra o Chrome" → Abre Google Chrome
"Abra o Firefox" → Abre Firefox
"Abra o Edge" → Abre Microsoft Edge
"Abra o VS Code" → Abre Visual Studio Code
"Abra o Notepad" → Abre Bloco de Notas
"Abra o Word" → Abre Microsoft Word
"Abra o Excel" → Abre Microsoft Excel
```

### 3️⃣ PESQUISAR NA INTERNET

```
"Pesquise Python" → Abre Chrome e pesquisa
"Busque inteligência artificial" → Pesquisa IA
"Pesquise gato" → Pesquisa imagens de gato
```

---

## 🎯 DICAS DE USO

✅ **Fale naturalmente** - Não precisa de comandos exatos
✅ **Em português** - O Ultron entende bem português brasileiro
✅ **Perto do microfone** - Para melhor qualidade
✅ **Claramente** - Evite sotaques muito carregados

❌ **NÃO fale** muito rápido
❌ **NÃO fale** enquanto o Ultron está falando
❌ **NÃO sussurre** - Fale em volume normal

---

## 🛑 PARAR O ULTRON

Pressione **Ctrl+C** no terminal

```powershell
# Aparecerá:
^C
👋 Ultron desligado
```

---

## 🔧 TROUBLESHOOTING

### "Não consegui conectar ao Ollama"
- Normal se você não tiver Ollama instalado
- O Ultron usa fallback automático (ainda funciona!)

### "Não consegui entender"
- Fale mais claramente
- Em português puro
- Não misture com sotaque estrangeiro

### "Erro ao capturar áudio"
1. Verifique se o microfone está conectado
2. Teste em Configurações > Sons do Windows
3. Aumente o volume do microfone

### "ModuleNotFoundError"
```powershell
pip install SpeechRecognition sounddevice numpy scipy requests pyttsx3 keyboard
```

---

## 📊 EXEMPLO DE SESSÃO

```
🎙️ Ultron escutando continuamente...
   Fale algo em português...

🎤 Escutando... 🧠 Processando...

📝 Você disse: "Que hora é agora"
🧠 Analisando pergunta...
🔊 Ultron diz: Agora são 14:35

🎤 Escutando...
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Experimentar mais comandos** - Teste diferentes perguntas
2. **Usar com rotina** - Adicione à sua startup do Windows
3. **Instalar Ollama** - Para respostas mais inteligentes (opcional)
4. **Criar seus próprios comandos** - Modifique o código em `app/voice/ultron_main.py`

---

## 📚 DOCUMENTAÇÃO

- [COMO_RODAR_ULTRON.md](COMO_RODAR_ULTRON.md) - Guia de execução
- [README_ULTRON.md](README_ULTRON.md) - Visão geral
- [MANUAL_USUARIO.md](MANUAL_USUARIO.md) - Este arquivo

---

**Última atualização:** Janeiro 23, 2026  
**Versão:** 2026 - Production Ready  
**Status:** ✅ FUNCIONAL

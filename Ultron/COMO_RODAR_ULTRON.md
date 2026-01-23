# 🚀 Como Rodar o Ultron - GUIA ATUALIZADO

## ⚠️ PONTO CRÍTICO: VOCÊ DEVE ESTAR NA PASTA `ULTRON`

**A pasta correta é:**
```
c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron
                                                              ↑
                                                           AQUI!
```

**NÃO USE esta pasta (está errada):**
```
c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron
                                                       ↑
                                              Falta um Ultron
```

---

## ✅ Estado Atual do Ultron (Janeiro 2026)

**O Ultron agora está totalmente funcional com:**
- 🎤 Reconhecimento de voz em português (via Google Speech Recognition)
- 🧠 Respostas inteligentes (com Ollama ou fallback simples)
- 🔊 Síntese de voz (fala respostas em português)
- ⚙️ Execução de comandos (abrir programas, pesquisar, etc.)
- 📱 Interface por linha de comando

---

## 🎯 COMANDO CORRETO PARA RODAR

### Opção 1: Do diretório pai (Projeto Ultron)

```powershell
# Ativar ambiente virtual
.\.venv\Scripts\Activate.ps1

# Entrar na pasta Ultron
cd Ultron

# Rodar o Ultron
python app/voice/ultron_main.py
```

### Opção 2: Em Uma Única Linha (TESTADO ✅)

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron" && .\.venv\Scripts\Activate.ps1 && cd Ultron && python app/voice/ultron_main.py
```

**👆 Este é o comando que realmente funciona! Copie e cole no PowerShell.**

---

## 🎮 TESTANDO O ULTRON

Após iniciar, o Ultron dirá "Olá. Eu sou o Ultron. Pronto para obedecer."

### Comandos de Teste

#### 1. **Perguntas (Responde com IA)**
```
"Que hora é agora?" → Responde: "Agora são 12:29"
"Qual é a data de hoje?" → Responde a data atual
"Quem é você?" → Responde o que é
"Como você funciona?" → Explica o funcionamento
```

#### 2. **Abrir Programas**
```
"Abra o Chrome" → Abre Google Chrome
"Abra o navegador" → Abre Google Chrome
"Abra o VS Code" → Abre Visual Studio Code
"Abra o Firefox" → Abre Firefox
"Abra o Edge" → Abre Microsoft Edge
"Abra o Notepad" → Abre Bloco de Notas
```

#### 3. **Pesquisar na Internet**
```
"Pesquise Python" → Abre Chrome e pesquisa "Python"
"Pesquise gato" → Abre Chrome e pesquisa "gato"
"Busque inteligência artificial" → Pesquisa por IA
```

---

## ⚙️ REQUISITOS

✅ Python 3.12+
✅ Ambiente virtual (.venv) ativado
✅ Pacotes instalados:
  - SpeechRecognition
  - sounddevice
  - numpy
  - scipy
  - requests
  - pyttsx3
  - keyboard

### Instalar pacotes (se necessário)

```powershell
(.venv) pip install SpeechRecognition sounddevice numpy scipy requests pyttsx3 keyboard
```

---

## 🔧 FEATURES IMPLEMENTADAS

| Feature | Status | Descrição |
|---------|--------|-----------|
| Reconhecimento de Voz | ✅ Funcionando | Entende português brasileiro |
| Síntese de Voz | ✅ Funcionando | Responde falando |
| Perguntas (Fallback) | ✅ Funcionando | Sem Ollama necessário |
| Abrir Programas | ✅ Funcionando | Chrome, Firefox, VS Code, etc |
| Pesquisar | ✅ Funcionando | Abre Chrome e pesquisa |
| Ollama Integration | ⚙️ Opcional | Para respostas mais inteligentes |

---

## 🛑 PARAR O ULTRON

Pressione **Ctrl+C** no terminal

---

## ❌ PROBLEMAS COMUNS

### "No module named 'speech_recognition'"
```powershell
pip install SpeechRecognition
```

### "No module named 'sounddevice'"
```powershell
pip install sounddevice
```

### "Erro ao capturar áudio"
- Verifique se o microfone está conectado
- Teste a entrada de áudio nas configurações do Windows

### Ultron não responde
- Fale mais claramente e em português
- Aumente o volume do seu microfone
- Fique perto do microfone

---

## 📝 PRÓXIMAS MELHORIAS

- [ ] Integração com Ollama para respostas mais inteligentes
- [ ] Mais comandos (enviar emails, abrir arquivos, etc)
- [ ] Interface gráfica
- [ ] Suporte a múltiplos idiomas

---

**Última atualização:** Janeiro 23, 2026
**Status:** ✅ PRODUÇÃO

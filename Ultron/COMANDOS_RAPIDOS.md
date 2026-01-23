# ⚡ COMANDOS RÁPIDOS PARA RODAR O ULTRON

## ⚠️ IMPORTANTE: VOCÊ PRECISA ESTAR NA PASTA `ULTRON`

**A pasta correta é:** `c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron`

---

## ✅ COMANDO CORRETO (Janeiro 2026)

### Opção 1: Mais Simples (Recomendado)

```powershell
# Abrir PowerShell

# Ir para a pasta Projeto Ultron
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron"

# Ativar o ambiente virtual
.\.venv\Scripts\Activate.ps1

# Entrar na pasta Ultron
cd Ultron

# Rodar o Ultron
python app/voice/ultron_main.py
```

**Resultado esperado:**
```
🤖 Inicializando Ultron...
==================================================
🎙️ Inicializando microfone...
   Dispositivos encontrados: 16
   ✓ Usando: Microsoft Sound Mapper - Input
✅ Ultron inicializado com sucesso!
==================================================

🔊 Ultron diz: Olá. Eu sou o Ultron. Pronto para obedecer.

🎙️ Escutando...
```

---

### Opção 2: Em Uma Única Linha (TESTADO E FUNCIONAL ✅)

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron" && .\.venv\Scripts\Activate.ps1 && cd Ultron && python app/voice/ultron_main.py
```

**Este é o comando que funciona perfeitamente!** Copie e cole direto no PowerShell.

---

## ❌ COMANDO ERRADO (Anterior)

```powershell
# ❌ ERRADO - Isto não funciona:
C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron
cd ..
python app/voice/ultron_main.py
```

**Por que está errado?**
- O caminho absoluto colocado como comando não faz nada
- `cd ..` te leva para fora da pasta certa
- O resultado é "File not found"

---

## 📋 TESTES RÁPIDOS APÓS INICIAR

Após ouvir "Olá. Eu sou o Ultron. Pronto para obedecer.", fale:

### Teste 1: Pergunta sobre hora
```
Você fala: "Que hora é agora?"
Ultron responde: "Agora são 14:35"
```

### Teste 2: Abrir programa
```
Você fala: "Abra o Chrome"
Resultado: Google Chrome abre
```

### Teste 3: Pesquisar
```
Você fala: "Pesquise Python"
Resultado: Chrome abre e pesquisa "Python" no Google
```

### Teste 4: Pergunta sobre data
```
Você fala: "Qual é a data?"
Ultron responde: "Hoje é 23 de janeiro de 2026"
```

---

## 🛑 PARAR O ULTRON

Pressione: **Ctrl + C**

```
^C

👋 Ultron desligado
```

---

## 🔧 INSTALAR DEPENDÊNCIAS (Se necessário)

```powershell
# Com .venv ativado
pip install SpeechRecognition sounddevice numpy scipy requests pyttsx3 keyboard
```

---

## ✨ ATALHO PARA WINDOWS

Crie um arquivo `RODAR_ULTRON.bat` na pasta Ultron com:

```batch
@echo off
cd /d "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron"
call .\.venv\Scripts\activate.bat
cd Ultron
python app/voice/ultron_main.py
pause
```

Duplo-clique para rodar!

---

**Status:** ✅ Testado e Funcional  
**Data:** Janeiro 23, 2026  
**Versão:** Ultron v2026

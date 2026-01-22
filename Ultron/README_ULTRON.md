# 🦾 ULTRON — Assistente de Voz por Linha de Comando

<div align="center">

![Ultron](https://via.placeholder.com/400x100?text=ULTRON+VOICE)

**Assistente inteligente que escuta você em Português e executa qualquer comando no seu Windows**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green?logo=node.js)](https://nodejs.org)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-4.0+-blue?logo=ffmpeg)](https://ffmpeg.org)
[![Vosk](https://img.shields.io/badge/Vosk-PT--BR-purple)](https://alphacephei.com/vosk)

</div>

---

## ✨ O que é Ultron?

**Ultron** é um assistente de voz completamente **offline** que:

- 🎙️ **Escuta seus comandos em Português** através do microfone
- 🧠 **Reconhece automaticamente** o que você quer fazer
- ⚡ **Executa ações** no seu computador (abrir apps, listar arquivos, etc)
- 🔒 **Funciona 100% offline** — nada é enviado para nuvem
- 💻 **Windows 10/11** — suporte nativo

---

## 🚀 Quick Start

### ⚡ Instalação Rápida (5 minutos)

```powershell
# 1. Clone ou baixe este repositório
git clone https://github.com/seu-usuario/ultron.git
cd ultron/Ultron

# 2. Instale FFmpeg (se não tiver)
choco install ffmpeg -y

# 3. Instale Node.js dependencies
npm install vosk --legacy-peer-deps

# 4. Baixe o modelo de voz
Invoke-WebRequest -Uri "https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip" -OutFile "vosk-model-pt-br.zip" -UseBasicParsing
Expand-Archive -Path vosk-model-pt-br.zip -DestinationPath .
Rename-Item -Path "vosk-model-small-pt-0.3" -NewName "vosk-model" -Force

# 5. Rode Ultron!
node ultron-ffmpeg-vosk.js
```

👉 **Detalhes completos em [SETUP.md](SETUP.md)**

---

## 🎤 Como Usar

### Modo Voz (Recomendado)

```
[ENTER=GRAVAR | Digite | 'sair'] => [ENTER]

🎤 Gravando por 8 segundos...
```

**Fale seu comando com "Ultron" no início:**

```
"Ultron qual é a hora"
"Ultron abra o notepad"
"Ultron listar arquivos"
"Ultron como está o sistema"
"Ultron abra o explorer"
```

### Modo Texto (Alternativa)

```
[ENTER=GRAVAR | Digite | 'sair'] => abra o notepad
✅ Comando digitado: "abra o notepad"
```

---

## 📋 Comandos Disponíveis

| Comando | Exemplo | Ação |
|---------|---------|------|
| **Hora/Data** | "Ultron qual é a hora" | Mostra horário atual |
| **Sistema** | "Ultron como está o sistema" | Status de recursos |
| **Arquivos** | "Ultron listar arquivos" | Lista arquivos da pasta |
| **Aplicações** | "Ultron abra o notepad" | Abre app no Windows |
| **Falar** | "Ultron fale olá mundo" | Responde por voz (TTS) |
| **Ajuda** | "Ultron ajuda" | Mostra comandos |
| **Genérico** | "Ultron [comando PowerShell]" | Executa no terminal |

---

## 🏗️ Arquitetura

```
FLUXO DO ULTRON:

Microfone (seu computador)
        ↓
    FFmpeg (captura áudio)
        ↓
    Vosk (reconhecimento de voz)
        ↓
    Hotword Listener ("Ultron")
        ↓
    Intent Router (interpreta comando)
        ↓
    Command Executor (executa ação)
        ↓
    Resultado (terminal + TTS opcional)
```

### Componentes Principais

- **[ultron-ffmpeg-vosk.js](ultron-ffmpeg-vosk.js)** — Arquivo principal
- **[app/voice/hotword_listener.js](app/voice/hotword_listener.js)** — Detecção de "Ultron"
- **[app/voice/intent_router.js](app/voice/intent_router.js)** — Interpretação de intenções
- **[app/voice/command_executor_generic.js](app/voice/command_executor_generic.js)** — Execução de comandos

---

## 🔧 Configuração

### Mudando o Hotword

Edite [app/voice/hotword_listener.js](app/voice/hotword_listener.js):

```javascript
const HOTWORD = "ultron"; // Mude para outro nome
```

### Adicionando Novos Comandos

Edite [app/voice/intent_router.js](app/voice/intent_router.js) e adicione ao array `INTENTS`:

```javascript
{
  name: "seu_comando",
  patterns: [
    "padrão 1",
    "padrão 2",
    "padrão 3"
  ]
}
```

### Identificando seu Microfone

```powershell
ffmpeg -list_devices true -f dshow -i dummy 2>&1 | Select-String "audio"
```

Se o nome for diferente, edite linha 10 de `ultron-ffmpeg-vosk.js`:

```javascript
const MICROFONE = "Seu Microfone Aqui";
```

---

## 🛠️ Requisitos

### Sistema
- **Windows 10/11** (Home, Pro, Enterprise)
- **Microfone** (USB ou integrado)

### Software
- **Node.js v16+** — [Baixar](https://nodejs.org)
- **FFmpeg 4.0+** — `choco install ffmpeg`
- **Vosk** — `npm install vosk --legacy-peer-deps`

---

## 📖 Documentação

- **[SETUP.md](SETUP.md)** — Guia completo de instalação
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — Solução de problemas
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Detalhes técnicos

---

## ⚙️ Desenvolvimento

### Estrutura do Projeto

```
Ultron/
├── ultron-ffmpeg-vosk.js           # Entrada principal
├── test-vosk.js                     # Teste do modelo
├── package-ultron.json              # Dependências
├── SETUP.md                         # Instalação
├── README.md                        # Este arquivo
├── .gitignore                       # Git config
├── vosk-model/                      # Modelo PT-BR
└── app/
    └── voice/
        ├── hotword_listener.js      # Detecção "Ultron"
        ├── intent_router.js         # Interpretação
        ├── command_executor_generic.js  # Execução
        └── voice_capture.js         # Captura FFmpeg
```

### Rodando em Desenvolvimento

```bash
# Teste o Vosk
node test-vosk.js

# Rode com debug
node --inspect ultron-ffmpeg-vosk.js

# Teste FFmpeg sozinho
ffmpeg -f dshow -i audio="Seu Microfone" -t 5 teste.wav
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch: `git checkout -b feature/sua-feature`
3. Commit suas mudanças: `git commit -m 'Add sua feature'`
4. Push para a branch: `git push origin feature/sua-feature`
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença **MIT** — veja [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- [Vosk](https://alphacephei.com/vosk/) — Speech recognition
- [FFmpeg](https://ffmpeg.org/) — Audio capture
- [Node.js](https://nodejs.org/) — Runtime

---

## 📞 Suporte & Contato

Encontrou um bug? Abra uma **Issue** no GitHub!

```
GitHub Issues: https://github.com/seu-usuario/ultron/issues
```

---

<div align="center">

**Ultron agora ouve você — totalmente offline, totalmente seguro** 🦾🎙️

*Desenvolvido com ❤️ para Windows*

</div>

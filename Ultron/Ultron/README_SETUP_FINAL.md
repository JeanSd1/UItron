# 🎤 ULTRON — Voice Assistant (Português)

**Ultron é um assistente de voz offline em tempo real para Windows, controlado 100% por comando vocal.**

---

## 📋 Requisitos do Sistema

- **Windows 10/11**
- **Node.js v18+** → [Instalar](https://nodejs.org)
- **FFmpeg** → [Instalar](https://ffmpeg.org/download.html)
- **Microfone funcionando**

---

## ⚡ Instalação Rápida (5 minutos)

### 1️⃣ Instalar FFmpeg (Windows)

**Opção A: Chocolatey (RECOMENDADO)**
```powershell
choco install ffmpeg -y
```

**Opção B: Manual**
- Baixe em: https://ffmpeg.org/download.html
- Extraia em: `C:\ffmpeg`
- Adicione ao PATH do Windows

Verificar instalação:
```powershell
ffmpeg -version
```

### 2️⃣ Instalar Node.js

Baixe em: https://nodejs.org (v18 ou superior)

Verificar:
```powershell
node --version
npm --version
```

### 3️⃣ Instalar Dependências do Ultron

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
npm install vosk --legacy-peer-deps
```

### 4️⃣ Baixar Modelo Vosk PT-BR

```powershell
node download-modelo-vosk.js
```

Ou manualmente:
```powershell
# No PowerShell
$url = "https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip"
$output = "vosk-model-pt-br.zip"
Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive $output
Rename-Item vosk-model-small-pt-0.3 vosk-model
Remove-Item $output
```

### 5️⃣ Verificar Microfone

```powershell
ffmpeg -list_devices true -f dshow -i dummy
```

Procure por "audio" e anote o nome EXATO do seu microfone.

---

## 🚀 Como Usar

### **Iniciar ULTRON — Modo Contínuo (SEM ENTER)**

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
node ultron-continuo.js
```

**Como usar:**
1. Programa inicia e aguarda
2. Fale: **"Oi Ultron"** ou qualquer comando
3. Ultron executa
4. Aguarda próximo comando

**Exemplos de comandos:**
- `"abra a calculadora"`
- `"abra o chrome"`
- `"qual é a hora"`
- `"abra o notepad"`

### **Iniciar ULTRON — Modo Interativo (COM ENTER)**

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
node ultron-ffmpeg-vosk.js
```

**Como usar:**
1. Aperte ENTER (uma vez) para gravar
2. Fale seu comando
3. Ultron executa
4. Repita

---

## 📦 Dependências Instaladas

| Pacote | Versão | Uso |
|--------|--------|-----|
| `vosk` | latest | Reconhecimento de fala PT-BR offline |
| `node` | v24.11.0+ | Runtime JavaScript |
| `ffmpeg` | v8.0.1+ | Captura de áudio do microfone |

---

## 🔧 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `ultron-continuo.js` | **MAIN** - Modo contínuo sem ENTER |
| `ultron-ffmpeg-vosk.js` | Modo interativo com ENTER |
| `app/voice/executor_robusto.js` | Executor de comandos |
| `app/voice/hotword_listener.js` | Detecção de hotword "Ultron" |
| `app/voice/intent_router.js` | Roteador de intenções |
| `vosk-model/` | Modelo PT-BR pré-carregado |

---

## 📊 Comandos Suportados

### Aplicações
```
abra o chrome
abra o firefox
abra o edge
abra a calculadora
abra o notepad / bloco de notas
abra o explorador / arquivos
abra o word
abra o excel
```

### Informações do Sistema
```
qual é a hora
qual é a data
status do sistema
listar arquivos
```

---

## 🎤 Como Descobrir Seu Microfone

```powershell
ffmpeg -list_devices true -f dshow -i dummy 2>&1 | Select-String "audio"
```

Se precisar mudar o microfone, edite em `ultron-continuo.js`:

```javascript
const MICROFONE = "Seu Microfone Nome Aqui";
```

---

## 🐛 Troubleshooting

### ❌ Erro: "Modelo Vosk não encontrado"
```powershell
node download-modelo-vosk.js
```

### ❌ Erro: "FFmpeg not found"
- Instale FFmpeg via Chocolatey ou manualmente
- Adicione ao PATH do Windows

### ❌ Microfone não está sendo ouvido
```powershell
ffmpeg -f dshow -i "audio=Seu Microfone" -t 5 test.wav
ffprobe test.wav
```

### ❌ Vosk não transcreve
- Fale mais alto e perto do microfone
- Verifique se FFmpeg está capturando áudio
- Teste: `ffmpeg -list_devices true -f dshow -i dummy`

---

## 📝 Próximos Passos

✅ Ultron está **100% funcional**
✅ Executa comandos por voz
✅ Roda offline (sem internet)
✅ Pronto para customização

### Evolução possível:
- [ ] Adicionar mais comandos customizados
- [ ] Integrar com APIs externas
- [ ] Modo conversacional
- [ ] Grammar custom PT-BR
- [ ] Confirmação por voz

---

## 📄 Licença

MIT License — Livre para usar e modificar.

---

## 👤 Desenvolvido por

**Projeto Ultron** — Jan 2026

---

## 🤝 Contribuições

Sinta-se livre para forkar, clonar e melhorar!

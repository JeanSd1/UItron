# 📦 Dependências & Extensões — ULTRON

## 🔧 Dependências Instaladas (npm)

```json
{
  "dependencies": {
    "vosk": "^0.11.0"
  }
}
```

**Instalar:**
```powershell
npm install vosk --legacy-peer-deps
```

### Por que `--legacy-peer-deps`?
Vosk é uma binding nativa (C++) para Node.js. A flag `--legacy-peer-deps` resolve conflitos de versão com módulos nativos.

---

## 🎤 Dependências do Sistema

### FFmpeg v8.0.1+

**O que é?** 
Captura áudio do microfone em tempo real, convertendo para WAV 16kHz mono.

**Instalação:**

**Windows (Chocolatey - RECOMENDADO):**
```powershell
choco install ffmpeg -y
```

**Windows (Manual):**
1. Baixe em: https://ffmpeg.org/download.html
2. Extraia em: `C:\ffmpeg`
3. Adicione ao PATH: `C:\ffmpeg\bin`

**Verificar:**
```powershell
ffmpeg -version
```

**Localização esperada:**
- `C:\Program Files\ffmpeg\bin\ffmpeg.exe` (Chocolatey)
- `C:\ffmpeg\bin\ffmpeg.exe` (Manual)

---

### Node.js v18+

**O que é?**
Runtime JavaScript para executar Ultron.

**Instalação:**
- Baixe em: https://nodejs.org
- Escolha LTS (v20+) ou qualquer v18+

**Verificar:**
```powershell
node --version    # v24.11.0 ou similar
npm --version     # 10.x.x ou similar
```

---

### Vosk Model PT-BR

**O que é?**
Modelo de reconhecimento de fala treinado para português brasileiro, offline.

**Tamanho:** 32MB
**Localização:** `./vosk-model/` na raiz do projeto

**Baixar manualmente:**
```powershell
$url = "https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip"
$output = "vosk-model-pt-br.zip"
Invoke-WebRequest -Uri $url -OutFile $output
Expand-Archive $output
Rename-Item vosk-model-small-pt-0.3 vosk-model
Remove-Item $output
```

**Ou via script:**
```powershell
node download-modelo-vosk.js
```

**Verificar:**
```powershell
ls vosk-model\
# Deve conter: am/, conf/, graph/, ...
```

---

## 🏗️ Arquitetura de Dependências

```
Ultron
  ├── Node.js (runtime)
  │   ├── Vosk (binding nativa)
  │   └── vosk-model-pt-br (32MB)
  │
  └── FFmpeg (sistema)
      └── dshow (Windows Audio)
          └── Seu Microfone
```

**Fluxo de dados:**
```
Microfone
  ↓ (audio)
FFmpeg (captura)
  ↓ (s16le 16kHz)
Node.js (stream)
  ↓
Vosk (processamento)
  ↓ (texto)
Executor (ação)
```

---

## ⚙️ Versões Recomendadas

| Componente | Versão Testada | Mínima | Máxima |
|-----------|-----------------|-------|--------|
| Node.js | v24.11.0 | v18.0.0 | latest |
| npm | 10.8.2 | 8.0.0 | latest |
| FFmpeg | 8.0.1 | 4.4.0 | latest |
| Vosk | 0.11.0 | 0.11.0 | 0.11.x |
| vosk-model-pt-br | 0.3 | 0.3 | 0.3 |

---

## 🔍 Verificação Completa

Execute este script para verificar tudo:

```powershell
# Node.js
Write-Host "Node:" -ForegroundColor Green
node --version
npm --version

# FFmpeg
Write-Host "`nFFmpeg:" -ForegroundColor Green
ffmpeg -version | Select-Object -First 1

# Vosk (npm)
Write-Host "`nVosk (npm):" -ForegroundColor Green
npm list vosk

# Vosk Model
Write-Host "`nVosk Model:" -ForegroundColor Green
if (Test-Path "vosk-model") {
    Write-Host "✅ Modelo encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Modelo NÃO encontrado" -ForegroundColor Red
}

# Microfone
Write-Host "`nMicrofones detectados:" -ForegroundColor Green
ffmpeg -list_devices true -f dshow -i dummy 2>&1 | Select-String "audio"
```

---

## 📥 Instalação Completa (Zero to Hero)

```powershell
# 1. FFmpeg
choco install ffmpeg -y

# 2. Node.js (se não tiver)
choco install nodejs -y

# 3. Ir para pasta do projeto
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"

# 4. Instalar Vosk npm
npm install vosk --legacy-peer-deps

# 5. Baixar modelo PT-BR
node download-modelo-vosk.js

# 6. Verificar instalação
npm list vosk
ls vosk-model

# 7. Rodar Ultron
node ultron-continuo.js
```

---

## 🔄 Atualizar Dependências

```powershell
# Vosk npm
npm update vosk

# FFmpeg (via Chocolatey)
choco upgrade ffmpeg -y

# Node.js (via Chocolatey)
choco upgrade nodejs -y
```

---

## 🗑️ Limpar Cache & Reinstalar

```powershell
# Remover node_modules
rmdir node_modules -Recurse -Force

# Reinstalar
npm install vosk --legacy-peer-deps
```

---

## 📊 Tamanho de Dependências

| Pacote | Tamanho |
|--------|---------|
| node_modules/ | ~200MB |
| vosk-model/ | 32MB |
| FFmpeg | ~30MB |
| **Total** | **~262MB** |

---

## 🆘 Troubleshooting

### ❌ "vosk not found"
```powershell
npm install vosk --legacy-peer-deps
```

### ❌ "ffmpeg: command not found"
```powershell
choco install ffmpeg -y
# Reinicie o PowerShell
```

### ❌ "vosk-model not found"
```powershell
node download-modelo-vosk.js
```

### ❌ "Erro ao compilar Vosk"
```powershell
# Instale build tools
npm install --global windows-build-tools

# Reinstale
npm install vosk --legacy-peer-deps
```

---

## 🔐 Segurança

- ✅ FFmpeg — Código aberto, auditável
- ✅ Vosk — Offline, sem tracking
- ✅ Node.js — Runtime confiável
- ✅ Sem dependências externas perigosas

---

## 📝 package.json Recomendado

```json
{
  "name": "ultron",
  "version": "1.0.0",
  "description": "Voice assistant for Windows",
  "main": "ultron-continuo.js",
  "scripts": {
    "start": "node ultron-continuo.js",
    "test": "node test-vosk.js",
    "download-model": "node download-modelo-vosk.js"
  },
  "dependencies": {
    "vosk": "^0.11.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

**Última atualização:** Jan 2026

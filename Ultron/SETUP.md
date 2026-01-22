# 🎤 ULTRON - Guia de Instalação Completo

## Requisitos do Sistema

- **Windows 10/11** (Home, Pro, Enterprise)
- **Node.js v16+** ([Baixar](https://nodejs.org))
- **FFmpeg 4.0+** (instalado via Chocolatey ou manual)
- **Microfone conectado** (USB ou integrado)

---

## 📋 PASSO 1 — Instalar Node.js

1. Acesse: https://nodejs.org (versão LTS recomendada)
2. Baixe e execute o instalador
3. Marque a opção: "Automatically install the necessary tools"
4. Conclua a instalação
5. Verifique no PowerShell:
```powershell
node -v
npm -v
```

---

## 📋 PASSO 2 — Instalar FFmpeg

### Opção A: Via Chocolatey (Recomendado)

```powershell
# Se não tiver Chocolatey, instale primeiro:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Agora instale FFmpeg:
choco install ffmpeg -y
```

### Opção B: Manual

1. Acesse: https://www.gyan.dev/ffmpeg/builds/
2. Baixe "full" ou "essentials"
3. Extraia para: `C:\ffmpeg`
4. Adicione à variável PATH do Windows:
   - Painel de Controle → Variáveis de Ambiente
   - Editar PATH → Adicione: `C:\ffmpeg\bin`

### Verificar instalação:
```powershell
ffmpeg -version
```

---

## 📋 PASSO 3 — Clonar/Preparar Ultron

```powershell
# Se clonar do GitHub:
git clone https://github.com/seu-usuario/ultron.git
cd ultron/Ultron

# Ou, se já tem os arquivos localmente:
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
```

---

## 📋 PASSO 4 — Instalar Dependências Node.js

```powershell
npm install vosk --legacy-peer-deps
```

---

## 📋 PASSO 5 — Baixar Modelo Vosk (PT-BR)

Ultron precisa do modelo de reconhecimento de voz em Português:

```powershell
# Baixe o modelo (32MB):
Invoke-WebRequest -Uri "https://alphacephei.com/vosk/models/vosk-model-small-pt-0.3.zip" -OutFile "vosk-model-pt-br.zip" -UseBasicParsing

# Extraia:
Expand-Archive -Path vosk-model-pt-br.zip -DestinationPath .

# Renomeie para o padrão:
Rename-Item -Path "vosk-model-small-pt-0.3" -NewName "vosk-model" -Force
```

Resultado final:
```
Ultron/
├── vosk-model/
│   ├── am/
│   ├── conf/
│   ├── graph/
│   └── phones.txt
├── ultron-ffmpeg-vosk.js
├── app/
│   └── voice/
│       ├── hotword_listener.js
│       ├── intent_router.js
│       └── command_executor_generic.js
```

---

## 📋 PASSO 6 — Identificar seu Microfone

```powershell
ffmpeg -list_devices true -f dshow -i dummy 2>&1 | Select-String "audio"
```

Procure por algo como:
```
[dshow @ ...] "Microfone (2- High Definition Audio Device)" (audio)
```

Se o nome for diferente, **edite** `ultron-ffmpeg-vosk.js`:

```javascript
// Linha 10 — ajuste para seu microfone:
const MICROFONE = "Seu Microfone Aqui";
```

---

## 📋 PASSO 7 — Testar Vosk

```powershell
node test-vosk.js
```

Resultado esperado:
```
✅ Modelo carregado com sucesso!
```

---

## 📋 PASSO 8 — Rodar Ultron

```powershell
node ultron-ffmpeg-vosk.js
```

Você verá:
```
╔════════════════════════════════════════════════════════╗
║ 🎤 ULTRON - VOZ COM FFMPEG + VOSK                     ║
║ Modelo PT-BR carregado ✅                             ║
╚════════════════════════════════════════════════════════╝

[ENTER=GRAVAR | Digite | 'sair'] =>
```

---

## 🎤 Como Usar

### Modo Voz
1. **Pressione ENTER** (sem digitar nada)
2. **Grave seu comando** por até 8 segundos
3. **Fale com "Ultron"** no início:
   - ✅ "Ultron qual é a hora"
   - ✅ "Ultron abra o notepad"
   - ✅ "Ultron listar arquivos"
   - ✅ "Ultron como está o sistema"

### Modo Texto
- **Digite diretamente** e pressione ENTER
- Não precisa do hotword
- Ultron executa o comando

### Fechar
- **Digite: `sair`**

---

## 🛠️ Troubleshooting

### ❌ "Vosk não instalado"
```powershell
npm install vosk --legacy-peer-deps
```

### ❌ "Modelo Vosk não encontrado"
Siga o PASSO 5 acima

### ❌ "FFmpeg não reconhecido"
```powershell
ffmpeg -version
# Se falhar, FFmpeg não está no PATH
# Reinstale via Chocolatey ou configure manualmente
```

### ❌ "Microfone silencioso"
1. Verifique em: Configurações → Som → Entrada
2. Ajuste o volume do microfone
3. Teste com: `ffmpeg -f dshow -i audio="seu_microfone" -t 3 teste.wav`
4. Toque `teste.wav` para ouvir

### ❌ "Comando não executado"
- Verifique sintaxe do PowerShell
- Ultron tenta executar como comando do sistema
- Alguns comandos podem estar bloqueados por permissões

---

## 📦 Estrutura de Arquivos

```
Ultron/
├── ultron-ffmpeg-vosk.js          # Arquivo principal
├── test-vosk.js                    # Teste de Vosk
├── package-ultron.json             # Dependências
├── SETUP.md                         # Este arquivo
├── vosk-model/                      # Modelo PT-BR
└── app/
    └── voice/
        ├── hotword_listener.js      # Detecção "Ultron"
        ├── intent_router.js         # Interpretação de intenções
        └── command_executor_generic.js  # Execução de comandos
```

---

## 🚀 Próximos Passos

Após instalação funcional:
1. **Adicione comandos personalizados** em `intent_router.js`
2. **Configure hotword** em `hotword_listener.js`
3. **Melhore a execução** em `command_executor_generic.js`

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o log do terminal
2. Confirme que FFmpeg está instalado: `ffmpeg -version`
3. Confirme que Vosk está carregado: `node test-vosk.js`
4. Abra uma issue no GitHub com o erro completo

---

**Ultron está pronto para ouvir seus comandos! 🦾🎙️**

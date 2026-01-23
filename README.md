# 🎤 ULTRON - Voice Assistant & Command Executor

Sistema inteligente que executa comandos no seu PC por **voz** ou **texto** em Português.

**Versão:** 2.0 | **Status:** ✅ Pronto para Usar | **Tipo:** Voice + Text Commands

---

## 🚀 Início Rápido (30 segundos)

### ⚡ Executar Ultron Agora

Abra o PowerShell e execute:

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
python app/voice/ultron_main.py
```

**Pronto!** Ultron está escutando. Diga seus comandos em Português.

---

## 💬 Como Usar

### 🎙️ Por VOZ (Recomendado)

1. Fale seu comando naturalmente em Português
2. Ultron reconhece automaticamente
3. Executa com autorização
4. Responde por voz

**Exemplos:**
```
"Ultron qual é a hora"
"Ultron abra o notepad"
"Ultron listar arquivos"
"Ultron como está o sistema"
"Ultron abra o explorador"
```

### ⌨️ Por TEXTO (Alternativa)

Se o microfone não funcionar, use a alternativa com texto:

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
python app/voice/ultron_main.py
```

---

## 📋 Comandos Disponíveis

| Categoria | Comando | Exemplo |
|-----------|---------|---------|
| **Aplicações** | Abrir apps | "abra o notepad", "abra o excel" |
| **Sistema** | Status | "qual é a hora", "qual é a data" |
| **Arquivos** | Listar | "listar arquivos", "abra o explorador" |
| **Genérico** | Executar | "abra calculadora", "status do sistema" |

---

## 📚 Documentação

- [MANUAL_USUARIO.md](MANUAL_USUARIO.md) - Guia completo
- [STATUS_FINAL.txt](STATUS_FINAL.txt) - Versão final
- [Ultron/GUIA_COMANDOS_AVANCADOS.md](Ultron/GUIA_COMANDOS_AVANCADOS.md) - Todos os comandos

---

## 🔒 Segurança

✅ Cada comando requer aprovação  
✅ Bloqueio automático de comandos perigosos  
✅ Auditoria de todas as ações  
✅ Funciona 100% offline (sem dados na nuvem)

---

## 📁 Estrutura do Projeto

```
Projeto Ultron/
├── README.md                   ← Você está aqui 👈
├── rodar-teste.js              ← Menu interativo
├── MANUAL_USUARIO.md           ← Guia completo
├── STATUS_FINAL.txt            ← Status do projeto
└── Ultron/
    ├── ultron-continuo.js      ← PRINCIPAL (execute isto)
    ├── package.json            ← Dependências
    ├── app/
    │   └── voice/              ← Módulos de voz
    │       ├── executor_robusto.js
    │       ├── hotword_listener.js
    │       └── ...
    └── vosk-model/             ← Modelo de voz PT-BR
```

---

## ⚙️ Pré-requisitos

- **Node.js** 16+ ([baixar](https://nodejs.org/))
- **FFmpeg** 4.0+ ([baixar](https://ffmpeg.org/))
- **Modelo Vosk PT-BR** (baixado automaticamente)
- **Microfone** (para modo voz)

---

## 🎯 Troubleshooting

### Erro: "vosk-model não encontrado"
```powershell
cd Ultron
npm install
# Modelo será baixado automaticamente
```

### Erro: "Microfone não detectado"
Verifique o nome do microfone em `ultron-continuo.js` linha 21.
Ou use modo texto: `node rodar-teste.js`

### Erro: "FFmpeg não encontrado"
```powershell
choco install ffmpeg
# ou baixe em: https://ffmpeg.org/
```

---

## 🚀 Próximas Etapas

1. ✅ Execute: `node ultron-continuo.js`
2. ✅ Fale um comando
3. ✅ Veja a mágica acontecer!

---

## 👨‍💻 Desenvolvedor

**Desenvolvido por:** [Jean Durgante (@JeanSd1)](https://github.com/JeanSd1)

- 🔗 GitHub: https://github.com/JeanSd1
- 🎯 Projeto: [UItron - Voice Assistant for Windows](https://github.com/JeanSd1/UItron)
- 📅 Versão: 2.0 | 2026

---

**Desenvolvido com ❤️ em Português**

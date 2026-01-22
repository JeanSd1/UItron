# 🎤 ULTRON - Voice Assistant & Command Executor

Sistema inteligente que executa comandos no seu PC por **voz** ou **texto**.

---

## 🚀 Início Rápido

### Opção 1: Iniciar Ultron (RECOMENDADO!)

```bash
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron" ; node ultron-continuo.js
```

### Opção 2: Menu Interativo

```bash
node rodar-teste.js
```

Escolha uma opção no menu:
1. Rodar Ultron (Voice + Text)
2. Teste rápido do seu comando
3. Demonstração de comandos
4. Sair

---

## 💬 Como Usar

### Por VOZ (Microfone)
1. **FALE** seu comando (ex: "abra novo documento de texto e escreva olá mundo")
2. Digite **sim** quando pedir autorização
3. Pronto! ✨

### Por TEXTO (Se microfone não funcionar)
1. Digite o comando direto no terminal
2. O resto funciona igual!

---

## 📋 Exemplos de Comandos

```
"abra novo documento de texto e escreva olá mundo"
"qual é a hora"
"como está o sistema"
"abrir calculadora"
"listar arquivos"
```

---

## 📚 Documentação

- **[MANUAL_USUARIO.md](MANUAL_USUARIO.md)** - Guia completo de uso
- **[STATUS_FINAL.txt](STATUS_FINAL.txt)** - Status final do projeto
- **[Ultron/GUIA_COMANDOS_AVANCADOS.md](Ultron/GUIA_COMANDOS_AVANCADOS.md)** - Todos os comandos

---

## 🔐 Segurança

✅ Cada comando requer autorização (você digita "sim")  
✅ Bloqueio automático de comandos perigosos  
✅ Auditoria de todas as ações  

---

## 📁 Estrutura

```
Projeto Ultron/
├── rodar-teste.js              ← Menu interativo 🎯
├── MANUAL_USUARIO.md           ← Guia de uso
├── STATUS_FINAL.txt            ← Status do projeto
└── Ultron/
    ├── ultron-voice-full.js    ← Sistema principal
    ├── app/voice/              ← Módulos do Ultron
    └── ...
```

---

## 🎯 Teste Rápido

Para testar sem falar:

```bash
node rodar-teste.js
# Selecione opção 2
```

---

**Versão:** 2.0  
**Status:** ✅ Pronto para Uso

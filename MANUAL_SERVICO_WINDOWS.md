# 🔄 MANUAL DE SERVIÇO WINDOWS - ULTRON SEMPRE ACORDADO

**Faça Ultron rodar automaticamente no seu computador sem precisar abrir terminal!**

---

## 🎯 O QUE VOCÊ VAI CONSEGUIR

✅ Ultron inicia automaticamente quando você liga o PC
✅ Fica sempre rodando em background
✅ Sem precisar abrir PowerShell/Terminal
✅ Acorde o Ultron com um hotkey (atalho)
✅ Controle completo via interface

---

## 📌 IMPORTANTE: Requisitos

- ✅ Node.js instalado
- ✅ Projeto Ultron baixado
- ✅ Dependências instaladas (`npm install` completo)
- ⚠️ Requer **Administrador** para instalar como serviço

---

## SOLUÇÃO 1: USAR NSSM (Recomendado)

### O que é NSSM?

**NSSM** = Non-Sucking Service Manager - gerenciador de serviços Windows

Vantagens:
- Muito fácil de usar
- Automático ao ligar o PC
- Gerenciável pelo Windows Service Manager
- Funciona perfeitamente

### Passo 1: Baixar NSSM

1. Acesse: https://nssm.cc/download
2. Baixe a versão **nssm-2.24.zip** (64-bit se seu PC for 64-bit)
3. Extraia em: `C:\nssm`

### Passo 2: Criar Script de Inicialização

Crie um arquivo chamado `iniciar-ultron.bat` em `C:\Desenvolvimento\UItron\Ultron\`:

```batch
@echo off
cd /d "C:\Desenvolvimento\UItron\Ultron"
node ultron-voice-full.js
pause
```

**Substitua o caminho se você instalou em outro lugar!**

### Passo 3: Abrir PowerShell como Administrador

1. Pressione `Win + X`
2. Selecione **"Windows PowerShell (Administrador)"**
3. Clique em **"Sim"** na confirmação

### Passo 4: Instalar como Serviço

Execute no PowerShell (como Administrador):

```powershell
# Adicionar NSSM ao PATH
$env:Path += ";C:\nssm"

# Instalar Ultron como serviço
nssm install UltronVoice "C:\Desenvolvimento\UItron\Ultron\iniciar-ultron.bat"

# Configurar para iniciar ao ligar
nssm set UltronVoice Start SERVICE_AUTO_START

# Iniciar o serviço agora
nssm start UltronVoice
```

### Passo 5: Verificar se funcionou

```powershell
# Listar serviços
Get-Service | findstr Ultron

# Deve mostrar algo como:
# UltronVoice    Running
```

✅ Pronto! Ultron agora:
- Inicia automaticamente ao ligar o PC
- Fica sempre rodando
- Você pode acessar via PowerShell quando quiser

---

## SOLUÇÃO 2: USAR TASK SCHEDULER (Windows Nativo)

Se preferir não instalar NSSM, pode usar o Agendador de Tarefas do Windows:

### Passo 1: Criar Script de Inicialização

Mesmo arquivo `iniciar-ultron.bat` da Solução 1

### Passo 2: Abrir Task Scheduler

1. Pressione `Win + R`
2. Digite: `taskschd.msc`
3. Clique **"OK"**

### Passo 3: Criar Nova Tarefa

1. Clique em **"Criar Tarefa..."** (lado direito)
2. Preencha:
   - **Nome:** `Ultron Voice Assistant`
   - **Descrição:** `Executar Ultron automaticamente`
   - ✅ Marque: **"Executar com privilégios mais altos"**

### Passo 4: Configurar Gatilho

1. Clique na aba **"Gatilhos"**
2. Clique **"Novo..."**
3. Selecione:
   - **Iniciar uma tarefa:** `"No logon de um usuário"`
   - **Usuário:** `Seu usuário Windows`
   - ✅ **Marque:** "Executada com privilégios mais altos"
4. Clique **"OK"**

### Passo 5: Configurar Ação

1. Clique na aba **"Ações"**
2. Clique **"Novo..."**
3. Preencha:
   - **Ação:** `"Iniciar um programa"`
   - **Programa/script:** `C:\Desenvolvimento\UItron\Ultron\iniciar-ultron.bat`
4. Clique **"OK"**

### Passo 6: Configurar Condições

1. Clique na aba **"Condições"**
2. Desmarque tudo (para rodar mesmo se não estiver usando)
3. Clique **"OK"**

✅ Pronto! Tarefa criada e vai rodar ao ligar o PC!

---

## SOLUÇÃO 3: CRIAR ATALHO NA INICIALIZAÇÃO

Se quiser que inicie ao ligar, mas com controle manual:

### Passo 1: Criar Arquivo .bat

`C:\Desenvolvimento\UItron\Ultron\start-ultron.bat`:

```batch
@echo off
cd /d "C:\Desenvolvimento\UItron\Ultron"
start "Ultron Voice Assistant" node ultron-voice-full.js
```

### Passo 2: Criar Atalho

1. Clique direito no arquivo `.bat`
2. Selecione **"Enviar para"** → **"Área de Trabalho (criar atalho)"**

### Passo 3: Inicialização Automática (Opcional)

1. Pressione `Win + R`
2. Digite: `shell:startup`
3. Pressione **"OK"**
4. Arraste o atalho para esta pasta

✅ Ultron vai iniciar ao ligar o PC!

---

## 🎮 PARAR/REINICIAR ULTRON

### Se instalou com NSSM:

```powershell
# Parar o serviço
nssm stop UltronVoice

# Reiniciar
nssm restart UltronVoice

# Desinstalar (se quiser remover)
nssm remove UltronVoice
```

### Se instalou com Task Scheduler:

1. Abra `taskschd.msc`
2. Procure **"Ultron Voice Assistant"**
3. Clique direito → **"Executar"** para iniciar
4. Clique direito → **"Parar tarefa"** para parar

---

## 🆘 TROUBLESHOOTING

### Serviço não inicia

**Verifique:**
1. Caminho do arquivo está correto?
2. Node.js está instalado? (`node --version`)
3. Pasta Ultron está no lugar certo?
4. Rodou como Administrador?

### Erro: "Acesso Negado"

**Solução:**
```powershell
# Rodar PowerShell como Administrador
# Depois tentar novamente
```

### Ultron inicia mas fecha rapidinho

**Adicione `pause` no final do .bat:**

```batch
@echo off
cd /d "C:\Desenvolvimento\UItron\Ultron"
node ultron-voice-full.js
pause
```

### Ver logs do serviço

```powershell
# Ver eventos do serviço
Get-EventLog -LogName System | where {$_.Source -eq "NSSM"} | Format-Table
```

---

## 📋 CHECKLIST

- [ ] Node.js instalado
- [ ] Projeto Ultron em `C:\Desenvolvimento\UItron\Ultron`
- [ ] Arquivo `iniciar-ultron.bat` criado
- [ ] Executado como **Administrador**
- [ ] Serviço/Tarefa criado com sucesso
- [ ] Testado manualmente (rodar uma vez para verificar)
- [ ] Reiniciado o PC e verificou se iniciou

---

## 🚀 PRÓXIMO PASSO

Após configurar serviço/tarefa:

1. Leia **MANUAL_VOZ_CONFIGURACAO.md** - Configurar microfone
2. Teste comandos de voz
3. Divirta-se com Ultron! 🎉

---

**Versão:** 1.0  
**Data:** 21/01/2026  
**Status:** ✅ Ultron Sempre Acordado!

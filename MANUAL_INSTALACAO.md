# 📥 MANUAL DE INSTALAÇÃO - ULTRON

**Complete em seu computador pessoal para começar a usar Ultron!**

---

## 🎯 O QUE VOCÊ PRECISA INSTALAR

1. **Node.js** - Ambiente de execução JavaScript
2. **Git** - Controle de versão (opcional, mas recomendado)
3. **Projeto Ultron** - Download do repositório
4. **Dependências do Projeto** - Pacotes npm necessários

---

## ✅ PASSO 1: INSTALAR NODE.JS

### Windows 10/11

#### Opção A: Download direto (Recomendado)

1. Acesse: https://nodejs.org/
2. Clique em **"LTS"** (Versão estável recomendada)
3. Baixe o arquivo `.msi`
4. Execute o instalador
5. Clique **"Next"** até terminar
6. **IMPORTANTE**: Deixe marcadas as opções:
   - ✅ Install Node.js runtime
   - ✅ npm package manager
   - ✅ Add to PATH

#### Opção B: Usando Chocolatey (Se tiver instalado)

```powershell
choco install nodejs
```

#### Opção C: Usando Windows Package Manager

```powershell
winget install OpenJS.NodeJS
```

### Verificar instalação

Abra PowerShell e digite:

```powershell
node --version
npm --version
```

Você deve ver algo como:
```
v18.17.1
9.6.7
```

---

## ✅ PASSO 2: INSTALAR GIT (Opcional mas Recomendado)

### Baixar e Instalar

1. Acesse: https://git-scm.com/download/win
2. Baixe o instalador
3. Execute e clique **"Next"** até terminar
4. Use as configurações padrão

### Verificar instalação

```powershell
git --version
```

---

## ✅ PASSO 3: BAIXAR PROJETO ULTRON

### Opção A: Clonar do GitHub (Com Git)

```powershell
# Abra PowerShell em uma pasta de sua escolha
cd "C:\Desenvolvimento"  # Ou qualquer outra pasta

# Clone o repositório
git clone https://github.com/JeanSd1/UItron.git

# Entre na pasta
cd UItron/Ultron
```

### Opção B: Download direto (Sem Git)

1. Acesse: https://github.com/JeanSd1/UItron
2. Clique em **"Code"** → **"Download ZIP"**
3. Extraia a pasta em `C:\Desenvolvimento\UItron` (ou onde preferir)
4. Abra PowerShell dentro da pasta `Ultron`

```powershell
cd "C:\Desenvolvimento\UItron\Ultron"
```

---

## ✅ PASSO 4: INSTALAR DEPENDÊNCIAS

### Execute no PowerShell (dentro da pasta Ultron)

```powershell
# Instalar todas as dependências
npm install

# Espere completar (pode levar 2-5 minutos)
```

Você verá muitas linhas sendo instaladas. **Isso é normal!** 

### Verificar se instalou tudo

```powershell
npm list --depth=0
```

Deve mostrar pacotes instalados.

---

## ✅ PASSO 5: VERIFICAR INSTALAÇÃO

Execute este comando para testar:

```powershell
# Teste se tudo funcionou
node -e "console.log('✅ Node.js está funcionando!')"

# Teste se npm está funcionando
npm -v
```

---

## 🚀 PASSO 6: INICIAR ULTRON

Agora você está pronto! Use um destes comandos:

### Executar com Voz

```powershell
node ultron-voice-full.js
```

### Executar com Texto

```powershell
node ultron-texto.js
```

### Testar sem Voz

```powershell
node teste-seu-comando.js
```

---

## 📂 ESTRUTURA DE PASTAS

Após instalar, sua estrutura deve ficar assim:

```
C:\Desenvolvimento\UItron\
├── Ultron/
│   ├── ultron-voice-full.js      ← Use este!
│   ├── app/
│   │   ├── voice/
│   │   ├── config/
│   │   └── ...
│   ├── node_modules/             ← Instalado com npm install
│   ├── package.json
│   └── package-lock.json
├── MANUAL_USUARIO.md
├── README.md
└── ...
```

---

## 🆘 TROUBLESHOOTING

### Erro: "node não é reconhecido"

**Solução:**
1. Instale Node.js novamente
2. **Reinicie o PowerShell** após instalar
3. Verifique se está em PATH:
```powershell
$env:PATH -split ';' | findstr Node
```

### Erro: "npm ERR! 404 Not Found"

**Solução:**
```powershell
# Limpar cache npm
npm cache clean --force

# Tentar instalar novamente
npm install
```

### Erro: "Cannot find module"

**Solução:**
```powershell
# Deletar node_modules
Remove-Item node_modules -Recurse -Force

# Reinstalar
npm install
```

### PowerShell recusa executar scripts

**Solução:**
```powershell
# Mudar política de execução
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Confirmar com 'Y'
```

---

## 📋 COMANDOS RÁPIDO RESUMO

```powershell
# Pasta de instalação
cd "C:\Desenvolvimento\UItron\Ultron"

# Instalar dependências
npm install

# Iniciar Ultron
node ultron-voice-full.js

# Testar comandos
node teste-seu-comando.js
```

---

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] Node.js instalado (`node --version` funciona)
- [ ] npm instalado (`npm --version` funciona)
- [ ] Projeto baixado em `C:\Desenvolvimento\UItron`
- [ ] Dependências instaladas (`npm install` completou)
- [ ] Pasta `node_modules` existe
- [ ] Arquivo `ultron-voice-full.js` existe

Se tudo marcado ✅, você está pronto para usar!

---

## 🎬 PRÓXIMO PASSO

Depois de instalar, leia:

1. **MANUAL_USUARIO.md** - Como usar Ultron
2. **MANUAL_SERVICO_WINDOWS.md** - Fazer rodar como serviço
3. **MANUAL_VOZ_CONFIGURACAO.md** - Configurar voz

---

**Versão:** 1.0  
**Data:** 21/01/2026  
**Status:** ✅ Pronto para Instalar!

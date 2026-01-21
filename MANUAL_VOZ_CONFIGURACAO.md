# 🎤 MANUAL DE CONFIGURAÇÃO DE VOZ - ULTRON

**Fazer Ultron ouvir e responder por voz corretamente!**

---

## 🎯 PROBLEMA COMUM

❌ **"Ultron não está ouvindo minha voz"**
❌ **"Diz 'NÃO CAPTUROU' sempre"**
❌ **"Não reconhece meus comandos"**

✅ Este manual resolve tudo!

---

## 📋 PASSO 1: VERIFICAR MICROFONE DO WINDOWS

### Teste 1: Microfone Reconhecido?

1. Clique no **ícone de som** (canto inferior direito)
2. Procure por **"Configurações de som"** ou **"Volume de entrada"**
3. Você deve ver seu microfone listado

Se não aparecer:
- ⚠️ Microfone não está reconhecido!
- Verifique se está plugado
- Tente outra porta USB

### Teste 2: Microfone Está Ativado?

1. Vá em **Configurações** → **Som** → **Avançado** → **Volume de entrada**
2. Deve estar ✅ **Não está mutilizado**
3. Deve ter **volume em pelo menos 50%**

### Teste 3: Teste de Microfone

1. Vá em **Configurações** → **Som** → **Entrada**
2. Clique em **"Teste seu microfone"**
3. **Fale algo**
4. Verifique se a barra de volume sobe

❌ Se não funcionar: Verifique cabos, drivers, ou tente outro microfone

---

## 🎤 PASSO 2: VERIFICAR MICROFONE COM ULTRON

### Teste Direto

Abra PowerShell na pasta Ultron:

```powershell
cd "C:\Desenvolvimento\UItron\Ultron"
node -e "
const { spawnSync } = require('child_process');
const psScript = \`
  Add-Type -AssemblyName System.Speech;
  \\\$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine;
  \\\$recognizer.SetInputToDefaultAudioDevice();
  \\\$result = \\\$recognizer.Recognize(5000);
  if (\\\$result) { \\\$result.Text; }
\`;
const result = spawnSync('powershell', ['-Command', psScript], { encoding: 'utf-8', timeout: 10000 });
console.log('Você disse:', result.stdout.trim() || 'NADA (não funcionou)');
"
```

**Teste**: Quando aparecer "Fale agora", diga algo como **"Olá Ultron"**

✅ Se funcionar: Seu microfone está OK!
❌ Se não funcionar: Continuar próximos passos

---

## 🔧 PASSO 3: VERIFICAR E ATIVAR PERMISSÕES DO MICROFONE

### Windows 10/11: Ativar Acesso ao Microfone

1. Vá em **Configurações** (Win + I)
2. **Privacidade e Segurança** → **Microfone**
3. Vire ligado: ✅ **Permitir acesso ao microfone**
4. Desça e procure **PowerShell** ou **Terminal**
5. Garanta que está ✅ **Permitido**

### Aplicações Específicas

Se PowerShell não aparecer:
1. Clique em **"Adicionar"**
2. Procure por `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
3. Clique **"Permitir"**

---

## 📊 PASSO 4: TESTAR CAPTURA DE VOZ DO ULTRON

### Teste 1: Modo Simulado

```powershell
node teste-seu-comando.js
```

Deve mostrar um menu. Digite um comando como:
```
abra novo documento de texto e escreva olá mundo
```

✅ Se funcionar: Parser está OK!

### Teste 2: Modo Voz Manual

Execute Ultron:
```powershell
node ultron-voice-full.js
```

Quando aparecer `[ENTER para falar...]`:

1. Pressione **ENTER**
2. Você verá: **"🎤 Fale agora..."**
3. **FALE CLARO:** "qual é a hora"
4. Aguarde resposta

### O Que Pode Dar Errado

| Problema | Solução |
|----------|---------|
| Diz "NÃO CAPTUROU" | Aumente o microfone, fale mais perto |
| Fala muito baixo | Aumente volume do microfone 🔊 |
| Muito ruído | Feche outras abas/apps ruidosas |
| Não reconhece comando | Use padrões simples (ex: "abrir notepad") |

---

## 🎯 PASSO 5: DICAS DE VOZ QUE FUNCIONAM

### ✅ FUNCIONA BEM:

```
"abrir notepad"
"qual é a hora"
"listar arquivos"
"abra novo documento de texto e escreva olá"
"crie uma pasta chamada teste"
"qual é o uptime"
```

### ❌ NÃO FUNCIONA BEM:

```
"você pode abrir um documento?"  (muito formal)
"ei, abre o bloco de notas"  (muito informal)
"execute o comando X" (muito genérico)
```

### 🎙️ REGRAS DE OURO

1. **Fale naturalmente** - Tom conversacional
2. **Não sussurre** - Fale com volume normal
3. **Não grite** - Distorce o áudio
4. **Sem barulho de fundo** - Feche Youtube, Spotify, etc
5. **Perto do microfone** - 20-30 cm é ideal
6. **Frases curtas** - Máximo 10 palavras por comando

---

## 🔊 PASSO 6: AUMENTAR QUALIDADE DE CAPTURA

### Melhorar Ambiente

```
1. Feche todas as abas do navegador
2. Pause Spotify/YouTube
3. Avise pessoas para não fazer barulho
4. Use headset/fone com microfone (melhor que PC)
5. Evite ventilador, ar condicionado ligado
6. Use cabine/canto da sala se possível
```

### Microfone Melhor

Se o seu está fraco:
- **Compre um headset USB** - ~R$ 50
- **Use fone com microfone** - Melhor captação
- **Evite microfone integrado do notebook**

---

## 📞 TESTE COMPLETO: PASSO A PASSO

### Execute este teste:

```powershell
cd "C:\Desenvolvimento\UItron\Ultron"

# 1. Verificar Node.js
Write-Host "✓ Node.js:"
node --version

# 2. Verificar se arquivos existem
Write-Host "`n✓ Arquivos:"
ls -Name ultron-voice-full.js, teste-seu-comando.js

# 3. Iniciar Ultron
Write-Host "`n✓ Iniciando Ultron..."
node ultron-voice-full.js
```

### Durante o teste:

1. Pressione **ENTER**
2. Ouvir: **"🎤 Fale agora..."**
3. Fale: **"qual é a hora"**
4. Espere resposta

✅ Se funcionar: Voz está OK!
❌ Se não funcionar: Ver próxima seção

---

## 🆘 TROUBLESHOOTING VOZ

### "NÃO CAPTUROU - Tente novamente"

**Causas mais comuns:**

| Causa | Solução |
|-------|---------|
| Microfone desligado | Verificar volume em Configurações |
| Muito ruído | Fechar abas, apps ruidosas |
| Falou muito baixo | Falar mais perto, mais alto |
| Sem internet | Reiniciar router (se usar nuvem) |
| PowerShell recusa | Mudar política: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |

### "Ultron não entende meu comando"

**Tentar:**

1. **Digite em vez de falar** (fallback funciona)
2. **Use padrões simples** - "abrir X", "criar pasta X"
3. **Divida em comandos menores**
4. **Fale em português claro**

### Erro: "Speech Recognition Engine não disponível"

**Solução:**

Seu Windows pode não ter o Speech Recognition instalado.

```powershell
# Verificar:
Get-WindowsCapability -Online | findstr Speech

# Instalar se necessário:
Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0"
```

---

## 🎙️ ALTERNATIVA: SE VOZ NÃO FUNCIONAR

Se a voz continuar não funcionando, você pode:

### Opção 1: Usar Modo Texto Sempre

```powershell
# Use sempre assim
node ultron-voice-full.js

# E digite o comando em vez de pressionar ENTER
[ENTER para falar...] > abra novo documento de texto e escreva olá
```

### Opção 2: Usar Google Cloud Speech-to-Text

Se quiser melhor reconhecimento, pode integrar Google Cloud (mais avançado):

1. Criar conta Google Cloud
2. Ativar API Speech-to-Text
3. Fazer download de credenciais
4. Configurar em `app/voice/voice_stt_improved.js`

---

## 📋 CHECKLIST FINAL

- [ ] Microfone plugado e reconhecido
- [ ] Volume do microfone em 50%+ 
- [ ] Microfone não está mutilizado
- [ ] Teste de microfone do Windows passou
- [ ] PowerShell consegue acessar microfone
- [ ] Executou `teste-seu-comando.js` com sucesso
- [ ] Inicializou `ultron-voice-full.js` sem erros
- [ ] Conseguiu falar e receber resposta
- [ ] Comando simples funcionou (ex: "qual é a hora")

Se tudo ✅: **Voz está funcionando!** 🎉

---

## 🚀 PRÓXIMOS PASSOS

1. **Ler MANUAL_USUARIO.md** - Aprender todos os comandos
2. **Ler MANUAL_SERVICO_WINDOWS.md** - Rodar como serviço
3. **Dominar os comandos** - Criar suas rotinas

---

**Versão:** 1.0  
**Data:** 21/01/2026  
**Status:** ✅ Ultron Ouvindo Claro!

# 🎤 MANUAL DE CONFIGURAÇÃO DE VOZ - ULTRON

**Fazer Ultron ouvir e responder por voz corretamente!**

---

## ⚠️ PROBLEMA ENCONTRADO

Seu Windows **NÃO tem Speech Recognition instalado**!

Isso explica por que o Ultron diz **"[NÃO CAPTUROU]"** sempre.

**SOLUÇÃO: Instalar em 5 minutos!**

---

## ✅ PASSO 1: INSTALAR SPEECH RECOGNITION DO WINDOWS

### Windows 10 e 11

1. **Abra PowerShell como ADMINISTRADOR**
   - Pressione `Win + X`
   - Clique em **"Windows PowerShell (Admin)"** ou **"Terminal (Admin)"**
   - Clique em **SIM** quando pedir permissão

2. **Cole este comando:**

```powershell
Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0"
```

3. **Aguarde finalizar** (pode levar 2-5 minutos)

   Você verá:
   ```
   100%
   ```

4. **Reinicie seu computador**

   ```powershell
   Restart-Computer -Force
   ```

---

## ✅ PASSO 2: VERIFICAR INSTALAÇÃO

Depois de reiniciar, abra PowerShell novamente e execute:

```powershell
node "C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron\teste-voz-simples.js"
```

Você verá:
```
Fale agora...
```

**FALE ALGO** como "Olá mundo"

Se funcionar, verá:
```
Olá mundo
✅ Teste finalizado!
```

---

## 🎤 PASSO 3: TESTAR COM ULTRON

Agora teste com o Ultron completo:

```powershell
cd "C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
node ultron-voice-full.js
```

Você verá:
```
[ENTER para falar ou digite 'sair'] >
```

Pressione **ENTER** e fale algo!

---

## 🎯 EXEMPLOS QUE FUNCIONAM

```
"qual é a hora"
"como está o sistema"
"abrir notepad"
"abra novo documento de texto e escreva olá mundo"
"crie uma pasta chamada teste"
"liste pasta desktop"
```

---

## 🔊 DICAS DE VOZ

✅ **Fale claro e naturalmente**
✅ **Não sussurre** - tom normal
✅ **Não grite** - distorce o áudio
✅ **Próximo do microfone** - 20-30 cm
✅ **Sem ruído de fundo** - feche abas ruidosas
✅ **Frases curtas** - máximo 10 palavras

---

## ❌ TROUBLESHOOTING

### "Still NÃO CAPTUROU"

**Verifique:**

1. Speech Recognition está instalado?
   ```powershell
   Get-WindowsCapability -Online | Where-Object { $_.Name -like '*Speech*' }
   ```

2. Microfone funciona em Configurações > Som > Teste de microfone?

3. Microfone permissões em Configurações > Privacidade > Microfone?

4. Drivers do microfone estão atualizados?

### Erro: "Nenhum reconhecedor instalado"

Execute novamente:
```powershell
Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0"
```

E reinicie o computador.

---

## 📋 CHECKLIST

- [ ] PowerShell executado como admin
- [ ] Comando `Add-WindowsCapability` executado
- [ ] Computador reiniciado
- [ ] teste-voz-simples.js passou
- [ ] ultron-voice-full.js consegue ouvir
- [ ] Microfone está desbloqueado em Configurações

Se tudo ✅: **VOZ FUNCIONANDO!** 🎉

---

**Versão:** 2.0 (com instalação automática)  
**Data:** 21/01/2026  
**Status:** ✅ Ultron Ouvindo Claro!

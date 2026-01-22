# 🎯 ULTRON — Guia de Comandos & Inicialização

## ⚡ INICIAR ULTRON

### Windows PowerShell (RECOMENDADO)

```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
node ultron-continuo.js
```

### Windows CMD (Prompt de Comando)

```cmd
cd c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron
node ultron-continuo.js
```

### Versão com ENTER (Interativa)

**PowerShell:**
```powershell
cd "c:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron"
node ultron-ffmpeg-vosk.js
```

---

## 🎤 COMO USAR

### Modo Contínuo (ultron-continuo.js)
1. Digite o comando acima
2. Ultron aguarda (sem ENTER)
3. Fale qualquer comando
4. Ultron executa

### Modo Interativo (ultron-ffmpeg-vosk.js)
1. Digite o comando acima
2. Aperte ENTER uma vez
3. Fale seu comando (8 segundos)
4. Ultron transcreve e executa
5. Repita

---

## 📚 COMANDOS DISPONÍVEIS

### 🖥️ Abrir Aplicações

```
abra o chrome
abra o google chrome
abra o firefox
abra o edge
abra o notepad
abra o bloco de notas
abra a calculadora
abra o cmd
abra o terminal
abra o explorador
abra os arquivos
abra o word
abra o excel
abra o paint
abra o vlc
```

### ⏰ Informações do Sistema

```
qual é a hora
qual é a data
que horas são
status do sistema
listar arquivos
```

---

## 🔧 VARIAÇÕES DE LINGUAGEM NATURAL

O Ultron é inteligente com português. Essas variações funcionam:

| Comando | Variações Aceitas |
|---------|------------------|
| abra a calculadora | abra o calc, abra calculadora |
| abra o chrome | abre o chrome, abra o google |
| qual é a hora | que horas são, me diga a hora |
| bloco de notas | notepad, abra o notepad |

---

## 🎤 TESTE DE SOM

Verificar se seu microfone está sendo detectado:

```powershell
ffmpeg -list_devices true -f dshow -i dummy 2>&1 | Select-String "audio"
```

Gravar teste de 5 segundos:

```powershell
ffmpeg -f dshow -i "audio=Headset (E6S Hands-Free AG Audio)" -t 5 test.wav
```

---

## 📋 CONFIGURAÇÕES

### Mudar Microfone

Edite `ultron-continuo.js` na linha:

```javascript
const MICROFONE = "Seu Microfone Nome Aqui";
```

Obtenha o nome exato com:
```powershell
ffmpeg -list_devices true -f dshow -i dummy
```

### Adicionar Novo Comando

Edite `app/voice/executor_robusto.js`:

```javascript
"seu comando aqui": () => this.safeSpawn("programa.exe", [], "Descrição"),
```

---

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] FFmpeg instalado (`ffmpeg -version`)
- [ ] Node.js instalado (`node --version`)
- [ ] npm vosk instalado (`npm install vosk --legacy-peer-deps`)
- [ ] Modelo Vosk PT-BR baixado (`./vosk-model/` existe)
- [ ] Microfone detectado (`ffmpeg -list_devices...`)
- [ ] Ultron iniciado (`node ultron-continuo.js`)
- [ ] Comando executado com sucesso

---

## 🐛 ERROS COMUNS

### ❌ "Cannot find module 'vosk'"
```powershell
npm install vosk --legacy-peer-deps
```

### ❌ "Modelo Vosk não encontrado"
```powershell
node download-modelo-vosk.js
```

### ❌ "ffmpeg: command not found"
- Instale: `choco install ffmpeg -y`
- Ou adicione ao PATH manualmente

### ❌ "Nenhuma transcrição detectada"
- Fale mais alto
- Fale mais perto do microfone
- Verifique microfone: `ffmpeg -list_devices...`

### ❌ "Comando não reconhecido"
- Verifique se está no `executor_robusto.js`
- Tente variação (ex: "abra chrome" vs "abra o chrome")
- Veja logs: procure por `❌ Comando não reconhecido:`

---

## 🚀 PRÓXIMAS FEATURES

- [ ] Modo offline-only (sem internet)
- [ ] Mais comandos customizados
- [ ] Confirmação por voz
- [ ] Grammar PT-BR avançado
- [ ] Interface web de controle

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique os comandos acima
2. Veja a seção Troubleshooting
3. Confira se FFmpeg/Vosk estão instalados
4. Teste o microfone isoladamente

---

**Ultron v1.0 — Jan 2026**

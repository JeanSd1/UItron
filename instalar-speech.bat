@echo off
REM ========================================
REM ULTRON - INSTALAR SPEECH RECOGNITION
REM ========================================

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  🔧 INSTALAÇÃO DIRETA DO SPEECH RECOGNITION  ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Verificar se está como ADMIN
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERRO: Execute como ADMINISTRADOR!
    echo.
    pause
    exit /b 1
)

echo ✅ Rodando como ADMIN
echo.
echo ⏳ Removendo versão antiga (se houver)...
echo.

REM Remover
powershell -NoProfile -Command "Get-WindowsCapability -Online | Where-Object {$_.Name -like '*Speech*'} | Remove-WindowsCapability -Online -ErrorAction SilentlyContinue" >nul 2>&1

echo ✅ Removido
echo.
echo ⏳ INSTALANDO Speech Recognition...
echo    Isto vai levar 3-5 minutos. Aguarde!
echo.

REM Instalar
powershell -NoProfile -Command "Add-WindowsCapability -Online -Name 'Speech-TextToSpeech-pt-BR~0.0.1.0'" 

echo.
echo ✅ Instalação solicitada!
echo.
echo 🔄 Pressione qualquer tecla para reiniciar agora
echo.

pause

echo Reiniciando...
shutdown /r /t 5 /c "Speech Recognition instalado. Reiniciando para aplicar mudanças."

@echo off
REM ========================================
REM INSTALAR FFMPEG (necessário para Vosk)
REM ========================================

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  📥 BAIXANDO E INSTALANDO FFMPEG              ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Verificar se FFmpeg já está instalado
ffmpeg -version >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ FFmpeg já instalado!
    echo.
    echo Próximo passo:
    echo   node ultron-ffmpeg-vosk.js
    echo.
    pause
    exit /b 0
)

echo ⏳ Instalando FFmpeg...
echo.

REM Baixar e instalar via chocolatey (mais fácil)
choco install ffmpeg -y

if %errorLevel% equ 0 (
    echo.
    echo ✅ FFmpeg instalado com sucesso!
    echo.
    echo Agora execute:
    echo   node ultron-ffmpeg-vosk.js
    echo.
) else (
    echo.
    echo ❌ Erro na instalação
    echo.
    echo Tente manualmente:
    echo   1. Visite: https://www.gyan.dev/ffmpeg/builds/
    echo   2. Baixe: ffmpeg-release-full.zip
    echo   3. Extraia e adicione ao PATH
    echo.
)

pause

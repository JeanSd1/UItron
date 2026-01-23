"""
Script de diagnóstico - Verifica microfone, FFmpeg e Vosk
"""

import subprocess
import sys

print("🔍 DIAGNÓSTICO DO ULTRON\n")
print("=" * 50)

# 1. Verificar FFmpeg
print("\n1️⃣ Verificando FFmpeg...")
try:
    result = subprocess.run(["ffmpeg", "-version"], capture_output=True, timeout=5)
    if result.returncode == 0:
        print("✅ FFmpeg instalado e funcionando")
    else:
        print("❌ FFmpeg não responde corretamente")
except FileNotFoundError:
    print("❌ FFmpeg NÃO ENCONTRADO no PATH")
    print("   Solução: Instale FFmpeg via instalador .exe ou chocolatey")
except Exception as e:
    print(f"❌ Erro ao testar FFmpeg: {e}")

# 2. Verificar Python audio libs
print("\n2️⃣ Verificando bibliotecas de áudio...")
try:
    import pyaudio
    print("✅ pyaudio instalado")
except ImportError:
    print("⚠️  pyaudio não instalado (opcional, mas recomendado)")

try:
    import vosk
    print("✅ vosk instalado")
except ImportError:
    print("❌ vosk NÃO instalado")

# 3. Listar dispositivos de áudio (se pyaudio disponível)
print("\n3️⃣ Verificando dispositivos de áudio...")
try:
    import pyaudio
    p = pyaudio.PyAudio()
    print(f"Encontrados {p.get_device_count()} dispositivo(s) de áudio:\n")
    
    for i in range(p.get_device_count()):
        info = p.get_device_info_by_index(i)
        device_type = "🔊 Saída" if info['maxInputChannels'] == 0 else "🎙️ Entrada"
        print(f"  {i}: {device_type} - {info['name']}")
    
    p.terminate()
except Exception as e:
    print(f"⚠️  Erro ao listar dispositivos: {e}")

print("\n" + "=" * 50)
print("\n🔧 RECOMENDAÇÕES:")
print("  1. Se FFmpeg não encontrado: Instale de https://ffmpeg.org/download.html")
print("  2. Verifique se o microfone está conectado e ativado")
print("  3. Verifique volume do microfone no Windows")
print("  4. Teste com: python test_vosk_simples.py")
print("\n" + "=" * 50)

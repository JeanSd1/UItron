"""
Teste isolado do speaker - valida se o TTS está realmente funcionando
"""
import time
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "app" / "voice"))

from speaker import Speaker

print("=" * 50)
print("🔊 TESTE DE VOZ ISOLADO")
print("=" * 50)

s = Speaker()

print("\n📢 Frase 1...")
s.say("Teste de voz número um")
time.sleep(2)

print("📢 Frase 2...")
s.say("Se você está ouvindo isso, está funcionando")
time.sleep(3)

print("📢 Frase 3...")
s.say("O speaker está operacional")
time.sleep(3)

print("\n✅ Teste finalizado")
print("Se você OUVIU as 3 frases, o speaker está pronto!")

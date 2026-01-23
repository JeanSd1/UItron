"""
Teste isolado do listener - valida se o microfone está funcionando corretamente
"""
from app.voice.listener import Listener

print("=" * 50)
print("🎙️ TESTE DE LISTENER ISOLADO")
print("=" * 50)

listener = Listener()

print("\nDiga algo para testar...")
print()

while True:
    text = listener.listen_once()
    if text:
        print(f"✅ Texto reconhecido: {text}\n")
    else:
        print("(silêncio ou erro)\n")

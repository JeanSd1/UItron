#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
sys.path.insert(0, 'app/voice')

from listener import Listener

print("🎤 Testando Listener...\n")

listener = Listener()

print("🔊 Fale algo em português agora!\n")

for i in range(3):
    print(f"\n📝 Tentativa {i+1}:")
    texto = listener.listen_once()
    if texto:
        print(f"✅ Reconhecido: {texto}")
    else:
        print(f"❌ Não reconhecido")

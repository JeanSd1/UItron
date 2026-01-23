"""
Speaker com threading para Windows estável
TTS roda em background, nunca bloqueia a escuta
"""

import pyttsx3
import threading
import queue
import time


class Speaker:
    """Speaker profissional com TTS em thread separada"""
    
    def __init__(self):
        self.engine = pyttsx3.init()
        self.engine.setProperty("rate", 175)
        self.engine.setProperty("volume", 1.0)

        # Tentar voz PT-BR
        voices = self.engine.getProperty("voices")
        for voice in voices:
            if "brazil" in voice.name.lower() or "portuguese" in voice.name.lower():
                self.engine.setProperty("voice", voice.id)
                break

        # Fila e thread para TTS
        self.queue = queue.Queue()
        self.thread = threading.Thread(target=self._tts_loop, daemon=True)
        self.thread.start()

    def _tts_loop(self):
        """Loop em thread separada que processa fila de voz"""
        while True:
            try:
                text = self.queue.get(timeout=1)
                if text:
                    self.engine.say(text)
                    self.engine.runAndWait()
            except queue.Empty:
                continue
            except Exception as e:
                print(f"⚠️ Erro TTS: {e}")

    def say(self, text: str):
        """Enfileira texto para falar (não bloqueia)"""
        print(f"🔊 Ultron diz: {text}")
        self.queue.put(text)

    def wait_speaking(self):
        """Espera até terminar todas as falas"""
        self.queue.join()


# Instância global
_speaker = Speaker()


def speak(text: str):
    """Função simples para falar"""
    _speaker.say(text)


if __name__ == "__main__":
    speaker = Speaker()
    speaker.say("Olá. Eu sou o Ultron. Sistema online.")
    speaker.wait_speaking()

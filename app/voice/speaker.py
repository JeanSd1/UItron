"""
Speaker - Síncrono (sem thread) para garantir funcionamento
"""

import pyttsx3
import threading

_speaker_instance = None
_speaker_lock = threading.Lock()


class Speaker:
    def __init__(self):
        self.engine = pyttsx3.init("sapi5")
        self.engine.setProperty("rate", 170)
        self.engine.setProperty("volume", 1.0)

    def say(self, text: str):
        """Fala DIRETO, síncrono"""
        if text and text.strip():
            print(f"🔊 Ultron diz: {text}")
            try:
                self.engine.say(text)
                self.engine.runAndWait()
            except Exception as e:
                print(f"⚠️ Erro ao falar: {e}")

    def speak(self, text: str):
        """Alias para say()"""
        self.say(text)


def get_speaker():
    """Retorna a ÚNICA instância de Speaker do programa"""
    global _speaker_instance
    
    if _speaker_instance is None:
        with _speaker_lock:
            if _speaker_instance is None:
                _speaker_instance = Speaker()
    
    return _speaker_instance

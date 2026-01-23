"""
Speaker singleton com fila + threading + COM
UMA ÚNICA instância de TTS em todo o programa
"""

import pyttsx3
import threading
import queue
import time

# SINGLETON: Instância ÚNICA do Speaker
_speaker_instance = None
_speaker_lock = threading.Lock()


class Speaker:
    def __init__(self):
        self.engine = pyttsx3.init("sapi5")
        self.engine.setProperty("rate", 180)
        self.queue = queue.Queue()
        
        self.thread = threading.Thread(target=self._run)
        self.thread.daemon = True
        self.thread.start()

    def _run(self):
        import pythoncom
        pythoncom.CoInitialize()

        while True:
            text = self.queue.get()
            if text:
                self.engine.say(text)
                self.engine.runAndWait()
            time.sleep(0.1)

    def say(self, text: str):
        print(f"🔊 Ultron diz: {text}")
        self.queue.put(text)


def get_speaker():
    """Retorna a ÚNICA instância de Speaker do programa"""
    global _speaker_instance
    
    if _speaker_instance is None:
        with _speaker_lock:
            if _speaker_instance is None:
                _speaker_instance = Speaker()
    
    return _speaker_instance

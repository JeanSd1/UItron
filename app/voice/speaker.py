"""
Speaker com threading persistente para Windows
Thread NÃO daemon - garante que TTS sempre executa
Fila serializada - nenhuma frase é perdida
"""

import pyttsx3
import threading
import queue
import time


class Speaker:
    def __init__(self):
        self.engine = pyttsx3.init(driverName="sapi5")
        self.engine.setProperty("rate", 180)

        self.queue = queue.Queue()
        self.running = True

        # CRÍTICO: daemon=False garante que o thread vive
        self.thread = threading.Thread(target=self._run, daemon=False)
        self.thread.start()

    def _run(self):
        """Loop persistente que processa fila de voz"""
        while self.running:
            try:
                text = self.queue.get(timeout=0.1)
            except queue.Empty:
                continue

            if text:
                self.engine.say(text)
                self.engine.runAndWait()

    def say(self, text: str):
        """Enfileira texto para falar"""
        if text:
            print(f"🔊 Ultron diz: {text}")
            self.queue.put(text)

    def stop(self):
        """Para o thread de forma segura"""
        self.running = False
        time.sleep(0.2)


# Instância global
_speaker = Speaker()


def speak(text: str):
    """Função simples para falar"""
    _speaker.say(text)


if __name__ == "__main__":
    speaker = Speaker()
    speaker.say("Olá. Eu sou o Ultron. Sistema online.")
    time.sleep(2)
    speaker.stop()

"""
Speaker com fila + thread daemon
TTS sempre roda em background sem interferência
"""

import pyttsx3
import threading
import queue
import time


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


if __name__ == "__main__":
    speaker = Speaker()
    speaker.say("Teste um")
    time.sleep(1)
    speaker.say("Teste dois")
    time.sleep(1)

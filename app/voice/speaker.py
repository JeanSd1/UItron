"""
Speaker DEFINITIVO - Fila + Thread Dedicado
pyttsx3 roda UMA VEZ em thread seguro - nunca morre
"""

import pyttsx3
import threading
import queue
import time

class Speaker:
    """
    Speaker com fila dedicada - padrão profissional
    Soluciona bug clássico de pyttsx3 perdendo o engine
    """
    
    def __init__(self):
        self.queue = queue.Queue()
        self.lock = threading.Lock()
        self.running = True
        
        # Thread dedicada para TTS
        self.thread = threading.Thread(target=self._speaker_loop, daemon=True)
        self.thread.start()

    def _speaker_loop(self):
        """Thread dedicada que nunca para de falar"""
        try:
            engine = pyttsx3.init("sapi5")
            engine.setProperty("rate", 170)
            engine.setProperty("volume", 1.0)
            
            while self.running:
                try:
                    # Espera por texto na fila
                    text = self.queue.get(timeout=1)
                    
                    if text is None:
                        break
                    
                    # Executa com lock
                    with self.lock:
                        engine.say(text)
                        engine.runAndWait()
                    
                    time.sleep(0.1)
                    
                except queue.Empty:
                    continue
                except Exception as e:
                    print(f"❌ Erro TTS: {e}")
                    time.sleep(0.5)
        except Exception as e:
            print(f"❌ Erro ao iniciar engine: {e}")

    def say(self, text: str):
        """Adiciona texto na fila para ser falado"""
        if text and text.strip():
            self.queue.put(text)


# Singleton
_speaker_instance = None
_speaker_lock = threading.Lock()


def get_speaker():
    """Retorna a ÚNICA instância de Speaker"""
    global _speaker_instance
    
    if _speaker_instance is None:
        with _speaker_lock:
            if _speaker_instance is None:
                _speaker_instance = Speaker()
    
    return _speaker_instance

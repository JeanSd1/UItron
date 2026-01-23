"""
Listener profissional para Windows - VERSÃO FINAL ESTÁVEL
Força PyAudio explícito, evita stream zumbi, Windows-safe
"""

import speech_recognition as sr
import pyaudio
import time


class Listener:
    """
    Listener robusto para Windows com PyAudio explícito
    - Detecção automática de microfone funcional
    - Stream criado uma vez
    - Sem reuse de contexto
    """

    def __init__(self, model_path: str = None):
        """Inicializa listener (model_path ignorado para compatibilidade)"""
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        
        self.microphone = None
        self._init_microphone()

    def _init_microphone(self):
        """Detecta e inicializa microfone válido explicitamente"""
        print("🎙️ Inicializando microfone com PyAudio...")
        
        p = pyaudio.PyAudio()
        
        # Encontrar microfone padrão válido
        device_index = None
        for i in range(p.get_device_count()):
            info = p.get_device_info_by_index(i)
            if info["maxInputChannels"] > 0:
                device_index = i
                break
        
        p.terminate()
        
        if device_index is None:
            raise RuntimeError("❌ Nenhum microfone válido encontrado")
        
        self.microphone = sr.Microphone(device_index=device_index)
        print("   ✓ Microfone detectado")
        
        # Calibração única
        with self.microphone as source:
            print("🔊 Calibrando...", end=" ", flush=True)
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            print("✅")

    def listen_once(self):
        """Escuta uma vez e retorna o texto"""
        try:
            with self.microphone as source:
                print("🎤 Escutando...", end=" ", flush=True)
                audio = self.recognizer.listen(source, timeout=None)
            
            print("🧠", end=" ", flush=True)
            text = self.recognizer.recognize_google(audio, language="pt-BR")
            print()
            return text.strip()
        
        except sr.UnknownValueError:
            print("❌ Não entendi")
            return None
        except sr.RequestError:
            print("⚠️ API erro")
            time.sleep(0.5)
            return None
        except Exception as e:
            if "Stream closed" in str(e) or "-9988" in str(e):
                return None
            print(f"⚠️ {str(e)[:30]}")
            time.sleep(0.5)
            return None

    def listen(self):
        """Escuta continuamente (generator)"""
        print('🎙️ Ultron escutando continuamente...')
        print("   Fale algo em português...\n")
        
        try:
            while True:
                texto = self.listen_once()
                if texto:
                    yield texto
        except KeyboardInterrupt:
            print("\n\n👋 Encerrado")


if __name__ == '__main__':
    listener = Listener()
    for phrase in listener.listen():
        print(f'📝 Você disse: "{phrase}"')

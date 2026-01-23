import speech_recognition as sr
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)


class Listener:
    """
    Listener estável para Windows com PyAudio + SpeechRecognition
    - SEM sounddevice bugado
    - SEM numpy complications
    - SEM callbacks async
    - Simples, robusto, profissional
    """

    def __init__(self, model_path: str = None):
        """
        Inicializa o listener.
        
        Args:
            model_path: Ignorado (mantém compatibilidade com ultron_main.py)
        """
        self.recognizer = sr.Recognizer()
        
        # Configuração ideal para português
        self.recognizer.energy_threshold = 300
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 1.0
        self.recognizer.operation_timeout = 10
        
        # Usar microfone padrão (PyAudio)
        self.microphone = sr.Microphone()
        
        print("🎙️ Inicializando microfone com PyAudio...")
        print("   ✓ Microfone detectado")

    def _ajustar_ruido(self):
        """Calibra para ruído ambiente - melhora reconhecimento"""
        try:
            with self.microphone as source:
                print("🔊 Calibrando microfone...", end=" ", flush=True)
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                print("✅ Concluído")
        except Exception as e:
            print(f"⚠️  Erro: {e}")

    def listen(self):
        """
        Escuta continuamente e retorna frases reconhecidas.
        
        Yields:
            Texto reconhecido em português
        """
        self._ajustar_ruido()
        
        print('🎙️ Ultron escutando continuamente...')
        print("   Fale algo em português...\n")
        
        while True:
            try:
                with self.microphone as source:
                    print("🎤 Escutando...", end=" ", flush=True)
                    
                    # Escutar com timeout de 5 segundos
                    audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=5)
                
                print("🧠 Processando...", end=" ", flush=True)
                
                try:
                    # Reconhecer em português
                    text = self.recognizer.recognize_google(
                        audio,
                        language='pt-BR'
                    )
                    
                    print()  # Nova linha
                    if text and text.strip():
                        yield text.strip()
                
                except sr.UnknownValueError:
                    print("❌ Não entendi")
                except sr.RequestError as e:
                    print(f"⚠️  API erro")

            except sr.RequestError:
                print("❌ Timeout")
            except KeyboardInterrupt:
                print("\n\n👋 Microfone desligado")
                break
            except Exception as e:
                print(f"⚠️  Erro: {str(e)[:50]}")


if __name__ == '__main__':
    listener = Listener()
    for phrase in listener.listen():
        print(f'📝 Você disse: "{phrase}"')

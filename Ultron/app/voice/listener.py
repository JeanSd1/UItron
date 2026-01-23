import speech_recognition as sr
import sys
import sounddevice as sd
import numpy as np
import wave
import io
import warnings
import logging
import os
from contextlib import contextmanager

# Suprimir warnings
warnings.filterwarnings('ignore')
logging.getLogger('sounddevice').setLevel(logging.CRITICAL)

@contextmanager
def suppress_stderr():
    """Suprime stderr completamente durante execução"""
    try:
        # Windows
        devnull = os.open(os.devnull, os.O_WRONLY)
    except:
        # Linux/Mac
        devnull = os.open('/dev/null', os.O_WRONLY)
    
    old_stderr = os.dup(2)
    try:
        os.dup2(devnull, 2)
        yield
    finally:
        os.dup2(old_stderr, 2)
        os.close(devnull)
        os.close(old_stderr)


class Listener:
    """
    Escuta áudio do microfone e converte em texto (PT-BR)
    Usa Google Speech Recognition API
    Compatível com Windows (sem PyAudio)
    """

    def __init__(self, model_path: str = None):
        """model_path é ignorado - mantém compatibilidade"""
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 4000
        self.sample_rate = 16000
        
        print("🎙️ Inicializando microfone...")
        self._configurar_dispositivo_audio()

    def _configurar_dispositivo_audio(self):
        """Configura o dispositivo de áudio com fallback automático"""
        try:
            devices = sd.query_devices()
            print(f"   Dispositivos encontrados: {len(devices)}")
            
            # Encontrar dispositivo de entrada padrão
            for i, device in enumerate(devices):
                if device['max_input_channels'] > 0:
                    print(f"   ✓ Usando: {device['name']}")
                    self.device_id = i
                    return
            
            print("   ⚠️  Nenhum dispositivo de áudio encontrado!")
            self.device_id = None
            
        except Exception as e:
            print(f"   ⚠️  Erro ao detectar dispositivos: {e}")
            self.device_id = None

    def _capture_audio(self):
        """Captura áudio do microfone usando sounddevice com melhor detecção"""
        try:
            print("🎤 Escutando...", end=" ", flush=True)
            
            # Gravar até 5 segundos de áudio
            duration = 5
            
            # Suprimir stderr durante captura
            with suppress_stderr():
                try:
                    audio_data = sd.rec(
                        int(self.sample_rate * duration),
                        samplerate=self.sample_rate,
                        channels=1,
                        dtype='float32',
                        device=self.device_id,
                        blocksize=self.sample_rate // 4
                    )
                    sd.wait()
                except:
                    # Fallback
                    audio_data = sd.rec(
                        int(self.sample_rate * duration),
                        samplerate=self.sample_rate,
                        channels=1,
                        dtype='float32',
                        blocksize=self.sample_rate // 4
                    )
                    sd.wait()
            
            # Normalizar áudio com clipping seguro
            audio_data = np.clip(audio_data, -1.0, 1.0)
            
            # Converter para int16 com segurança
            audio_int16 = np.int16(audio_data.flatten() * 32767)
            
            # Criar objeto AudioData (channels=2 é para 2 bytes por sample)
            audio_bytes = audio_int16.tobytes()
            audio = sr.AudioData(audio_bytes, self.sample_rate, 2)
            
            return audio
            
        except Exception as e:
            print(f"\n⚠️  Erro ao capturar áudio: {str(e)[:50]}")
            return None

    def listen(self):
        """
        Escuta continuamente e retorna frases reconhecidas
        Usa Google Speech Recognition
        """
        print('🎙️ Ultron escutando continuamente...')
        print("   Fale algo em português...\n")
        
        while True:
            try:
                # Capturar áudio
                audio = self._capture_audio()
                if audio is None:
                    continue

                # Reconhecer português
                print("🧠 Processando...", end=" ", flush=True)
                try:
                    text = self.recognizer.recognize_google(
                        audio,
                        language='pt-BR'
                    )
                    
                    print()  # Nova linha
                    if text and text.strip():
                        yield text.strip()
                
                except sr.UnknownValueError:
                    print("❌ Não consegui entender")
                except sr.RequestError as e:
                    print(f"⚠️  Erro Google API")

            except KeyboardInterrupt:
                print("\n\n👋 Microfone desligado")
                break
            except Exception as e:
                print(f"⚠️  Erro: {str(e)[:50]}")


if __name__ == '__main__':
    listener = Listener()
    for phrase in listener.listen():
        print(f'📝 Você disse: "{phrase}"')

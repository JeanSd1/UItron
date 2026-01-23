import pyttsx3

class Speaker:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.engine.setProperty("rate", 175)   # velocidade
        self.engine.setProperty("volume", 1.0) # volume

        # tentar pegar uma voz PT-BR
        voices = self.engine.getProperty("voices")
        for voice in voices:
            if "brazil" in voice.name.lower() or "portuguese" in voice.name.lower():
                self.engine.setProperty("voice", voice.id)
                break

    def say(self, text: str):
        print(f"🔊 Ultron diz: {text}")
        self.engine.say(text)
        self.engine.runAndWait()


if __name__ == "__main__":
    speaker = Speaker()
    speaker.say("Olá. Eu sou o Ultron. Sistema online.")

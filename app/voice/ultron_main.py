"""
ULTRON - Assistente de Voz por Linha de Comando
Orquestrador principal que integra todos os módulos

Arquitetura:
🎙️ listener (ouve)
   ↓
📝 texto
   ↓
🧠 ollama_client (pensa)
   ↓
📋 JSON (ação estruturada)
   ↓
⚙️ executor (age)
   ↓
🔊 speaker (fala)
"""

import json
import sys
import time
from pathlib import Path
from datetime import datetime

# Adicionar diretório ao path para imports
sys.path.insert(0, str(Path(__file__).parent))

from listener import Listener
from executor import Executor
from speaker import Speaker
from ollama_client import OllamaClient


class Ultron:
    """
    Orquestrador principal do Ultron
    Integra todos os módulos em um pipeline coerente
    """

    def __init__(self, model_path: str = "vosk-model"):
        print("🤖 Inicializando Ultron...")
        print("=" * 50)

        self.listener = Listener(model_path)
        self.executor = Executor()
        self.speaker = Speaker()
        self.ollama = OllamaClient()

        # Teste inicial de voz
        self.speaker.say("Olá. Eu sou o Ultron. Pronto para obedecer.")
        time.sleep(0.5)

        print("✅ Ultron inicializado com sucesso!")
        print("=" * 50)

    def processar_comando(self, texto: str) -> bool:
        """
        Pipeline completo:
        1. Receber texto
        2. Detectar se é pergunta ou comando
        3. Se pergunta → responder com IA
        4. Se comando → executar ação
        """
        print(f"\n📝 Você disse: \"{texto}\"")

        # Detectar se é pergunta
        eh_pergunta = "?" in texto or any(p in texto.lower() for p in 
                      ["quem é", "o que é", "qual é", "quando", "onde", "como", "por que", "me diga", "me explique"])

        if eh_pergunta:
            # Responder com IA
            print("🧠 Analisando pergunta...")
            resposta = self.ollama.ask(texto, system_prompt="Você é o Ultron, um assistente inteligente em português. Responda brevemente e de forma útil.")
            
            if resposta:
                print(f"💬 Resposta: {resposta}")
                self.speaker.say(resposta)
                time.sleep(0.3)
                return True
            else:
                # Fallback: responder com template simples
                resposta_fallback = self._responder_pergunta_simples(texto)
                if resposta_fallback:
                    print(f"💬 Resposta: {resposta_fallback}")
                    return True
                else:
                    self.speaker.say("Desculpe, não consegui responder essa pergunta.")
                    time.sleep(0.3)
                    return False
        else:
            # Processar como comando
            print("🧠 Analisando comando...")
            acao = self.ollama.ask_action(texto)

            if not acao:
                # Fallback: Tentar reconhecimento simples sem Ollama
                acao = self._fallback_simples(texto)
                if not acao:
                    self.speaker.say("Desculpe, não consegui entender o comando.")
                    time.sleep(0.3)
                    return False

            # Se foi resposta simples (fallback), já foi respondido acima
            if acao.get("acao") == "responder":
                return True

            print(f"📋 Ação interpretada:")
            print(json.dumps(acao, indent=2, ensure_ascii=False))

            # 2. Executar ação
            confianca = acao.get("confianca", 0)
            print(f"\n⚙️  Executando com confiança de {confianca}%...")

            if confianca >= 70:  # Só executa se confiante
                sucesso = self.executor.execute(acao)

                if sucesso:
                    # 3. Responder com sucesso
                    resposta = self._gerar_resposta_sucesso(acao)
                    self.speaker.say(resposta)
                    time.sleep(0.3)
                    return True
                else:
                    self.speaker.say("Não consegui executar essa ação.")
                    time.sleep(0.3)
                    return False
            else:
                self.speaker.say("Não entendi bem o comando. Pode repetir?")
                time.sleep(0.3)
                return False

    def _responder_pergunta_simples(self, texto: str) -> str:
        """Respostas simples para perguntas comuns"""
        texto_lower = texto.lower()

        # Hora
        if any(p in texto_lower for p in ["que hora", "horas agora", "qual hora", "me diga a hora"]):
            hora_atual = datetime.now().strftime("%H:%M")
            resposta = f"Agora são {hora_atual}"
            self.speaker.say(resposta)
            time.sleep(0.3)
            return resposta

        # Data
        if any(p in texto_lower for p in ["que dia", "qual data", "qual é a data", "data de hoje"]):
            data_atual = datetime.now().strftime("%d de %B de %Y")
            resposta = f"Hoje é {data_atual}"
            self.speaker.say(resposta)
            time.sleep(0.3)
            return resposta

        # Quem é você
        if "quem é você" in texto_lower or "quem é o ultron" in texto_lower:
            resposta = "Sou o Ultron, um assistente de voz inteligente. Posso abrir programas, pesquisar na internet, responder perguntas e executar comandos no Windows."
            self.speaker.say(resposta)
            time.sleep(0.3)
            return resposta

        # Como você funciona
        if "como você funciona" in texto_lower or "como funciona" in texto_lower:
            resposta = "Funciono através de reconhecimento de voz. Você fala, eu entendo, analiso e respondo ou executo a ação."
            self.speaker.say(resposta)
            time.sleep(0.3)
            return resposta

        return None

    def _fallback_simples(self, texto: str) -> dict:
        """
        Fallback simples quando Ollama não está disponível
        Usa regex para reconhecer comandos básicos
        """
        texto_lower = texto.lower()

        # Perguntas sobre hora
        if any(p in texto_lower for p in ["que hora", "horas agora", "qual hora", "me diga a hora"]):
            hora_atual = datetime.now().strftime("%H:%M")
            self.speaker.say(f"Agora são {hora_atual}")
            return {"acao": "responder", "confianca": 95}

        # Abrir programa
        programas = {
            "chrome": "google chrome",
            "navegador": "google chrome",
            "firefox": "firefox",
            "edge": "edge",
            "code": "vs code",
            "vscode": "vs code",
            "notepad": "notepad",
            "word": "word",
            "excel": "excel",
        }

        for palavra, programa in programas.items():
            if f"abra" in texto_lower and palavra in texto_lower:
                return {
                    "acao": "abrir_programa",
                    "programa": programa,
                    "confianca": 80
                }

        # Pesquisar
        if "pesquise" in texto_lower or "busque" in texto_lower:
            termo = texto.replace("Pesquise", "").replace("pesquise", "").replace("Busque", "").replace("busque", "").strip()
            if termo:
                return {
                    "acao": "pesquisar",
                    "termo": termo,
                    "confianca": 75
                }

        return None

    def _gerar_resposta_sucesso(self, acao: dict) -> str:
        """Gera uma resposta apropriada para a ação executada"""
        acao_tipo = acao.get("acao")

        respostas = {
            "abrir_programa": f"Abrindo {acao.get('programa', 'programa')}",
            "pesquisar": f"Pesquisando por {acao.get('termo', 'isso')}",
            "digitar": f"Digitei o texto",
            "pressionar_tecla": f"Pressionei a tecla {acao.get('tecla', 'especificada')}",
        }

        return respostas.get(acao_tipo, "Ação executada com sucesso")

    def rodar(self):
        """
        Loop principal do Ultron
        Escuta continuamente e processa comandos
        """
        print("\n" + "=" * 50)
        self.speaker.say("Olá. Eu sou o Ultron. Pronto para obedecer.")
        print("=" * 50)
        print("\n💡 DICA: Fale naturalmente. Exemplos:")
        print("  - 'Abra o Google Chrome'")
        print("  - 'Pesquise girafa'")
        print("  - 'Abra o VS Code'")
        print("\nPara parar, pressione Ctrl+C\n")
        print("=" * 50)
        print("🎙️ Escutando...\n")

        try:
            for texto in self.listener.listen():
                try:
                    self.processar_comando(texto)
                except KeyboardInterrupt:
                    break
                except Exception as e:
                    print(f"❌ Erro ao processar: {e}")
                    self.speaker.say("Ocorreu um erro. Repita o comando.")
                    time.sleep(0.3)

        except KeyboardInterrupt:
            print("\n\n" + "=" * 50)
            self.speaker.say("Até logo!")
            time.sleep(0.3)
            print("👋 Ultron desligado")
            print("=" * 50)


if __name__ == "__main__":
    try:
        ultron = Ultron(model_path="vosk-model")
        ultron.rodar()
    except KeyboardInterrupt:
        print("\n\n👋 Ultron desligado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro crítico: {e}")
        sys.exit(1)

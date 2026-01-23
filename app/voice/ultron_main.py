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
from speaker import Speaker, get_speaker
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
        self.speaker = get_speaker()  # SINGLETON: sempre a mesma instância
        self.ollama = OllamaClient()

        # Teste inicial de voz
        self.speaker.say("Olá. Eu sou o Ultron. Pronto para obedecer.")
        time.sleep(3)

        print("✅ Ultron inicializado com sucesso!")
        print("=" * 50)

    def falar(self, texto: str):
        """ÚNICA forma de responder com áudio - COM PAUSA DE MICROFONE"""
        if not texto:
            return
        
        # 🔴 PAUSA O MICROFONE (libera para TTS usar áudio)
        self.listener.pause()
        
        try:
            self.speaker.say(texto)  # Speaker printa e trata fila
            time.sleep(0.5)
        finally:
            # 🟢 SEMPRE retoma o microfone (mesmo se erro)
            self.listener.resume()

    def _eh_pergunta(self, texto: str) -> bool:
        """
        Detecta CORRETAMENTE se é pergunta
        Pergunta = começa com questionador
        Comando = começa com verbo (abra, pesquise, etc)
        """
        if not texto or not isinstance(texto, str):
            return False
        
        texto_lower = texto.lower().strip()
        
        if not texto_lower:
            return False
        
        # PERGUNTAS: sempre começam com estas palavras
        perguntas = [
            "quem", "o que", "qual", "quando", "onde", "como", 
            "por que", "porque", "me diga", "me explique", "que horas",
            "que dia", "qual hora", "qual data"
        ]
        
        for p in perguntas:
            if texto_lower.startswith(p):
                return True
        
        # ALSO pergunta if tem ? no final
        if "?" in texto:
            return True
        
        return False

    def processar_comando(self, texto: str) -> bool:
        """
        Pipeline completo CORRETO:
        1. Receber texto
        2. SE é pergunta → responder com IA (NUNCA toca em comando)
        3. SE é comando → executar SOMENTE ação
        """
        print(f"\n📝 Você disse: \"{texto}\"")

        if self._eh_pergunta(texto):
            # ===== PERGUNTA: RESPONDER COM IA =====
            print("🧠 Analisando pergunta...")
            
            # 🔥 PATCH DE TESTE: Respostas hardcoded para testar se SPEAKER FUNCIONA
            teste_respostas = {
                "quem descobriu o brasil": "Pedro Álvares Cabral descobriu o Brasil em 1500.",
                "que hora": "Agora são 16 horas e 30 minutos.",
                "qual é a hora": "Agora são 16 horas e 30 minutos.",
                "quem é você": "Sou o Ultron, um assistente de voz inteligente.",
            }
            
            texto_lower = texto.lower()
            for chave, resp_teste in teste_respostas.items():
                if chave in texto_lower:
                    print(f"🧪 TESTE: Respondendo com: {resp_teste}")
                    self.falar(resp_teste)
                    return True
            
            # Se não bateu no teste, tenta Ollama com ask_question (não ask_action)
            resposta = self.ollama.ask_question(texto)
            
            if resposta:
                self.falar(resposta)
                return True
            else:
                # Fallback: responder com template simples
                resposta_fallback = self._responder_pergunta_simples(texto)
                if resposta_fallback:
                    # IMPORTANTE: _responder_pergunta_simples JÁ FALA
                    return True
                else:
                    self.falar("Desculpe, não consegui responder essa pergunta.")
                    return False
        
        else:
            # ===== COMANDO: EXECUTAR AÇÃO =====
            print("🧠 Analisando comando...")
            acao = self.ollama.ask_action(texto)

            if not acao:
                # Fallback: Tentar reconhecimento simples sem Ollama
                acao = self._fallback_simples(texto)
                if not acao:
                    self.falar("Desculpe, não consegui entender o comando.")
                    return False

            print(f"📋 Ação interpretada:")
            print(json.dumps(acao, indent=2, ensure_ascii=False))

            # Executar ação
            confianca = acao.get("confianca", 0)
            print(f"\n⚙️  Executando com confiança de {confianca}%...")

            if confianca >= 70:  # Só executa se confiante
                sucesso = self.executor.execute(acao)

                if sucesso:
                    # Responder com sucesso
                    resposta = self._gerar_resposta_sucesso(acao)
                    self.falar(resposta)
                    return True
                else:
                    self.falar("Não consegui executar essa ação.")
                    return False
            else:
                self.falar("Não entendi bem o comando. Pode repetir?")
                return False

    def _responder_pergunta_simples(self, texto: str) -> str:
        """Respostas simples para perguntas comuns - GARANTE QUE FALA"""
        texto_lower = texto.lower()

        # Hora
        if any(p in texto_lower for p in ["que hora", "horas agora", "qual hora", "me diga a hora"]):
            hora_atual = datetime.now().strftime("%H:%M")
            resposta = f"Agora são {hora_atual}"
            self.falar(resposta)  # ✅ FALA AQUI
            return resposta

        # Data
        if any(p in texto_lower for p in ["que dia", "qual data", "qual é a data", "data de hoje"]):
            data_atual = datetime.now().strftime("%d de %B de %Y")
            resposta = f"Hoje é {data_atual}"
            self.falar(resposta)  # ✅ FALA AQUI
            return resposta

        # Quem é você
        if "quem é você" in texto_lower or "quem é o ultron" in texto_lower:
            resposta = "Sou o Ultron, um assistente de voz inteligente. Posso abrir programas, pesquisar na internet, responder perguntas e executar comandos no Windows."
            self.falar(resposta)  # ✅ FALA AQUI
            return resposta

        # Como você funciona
        if "como você funciona" in texto_lower or "como funciona" in texto_lower:
            resposta = "Funciono através de reconhecimento de voz. Você fala, eu entendo, analiso e respondo ou executo a ação."
            self.falar(resposta)  # ✅ FALA AQUI
            return resposta

        return None

    def _fallback_simples(self, texto: str) -> dict:
        """
        Fallback CIRÚRGICO: SOMENTE para comandos reconhecidos
        NÃO toca em perguntas
        """
        texto_lower = texto.lower()

        # ✅ SOMENTE abrir programa
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
            "calculadora": "calc",
            "calc": "calc",
        }

        # APENAS se começar com "abra" ou "abrir"
        if texto_lower.startswith(("abra", "abrir", "open")):
            for palavra, programa in programas.items():
                if palavra in texto_lower:
                    return {
                        "acao": "abrir_programa",
                        "programa": programa,
                        "confianca": 80
                    }

        # ✅ SOMENTE pesquisar se explicitamente pedido
        if texto_lower.startswith(("pesquise", "busque", "pesquisa", "busca")):
            termo = texto.replace("Pesquise", "").replace("pesquise", "") \
                        .replace("Busque", "").replace("busque", "") \
                        .replace("Pesquisa", "").replace("pesquisa", "") \
                        .replace("Busca", "").replace("busca", "").strip()
            if termo:
                return {
                    "acao": "pesquisar",
                    "termo": termo,
                    "confianca": 75
                }

        # Qualquer outra coisa: retorna None (não toca)
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
        self.falar("Olá. Eu sou o Ultron. Pronto para obedecer.")
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
                    # 🔴 VALIDAÇÃO OBRIGATÓRIA: Se vazio ou None, pula
                    if not texto or not isinstance(texto, str):
                        continue
                    
                    if texto.strip() == "":
                        continue
                    
                    # 🟢 SÓ AQUI processa (garantido: texto é string válido)
                    self.processar_comando(texto)
                    
                except KeyboardInterrupt:
                    break
                except Exception as e:
                    print(f"❌ Erro ao processar: {e}")
                    self.falar("Ocorreu um erro. Repita o comando.")


        except KeyboardInterrupt:
            print("\n\n" + "=" * 50)
            self.falar("Até logo!")
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

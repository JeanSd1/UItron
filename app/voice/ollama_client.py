import requests
import json
from typing import Dict, Any, Optional


class OllamaClient:
    """
    Cliente para comunicação com Ollama
    Responsabilidade única: conversar com o LLM
    """

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "qwen2.5:7b-instruct"):
        self.base_url = base_url
        self.model = model
        self.api_endpoint = f"{base_url}/api/generate"

    def ask(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Envia um prompt para o Ollama e recebe resposta
        Retorna a resposta do modelo ou None se erro
        """
        try:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"

            payload = {
                "model": self.model,
                "prompt": full_prompt,
                "stream": False
            }

            response = requests.post(self.api_endpoint, json=payload, timeout=30)
            response.raise_for_status()

            data = response.json()
            return data.get("response", "").strip()

        except requests.exceptions.ConnectionError:
            # Silencioso - deixar o fallback handle
            return None
        except Exception as e:
            # Silencioso - deixar o fallback handle
            return None

    def ask_question(self, pergunta: str) -> Optional[str]:
        """
        Responde perguntas de conhecimento de forma direta e clara
        DIFERENTE de ask_action - não tenta interpretar como comando
        """
        system_prompt = (
            "Você é um assistente que responde perguntas de forma direta, clara e curta. "
            "Não execute ações. Não sugira abrir navegador. "
            "Apenas responda a pergunta em português."
        )
        return self.ask(pergunta, system_prompt)

    def ask_json(self, comando: str, system_prompt: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Pede ao modelo para responder em JSON
        Retorna o JSON parseado ou None se falha
        """
        if not system_prompt:
            system_prompt = """Você é um assistente inteligente que responde APENAS em JSON válido.
Analise o comando do usuário e responda com um JSON estruturado conforme solicitado.
Nunca escreva nada fora do JSON.
Responda UMA ÚNICA VEZ, sem repetição."""

        resposta = self.ask(comando, system_prompt)

        if not resposta:
            return None

        try:
            # Tentar extrair JSON da resposta
            import re
            json_match = re.search(r'\{.*\}', resposta, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            else:
                print(f"⚠️  Nenhum JSON encontrado na resposta: {resposta}")
                return None
        except json.JSONDecodeError as e:
            print(f"❌ Erro ao parsear JSON: {e}")
            return None

    def ask_action(self, texto_usuario: str) -> Optional[Dict[str, Any]]:
        """
        Interpreta o comando do usuário e retorna uma ação estruturada em JSON
        """
        system_prompt = """Você é um assistente que controla um computador.
Analise o comando do usuário e responda com um JSON no seguinte formato:
{
  "acao": "abrir_programa|pesquisar|digitar|pressionar_tecla",
  "programa": "nome do programa (opcional)",
  "termo": "termo de pesquisa (opcional)",
  "texto": "texto a digitar (opcional)",
  "tecla": "nome da tecla (opcional)",
  "confianca": número entre 0 e 100
}

Responda SOMENTE com o JSON, nada mais."""

        comando = f"Comando do usuário: \"{texto_usuario}\"\n\nResponda em JSON:"
        return self.ask_json(comando, system_prompt)


if __name__ == "__main__":
    client = OllamaClient()
    print("🧠 Cliente Ollama pronto para comunicação")

    # Teste simples
    print("\n📝 Teste 1: Pergunta simples")
    resposta = client.ask("Qual é a capital do Brasil?")
    print(f"Resposta: {resposta}\n")

    # Teste JSON
    print("📝 Teste 2: Interpretando ação")
    acao = client.ask_action("abra o google chrome e pesquise girafa")
    print(f"Ação interpretada: {json.dumps(acao, indent=2, ensure_ascii=False)}")

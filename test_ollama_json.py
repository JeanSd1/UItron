import requests
import json

url = "http://localhost:11434/api/generate"

payload = {
    "model": "qwen2.5:7b-instruct",
    "prompt": """Você é um assistente que responde APENAS em JSON, sem nenhum texto adicional.
Comando do usuário: "abra o google chrome e pesquise girafa"

Responda no formato JSON abaixo, preenchendo os campos conforme o comando:
{
  "acao": "string (o que fazer: abrir_programa, pesquisar, clicar, digitar, etc)",
  "programa": "string (qual programa abrir, se aplicável)",
  "pesquisa": "string (o que pesquisar, se aplicável)",
  "confianca": "número de 0 a 100 (quão confiante você está na interpretação)"
}

Responda SOMENTE com o JSON, nada mais.""",
    "stream": False
}

response = requests.post(url, json=payload)

data = response.json()
resposta_bruta = data["response"]

print("\nRESPOSTA BRUTA DO MODELO:\n")
print(resposta_bruta)

print("\n" + "="*50)
print("TENTANDO PARSEAR COMO JSON:")
print("="*50 + "\n")

try:
    # Tenta extrair JSON da resposta
    import re
    json_match = re.search(r'\{.*\}', resposta_bruta, re.DOTALL)
    if json_match:
        json_str = json_match.group(0)
        json_obj = json.loads(json_str)
        print("✔ JSON VÁLIDO:\n")
        print(json.dumps(json_obj, indent=2, ensure_ascii=False))
    else:
        print("❌ Nenhum JSON encontrado na resposta")
except json.JSONDecodeError as e:
    print(f"❌ Erro ao parsear JSON: {e}")

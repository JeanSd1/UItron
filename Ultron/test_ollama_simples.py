import requests
import json

print("🧪 Teste simples de conexão com Ollama\n")

try:
    url = "http://localhost:11434/api/generate"
    
    payload = {
        "model": "qwen2.5:7b-instruct",
        "prompt": "Qual é a capital do Brasil?",
        "stream": False
    }
    
    print("Enviando requisição para Ollama...")
    response = requests.post(url, json=payload, timeout=60)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Ollama respondeu!")
        print(f"\nResposta: {data['response']}")
    else:
        print(f"❌ Erro HTTP {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ Não consegui conectar ao Ollama em localhost:11434")
    print("Verifique se Ollama está rodando")
except requests.exceptions.Timeout:
    print("⏱️ Timeout! Ollama demorou muito para responder")
    print("Tente novamente em alguns segundos")
except Exception as e:
    print(f"❌ Erro: {e}")

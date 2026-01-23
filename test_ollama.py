import requests
import json

url = "http://localhost:11434/api/generate"

payload = {
    "model": "qwen2.5:7b-instruct",
    "prompt": "abra o google chrome e pesquise girafa",
    "stream": False
}

response = requests.post(url, json=payload)

data = response.json()
print("\nRESPOSTA DO MODELO:\n")
print(data["response"])

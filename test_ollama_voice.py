#!/usr/bin/env python
# -*- coding: utf-8 -*-

from app.voice.ollama_client import OllamaClient
import socket

def check_ollama_running():
    """Verifica se Ollama está rodando na porta 11434"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', 11434))
        sock.close()
        return result == 0
    except:
        return False

def test_ollama():
    print("🧪 Testando Cliente Ollama\n")
    
    # Verificar se está rodando
    if check_ollama_running():
        print("✅ Ollama está rodando na porta 11434\n")
    else:
        print("❌ Ollama NÃO está rodando na porta 11434")
        print("   Para iniciar, execute: ollama serve\n")
        return
    
    client = OllamaClient()
    
    # Teste 1: Pergunta simples
    print("📝 Teste 1: Pergunta simples")
    resposta = client.ask("Qual é a sua função?")
    print(f"Pergunta: 'Qual é a sua função?'")
    print(f"Resposta: {resposta}\n")
    
    # Teste 2: Ação interpretada
    print("📝 Teste 2: Interpretando ação")
    acao = client.ask_action("Abre o Chrome e busca por Python")
    print(f"Comando: 'Abre o Chrome e busca por Python'")
    print(f"Ação: {acao}\n")
    
    # Teste 3: JSON estruturado
    print("📝 Teste 3: Resposta JSON")
    json_resp = client.ask_json("Liste 3 cores em JSON como {'cores': ['...']}")
    print(f"Comando: 'Liste 3 cores em JSON'")
    print(f"JSON: {json_resp}\n")

if __name__ == "__main__":
    test_ollama()

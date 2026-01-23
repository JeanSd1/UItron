#!/usr/bin/env python
# -*- coding: utf-8 -*-

from app.voice.ollama_client import OllamaClient

print("🧪 Testando Ollama com DEBUG\n")

client = OllamaClient()

# Teste 1: Pergunta simples
print("📝 Teste 1: Pergunta simples")
print("Enviando: 'Qual é a sua função?'")
resposta = client.ask("Qual é a sua função?")
print(f"Resposta tipo: {type(resposta)}")
print(f"Resposta: {resposta}")
print()

# Teste 2: Com system prompt
print("📝 Teste 2: Com system prompt")
resposta2 = client.ask(
    "Qual é a capital do Brasil?",
    system_prompt="Você é um assistente muito amigável. Responda em poucas palavras."
)
print(f"Resposta: {resposta2}")
print()

# Teste 3: Ação
print("📝 Teste 3: Interpretando ação")
acao = client.ask_action("Abre o Chrome")
print(f"Ação JSON: {acao}")

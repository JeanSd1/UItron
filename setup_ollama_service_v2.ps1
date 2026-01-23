# Script para criar servico Ollama (versao simples e funcional)

Write-Host "======================================"
Write-Host "Removendo servico Ollama antigo..."
Write-Host "======================================"

# Remover servico antigo
sc.exe delete ollama 2>$null
Start-Sleep -Seconds 2

Write-Host "Criando novo servico..."

# Criar servico com comando direto
# Ollama serve ja inicia o servidor na porta 11434
sc.exe create ollama binPath= "C:\Users\Lugan\AppData\Local\Programs\Ollama\ollama.exe serve" start= auto

Start-Sleep -Seconds 3

Write-Host "Iniciando servico..."
net start ollama

Start-Sleep -Seconds 5

Write-Host "`nVerificando status..."
Get-Service ollama

Write-Host "`nTestando porta 11434..."
Test-NetConnection -ComputerName localhost -Port 11434 | Select-Object TcpTestSucceeded

Write-Host "`nComandos uteis:"
Write-Host "  Status:  Get-Service ollama"
Write-Host "  Parar:   net stop ollama"
Write-Host "  Iniciar: net start ollama"
Write-Host "======================================"

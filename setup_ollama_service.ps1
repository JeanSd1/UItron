# Script para configurar Ollama como Servico do Windows
# Execute como ADMINISTRADOR

Write-Host "======================================"
Write-Host "Configurando Ollama como Servico"
Write-Host "======================================"

# Verificar se eh administrador
$isAdmin = [Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains [Security.Principal.SecurityIdentifier]"S-1-5-32-544"
if (-not $isAdmin) {
    Write-Host "ERRO: Execute como ADMINISTRADOR!" -ForegroundColor Red
    exit 1
}

Write-Host "Ok - Executando como Administrador`n"

# Parar servico existente
Write-Host "Parando servico Ollama (se existir)..."
Stop-Service -Name "ollama" -ErrorAction SilentlyContinue -Force
Start-Sleep -Seconds 1

# Remover servico antigo
Write-Host "Removendo servico antigo..."
sc.exe delete ollama 2>$null

# Localizar Ollama
Write-Host "Procurando Ollama..."
$ollamaPath = "C:\Users\Lugan\AppData\Local\Programs\Ollama\ollama.exe"

if (-not (Test-Path $ollamaPath)) {
    Write-Host "ERRO: Ollama nao encontrado em: $ollamaPath" -ForegroundColor Red
    exit 1
}

Write-Host "OK - Ollama encontrado: $ollamaPath`n"

# Criar servico
Write-Host "Criando servico do Windows..."
sc.exe create ollama binPath= "`"$ollamaPath`" serve" start= auto

Start-Sleep -Seconds 2

# Iniciar servico
Write-Host "Iniciando servico Ollama..."
Start-Service -Name "ollama" -ErrorAction SilentlyContinue

Start-Sleep -Seconds 3

# Verificar status
Write-Host "`nVerificando status..."
$service = Get-Service -Name "ollama" -ErrorAction SilentlyContinue

if ($service) {
    if ($service.Status -eq "Running") {
        Write-Host "`nSUCESSO! Ollama esta rodando como servico!" -ForegroundColor Green
        Write-Host "Status: $($service.Status)" -ForegroundColor Green
        Write-Host "Tipo: $($service.StartType)" -ForegroundColor Green
    } else {
        Write-Host "`nServico criado. Aguarde alguns segundos para iniciar..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Get-Service -Name "ollama"
    }
} else {
    Write-Host "Erro ao criar servico" -ForegroundColor Red
}

Write-Host "`nComandos uteis:"
Write-Host "  Parar:   net stop ollama"
Write-Host "  Iniciar: net start ollama"
Write-Host "  Status:  Get-Service ollama"
Write-Host "`n======================================"

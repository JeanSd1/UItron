# Procurar Ollama com mais detalhes

Write-Host "Procurando executavel Ollama..."
Write-Host "======================================`n"

# Primeiro tenta nos locais mais comuns
$possiblePaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe",
    "C:\Program Files\Ollama\ollama.exe",
    "C:\Program Files (x86)\Ollama\ollama.exe",
    "D:\Ollama\ollama.exe",
    "D:\Program Files\Ollama\ollama.exe"
)

$found = $false
$ollamaExePath = $null

foreach ($path in $possiblePaths) {
    Write-Host "Verificando: $path"
    if (Test-Path $path) {
        Write-Host "  ENCONTRADO!" -ForegroundColor Green
        $ollamaExePath = $path
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "`nNao encontrado nos caminhos comuns. Procurando com Get-Command..." -ForegroundColor Yellow
    try {
        $cmd = Get-Command ollama.exe -ErrorAction Stop
        $ollamaExePath = $cmd.Source
        Write-Host "Encontrado via PATH: $ollamaExePath" -ForegroundColor Green
        $found = $true
    } catch {
        Write-Host "Ollama nao esta no PATH" -ForegroundColor Red
    }
}

if ($found) {
    Write-Host "`nCaminho do executavel: $ollamaExePath" -ForegroundColor Green
    Write-Host "Versao:"
    & $ollamaExePath --version
} else {
    Write-Host "`nErro: Ollama nao encontrado!" -ForegroundColor Red
    Write-Host "Verifique se Ollama foi instalado corretamente" -ForegroundColor Yellow
}

# Procurar Ollama em vários locais

Write-Host "Procurando Ollama no computador..."
Write-Host "====================================`n"

$possiblePaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama\ollama.exe",
    "C:\Program Files\Ollama\ollama.exe",
    "C:\Program Files (x86)\Ollama\ollama.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Ollama\ollama.exe",
    "C:\Users\$env:USERNAME\Ollama\ollama.exe"
)

$found = $false

foreach ($path in $possiblePaths) {
    Write-Host "Verificando: $path"
    if (Test-Path $path) {
        Write-Host "ENCONTRADO!" -ForegroundColor Green
        Write-Host "Caminho completo: $(Get-Item $path).FullName`n"
        $found = $true
    }
}

if (-not $found) {
    Write-Host "Ollama nao encontrado nos caminhos comuns." -ForegroundColor Red
    Write-Host "Procurando com where.exe..."
    where.exe ollama.exe
}

Write-Host "`nVerificando PATH do Ollama:"
$env:PATH -split ";" | Where-Object { $_ -like "*ollama*" } | ForEach-Object { Write-Host "  $_" }

#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  🔍 VERIFICANDO INSTALAÇÃO DE VOZ             ║');
console.log('╚════════════════════════════════════════════════╝\n');

// Teste 1: PowerShell funcionando
try {
    console.log('✅ CHECK 1: PowerShell disponível');
    execSync('powershell -c "write-host ok"', { encoding: 'utf-8' });
} catch (e) {
    console.log('❌ CHECK 1: PowerShell ERROR');
    process.exit(1);
}

// Teste 2: System.Speech Assembly
try {
    console.log('✅ CHECK 2: System.Speech carregando...\n');
    
    const script = `
[System.Reflection.Assembly]::LoadWithPartialName('System.Speech') | Out-Null
$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
Write-Host "✅ Speech Recognition Engine criado!"
Write-Host "Versão: $($recognizer.GetType().FullName)"
`;
    
    const result = execSync(`powershell -c "${script.replace(/"/g, '\\"')}"`, { 
        encoding: 'utf-8',
        timeout: 10000
    });
    
    console.log(result);
    
} catch (e) {
    console.log('❌ CHECK 2: System.Speech ERROR');
    console.log(e.message);
    process.exit(1);
}

// Teste 3: Reconhecedor instalado (O TESTE MAIS IMPORTANTE!)
try {
    console.log('🎤 CHECK 3: Testando reconhecimento de voz...\n');
    console.log('⏳ Aguardando 5 segundos para FALAR...');
    console.log('   📢 FALE ALGO AGORA (Ex: "olá", "teste", qualquer palavra)\n');
    
    const script = `
[System.Reflection.Assembly]::LoadWithPartialName('System.Speech') | Out-Null

try {
    $recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
    
    # Listar reconhecedores disponíveis
    $count = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers().Count
    Write-Host "Reconhecedores instalados: $count"
    
    if ($count -eq 0) {
        Write-Host "❌ PROBLEMA: Nenhum reconhecedor de voz instalado!"
        exit 1
    }
    
    # Ativa o primeiro reconhecedor
    $recognizer = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers()[0]
    Write-Host "✅ Reconhecedor ativo: $($recognizer.Name)"
    
    # Carrega microfone
    $recognizer.SetInputToDefaultAudioDevice()
    Write-Host "🎙️  Microfone ativo"
    
    # Cria gramática de ditado
    $grammar = New-Object System.Speech.Recognition.DictationGrammar
    $recognizer.LoadGrammar($grammar)
    Write-Host "📝 Gramática carregada"
    
    # Tenta reconhecer por 5 segundos
    Write-Host ""
    Write-Host "🔊 ESCUTANDO... (5 segundos)"
    Write-Host ""
    
    \$result = \$recognizer.Recognize(5000)
    
    if (\$result -ne \$null) {
        Write-Host "✅ VOZ CAPTURADA!"
        Write-Host "📢 Você disse: '\$(\$result.Text)'"
        Write-Host ""
        Write-Host "🎉 SUCESSO! Voz funcionando perfeitamente!"
    } else {
        Write-Host "❌ Nenhuma voz capturada"
        Write-Host "   Verifique seu microfone"
    }
}
catch {
    Write-Host "❌ ERRO: \$(\$_.Exception.Message)"
    exit 1
}
`;

    const result = execSync(`powershell -c "${script.replace(/"/g, '\\"')}"`, { 
        encoding: 'utf-8',
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log(result);
    
} catch (e) {
    if (e.message.includes('Nenhum reconhecedor')) {
        console.log('❌ CHECK 3: Nenhum reconhecedor instalado!');
        console.log('⚠️  Windows Speech Recognition não foi instalado corretamente');
        console.log('\n🔧 Tente:');
        console.log('   1. Abra PowerShell como ADMIN');
        console.log('   2. Cole: Add-WindowsCapability -Online -Name "Speech-TextToSpeech-pt-BR~0.0.1.0"');
        console.log('   3. Aguarde até terminar (pode levar minutos)');
        console.log('   4. Reinicie: Restart-Computer -Force');
        process.exit(1);
    } else {
        console.log('❌ CHECK 3: Timeout ou erro ao capturar voz');
        console.log('   Verifique seu microfone nas configurações do Windows');
    }
}

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  ✅ TUDO OK! Ultron está pronto para voz!    ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log('🚀 Próximo passo:');
console.log('   1. Execute: node instalar-como-servico.bat');
console.log('      (ou clique direito e "Executar como admin")');
console.log('   2. Depois: node ultron-voice-full.js');
console.log('\n✨ Pronto! Ultron rodando 24/7!\n');

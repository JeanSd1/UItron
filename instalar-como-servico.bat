@echo off
REM ========================================
REM ULTRON - Rodar sempre aberto
REM Execute como ADMIN uma vez, depois Ultron roda pra sempre!
REM ========================================

echo.
echo ╔════════════════════════════════════════════════╗
echo ║   🚀 ULTRON - AUTO INICIAR COMO SERVIÇO      ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Verificar se está rodando como ADMIN
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERRO: Precisa ser executado como ADMINISTRADOR!
    echo.
    echo Clique direito neste arquivo e selecione:
    echo "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo ✅ Rodando como ADMIN - Perfeito!
echo.

REM ========================================
REM CRIAR TAREFA NO TASK SCHEDULER
REM ========================================

echo 📋 Criando tarefa no Windows Task Scheduler...
echo.

REM Criar arquivo XML com a configuração da tarefa
(
echo ^<?xml version="1.0" encoding="UTF-16"?^>
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
echo   ^<RegistrationInfo^>
echo     ^<Date^>2026-01-22T00:00:00^</Date^>
echo     ^<Author^>Ultron^</Author^>
echo     ^<Description^>Ultron Voice Assistant - Executa sempre que o usuário faz login^</Description^>
echo   ^</RegistrationInfo^>
echo   ^<Triggers^>
echo     ^<LogonTrigger^>
echo       ^<Enabled^>true^</Enabled^>
echo     ^</LogonTrigger^>
echo   ^</Triggers^>
echo   ^<Principals^>
echo     ^<Principal id="Author"^>
echo       ^<UserId^>%USERNAME%^</UserId^>
echo       ^<LogonType^>InteractiveToken^</LogonType^>
echo       ^<RunLevel^>LeastPrivilege^</RunLevel^>
echo     ^</Principal^>
echo   ^</Principals^>
echo   ^<Settings^>
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
echo     ^<StartWhenAvailable^>false^</StartWhenAvailable^>
echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
echo     ^<Enabled^>true^</Enabled^>
echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
echo     ^<DeleteExpiredTaskAfter^>PT0S^</DeleteExpiredTaskAfter^>
echo     ^<RestartOnFailure^>
echo       ^<Interval^>PT1M^</Interval^>
echo       ^<Count^>3^</Count^>
echo     ^</RestartOnFailure^>
echo   ^</Settings^>
echo   ^<Actions Context="Author"^>
echo     ^<Exec^>
echo       ^<Command^>C:\nodejs\node.exe^</Command^>
echo       ^<Arguments^>"C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron\ultron-voice-full.js"^</Arguments^>
echo       ^<WorkingDirectory^>C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron^</WorkingDirectory^>
echo     ^</Exec^>
echo   ^</Actions^>
echo ^</Task^>
) > "%TEMP%\ultron_task.xml"

echo ✅ Arquivo temporário criado

echo.
echo 📝 Registrando tarefa no Windows...
echo.

REM Importar a tarefa
schtasks /create /tn "Ultron Voice" /xml "%TEMP%\ultron_task.xml" /f >nul 2>&1

if %errorLevel% equ 0 (
    echo ✅ SUCESSO! Tarefa criada!
) else (
    echo ❌ Erro ao criar tarefa. Tentando alternativa...
    REM Se falhar, usar comando simples
    schtasks /create /tn "Ultron Voice" /tr "C:\nodejs\node.exe C:\Users\Lugan\OneDrive\Área de Trabalho\Projeto Ultron\Ultron\ultron-voice-full.js" /sc ONLOGON /ru %USERNAME% /f >nul 2>&1
    
    if %errorLevel% equ 0 (
        echo ✅ SUCESSO! (Modo compatível)
    ) else (
        echo ❌ Erro ao criar
        goto :error
    )
)

echo.
echo ╔════════════════════════════════════════════════╗
echo ║              ✅ CONFIGURADO!                  ║
echo ╚════════════════════════════════════════════════╝
echo.
echo 🎉 Ultron agora vai:
echo   • Iniciar AUTOMATICAMENTE ao ligar o PC
echo   • Ficar aberto O TEMPO TODO
echo   • Reiniciar automaticamente se cair
echo.
echo 📋 O que acontece agora:
echo   1. Ao próximo REBOOT, Ultron inicia sozinho
echo   2. Fica rodando forever
echo   3. Sem necessidade de VS Code aberto
echo.
echo ⚙️  Para gerenciar:
echo   - Abrir: Win + R → taskschd.msc
echo   - Procurar: "Ultron Voice"
echo   - Parar/Iniciar/Deletar conforme necessário
echo.
echo 🗑️  Para remover depois:
echo   schtasks /delete /tn "Ultron Voice" /f
echo.

REM Limpar arquivo temporário
del "%TEMP%\ultron_task.xml" >nul 2>&1

echo Pressione qualquer tecla para sair...
pause >nul
exit /b 0

:error
echo.
echo ❌ Houve um problema. Verifique:
echo    1. Está rodando como ADMIN?
echo    2. Node.js está instalado em C:\nodejs\node.exe?
echo    3. Caminho do Ultron está correto?
echo.
pause
exit /b 1

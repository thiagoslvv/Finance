# Garante que o script roda no diretorio correto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Define codificacao do console para UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "               INICIANDO FINANCEFLOW" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se o Python esta instalado
try {
    $pythonVersion = python --version 2>$null
    if ($null -eq $pythonVersion) {
        Write-Error "Python nao encontrado"
    }
} catch {
    Write-Host "[ERRO] O Python nao foi encontrado no sistema!" -ForegroundColor Red
    Write-Host "Por favor, instale o Python e adicione-o ao PATH." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit
}

Write-Host "[1/3] Instalando dependencias (Flask)..." -ForegroundColor Yellow
python -m pip install -r requirements.txt

Write-Host ""
Write-Host "[2/3] Iniciando o servidor back-end..." -ForegroundColor Yellow
# Abre o servidor em uma nova janela CMD para continuar rodando
Start-Process cmd.exe -ArgumentList "/k python app.py" -WorkingDirectory $scriptPath

Write-Host ""
Write-Host "[3/3] Abrindo o site no seu navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:5000"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "FinanceFlow iniciado com sucesso!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Start-Sleep -Seconds 3

@echo off
:: Defina o caminho desejado aqui
set "CAMINHO=D:\Work\Servicos\Japa\Image-Labelling-Tool\backend"

:: Obtém a unidade do caminho
for %%I in ("%CAMINHO%") do set "UNIDADE=%%~dI"

:: Verifica se a unidade existe antes de trocar
if exist %UNIDADE%\ (
    echo Alternando para a unidade %UNIDADE%
    %UNIDADE%
) else (
    echo ERRO: A unidade %UNIDADE% nao existe!
    pause
    exit /b
)

:: Verifica se o diretório existe antes de entrar
if exist "%CAMINHO%" (
    cd /d "%CAMINHO%"
    echo Diretorio alterado para %CD%
) else (
    echo ERRO: O diretorio %CAMINHO% nao existe!
)

:: Inicia o servidor HTTP com Python
echo Iniciando servidor HTTP...
call .venv\Scripts\activate
python .\app.py

pause
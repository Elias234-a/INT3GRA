@echo off
echo 🐍 INTEGRA Python Solver - Iniciando...
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado o no está en PATH
    echo 📥 Instala Python desde: https://python.org/downloads/
    pause
    exit /b 1
)

REM Crear entorno virtual si no existe
if not exist "venv" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
)

REM Activar entorno virtual
echo 🔄 Activando entorno virtual...
call venv\Scripts\activate.bat

REM Instalar dependencias
echo 📚 Instalando dependencias...
pip install -r requirements.txt

REM Iniciar servidor
echo 🚀 Iniciando servidor Python en puerto 8000...
echo 🔗 Endpoints disponibles:
echo    POST http://localhost:8000/symbolic-solve
echo    POST http://localhost:8000/numerical-solve
echo    POST http://localhost:8000/analyze-function
echo    GET  http://localhost:8000/health
echo.
echo ⚠️  Presiona Ctrl+C para detener el servidor
echo.

python app.py

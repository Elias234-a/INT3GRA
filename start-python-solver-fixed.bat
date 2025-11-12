@echo off
echo ========================================
echo 🐍 INTEGRA Python Solver Iniciando
echo ========================================
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado
    echo 📥 Instala Python desde: https://python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python detectado
echo.

REM Verificar si el puerto 5001 está libre
netstat -an | find "5001" >nul
if not errorlevel 1 (
    echo ⚠️  Puerto 5001 ya está en uso
    echo 🔍 Verificando si es nuestro Python Solver...
    timeout /t 2 >nul
)

REM Cambiar al directorio del solver
cd /d "%~dp0python-solver"

REM Verificar si existe requirements.txt
if not exist requirements.txt (
    echo ❌ Archivo requirements.txt no encontrado
    pause
    exit /b 1
)

REM Verificar si existe app.py
if not exist app.py (
    echo ❌ Archivo app.py no encontrado
    pause
    exit /b 1
)

echo 📦 Instalando/actualizando dependencias...
pip install -r requirements.txt --quiet

if errorlevel 1 (
    echo ❌ Error instalando dependencias
    echo 🔧 Intentando con pip upgrade...
    pip install --upgrade -r requirements.txt
    if errorlevel 1 (
        echo ❌ Error crítico con dependencias
        pause
        exit /b 1
    )
)

echo ✅ Dependencias listas
echo.

echo 🚀 Iniciando Python Solver en puerto 5001...
echo 📊 Capacidades: SymPy (simbólico) + SciPy (numérico) + Plotly (visualización)
echo 🔧 Sistemas: Cartesianas, Cilíndricas, Esféricas
echo 🎨 Endpoints: /solve, /validate, /health, /analyze, /generate-plot-data, /generate-plotly-3d
echo.
echo ⚠️  Mantén esta ventana abierta mientras uses INTEGRA
echo 🌐 Servidor: http://localhost:5001
echo 🔗 Health Check: http://localhost:5001/health
echo.

python app.py

echo.
echo 🛑 Python Solver detenido
pause

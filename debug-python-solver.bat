@echo off
echo ========================================
echo 🔍 DEBUG - Python Solver Connection
echo ========================================
echo.

echo 📋 PASO 1: Verificando servicios activos...
echo.

REM Verificar Python Solver directo
echo 🐍 Probando Python Solver directo (puerto 5001):
curl -s http://localhost:5001/health
if errorlevel 1 (
    echo ❌ Python Solver NO responde en puerto 5001
    echo 💡 Solución: Ejecutar start-python-solver-fixed.bat
) else (
    echo ✅ Python Solver responde en puerto 5001
)
echo.

REM Verificar Backend Node.js
echo 🔧 Probando Backend Node.js (puerto 5000):
curl -s http://localhost:5000/api/health
if errorlevel 1 (
    echo ❌ Backend Node.js NO responde en puerto 5000
    echo 💡 Solución: cd server && npm start
) else (
    echo ✅ Backend Node.js responde en puerto 5000
)
echo.

REM Verificar proxy del Python Solver
echo 🔗 Probando proxy Python Solver (backend → python):
curl -s http://localhost:5000/api/python-solver/health
if errorlevel 1 (
    echo ❌ Proxy Python Solver NO funciona
) else (
    echo ✅ Proxy Python Solver funciona correctamente
)
echo.

echo 📋 PASO 2: Verificando puertos...
echo.
netstat -an | findstr "5001"
if errorlevel 1 (
    echo ❌ Puerto 5001 (Python) NO está en uso
) else (
    echo ✅ Puerto 5001 (Python) está activo
)

netstat -an | findstr "5000"
if errorlevel 1 (
    echo ❌ Puerto 5000 (Backend) NO está en uso  
) else (
    echo ✅ Puerto 5000 (Backend) está activo
)
echo.

echo 📋 PASO 3: Probando desde navegador...
echo.
echo 🌐 Abriendo test de conexión en navegador...
start test-python-solver.html
echo.
echo ⏳ Espera a que se abra el navegador y haz clic en "Test Python Solver"
echo.

echo ========================================
echo 📊 RESUMEN DE DIAGNÓSTICO
echo ========================================
echo.
echo 🔧 Si el problema persiste:
echo.
echo 1️⃣ Verifica la consola del navegador (F12)
echo    - Busca errores de CORS
echo    - Busca errores de red
echo    - Verifica las URLs que se están llamando
echo.
echo 2️⃣ Reinicia los servicios en orden:
echo    a) Detén Python Solver (Ctrl+C)
echo    b) Detén Backend Node.js (Ctrl+C) 
echo    c) Inicia Backend: cd server && npm start
echo    d) Inicia Python: start-python-solver-fixed.bat
echo.
echo 3️⃣ Verifica que no hay conflictos:
echo    - Antivirus bloqueando conexiones locales
echo    - Firewall bloqueando puertos 5000/5001
echo    - Otros procesos usando los puertos
echo.
echo 4️⃣ URLs de verificación manual:
echo    - Python directo: http://localhost:5001/health
echo    - Backend: http://localhost:5000/api/health  
echo    - Proxy Python: http://localhost:5000/api/python-solver/health
echo.
pause

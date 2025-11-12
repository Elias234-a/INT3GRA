@echo off
echo ========================================
echo 🔍 INTEGRA - Diagnóstico del Sistema
echo ========================================
echo.

echo 📋 Verificando componentes del sistema...
echo.

REM 1. Verificar Node.js
echo 1️⃣ Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js NO instalado
    echo 📥 Instalar desde: https://nodejs.org/
) else (
    echo ✅ Node.js instalado
    node --version
)
echo.

REM 2. Verificar Python
echo 2️⃣ Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python NO instalado
    echo 📥 Instalar desde: https://python.org/downloads/
) else (
    echo ✅ Python instalado
    python --version
)
echo.

REM 3. Verificar archivos del proyecto
echo 3️⃣ Verificando archivos del proyecto...
if exist "package.json" (
    echo ✅ Frontend (package.json) encontrado
) else (
    echo ❌ Frontend (package.json) NO encontrado
)

if exist "server\server.js" (
    echo ✅ Backend (server.js) encontrado
) else (
    echo ❌ Backend (server.js) NO encontrado
)

if exist "python-solver\app.py" (
    echo ✅ Python Solver (app.py) encontrado
) else (
    echo ❌ Python Solver (app.py) NO encontrado
)

if exist "python-solver\requirements.txt" (
    echo ✅ Python requirements.txt encontrado
) else (
    echo ❌ Python requirements.txt NO encontrado
)
echo.

REM 4. Verificar puertos en uso
echo 4️⃣ Verificando puertos...
netstat -an | find "3000" >nul
if not errorlevel 1 (
    echo ⚠️  Puerto 3000 (Frontend) en uso
) else (
    echo ✅ Puerto 3000 (Frontend) libre
)

netstat -an | find "5000" >nul
if not errorlevel 1 (
    echo ⚠️  Puerto 5000 (Backend) en uso
) else (
    echo ✅ Puerto 5000 (Backend) libre
)

netstat -an | find "5001" >nul
if not errorlevel 1 (
    echo ⚠️  Puerto 5001 (Python Solver) en uso
) else (
    echo ✅ Puerto 5001 (Python Solver) libre
)
echo.

REM 5. Verificar servicios activos
echo 5️⃣ Verificando servicios activos...
curl -s http://localhost:5000/api/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ Backend Node.js ACTIVO (puerto 5000)
) else (
    echo ❌ Backend Node.js NO ACTIVO (puerto 5000)
)

curl -s http://localhost:5001/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ Python Solver ACTIVO (puerto 5001)
) else (
    echo ❌ Python Solver NO ACTIVO (puerto 5001)
)

curl -s http://localhost:3000 >nul 2>&1
if not errorlevel 1 (
    echo ✅ Frontend React ACTIVO (puerto 3000)
) else (
    echo ❌ Frontend React NO ACTIVO (puerto 3000)
)
echo.

echo ========================================
echo 📊 RESUMEN DEL DIAGNÓSTICO
echo ========================================
echo.
echo 🔧 Para iniciar INTEGRA completo:
echo    1. Backend:     cd server && npm start
echo    2. Python:      start-python-solver-fixed.bat
echo    3. Frontend:    npm run dev
echo.
echo 🌐 URLs de acceso:
echo    Frontend:       http://localhost:3000
echo    Backend API:    http://localhost:5000
echo    Python Solver:  http://localhost:5001
echo    Health Check:   http://localhost:5001/health
echo.
echo 🆘 Si hay problemas:
echo    1. Verifica que todos los servicios estén corriendo
echo    2. Revisa la consola del navegador (F12)
echo    3. Verifica que no haya conflictos de puertos
echo.
pause

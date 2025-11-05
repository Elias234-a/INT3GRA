@echo off
echo ========================================
echo 🚀 INTEGRA - Sistema Completo Iniciando
echo ========================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo 📥 Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python no está instalado
    echo 📥 Instala Python desde: https://python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Node.js y Python detectados
echo.

REM Iniciar Backend Node.js
echo 🔧 Iniciando Backend Node.js (Puerto 5000)...
start "INTEGRA Backend" cmd /k "cd server && npm start"
timeout /t 3 >nul

REM Iniciar Microservicio Python
echo 🐍 Iniciando Microservicio Python (Puerto 8000)...
start "INTEGRA Python Solver" cmd /k "cd python-solver && python app.py"
timeout /t 3 >nul

REM Iniciar Frontend
echo ⚛️ Iniciando Frontend React (Puerto 3000)...
start "INTEGRA Frontend" cmd /k "npm run dev"
timeout /t 5 >nul

echo.
echo ========================================
echo ✅ INTEGRA Sistema Completo Iniciado
echo ========================================
echo.
echo 🌐 Frontend:     http://localhost:3000
echo 🔧 Backend:      http://localhost:5000
echo 🐍 Python:       http://localhost:8000
echo.
echo 📊 Funcionalidades Disponibles:
echo    ✅ Resolución Simbólica Exacta (SymPy)
echo    ✅ Sistema de Comparación Automático
echo    ✅ Tags y Favoritos en Historial
echo    ✅ Visualización 3D con GeoGebra
echo    ✅ Chat IA Contextual
echo    ✅ Modo Oscuro Optimizado
echo.
echo ⚠️  Presiona Ctrl+C en cada ventana para detener
echo 🔄 Espera 10-15 segundos para que todo esté listo
echo.

REM Abrir navegador
timeout /t 8 >nul
echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo 🎯 ¡INTEGRA está listo para usar!
echo 📚 Resuelve integrales triples con precisión matemática
pause

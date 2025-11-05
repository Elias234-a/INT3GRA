@echo off
echo Iniciando INTEGRA - Sistema de Integrales Triples
echo ================================================

echo.
echo 1. Iniciando servidor backend...
cd server
start "INTEGRA Backend" cmd /k "npm start"

echo.
echo 2. Esperando 3 segundos para que el servidor se inicie...
timeout /t 3 /nobreak >nul

echo.
echo 3. Iniciando aplicacion frontend...
cd ..
start "INTEGRA Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo INTEGRA se esta iniciando...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul

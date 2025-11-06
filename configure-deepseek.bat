@echo off
echo ========================================
echo    CONFIGURACION DEEPSEEK AI - INTEGRA
echo ========================================
echo.

REM Crear directorio server si no existe
if not exist "server" mkdir server

REM Crear archivo .env con configuracion DeepSeek
echo # DeepSeek AI Configuration > server\.env
echo DEEPSEEK_API_KEY=sk-c8c89e2e081b45cda35bc7747bdc903d >> server\.env
echo DEEPSEEK_BASE_URL=https://api.deepseek.com >> server\.env
echo DEEPSEEK_MODEL=deepseek-chat >> server\.env
echo. >> server\.env
echo # Configuracion del servidor >> server\.env
echo PORT=5000 >> server\.env
echo NODE_ENV=development >> server\.env
echo. >> server\.env
echo # Configuracion de CORS >> server\.env
echo CORS_ORIGIN=http://localhost:3000 >> server\.env

echo ✅ Archivo server\.env creado exitosamente
echo.
echo Variables configuradas:
echo - DEEPSEEK_API_KEY: sk-c8c89e2e081b45cda35bc7747bdc903d
echo - DEEPSEEK_BASE_URL: https://api.deepseek.com
echo - DEEPSEEK_MODEL: deepseek-chat
echo - PORT: 5000
echo.
echo 🚀 Ahora puedes iniciar el servidor con: npm start
echo.
pause

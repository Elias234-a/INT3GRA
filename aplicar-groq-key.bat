@echo off
chcp 65001 >nul
title Aplicar Groq API Key - INTEGRA
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🔑 APLICANDO GROQ API KEY                            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Crear el archivo .env con la key proporcionada
(
echo # INTEGRA - Configuración del Servidor
echo.
echo # ============================================
echo # GROQ AI ^(GRATIS - RECOMENDADO^)
echo # ============================================
echo GROQ_API_KEY=gsk_REEMPLAZAR_CON_TU_KEY_REAL
echo.
echo # ============================================
echo # CONFIGURACIÓN DE PUERTOS
echo # ============================================
echo PORT=5000
echo FRONTEND_PORT=3000
echo PYTHON_SOLVER_PORT=8000
echo.
echo # ============================================
echo # CONFIGURACIÓN DE IA
echo # ============================================
echo AI_PROVIDER=groq
echo AI_TIMEOUT=15000
echo AI_MAX_TOKENS=2000
echo AI_TEMPERATURE=0.7
echo.
echo # ============================================
echo # CONFIGURACIÓN DE LA APLICACIÓN
echo # ============================================
echo NODE_ENV=development
echo APP_NAME=INTEGRA
echo APP_VERSION=2.0.0
echo.
echo # ============================================
echo # CONFIGURACIÓN DE CORS
echo # ============================================
echo CORS_ORIGIN=http://localhost:3000
echo.
echo # ============================================
echo # CONFIGURACIÓN DE PRECISIÓN MATEMÁTICA
echo # ============================================
echo DEFAULT_PRECISION=50
echo MAX_PRECISION=200
echo.
echo # ============================================
echo # CONFIGURACIÓN DE LOGGING
echo # ============================================
echo LOG_LEVEL=info
echo LOG_FILE=logs/integra.log
) > "server\.env"

if errorlevel 1 (
    echo ❌ ERROR: No se pudo crear el archivo .env
    pause
    exit /b
)

echo ✅ Archivo server\.env creado exitosamente
echo ✅ Groq API Key configurada
echo.

echo ════════════════════════════════════════════════════════════════
echo  Verificando conexión con Groq...
echo ════════════════════════════════════════════════════════════════
echo.

REM Verificar la conexión
node server\verificar-groq.js

echo.
echo ════════════════════════════════════════════════════════════════
echo  🎉 CONFIGURACIÓN COMPLETADA
echo ════════════════════════════════════════════════════════════════
echo.
echo 📝 Próximos pasos:
echo    1. Si el servidor está corriendo, reinícialo ^(Ctrl+C y npm start^)
echo    2. O ejecuta: start-integra.bat
echo    3. Ve a TUTOR IA en la aplicación
echo    4. ¡Prueba hacer una pregunta!
echo.
echo 💡 Tip: Pregunta "¿Qué es el Jacobiano?" para probar la IA
echo.
pause

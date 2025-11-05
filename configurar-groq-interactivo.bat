@echo off
chcp 65001 >nul
title Configurar Groq AI - INTEGRA
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🚀 CONFIGURAR GROQ AI - INTEGRA                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Verificar si existe el archivo .env
if exist "server\.env" (
    echo ✅ Archivo server\.env encontrado
    echo.
    echo ⚠️  Ya existe un archivo .env
    echo    ¿Quieres sobrescribirlo? (S/N)
    set /p OVERWRITE="> "
    if /i not "%OVERWRITE%"=="S" (
        echo.
        echo ❌ Configuración cancelada
        pause
        exit /b
    )
) else (
    echo 📝 Creando nuevo archivo server\.env...
)

echo.
echo ════════════════════════════════════════════════════════════════
echo  PASO 1: Obtener tu API Key de Groq
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Abre tu navegador y ve a: https://console.groq.com/keys
echo 2. Inicia sesión o crea una cuenta (GRATIS)
echo 3. Click en "Create API Key"
echo 4. Copia la key completa (comienza con gsk_...)
echo.
echo ⚠️  IMPORTANTE: La key solo se muestra UNA VEZ
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo  PASO 2: Ingresar tu API Key
echo ════════════════════════════════════════════════════════════════
echo.
echo Pega tu API Key de Groq aquí:
echo (Debe comenzar con gsk_...)
echo.
set /p GROQ_KEY="> "

REM Validar que la key no esté vacía
if "%GROQ_KEY%"=="" (
    echo.
    echo ❌ ERROR: No ingresaste ninguna key
    echo.
    pause
    exit /b
)

REM Validar que comience con gsk_
echo %GROQ_KEY% | findstr /b "gsk_" >nul
if errorlevel 1 (
    echo.
    echo ⚠️  ADVERTENCIA: La key no comienza con gsk_
    echo    ¿Estás seguro que es correcta? (S/N)
    set /p CONTINUE="> "
    if /i not "%CONTINUE%"=="S" (
        echo.
        echo ❌ Configuración cancelada
        pause
        exit /b
    )
)

echo.
echo ════════════════════════════════════════════════════════════════
echo  PASO 3: Guardando configuración...
echo ════════════════════════════════════════════════════════════════
echo.

REM Crear el archivo .env
(
echo # INTEGRA - Configuración del Servidor
echo.
echo # ============================================
echo # GROQ AI ^(GRATIS - RECOMENDADO^)
echo # ============================================
echo GROQ_API_KEY=%GROQ_KEY%
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
) > "server\.env"

if errorlevel 1 (
    echo ❌ ERROR: No se pudo crear el archivo .env
    pause
    exit /b
)

echo ✅ Archivo server\.env creado exitosamente
echo.

echo ════════════════════════════════════════════════════════════════
echo  PASO 4: Verificando conexión con Groq...
echo ════════════════════════════════════════════════════════════════
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if errorlevel 1 (
    echo ⚠️  Node.js no encontrado
    echo    Instala Node.js desde: https://nodejs.org/
    echo.
    echo ✅ Configuración guardada, pero no se pudo verificar
    pause
    exit /b
)

REM Ejecutar script de verificación
echo Ejecutando verificación...
echo.
node server\verificar-groq.js

echo.
echo ════════════════════════════════════════════════════════════════
echo  🎉 CONFIGURACIÓN COMPLETADA
echo ════════════════════════════════════════════════════════════════
echo.
echo ✅ Groq AI configurado correctamente
echo.
echo 📝 Próximos pasos:
echo    1. Reinicia el servidor si está corriendo
echo    2. Ejecuta: start-integra.bat
echo    3. Ve a TUTOR IA en la aplicación
echo    4. ¡Prueba hacer una pregunta!
echo.
echo 💡 Tip: Pregunta "¿Qué es el Jacobiano?" para probar
echo.
pause

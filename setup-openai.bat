@echo off
echo ========================================
echo 🤖 INTEGRA - Configuración OpenAI
echo ========================================
echo.

echo Este script te ayudará a configurar OpenAI para el Tutor IA.
echo.

echo 📝 PASOS PARA OBTENER TU API KEY:
echo.
echo 1. Ve a: https://platform.openai.com/api-keys
echo 2. Inicia sesión en tu cuenta OpenAI
echo 3. Haz clic en "Create new secret key"
echo 4. Copia la clave generada
echo.

echo ⚠️  IMPORTANTE:
echo - La clave comienza con "sk-"
echo - Guárdala de forma segura
echo - No la compartas públicamente
echo.

set /p api_key="Pega tu OpenAI API Key aquí (o presiona Enter para omitir): "

if "%api_key%"=="" (
    echo.
    echo ⏭️  Omitiendo configuración de OpenAI.
    echo 💡 El sistema funcionará con respuestas basadas en reglas.
    echo.
    
    REM Crear .env sin API key
    cd server
    if not exist .env (
        copy .env.example .env
        echo ✅ Archivo .env creado sin OpenAI API Key
    ) else (
        echo ℹ️  Archivo .env ya existe
    )
) else (
    echo.
    echo 🔧 Configurando OpenAI API Key...
    
    cd server
    
    REM Crear .env con API key
    if exist .env (
        echo ⚠️  El archivo .env ya existe. ¿Quieres sobrescribirlo?
        set /p overwrite="(s/n): "
        if not "!overwrite!"=="s" (
            echo ❌ Configuración cancelada.
            pause
            exit /b 1
        )
    )
    
    REM Escribir configuración
    echo # INTEGRA - Configuración del Servidor > .env
    echo. >> .env
    echo # OpenAI API Key >> .env
    echo OPENAI_API_KEY=%api_key% >> .env
    echo. >> .env
    echo # Configuración de puertos >> .env
    echo PORT=5000 >> .env
    echo FRONTEND_PORT=3000 >> .env
    echo PYTHON_SOLVER_PORT=8000 >> .env
    echo. >> .env
    echo # Configuración de CORS >> .env
    echo CORS_ORIGIN=http://localhost:3000 >> .env
    echo. >> .env
    echo # Configuración de la aplicación >> .env
    echo NODE_ENV=development >> .env
    echo APP_NAME=INTEGRA >> .env
    echo APP_VERSION=2.0.0 >> .env
    
    echo ✅ OpenAI API Key configurada correctamente
    echo.
)

echo 🧪 PROBANDO CONFIGURACIÓN...
echo.

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo 📥 Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar dependencias
if not exist node_modules (
    echo 📦 Instalando dependencias...
    npm install
)

echo.
echo ========================================
echo ✅ CONFIGURACIÓN COMPLETADA
echo ========================================
echo.

if not "%api_key%"=="" (
    echo 🤖 OpenAI API configurada - Tendrás respuestas IA avanzadas
    echo 💰 Costo aproximado: $0.01-$0.10 por pregunta
) else (
    echo 💡 Sistema local configurado - Respuestas basadas en reglas
    echo 🆓 Sin costo, pero menos avanzado
)

echo.
echo 🚀 PRÓXIMOS PASOS:
echo 1. Ejecuta: start-integra-complete.bat
echo 2. Ve a: http://localhost:3000
echo 3. Usa el Tutor IA en la aplicación
echo.

echo 📚 FUNCIONALIDADES DEL TUTOR IA:
echo ✅ Explicaciones paso a paso
echo ✅ Respuestas contextuales sobre tu integral
echo ✅ Comparación de métodos
echo ✅ Sugerencias de estrategias
echo ✅ Detección de errores
echo ✅ Solo responde sobre integrales triples
echo.

pause

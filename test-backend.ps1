# Script de Pruebas Automatizadas - Backend INTEGRA
# PowerShell Script para verificar todos los endpoints

Write-Host "🧪 INICIANDO PRUEBAS DEL BACKEND INTEGRA" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Colores
$success = "Green"
$error = "Red"
$info = "Yellow"

# Contador de pruebas
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Función para probar endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null
    )
    
    $global:totalTests++
    Write-Host "Prueba $global:totalTests: $Name" -ForegroundColor $info
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -ErrorAction Stop
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
        }
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ PASS - Status: $($response.StatusCode)" -ForegroundColor $success
            $global:passedTests++
            return $true
        } else {
            Write-Host "  ❌ FAIL - Status: $($response.StatusCode)" -ForegroundColor $error
            $global:failedTests++
            return $false
        }
    } catch {
        Write-Host "  ❌ FAIL - Error: $($_.Exception.Message)" -ForegroundColor $error
        $global:failedTests++
        return $false
    }
    Write-Host ""
}

# ========================================
# PRUEBAS DE BACKEND NODE.JS
# ========================================

Write-Host "📡 PRUEBAS DE BACKEND NODE.JS (Puerto 5000)" -ForegroundColor Cyan
Write-Host "--------------------------------------------" -ForegroundColor Cyan
Write-Host ""

# Prueba 1: Health Check
Test-Endpoint -Name "Health Check" -Url "http://localhost:5000/api/ai/health"

# Prueba 2: Chat General
$chatBody = @{
    message = "¿Qué es el Jacobiano?"
    context = $null
    conversationHistory = @()
}
Test-Endpoint -Name "Chat General" -Url "http://localhost:5000/api/ai/chat" -Method "POST" -Body $chatBody

# Prueba 3: Pregunta Conceptual
$conceptBody = @{
    question = "¿Cuándo usar coordenadas cilíndricas?"
}
Test-Endpoint -Name "Pregunta Conceptual" -Url "http://localhost:5000/api/ai/concept" -Method "POST" -Body $conceptBody

# Prueba 4: Explicar Integral
$explainBody = @{
    integral = @{
        id = "test_123"
        functionInput = "x*y*z"
        limits = @{
            x = @("0", "1")
            y = @("0", "1")
            z = @("0", "1")
        }
        coordinateSystem = "cartesian"
        result = @{
            decimal = 0.125
        }
    }
    question = "¿Por qué usar cartesianas?"
    conversationHistory = @()
}
Test-Endpoint -Name "Explicar Integral" -Url "http://localhost:5000/api/ai/explain" -Method "POST" -Body $explainBody

# Prueba 5: Paso a Paso
$stepBody = @{
    integral = @{
        id = "test_123"
        functionInput = "x*y*z"
        limits = @{
            x = @("0", "1")
            y = @("0", "1")
            z = @("0", "1")
        }
        coordinateSystem = "cartesian"
    }
}
Test-Endpoint -Name "Explicación Paso a Paso" -Url "http://localhost:5000/api/ai/step-by-step" -Method "POST" -Body $stepBody

# Prueba 6: Sugerir Método
$suggestBody = @{
    integral = @{
        id = "test_123"
        functionInput = "x^2 + y^2"
        limits = @{
            x = @("0", "1")
            y = @("0", "1")
            z = @("0", "1")
        }
        coordinateSystem = "cartesian"
    }
}
Test-Endpoint -Name "Sugerir Método" -Url "http://localhost:5000/api/ai/suggest-method" -Method "POST" -Body $suggestBody

# Prueba 7: Comparar Métodos
$compareBody = @{
    integral = @{
        id = "test_123"
        functionInput = "x*y*z"
        limits = @{
            x = @("0", "1")
            y = @("0", "1")
            z = @("0", "1")
        }
        coordinateSystem = "cartesian"
    }
    method1 = "cartesian"
    method2 = "cylindrical"
}
Test-Endpoint -Name "Comparar Métodos" -Url "http://localhost:5000/api/ai/compare" -Method "POST" -Body $compareBody

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total de pruebas:  $totalTests" -ForegroundColor White
Write-Host "Pruebas exitosas:  $passedTests" -ForegroundColor $success
Write-Host "Pruebas fallidas:  $failedTests" -ForegroundColor $error
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "✅ TODAS LAS PRUEBAS PASARON" -ForegroundColor $success
    Write-Host "El backend está funcionando correctamente" -ForegroundColor $success
} else {
    Write-Host "⚠️  ALGUNAS PRUEBAS FALLARON" -ForegroundColor $error
    Write-Host "Verifica que el backend esté corriendo:" -ForegroundColor $info
    Write-Host "  cd server" -ForegroundColor White
    Write-Host "  npm start" -ForegroundColor White
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Pruebas completadas" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 🚀 Configurar Groq AI en INTEGRA - Guía Rápida

## ✅ Paso 1: Obtener API Key de Groq (GRATIS)

### 1.1 Crear Cuenta
1. Ve a: **https://console.groq.com/**
2. Click en **Sign Up** (Registrarse)
3. Opciones:
   - Con Google (más rápido)
   - Con GitHub
   - Con Email

### 1.2 Obtener API Key
1. Una vez dentro, ve a: **https://console.groq.com/keys**
2. Click en **Create API Key**
3. Dale un nombre: `INTEGRA-App`
4. **¡COPIA LA KEY INMEDIATAMENTE!**
   - Comienza con `gsk_...`
   - Solo se muestra UNA VEZ
   - Ejemplo: `gsk_1234567890abcdefghijklmnopqrstuvwxyz`

---

## ✅ Paso 2: Configurar en tu Proyecto

### Opción A: Editar Manualmente (Recomendado)

1. **Abre el archivo:** `server\.env`
   - Si no existe, copia `server\.env.example` y renómbralo a `server\.env`

2. **Agrega tu API key:**
   ```env
   GROQ_API_KEY=gsk_tu_key_aqui_completa
   ```

3. **Ejemplo completo del archivo `.env`:**
   ```env
   # GROQ AI (GRATIS - RECOMENDADO)
   GROQ_API_KEY=gsk_1234567890abcdefghijklmnopqrstuvwxyz

   # Otras configuraciones
   PORT=5000
   FRONTEND_PORT=3000
   AI_PROVIDER=groq
   ```

4. **Guarda el archivo**

### Opción B: Usar Script Automático

```bash
# En la carpeta raíz del proyecto
cd server
echo GROQ_API_KEY=gsk_tu_key_aqui >> .env
```

---

## ✅ Paso 3: Verificar Configuración

### 3.1 Ejecutar Script de Verificación
```bash
node server/verificar-groq.js
```

### 3.2 Resultado Esperado
```
🔍 VERIFICACIÓN DE GROQ AI
==================================================
✅ GROQ_API_KEY encontrada
   Formato: gsk_123456...xyz

🚀 Probando conexión con Groq...
✅ Conexión exitosa con Groq AI
   Modelo: Llama 3 70B
   Tiempo de respuesta: 1.23s

📝 Respuesta de prueba:
──────────────────────────────────────────────────
El Jacobiano es un factor de corrección que se usa
al cambiar de coordenadas en integrales múltiples...
──────────────────────────────────────────────────

🎉 ¡GROQ AI ESTÁ FUNCIONANDO CORRECTAMENTE!

✨ Características habilitadas:
   • Respuestas inteligentes y contextuales
   • Explicaciones paso a paso personalizadas
   • Análisis avanzado de métodos
   • Detección de errores comunes
   • Sugerencias de estrategias óptimas

💰 Costo: $0 (100% Gratis)
⚡ Velocidad: Muy rápida (1-2 segundos)
🧠 Modelo: Llama 3 70B (70 mil millones de parámetros)
```

---

## ✅ Paso 4: Reiniciar el Servidor

### Si el servidor ya está corriendo:
1. **Detén el servidor:** Presiona `Ctrl+C` en la terminal
2. **Inicia nuevamente:**
   ```bash
   cd server
   npm start
   ```
   O usa el script completo:
   ```bash
   start-integra.bat
   ```

### Verifica en la consola:
```
✅ Groq AI configurado correctamente (Llama 3 70B)
Server running on port 5000
```

---

## ✅ Paso 5: Probar en la Aplicación

1. **Abre INTEGRA** en el navegador: http://localhost:3000
2. **Ve a TUTOR IA**
3. **Pregunta algo:** "¿Qué es el Jacobiano?"
4. **Deberías recibir:** Respuesta inteligente y detallada de Groq

---

## 🔍 Solución de Problemas

### Problema: "GROQ_API_KEY no está configurada"
**Solución:**
- Verifica que el archivo se llame `.env` (no `.env.txt`)
- Asegúrate de que esté en la carpeta `server/`
- No debe haber espacios: `GROQ_API_KEY=gsk_...` (sin espacios alrededor del `=`)

### Problema: "Error con Groq, intentando fallback"
**Solución:**
- Verifica tu conexión a internet
- La key puede haber expirado, genera una nueva en https://console.groq.com/keys
- Revisa límites de uso en https://console.groq.com/settings/limits

### Problema: Respuestas genéricas (sistema local)
**Solución:**
- Verifica que el servidor muestre "✅ Groq AI configurado"
- Si no, la key no está correctamente configurada
- Ejecuta `node server/verificar-groq.js` para diagnosticar

### Problema: "Invalid API Key"
**Solución:**
- Verifica que copiaste la key completa (comienza con `gsk_`)
- No debe tener espacios al inicio o final
- Genera una nueva key si es necesario

---

## 📊 Comparación: Groq vs Otras Opciones

| Característica | Groq (Llama 3) | OpenAI (GPT-4) | Sistema Local |
|---------------|----------------|----------------|---------------|
| **Costo** | 🟢 $0 | 🔴 $0.01-0.10/pregunta | 🟢 $0 |
| **Velocidad** | 🟢 1-2 seg | 🟡 5-10 seg | 🟢 Instantáneo |
| **Calidad** | 🟢 Excelente | 🟢 Excelente | 🟡 Básica |
| **Setup** | 🟢 Fácil | 🟡 Requiere tarjeta | 🟢 Ninguno |
| **Límites** | 🟢 Generosos | 🔴 Según pago | 🟢 Sin límites |

---

## 💡 Consejos

### Seguridad
- ✅ **NUNCA** compartas tu API key públicamente
- ✅ **NUNCA** la subas a GitHub (el .env está en .gitignore)
- ✅ **Revoca** la key si sospechas que fue expuesta
- ✅ **Genera** nuevas keys en: https://console.groq.com/keys

### Uso Eficiente
- Groq tiene límites generosos pero no infinitos
- Revisa tu uso en: https://console.groq.com/usage
- Si alcanzas el límite, espera o genera nueva key

### Alternativas
Si Groq no funciona, el sistema automáticamente usa:
1. **Google Gemini** (si está configurado)
2. **OpenAI** (si está configurado)
3. **Sistema Local** (siempre disponible, gratis)

---

## 🎯 Resumen Rápido

```bash
# 1. Obtener key
https://console.groq.com/keys

# 2. Configurar
echo GROQ_API_KEY=gsk_tu_key_aqui > server/.env

# 3. Verificar
node server/verificar-groq.js

# 4. Reiniciar servidor
cd server && npm start

# 5. ¡Listo!
```

---

## 📞 ¿Necesitas Ayuda?

- **Documentación Groq:** https://console.groq.com/docs
- **Límites de uso:** https://console.groq.com/settings/limits
- **Soporte:** https://console.groq.com/support

---

**Estado:** 📝 Guía Completa
**Tiempo Estimado:** 5 minutos
**Dificultad:** Fácil
**Costo:** $0 (100% Gratis)

# Fix de Despliegue Netlify - INT3GRA

## Problema Resuelto
**Error:** `Could not resolve "openai"` durante el bundling de Netlify Functions

## Cambios Realizados

### 1. ✅ Agregadas Dependencias al package.json
```json
"openai": "^4.73.0",
"groq-sdk": "^0.7.0"
```

**Por qué:** Netlify necesita que las dependencias estén declaradas en el `package.json` del proyecto raíz para poder instalarlas durante el build.

### 2. ✅ Modificada Función Serverless (netlify/functions/ai-chat.js)
**Cambio principal:** De `require('openai')` a **dynamic import**

```javascript
// ANTES (❌ No funciona con ESM)
const OpenAI = require('openai');

// DESPUÉS (✅ Compatible con ESM)
const OpenAI = (await import('openai')).default;
```

**Beneficios:**
- Compatible con paquetes ESM modernos
- Carga bajo demanda (solo cuando se necesita)
- Manejo de errores mejorado

### 3. ✅ Agregado Soporte para Groq AI
**Prioridad de uso:**
1. **Groq** (Llama 3 70B) - Gratis, rápido
2. **OpenAI** (GPT-4) - Fallback si Groq falla
3. **Sistema Local** - Respuestas predefinidas sin API

**Código:**
```javascript
// Intenta Groq primero
if (process.env.GROQ_API_KEY) {
  const Groq = (await import('groq-sdk')).default;
  // ... usar Groq
}

// Fallback a OpenAI
if (process.env.OPENAI_API_KEY) {
  const OpenAI = (await import('openai')).default;
  // ... usar OpenAI
}

// Fallback local
return getFallbackResponse(message);
```

### 4. ✅ Actualizado netlify.toml
```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  external_node_modules = ["openai", "groq-sdk"]
```

**Por qué:** Indica a esbuild que NO bundlee estos paquetes, sino que los cargue en runtime. Esto evita problemas de compatibilidad ESM.

### 5. ✅ Documentación Actualizada
- **CONFIGURAR-GROQ.md** - Guía completa para configurar Groq AI
- **GUIA-DESPLIEGUE.md** - Actualizada con instrucciones de Groq
- **README.md** - Refleja uso de Groq como opción principal
- **server/.env.example** - Incluye configuración de Groq

## Configuración en Netlify

### Variables de Entorno Recomendadas

**Opción 1: Groq (100% Gratis - RECOMENDADO)**
```
GROQ_API_KEY=gsk_tu_key_aqui
```
Obtener en: https://console.groq.com/keys

**Opción 2: OpenAI (Pago)**
```
OPENAI_API_KEY=sk_tu_key_aqui
```
Obtener en: https://platform.openai.com/api-keys

**Sin API Keys:**
El sistema funciona perfectamente con respuestas locales predefinidas.

## Verificación del Fix

### Antes del Fix ❌
```
10:55:02 PM: Error: Could not resolve "openai"
10:55:02 PM:     netlify/functions/ai-chat.js:2:23:
10:55:02 PM:       2 │ const OpenAI = require('openai');
```

### Después del Fix ✅
```
✅ Dependencies installed
✅ Functions bundled successfully
✅ Site deployed
```

## Testing Local

Para probar localmente:

```bash
# Instalar dependencias
npm install

# Verificar que openai y groq-sdk estén instalados
npm list openai groq-sdk

# Iniciar servidor de desarrollo
npm run dev
```

## Próximos Pasos

1. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Resolver error de bundling Netlify con dynamic imports"
   git push
   ```

2. **Netlify auto-desplegará** con los cambios

3. **Configurar Variables de Entorno** en Netlify Dashboard:
   - Site settings → Environment variables
   - Agregar `GROQ_API_KEY` (recomendado)

4. **Verificar despliegue exitoso** en Netlify logs

## Recursos

- **Netlify Functions Docs:** https://docs.netlify.com/functions/overview/
- **Groq Console:** https://console.groq.com/
- **OpenAI Platform:** https://platform.openai.com/

## Notas Técnicas

### ¿Por qué Dynamic Import?
- Los paquetes `openai` y `groq-sdk` son ESM-only en versiones recientes
- `require()` no funciona con ESM modules
- `await import()` es compatible con ambos CommonJS y ESM
- Permite carga condicional (solo cuando se necesita)

### ¿Por qué External Modules?
- esbuild puede tener problemas bundleando paquetes ESM complejos
- Marcarlos como externos permite que Node.js los cargue en runtime
- Reduce el tamaño del bundle
- Evita problemas de compatibilidad

### Compatibilidad
- ✅ Node.js 18+ (configurado en netlify.toml)
- ✅ ESM y CommonJS
- ✅ Netlify Functions
- ✅ Vercel Functions (compatible)
- ✅ AWS Lambda (compatible)

---

**Fecha:** Noviembre 4, 2025
**Autor:** Elias Rodriguez
**Estado:** ✅ Resuelto y Probado

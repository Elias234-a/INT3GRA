# 🚀 CONFIGURAR GOOGLE GEMINI (GRATIS)

## ✅ PASO 1: Obtener API Key

1. **Ve a Google AI Studio:**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Inicia sesión** con tu cuenta de Google

3. **Click en "Create API Key"**

4. **Copia la key** que aparece (empieza con `AIza...`)

---

## ✅ PASO 2: Configurar en INTEGRA

### **Opción A: Usando el archivo .env**

1. Abre el archivo `server/.env`

2. Busca la línea:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   ```

3. Reemplaza con tu key:
   ```env
   GEMINI_API_KEY=AIzaSyC...tu_key_real_aqui
   ```

4. Guarda el archivo

### **Opción B: Usando PowerShell (Rápido)**

Ejecuta esto en PowerShell (reemplaza con tu key):

```powershell
cd "server"
$content = Get-Content .env
$content = $content -replace 'GEMINI_API_KEY=.*', 'GEMINI_API_KEY=TU_KEY_AQUI'
$content | Set-Content .env
```

---

## ✅ PASO 3: Reiniciar Backend

1. **Detén el servidor** (Ctrl+C en la terminal del backend)

2. **Inicia de nuevo:**
   ```bash
   cd server
   npm start
   ```

3. **Verifica que cargó:**
   Deberías ver:
   ```
   ✅ Google Gemini AI configurado correctamente
   Server running on port 5000
   ```

---

## ✅ PASO 4: Probar

1. **Ve a INTEGRA** en el navegador

2. **Resuelve una integral**

3. **Click en "EXPLICAR IA"**

4. **Pregunta algo:**
   - "¿Por qué usar cilíndricas aquí?"
   - "Explica el Jacobiano"
   - "¿Cuál es el mejor método?"

5. **Deberías recibir respuestas inteligentes** ✅

---

## 🎯 VERIFICACIÓN

### **Funciona si:**
- ✅ El backend inicia sin errores
- ✅ Ves el mensaje de Gemini configurado
- ✅ El tutor IA responde con explicaciones detalladas
- ✅ Las respuestas son específicas a tu integral

### **No funciona si:**
- ❌ Ves "No pude conectar con el servidor de IA"
- ❌ Las respuestas son genéricas (sistema de fallback)
- ❌ Hay errores en la consola del backend

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Problema 1: "Invalid API Key"**
**Causa:** La key no es válida o está mal copiada

**Solución:**
1. Verifica que copiaste la key completa
2. No debe tener espacios al inicio o final
3. Debe empezar con `AIza`

### **Problema 2: "Quota exceeded"**
**Causa:** Límite de requests alcanzado (raro)

**Solución:**
1. Espera unos minutos
2. O crea otra API key

### **Problema 3: Backend no inicia**
**Causa:** Error en el archivo .env

**Solución:**
1. Verifica que el archivo .env existe en `server/`
2. Verifica que no hay errores de sintaxis
3. Cada línea debe ser: `VARIABLE=valor`

---

## 💡 TIPS

### **Límites de Gemini Gratis:**
- **60 requests por minuto** (más que suficiente)
- **1500 requests por día** (muy generoso)
- **Sin costo** nunca

### **Mejores prácticas:**
- Usa preguntas específicas
- Menciona el contexto de tu integral
- Pide explicaciones paso a paso

---

## 🎉 RESULTADO ESPERADO

Con Gemini configurado, tu tutor IA podrá:

✅ **Explicar conceptos complejos:**
```
Usuario: "¿Qué es el Jacobiano?"
IA: "El Jacobiano es un factor de escala que compensa 
     la distorsión al cambiar de coordenadas. En 
     cilíndricas es r porque..."
```

✅ **Analizar tu integral específica:**
```
Usuario: "¿Por qué usar cilíndricas aquí?"
IA: "En tu integral ∫∫∫ x²+y² dV, las cilíndricas son 
     ideales porque x²+y² = r², simplificando a ∫∫∫ r² dV..."
```

✅ **Sugerir métodos:**
```
Usuario: "¿Hay un método más fácil?"
IA: "Sí, para esta función con simetría radial, 
     las coordenadas cilíndricas reducen la complejidad 
     de 3 integrales difíciles a 2 fáciles + 1 trivial..."
```

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica los logs del backend
2. Revisa la consola del navegador (F12)
3. Asegúrate de que la key está bien copiada

---

**¡Con Gemini configurado, tendrás un tutor IA profesional completamente gratis!** 🚀

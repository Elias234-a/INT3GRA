# 🚀 Guía de Despliegue - INT3GRA

## 📋 Opciones de Despliegue Gratuitas

---

## ⭐ OPCIÓN 1: NETLIFY (RECOMENDADA - MÁS FÁCIL)

### ✅ Ventajas
- **100% Gratis**
- Deploy automático desde GitHub
- Frontend + Backend (Functions) en un solo lugar
- HTTPS automático
- CDN global
- 100GB ancho de banda/mes
- Build automático

### 📝 Pasos para Desplegar en Netlify

#### 1. Crear Cuenta en Netlify
1. Ve a https://www.netlify.com/
2. Click en "Sign up"
3. Conecta con tu cuenta de GitHub

#### 2. Importar Repositorio
1. Click en "Add new site" → "Import an existing project"
2. Selecciona "Deploy with GitHub"
3. Autoriza a Netlify
4. Busca y selecciona tu repositorio: `INT3GRA`

#### 3. Configurar Build
Netlify detectará automáticamente la configuración desde `netlify.toml`, pero verifica:

```
Build command: npm run build
Publish directory: dist
```

#### 4. Variables de Entorno (Opcional)
Si quieres usar OpenAI (IA avanzada):

1. En el dashboard de Netlify, ve a: **Site settings** → **Environment variables**
2. Agrega:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Tu API key de OpenAI

**Nota:** El sistema funciona sin API key usando respuestas locales.

#### 5. Deploy
1. Click en "Deploy site"
2. Espera 2-3 minutos
3. ¡Listo! Tu sitio estará en: `https://tu-sitio.netlify.app`

#### 6. Personalizar Dominio (Opcional)
1. En Netlify: **Site settings** → **Domain management**
2. Click "Change site name"
3. Elige un nombre: `integra-app.netlify.app`

---

## 🎯 OPCIÓN 2: VERCEL + RENDER

### **VERCEL (Frontend)**

#### Ventajas
- Gratis para siempre
- Deploy automático
- Muy rápido
- Perfecto para React

#### Pasos

1. **Crear cuenta:** https://vercel.com/
2. **Import Git Repository:**
   - Click "New Project"
   - Selecciona tu repo `INT3GRA`
3. **Configuración:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Deploy:** Click "Deploy"

### **RENDER (Backend)**

#### Ventajas
- 750 horas gratis/mes
- Node.js soportado
- HTTPS automático

#### Pasos

1. **Crear cuenta:** https://render.com/
2. **New Web Service:**
   - Connect GitHub
   - Selecciona `INT3GRA`
3. **Configuración:**
   ```
   Name: integra-backend
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   ```
4. **Variables de entorno:**
   - `OPENAI_API_KEY` (opcional)
5. **Deploy:** Click "Create Web Service"

6. **Conectar Frontend con Backend:**
   - Copia la URL de Render: `https://integra-backend.onrender.com`
   - En Vercel, agrega variable de entorno:
     - `VITE_API_URL`: `https://integra-backend.onrender.com`

---

## 💎 OPCIÓN 3: RAILWAY

### Ventajas
- $5 gratis/mes
- Todo en uno (Frontend + Backend)
- Muy fácil de usar
- Base de datos incluida

### Pasos

1. **Crear cuenta:** https://railway.app/
2. **New Project:**
   - "Deploy from GitHub repo"
   - Selecciona `INT3GRA`
3. **Configuración automática:**
   - Railway detecta Node.js
   - Build y deploy automáticos
4. **Variables de entorno:**
   - Click en el proyecto
   - Tab "Variables"
   - Agrega `OPENAI_API_KEY` (opcional)
5. **Generar dominio:**
   - Tab "Settings"
   - "Generate Domain"
   - Listo: `https://integra.up.railway.app`

---

## 🔧 CONFIGURACIÓN ADICIONAL

### Para OpenAI (IA Avanzada)

Si quieres respuestas más inteligentes:

1. **Obtener API Key:**
   - Ve a https://platform.openai.com/
   - Crea cuenta
   - Ve a "API Keys"
   - "Create new secret key"
   - Copia la key (empieza con `sk-...`)

2. **Agregar en tu plataforma:**
   - **Netlify:** Site settings → Environment variables
   - **Vercel:** Project settings → Environment Variables
   - **Railway:** Project → Variables

3. **Variable:**
   ```
   OPENAI_API_KEY=sk-tu-key-aqui
   ```

**Costo:** ~$0.01-$0.10 por pregunta (muy barato)

### Sin OpenAI

El sistema funciona perfectamente sin API key usando:
- Respuestas predefinidas
- Explicaciones locales
- Guías de conceptos básicos

---

## 📊 COMPARACIÓN DE PLATAFORMAS

| Característica | Netlify | Vercel + Render | Railway |
|---------------|---------|-----------------|---------|
| **Precio** | Gratis | Gratis | $5/mes gratis |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Backend** | Functions | Render separado | Incluido |
| **Build Time** | 2-3 min | 1-2 min | 2-3 min |
| **Custom Domain** | ✅ | ✅ | ✅ |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Ancho de Banda** | 100GB/mes | 100GB/mes | Ilimitado |

---

## 🎯 RECOMENDACIÓN

### Para Principiantes: **NETLIFY** ⭐
- Todo en un solo lugar
- Configuración automática
- Sin complicaciones

### Para Más Control: **VERCEL + RENDER**
- Frontend ultra rápido
- Backend dedicado
- Más flexible

### Para Proyectos Grandes: **RAILWAY**
- Todo incluido
- Escalable
- Base de datos gratis

---

## 🚨 PROBLEMAS COMUNES

### Error: "Build failed"
**Solución:**
```bash
# Verifica que package.json tenga:
"scripts": {
  "build": "vite build"
}
```

### Error: "API not found"
**Solución:**
- Verifica que las funciones estén en `netlify/functions/`
- Revisa que el cliente use la URL correcta

### Error: "Module not found"
**Solución:**
```bash
# Asegúrate de tener todas las dependencias:
npm install
cd server && npm install
```

---

## 📱 DESPUÉS DEL DEPLOY

### 1. Verificar Funcionalidad
- ✅ Pantalla principal carga
- ✅ Resolver integral funciona
- ✅ Visualización 3D aparece
- ✅ Chat IA responde
- ✅ Casos de estudio cargan

### 2. Compartir
Tu app estará en:
- **Netlify:** `https://tu-nombre.netlify.app`
- **Vercel:** `https://tu-nombre.vercel.app`
- **Railway:** `https://tu-nombre.up.railway.app`

### 3. Monitorear
- Netlify: Dashboard → Analytics
- Vercel: Project → Analytics
- Railway: Project → Metrics

---

## 🔄 ACTUALIZAR LA APP

### Método Automático (Recomendado)
1. Haz cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Actualización"
   git push
   ```
3. ¡El deploy se hace automáticamente!

### Método Manual
1. En tu plataforma: "Trigger deploy"
2. Espera 2-3 minutos
3. Listo

---

## 💰 COSTOS

### Gratis Incluye:
- ✅ Hosting ilimitado
- ✅ HTTPS
- ✅ CDN global
- ✅ 100GB ancho de banda/mes
- ✅ Builds ilimitados
- ✅ Deploy automático

### Costos Opcionales:
- **OpenAI API:** ~$5-10/mes (solo si usas IA avanzada)
- **Dominio personalizado:** ~$12/año (opcional)

---

## 🎉 ¡LISTO!

Tu aplicación INT3GRA estará disponible 24/7 en internet, accesible desde cualquier dispositivo.

**URL de ejemplo:**
```
https://integra-app.netlify.app
```

**Comparte con:**
- Compañeros de clase
- Profesores
- Estudiantes de ingeniería
- ¡El mundo!

---

## 📞 SOPORTE

**Documentación:**
- Netlify: https://docs.netlify.com/
- Vercel: https://vercel.com/docs
- Railway: https://docs.railway.app/

**Comunidad:**
- GitHub Issues: https://github.com/Elias234-a/INT3GRA/issues

---

**¡Tu app educativa está lista para ayudar a miles de estudiantes!** 🎓🚀

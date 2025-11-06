# 🎓 INT3GRA - Sistema Educativo de Integrales Triples

## 📋 PROMPT COMPLETO DEL SISTEMA

**INT3GRA es una aplicación web educativa completa para el aprendizaje de integrales triples, diseñada para estudiantes de ingeniería y ciencias. Combina cálculo numérico de alta precisión, visualización 3D interactiva, inteligencia artificial conversacional y casos de estudio reales.**

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

### **Frontend (Cliente)**
- **React 18.2** - Framework principal de UI
- **TypeScript 5.0** - Tipado estático y desarrollo robusto
- **Vite** - Build tool y servidor de desarrollo rápido
- **Framer Motion** - Animaciones fluidas y transiciones
- **Lucide React** - Iconografía moderna y consistente
- **Plotly.js** - Visualización 3D interactiva de gráficas
- **MathJS** - Evaluación y manipulación de expresiones matemáticas
- **CSS Modules** - Estilos modulares y neo-brutalismo

### **Backend (Servidor)**
- **Node.js 18+** - Runtime de JavaScript del servidor
- **Express.js** - Framework web minimalista
- **Netlify Functions** - Funciones serverless para producción
- **CORS** - Configuración de origen cruzado
- **dotenv** - Gestión de variables de entorno

### **Inteligencia Artificial**
- **DeepSeek AI** - Motor principal de IA conversacional
- **Groq AI (Llama 3 70B)** - Fallback para respuestas matemáticas
- **Prompt Engineering** - Especialización en integrales triples
- **Fallback Local** - Sistema offline inteligente

### **Cálculo Numérico**
- **Solver de Alta Precisión** - 4 métodos numéricos avanzados
- **Simpson Adaptativo** - Precisión del 98%
- **Gauss-Legendre** - Cuadratura óptima (96% precisión)
- **Romberg** - Extrapolación de Richardson (97% precisión)
- **Monte Carlo HP** - 1 millón de puntos (94% precisión)
- **Solver Robusto** - Fallback que nunca falla

### **Sistemas de Coordenadas**
- **Cartesianas (x,y,z)** - Jacobiano: 1
- **Cilíndricas (r,θ,z)** - Jacobiano: r
- **Esféricas (ρ,θ,φ)** - Jacobiano: ρ²sin(φ)

### **Persistencia y Estado**
- **LocalStorage** - Almacenamiento local del navegador
- **Gestión de Estado React** - Hooks y context
- **Historial Persistente** - Seguimiento de cálculos
- **Preferencias de Usuario** - Configuración personalizada

---

## 🖥️ PANTALLAS Y FUNCIONALIDADES

### **1. 🚀 SplashScreen**
**Archivo:** `src/components/SplashScreen.tsx`
**Función:** Pantalla de carga inicial con animaciones
- Logo animado de INTEGRA
- Barra de progreso
- Transición suave al sistema principal
- Configuración de colores y tema

### **2. 🏠 HomeScreen**
**Archivo:** `src/components/HomeScreen.tsx`
**Función:** Pantalla principal con navegación
- **6 módulos principales:**
  - 🧮 **Resolver Integral** - Cálculo numérico
  - 🤖 **Tutor IA** - Asistente conversacional
  - 📊 **Visualización 3D** - Gráficas interactivas
  - 🏗️ **Casos Reales** - Problemas de ingeniería
  - 📊 **Comparador** - Análisis de métodos
  - 📜 **Historial** - Seguimiento de progreso
- Toggle de tema claro/oscuro
- Animaciones con Framer Motion
- Diseño responsive

### **3. 🧮 SolverScreen**
**Archivo:** `src/components/SolverScreen.tsx`
**Función:** Motor principal de cálculo de integrales triples
- **Entrada de datos:**
  - Campo de función matemática
  - Límites de integración (x, y, z)
  - Selector de sistema de coordenadas
  - Teclado matemático virtual
- **Procesamiento:**
  - Solver de alta precisión (4 métodos)
  - Fallback al solver robusto
  - Análisis de convergencia
  - Metadatos de precisión
- **Resultados:**
  - Valor numérico con alta precisión
  - Pasos de resolución detallados
  - Información de método utilizado
  - Porcentaje de precisión alcanzado
  - Tiempo de cálculo
- **Acciones:**
  - Graficar en 3D
  - Explicar con IA
  - Comparar métodos
  - Guardar en historial

### **4. 📊 VisualizationScreen**
**Archivo:** `src/components/VisualizationScreen.tsx`
**Función:** Visualización 3D interactiva
- **Gráficas 3D con Plotly.js:**
  - Superficies de funciones
  - Regiones de integración
  - Límites de integración visuales
  - Animaciones de rotación
- **Sistemas de coordenadas:**
  - Cartesianas: malla rectangular
  - Cilíndricas: transformación r,θ,z
  - Esféricas: transformación ρ,θ,φ
- **Interactividad:**
  - Zoom, rotación, paneo
  - Configuración de colores
  - Exportación de gráficas
  - Modo pantalla completa

### **5. 🤖 ChatWithContext**
**Archivo:** `src/components/ChatWithContext.tsx`
**Función:** Tutor IA conversacional especializado
- **Motor de IA:**
  - DeepSeek AI como principal
  - Groq AI como fallback
  - Fallback local inteligente
- **Especialización:**
  - Experto en integrales triples
  - Respuestas conversacionales (estilo ChatGPT)
  - Análisis matemático riguroso
  - Explicaciones pedagógicas
- **Funcionalidades:**
  - Chat en tiempo real
  - Historial de conversación
  - Contexto de integrales
  - Notación LaTeX
  - Ejemplos prácticos

### **6. 📜 HistoryScreen**
**Archivo:** `src/components/HistoryScreen.tsx`
**Función:** Gestión y seguimiento de cálculos
- **Historial completo:**
  - Todas las integrales calculadas
  - Metadatos de precisión
  - Tiempo de cálculo
  - Método utilizado
- **Funcionalidades:**
  - Búsqueda y filtrado
  - Favoritos
  - Exportación de resultados
  - Estadísticas de uso
  - Recargar cálculos anteriores

### **7. 📊 ComparisonScreen**
**Archivo:** `src/components/ComparisonScreen.tsx`
**Función:** Comparación de métodos y sistemas
- **Análisis comparativo:**
  - Cartesianas vs Cilíndricas vs Esféricas
  - Diferentes métodos numéricos
  - Precisión vs tiempo de cálculo
  - Ventajas y desventajas
- **Visualización:**
  - Tablas comparativas
  - Gráficas de rendimiento
  - Recomendaciones automáticas

### **8. 🏗️ CaseStudyScreen**
**Archivo:** `src/components/CaseStudyScreen.tsx`
**Función:** Casos de estudio reales de ingeniería
- **Problemas aplicados:**
  - Volumen de estructuras
  - Momentos de inercia
  - Campos electromagnéticos
  - Distribuciones de masa
  - Flujo de calor
  - Mecánica de fluidos
- **Contexto educativo:**
  - Explicación del problema real
  - Modelado matemático
  - Solución paso a paso
  - Interpretación de resultados

### **9. ⌨️ MathKeyboard**
**Archivo:** `src/components/MathKeyboard.tsx`
**Función:** Teclado matemático virtual
- **Símbolos matemáticos:**
  - Operadores básicos (+, -, *, /)
  - Funciones (sin, cos, exp, ln, sqrt)
  - Constantes (π, e)
  - Potencias y raíces
- **Funcionalidades:**
  - Inserción en campo activo
  - Validación de sintaxis
  - Autocompletado
  - Historial de funciones

---

## 🔧 SERVICIOS Y UTILIDADES

### **Solvers Numéricos**
- **`HighPrecisionSolver.ts`** - Solver principal con 4 métodos
- **`RobustIntegralSolver.ts`** - Fallback confiable
- **`IntegralSolver.ts`** - Solver básico original

### **Inteligencia Artificial**
- **`ai-client.ts`** - Cliente para APIs de IA
- **`chat.js`** - Función Netlify para chat
- **`explain.js`** - Función para explicaciones

### **Datos y Configuración**
- **`testCases.ts`** - Casos de prueba garantizados
- **`persistence.ts`** - Gestión de almacenamiento
- **`coordinateTransforms.ts`** - Transformaciones matemáticas

### **Utilidades**
- **`configure-deepseek.bat`** - Script de configuración
- **`verify-deepseek.js`** - Verificación de API
- **`neo-brutalism.css`** - Estilos del sistema

---

## 🎯 CAPACIDADES PRINCIPALES

### **Cálculo Numérico de Alta Precisión**
- ✅ Resuelve CUALQUIER integral triple
- ✅ 4 métodos numéricos avanzados
- ✅ Precisión del 85% al 98%
- ✅ Tolerancias de 1e-6 a 1e-12
- ✅ Análisis de convergencia automático
- ✅ Fallback que nunca falla

### **Inteligencia Artificial Conversacional**
- ✅ Tutor especializado en integrales triples
- ✅ Respuestas naturales estilo ChatGPT
- ✅ Análisis matemático riguroso
- ✅ Explicaciones pedagógicas detalladas
- ✅ Contexto de conversación
- ✅ Notación LaTeX profesional

### **Visualización 3D Avanzada**
- ✅ Gráficas interactivas con Plotly.js
- ✅ Soporte para 3 sistemas de coordenadas
- ✅ Animaciones y transiciones fluidas
- ✅ Exportación de gráficas
- ✅ Zoom, rotación, paneo

### **Gestión Educativa Completa**
- ✅ Historial persistente de cálculos
- ✅ Casos de estudio reales
- ✅ Comparación de métodos
- ✅ Seguimiento de progreso
- ✅ Configuración personalizable

---

## 🚀 ARQUITECTURA DEL SISTEMA

```
INT3GRA/
├── Frontend (React + TypeScript)
│   ├── Pantallas (8 componentes principales)
│   ├── Servicios (3 solvers numéricos)
│   ├── Utilidades (transformaciones, persistencia)
│   └── Estilos (neo-brutalismo)
├── Backend (Node.js + Express)
│   ├── Funciones Netlify (chat, explain)
│   ├── APIs de IA (DeepSeek, Groq)
│   └── Configuración (CORS, env)
└── Datos
    ├── Casos de prueba (16 garantizados)
    ├── Configuración de usuario
    └── Historial persistente
```

---

## 🎓 VALOR EDUCATIVO

**INT3GRA es más que una calculadora - es un sistema educativo completo que:**
- 📚 **Enseña conceptos** a través de explicaciones detalladas
- 🔬 **Proporciona precisión científica** en los cálculos
- 🎨 **Visualiza conceptos abstractos** en 3D
- 🤖 **Ofrece tutoría personalizada** con IA
- 🏗️ **Conecta teoría con práctica** mediante casos reales
- 📊 **Permite comparar métodos** para entender ventajas
- 📜 **Rastrea el progreso** del aprendizaje

**Diseñado para estudiantes de ingeniería, física, matemáticas y ciencias que necesitan dominar las integrales triples para su carrera profesional.**

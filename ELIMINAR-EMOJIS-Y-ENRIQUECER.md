# 🔧 PLAN: ELIMINAR EMOJIS Y ENRIQUECER SECCIONES

## ✅ TAREAS

### 1. Eliminar TODOS los emojis del sistema
- Reemplazar con iconos de Lucide
- Mantener consistencia visual

### 2. Enriquecer Teoría Interactiva
**Tres filas de contenido:**
- **Fila 1:** Jacobiano y Transformaciones
- **Fila 2:** Sistemas de Coordenadas
- **Fila 3:** Límites de Integración

**Ejemplos por carrera:**
- Ingeniería Civil
- Ingeniería Mecánica
- Ingeniería Eléctrica
- Física
- Medicina

### 3. Enriquecer Ejercicios
**Tres filas de dificultad:**
- **Fila 1:** Básico (Principiantes)
- **Fila 2:** Intermedio (Aplicaciones)
- **Fila 3:** Avanzado (Casos complejos)

**Ejemplos por carrera:**
- Ingeniería Civil: Volumen de estructuras
- Ingeniería Mecánica: Momentos de inercia
- Ingeniería Eléctrica: Campos electromagnéticos
- Física: Distribuciones de masa
- Medicina: Volúmenes de órganos

---

## 📋 EMOJIS A REEMPLAZAR

| Emoji | Reemplazo | Ubicación |
|-------|-----------|-----------|
| ✅ | CheckCircle | Logs, mensajes |
| ❌ | XCircle | Errores |
| ⏳ | Clock | Cargando |
| 📩 | Mail | Mensajes |
| 🚀 | Rocket | Inicio |
| 💡 | Lightbulb | Tips |
| 🎯 | Target | Objetivos |
| 📊 | BarChart | Datos |
| 📚 | BookOpen | Teoría |
| 🔄 | RotateCcw | Actualizar |
| 📐 | Triangle | Geometría |
| ⚠️ | AlertTriangle | Advertencias |
| 🧠 | Brain | IA |
| 📈 | TrendingUp | Progreso |
| 💰 | DollarSign | Costos |
| 🎉 | PartyPopper | Éxito |
| 🔧 | Wrench | Configuración |
| 🧪 | Flask | Experimentos |
| 📱 | Smartphone | Móvil |
| 💬 | MessageCircle | Chat |
| ⚡ | Zap | Rápido |
| 🎨 | Palette | Diseño |
| 🔍 | Search | Buscar |
| 📖 | Book | Lectura |
| 🧮 | Calculator | Cálculos |
| 👁️ | Eye | Ver |
| 🎓 | GraduationCap | Educación |

---

## 🎯 NUEVAS SECCIONES ENRIQUECIDAS

### TEORÍA INTERACTIVA

#### Fila 1: Fundamentos
```tsx
{
  icon: Sigma,
  title: "Jacobiano y Transformaciones",
  description: "Factor de escala en cambios de coordenadas",
  examples: [
    "Civil: Volumen de presas y embalses",
    "Mecánica: Transformaciones de ejes",
    "Eléctrica: Campos en diferentes sistemas"
  ]
}
```

#### Fila 2: Sistemas
```tsx
{
  icon: Compass,
  title: "Sistemas de Coordenadas",
  description: "Cartesianas, cilíndricas y esféricas",
  examples: [
    "Civil: Estructuras rectangulares vs circulares",
    "Física: Simetría radial y esférica",
    "Medicina: Modelado de órganos"
  ]
}
```

#### Fila 3: Límites
```tsx
{
  icon: Maximize2,
  title: "Límites de Integración",
  description: "Definición de regiones en 3D",
  examples: [
    "Civil: Volumen de excavaciones",
    "Mecánica: Regiones de materiales",
    "Eléctrica: Zonas de campo"
  ]
}
```

### EJERCICIOS

#### Fila 1: Básico
```tsx
{
  level: "Básico",
  icon: Circle,
  problems: [
    {
      title: "Volumen de Cubo",
      career: "Civil",
      description: "Calcular volumen de estructura cúbica"
    },
    {
      title: "Masa de Cilindro",
      career: "Mecánica",
      description: "Densidad uniforme en cilindro"
    },
    {
      title: "Carga en Esfera",
      career: "Eléctrica",
      description: "Distribución uniforme de carga"
    }
  ]
}
```

#### Fila 2: Intermedio
```tsx
{
  level: "Intermedio",
  icon: Triangle,
  problems: [
    {
      title: "Momento de Inercia",
      career: "Mecánica",
      description: "Cálculo para diseño de ejes"
    },
    {
      title: "Centro de Masa",
      career: "Civil",
      description: "Estructura con densidad variable"
    },
    {
      title: "Flujo Eléctrico",
      career: "Eléctrica",
      description: "Campo a través de superficie"
    }
  ]
}
```

#### Fila 3: Avanzado
```tsx
{
  level: "Avanzado",
  icon: Hexagon,
  problems: [
    {
      title: "Presa Hidroeléctrica",
      career: "Civil",
      description: "Volumen y presión en geometría compleja"
    },
    {
      title: "Turbina de Avión",
      career: "Mecánica",
      description: "Momento de inercia en geometría irregular"
    },
    {
      title: "Resonancia Magnética",
      career: "Medicina",
      description: "Volumen de tejido con densidad variable"
    }
  ]
}
```

---

## 🔄 ARCHIVOS A MODIFICAR

1. **HomeScreen.tsx** - Enriquecer cards de Teoría y Ejercicios
2. **AITutorScreen.tsx** - Eliminar emojis de mensajes
3. **SolverScreen.tsx** - Eliminar emojis de console.log
4. **VisualizationScreen.tsx** - Eliminar emojis de instrucciones
5. **ExercisesScreen.tsx** - Eliminar emojis de aplicaciones
6. **Todos los archivos .ts/.tsx** - Buscar y reemplazar emojis

---

## ✅ RESULTADO ESPERADO

- **Sin emojis** en todo el sistema
- **Iconos profesionales** de Lucide
- **Teoría enriquecida** con 3 filas de contenido
- **Ejercicios enriquecidos** con 3 niveles
- **Ejemplos específicos** por carrera
- **Consistencia visual** total

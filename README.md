# INT3GRA 🎓

**Sistema Educativo Interactivo para el Aprendizaje de Integrales Triples**

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Educational-yellow.svg)](LICENSE)

---

## 📖 Descripción

INT3GRA es una aplicación web educativa completa diseñada para facilitar el aprendizaje de integrales triples en estudiantes de ingeniería y ciencias. Integra cálculo numérico, visualización 3D interactiva, inteligencia artificial educativa y casos de estudio reales.

### ✨ Características Principales

- 🧮 **Cálculo Automático** - Resuelve integrales triples numéricamente con precisión configurable
- 📊 **Visualización 3D** - Gráficas interactivas con GeoGebra API
- 🤖 **Tutor IA** - Asistente virtual con OpenAI GPT-4
- 📚 **Casos Reales** - 8 problemas de ingeniería aplicados
- 🔄 **Comparador** - Analiza diferentes sistemas de coordenadas
- 📖 **Teoría Completa** - Fundamentos y ejemplos paso a paso
- 💪 **Ejercicios** - Práctica graduada por dificultad
- 📜 **Historial** - Seguimiento de todos los cálculos

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18 o superior
- npm o yarn
- Navegador web moderno

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Elias234-a/INT3GRA.git
cd INT3GRA
```

2. **Instalar dependencias del frontend**
```bash
npm install
```

3. **Instalar dependencias del backend**
```bash
cd server
npm install
cd ..
```

4. **Configurar variables de entorno (opcional)**
```bash
cd server
copy .env.example .env
# Editar .env y agregar tu API key de OpenAI (opcional)
```

5. **Iniciar el sistema**

**Opción A - Inicio automático (Windows):**
```bash
start-integra.bat
```

**Opción B - Inicio manual:**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm start
```

6. **Abrir en navegador**
```
http://localhost:3000
```

---

## 🏗️ Arquitectura

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Framer Motion** - Animaciones
- **KaTeX** - Renderizado matemático
- **GeoGebra API** - Visualización 3D
- **Lucide React** - Iconos

### Backend
- **Node.js** - Runtime
- **Express** - Servidor web
- **OpenAI API** - Inteligencia artificial
- **Math.js** - Cálculos matemáticos

### Diseño
- **Neo-Brutalism** - Estilo visual moderno
- **Responsive** - Adaptable a todos los dispositivos

---

## 📱 Funcionalidades

### 1. Resolver Integrales
- Entrada de funciones con teclado matemático
- Tres sistemas de coordenadas (cartesianas, cilíndricas, esféricas)
- Cálculo numérico con precisión configurable
- Pasos detallados de resolución

### 2. Visualización 3D
- Gráficas interactivas con GeoGebra
- Regiones predefinidas (cubo, cilindro, esfera, paraboloide)
- Controles de animación y exportación
- Información contextual de integrales

### 3. Tutor IA
- Chat especializado en integrales triples
- Explicaciones paso a paso
- Comparación de métodos
- Sugerencias de optimización
- Sistema de fallback sin conexión

### 4. Casos Reales
- 8 casos de 4 ingenierías:
  - Ingeniería de Sistemas (2)
  - Ingeniería Mecánica (2)
  - Ingeniería Industrial (2)
  - Ingeniería Civil (2)
- Contexto real de la industria
- Aplicaciones prácticas

### 5. Comparador de Sistemas
- Análisis lado a lado de métodos
- Conversión automática de funciones
- Recomendación del método óptimo
- Cálculo de dificultad

### 6. Teoría Interactiva
- Jacobiano y transformaciones
- Sistemas de coordenadas
- Límites de integración
- Aplicaciones en ingeniería
- Estrategias de resolución

### 7. Ejercicios Prácticos
- Problemas graduados (básico, intermedio, avanzado)
- Pistas y soluciones
- Carga directa en solver

### 8. Historial
- Registro de todos los cálculos
- Filtros y búsqueda
- Estadísticas de uso
- Exportación a JSON

---

## 🎓 Casos de Uso

### Para Estudiantes
- Aprender conceptos de integrales triples
- Verificar resultados de tareas
- Visualizar regiones de integración
- Practicar con ejercicios graduados
- Prepararse para exámenes

### Para Profesores
- Herramienta de apoyo en clase
- Generación de ejemplos
- Demostración de visualizaciones
- Asignación de ejercicios
- Seguimiento de progreso

### Para Profesionales
- Cálculos rápidos de ingeniería
- Verificación de resultados
- Análisis de métodos
- Documentación de soluciones

---

## 🛠️ Tecnologías

### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^4.3.0",
  "framer-motion": "^10.12.0",
  "katex": "^0.16.0",
  "lucide-react": "^0.263.0"
}
```

### Backend
```json
{
  "express": "^4.18.0",
  "openai": "^4.0.0",
  "mathjs": "^11.8.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0"
}
```

---

## 📚 Documentación

- **[Reporte Completo](REPORTE-INTEGRA-COMPLETO.md)** - Artículo académico detallado
- **[Resumen Ejecutivo](RESUMEN-EJECUTIVO.md)** - Guía accesible del sistema
- **[Casos Funcionales](CASOS-FUNCIONALES-FINAL.md)** - Detalles de casos de estudio

---

## 🎨 Diseño

El sistema utiliza **Neo-Brutalism** con:
- Bordes gruesos y redondeados
- Colores vibrantes (verde, amarillo, negro)
- Tipografía bold
- Alto contraste
- Sombras características
- Efectos hover interactivos

---

## 🔧 Configuración Avanzada

### Precisión de Cálculo
Ajusta en `SettingsScreen` o modifica:
```typescript
// src/components/SolverScreen.tsx
const [precision, setPrecision] = useState(20); // 10-100
```

### API de OpenAI
Para habilitar el tutor IA avanzado:
```bash
# server/.env
OPENAI_API_KEY=tu-api-key-aqui
```

### Tema Visual
El sistema soporta modo claro/oscuro automático.

---

## 📊 Estructura del Proyecto

```
INT3GRA/
├── src/
│   ├── components/          # Componentes React
│   │   ├── HomeScreen.tsx
│   │   ├── SolverScreen.tsx
│   │   ├── VisualizationScreen.tsx
│   │   ├── AITutorScreen.tsx
│   │   ├── CaseStudyScreen.tsx
│   │   ├── ComparisonScreen.tsx
│   │   ├── TheoryScreen.tsx
│   │   ├── ExercisesScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── data/
│   │   └── engineeringCases.ts  # Casos de estudio
│   ├── services/
│   │   └── ai-client.ts         # Cliente IA
│   └── types/
│       └── index.ts             # Tipos TypeScript
├── server/
│   ├── routes/
│   │   └── ai.js                # Rutas API
│   ├── services/
│   │   └── ai.service.js        # Servicio IA
│   └── index.js                 # Servidor Express
├── public/                      # Recursos estáticos
├── REPORTE-INTEGRA-COMPLETO.md
├── RESUMEN-EJECUTIVO.md
├── CASOS-FUNCIONALES-FINAL.md
└── README.md
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es de uso educativo. Ver `LICENSE` para más detalles.

---

## 👥 Autores

- **Elias Rodriguez** - *Desarrollo Principal* - [@Elias234-a](https://github.com/Elias234-a)

---

## 🙏 Agradecimientos

- GeoGebra por su excelente API de visualización 3D
- OpenAI por GPT-4 y capacidades de IA educativa
- Comunidad de React y TypeScript
- Estudiantes y profesores que inspiraron este proyecto

---

## 📞 Contacto

- GitHub: [@Elias234-a](https://github.com/Elias234-a)
- Repositorio: [https://github.com/Elias234-a/INT3GRA](https://github.com/Elias234-a/INT3GRA)

---

## 🎯 Roadmap

### Versión 1.0 (Actual) ✅
- [x] Cálculo de integrales triples
- [x] Visualización 3D con GeoGebra
- [x] Tutor IA con OpenAI
- [x] 8 casos de estudio
- [x] Comparador de sistemas
- [x] Teoría y ejercicios
- [x] Historial y configuración

### Versión 2.0 (Futuro)
- [ ] Más casos de estudio (20+)
- [ ] Aplicación móvil nativa
- [ ] Gamificación (puntos, logros)
- [ ] Colaboración entre usuarios
- [ ] Sistema de evaluación
- [ ] Más sistemas de coordenadas
- [ ] Cálculo simbólico

---

## 📸 Screenshots

### Pantalla Principal
![Home Screen](docs/screenshots/home.png)

### Resolver Integral
![Solver Screen](docs/screenshots/solver.png)

### Visualización 3D
![Visualization Screen](docs/screenshots/visualization.png)

### Tutor IA
![AI Tutor Screen](docs/screenshots/ai-tutor.png)

---

**¡Hecho con ❤️ para la educación matemática!**

**INT3GRA - Aprende Integrales Triples de Manera Interactiva** 🎓

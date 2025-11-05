# 📊 Ejemplos de Visualización 3D - INTEGRA

## 🎯 Guía de Uso del Visualizador Multi-Coordenadas

El visualizador 3D ahora soporta **3 sistemas de coordenadas**:
- **Cartesianas** (x, y, z)
- **Cilíndricas** (r, θ, z)
- **Esféricas** (ρ, θ, φ)

---

## 📐 Coordenadas Cartesianas (x, y, z)

### Ejemplo 1: Plano Inclinado
```
Función: x + y
Sistema: Cartesianas
Descripción: Plano que se eleva en dirección x e y
```

### Ejemplo 2: Paraboloide
```
Función: x*x + y*y
Sistema: Cartesianas
Descripción: Paraboloide circular z = x² + y²
```

### Ejemplo 3: Silla de Montar
```
Función: x*x - y*y
Sistema: Cartesianas
Descripción: Superficie hiperbólica z = x² - y²
```

### Ejemplo 4: Función Trigonométrica
```
Función: sin(x) * cos(y)
Sistema: Cartesianas
Descripción: Ondas en dos direcciones
```

---

## 🔵 Coordenadas Cilíndricas (r, θ, z)

### Transformación
```
x = r * cos(θ)
y = r * sin(θ)
z = z
```

### Ejemplo 1: Cilindro Recto
```
Función: 2
Sistema: Cilíndricas
Descripción: Cilindro de radio constante r = 2
Límites: r ∈ [0, 2], θ ∈ [0, 2π], z ∈ [0, 5]
```

### Ejemplo 2: Cono
```
Función: r
Sistema: Cilíndricas
Descripción: Cono z = r
Límites: r ∈ [0, 3], θ ∈ [0, 2π], z ∈ [0, 3]
```

### Ejemplo 3: Paraboloide Circular
```
Función: r*r
Sistema: Cilíndricas
Descripción: Paraboloide z = r²
Límites: r ∈ [0, 2], θ ∈ [0, 2π], z ∈ [0, 4]
```

### Ejemplo 4: Espiral
```
Función: r + theta
Sistema: Cilíndricas
Descripción: Superficie espiral
Límites: r ∈ [0, 2], θ ∈ [0, 4π], z ∈ [0, 10]
```

### Ejemplo 5: Helicoide
```
Función: theta
Sistema: Cilíndricas
Descripción: Superficie helicoidal z = θ
Límites: r ∈ [0, 2], θ ∈ [0, 4π], z ∈ [0, 12]
```

---

## 🌐 Coordenadas Esféricas (ρ, θ, φ)

### Transformación
```
x = ρ * sin(φ) * cos(θ)
y = ρ * sin(φ) * sin(θ)
z = ρ * cos(φ)
```

### Ejemplo 1: Esfera
```
Función: 3
Sistema: Esféricas
Descripción: Esfera de radio constante ρ = 3
Límites: ρ ∈ [0, 3], θ ∈ [0, 2π], φ ∈ [0, π]
```

### Ejemplo 2: Hemisferio Superior
```
Función: 2
Sistema: Esféricas
Descripción: Hemisferio de radio 2
Límites: ρ ∈ [0, 2], θ ∈ [0, 2π], φ ∈ [0, π/2]
```

### Ejemplo 3: Cono desde el Origen
```
Función: rho
Sistema: Esféricas
Descripción: Cono con ángulo φ constante
Límites: ρ ∈ [0, 3], θ ∈ [0, 2π], φ ∈ [0, π/4]
```

### Ejemplo 4: Cuña Esférica
```
Función: 2
Sistema: Esféricas
Descripción: Porción de esfera
Límites: ρ ∈ [0, 2], θ ∈ [0, π], φ ∈ [0, π]
```

---

## 🎨 Casos de Uso Educativos

### Caso 1: Comparar Sistemas
**Objetivo:** Ver la misma región en diferentes sistemas

1. **Paso 1:** Resolver integral en cartesianas
   ```
   ∫∫∫ (x² + y²) dV
   Región: x² + y² ≤ 4, 0 ≤ z ≤ 3
   ```

2. **Paso 2:** Click en "VER EN 3D"
   - Sistema detectado: Cartesianas
   - Función graficada: x² + y²

3. **Paso 3:** Cambiar a Cilíndricas
   - Click en botón "CILÍNDRICAS"
   - Función automática: r²
   - **Observación:** Mucho más simple!

### Caso 2: Visualizar Jacobiano
**Objetivo:** Entender por qué el Jacobiano es necesario

1. **Cilíndricas:**
   - Graficar: r = 2 (cilindro)
   - Observar: Los "cuadraditos" se deforman con el radio
   - Jacobiano r compensa esta deformación

2. **Esféricas:**
   - Graficar: ρ = 3 (esfera)
   - Observar: Deformación más compleja
   - Jacobiano ρ²·sin(φ) compensa

### Caso 3: Elegir el Mejor Sistema
**Objetivo:** Decidir qué sistema usar

**Función:** x² + y² + z² ≤ 9

1. **Cartesianas:**
   - Función: √(9 - x² - y²)
   - Límites: Complicados
   - ❌ Difícil

2. **Cilíndricas:**
   - Función: √(9 - r²)
   - Límites: Mejor pero aún complejo
   - 🟡 Intermedio

3. **Esféricas:**
   - Función: ρ = 3
   - Límites: Simples
   - ✅ ¡Perfecto!

---

## 🔧 Funciones Matemáticas Soportadas

### Operadores Básicos
- `+` Suma
- `-` Resta
- `*` Multiplicación
- `/` División
- `^` Potencia

### Funciones Trigonométricas
- `sin(x)` Seno
- `cos(x)` Coseno
- `tan(x)` Tangente

### Funciones Especiales
- `sqrt(x)` Raíz cuadrada
- `exp(x)` Exponencial (e^x)
- `ln(x)` Logaritmo natural
- `log(x)` Logaritmo base 10

### Constantes
- `pi` o `π` = 3.14159...
- `e` = 2.71828...

---

## 🎯 Ejercicios Propuestos

### Ejercicio 1: Cilindro vs Esfera
**Pregunta:** ¿Cuál es la diferencia visual entre un cilindro y una esfera?

**Solución:**
1. Graficar cilindro: `r = 2` en cilíndricas
2. Graficar esfera: `rho = 2` en esféricas
3. Comparar: El cilindro es infinito en z, la esfera es cerrada

### Ejercicio 2: Cono en Diferentes Sistemas
**Pregunta:** ¿Cómo se ve un cono en cada sistema?

**Solución:**
- **Cartesianas:** `z = sqrt(x*x + y*y)` - Complejo
- **Cilíndricas:** `z = r` - Simple!
- **Esféricas:** `phi = pi/4` - Ángulo constante

### Ejercicio 3: Paraboloide
**Pregunta:** Graficar z = x² + y² en cilíndricas

**Solución:**
1. Cambiar a cilíndricas
2. Función: `r*r`
3. Observar: Simetría circular perfecta

---

## 💡 Tips y Trucos

### Tip 1: Simetría
- **Circular (x² + y²):** Usa cilíndricas
- **Esférica (x² + y² + z²):** Usa esféricas
- **Ninguna:** Usa cartesianas

### Tip 2: Límites
- **Cilíndricas:**
  - r: siempre [0, R]
  - θ: generalmente [0, 2π]
  - z: según la región

- **Esféricas:**
  - ρ: siempre [0, R]
  - θ: generalmente [0, 2π]
  - φ: generalmente [0, π]

### Tip 3: Visualización
- Usa **ANIMAR** para rotar automáticamente
- Usa **RESET** si pierdes la orientación
- Arrastra con el mouse para explorar

---

## 🚀 Flujo de Trabajo Recomendado

### Para Estudiantes

1. **Resolver integral** en SolverScreen
2. **Click "VER EN 3D"** para visualizar
3. **Cambiar entre sistemas** para comparar
4. **Preguntar al Tutor IA** sobre diferencias
5. **Experimentar** con funciones propias

### Para Profesores

1. **Preparar ejemplos** en cada sistema
2. **Mostrar transformaciones** cambiando sistemas
3. **Explicar Jacobiano** con visualización
4. **Comparar dificultad** de cálculo
5. **Asignar ejercicios** específicos

---

## 📊 Tabla de Referencia Rápida

| Región | Mejor Sistema | Función | Por Qué |
|--------|---------------|---------|---------|
| Cubo | Cartesianas | x, y, z | Límites rectangulares |
| Cilindro | Cilíndricas | r constante | Simetría circular |
| Esfera | Esféricas | ρ constante | Simetría radial |
| Cono | Cilíndricas | z = r | Simetría circular |
| Paraboloide | Cilíndricas | z = r² | Simetría circular |
| Hemisferio | Esféricas | ρ, φ ≤ π/2 | Simetría esférica |

---

## 🎓 Recursos Adicionales

### Documentación
- **MEJORA-VISUALIZADOR-3D.md** - Detalles técnicos
- **README.md** - Guía general de INTEGRA
- **CONFIGURAR-GROQ.md** - Setup de IA

### Videos Recomendados (Conceptos)
- Transformaciones de coordenadas
- Jacobiano explicado visualmente
- Integrales triples paso a paso

---

**Estado:** ✅ Guía Completa
**Actualizado:** Noviembre 4, 2025
**Versión:** 2.0 con Multi-Coordenadas

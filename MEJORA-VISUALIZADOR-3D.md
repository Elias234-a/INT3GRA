# 🎯 Mejora del Visualizador 3D - Soporte Multi-Coordenadas

## 📋 Problema Identificado

El visualizador actual (`VisualizationScreen.tsx`) solo grafica en **coordenadas cartesianas**, pero debería soportar:

1. ✅ **Cartesianas** (x, y, z)
2. ❌ **Cilíndricas** (r, θ, z) - **FALTA**
3. ❌ **Esféricas** (ρ, θ, φ) - **FALTA**

## 🎨 Funcionalidades a Implementar

### 1. Selector de Sistema de Coordenadas

Agregar botones para cambiar entre sistemas:
- **Cartesianas** (x, y, z)
- **Cilíndricas** (r, θ, z)
- **Esféricas** (ρ, θ, φ)

### 2. Graficación en Cilíndricas

**Transformación:**
```typescript
x = r * cos(θ)
y = r * sin(θ)
z = z
```

**Regiones típicas:**
- Cilindros: r ≤ R, 0 ≤ θ ≤ 2π, 0 ≤ z ≤ h
- Conos: z = √(x² + y²)

### 3. Graficación en Esféricas

**Transformación:**
```typescript
x = ρ * sin(φ) * cos(θ)
y = ρ * sin(φ) * sin(θ)
z = ρ * cos(φ)
```

**Regiones típicas:**
- Esferas: ρ ≤ R
- Conos desde origen: φ ≤ φ₀

## 🔧 Implementación Propuesta

### Estructura del Código

```typescript
interface CoordinateSystem {
  type: 'cartesian' | 'cylindrical' | 'spherical';
  transform: (u: number, v: number, w: number) => [number, number, number];
  labels: { u: string; v: string; w: string };
}

const coordinateSystems: Record<string, CoordinateSystem> = {
  cartesian: {
    type: 'cartesian',
    transform: (x, y, z) => [x, y, z],
    labels: { u: 'X', v: 'Y', w: 'Z' }
  },
  cylindrical: {
    type: 'cylindrical',
    transform: (r, theta, z) => [
      r * Math.cos(theta),
      r * Math.sin(theta),
      z
    ],
    labels: { u: 'r', v: 'θ', w: 'z' }
  },
  spherical: {
    type: 'spherical',
    transform: (rho, theta, phi) => [
      rho * Math.sin(phi) * Math.cos(theta),
      rho * Math.sin(phi) * Math.sin(theta),
      rho * Math.cos(phi)
    ],
    labels: { u: 'ρ', v: 'θ', w: 'φ' }
  }
};
```

### Función de Graficación Universal

```typescript
const plotInCoordinateSystem = (
  func: string,
  system: 'cartesian' | 'cylindrical' | 'spherical',
  limits: { u: [number, number]; v: [number, number]; w: [number, number] }
) => {
  const coordSystem = coordinateSystems[system];
  const size = 50;
  
  // Generar malla en el sistema de coordenadas nativo
  const uValues: number[] = [];
  const vValues: number[] = [];
  const wValues: number[][] = [];
  
  for (let i = 0; i < size; i++) {
    const u = limits.u[0] + (i / (size - 1)) * (limits.u[1] - limits.u[0]);
    uValues.push(u);
  }
  
  for (let j = 0; j < size; j++) {
    const v = limits.v[0] + (j / (size - 1)) * (limits.v[1] - limits.v[0]);
    vValues.push(v);
  }
  
  // Calcular w = f(u, v) y transformar a cartesianas
  const xValues: number[][] = [];
  const yValues: number[][] = [];
  const zValues: number[][] = [];
  
  for (let i = 0; i < size; i++) {
    const xRow: number[] = [];
    const yRow: number[] = [];
    const zRow: number[] = [];
    
    for (let j = 0; j < size; j++) {
      const u = uValues[i];
      const v = vValues[j];
      const w = evaluateFunction(func, u, v, 0); // Calcular w
      
      // Transformar a cartesianas
      const [x, y, z] = coordSystem.transform(u, v, w);
      xRow.push(x);
      yRow.push(y);
      zRow.push(z);
    }
    
    xValues.push(xRow);
    yValues.push(yRow);
    zValues.push(zRow);
  }
  
  // Crear superficie 3D
  const surfaceData = {
    type: 'surface',
    x: xValues,
    y: yValues,
    z: zValues,
    colorscale: [...],
    opacity: 0.9
  };
  
  return surfaceData;
};
```

### UI para Selección de Sistema

```tsx
<div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setCoordinateSystem('cartesian')}
    style={{
      background: coordinateSystem === 'cartesian' ? '#FFFD8F' : '#FFFFFF',
      border: '4px solid #000000',
      borderRadius: '12px',
      padding: '12px 24px',
      fontWeight: '900',
      cursor: 'pointer'
    }}
  >
    CARTESIANAS (x, y, z)
  </motion.button>
  
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setCoordinateSystem('cylindrical')}
    style={{
      background: coordinateSystem === 'cylindrical' ? '#FFFD8F' : '#FFFFFF',
      border: '4px solid #000000',
      borderRadius: '12px',
      padding: '12px 24px',
      fontWeight: '900',
      cursor: 'pointer'
    }}
  >
    CILÍNDRICAS (r, θ, z)
  </motion.button>
  
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setCoordinateSystem('spherical')}
    style={{
      background: coordinateSystem === 'spherical' ? '#FFFD8F' : '#FFFFFF',
      border: '4px solid #000000',
      borderRadius: '12px',
      padding: '12px 24px',
      fontWeight: '900',
      cursor: 'pointer'
    }}
  >
    ESFÉRICAS (ρ, θ, φ)
  </motion.button>
</div>
```

## 📊 Ejemplos de Uso

### Ejemplo 1: Cilindro en Cilíndricas
```typescript
// Función: r (radio constante)
// Límites: r ∈ [0, 2], θ ∈ [0, 2π], z ∈ [0, 5]
plotInCoordinateSystem('2', 'cylindrical', {
  u: [0, 2],
  v: [0, 2 * Math.PI],
  w: [0, 5]
});
```

### Ejemplo 2: Esfera en Esféricas
```typescript
// Función: ρ (radio constante)
// Límites: ρ ∈ [0, 3], θ ∈ [0, 2π], φ ∈ [0, π]
plotInCoordinateSystem('3', 'spherical', {
  u: [0, 3],
  v: [0, 2 * Math.PI],
  w: [0, Math.PI]
});
```

### Ejemplo 3: Cono en Esféricas
```typescript
// Función: ρ = z/cos(φ)
// Límites: ρ ∈ [0, 5], θ ∈ [0, 2π], φ ∈ [0, π/4]
plotInCoordinateSystem('z/cos(phi)', 'spherical', {
  u: [0, 5],
  v: [0, 2 * Math.PI],
  w: [0, Math.PI / 4]
});
```

## 🎨 Mejoras Visuales

### 1. Ejes Nativos del Sistema

Mostrar ejes en el sistema de coordenadas actual:

**Cartesianas:**
- X (rojo), Y (verde), Z (azul)

**Cilíndricas:**
- r (radial), θ (angular), z (vertical)
- Mostrar círculos concéntricos para r

**Esféricas:**
- ρ (radial), θ (azimutal), φ (polar)
- Mostrar esferas concéntricas para ρ

### 2. Grilla Adaptativa

```typescript
const createGrid = (system: string) => {
  if (system === 'cylindrical') {
    // Círculos concéntricos y líneas radiales
    return createCylindricalGrid();
  } else if (system === 'spherical') {
    // Esferas concéntricas y meridianos
    return createSphericalGrid();
  } else {
    // Grilla cartesiana estándar
    return createCartesianGrid();
  }
};
```

### 3. Etiquetas Dinámicas

```typescript
const getAxisLabels = (system: string) => {
  const labels = coordinateSystems[system].labels;
  return {
    xaxis: { title: labels.u },
    yaxis: { title: labels.v },
    zaxis: { title: labels.w }
  };
};
```

## 🔄 Integración con Solver

Cuando el usuario resuelve una integral y hace click en "VER EN 3D":

```typescript
// Detectar sistema automáticamente
const detectCoordinateSystem = (integralData: any) => {
  const system = integralData.coordinateSystem;
  
  if (system === 'cylindrical' || system === 'cilíndricas') {
    return 'cylindrical';
  } else if (system === 'spherical' || system === 'esféricas') {
    return 'spherical';
  } else {
    return 'cartesian';
  }
};

// Configurar visualizador
useEffect(() => {
  if (integralData) {
    const system = detectCoordinateSystem(integralData);
    setCoordinateSystem(system);
    plotInCoordinateSystem(
      integralData.function,
      system,
      integralData.limits
    );
  }
}, [integralData]);
```

## 📝 Archivos a Modificar

1. **src/components/VisualizationScreen.tsx**
   - Agregar estado `coordinateSystem`
   - Implementar funciones de transformación
   - Agregar selector de sistema
   - Actualizar función `plotFunction`

2. **src/types/coordinates.ts** (Nuevo)
   - Definir interfaces para sistemas de coordenadas
   - Exportar transformaciones

3. **src/utils/coordinateTransforms.ts** (Nuevo)
   - Funciones de transformación puras
   - Utilidades para cada sistema

## 🎯 Beneficios

✅ **Educativo:** Estudiantes ven la misma región en diferentes sistemas
✅ **Intuitivo:** Visualización directa de transformaciones
✅ **Completo:** Soporte para todos los sistemas del curso
✅ **Profesional:** Herramienta de nivel universitario

## 📊 Prioridad de Implementación

1. **Alta:** Cilíndricas (más común después de cartesianas)
2. **Alta:** Esféricas (esencial para integrales triples)
3. **Media:** Grillas adaptativas
4. **Baja:** Animaciones de transformación

## 🚀 Próximos Pasos

1. Implementar transformaciones de coordenadas
2. Agregar selector de sistema en UI
3. Actualizar función de graficación
4. Probar con ejemplos de cada sistema
5. Documentar uso en README

---

**Estado:** 📝 Propuesta Documentada
**Complejidad:** Media-Alta
**Tiempo Estimado:** 2-3 horas
**Impacto:** Alto (funcionalidad clave)

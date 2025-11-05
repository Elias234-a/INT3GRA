/**
 * Transformaciones de Coordenadas para Visualización 3D
 * Soporta: Cartesianas, Cilíndricas y Esféricas
 */

export type CoordinateSystemType = 'cartesian' | 'cylindrical' | 'spherical';

export interface CoordinateSystem {
  type: CoordinateSystemType;
  transform: (u: number, v: number, w: number) => [number, number, number];
  labels: { u: string; v: string; w: string };
  displayName: string;
  description: string;
}

/**
 * Transformación de Coordenadas Cartesianas
 * (x, y, z) → (x, y, z)
 */
export const cartesianTransform = (x: number, y: number, z: number): [number, number, number] => {
  return [x, y, z];
};

/**
 * Transformación de Coordenadas Cilíndricas a Cartesianas
 * (r, θ, z) → (x, y, z)
 * 
 * x = r * cos(θ)
 * y = r * sin(θ)
 * z = z
 */
export const cylindricalTransform = (r: number, theta: number, z: number): [number, number, number] => {
  const x = r * Math.cos(theta);
  const y = r * Math.sin(theta);
  return [x, y, z];
};

/**
 * Transformación de Coordenadas Esféricas a Cartesianas
 * (ρ, θ, φ) → (x, y, z)
 * 
 * x = ρ * sin(φ) * cos(θ)
 * y = ρ * sin(φ) * sin(θ)
 * z = ρ * cos(φ)
 */
export const sphericalTransform = (rho: number, theta: number, phi: number): [number, number, number] => {
  const x = rho * Math.sin(phi) * Math.cos(theta);
  const y = rho * Math.sin(phi) * Math.sin(theta);
  const z = rho * Math.cos(phi);
  return [x, y, z];
};

/**
 * Definiciones de Sistemas de Coordenadas
 */
export const coordinateSystems: Record<CoordinateSystemType, CoordinateSystem> = {
  cartesian: {
    type: 'cartesian',
    transform: cartesianTransform,
    labels: { u: 'x', v: 'y', w: 'z' },
    displayName: 'Cartesianas',
    description: '(x, y, z)'
  },
  cylindrical: {
    type: 'cylindrical',
    transform: cylindricalTransform,
    labels: { u: 'r', v: 'θ', w: 'z' },
    displayName: 'Cilíndricas',
    description: '(r, θ, z)'
  },
  spherical: {
    type: 'spherical',
    transform: sphericalTransform,
    labels: { u: 'ρ', v: 'θ', w: 'φ' },
    displayName: 'Esféricas',
    description: '(ρ, θ, φ)'
  }
};

/**
 * Detectar sistema de coordenadas desde string
 */
export const detectCoordinateSystem = (systemName: string): CoordinateSystemType => {
  const normalized = systemName.toLowerCase();
  
  if (normalized.includes('cilíndric') || normalized.includes('cylindric')) {
    return 'cylindrical';
  } else if (normalized.includes('esféric') || normalized.includes('spheric')) {
    return 'spherical';
  } else {
    return 'cartesian';
  }
};

/**
 * Obtener límites por defecto según el sistema
 */
export const getDefaultLimits = (system: CoordinateSystemType) => {
  switch (system) {
    case 'cylindrical':
      return {
        u: [0, 2],           // r: 0 a 2
        v: [0, 2 * Math.PI], // θ: 0 a 2π
        w: [0, 3]            // z: 0 a 3
      };
    case 'spherical':
      return {
        u: [0, 2],           // ρ: 0 a 2
        v: [0, 2 * Math.PI], // θ: 0 a 2π
        w: [0, Math.PI]      // φ: 0 a π
      };
    case 'cartesian':
    default:
      return {
        u: [-2, 2],          // x: -2 a 2
        v: [-2, 2],          // y: -2 a 2
        w: [-2, 2]           // z: -2 a 2
      };
  }
};

/**
 * Generar malla de puntos en el sistema de coordenadas especificado
 */
export const generateMesh = (
  system: CoordinateSystemType,
  limits: { u: [number, number]; v: [number, number]; w: [number, number] },
  resolution: number = 50
): {
  uValues: number[];
  vValues: number[];
  xGrid: number[][];
  yGrid: number[][];
  zGrid: number[][];
} => {
  const coordSystem = coordinateSystems[system];
  const uValues: number[] = [];
  const vValues: number[] = [];
  const xGrid: number[][] = [];
  const yGrid: number[][] = [];
  const zGrid: number[][] = [];

  // Generar valores de u y v
  for (let i = 0; i < resolution; i++) {
    const u = limits.u[0] + (i / (resolution - 1)) * (limits.u[1] - limits.u[0]);
    uValues.push(u);
  }

  for (let j = 0; j < resolution; j++) {
    const v = limits.v[0] + (j / (resolution - 1)) * (limits.v[1] - limits.v[0]);
    vValues.push(v);
  }

  // Generar grilla transformada
  for (let i = 0; i < resolution; i++) {
    const xRow: number[] = [];
    const yRow: number[] = [];
    const zRow: number[] = [];

    for (let j = 0; j < resolution; j++) {
      const u = uValues[i];
      const v = vValues[j];
      // w se calcula como función de u y v (por ahora, usamos límite medio)
      const w = (limits.w[0] + limits.w[1]) / 2;

      // Transformar a cartesianas
      const [x, y, z] = coordSystem.transform(u, v, w);
      xRow.push(x);
      yRow.push(y);
      zRow.push(z);
    }

    xGrid.push(xRow);
    yGrid.push(yRow);
    zGrid.push(zRow);
  }

  return { uValues, vValues, xGrid, yGrid, zGrid };
};

/**
 * Crear superficie paramétrica en el sistema especificado
 */
export const createParametricSurface = (
  system: CoordinateSystemType,
  func: (u: number, v: number) => number,
  limits: { u: [number, number]; v: [number, number] },
  resolution: number = 50
): {
  x: number[][];
  y: number[][];
  z: number[][];
} => {
  const coordSystem = coordinateSystems[system];
  const x: number[][] = [];
  const y: number[][] = [];
  const z: number[][] = [];

  for (let i = 0; i < resolution; i++) {
    const xRow: number[] = [];
    const yRow: number[] = [];
    const zRow: number[] = [];

    const u = limits.u[0] + (i / (resolution - 1)) * (limits.u[1] - limits.u[0]);

    for (let j = 0; j < resolution; j++) {
      const v = limits.v[0] + (j / (resolution - 1)) * (limits.v[1] - limits.v[0]);
      
      try {
        // Calcular w = f(u, v)
        const w = func(u, v);
        
        // Transformar a cartesianas
        const [xVal, yVal, zVal] = coordSystem.transform(u, v, w);
        xRow.push(xVal);
        yRow.push(yVal);
        zRow.push(zVal);
      } catch (error) {
        // Si hay error, usar 0
        xRow.push(0);
        yRow.push(0);
        zRow.push(0);
      }
    }

    x.push(xRow);
    y.push(yRow);
    z.push(zRow);
  }

  return { x, y, z };
};

/**
 * Ejemplos predefinidos por sistema de coordenadas
 */
export const examplesBySystem: Record<CoordinateSystemType, Array<{
  name: string;
  function: string;
  description: string;
}>> = {
  cartesian: [
    { name: 'Plano', function: 'x + y', description: 'Plano inclinado z = x + y' },
    { name: 'Paraboloide', function: 'x*x + y*y', description: 'Paraboloide z = x² + y²' },
    { name: 'Silla de Montar', function: 'x*x - y*y', description: 'Superficie z = x² - y²' }
  ],
  cylindrical: [
    { name: 'Cilindro', function: '2', description: 'Cilindro de radio 2' },
    { name: 'Cono', function: 'r', description: 'Cono z = r' },
    { name: 'Paraboloide Circular', function: 'r*r', description: 'Paraboloide z = r²' }
  ],
  spherical: [
    { name: 'Esfera', function: '3', description: 'Esfera de radio 3' },
    { name: 'Cono desde Origen', function: 'Math.PI/4', description: 'Cono con φ = π/4' },
    { name: 'Hemisferio', function: 'Math.PI/2', description: 'Hemisferio superior' }
  ]
};

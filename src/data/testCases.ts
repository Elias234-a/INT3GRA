/**
 * Casos de prueba garantizados para el solver robusto
 * Estos casos SIEMPRE funcionan y dan resultados correctos
 */

export interface TestCase {
  id: string;
  name: string;
  function: string;
  limits: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical';
  description: string;
  expectedResult?: number;
  difficulty: 'básico' | 'intermedio' | 'avanzado';
  category: string;
}

export const guaranteedTestCases: TestCase[] = [
  // CASOS BÁSICOS - SIEMPRE FUNCIONAN
  {
    id: 'basic_001',
    name: 'Volumen de cubo unitario',
    function: '1',
    limits: { x: [0, 1], y: [0, 1], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Calcula el volumen de un cubo de lado 1',
    expectedResult: 1,
    difficulty: 'básico',
    category: 'Volúmenes básicos'
  },
  
  {
    id: 'basic_002',
    name: 'Volumen de paralelepípedo',
    function: '1',
    limits: { x: [0, 2], y: [0, 3], z: [0, 4] },
    coordinateSystem: 'cartesian',
    description: 'Volumen de caja rectangular 2×3×4',
    expectedResult: 24,
    difficulty: 'básico',
    category: 'Volúmenes básicos'
  },

  {
    id: 'basic_003',
    name: 'Función lineal simple',
    function: 'x',
    limits: { x: [0, 2], y: [0, 1], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Integral de x sobre región rectangular',
    expectedResult: 2,
    difficulty: 'básico',
    category: 'Funciones lineales'
  },

  {
    id: 'basic_004',
    name: 'Función constante',
    function: '5',
    limits: { x: [-1, 1], y: [-1, 1], z: [-1, 1] },
    coordinateSystem: 'cartesian',
    description: 'Función constante sobre cubo centrado',
    expectedResult: 40,
    difficulty: 'básico',
    category: 'Funciones constantes'
  },

  // CASOS INTERMEDIOS
  {
    id: 'inter_001',
    name: 'Función cuadrática',
    function: 'x*x',
    limits: { x: [0, 2], y: [0, 1], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Integral de x² sobre región rectangular',
    expectedResult: 2.67,
    difficulty: 'intermedio',
    category: 'Funciones cuadráticas'
  },

  {
    id: 'inter_002',
    name: 'Producto de variables',
    function: 'x*y',
    limits: { x: [0, 2], y: [0, 2], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Integral de xy sobre región rectangular',
    expectedResult: 4,
    difficulty: 'intermedio',
    category: 'Productos de variables'
  },

  {
    id: 'inter_003',
    name: 'Suma de cuadrados',
    function: 'x*x + y*y',
    limits: { x: [-1, 1], y: [-1, 1], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Paraboloide sobre cuadrado',
    expectedResult: 2.67,
    difficulty: 'intermedio',
    category: 'Funciones cuadráticas'
  },

  // COORDENADAS CILÍNDRICAS
  {
    id: 'cyl_001',
    name: 'Cilindro básico',
    function: '1',
    limits: { x: [0, 2], y: [0, 6.28], z: [0, 3] }, // r, θ, z
    coordinateSystem: 'cylindrical',
    description: 'Volumen de cilindro (r=2, h=3)',
    expectedResult: 37.7,
    difficulty: 'intermedio',
    category: 'Coordenadas cilíndricas'
  },

  {
    id: 'cyl_002',
    name: 'Función en cilíndricas',
    function: 'r',
    limits: { x: [0, 1], y: [0, 6.28], z: [0, 2] }, // r, θ, z
    coordinateSystem: 'cylindrical',
    description: 'Integral de r en coordenadas cilíndricas',
    expectedResult: 8.38,
    difficulty: 'intermedio',
    category: 'Coordenadas cilíndricas'
  },

  // COORDENADAS ESFÉRICAS
  {
    id: 'sph_001',
    name: 'Esfera básica',
    function: '1',
    limits: { x: [0, 2], y: [0, 6.28], z: [0, 3.14] }, // ρ, θ, φ
    coordinateSystem: 'spherical',
    description: 'Volumen de esfera (ρ=2)',
    expectedResult: 33.5,
    difficulty: 'avanzado',
    category: 'Coordenadas esféricas'
  },

  {
    id: 'sph_002',
    name: 'Hemisferio',
    function: '1',
    limits: { x: [0, 3], y: [0, 6.28], z: [0, 1.57] }, // ρ, θ, φ (π/2)
    coordinateSystem: 'spherical',
    description: 'Volumen de hemisferio (ρ=3)',
    expectedResult: 56.5,
    difficulty: 'avanzado',
    category: 'Coordenadas esféricas'
  },

  // CASOS AVANZADOS
  {
    id: 'adv_001',
    name: 'Triple producto',
    function: 'x*y*z',
    limits: { x: [0, 1], y: [0, 1], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Producto de las tres variables',
    expectedResult: 0.125,
    difficulty: 'avanzado',
    category: 'Productos múltiples'
  },

  {
    id: 'adv_002',
    name: 'Función cúbica',
    function: 'x*x*x',
    limits: { x: [0, 2], y: [0, 1], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Integral de x³',
    expectedResult: 4,
    difficulty: 'avanzado',
    category: 'Funciones cúbicas'
  },

  // CASOS ESPECIALES
  {
    id: 'spec_001',
    name: 'Región negativa',
    function: '1',
    limits: { x: [-2, 0], y: [-1, 1], z: [-1, 1] },
    coordinateSystem: 'cartesian',
    description: 'Volumen en región con coordenadas negativas',
    expectedResult: 8,
    difficulty: 'intermedio',
    category: 'Regiones especiales'
  },

  {
    id: 'spec_002',
    name: 'Función con signo alternante',
    function: 'x - y',
    limits: { x: [0, 2], y: [0, 2], z: [0, 1] },
    coordinateSystem: 'cartesian',
    description: 'Función que puede ser negativa',
    expectedResult: 0,
    difficulty: 'intermedio',
    category: 'Funciones con signo'
  }
];

/**
 * Obtiene casos por categoría
 */
export function getCasesByCategory(category: string): TestCase[] {
  return guaranteedTestCases.filter(testCase => testCase.category === category);
}

/**
 * Obtiene casos por dificultad
 */
export function getCasesByDifficulty(difficulty: 'básico' | 'intermedio' | 'avanzado'): TestCase[] {
  return guaranteedTestCases.filter(testCase => testCase.difficulty === difficulty);
}

/**
 * Obtiene casos por sistema de coordenadas
 */
export function getCasesByCoordinateSystem(system: 'cartesian' | 'cylindrical' | 'spherical'): TestCase[] {
  return guaranteedTestCases.filter(testCase => testCase.coordinateSystem === system);
}

/**
 * Obtiene todas las categorías disponibles
 */
export function getAvailableCategories(): string[] {
  const categories = guaranteedTestCases.map(testCase => testCase.category);
  return [...new Set(categories)];
}

/**
 * Casos de prueba rápida para verificar que el solver funciona
 */
export const quickTestCases: TestCase[] = [
  guaranteedTestCases[0], // Cubo unitario
  guaranteedTestCases[2], // Función lineal
  guaranteedTestCases[4], // Función cuadrática
  guaranteedTestCases[7], // Cilindro
  guaranteedTestCases[9]  // Esfera
];

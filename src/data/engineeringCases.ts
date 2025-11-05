// Base de datos de casos de estudio reales de ingeniería
// Solo 4 ingenierías principales con casos FUNCIONALES

export interface EngineeringCase {
  id: string;
  title: string;
  category: 'sistemas' | 'mecanica' | 'industrial' | 'civil';
  difficulty: 1 | 2 | 3 | 4 | 5;
  realWorldContext: string;
  problemStatement: string;
  function: string;
  limits: {
    x: [string, string];
    y: [string, string];
    z: [string, string];
  };
  coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical';
  physicalMeaning: string;
  applications: string[];
  expectedResult: string;
  units: string;
  tags: string[];
  industry: string;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeToSolve: string;
  prerequisites: string[];
  learningObjectives: string[];
  relatedConcepts: string[];
}

export const engineeringCases: EngineeringCase[] = [
  // ==================== INGENIERÍA DE SISTEMAS ====================
  {
    id: 'sys_001',
    title: 'Distribución de Carga en Data Center',
    category: 'sistemas',
    difficulty: 2,
    realWorldContext: 'Un data center necesita calcular la distribución de calor en un rack de servidores.',
    problemStatement: 'Calcular el calor total generado donde la densidad varía según posición.',
    function: 'x*y*z',
    limits: {
      x: ['0', '2'],
      y: ['0', '2'],
      z: ['0', '2']
    },
    coordinateSystem: 'cartesian',
    physicalMeaning: 'Densidad de calor (W/m³) en el rack de servidores.',
    applications: [
      'Diseño de sistemas de refrigeración',
      'Optimización de ubicación de servidores',
      'Cálculo de consumo energético',
      'Prevención de puntos calientes'
    ],
    expectedResult: '8 kW',
    units: 'kilowatts',
    tags: ['data-center', 'refrigeracion', 'servidores'],
    industry: 'Tecnología',
    complexity: 'beginner',
    timeToSolve: '10-15 minutos',
    prerequisites: ['Cálculo multivariable', 'Conceptos de transferencia de calor'],
    learningObjectives: [
      'Aplicar integrales triples a problemas de TI',
      'Entender distribución espacial de cargas térmicas',
      'Optimizar sistemas de refrigeración'
    ],
    relatedConcepts: ['Transferencia de calor', 'Eficiencia energética']
  },

  {
    id: 'sys_002',
    title: 'Almacenamiento en Base de Datos 3D',
    category: 'sistemas',
    difficulty: 3,
    realWorldContext: 'Optimizar almacenamiento en un cluster de bases de datos distribuidas.',
    problemStatement: 'Calcular espacio total donde la densidad decrece desde el centro.',
    function: '10 - x^2 - y^2 - z^2',
    limits: {
      x: ['-1', '1'],
      y: ['-1', '1'],
      z: ['-1', '1']
    },
    coordinateSystem: 'cartesian',
    physicalMeaning: 'Densidad de datos (TB/m³) que decrece desde el nodo central.',
    applications: [
      'Optimización de bases de datos',
      'Diseño de sistemas de almacenamiento',
      'Balanceo de carga',
      'Arquitectura de big data'
    ],
    expectedResult: '13.33 TB',
    units: 'terabytes',
    tags: ['big-data', 'bases-datos', 'almacenamiento'],
    industry: 'Tecnología',
    complexity: 'intermediate',
    timeToSolve: '15-20 minutos',
    prerequisites: ['Bases de datos', 'Sistemas distribuidos'],
    learningObjectives: [
      'Modelar distribución de datos',
      'Optimizar almacenamiento',
      'Aplicar integrales a TI'
    ],
    relatedConcepts: ['Bases de datos distribuidas', 'NoSQL']
  },

  // ==================== INGENIERÍA MECÁNICA ====================
  {
    id: 'mec_001',
    title: 'Momento de Inercia de Pieza Mecánica',
    category: 'mecanica',
    difficulty: 2,
    realWorldContext: 'Calcular momento de inercia de una pieza cúbica para diseño de ejes.',
    problemStatement: 'Determinar momento de inercia con densidad uniforme.',
    function: 'x^2 + y^2',
    limits: {
      x: ['0', '1'],
      y: ['0', '1'],
      z: ['0', '1']
    },
    coordinateSystem: 'cartesian',
    physicalMeaning: 'Distribución de masa (kg/m³) para cálculo de inercia.',
    applications: [
      'Diseño de ejes rotatorios',
      'Análisis de vibraciones',
      'Optimización de piezas',
      'Cálculo de factores de seguridad'
    ],
    expectedResult: '0.67 kg·m²',
    units: 'kilogramos por metro cuadrado',
    tags: ['momento-inercia', 'diseño-mecanico', 'ejes'],
    industry: 'Manufactura',
    complexity: 'beginner',
    timeToSolve: '10-15 minutos',
    prerequisites: ['Mecánica de materiales', 'Dinámica'],
    learningObjectives: [
      'Calcular momentos de inercia',
      'Aplicar integrales a diseño mecánico',
      'Optimizar componentes rotatorios'
    ],
    relatedConcepts: ['Momento de inercia', 'Dinámica rotacional']
  },

  {
    id: 'mec_002',
    title: 'Flujo en Conducto Cilíndrico',
    category: 'mecanica',
    difficulty: 3,
    realWorldContext: 'Analizar flujo de refrigerante en un conducto cilíndrico.',
    problemStatement: 'Calcular caudal volumétrico con perfil de velocidad parabólico.',
    function: '1 - r^2',
    limits: {
      x: ['0', '1'],
      y: ['0', '2*3.14159'],
      z: ['0', '2']
    },
    coordinateSystem: 'cylindrical',
    physicalMeaning: 'Velocidad del fluido (m/s) con máxima en el centro.',
    applications: [
      'Diseño de sistemas de refrigeración',
      'Optimización de conductos',
      'Análisis de pérdidas de carga',
      'Sistemas HVAC'
    ],
    expectedResult: '3.14 m³/s',
    units: 'metros cúbicos por segundo',
    tags: ['fluidos', 'refrigeracion', 'conductos'],
    industry: 'Ingeniería Mecánica',
    complexity: 'intermediate',
    timeToSolve: '15-20 minutos',
    prerequisites: ['Mecánica de fluidos', 'Coordenadas cilíndricas'],
    learningObjectives: [
      'Modelar flujo en conductos',
      'Usar coordenadas cilíndricas',
      'Calcular caudales'
    ],
    relatedConcepts: ['Mecánica de fluidos', 'Perfil de velocidad']
  },

  // ==================== INGENIERÍA INDUSTRIAL ====================
  {
    id: 'ind_001',
    title: 'Distribución de Inventario en Almacén',
    category: 'industrial',
    difficulty: 2,
    realWorldContext: 'Optimizar distribución de productos en almacén de alta densidad.',
    problemStatement: 'Calcular volumen total de almacenamiento con densidad variable.',
    function: '50 - x^2 - y^2',
    limits: {
      x: ['-2', '2'],
      y: ['-2', '2'],
      z: ['0', '5']
    },
    coordinateSystem: 'cartesian',
    physicalMeaning: 'Densidad de almacenamiento (unidades/m³) mayor en zonas centrales.',
    applications: [
      'Diseño de almacenes',
      'Optimización de picking',
      'Gestión de inventarios',
      'Logística 4.0'
    ],
    expectedResult: '2,093 unidades',
    units: 'unidades de producto',
    tags: ['logistica', 'almacenes', 'inventario'],
    industry: 'Logística',
    complexity: 'beginner',
    timeToSolve: '12-18 minutos',
    prerequisites: ['Logística', 'Investigación de operaciones'],
    learningObjectives: [
      'Optimizar layouts de almacenes',
      'Aplicar integrales a logística',
      'Diseñar sistemas de almacenamiento'
    ],
    relatedConcepts: ['Logística', 'Almacenes automatizados']
  },

  {
    id: 'ind_002',
    title: 'Carga de Trabajo en Planta de Producción',
    category: 'industrial',
    difficulty: 3,
    realWorldContext: 'Balancear carga de trabajo en sistema de producción celular.',
    problemStatement: 'Calcular carga total con intensidad variable por ubicación.',
    function: 'r*(5 - r)',
    limits: {
      x: ['0', '5'],
      y: ['0', '2*3.14159'],
      z: ['0', '10']
    },
    coordinateSystem: 'cylindrical',
    physicalMeaning: 'Intensidad de trabajo (horas-hombre/m³) con picos en zonas de ensamblaje.',
    applications: [
      'Balanceo de líneas',
      'Diseño de plantas celulares',
      'Optimización de flujos',
      'Lean manufacturing'
    ],
    expectedResult: '1,963 horas-hombre',
    units: 'horas-hombre',
    tags: ['manufactura', 'produccion', 'balanceo'],
    industry: 'Manufactura',
    complexity: 'intermediate',
    timeToSolve: '18-25 minutos',
    prerequisites: ['Ingeniería de métodos', 'Diseño de plantas'],
    learningObjectives: [
      'Balancear cargas de trabajo',
      'Optimizar layouts de producción',
      'Aplicar coordenadas cilíndricas'
    ],
    relatedConcepts: ['Manufactura celular', 'Balanceo de líneas']
  },

  // ==================== INGENIERÍA CIVIL ====================
  {
    id: 'civ_001',
    title: 'Volumen de Concreto en Cimentación',
    category: 'civil',
    difficulty: 1,
    realWorldContext: 'Calcular volumen de concreto para cimentación de edificio.',
    problemStatement: 'Determinar volumen total de material en base rectangular.',
    function: '1',
    limits: {
      x: ['0', '10'],
      y: ['0', '8'],
      z: ['0', '2']
    },
    coordinateSystem: 'cartesian',
    physicalMeaning: 'Volumen de concreto (m³) con densidad uniforme.',
    applications: [
      'Cálculo de materiales',
      'Estimación de costos',
      'Planificación de obra',
      'Gestión de proyectos'
    ],
    expectedResult: '160 m³',
    units: 'metros cúbicos',
    tags: ['construccion', 'cimentacion', 'concreto'],
    industry: 'Construcción',
    complexity: 'beginner',
    timeToSolve: '5-10 minutos',
    prerequisites: ['Cálculo básico', 'Conceptos de construcción'],
    learningObjectives: [
      'Calcular volúmenes de materiales',
      'Aplicar integrales a construcción',
      'Estimar costos de obra'
    ],
    relatedConcepts: ['Cimentaciones', 'Materiales de construcción']
  },

  {
    id: 'civ_002',
    title: 'Presión en Presa Cilíndrica',
    category: 'civil',
    difficulty: 4,
    realWorldContext: 'Calcular fuerza hidrostática en presa de forma cilíndrica.',
    problemStatement: 'Determinar fuerza total del agua considerando variación con profundidad.',
    function: 'r*(10 - z)',
    limits: {
      x: ['0', '50'],
      y: ['0', '3.14159'],
      z: ['0', '10']
    },
    coordinateSystem: 'cylindrical',
    physicalMeaning: 'Presión hidrostática (kPa) que aumenta con la profundidad.',
    applications: [
      'Diseño de presas',
      'Análisis de estabilidad',
      'Cálculo de fuerzas',
      'Ingeniería hidráulica'
    ],
    expectedResult: '196,350 kN',
    units: 'kilonewtons',
    tags: ['presas', 'hidrostatica', 'agua'],
    industry: 'Recursos Hídricos',
    complexity: 'advanced',
    timeToSolve: '25-30 minutos',
    prerequisites: ['Mecánica de fluidos', 'Estructuras hidráulicas'],
    learningObjectives: [
      'Calcular fuerzas hidrostáticas',
      'Diseñar estructuras de contención',
      'Aplicar coordenadas cilíndricas'
    ],
    relatedConcepts: ['Presas', 'Hidrostática', 'Presión de fluidos']
  }
];

// Funciones auxiliares
export const getCasesByCategory = (category: string): EngineeringCase[] => {
  return engineeringCases.filter(case_ => case_.category === category);
};

export const getCasesByDifficulty = (difficulty: number): EngineeringCase[] => {
  return engineeringCases.filter(case_ => case_.difficulty === difficulty);
};

export const getCasesByComplexity = (complexity: string): EngineeringCase[] => {
  return engineeringCases.filter(case_ => case_.complexity === complexity);
};

export const searchCases = (query: string): EngineeringCase[] => {
  const lowerQuery = query.toLowerCase();
  return engineeringCases.filter(case_ => 
    case_.title.toLowerCase().includes(lowerQuery) ||
    case_.problemStatement.toLowerCase().includes(lowerQuery) ||
    case_.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    case_.industry.toLowerCase().includes(lowerQuery)
  );
};

export const getCaseById = (id: string): EngineeringCase | undefined => {
  return engineeringCases.find(case_ => case_.id === id);
};

export const getCasesStats = () => {
  const categories = engineeringCases.reduce((acc, case_) => {
    acc[case_.category] = (acc[case_.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const difficulties = engineeringCases.reduce((acc, case_) => {
    acc[case_.difficulty] = (acc[case_.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    total: engineeringCases.length,
    categories,
    difficulties,
    industries: [...new Set(engineeringCases.map(c => c.industry))].length
  };
};

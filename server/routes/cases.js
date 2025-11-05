const express = require('express');
const router = express.Router();

// Get all case studies
router.get('/', (req, res) => {
  const caseStudies = [
    {
      id: 'mass-calculation',
      title: 'Cálculo de Masa de un Sólido',
      field: 'Física',
      difficulty: 'medium',
      description: 'Calcular la masa de un sólido con densidad variable',
      problem: {
        expression: 'x^2 + y^2 + z^2',
        limits: {
          x: { min: '0', max: '1' },
          y: { min: '0', max: '1' },
          z: { min: '0', max: '1' }
        },
        coordinateSystem: 'cartesian'
      },
      physicalMeaning: 'La función representa la densidad del material en cada punto',
      applications: ['Ingeniería de materiales', 'Diseño estructural'],
      industries: ['Aeroespacial', 'Automotriz', 'Construcción']
    },
    {
      id: 'volume-sphere',
      title: 'Volumen de una Esfera',
      field: 'Geometría',
      difficulty: 'easy',
      description: 'Calcular el volumen de una esfera usando coordenadas esféricas',
      problem: {
        expression: '1',
        limits: {
          rho: { min: '0', max: 'R' },
          theta: { min: '0', max: '2*pi' },
          phi: { min: '0', max: 'pi' }
        },
        coordinateSystem: 'spherical'
      },
      physicalMeaning: 'Integrar la función constante 1 sobre una región esférica',
      applications: ['Cálculo de volúmenes', 'Geometría analítica'],
      industries: ['Educación', 'Investigación']
    },
    {
      id: 'moment-inertia',
      title: 'Momento de Inercia de un Cilindro',
      field: 'Mecánica',
      difficulty: 'hard',
      description: 'Calcular el momento de inercia de un cilindro sólido',
      problem: {
        expression: 'r^2',
        limits: {
          r: { min: '0', max: 'R' },
          theta: { min: '0', max: '2*pi' },
          z: { min: '0', max: 'H' }
        },
        coordinateSystem: 'cylindrical'
      },
      physicalMeaning: 'El momento de inercia determina la resistencia a la rotación',
      applications: ['Dinámica rotacional', 'Diseño de máquinas'],
      industries: ['Mecánica', 'Robótica', 'Manufactura']
    }
  ];
  
  res.json(caseStudies);
});

// Get specific case study
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // This would typically query a database
  const caseStudy = getCaseStudyById(id);
  
  if (!caseStudy) {
    return res.status(404).json({ error: 'Case study not found' });
  }
  
  res.json(caseStudy);
});

// Solve a case study
router.post('/:id/solve', async (req, res) => {
  try {
    const { id } = req.params;
    const caseStudy = getCaseStudyById(id);
    
    if (!caseStudy) {
      return res.status(404).json({ error: 'Case study not found' });
    }
    
    // Use the solver to get the solution
    const solution = await solveCaseStudy(caseStudy);
    
    res.json({
      caseStudy,
      solution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Case study solve error:', error);
    res.status(500).json({ error: 'Error solving case study' });
  }
});

function getCaseStudyById(id) {
  const cases = {
    'mass-calculation': {
      id: 'mass-calculation',
      title: 'Cálculo de Masa de un Sólido',
      field: 'Física',
      difficulty: 'medium',
      description: 'Un sólido tiene densidad ρ(x,y,z) = x² + y² + z². Calcular su masa total.',
      problem: {
        expression: 'x^2 + y^2 + z^2',
        limits: {
          x: { min: '0', max: '1' },
          y: { min: '0', max: '1' },
          z: { min: '0', max: '1' }
        },
        coordinateSystem: 'cartesian'
      },
      theory: 'La masa se calcula integrando la densidad sobre todo el volumen: M = ∫∫∫ ρ(x,y,z) dV',
      physicalMeaning: 'La función representa la densidad del material en cada punto del sólido',
      expectedResult: 1.0,
      units: 'kg',
      applications: ['Ingeniería de materiales', 'Diseño estructural', 'Análisis de esfuerzos'],
      industries: ['Aeroespacial', 'Automotriz', 'Construcción']
    },
    'volume-sphere': {
      id: 'volume-sphere',
      title: 'Volumen de una Esfera',
      field: 'Geometría',
      difficulty: 'easy',
      description: 'Calcular el volumen de una esfera de radio R usando coordenadas esféricas.',
      problem: {
        expression: '1',
        limits: {
          rho: { min: '0', max: 'R' },
          theta: { min: '0', max: '2*pi' },
          phi: { min: '0', max: 'pi' }
        },
        coordinateSystem: 'spherical'
      },
      theory: 'V = ∫∫∫ 1 dV = ∫₀^R ∫₀^{2π} ∫₀^π ρ² sin(φ) dφ dθ dρ',
      physicalMeaning: 'Integrar la función constante 1 sobre una región esférica da el volumen',
      expectedResult: '(4/3)πR³',
      units: 'unidades³',
      applications: ['Cálculo de volúmenes', 'Geometría analítica', 'Diseño de tanques'],
      industries: ['Educación', 'Investigación', 'Ingeniería']
    },
    'moment-inertia': {
      id: 'moment-inertia',
      title: 'Momento de Inercia de un Cilindro',
      field: 'Mecánica',
      difficulty: 'hard',
      description: 'Calcular el momento de inercia de un cilindro sólido respecto a su eje.',
      problem: {
        expression: 'r^2',
        limits: {
          r: { min: '0', max: 'R' },
          theta: { min: '0', max: '2*pi' },
          z: { min: '0', max: 'H' }
        },
        coordinateSystem: 'cylindrical'
      },
      theory: 'I = ∫∫∫ r² ρ dV donde r es la distancia al eje de rotación',
      physicalMeaning: 'El momento de inercia determina la resistencia del objeto a cambios en su rotación',
      expectedResult: '(1/2)MR²',
      units: 'kg⋅m²',
      applications: ['Dinámica rotacional', 'Diseño de máquinas', 'Análisis de vibraciones'],
      industries: ['Mecánica', 'Robótica', 'Manufactura', 'Automotriz']
    }
  };
  
  return cases[id];
}

async function solveCaseStudy(caseStudy) {
  // This would integrate with the solver
  return {
    steps: [
      {
        id: 1,
        title: 'Configuración del problema',
        description: `Establecemos la integral para ${caseStudy.title}`,
        expression: caseStudy.problem.expression
      },
      {
        id: 2,
        title: 'Aplicación de límites',
        description: 'Aplicamos los límites de integración correspondientes',
        expression: 'Límites establecidos'
      },
      {
        id: 3,
        title: 'Resolución',
        description: 'Calculamos la integral paso a paso',
        expression: 'Resultado final'
      }
    ],
    result: {
      numerical: caseStudy.expectedResult,
      interpretation: `${caseStudy.physicalMeaning}. El resultado tiene aplicaciones en ${caseStudy.applications.join(', ')}.`
    }
  };
}

module.exports = router;
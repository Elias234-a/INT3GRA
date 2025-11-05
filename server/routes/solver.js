const express = require('express');
const { evaluate, parse, derivative, simplify } = require('mathjs');
const axios = require('axios');
const router = express.Router();

// Configuración del microservicio Python
const PYTHON_SOLVER_URL = 'http://localhost:8000';

// Solve triple integral with Python microservice (exact symbolic solution)
router.post('/solve-exact', async (req, res) => {
  try {
    const { expression, limits, coordinateSystem } = req.body;
    
    // Validate input
    if (!expression || !limits) {
      return res.status(400).json({ error: 'Expression and limits are required' });
    }

    try {
      // Try symbolic solution with Python microservice first
      const pythonResponse = await axios.post(`${PYTHON_SOLVER_URL}/symbolic-solve`, {
        function: expression,
        limits: limits,
        coordinate_system: coordinateSystem || 'cartesian'
      }, { timeout: 15000 }); // 15 second timeout

      if (pythonResponse.data.success) {
        return res.json({
          success: true,
          method: 'symbolic',
          exact_result: pythonResponse.data.exact_result,
          numerical_result: pythonResponse.data.numerical_result,
          steps: pythonResponse.data.steps,
          computation_time: pythonResponse.data.computation_time,
          coordinate_system: pythonResponse.data.coordinate_system,
          jacobian: pythonResponse.data.jacobian
        });
      }
    } catch (pythonError) {
      console.log('Python solver failed, falling back to numerical:', pythonError.message);
    }

    // Fallback to numerical solution
    const numericalResult = await calculateNumericalIntegral(expression, limits, coordinateSystem);
    const steps = await generateSolutionSteps(expression, limits, coordinateSystem);
    
    return res.json({
      success: true,
      method: 'numerical_fallback',
      numerical_result: numericalResult,
      steps: steps,
      coordinate_system: coordinateSystem || 'cartesian',
      note: 'Solución numérica - microservicio Python no disponible'
    });

  } catch (error) {
    console.error('Solver error:', error);
    res.status(500).json({ error: 'Internal server error during calculation' });
  }
});

// Original solve endpoint (for backward compatibility)
router.post('/solve', async (req, res) => {
  try {
    const { expression, limits, coordinateSystem } = req.body;
    
    // Validate input
    if (!expression || !limits) {
      return res.status(400).json({ error: 'Expression and limits are required' });
    }

    // Parse and validate mathematical expression
    let parsedExpression;
    try {
      parsedExpression = parse(expression);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid mathematical expression' });
    }

    // Generate solution steps
    const steps = await generateSolutionSteps(expression, limits, coordinateSystem);
    
    // Calculate numerical result
    const numericalResult = await calculateNumericalIntegral(expression, limits, coordinateSystem);
    
    const solution = {
      problem: {
        expression,
        limits,
        coordinateSystem: coordinateSystem || 'cartesian'
      },
      steps,
      result: {
        numerical: numericalResult,
        exact: generateExactSolution(expression, limits),
        units: determineUnits(expression),
        interpretation: generateInterpretation(expression, numericalResult)
      },
      executionTime: Date.now() - req.startTime || 0
    };

    res.json(solution);
  } catch (error) {
    console.error('Solver error:', error);
    res.status(500).json({ error: 'Internal server error during calculation' });
  }
});

// Generate step-by-step solution
async function generateSolutionSteps(expression, limits, coordinateSystem) {
  const steps = [];
  
  // Step 1: Region Analysis
  steps.push({
    id: 1,
    title: 'Análisis de la Región',
    description: `Analizamos la región de integración definida por los límites dados.`,
    mathematicalExpression: formatLimits(limits),
    explanation: 'Identificamos el tipo de región y sus características geométricas.'
  });

  // Step 2: Coordinate System
  const coordSystem = coordinateSystem || 'cartesian';
  steps.push({
    id: 2,
    title: 'Sistema de Coordenadas',
    description: `Utilizamos coordenadas ${getCoordinateSystemName(coordSystem)}.`,
    mathematicalExpression: getCoordinateTransformations(coordSystem),
    explanation: getCoordinateSystemExplanation(coordSystem)
  });

  // Step 3: Jacobian (if needed)
  if (coordSystem !== 'cartesian') {
    const jacobian = getJacobian(coordSystem);
    steps.push({
      id: 3,
      title: 'Cálculo del Jacobiano',
      description: `El Jacobiano para ${getCoordinateSystemName(coordSystem)} es: ${jacobian}`,
      mathematicalExpression: `J = ${jacobian}`,
      explanation: 'El Jacobiano ajusta el elemento de volumen para el cambio de coordenadas.'
    });
  }

  // Steps 4-6: Integration steps
  const variables = getVariables(coordSystem);
  variables.forEach((variable, index) => {
    steps.push({
      id: 4 + index,
      title: `Integración respecto a ${variable}`,
      description: `Integramos la función respecto a ${variable}, tratando las otras variables como constantes.`,
      mathematicalExpression: `∫ f(${variables.join(',')}) d${variable}`,
      explanation: `Esta es la integral ${index === 0 ? 'más interna' : index === variables.length - 1 ? 'más externa' : 'intermedia'}.`
    });
  });

  return steps;
}

// Calculate numerical integral using Monte Carlo method
async function calculateNumericalIntegral(expression, limits, coordinateSystem) {
  try {
    const numSamples = 100000;
    let sum = 0;
    let validSamples = 0;

    // Get integration bounds
    const bounds = parseLimits(limits);
    
    for (let i = 0; i < numSamples; i++) {
      // Generate random point in integration region
      const point = generateRandomPoint(bounds);
      
      try {
        // Evaluate function at point
        const value = evaluate(expression, point);
        
        if (isFinite(value)) {
          sum += value;
          validSamples++;
        }
      } catch (error) {
        // Skip invalid points
        continue;
      }
    }

    if (validSamples === 0) {
      throw new Error('No valid sample points found');
    }

    // Calculate volume of integration region
    const volume = calculateRegionVolume(bounds, coordinateSystem);
    
    // Monte Carlo estimate
    const result = (sum / validSamples) * volume;
    
    return parseFloat(result.toFixed(6));
  } catch (error) {
    console.error('Numerical integration error:', error);
    return 0;
  }
}

// Helper functions
function formatLimits(limits) {
  return `${limits.x?.min || 0} ≤ x ≤ ${limits.x?.max || 1}, ${limits.y?.min || 0} ≤ y ≤ ${limits.y?.max || 1}, ${limits.z?.min || 0} ≤ z ≤ ${limits.z?.max || 1}`;
}

function getCoordinateSystemName(system) {
  const names = {
    'cartesian': 'cartesianas (x, y, z)',
    'cylindrical': 'cilíndricas (r, θ, z)',
    'spherical': 'esféricas (ρ, θ, φ)'
  };
  return names[system] || 'cartesianas';
}

function getCoordinateTransformations(system) {
  const transformations = {
    'cartesian': 'x = x, y = y, z = z',
    'cylindrical': 'x = r cos(θ), y = r sin(θ), z = z',
    'spherical': 'x = ρ sin(φ) cos(θ), y = ρ sin(φ) sin(θ), z = ρ cos(φ)'
  };
  return transformations[system] || transformations.cartesian;
}

function getCoordinateSystemExplanation(system) {
  const explanations = {
    'cartesian': 'Las coordenadas cartesianas son ideales para regiones rectangulares.',
    'cylindrical': 'Las coordenadas cilíndricas simplifican problemas con simetría circular.',
    'spherical': 'Las coordenadas esféricas son perfectas para regiones esféricas.'
  };
  return explanations[system] || explanations.cartesian;
}

function getJacobian(system) {
  const jacobians = {
    'cylindrical': 'r',
    'spherical': 'ρ² sin(φ)'
  };
  return jacobians[system] || '1';
}

function getVariables(system) {
  const variables = {
    'cartesian': ['z', 'y', 'x'],
    'cylindrical': ['z', 'r', 'θ'],
    'spherical': ['ρ', 'φ', 'θ']
  };
  return variables[system] || variables.cartesian;
}

function parseLimits(limits) {
  return {
    x: { min: parseFloat(limits.x?.min || 0), max: parseFloat(limits.x?.max || 1) },
    y: { min: parseFloat(limits.y?.min || 0), max: parseFloat(limits.y?.max || 1) },
    z: { min: parseFloat(limits.z?.min || 0), max: parseFloat(limits.z?.max || 1) }
  };
}

function generateRandomPoint(bounds) {
  return {
    x: bounds.x.min + Math.random() * (bounds.x.max - bounds.x.min),
    y: bounds.y.min + Math.random() * (bounds.y.max - bounds.y.min),
    z: bounds.z.min + Math.random() * (bounds.z.max - bounds.z.min)
  };
}

function calculateRegionVolume(bounds, coordinateSystem) {
  const dx = bounds.x.max - bounds.x.min;
  const dy = bounds.y.max - bounds.y.min;
  const dz = bounds.z.max - bounds.z.min;
  
  return dx * dy * dz;
}

function generateExactSolution(expression, limits) {
  // For simple cases, try to provide exact solutions
  if (expression === '1') {
    const bounds = parseLimits(limits);
    const volume = (bounds.x.max - bounds.x.min) * 
                  (bounds.y.max - bounds.y.min) * 
                  (bounds.z.max - bounds.z.min);
    return volume.toString();
  }
  
  return 'Solución numérica aproximada';
}

function determineUnits(expression) {
  // Basic unit analysis
  if (expression === '1') return 'unidades³';
  if (expression.includes('x*y*z')) return 'unidades⁶';
  return 'unidades³';
}

function generateInterpretation(expression, result) {
  if (expression === '1') {
    return `El resultado ${result} representa el volumen de la región de integración.`;
  }
  return `El resultado ${result} representa el valor de la integral triple de la función dada sobre la región especificada.`;
}

// Analyze function and recommend coordinate system
router.post('/analyze', async (req, res) => {
  try {
    const { expression } = req.body;
    
    if (!expression) {
      return res.status(400).json({ error: 'Expression is required' });
    }

    try {
      // Try Python microservice for advanced analysis
      const pythonResponse = await axios.post(`${PYTHON_SOLVER_URL}/analyze-function`, {
        function: expression
      }, { timeout: 5000 });

      if (pythonResponse.data.success) {
        return res.json(pythonResponse.data.analysis);
      }
    } catch (pythonError) {
      console.log('Python analysis failed, using basic analysis:', pythonError.message);
    }

    // Fallback to basic analysis
    const analysis = performBasicAnalysis(expression);
    res.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error during analysis' });
  }
});

function performBasicAnalysis(expression) {
  const expr = expression.toLowerCase();
  
  let recommendedSystem = 'cartesian';
  let complexityScore = 1;
  let reasons = [];

  // Check for cylindrical patterns
  if (expr.includes('x^2 + y^2') || expr.includes('x**2 + y**2') || expr.includes('x*x + y*y')) {
    recommendedSystem = 'cylindrical';
    complexityScore = 0.3;
    reasons.push('Contiene x² + y² - ideal para coordenadas cilíndricas');
  }

  // Check for spherical patterns
  if (expr.includes('x^2 + y^2 + z^2') || expr.includes('x**2 + y**2 + z**2') || expr.includes('x*x + y*y + z*z')) {
    recommendedSystem = 'spherical';
    complexityScore = 0.2;
    reasons.push('Contiene x² + y² + z² - ideal para coordenadas esféricas');
  }

  // Check for other patterns
  if (expr.includes('sqrt(x^2 + y^2)') || expr.includes('sqrt(x**2 + y**2)')) {
    recommendedSystem = 'cylindrical';
    reasons.push('Contiene √(x² + y²) - se simplifica en cilíndricas');
  }

  return {
    function: expression,
    recommended_system: recommendedSystem,
    complexity_score: complexityScore,
    reasons: reasons,
    confidence: reasons.length > 0 ? 'high' : 'medium'
  };
}

module.exports = router;
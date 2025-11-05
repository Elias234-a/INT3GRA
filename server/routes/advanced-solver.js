// Rutas para el Solver Avanzado de Integrales Triples
const express = require('express');
const { AdvancedTripleIntegralSolver } = require('../services/advanced-solver');

const router = express.Router();
const solver = new AdvancedTripleIntegralSolver();

/**
 * POST /api/advanced-solver/solve
 * Resolver integral triple con método avanzado
 */
router.post('/solve', async (req, res) => {
  try {
    const {
      functionInput,
      limits,
      coordinateSystem = 'cartesian',
      method = 'auto',
      precision = 1000
    } = req.body;

    // Validación básica
    if (!functionInput || !limits) {
      return res.status(400).json({
        success: false,
        error: 'Función y límites son requeridos'
      });
    }

    console.log(`🔧 Resolviendo integral avanzada: ${functionInput}`);
    console.log(`📊 Sistema: ${coordinateSystem}, Método: ${method}`);

    // Resolver usando el solver avanzado
    const result = await solver.solveTripleIntegral({
      functionInput,
      limits,
      coordinateSystem,
      method,
      precision
    });

    if (result.success) {
      console.log(`✅ Resultado: ${result.result}`);
      console.log(`⚡ Método usado: ${result.method}`);
      console.log(`🎯 Confianza: ${(result.confidence * 100).toFixed(1)}%`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }

    res.json(result);

  } catch (error) {
    console.error('Error en solver avanzado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/advanced-solver/analyze
 * Analizar función sin resolver
 */
router.post('/analyze', async (req, res) => {
  try {
    const { functionInput, limits, coordinateSystem } = req.body;

    if (!functionInput) {
      return res.status(400).json({
        success: false,
        error: 'Función es requerida para análisis'
      });
    }

    // Análisis de la función
    const analysis = solver.analyzeFunction(functionInput);
    const recommendedMethod = solver.selectBestMethod(analysis, coordinateSystem, limits);

    res.json({
      success: true,
      analysis,
      recommendedMethod,
      availableMethods: solver.methods,
      jacobian: solver.getJacobian(coordinateSystem || analysis.recommendedSystem)
    });

  } catch (error) {
    console.error('Error en análisis:', error);
    res.status(500).json({
      success: false,
      error: 'Error en análisis de función',
      details: error.message
    });
  }
});

/**
 * GET /api/advanced-solver/methods
 * Obtener métodos disponibles
 */
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      {
        id: 'auto',
        name: 'Automático',
        description: 'Selección inteligente del mejor método'
      },
      {
        id: 'symbolic_analytical',
        name: 'Simbólico Analítico',
        description: 'Resolución exacta paso a paso'
      },
      {
        id: 'riemann_sum',
        name: 'Suma de Riemann',
        description: 'Aproximación numérica clásica'
      },
      {
        id: 'monte_carlo',
        name: 'Monte Carlo',
        description: 'Muestreo aleatorio para regiones complejas'
      },
      {
        id: 'adaptive_quadrature',
        name: 'Cuadratura Adaptiva',
        description: 'Método numérico de alta precisión'
      },
      {
        id: 'coordinate_transformation',
        name: 'Transformación de Coordenadas',
        description: 'Cambio automático al sistema óptimo'
      }
    ]
  });
});

/**
 * POST /api/advanced-solver/compare-methods
 * Comparar múltiples métodos para la misma integral
 */
router.post('/compare-methods', async (req, res) => {
  try {
    const { functionInput, limits, coordinateSystem = 'cartesian' } = req.body;

    if (!functionInput || !limits) {
      return res.status(400).json({
        success: false,
        error: 'Función y límites son requeridos'
      });
    }

    console.log(`🔍 Comparando métodos para: ${functionInput}`);

    // Resolver con múltiples métodos
    const methods = ['riemann_sum', 'monte_carlo', 'adaptive_quadrature'];
    const results = {};

    for (const method of methods) {
      try {
        const result = await solver.solveTripleIntegral({
          functionInput,
          limits,
          coordinateSystem,
          method,
          precision: 500 // Menor precisión para comparación rápida
        });
        
        results[method] = {
          success: result.success,
          value: result.result,
          confidence: result.confidence,
          executionTime: result.executionTime,
          steps: result.steps?.length || 0
        };
      } catch (error) {
        results[method] = {
          success: false,
          error: error.message
        };
      }
    }

    // Análisis de consistencia
    const values = Object.values(results)
      .filter(r => r.success)
      .map(r => r.value);
    
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const maxDiff = Math.max(...values) - Math.min(...values);
    const consistency = maxDiff / Math.abs(avgValue);

    res.json({
      success: true,
      results,
      analysis: {
        averageValue: avgValue,
        maxDifference: maxDiff,
        consistency: consistency < 0.1 ? 'Alta' : consistency < 0.3 ? 'Media' : 'Baja',
        recommendedMethod: Object.keys(results).find(method => 
          results[method].success && results[method].confidence === Math.max(
            ...Object.values(results).filter(r => r.success).map(r => r.confidence)
          )
        )
      }
    });

  } catch (error) {
    console.error('Error en comparación de métodos:', error);
    res.status(500).json({
      success: false,
      error: 'Error en comparación de métodos',
      details: error.message
    });
  }
});

module.exports = router;

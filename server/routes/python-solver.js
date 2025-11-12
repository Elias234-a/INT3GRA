const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuración del servicio Python
const PYTHON_SOLVER_URL = 'http://localhost:5002';
const TIMEOUT = 60000; // 60 segundos

/**
 * Middleware para verificar que el servicio Python esté disponible
 */
const checkPythonService = async (req, res, next) => {
  try {
    const response = await axios.get(`${PYTHON_SOLVER_URL}/health`, {
      timeout: 5000
    });
    
    if (response.data.status === 'OK') {
      next();
    } else {
      throw new Error('Servicio Python no disponible');
    }
  } catch (error) {
    console.error('❌ Error conectando con servicio Python:', error.message);
    return res.status(503).json({
      success: false,
      error: 'Servicio Python no disponible',
      fallback: true,
      message: 'El sistema usará el solver JavaScript como alternativa'
    });
  }
};

/**
 * POST /api/python-solver/solve
 * Resolver integral triple usando Python (SymPy + SciPy)
 */
router.post('/solve', checkPythonService, async (req, res) => {
  try {
    const { function: functionStr, limits, coordinate_system } = req.body;

    // Validar entrada
    if (!functionStr || !limits) {
      return res.status(400).json({
        success: false,
        error: 'Función y límites son requeridos'
      });
    }

    // Validar estructura de límites
    const requiredCoords = ['x', 'y', 'z'];
    for (const coord of requiredCoords) {
      if (!limits[coord] || !Array.isArray(limits[coord]) || limits[coord].length !== 2) {
        return res.status(400).json({
          success: false,
          error: `Límites inválidos para coordenada ${coord}`
        });
      }
    }

    console.log('🐍 Enviando a Python Solver:', {
      function: functionStr,
      coordinate_system: coordinate_system || 'cartesian',
      limits
    });

    // Llamar al servicio Python
    const pythonResponse = await axios.post(`${PYTHON_SOLVER_URL}/solve`, {
      function: functionStr,
      limits: limits,
      coordinate_system: coordinate_system || 'cartesian'
    }, {
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = pythonResponse.data;

    // Procesar y enriquecer la respuesta
    if (result.success) {
      // Convertir pasos a formato compatible con el frontend
      const formattedSteps = result.steps ? result.steps.map((step, index) => ({
        step: index + 1,
        description: step.includes('**') ? step.replace(/\*\*/g, '') : step,
        equation: step,
        explanation: step
      })) : [];

      // Calcular metadatos adicionales
      const metadata = {
        solver: 'Python (SymPy/SciPy)',
        method: result.method || 'Híbrido',
        execution_time: result.execution_time || 0,
        coordinate_system: result.coordinate_system || coordinate_system,
        jacobian: result.jacobian || '1',
        precision: result.error_estimate ? Math.max(0, Math.min(1, 1 - result.error_estimate)) : 0.95,
        confidence: result.exact_result ? 1.0 : 0.9
      };

      const enhancedResult = {
        success: true,
        result: result.result,
        exact_result: result.exact_result,
        latex_result: result.latex_result,
        steps: formattedSteps,
        method: result.method || 'Python Solver',
        execution_time: result.execution_time || 0,
        metadata: metadata,
        solver_info: {
          type: 'python',
          version: '2.0',
          capabilities: ['symbolic', 'numerical', 'all_coordinates']
        }
      };

      console.log('✅ Python Solver exitoso:', {
        result: result.result,
        method: result.method,
        steps: formattedSteps.length
      });

      res.json(enhancedResult);
    } else {
      console.log('❌ Python Solver falló:', result.error);
      res.status(422).json({
        success: false,
        error: result.error || 'Error en cálculo Python',
        steps: result.steps || [],
        solver_info: {
          type: 'python',
          error: true
        }
      });
    }

  } catch (error) {
    console.error('❌ Error en Python Solver endpoint:', error.message);
    
    // Distinguir entre diferentes tipos de errores
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        error: 'Servicio Python no disponible',
        fallback: true,
        message: 'Inicie el servidor Python o use el solver JavaScript'
      });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(408).json({
        success: false,
        error: 'Tiempo de espera agotado',
        message: 'La integral es muy compleja para resolver en tiempo razonable'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
});

/**
 * POST /api/python-solver/validate
 * Validar sintaxis de función matemática
 */
router.post('/validate', checkPythonService, async (req, res) => {
  try {
    const { function: functionStr } = req.body;

    if (!functionStr) {
      return res.status(400).json({
        valid: false,
        error: 'Función requerida'
      });
    }

    const pythonResponse = await axios.post(`${PYTHON_SOLVER_URL}/validate`, {
      function: functionStr
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json(pythonResponse.data);

  } catch (error) {
    console.error('❌ Error validando función:', error.message);
    res.status(500).json({
      valid: false,
      error: 'Error validando función',
      details: error.message
    });
  }
});

/**
 * GET /api/python-solver/health
 * Verificar estado del servicio Python
 */
router.get('/health', async (req, res) => {
  try {
    const pythonResponse = await axios.get(`${PYTHON_SOLVER_URL}/health`, {
      timeout: 5000
    });

    res.json({
      python_service: pythonResponse.data,
      proxy_status: 'OK',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      python_service: null,
      proxy_status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/python-solver/analyze
 * Analizar función y recomendar sistema de coordenadas
 */
router.post('/analyze', checkPythonService, async (req, res) => {
  try {
    const { function: functionStr } = req.body;

    if (!functionStr) {
      return res.status(400).json({
        success: false,
        error: 'Función requerida'
      });
    }

    // Análisis básico en el backend
    const analysis = {
      function: functionStr,
      recommended_system: 'cartesian',
      complexity_score: 1.0,
      reasons: [],
      suggestions: []
    };

    const funcLower = functionStr.toLowerCase();

    // Detectar patrones para coordenadas cilíndricas
    if (funcLower.includes('x^2+y^2') || funcLower.includes('x**2+y**2') || 
        funcLower.includes('sqrt(x^2+y^2)') || funcLower.includes('sqrt(x**2+y**2)')) {
      analysis.recommended_system = 'cylindrical';
      analysis.complexity_score = 0.3;
      analysis.reasons.push('Contiene términos x²+y² - ideal para coordenadas cilíndricas');
      analysis.suggestions.push('Use r, θ, z donde r²=x²+y²');
    }

    // Detectar patrones para coordenadas esféricas
    if (funcLower.includes('x^2+y^2+z^2') || funcLower.includes('x**2+y**2+z**2') ||
        funcLower.includes('sqrt(x^2+y^2+z^2)') || funcLower.includes('sqrt(x**2+y**2+z**2)')) {
      analysis.recommended_system = 'spherical';
      analysis.complexity_score = 0.2;
      analysis.reasons.push('Contiene términos x²+y²+z² - ideal para coordenadas esféricas');
      analysis.suggestions.push('Use ρ, θ, φ donde ρ²=x²+y²+z²');
    }

    // Detectar funciones trigonométricas
    if (funcLower.includes('sin') || funcLower.includes('cos')) {
      analysis.reasons.push('Contiene funciones trigonométricas');
      if (analysis.recommended_system === 'cartesian') {
        analysis.suggested_alternative = 'cylindrical';
      }
    }

    res.json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error analizando función:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error analizando función',
      details: error.message
    });
  }
});

/**
 * POST /api/python-solver/generate-plot-data
 * Generar datos optimizados para visualización 3D
 */
router.post('/generate-plot-data', checkPythonService, async (req, res) => {
  try {
    const { function: functionStr, limits, coordinate_system, resolution } = req.body;

    // Validar entrada
    if (!functionStr || !limits) {
      return res.status(400).json({
        success: false,
        error: 'Función y límites son requeridos'
      });
    }

    // Validar estructura de límites
    const requiredCoords = ['x', 'y', 'z'];
    for (const coord of requiredCoords) {
      if (!limits[coord] || !Array.isArray(limits[coord]) || limits[coord].length !== 2) {
        return res.status(400).json({
          success: false,
          error: `Límites inválidos para coordenada ${coord}`
        });
      }
    }

    console.log('📊 Generando datos de visualización:', {
      function: functionStr,
      coordinate_system: coordinate_system || 'cartesian',
      resolution: resolution || 30
    });

    // Llamar al servicio Python
    const pythonResponse = await axios.post(`${PYTHON_SOLVER_URL}/generate-plot-data`, {
      function: functionStr,
      limits: limits,
      coordinate_system: coordinate_system || 'cartesian',
      resolution: resolution || 30
    }, {
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = pythonResponse.data;

    if (result.success) {
      console.log('✅ Datos de visualización generados:', {
        surface_slices: result.plot_data.statistics.num_surface_slices,
        sample_points: result.plot_data.statistics.num_sample_points
      });

      res.json({
        success: true,
        plot_data: result.plot_data,
        function_info: result.function_info,
        generation_info: {
          timestamp: new Date().toISOString(),
          resolution: resolution || 30,
          coordinate_system: coordinate_system || 'cartesian'
        }
      });
    } else {
      console.log('❌ Error generando datos de visualización:', result.error);
      res.status(422).json({
        success: false,
        error: result.error || 'Error generando datos de visualización'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de visualización:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        error: 'Servicio Python no disponible para visualización',
        fallback: true
      });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(408).json({
        success: false,
        error: 'Tiempo de espera agotado generando visualización'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error interno generando visualización',
        details: error.message
      });
    }
  }
});

/**
 * POST /api/python-solver/generate-plotly-3d
 * Generar gráfica 3D completa usando Plotly Python
 */
router.post('/generate-plotly-3d', checkPythonService, async (req, res) => {
  try {
    const { function: functionStr, limits, coordinate_system, resolution, plot_type } = req.body;

    // Validar entrada
    if (!functionStr || !limits) {
      return res.status(400).json({
        success: false,
        error: 'Función y límites son requeridos'
      });
    }

    // Validar estructura de límites
    const requiredCoords = ['x', 'y', 'z'];
    for (const coord of requiredCoords) {
      if (!limits[coord] || !Array.isArray(limits[coord]) || limits[coord].length !== 2) {
        return res.status(400).json({
          success: false,
          error: `Límites inválidos para coordenada ${coord}`
        });
      }
    }

    console.log('🎨 Generando gráfica Plotly 3D:', {
      function: functionStr,
      coordinate_system: coordinate_system || 'cartesian',
      resolution: resolution || 30,
      plot_type: plot_type || 'all'
    });

    // Llamar al servicio Python
    const pythonResponse = await axios.post(`${PYTHON_SOLVER_URL}/generate-plotly-3d`, {
      function: functionStr,
      limits: limits,
      coordinate_system: coordinate_system || 'cartesian',
      resolution: resolution || 30,
      plot_type: plot_type || 'all'
    }, {
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = pythonResponse.data;

    if (result.success) {
      console.log('✅ Gráfica Plotly 3D generada:', {
        num_traces: result.plotly_data.metadata.num_traces,
        plot_type: result.plotly_data.metadata.plot_type
      });

      res.json({
        success: true,
        plotly_data: result.plotly_data,
        function_info: result.function_info,
        generation_info: {
          timestamp: new Date().toISOString(),
          resolution: resolution || 30,
          coordinate_system: coordinate_system || 'cartesian',
          plot_type: plot_type || 'all'
        }
      });
    } else {
      console.log('❌ Error generando gráfica Plotly 3D:', result.error);
      res.status(422).json({
        success: false,
        error: result.error || 'Error generando gráfica Plotly 3D'
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint Plotly 3D:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        error: 'Servicio Python no disponible para gráficas 3D',
        fallback: true
      });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(408).json({
        success: false,
        error: 'Tiempo de espera agotado generando gráfica 3D'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error interno generando gráfica 3D',
        details: error.message
      });
    }
  }
});

module.exports = router;

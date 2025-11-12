/**
 * Servicio para integración con el Python Solver (SymPy + SciPy)
 * Proporciona resolución simbólica y numérica de integrales triples
 */

interface PythonSolverLimits {
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

interface PythonSolverRequest {
  function: string;
  limits: PythonSolverLimits;
  coordinate_system: 'cartesian' | 'cylindrical' | 'spherical';
}

interface PythonSolverStep {
  step: number;
  description: string;
  equation: string;
  explanation: string;
}

interface PythonSolverResult {
  success: boolean;
  result?: number;
  exact_result?: string;
  latex_result?: string;
  steps?: PythonSolverStep[];
  method?: string;
  execution_time?: number;
  coordinate_system?: string;
  jacobian?: string;
  metadata?: any;
  solver_info?: {
    type: string;
    version: string;
    capabilities: string[];
  };
  error?: string;
  fallback?: boolean;
}

interface ValidationResult {
  valid: boolean;
  parsed?: string;
  latex?: string;
  variables?: string[];
  error?: string;
}

interface AnalysisResult {
  success: boolean;
  analysis?: {
    function: string;
    recommended_system: string;
    complexity_score: number;
    reasons: string[];
    suggestions: string[];
    suggested_alternative?: string;
  };
  error?: string;
}

class PythonSolverService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = 'http://localhost:5001/api/python-solver';
    this.timeout = 60000; // 60 segundos
  }

  /**
   * Resolver integral triple usando Python
   */
  async solveTripleIntegral(
    functionStr: string,
    limits: PythonSolverLimits,
    coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical' = 'cartesian',
    options?: {
      method?: 'symbolic' | 'numerical' | 'auto';
      precision?: number;
      timeout?: number;
    }
  ): Promise<PythonSolverResult> {
    try {
      console.log('🧮 Resolviendo integral triple:', {
        function: functionStr,
        limits,
        coordinateSystem,
        options
      });

      const requestBody = {
        function: functionStr,
        limits: limits,
        coordinate_system: coordinateSystem,
        method: options?.method || 'auto',
        precision: options?.precision || 0.001,
        timeout: options?.timeout || 30
      };

      console.log('📤 Enviando petición:', requestBody);

      const response = await fetch(`${this.baseUrl}/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(options?.timeout ? options.timeout * 1000 : this.timeout)
      });

      console.log('📡 Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();
      console.log('📊 Datos de respuesta:', result);

      if (response.ok && result.success) {
        const pythonResult: PythonSolverResult = {
          success: true,
          result: result.result,
          exact_result: result.exact_result,
          latex_result: result.latex_result,
          steps: result.steps || [],
          method: result.method || 'Python',
          execution_time: result.execution_time || 0,
          coordinate_system: coordinateSystem,
          jacobian: result.jacobian || '1',
          metadata: {
            ...result.metadata,
            solver: 'Python (SymPy/SciPy)',
            method: result.method,
            execution_time: result.execution_time,
            coordinate_system: coordinateSystem,
            jacobian: result.jacobian,
            precision: result.precision || options?.precision || 0.001,
            confidence: result.confidence || 0.95
          }
        };

        console.log('✅ Integral resuelta exitosamente:', pythonResult);
        return pythonResult;
      } else {
        console.error('❌ Error en Python Solver:', result);
        return {
          success: false,
          error: result.error || 'Error desconocido del Python Solver',
          fallback: result.fallback !== false // Por defecto true
        };
      }

    } catch (error: any) {
      console.error('💥 Error de conexión con Python Solver:', error);
      return {
        success: false,
        error: `Error de conexión: ${error.message}`,
        fallback: true
      };
    }
  }

  /**
   * Validar sintaxis de función matemática
   */
  async validateFunction(functionStr: string): Promise<ValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionStr
        }),
        signal: AbortSignal.timeout(10000)
      });

      const result = await response.json();
      return result;

    } catch (error: any) {
      console.error('❌ Error validando función:', error);
      return {
        valid: false,
        error: `Error de validación: ${error.message}`
      };
    }
  }

  /**
   * Analizar función y recomendar sistema de coordenadas
   */
  async analyzeFunction(functionStr: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionStr
        }),
        signal: AbortSignal.timeout(10000)
      });

      const result = await response.json();
      return result;

    } catch (error: any) {
      console.error('❌ Error analizando función:', error);
      return {
        success: false,
        error: `Error de análisis: ${error.message}`
      };
    }
  }

  /**
   * Verificar estado del servicio Python
   */
  async checkHealth(): Promise<{ available: boolean; details?: any; error?: string }> {
    try {
      console.log('🔍 Verificando Python Solver en:', `${this.baseUrl}/health`);
      console.log('🌐 URL completa:', `${this.baseUrl}/health`);
      console.log('⚙️ Configuración:', { baseUrl: this.baseUrl, timeout: this.timeout });
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // Aumentar timeout a 10 segundos
      });

      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Python Solver disponible:', result);
        return {
          available: true,
          details: result
        };
      } else {
        const errorText = await response.text();
        console.log('❌ Python Solver no disponible - Status:', response.status, 'Body:', errorText);
        return {
          available: false,
          error: `Servicio no disponible (${response.status}): ${errorText}`
        };
      }

    } catch (error: any) {
      console.error('❌ Error conectando con Python Solver:', error);
      console.error('🔍 Detalles del error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      // Información más específica del error
      let errorMessage = error.message;
      if (error.name === 'TimeoutError') {
        errorMessage = 'Timeout - Python Solver no responde en 10 segundos';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'No se puede conectar - Verificar backend Node.js en puerto 5000';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Error CORS - Verificar configuración del servidor';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Error de red - Verificar conexión local';
      }
      
      return {
        available: false,
        error: errorMessage
      };
    }
  }

  /**
   * Convertir resultado del Python Solver al formato del sistema INTEGRA
   */
  convertToIntegralStep(pythonResult: PythonSolverResult): any {
    if (!pythonResult.success) {
      return null;
    }

    return {
      success: true,
      result: pythonResult.result,
      exact: pythonResult.exact_result,
      decimal: pythonResult.result,
      steps: pythonResult.steps || [],
      method: pythonResult.method || 'Python (SymPy/SciPy)',
      confidence: pythonResult.metadata?.confidence || 0.9,
      analysis: {
        solver: 'Python',
        execution_time: pythonResult.execution_time || 0,
        coordinate_system: pythonResult.metadata?.coordinate_system,
        jacobian: pythonResult.metadata?.jacobian,
        precision: pythonResult.metadata?.precision || 0.9
      },
      verification: {
        method: pythonResult.method,
        exact_available: !!pythonResult.exact_result,
        latex_available: !!pythonResult.latex_result
      },
      executionTime: pythonResult.execution_time || 0
    };
  }

  /**
   * Generar datos optimizados para visualización 3D
   */
  async generatePlotData(
    functionStr: string,
    limits: PythonSolverLimits,
    coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical' = 'cartesian',
    resolution: number = 30
  ): Promise<any> {
    try {
      console.log('📊 Generando datos de visualización con Python:', {
        function: functionStr,
        limits,
        coordinate_system: coordinateSystem,
        resolution
      });

      const response = await fetch(`${this.baseUrl}/generate-plot-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionStr,
          limits: limits,
          coordinate_system: coordinateSystem,
          resolution: resolution
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error generando datos de visualización:', result);
        return {
          success: false,
          error: result.error || 'Error generando datos de visualización',
          fallback: result.fallback || false
        };
      }

      console.log('✅ Datos de visualización generados exitosamente');
      return {
        success: true,
        plotData: result.plot_data,
        functionInfo: result.function_info,
        generationInfo: result.generation_info
      };

    } catch (error: any) {
      console.error('❌ Error conectando para generar visualización:', error);
      
      if (error.name === 'TimeoutError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado generando visualización'
        };
      }

      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: 'No se pudo conectar con el servicio Python para visualización',
          fallback: true
        };
      }

      return {
        success: false,
        error: `Error generando visualización: ${error.message}`
      };
    }
  }

  /**
   * Generar gráfica 3D completa usando Plotly Python
   */
  async generatePlotly3D(
    functionStr: string,
    limits: PythonSolverLimits,
    coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical' = 'cartesian',
    resolution: number = 30,
    plotType: 'surface' | 'scatter' | 'wireframe' | 'slices' | 'all' = 'all'
  ): Promise<any> {
    try {
      console.log('🎨 Generando gráfica Plotly 3D con Python:', {
        function: functionStr,
        limits,
        coordinate_system: coordinateSystem,
        resolution,
        plot_type: plotType
      });

      const response = await fetch(`${this.baseUrl}/generate-plotly-3d`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionStr,
          limits: limits,
          coordinate_system: coordinateSystem,
          resolution: resolution,
          plot_type: plotType
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error generando gráfica Plotly 3D:', result);
        return {
          success: false,
          error: result.error || 'Error generando gráfica Plotly 3D',
          fallback: result.fallback || false
        };
      }

      console.log('✅ Gráfica Plotly 3D generada exitosamente');
      return {
        success: true,
        plotlyData: result.plotly_data,
        functionInfo: result.function_info,
        generationInfo: result.generation_info
      };

    } catch (error: any) {
      console.error('❌ Error conectando para generar gráfica Plotly 3D:', error);
      
      if (error.name === 'TimeoutError') {
        return {
          success: false,
          error: 'Tiempo de espera agotado generando gráfica 3D'
        };
      }

      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: 'No se pudo conectar con el servicio Python para gráficas 3D',
          fallback: true
        };
      }

      return {
        success: false,
        error: `Error generando gráfica 3D: ${error.message}`
      };
    }
  }

  /**
   * Método de conveniencia para usar como fallback
   */
  async solveWithFallback(
    functionStr: string,
    limits: PythonSolverLimits,
    coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical' = 'cartesian',
    fallbackSolver?: (func: string, limits: any, coord: string) => Promise<any>,
    options?: {
      method?: 'symbolic' | 'numerical' | 'auto';
      precision?: number;
      timeout?: number;
    }
  ): Promise<any> {
    
    console.log('🔄 Iniciando resolución con fallback:', {
      function: functionStr,
      limits,
      coordinateSystem,
      options
    });

    // Intentar con Python primero (simbólico y numérico)
    const pythonResult = await this.solveTripleIntegral(functionStr, limits, coordinateSystem, options);
    
    if (pythonResult.success) {
      console.log('✅ Python Solver exitoso');
      return this.convertToIntegralStep(pythonResult);
    }

    console.log('⚠️ Python Solver falló, intentando fallback:', pythonResult.error);

    // Si Python falla y hay fallback, usarlo
    if (fallbackSolver && pythonResult.fallback) {
      console.log('🔄 Usando solver JavaScript como fallback...');
      try {
        const fallbackResult = await fallbackSolver(functionStr, limits, coordinateSystem);
        console.log('✅ Fallback exitoso');
        return {
          ...fallbackResult,
          method: (fallbackResult.method || 'JavaScript') + ' (Fallback)',
          python_error: pythonResult.error,
          metadata: {
            ...fallbackResult.metadata,
            python_attempted: true,
            python_error: pythonResult.error,
            fallback_used: true
          }
        };
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError);
      }
    }

    // Si todo falla, retornar error detallado
    const finalError = pythonResult.error || 'Todos los métodos de resolución fallaron';
    console.error('💥 Todos los métodos fallaron:', finalError);
    
    return {
      success: false,
      error: finalError,
      python_error: pythonResult.error,
      metadata: {
        python_attempted: true,
        python_error: pythonResult.error,
        fallback_attempted: !!fallbackSolver,
        all_methods_failed: true
      }
    };
  }
}

// Instancia singleton
export const pythonSolverService = new PythonSolverService();

// Exportar tipos para uso en otros componentes
export type {
  PythonSolverLimits,
  PythonSolverRequest,
  PythonSolverResult,
  PythonSolverStep,
  ValidationResult,
  AnalysisResult
};

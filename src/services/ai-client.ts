/**
 * Cliente de IA para INTEGRA - Especializado en Integrales Triples
 * Conecta con el backend para explicaciones contextuales usando OpenAI
 */

export interface AIExplanationRequest {
  integral?: {
    id: string;
    functionInput: string;
    limits: { x: string[]; y: string[]; z: string[] };
    coordinateSystem: string;
    result?: {
      exact?: string;
      decimal: number;
      steps?: any[];
    };
    metadata?: {
      solver?: string;
      method?: string;
      executionTime?: number;
      confidence?: number;
      jacobian?: string;
    };
    calculationData?: {
      usedPythonSolver?: boolean;
      pythonAvailable?: boolean;
      stepByStep?: any[];
    };
  };
  question: string;
  questionType?: 'general' | 'specific' | 'conceptual' | 'computational' | 'visual' | 'comparison';
  conversationHistory?: Array<{ role: 'user' | 'ai'; content: string }>;
  context?: {
    hasActiveIntegral: boolean;
    totalIntegralsInHistory: number;
    currentCoordinateSystem?: string;
    recentTopics?: string[];
  };
}

export interface AIResponse {
  success: boolean;
  data: {
    explanation?: string;
    answer?: string;
    comparison?: string;
    suggestion?: string;
    timestamp: number;
    source?: string;
  };
  error?: string;
}

export interface ErrorCheckResult {
  hasError: boolean;
  explanation: string;
}

class AIClient {
  private baseURL = (import.meta as any).env?.PROD 
    ? '/.netlify/functions'  // Producción (Netlify)
    : 'http://localhost:5001/api/ai';  // Desarrollo local

  /**
   * Explica una integral específica basada en una pregunta del usuario
   */
  async explainIntegral(req: AIExplanationRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });

      const data: AIResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Error en explicación');
      return data.data.explanation || '';
    } catch (error) {
      console.error('Error en explainIntegral:', error);
      throw new Error('No se pudo obtener la explicación. Verifica tu conexión.');
    }
  }

  /**
   * Obtiene explicación paso a paso de una integral
   */
  async getStepByStepExplanation(integral: AIExplanationRequest['integral']): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/step-by-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integral }),
      });

      const data: AIResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Error en explicación paso a paso');
      return data.data.explanation || '';
    } catch (error) {
      console.error('Error en getStepByStepExplanation:', error);
      throw new Error('No se pudo obtener la explicación paso a paso.');
    }
  }

  /**
   * Responde preguntas sobre conceptos generales de integrales triples
   */
  async answerConceptQuestion(question: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/concept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data: AIResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Error en respuesta conceptual');
      return data.data.answer || '';
    } catch (error) {
      console.error('Error en answerConceptQuestion:', error);
      throw new Error('No se pudo obtener la respuesta sobre el concepto.');
    }
  }

  /**
   * Compara dos métodos de resolución para una integral
   */
  async compareMethods(
    integral: AIExplanationRequest['integral'],
    method1: string,
    method2: string
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integral, method1, method2 }),
      });

      const data: AIResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Error en comparación');
      return data.data.comparison || '';
    } catch (error) {
      console.error('Error en compareMethods:', error);
      throw new Error('No se pudo comparar los métodos.');
    }
  }

  /**
   * Verifica si hay errores en un paso de resolución
   */
  async checkError(
    integral: AIExplanationRequest['integral'],
    userStep: string,
    userAnswer: string
  ): Promise<ErrorCheckResult> {
    try {
      const response = await fetch(`${this.baseURL}/check-error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integral, userStep, userAnswer }),
      });

      const data: AIResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Error en verificación');
      
      // Extraer específicamente los campos de ErrorCheckResult
      const result = data.data as any;
      return {
        hasError: result.hasError || false,
        explanation: result.explanation || ''
      };
    } catch (error) {
      console.error('Error en checkError:', error);
      throw new Error('No se pudo verificar el error.');
    }
  }

  /**
   * Sugiere el mejor método para resolver una integral
   */
  async suggestMethod(integral: AIExplanationRequest['integral']): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/suggest-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integral }),
      });

      const data: AIResponse = await response.json();
      if (!data.success) throw new Error(data.error || 'Error en sugerencia');
      return data.data.suggestion || '';
    } catch (error) {
      console.error('Error en suggestMethod:', error);
      throw new Error('No se pudo obtener la sugerencia de método.');
    }
  }

  /**
   * Chat general usando el endpoint original (para compatibilidad)
   */
  async chat(message: string, context?: any, conversationHistory?: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, conversationHistory }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en chat:', error);
      throw new Error('No se pudo procesar el mensaje de chat.');
    }
  }

  /**
   * Verifica si el servicio de IA está disponible
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Error en checkHealth:', error);
      return false;
    }
  }

  /**
   * Obtiene sugerencias rápidas basadas en el contexto
   */
  getQuickSuggestions(integral?: AIExplanationRequest['integral']): string[] {
    const baseSuggestions = [
      '¿Qué es el Jacobiano?',
      '¿Cuándo usar coordenadas cilíndricas?',
      '¿Cómo establecer límites de integración?',
      'Explica los sistemas de coordenadas',
    ];

    if (!integral) return baseSuggestions;

    const contextualSuggestions = [
      `¿Por qué usar ${integral.coordinateSystem}?`,
      'Explica esta integral paso a paso',
      '¿Hay un método más fácil?',
      '¿Cómo verificar este resultado?',
    ];

    // Sugerencias específicas basadas en la función
    const funcLower = integral.functionInput.toLowerCase();
    if (funcLower.includes('x^2 + y^2') || funcLower.includes('x**2 + y**2')) {
      contextualSuggestions.push('¿Por qué cilíndricas es mejor aquí?');
    }
    if (funcLower.includes('x^2 + y^2 + z^2') || funcLower.includes('x**2 + y**2 + z**2')) {
      contextualSuggestions.push('¿Por qué esféricas es ideal aquí?');
    }

    return contextualSuggestions;
  }

  /**
   * Formatea una integral para mostrar en el contexto
   */
  formatIntegralContext(integral: AIExplanationRequest['integral']): string {
    const systemNames = {
      cartesian: 'Cartesianas',
      cylindrical: 'Cilíndricas',
      spherical: 'Esféricas'
    };

    if (!integral) return 'No hay integral en contexto';
    
    return `∫∫∫ ${integral.functionInput} dV
Sistema: ${systemNames[integral.coordinateSystem as keyof typeof systemNames] || integral.coordinateSystem}
Límites: x∈[${integral.limits.x.join(',')}], y∈[${integral.limits.y.join(',')}], z∈[${integral.limits.z.join(',')}]
${integral.result ? `Resultado: ${integral.result.decimal.toFixed(4)}` : ''}`;
  }
}

// Instancia singleton del cliente
export const aiClient = new AIClient();

// Funciones de utilidad para el frontend
export const AIUtils = {
  /**
   * Convierte historial de chat al formato esperado por la IA
   */
  formatConversationHistory(messages: Array<{type: 'user' | 'ai', content: string}>): Array<{role: 'user' | 'ai', content: string}> {
    return messages.map(msg => ({
      role: msg.type,
      content: msg.content
    }));
  },

  /**
   * Clasifica el tipo de pregunta del usuario
   */
  classifyQuestion(question: string): 'general' | 'specific' | 'conceptual' | 'computational' | 'visual' | 'comparison' {
    const lowerQ = question.toLowerCase();
    
    // Preguntas sobre visualización
    if (lowerQ.includes('graficar') || lowerQ.includes('visualizar') || lowerQ.includes('gráfica') || 
        lowerQ.includes('3d') || lowerQ.includes('región')) {
      return 'visual';
    }
    
    // Preguntas de comparación
    if (lowerQ.includes('comparar') || lowerQ.includes('diferencia') || lowerQ.includes('mejor') ||
        lowerQ.includes('vs') || lowerQ.includes('versus')) {
      return 'comparison';
    }
    
    // Preguntas computacionales
    if (lowerQ.includes('calcular') || lowerQ.includes('resolver') || lowerQ.includes('resultado') ||
        lowerQ.includes('pasos') || lowerQ.includes('método') || lowerQ.includes('solver')) {
      return 'computational';
    }
    
    // Preguntas conceptuales
    if (lowerQ.includes('qué es') || lowerQ.includes('explica') || lowerQ.includes('concepto') ||
        lowerQ.includes('jacobiano') || lowerQ.includes('coordenadas') || lowerQ.includes('teoría')) {
      return 'conceptual';
    }
    
    // Preguntas específicas sobre la integral actual
    if (lowerQ.includes('esta integral') || lowerQ.includes('mi integral') || lowerQ.includes('este resultado') ||
        lowerQ.includes('por qué') || lowerQ.includes('cómo')) {
      return 'specific';
    }
    
    return 'general';
  },

  /**
   * Detecta si una pregunta es sobre conceptos generales o sobre una integral específica
   */
  isConceptualQuestion(question: string): boolean {
    const conceptKeywords = [
      'qué es', 'que es', 'define', 'explica el concepto',
      'diferencia entre', 'cuándo usar', 'cuando usar',
      'por qué', 'porque', 'cómo funciona', 'como funciona'
    ];
    
    const questionLower = question.toLowerCase();
    return conceptKeywords.some(keyword => questionLower.includes(keyword));
  },

  /**
   * Sugiere el tipo de pregunta más apropiado
   */
  suggestQuestionType(question: string, hasIntegralContext: boolean): 'explain' | 'concept' | 'stepByStep' | 'compare' | 'suggest' {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('paso a paso') || questionLower.includes('step by step')) {
      return 'stepByStep';
    }
    
    if (questionLower.includes('comparar') || questionLower.includes('compare') || questionLower.includes('vs')) {
      return 'compare';
    }
    
    if (questionLower.includes('sugerir') || questionLower.includes('recomendar') || questionLower.includes('mejor método')) {
      return 'suggest';
    }
    
    if (AIUtils.isConceptualQuestion(question) && !hasIntegralContext) {
      return 'concept';
    }
    
    return 'explain';
  },

  /**
   * Formatea respuesta de IA para mostrar en el chat
   */
  formatAIResponse(response: string): string {
    // Convertir LaTeX inline \(...\) a formato más legible
    let formatted = response.replace(/\\?\\\(/g, '**').replace(/\\?\\\)/g, '**');
    
    // Convertir LaTeX display \[...\] a formato más legible
    formatted = formatted.replace(/\\?\\\[/g, '\n\n**').replace(/\\?\\\]/g, '**\n\n');
    
    // Mejorar formato de listas
    formatted = formatted.replace(/├─/g, '  •').replace(/└─/g, '  •');
    
    return formatted;
  },

  /**
   * Genera preguntas sugeridas basadas en el contexto actual
   */
  generateSuggestedQuestions(integral?: AIExplanationRequest['integral'], hasHistory: boolean = false): string[] {
    const generalQuestions = [
      "¿Qué es una integral triple?",
      "¿Cuándo usar coordenadas cilíndricas?",
      "¿Cómo funciona el jacobiano?",
      "¿Qué diferencia hay entre los sistemas de coordenadas?",
      "¿Cómo interpretar geométricamente una integral triple?"
    ];

    if (!integral) {
      if (hasHistory) {
        return [
          ...generalQuestions.slice(0, 3),
          "Explica alguna integral de mi historial",
          "¿Qué método de resolución es mejor?"
        ];
      }
      return generalQuestions;
    }

    const specificQuestions = [
      `¿Por qué se usa el sistema ${integral.coordinateSystem} para esta integral?`,
      "¿Cómo se calcularon estos límites de integración?",
      "Explica paso a paso cómo se resolvió",
      "¿Qué representa geométricamente esta integral?",
      "¿Se podría resolver en otro sistema de coordenadas?"
    ];

    // Preguntas específicas según el sistema de coordenadas
    if (integral.coordinateSystem === 'cylindrical') {
      specificQuestions.push("¿Por qué el jacobiano es r en coordenadas cilíndricas?");
    } else if (integral.coordinateSystem === 'spherical') {
      specificQuestions.push("¿Por qué el jacobiano es ρ²sin(φ) en coordenadas esféricas?");
    }

    // Preguntas sobre el solver usado
    if (integral.calculationData?.usedPythonSolver) {
      specificQuestions.push("¿Qué ventajas tiene usar el solver Python?");
    }

    return specificQuestions;
  },

  /**
   * Crea contexto enriquecido para la IA
   */
  buildEnhancedContext(
    integral?: AIExplanationRequest['integral'],
    history?: any[],
    recentTopics?: string[]
  ): AIExplanationRequest['context'] {
    return {
      hasActiveIntegral: !!integral,
      totalIntegralsInHistory: history?.length || 0,
      currentCoordinateSystem: integral?.coordinateSystem,
      recentTopics: recentTopics || []
    };
  }
};

export default aiClient;

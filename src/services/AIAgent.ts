import {
  IntegralProblem,
  IntegralSolution,
  AIExplanation,
  ExplanationType,
  SolutionStep
} from '../types/integra.types';

export class AIExplanationAgent {
  private static instance: AIExplanationAgent;

  public static getInstance(): AIExplanationAgent {
    if (!AIExplanationAgent.instance) {
      AIExplanationAgent.instance = new AIExplanationAgent();
    }
    return AIExplanationAgent.instance;
  }

  /**
   * Genera explicaciones paso a paso personalizadas
   */
  public generateStepExplanation(step: SolutionStep, type: ExplanationType = ExplanationType.INTUITIVE): AIExplanation {
    switch (type) {
      case ExplanationType.RIGOROUS:
        return this.generateRigorousExplanation(step);
      case ExplanationType.INTUITIVE:
        return this.generateIntuitiveExplanation(step);
      case ExplanationType.CONCEPTUAL:
        return this.generateConceptualExplanation(step);
      case ExplanationType.PRACTICAL:
        return this.generatePracticalExplanation(step);
      case ExplanationType.COMPARATIVE:
        return this.generateComparativeExplanation(step);
      default:
        return this.generateIntuitiveExplanation(step);
    }
  }

  /**
   * Responde preguntas específicas del usuario
   */
  public answerQuestion(question: string, context: IntegralSolution): string {
    const lowerQuestion = question.toLowerCase();

    // Preguntas sobre sistemas de coordenadas
    if (lowerQuestion.includes('cilíndrica') || lowerQuestion.includes('cylindrical')) {
      return this.explainCylindricalCoordinates(context);
    }

    if (lowerQuestion.includes('esférica') || lowerQuestion.includes('spherical')) {
      return this.explainSphericalCoordinates(context);
    }

    if (lowerQuestion.includes('jacobiano') || lowerQuestion.includes('jacobian')) {
      return this.explainJacobian(context);
    }

    // Preguntas sobre métodos
    if (lowerQuestion.includes('por qué') && lowerQuestion.includes('método')) {
      return this.explainMethodChoice(context);
    }

    if (lowerQuestion.includes('alternativa') || lowerQuestion.includes('otro método')) {
      return this.suggestAlternativeMethods(context);
    }

    // Preguntas sobre dificultad
    if (lowerQuestion.includes('difícil') || lowerQuestion.includes('complejo')) {
      return this.explainDifficulty(context);
    }

    // Preguntas sobre aplicaciones
    if (lowerQuestion.includes('aplicación') || lowerQuestion.includes('usar')) {
      return this.explainApplications(context);
    }

    // Respuesta genérica
    return this.generateGenericResponse(question, context);
  }

  /**
   * Proporciona pistas progresivas
   */
  public provideHints(step: SolutionStep, hintLevel: number = 1): string[] {
    const hints: string[] = [];

    switch (step.id) {
      case 1: // Análisis de región
        hints.push("Observa la forma de la región. ¿Tiene alguna simetría especial?");
        if (hintLevel >= 2) {
          hints.push("¿La región involucra círculos, cilindros o esferas?");
        }
        if (hintLevel >= 3) {
          hints.push("Las simetrías circulares sugieren coordenadas cilíndricas, las esféricas sugieren coordenadas esféricas.");
        }
        break;

      case 2: // Sistema de coordenadas
        hints.push("Busca términos como x² + y² (cilíndricas) o x² + y² + z² (esféricas)");
        if (hintLevel >= 2) {
          hints.push("¿El cambio de variables simplifica la función o los límites?");
        }
        if (hintLevel >= 3) {
          hints.push("El sistema correcto puede reducir una integral compleja a una trivial.");
        }
        break;

      case 3: // Jacobiano
        hints.push("El Jacobiano mide cómo se 'estira' el espacio durante la transformación");
        if (hintLevel >= 2) {
          hints.push("Para cilíndricas: J = r, para esféricas: J = ρ² sin(φ)");
        }
        if (hintLevel >= 3) {
          hints.push("Recuerda incluir el Jacobiano en el integrando: f(x,y,z) → f(r,θ,z) · r");
        }
        break;

      default: // Pasos de integración
        hints.push("Trata las otras variables como constantes");
        if (hintLevel >= 2) {
          hints.push("Aplica las reglas básicas: ∫ xⁿ dx = xⁿ⁺¹/(n+1)");
        }
        if (hintLevel >= 3) {
          hints.push("Evalúa en los límites: F(b) - F(a)");
        }
    }

    return hints;
  }

  /**
   * Detecta errores comunes
   */
  public detectCommonMistakes(userInput: string, step: SolutionStep): string[] {
    const mistakes: string[] = [];

    // Errores en Jacobiano
    if (step.id === 3 && userInput.includes('jacobian')) {
      if (!userInput.includes('r') && userInput.includes('cylindrical')) {
        mistakes.push("❌ Olvidaste incluir el Jacobiano r para coordenadas cilíndricas");
      }
      if (!userInput.includes('sin') && userInput.includes('spherical')) {
        mistakes.push("❌ El Jacobiano para esféricas es ρ² sin(φ), no olvides el sin(φ)");
      }
    }

    // Errores en límites
    if (userInput.includes('límite') || userInput.includes('limit')) {
      if (userInput.includes('∞') && !userInput.includes('convergente')) {
        mistakes.push("Verifica que la integral converja cuando hay límites infinitos");
      }
    }

    // Errores en orden de integración
    if (userInput.includes('orden') && step.id >= 4) {
      mistakes.push("Recuerda: el orden de integración va de adentro hacia afuera");
    }

    return mistakes;
  }

  /**
   * Compara con problemas similares
   */
  public compareWithSimilar(problem: IntegralProblem): string {
    let comparison = "🔍 **Problemas similares que podrías encontrar:**\n\n";

    if (problem.coordinateSystem.type === 'cylindrical') {
      comparison += "**Cilíndricas similares:**\n";
      comparison += "• Volumen de un cilindro: ∫∫∫ 1 dV en x² + y² ≤ R²\n";
      comparison += "• Momento de inercia: ∫∫∫ ρ r² dV\n";
      comparison += "• Flujo en tubería: ∫∫∫ v(r) dV\n\n";
    }

    if (problem.coordinateSystem.type === 'spherical') {
      comparison += "**Esféricas similares:**\n";
      comparison += "• Volumen de esfera: ∫∫∫ 1 dV en x² + y² + z² ≤ R²\n";
      comparison += "• Campo gravitacional: ∫∫∫ ρ/r² dV\n";
      comparison += "• Distribución de temperatura: ∫∫∫ T(ρ) dV\n\n";
    }

    comparison += "**Consejo:** Una vez que domines un tipo, los demás siguen el mismo patrón.";

    return comparison;
  }

  // Métodos privados para diferentes tipos de explicaciones

  private generateRigorousExplanation(step: SolutionStep): AIExplanation {
    return {
      type: ExplanationType.RIGOROUS,
      content: `**Demostración rigurosa del ${step.title}:**\n\n${step.description}\n\n**Justificación matemática:**\n${step.explanation}`,
      relatedConcepts: ['Teorema de Fubini', 'Cambio de variables', 'Jacobiano']
    };
  }

  private generateIntuitiveExplanation(step: SolutionStep): AIExplanation {
    let intuitive = `**¿Qué estamos haciendo realmente?** 🤔\n\n`;

    switch (step.id) {
      case 1:
        intuitive += "Imagina que tienes una caja de forma extraña y quieres saber cuánto líquido cabe dentro. Primero necesitas entender exactamente qué forma tiene esa caja. Eso es lo que hacemos al analizar la región. 📦";
        break;
      case 2:
        intuitive += "Es como elegir el mejor sistema de medición para tu problema. ¿Usarías coordenadas rectangulares para medir una pelota? ¡Mejor usa coordenadas esféricas! 🏀";
        break;
      case 3:
        intuitive += "El Jacobiano es como un 'factor de corrección'. Cuando cambias de sistema de coordenadas, el espacio se 'estira' o 'encoge', y el Jacobiano nos dice cuánto. 📏";
        break;
      default:
        intuitive += "Ahora integramos paso a paso, como pelar una cebolla: capa por capa, desde adentro hacia afuera. 🧅";
    }

    return {
      type: ExplanationType.INTUITIVE,
      content: intuitive,
      relatedConcepts: ['Visualización 3D', 'Interpretación geométrica']
    };
  }

  private generateConceptualExplanation(step: SolutionStep): AIExplanation {
    return {
      type: ExplanationType.CONCEPTUAL,
      content: `**Concepto clave:** ${step.title}\n\n${step.explanation}\n\n**¿Por qué es importante?**\nEste paso es fundamental porque establece la base para todo lo que sigue.`,
      relatedConcepts: ['Integrales múltiples', 'Sistemas de coordenadas', 'Transformaciones']
    };
  }

  private generatePracticalExplanation(step: SolutionStep): AIExplanation {
    return {
      type: ExplanationType.PRACTICAL,
      content: `**Aplicación práctica:**\n\n${step.description}\n\n**En la vida real:**\nEste tipo de cálculo se usa en ingeniería para calcular volúmenes, masas, centros de gravedad, y muchas otras aplicaciones.`,
      relatedConcepts: ['Ingeniería', 'Física aplicada', 'Diseño']
    };
  }

  private generateComparativeExplanation(step: SolutionStep): AIExplanation {
    return {
      type: ExplanationType.COMPARATIVE,
      content: `**Comparación de métodos:**\n\n${step.description}\n\n**Alternativas:**\n${step.hints?.join('\n') || 'Ver métodos alternativos en la sección de sugerencias.'}`,
      relatedConcepts: ['Métodos alternativos', 'Optimización', 'Eficiencia']
    };
  }

  // Métodos para responder preguntas específicas

  private explainCylindricalCoordinates(context: IntegralSolution): string {
    return `**¿Por qué coordenadas cilíndricas?**

Las coordenadas cilíndricas (r, θ, z) son **perfectas** cuando:

1. **Simetría circular**: Tu región es un cilindro, cono, o tiene forma circular
2. **Función simplificada**: Términos como x² + y² se convierten en r² (¡mucho más fácil!)
3. **Límites más simples**: En lugar de √(1-x²), solo tienes r: [0, R]

**Transformación:**
• x = r cos(θ)
• y = r sin(θ)  
• z = z

**Jacobiano:** J = r (¡no lo olvides!)

**Ejemplo:** Para integrar sobre un cilindro x² + y² ≤ 1, los límites son:
• r: [0, 1] ← ¡Súper simple!
• θ: [0, 2π] ← Vuelta completa
• z: [a, b] ← Según el problema

¿Ves cómo es 10 veces más fácil?`;
  }

  private explainSphericalCoordinates(context: IntegralSolution): string {
    return `**¿Por qué coordenadas esféricas?**

Las coordenadas esféricas (ρ, θ, φ) son **ideales** cuando:

1. **Simetría esférica**: Esferas, conos, superficies radiales
2. **Función con x² + y² + z²**: Se convierte en ρ² (¡increíblemente simple!)
3. **Problemas físicos**: Gravedad, campos eléctricos, distribuciones radiales

**Transformación:**
• x = ρ sin(φ) cos(θ)
• y = ρ sin(φ) sin(θ)
• z = ρ cos(φ)

**Jacobiano:** J = ρ² sin(φ) (¡crucial!)

**Límites típicos:**
• ρ: [0, R] ← Radio
• θ: [0, 2π] ← Azimut (vuelta completa)
• φ: [0, π] ← Polar (de polo norte a sur)

**Truco:** φ = 0 es el polo norte (z positivo), φ = π es el polo sur (z negativo).`;
  }

  private explainJacobian(context: IntegralSolution): string {
    return `**El Jacobiano explicado simple:**

**¿Qué es?** El Jacobiano mide cómo se "deforma" el espacio cuando cambias de coordenadas.

**Intuición:** Imagina que tienes una cuadrícula regular y la transformas:
• Si se **expande**: J > 1 (necesitas "más espacio")
• Si se **contrae**: J < 1 (necesitas "menos espacio")
• Si se **refleja**: J < 0 (cambio de orientación)

**Fórmulas importantes:**
• **Cilíndricas:** J = r
  - ¿Por qué? Porque los "anillos" se hacen más grandes conforme r aumenta
• **Esféricas:** J = ρ² sin(φ)
  - ¿Por qué? Porque las "capas esféricas" se hacen más grandes con ρ, y sin(φ) corrige la distorsión polar

**Regla de oro:** ¡NUNCA olvides incluir el Jacobiano en tu integral!

dV = dx dy dz = J du dv dw

**Ejemplo:** En cilíndricas, dx dy dz = r dr dθ dz.`;
  }

  private explainMethodChoice(context: IntegralSolution): string {
    const method = context.method;
    const coord = context.problem.coordinateSystem.type;

    return `**¿Por qué elegimos este método?**

**Sistema de coordenadas:** ${coord}
**Método de resolución:** ${method}

**Razones:**
${this.getMethodReasons(coord, method)}

**Alternativas que consideramos:**
${context.alternativeMethods?.map(alt => `• ${alt}`).join('\n') || 'Ninguna alternativa significativa'}

**Complejidad:** ${context.complexity}/5

La elección se basa en **simplicidad** y **eficiencia**. ¡Siempre buscamos el camino más directo!`;
  }

  private getMethodReasons(coord: string, method: string): string {
    let reasons = "";

    switch (coord) {
      case 'cylindrical':
        reasons += "• La región tiene simetría circular\n";
        reasons += "• Los términos x² + y² se simplifican a r²\n";
        reasons += "• Los límites son mucho más simples\n";
        break;
      case 'spherical':
        reasons += "• La región es esférica o tiene simetría radial\n";
        reasons += "• Los términos x² + y² + z² se simplifican a ρ²\n";
        reasons += "• Ideal para problemas físicos con simetría esférica\n";
        break;
      default:
        reasons += "• La región es rectangular o simple\n";
        reasons += "• No hay simetrías especiales que explotar\n";
        reasons += "• Las coordenadas cartesianas son las más directas\n";
    }

    if (method === 'analytical') {
      reasons += "• La integral se puede resolver exactamente\n";
      reasons += "• Obtenemos una respuesta precisa\n";
    } else {
      reasons += "• La integral es muy compleja para resolución exacta\n";
      reasons += "• Los métodos numéricos son más prácticos\n";
    }

    return reasons;
  }

  private suggestAlternativeMethods(context: IntegralSolution): string {
    return `**Métodos alternativos:**

${context.alternativeMethods?.map((method, index) =>
      `${index + 1}. **${method}**\n   ${this.getMethodDescription(method)}`
    ).join('\n\n') || 'No hay alternativas significativas para este problema.'}

**Recomendación:** El método actual es óptimo para este problema, pero explorar alternativas te ayuda a entender mejor los conceptos.`;
  }

  private getMethodDescription(method: string): string {
    const descriptions = {
      'Coordenadas cilíndricas': 'Útil cuando hay simetría circular',
      'Coordenadas esféricas': 'Ideal para simetrías esféricas o radiales',
      'Integración numérica (Monte Carlo)': 'Aproximación estadística, útil para regiones complejas',
      'Integración numérica (Simpson 3D)': 'Aproximación determinística de alta precisión'
    };

    return descriptions[method as keyof typeof descriptions] || 'Método alternativo de resolución';
  }

  private explainDifficulty(context: IntegralSolution): string {
    const complexity = context.complexity;
    const difficultyLevels = [
      'Muy fácil - Problema básico',
      'Fácil - Requiere conceptos fundamentales',
      'Moderado - Necesitas entender bien los conceptos',
      'Difícil - Requiere experiencia y técnica',
      'Muy difícil - Nivel experto'
    ];

    return `**Nivel de dificultad:** ${difficultyLevels[complexity - 1]} (${complexity}/5)

**Factores que afectan la dificultad:**
• Sistema de coordenadas: ${context.problem.coordinateSystem.type}
• Complejidad de la función: ${this.analyzeFunctionComplexity(context.problem.function.expression)}
• Tipo de región: ${context.problem.region?.type || 'rectangular'}

**Consejos para este nivel:**
${this.getDifficultyTips(complexity)}

¡No te desanimes! Cada problema resuelto te hace más fuerte.`;
  }

  private analyzeFunctionComplexity(expression: string): string {
    if (expression.includes('sin') || expression.includes('cos')) return 'Trigonométrica';
    if (expression.includes('exp') || expression.includes('log')) return 'Exponencial/Logarítmica';
    if (expression.includes('^') || expression.includes('sqrt')) return 'Polinomial/Radical';
    return 'Básica';
  }

  private getDifficultyTips(complexity: number): string[] {
    const tips = [
      ['• Practica los conceptos básicos', '• Dibuja la región siempre', '• Verifica cada paso'],
      ['• Identifica patrones comunes', '• Usa la visualización 3D', '• Compara con ejemplos similares'],
      ['• Domina los cambios de coordenadas', '• Practica el cálculo de Jacobianos', '• Analiza la simetría cuidadosamente'],
      ['• Considera múltiples enfoques', '• Descompón en subproblemas', '• Usa aproximaciones cuando sea necesario'],
      ['• Combina técnicas avanzadas', '• Busca transformaciones creativas', '• No temas usar métodos numéricos']
    ];

    return tips[complexity - 1] || tips[0];
  }

  private explainApplications(context: IntegralSolution): string {
    return `**Aplicaciones en la vida real:**

**Este tipo de integral se usa para:**
• **Ingeniería Civil:** Calcular volúmenes de estructuras complejas
• **Física:** Determinar centros de masa y momentos de inercia
• **Medicina:** Analizar distribuciones de medicamentos en órganos
• **Astronomía:** Calcular masas de cuerpos celestes
• **Ingeniería Química:** Concentraciones en reactores

**Ejemplo concreto:**
Si tu integral calcula el volumen de un tanque de combustible de forma irregular, el resultado te dice exactamente cuántos litros caben. ¡Eso es súper útil para el diseño!

**Industrias que lo usan:**
• Aeroespacial
• Automotriz
• Biomédica
• Energética
• Construcción

Las matemáticas están en todas partes.`;
  }

  private generateGenericResponse(question: string, context: IntegralSolution): string {
    return `**Interesante pregunta:** "${question}"

Basándome en el problema que estamos resolviendo, puedo decirte que:

• **Método actual:** ${context.method}
• **Sistema de coordenadas:** ${context.problem.coordinateSystem.type}
• **Complejidad:** ${context.complexity}/5

**¿Podrías ser más específico?** Por ejemplo:
• "¿Por qué usamos coordenadas cilíndricas?"
• "¿Qué es el Jacobiano?"
• "¿Hay métodos más fáciles?"
• "¿Para qué sirve esto en la vida real?"

¡Estoy aquí para ayudarte a entender cada detalle!`;
  }
}

export default AIExplanationAgent;
const express = require('express');
const axios = require('axios');
const {
  generateExplanation,
  explainStepByStep,
  answerConceptQuestion,
  compareResolutionMethods,
  detectAndExplainError,
  suggestMethod,
  generateFallbackResponse
} = require('../services/ai.service');
const router = express.Router();

// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Sistema de prompts especializado en integrales triples
const SYSTEM_PROMPT = `Eres un profesor experto en cálculo multivariable, especializado en integrales triples. Tu objetivo es ayudar a estudiantes a entender y resolver integrales triples de manera clara y didáctica.

Tus responsabilidades:
1. Explicar conceptos de integrales triples de forma clara y progresiva
2. Ayudar a elegir el sistema de coordenadas más apropiado
3. Explicar el cálculo de Jacobianos
4. Guiar en el establecimiento de límites de integración
5. Proporcionar ejemplos paso a paso
6. Detectar y corregir errores comunes

Siempre:
- Usa notación matemática clara
- Proporciona explicaciones intuitivas antes de las técnicas
- Sugiere métodos alternativos cuando sea apropiado
- Relaciona los conceptos con aplicaciones físicas
- Sé paciente y alentador

Formato de respuesta:
- Usa markdown para estructurar
- Incluye fórmulas matemáticas cuando sea necesario
- Proporciona ejemplos concretos
- Sugiere próximos pasos de aprendizaje`;

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📩 Mensaje recibido:', message);

    // Usar el servicio de IA (Groq/Gemini/Local)
    const aiRequest = {
      question: message,
      integral: context,
      conversationHistory: conversationHistory || []
    };

    const aiResponse = await generateExplanation(aiRequest);
    
    console.log('✅ Respuesta generada:', aiResponse.substring(0, 100) + '...');
    
    res.json({
      response: {
        text: aiResponse,
        suggestions: generateSuggestions(message, aiResponse),
        confidence: 'high',
        source: 'ai_service'
      },
      timestamp: new Date().toISOString(),
      context: 'integral_mathematics'
    });
  } catch (error) {
    console.error('❌ AI Chat error:', error);
    // Fallback a sistema basado en reglas
    try {
      const fallbackResponse = await generateRuleBasedResponse(req.body.message, req.body.context);
      res.json({
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        context: 'integral_mathematics',
        source: 'rule_based_fallback'
      });
    } catch (fallbackError) {
      console.error('❌ Fallback error:', fallbackError);
      res.status(500).json({ error: 'Error processing AI request' });
    }
  }
});

// Generar respuesta usando OpenAI
async function generateOpenAIResponse(message, context, conversationHistory = []) {
  try {
    // Construir el contexto de la conversación
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // Agregar historial de conversación (últimos 5 mensajes para mantener contexto)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }
    
    // Agregar contexto adicional si existe
    let contextualMessage = message;
    if (context) {
      contextualMessage += `\n\nContexto adicional: ${JSON.stringify(context)}`;
    }
    
    messages.push({ role: 'user', content: contextualMessage });
    
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-4',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const aiResponse = response.data.choices[0].message.content;
    
    return {
      text: aiResponse,
      suggestions: generateSuggestions(message, aiResponse),
      confidence: 'high',
      source: 'openai'
    };
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw error;
  }
}

// Generar respuesta basada en reglas (fallback)
async function generateRuleBasedResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Análisis más sofisticado del mensaje
  const keywords = {
    jacobiano: ['jacobiano', 'jacobian'],
    coordenadas: ['coordenadas', 'coordinates', 'cilindrica', 'esferica', 'cartesiana'],
    integral: ['integral', 'integrar', 'resolver', '∫'],
    limites: ['limites', 'límites', 'bounds', 'region'],
    aplicaciones: ['aplicacion', 'aplicación', 'ejemplo', 'practica'],
    conceptos: ['concepto', 'teoria', 'definicion', 'que es']
  };
  
  // Función para detectar categoría principal
  const detectCategory = (msg) => {
    const scores = {};
    Object.keys(keywords).forEach(category => {
      scores[category] = keywords[category].filter(keyword => 
        msg.includes(keyword)
      ).length;
    });
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  };
  
  const category = detectCategory(lowerMessage);
  
  // Respuestas contextuales mejoradas
  switch (category) {
    case 'jacobiano':
      return {
        text: `**El Jacobiano en Integrales Triples**\n\nEl Jacobiano es el factor de escala cuando cambias de sistema de coordenadas.\n\n**¿Por qué lo necesitas?**\nCuando transformas coordenadas, el "tamaño" de cada elemento de volumen cambia. El Jacobiano corrige esta distorsión.\n\n**Fórmulas clave:**\n\n**Cilíndricas (r, θ, z):**\n- Jacobiano: J = r\n- Elemento de volumen: dV = r dr dθ dz\n\n**Esféricas (ρ, θ, φ):**\n- Jacobiano: J = ρ² sin(φ)\n- Elemento de volumen: dV = ρ² sin(φ) dρ dθ dφ\n\n**Regla de oro:** ¡NUNCA olvides incluir el Jacobiano en la transformación!\n\n¿Quieres ver un ejemplo específico de cálculo?`,
        suggestions: ['Ejemplo con cilíndricas', 'Ejemplo con esféricas', 'Cálculo paso a paso']
      };
      
    case 'coordenadas':
      if (lowerMessage.includes('cilindrica')) {
        return {
          text: `**Coordenadas Cilíndricas (r, θ, z)**\n\n**¿Cuándo usarlas?**\n✓ Regiones con simetría circular (cilindros, conos)\n✓ Funciones que contienen x² + y²\n✓ Límites de integración circulares\n\n**Transformación:**\n- x = r cos(θ)\n- y = r sin(θ)\n- z = z\n\n**Jacobiano:** J = r\n**Elemento de volumen:** dV = r dr dθ dz\n\n**Límites típicos:**\n- r: [0, R] (radio)\n- θ: [0, 2π] (ángulo completo)\n- z: [a, b] (altura)\n\n**Ejemplo:** Para integrar sobre un cilindro x² + y² ≤ 4, 0 ≤ z ≤ 3\n- En cartesianas: límites complicados con √(4-x²)\n- En cilíndricas: r ∈ [0,2], θ ∈ [0,2π], z ∈ [0,3] ¡Mucho más simple!`,
          suggestions: ['Ejemplo completo', 'Cuándo NO usar cilíndricas', 'Comparar con esféricas']
        };
      }
      
      if (lowerMessage.includes('esferica')) {
        return {
          text: `**Coordenadas Esféricas (ρ, θ, φ)**\n\n**¿Cuándo usarlas?**\n✓ Regiones esféricas o con simetría radial\n✓ Funciones que contienen x² + y² + z²\n✓ Problemas físicos (gravedad, campos)\n\n**Transformación:**\n- x = ρ sin(φ) cos(θ)\n- y = ρ sin(φ) sin(θ)\n- z = ρ cos(φ)\n\n**Jacobiano:** J = ρ² sin(φ)\n**Elemento de volumen:** dV = ρ² sin(φ) dρ dθ dφ\n\n**Límites típicos:**\n- ρ: [0, R] (radio desde el origen)\n- θ: [0, 2π] (azimut, rotación en xy)\n- φ: [0, π] (polar, desde eje z positivo)\n\n**Importante:** φ = 0 es el polo norte, φ = π es el polo sur\n\n**Truco de memoria:** El orden de integración suele ser dρ dφ dθ (de adentro hacia afuera)`,
          suggestions: ['Ejemplo con esfera', 'Límites de φ', 'Diferencia con cilíndricas']
        };
      }
      
      return {
        text: `**Sistemas de Coordenadas para Integrales Triples**\n\n**¿Cuál elegir?**\n\n**Cartesianas (x, y, z):**\n- Regiones rectangulares\n- Límites constantes o lineales\n- Jacobiano: J = 1\n\n**Cilíndricas (r, θ, z):**\n- Simetría circular en el plano xy\n- Funciones con x² + y²\n- Jacobiano: J = r\n\n**Esféricas (ρ, θ, φ):**\n- Simetría esférica o radial\n- Funciones con x² + y² + z²\n- Jacobiano: J = ρ² sin(φ)\n\n**Regla práctica:** Elige el sistema que haga los límites más simples.`,
        suggestions: ['Ejemplos de cada sistema', 'Cómo elegir', 'Transformaciones']
      };
      
    case 'integral':
      return {
        text: `**Resolver Integrales Triples - Guía Paso a Paso**\n\n**Proceso sistemático:**\n\n1. **Analizar la región**\n   - ¿Qué forma tiene?\n   - ¿Hay simetrías?\n\n2. **Elegir coordenadas**\n   - Cartesianas: regiones rectangulares\n   - Cilíndricas: simetría circular\n   - Esféricas: simetría radial\n\n3. **Establecer límites**\n   - De adentro hacia afuera\n   - Verificar el orden\n\n4. **Incluir Jacobiano**\n   - Si cambias coordenadas\n   - ¡No lo olvides!\n\n5. **Integrar**\n   - Paso a paso\n   - De la integral más interna hacia afuera\n\n**¿Tienes una integral específica que quieres resolver?** Dame la función y la región.`,
        suggestions: ['Ejemplo paso a paso', 'Errores comunes', 'Verificar resultado']
      };
      
    case 'limites':
      return {
        text: `**Establecer Límites de Integración**\n\n**Principios fundamentales:**\n\n**1. Orden de integración:**\n- Se integra de adentro hacia afuera\n- Para ∫∫∫ f dz dy dx: primero z, luego y, finalmente x\n\n**2. Límites variables:**\n- Los límites internos pueden depender de variables externas\n- Ejemplo: z de 0 a x+y, y de 0 a √(1-x²), x de -1 a 1\n\n**3. Descripción de la región:**\n- Identifica las superficies que delimitan la región\n- Determina cuál variable varía entre qué límites\n\n**4. Verificación:**\n- Los límites deben describir completamente la región\n- No debe haber "huecos" ni "solapamientos"\n\n**Estrategia:** Dibuja la región (aunque sea un bosquejo) para visualizar los límites.`,
        suggestions: ['Ejemplos de límites', 'Cambiar orden', 'Regiones complejas']
      };
      
    case 'aplicaciones':
      return {
        text: `**Aplicaciones de Integrales Triples**\n\n**En Física e Ingeniería:**\n\n**1. Cálculo de volúmenes**\n- ∫∫∫ 1 dV = volumen de la región\n\n**2. Masa y densidad**\n- ∫∫∫ ρ(x,y,z) dV = masa total\n- ρ(x,y,z) = función de densidad\n\n**3. Centro de masa**\n- x̄ = (1/M) ∫∫∫ x ρ(x,y,z) dV\n\n**4. Momento de inercia**\n- I = ∫∫∫ r² ρ(x,y,z) dV\n\n**5. Campos vectoriales**\n- Flujo, divergencia, trabajo\n\n**En Ingeniería de Sistemas:**\n- Análisis de distribución de datos en espacios 3D\n- Cálculo de capacidades de almacenamiento\n- Modelado de flujos de energía\n\n¿Te interesa alguna aplicación específica?`,
        suggestions: ['Ejemplo de masa', 'Centro de masa', 'Momento de inercia']
      };
      
    default:
      return {
        text: `**Tutor de Integrales Triples**\n\nHola! Soy tu asistente especializado en integrales triples. Puedo ayudarte con:\n\n• **Conceptos fundamentales** (Jacobiano, coordenadas)\n• **Resolución paso a paso** de integrales\n• **Elección de coordenadas** apropiadas\n• **Establecimiento de límites** de integración\n• **Aplicaciones prácticas** en física e ingeniería\n\n**¿En qué tema específico necesitas ayuda?**\n\nPuedes preguntarme cosas como:\n- "¿Cómo calculo el Jacobiano?"\n- "¿Cuándo uso coordenadas cilíndricas?"\n- "Ayúdame a resolver esta integral..."\n- "¿Cómo establezco los límites?"`,
        suggestions: ['Conceptos básicos', 'Resolver integral', 'Elegir coordenadas', 'Aplicaciones']
      };
  }
}

// Get AI explanation for a specific topic
router.get('/explain/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const explanation = await getTopicExplanation(topic);
    
    res.json(explanation);
  } catch (error) {
    console.error('AI Explanation error:', error);
    res.status(500).json({ error: 'Error generating explanation' });
  }
});

async function getTopicExplanation(topic) {
  const explanations = {
    'jacobian': {
      title: 'El Jacobiano en Integrales Triples',
      content: 'El Jacobiano es fundamental cuando cambiamos de sistema de coordenadas. Representa cómo se "estira" o "comprime" el espacio durante la transformación.',
      formula: 'J = |∂(x,y,z)/∂(u,v,w)|',
      examples: [
        'Cilíndricas: J = r',
        'Esféricas: J = ρ² sin(φ)'
      ]
    },
    'coordinates': {
      title: 'Sistemas de Coordenadas',
      content: 'La elección correcta del sistema de coordenadas puede simplificar enormemente una integral triple.',
      formula: 'Cartesianas → Cilíndricas → Esféricas',
      examples: [
        'Cilindro: usar cilíndricas',
        'Esfera: usar esféricas'
      ]
    }
  };
  
  return explanations[topic] || {
    title: 'Tema no encontrado',
    content: 'No tengo información específica sobre este tema.',
    formula: '',
    examples: []
  };
}

// Generar sugerencias basadas en el mensaje y respuesta
function generateSuggestions(userMessage, aiResponse) {
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();
  
  const suggestions = [];
  
  // Sugerencias basadas en el tema
  if (lowerMessage.includes('jacobiano') || lowerResponse.includes('jacobiano')) {
    suggestions.push("¿Cómo se calcula el Jacobiano?", "Ejemplos con Jacobiano", "¿Por qué es necesario?");
  }
  
  if (lowerMessage.includes('coordenadas') || lowerResponse.includes('coordenadas')) {
    suggestions.push("¿Cuándo usar cilíndricas?", "¿Cuándo usar esféricas?", "Comparar sistemas");
  }
  
  if (lowerMessage.includes('límites') || lowerResponse.includes('límites')) {
    suggestions.push("¿Cómo visualizar la región?", "Límites variables", "Orden de integración");
  }
  
  if (lowerMessage.includes('resolver') || lowerResponse.includes('resolver')) {
    suggestions.push("Ejemplo paso a paso", "¿Cómo verificar el resultado?", "Métodos alternativos");
  }
  
  // Sugerencias por defecto si no hay específicas
  if (suggestions.length === 0) {
    suggestions.push(
      "Resolver una integral específica",
      "Explicar conceptos básicos",
      "Aplicaciones prácticas"
    );
  }
  
  return suggestions.slice(0, 3); // Máximo 3 sugerencias
}

// Resolver integral específica
router.post('/solve', async (req, res) => {
  try {
    const { function: func, limits, coordinateSystem, precision } = req.body;
    
    if (!func || !limits) {
      return res.status(400).json({ error: 'Function and limits are required' });
    }

    // Generar explicación paso a paso usando IA
    const explanation = await generateSolutionExplanation(func, limits, coordinateSystem);
    
    // Calcular resultado numérico (esto se haría con el solver existente)
    const result = {
      value: 'Resultado calculado', // Aquí iría el cálculo real
      steps: explanation.steps,
      method: coordinateSystem || 'cartesian',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      result,
      explanation: explanation.text,
      recommendations: explanation.recommendations
    });
  } catch (error) {
    console.error('Solve error:', error);
    res.status(500).json({ error: 'Error solving integral' });
  }
});

// Generar explicación de solución paso a paso
async function generateSolutionExplanation(func, limits, coordinateSystem) {
  const steps = [
    `Función a integrar: f(x,y,z) = ${func}`,
    `Límites de integración: ${JSON.stringify(limits)}`,
    `Sistema de coordenadas: ${coordinateSystem || 'cartesian'}`
  ];
  
  let text = `**Resolución paso a paso:**\n\n`;
  
  // Análisis del sistema de coordenadas
  if (coordinateSystem === 'cylindrical') {
    text += `**¿Por qué cilíndricas?**\nLa función o región sugiere simetría circular.\n\n`;
    text += `**Transformación:**\n• x = r cos(θ)\n• y = r sin(θ)\n• z = z\n\n`;
    text += `**Jacobiano:** J = r\n\n`;
    steps.push('Aplicar transformación cilíndrica');
    steps.push('Incluir Jacobiano J = r');
  } else if (coordinateSystem === 'spherical') {
    text += `**¿Por qué esféricas?**\nLa función o región tiene simetría esférica.\n\n`;
    text += `**Transformación:**\n• x = ρ sin(φ) cos(θ)\n• y = ρ sin(φ) sin(θ)\n• z = ρ cos(φ)\n\n`;
    text += `**Jacobiano:** J = ρ² sin(φ)\n\n`;
    steps.push('Aplicar transformación esférica');
    steps.push('Incluir Jacobiano J = ρ² sin(φ)');
  } else {
    text += `**Sistema cartesiano:**\nLa región es rectangular o no hay simetrías especiales.\n\n`;
    steps.push('Usar coordenadas cartesianas directamente');
  }
  
  steps.push('Establecer límites de integración');
  steps.push('Integrar de adentro hacia afuera');
  steps.push('Evaluar en los límites');
  
  const recommendations = [
    'Verifica que los límites estén correctos',
    'Asegúrate de incluir el Jacobiano si cambias coordenadas',
    'Comprueba el resultado con métodos alternativos'
  ];
  
  return { text, steps, recommendations };
}

// NUEVOS ENDPOINTS ESPECIALIZADOS

// Endpoint 1: Explicación contextual de integral
router.post('/explain', async (req, res) => {
  try {
    const { integral, question, conversationHistory } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    let explanation;
    
    // Intentar con OpenAI primero
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key_here') {
      try {
        explanation = await generateExplanation({
          integral,
          question,
          conversationHistory,
        });
      } catch (error) {
        console.log('OpenAI failed, using fallback:', error.message);
        explanation = generateFallbackResponse(question, integral);
      }
    } else {
      explanation = generateFallbackResponse(question, integral);
    }

    res.json({
      success: true,
      data: {
        explanation,
        timestamp: Date.now(),
        source: OPENAI_API_KEY ? 'openai' : 'fallback'
      },
    });
  } catch (error) {
    console.error('Error in /explain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint 2: Explicación paso a paso
router.post('/step-by-step', async (req, res) => {
  try {
    const { integral } = req.body;
    
    if (!integral) {
      return res.status(400).json({ error: 'Integral is required' });
    }

    let explanation;
    
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key_here') {
      try {
        explanation = await explainStepByStep(integral);
      } catch (error) {
        console.log('OpenAI failed for step-by-step, using fallback:', error.message);
        explanation = generateFallbackResponse('explicar paso a paso', integral);
      }
    } else {
      explanation = generateFallbackResponse('explicar paso a paso', integral);
    }

    res.json({
      success: true,
      data: {
        explanation,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error in /step-by-step:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint 3: Preguntas sobre conceptos (sin integral específica)
router.post('/concept', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    let answer;
    
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key_here') {
      try {
        answer = await answerConceptQuestion(question);
      } catch (error) {
        console.log('OpenAI failed for concept, using fallback:', error.message);
        answer = generateFallbackResponse(question);
      }
    } else {
      answer = generateFallbackResponse(question);
    }

    res.json({
      success: true,
      data: {
        answer,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error in /concept:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint 4: Comparar métodos
router.post('/compare', async (req, res) => {
  try {
    const { integral, method1, method2 } = req.body;
    
    if (!integral || !method1 || !method2) {
      return res.status(400).json({ error: 'Integral and both methods are required' });
    }

    let comparison;
    
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key_here') {
      try {
        comparison = await compareResolutionMethods(integral, method1, method2);
      } catch (error) {
        console.log('OpenAI failed for comparison, using fallback:', error.message);
        comparison = generateFallbackResponse(`comparar ${method1} vs ${method2}`, integral);
      }
    } else {
      comparison = generateFallbackResponse(`comparar ${method1} vs ${method2}`, integral);
    }

    res.json({
      success: true,
      data: {
        comparison,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error in /compare:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint 5: Detectar error
router.post('/check-error', async (req, res) => {
  try {
    const { integral, userStep, userAnswer } = req.body;
    
    if (!integral || !userStep || !userAnswer) {
      return res.status(400).json({ error: 'Integral, userStep and userAnswer are required' });
    }

    let result;
    
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key_here') {
      try {
        result = await detectAndExplainError(integral, userStep, userAnswer);
      } catch (error) {
        console.log('OpenAI failed for error check, using fallback:', error.message);
        result = {
          hasError: false,
          explanation: generateFallbackResponse('revisar error', integral)
        };
      }
    } else {
      result = {
        hasError: false,
        explanation: generateFallbackResponse('revisar error', integral)
      };
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in /check-error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint 6: Sugerir método
router.post('/suggest-method', async (req, res) => {
  try {
    const { integral } = req.body;
    
    if (!integral) {
      return res.status(400).json({ error: 'Integral is required' });
    }

    let suggestion;
    
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key_here') {
      try {
        suggestion = await suggestMethod(integral);
      } catch (error) {
        console.log('OpenAI failed for suggestion, using fallback:', error.message);
        suggestion = generateFallbackResponse('sugerir método', integral);
      }
    } else {
      suggestion = generateFallbackResponse('sugerir método', integral);
    }

    res.json({
      success: true,
      data: {
        suggestion,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error in /suggest-method:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
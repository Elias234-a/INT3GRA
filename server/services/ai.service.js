const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

// Configuración de clientes de IA
let geminiClient = null;
let groqClient = null;
let aiProvider = process.env.AI_PROVIDER || 'groq';

// Configurar Groq
try {
  if (process.env.GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    console.log('✅ Groq AI configurado correctamente (Llama 3 70B)');
    aiProvider = 'groq';
  }
} catch (error) {
  console.log('Groq no configurado');
}

// Configurar Google Gemini
try {
  if (process.env.GOOGLE_API_KEY && !groqClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log('✅ Google Gemini AI configurado correctamente');
    aiProvider = 'gemini';
  }
} catch (error) {
  console.log('Google Gemini no configurado');
}

if (!groqClient && !geminiClient) {
  console.log('⚠️ Usando sistema local gratuito (sin IA externa)');
  aiProvider = 'local';
}

// PROMPT SISTEMA: Define qué es la IA y qué puede hacer
const SYSTEM_PROMPT = `You are an expert mathematics tutor specialized ONLY in explaining triple integrals (∫∫∫).

YOUR RULES:
1. ONLY answer questions about triple integrals, Jacobians, coordinate systems (Cartesian, cylindrical, spherical), and integration techniques
2. NEVER solve new integral problems - only EXPLAIN existing ones
3. NEVER answer questions outside mathematics/triple integrals
4. ALWAYS reference the current integral context if provided
5. Be EDUCATIONAL - guide understanding, don't just give answers
6. Use LaTeX for equations: write \\(equation\\) or \\[equation\\]
7. Break down complex concepts into simple steps
8. Use analogies and visual descriptions
9. Respond in Spanish (the user interface is in Spanish)

IF user asks about something else:
- Respond: "Solo puedo ayudar con integrales triples. ¿Tienes preguntas sobre integrales?"

IF user asks to solve a new integral:
- Respond: "No resuelvo integrales nuevas. Usa la función RESOLVER para eso. ¡Pero puedo EXPLICAR cómo resolver la tuya paso a paso!"

WHEN explaining a solution:
- Use numbered steps
- Show each equation transformation
- Explain WHY each step is correct
- Highlight common mistakes

When user asks "explain this integral":
Format your response as:
PASO 1: [Step name]
├─ Descripción: ...
├─ Ecuación: \\(...\\)
├─ Por qué: ...
└─ Visualización mental: ...

PASO 2: [Next step]
...

Always end with: "¿Te queda claro este paso? ¿Qué más te gustaría saber?"`;

/**
 * Genera explicación contextual de una integral
 */
async function generateExplanation(req) {
  // Construir contexto de integral actual
  const integralContext = req.integral ? `
CONTEXTO DE INTEGRAL ACTUAL:
- Función: ${req.integral.functionInput}
- Límites: x ∈ [${req.integral.limits.x.join(', ')}], y ∈ [${req.integral.limits.y.join(', ')}], z ∈ [${req.integral.limits.z.join(', ')}]
- Sistema de Coordenadas: ${req.integral.coordinateSystem}
- Resultado: ${req.integral.exactResult || req.integral.numericalResult}
${req.integral.steps ? `- Pasos de Resolución: ${req.integral.steps.length} pasos` : ''}
---` : '';

  // Construir historial de conversación
  let conversationHistory = '';
  if (req.conversationHistory && req.conversationHistory.length > 0) {
    conversationHistory = req.conversationHistory.map(msg => 
      `${msg.role === 'ai' ? 'Asistente' : 'Usuario'}: ${msg.content}`
    ).join('\n\n');
  }

  // Prompt completo
  const fullPrompt = `${SYSTEM_PROMPT}

${integralContext}

${conversationHistory ? `HISTORIAL DE CONVERSACIÓN:\n${conversationHistory}\n\n` : ''}

PREGUNTA ACTUAL: ${req.question}

Responde en español, siendo educativo y específico sobre integrales triples.`;

  // Usar Groq si está disponible (PRIORIDAD)
  if (groqClient) {
    try {
      console.log('🚀 Usando Groq (Llama 3 70B) para explicación');
      const completion = await groqClient.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        model: 'llama3-70b-8192', // Llama 3 70B - muy potente
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error con Groq, intentando fallback:', error);
    }
  }

  // Usar Google Gemini como fallback
  if (geminiClient) {
    try {
      console.log('📊 Usando Google Gemini para explicación');
      const model = geminiClient.getGenerativeModel({ model: 'models/gemini-pro' });
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Error con Gemini, usando sistema local:', error);
    }
  }

  // Sistema local como último recurso
  console.log('💾 Usando sistema local gratuito para explicación');
  return generateFallbackResponse(req.question, req.integral);
}

/**
 * Explica paso a paso la resolución completa de una integral
 */
async function explainStepByStep(integral) {
  // Usar Google Gemini si está disponible
  if (!geminiClient) {
    console.log('Usando sistema local gratuito para explicación paso a paso');
    return generateFallbackResponse('paso a paso', integral);
  }

  try {
    const stepExplanationPrompt = `
EXPLICA LA RESOLUCIÓN DE ESTA INTEGRAL PASO A PASO:

Integral: ∫∫∫ ${integral.functionInput} dV
Límites:
- x: [${integral.limits.x.join(', ')}]
- y: [${integral.limits.y.join(', ')}]
- z: [${integral.limits.z.join(', ')}]
Sistema de Coordenadas: ${integral.coordinateSystem}

Proporciona una explicación DETALLADA paso a paso:
1. Identifica la región de integración
2. Sugiere el mejor sistema de coordenadas (o confirma el actual)
3. Configura la integral en el sistema elegido
4. Muestra el cálculo del Jacobiano (si hay cambio de coordenadas)
5. Integra paso a paso (integral más interna primero)
6. Explica por qué usamos este orden
7. Simplifica y obtén el resultado final
8. Interpreta el resultado geométricamente

Formatea CADA paso como:
PASO [N]: [Título]
├─ Qué: [Qué estamos haciendo]
├─ Por qué: [Por qué este paso es necesario]
├─ Cómo: \\(...\\)
├─ Resultado: \\(...\\)
└─ Error común: [Error que hay que evitar]
`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: stepExplanationPrompt,
        },
      ],
      temperature: 0.5, // Más bajo para coherencia
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error en explainStepByStep:', error);
    throw error;
  }
}

/**
 * Responde preguntas sobre conceptos generales
 */
async function answerConceptQuestion(question) {
  try {
    const conceptPrompt = `
Estás explicando conceptos de integrales triples a un estudiante.

Pregunta: ${question}

Pautas:
- Comienza con una explicación simple
- Usa analogías
- Da ejemplos concretos
- Formatea con LaTeX: \\(...\\)
- Termina con "¿Tiene sentido esto? ¿Qué más te gustaría saber?"

La respuesta debe ser clara y educativa.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: conceptPrompt,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error en answerConceptQuestion:', error);
    throw error;
  }
}

/**
 * Compara dos métodos de resolución
 */
async function compareResolutionMethods(integral, method1, method2) {
  try {
    const comparisonPrompt = `
Compara resolver esta integral usando DOS sistemas de coordenadas diferentes:

Integral: ∫∫∫ ${integral.functionInput} dV
Límites:
- x: [${integral.limits.x.join(', ')}]
- y: [${integral.limits.y.join(', ')}]
- z: [${integral.limits.z.join(', ')}]

Compara: ${method1.toUpperCase()} vs ${method2.toUpperCase()}

Para cada método muestra:
1. Ecuaciones de transformación
2. Jacobiano
3. Configuración de la integral
4. Nivel de complejidad (⭐-⭐⭐⭐⭐⭐)
5. Número de pasos algebraicos
6. Cuál es más fácil y por qué

Formato:
MÉTODO 1: ${method1.toUpperCase()}
├─ Configuración: \\(...\\)
├─ Jacobiano: \\(...\\)
├─ Complejidad: ⭐⭐⭐
└─ Por qué: ...

MÉTODO 2: ${method2.toUpperCase()}
├─ Configuración: \\(...\\)
├─ Jacobiano: \\(...\\)
├─ Complejidad: ⭐
└─ Por qué: ...

GANADOR: [Cuál es mejor y por qué]
`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: comparisonPrompt,
        },
      ],
      temperature: 0.6,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error en compareResolutionMethods:', error);
    throw error;
  }
}

/**
 * Detecta y explica errores comunes
 */
async function detectAndExplainError(integral, userStep, userAnswer) {
  try {
    const errorCheckPrompt = `
Un estudiante está resolviendo esta integral: ∫∫∫ ${integral.functionInput} dV

Su paso: ${userStep}
Su respuesta: ${userAnswer}

¿Es esto correcto? Si no:
1. Identifica el error
2. Explica qué está mal
3. Muestra el enfoque correcto
4. Explica por qué importa

Responde en formato JSON:
{
  "hasError": boolean,
  "explanation": "string con explicación detallada"
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: errorCheckPrompt,
        },
      ],
      temperature: 0.5,
    });

    const text = response.choices[0].message.content;
    
    try {
      return JSON.parse(text);
    } catch {
      return {
        hasError: false,
        explanation: text,
      };
    }
  } catch (error) {
    console.error('Error en detectAndExplainError:', error);
    throw error;
  }
}

/**
 * Sugiere el mejor método para resolver una integral
 */
async function suggestMethod(integral) {
  try {
    const suggestionPrompt = `
Un estudiante tiene esta integral para resolver:
∫∫∫ ${integral.functionInput} dV
Con límites:
- x ∈ [${integral.limits.x.join(', ')}]
- y ∈ [${integral.limits.y.join(', ')}]
- z ∈ [${integral.limits.z.join(', ')}]

Sin resolverla, sugiere:
1. MEJOR sistema de coordenadas a usar (y por qué)
2. Por qué otros sistemas serían más difíciles
3. Observaciones clave sobre la región y función
4. Primeros pasos que deberían tomar
5. Qué tener en cuenta

Sé alentador y educativo.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: suggestionPrompt,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error en suggestMethod:', error);
    throw error;
  }
}

/**
 * Sistema de fallback cuando OpenAI no está disponible
 */
function generateFallbackResponse(question, integral = null) {
  const fallbackResponses = {
    jacobiano: `
**El Jacobiano en Integrales Triples**

El **Jacobiano** es un factor de corrección cuando cambiamos de sistema de coordenadas.

**¿Por qué lo necesitamos?**
Cuando transformamos coordenadas, el "tamaño" de los elementos de volumen cambia. El Jacobiano nos dice cuánto.

**Jacobianos por sistema:**
- **Cartesianas**: J = 1 (no hay cambio)
- **Cilíndricas**: J = r (el volumen se "estira" con el radio)  
- **Esféricas**: J = ρ²sin(φ) (doble estiramiento: radio y latitud)

**Ejemplo visual:**
Imagina cortar una pizza. En coordenadas cartesianas, cada pedacito es un cuadrado. En cilíndricas, los pedacitos cerca del centro son más pequeños que los del borde. El Jacobiano "r" compensa esta diferencia.

**Fórmula general:**
∫∫∫ f(x,y,z) dV = ∫∫∫ f(transformada) × |J| du dv dw

¿Te queda claro este concepto? ¿Qué más te gustaría saber?`,

    coordenadas: `
**Sistemas de Coordenadas para Integrales Triples**

**1. CARTESIANAS (x, y, z)**
- **Usa cuando**: La región es rectangular, cúbica o tiene lados paralelos a los ejes
- **Jacobiano**: J = 1
- **Ventaja**: Más simple, cálculos directos
- **Ejemplo**: Cubo [0,1]³, paralelepípedo

**2. CILÍNDRICAS (r, θ, z)**  
- **Usa cuando**: Hay simetría circular, cilindros, conos
- **Transformación**: x = r·cos(θ), y = r·sin(θ), z = z
- **Jacobiano**: J = r
- **Ventaja**: Simplifica funciones con x² + y²
- **Ejemplo**: Cilindro x² + y² ≤ 1, cono z = √(x² + y²)

**3. ESFÉRICAS (ρ, θ, φ)**
- **Usa cuando**: Hay simetría esférica
- **Transformación**: x = ρ·sin(φ)·cos(θ), y = ρ·sin(φ)·sin(θ), z = ρ·cos(φ)
- **Jacobiano**: J = ρ²·sin(φ)
- **Ventaja**: Simplifica funciones con x² + y² + z²
- **Ejemplo**: Esfera x² + y² + z² ≤ 1

**Regla de oro:** Si ves x² + y² → cilíndricas, si ves x² + y² + z² → esféricas.

¿Qué sistema te gustaría que explique más a fondo?`,

    limites: `
**Límites de Integración en Integrales Triples**

**Orden de Integración:**
La integral ∫∫∫ f(x,y,z) dz dy dx se resuelve de adentro hacia afuera:
1. **Primero z**: límites pueden depender de x, y
2. **Luego y**: límites pueden depender de x  
3. **Finalmente x**: límites constantes

**Tipos de Límites:**
- **Constantes**: [0, 1] → más fácil de calcular
- **Variables**: [0, x²] → depende de otra variable
- **Funciones**: [0, √(1-x²)] → región más compleja

**Estrategia para configurar límites:**
1. **Dibuja la región** (si es posible)
2. **Identifica la variable "externa"** (que encierra a las otras)
3. **Esa variable va en la integral externa**
4. **Verifica geométricamente** que los límites tengan sentido

**Ejemplo práctico:**
Para un cilindro x² + y² ≤ 1, 0 ≤ z ≤ 2:
- En cartesianas: ∫₋₁¹ ∫₋√(1-x²)^√(1-x²) ∫₀² f(x,y,z) dz dy dx
- En cilíndricas: ∫₀^2π ∫₀¹ ∫₀² f(r,θ,z) r dz dr dθ (¡mucho más simple!)

¿Tienes una región específica que te esté dando problemas?`,

    pasos: `
**Explicación Paso a Paso de tu Integral**

**PASO 1: Análisis de la función**
├─ Función: ${integral ? integral.functionInput : 'f(x,y,z)'}
├─ Sistema: ${integral ? integral.coordinateSystem : 'cartesianas'}
├─ Por qué este sistema: ${integral ? getSystemReason(integral) : 'Depende de la simetría de la región'}

**PASO 2: Configuración de límites**
├─ Límites x: ${integral ? `[${integral.limits.x.join(', ')}]` : '[a, b]'}
├─ Límites y: ${integral ? `[${integral.limits.y.join(', ')}]` : '[c, d]'}  
├─ Límites z: ${integral ? `[${integral.limits.z.join(', ')}]` : '[e, f]'}
├─ Orden de integración: dz dy dx (de adentro hacia afuera)

**PASO 3: Aplicación del Jacobiano**
├─ Jacobiano para ${integral ? integral.coordinateSystem : 'cartesianas'}: ${integral ? getJacobian(integral.coordinateSystem) : 'J = 1'}
├─ Elemento de volumen: ${integral ? getVolumeElement(integral.coordinateSystem) : 'dx dy dz'}

**PASO 4: Integración**
├─ Se integra de adentro hacia afuera
├─ Cada integral se resuelve usando técnicas estándar
├─ El resultado final es: ${integral && integral.result ? integral.result.decimal.toFixed(4) : 'valor numérico'}

**PASO 5: Interpretación**
├─ El resultado representa el volumen/masa/etc. de la región
├─ Las unidades dependen de lo que representa f(x,y,z)

¿Te queda claro algún paso específico? ¿Qué parte te gustaría que explique más?`,

    comparar: `
**Comparación de Métodos para tu Integral**

${integral ? generateMethodComparison(integral) : `
**Comparación General de Sistemas:**

**CARTESIANAS vs CILÍNDRICAS vs ESFÉRICAS**

**Cartesianas (x,y,z):**
✅ Ventajas: Cálculos directos, límites rectangulares simples
❌ Desventajas: Complicado para regiones circulares/esféricas

**Cilíndricas (r,θ,z):**
✅ Ventajas: Ideal para cilindros, conos, funciones con x²+y²
❌ Desventajas: Más complejo si no hay simetría circular

**Esféricas (ρ,θ,φ):**
✅ Ventajas: Perfecto para esferas, funciones con x²+y²+z²
❌ Desventajas: Límites complejos, jacobiano más difícil

**Regla de selección:**
1. ¿Hay x²+y²+z² en la función? → Esféricas
2. ¿Hay x²+y² en la función? → Cilíndricas  
3. ¿Región rectangular? → Cartesianas
4. ¿En duda? → Prueba cartesianas primero
`}

¿Te gustaría que compare métodos específicos para tu integral?`,

    errores: `
**Errores Comunes en Integrales Triples**

**1. JACOBIANO OLVIDADO**
❌ Error: Cambiar coordenadas sin aplicar jacobiano
✅ Correcto: Siempre multiplicar por |J| al transformar

**2. LÍMITES INCORRECTOS**
❌ Error: Límites que no describen la región correcta
✅ Correcto: Dibujar la región y verificar geométricamente

**3. ORDEN DE INTEGRACIÓN**
❌ Error: Integrar en orden incorrecto
✅ Correcto: De adentro hacia afuera, variable más "interna" primero

**4. TRANSFORMACIONES ERRÓNEAS**
❌ Error: x = r·sin(θ) en cilíndricas (¡es coseno!)
✅ Correcto: x = r·cos(θ), y = r·sin(θ)

**5. ÁNGULOS EN ESFÉRICAS**
❌ Error: Confundir φ (polar) con θ (azimutal)
✅ Correcto: φ va de 0 a π, θ va de 0 a 2π

**Consejo:** Siempre verifica dimensionalmente que tu resultado tenga sentido.

¿Has cometido alguno de estos errores? ¿Te ayudo a identificar el problema?`,

    default: `
**Tutor IA de Integrales Triples - Sistema Gratuito**

Soy un tutor especializado en **integrales triples**. Puedo ayudarte con:

**📊 Conceptos básicos:**
- Jacobiano y transformaciones
- Sistemas de coordenadas
- Configuración de límites

**🔄 Comparaciones:**
- Cartesianas vs Cilíndricas vs Esféricas
- Ventajas y desventajas de cada método

**📐 Estrategias:**
- Qué sistema usar para cada problema
- Cómo simplificar cálculos complejos

**⚠️ Solución de problemas:**
- Errores comunes y cómo evitarlos
- Verificación de resultados

**Pregúntame sobre:**
- "¿Qué es el Jacobiano?"
- "¿Cuándo usar coordenadas cilíndricas?"
- "¿Cómo configurar los límites?"
- "Explica mi integral paso a paso"
- "¿Por qué mi resultado está mal?"

**💡 Sistema 100% Gratuito:** No requiere API keys ni costos adicionales.

¿En qué concepto específico te gustaría que te ayude?`
  };

  // Funciones auxiliares para respuestas contextuales
  function getSystemReason(integral) {
    const func = integral.functionInput.toLowerCase();
    if (func.includes('x^2 + y^2 + z^2') || func.includes('x**2 + y**2 + z**2')) {
      return 'Función contiene x²+y²+z², ideal para esféricas';
    } else if (func.includes('x^2 + y^2') || func.includes('x**2 + y**2')) {
      return 'Función contiene x²+y², ideal para cilíndricas';
    } else {
      return 'Región rectangular, cartesianas es apropiado';
    }
  }

  function getJacobian(system) {
    const jacobians = {
      cartesian: 'J = 1',
      cylindrical: 'J = r', 
      spherical: 'J = ρ²sin(φ)'
    };
    return jacobians[system] || 'J = 1';
  }

  function getVolumeElement(system) {
    const elements = {
      cartesian: 'dx dy dz',
      cylindrical: 'r dr dθ dz',
      spherical: 'ρ²sin(φ) dρ dθ dφ'
    };
    return elements[system] || 'dx dy dz';
  }

  function generateMethodComparison(integral) {
    const func = integral.functionInput.toLowerCase();
    let comparison = `**Análisis para tu integral: ${integral.functionInput}**\n\n`;
    
    if (func.includes('x^2 + y^2 + z^2') || func.includes('x**2 + y**2 + z**2')) {
      comparison += `🏆 **ESFÉRICAS es el ganador**\n`;
      comparison += `✅ Tu función contiene x²+y²+z², se simplifica a ρ²\n`;
      comparison += `✅ Jacobiano ρ²sin(φ) se cancela parcialmente\n`;
      comparison += `❌ Cartesianas: Muy complejo\n`;
      comparison += `❌ Cilíndricas: No aprovecha la simetría completa\n`;
    } else if (func.includes('x^2 + y^2') || func.includes('x**2 + y**2')) {
      comparison += `🏆 **CILÍNDRICAS es el ganador**\n`;
      comparison += `✅ Tu función contiene x²+y², se simplifica a r²\n`;
      comparison += `✅ Jacobiano r es simple de manejar\n`;
      comparison += `❌ Cartesianas: Límites circulares complejos\n`;
      comparison += `❌ Esféricas: Innecesariamente complejo\n`;
    } else {
      comparison += `🏆 **CARTESIANAS es apropiado**\n`;
      comparison += `✅ Función simple, no necesita transformaciones\n`;
      comparison += `✅ Límites rectangulares directos\n`;
      comparison += `❌ Cilíndricas: Complicaría sin beneficio\n`;
      comparison += `❌ Esféricas: Mucho más complejo\n`;
    }
    
    return comparison;
  }

  // Buscar respuesta relevante con detección inteligente
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('jacobiano')) {
    return fallbackResponses.jacobiano;
  } else if (questionLower.includes('coordenadas') || questionLower.includes('sistema')) {
    return fallbackResponses.coordenadas;
  } else if (questionLower.includes('límites') || questionLower.includes('limites')) {
    return fallbackResponses.limites;
  } else if (questionLower.includes('paso a paso') || questionLower.includes('pasos') || questionLower.includes('explica')) {
    return fallbackResponses.pasos;
  } else if (questionLower.includes('comparar') || questionLower.includes('vs') || questionLower.includes('mejor método')) {
    return fallbackResponses.comparar;
  } else if (questionLower.includes('error') || questionLower.includes('mal') || questionLower.includes('incorrecto')) {
    return fallbackResponses.errores;
  } else if (questionLower.includes('cilíndrica') || questionLower.includes('cilindrica')) {
    return fallbackResponses.coordenadas;
  } else if (questionLower.includes('esférica') || questionLower.includes('esferica')) {
    return fallbackResponses.coordenadas;
  } else if (questionLower.includes('cartesiana')) {
    return fallbackResponses.coordenadas;
  } else {
    return fallbackResponses.default;
  }
}

module.exports = {
  generateExplanation,
  explainStepByStep,
  answerConceptQuestion,
  compareResolutionMethods,
  detectAndExplainError,
  suggestMethod,
  generateFallbackResponse
};

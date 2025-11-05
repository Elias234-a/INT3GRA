// Función serverless para chat general de IA
exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { message, context: chatContext, conversationHistory } = JSON.parse(event.body);

    // Prioridad: Groq > Fallback local
    if (process.env.GROQ_API_KEY) {
      try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Eres un tutor experto en integrales triples y cálculo multivariable. 
              RESTRICCIONES ESTRICTAS:
              - SOLO respondes sobre integrales triples
              - NUNCA resuelves problemas nuevos (guías al usuario al solver)
              - Explicas conceptos: Jacobiano, coordenadas, límites
              - Formato educativo con pasos numerados
              - Usa LaTeX para ecuaciones
              - Responde en español`
            },
            ...(conversationHistory || chatContext || []),
            { role: "user", content: message }
          ],
          model: "llama3-70b-8192",
          temperature: 0.7,
          max_tokens: 1500
        });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            response: completion.choices[0].message.content,
            timestamp: Date.now(),
            source: 'groq'
          })
        };
      } catch (groqError) {
        console.error('Error con Groq:', groqError);
        // Continuar al fallback
      }
    }

    // Fallback local basado en palabras clave
    let fallbackResponse = "**Tutor IA - INTEGRA**\n\n";
    
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('jacobiano')) {
      fallbackResponse += `**El Jacobiano en Integrales Triples**

**¿Qué es?**
El Jacobiano es un factor de corrección que aparece al cambiar de coordenadas.

**Valores comunes:**
- **Cartesianas:** J = 1
- **Cilíndricas:** J = r  
- **Esféricas:** J = ρ²sin(φ)

**¿Por qué es necesario?**
Compensa la deformación del espacio al cambiar coordenadas.`;
    } else if (messageLower.includes('cilindrica') || messageLower.includes('cilíndrica')) {
      fallbackResponse += `**Coordenadas Cilíndricas**

**Transformación:**
- x = r·cos(θ)
- y = r·sin(θ)  
- z = z

**Cuándo usar:**
- Simetría circular en el plano xy
- Cilindros, conos, paraboloides circulares

**Jacobiano:** J = r`;
    } else if (messageLower.includes('esferica') || messageLower.includes('esférica')) {
      fallbackResponse += `**Coordenadas Esféricas**

**Transformación:**
- x = ρ·sin(φ)·cos(θ)
- y = ρ·sin(φ)·sin(θ)
- z = ρ·cos(φ)

**Cuándo usar:**
- Simetría esférica
- Esferas, hemisferios

**Jacobiano:** J = ρ²sin(φ)`;
    } else {
      fallbackResponse += `Hola! Soy tu tutor de integrales triples.

**Puedo ayudarte con:**
- Conceptos de Jacobiano
- Sistemas de coordenadas
- Cuándo usar cada sistema
- Interpretación de límites

**Para resolver integrales:** Usa el Solver
**Para visualizar:** Usa el Visualizador 3D

¿Sobre qué concepto te gustaría aprender?`;
    }

    fallbackResponse += "\n\n*Para respuestas más detalladas, configura tu API key de Groq.*";

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        response: fallbackResponse,
        timestamp: Date.now(),
        source: 'fallback'
      })
    };

  } catch (error) {
    console.error('Error en chat:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      })
    };
  }
};

// Función serverless para explicar integrales específicas
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
    const { integral, question, conversationHistory } = JSON.parse(event.body);

    // Prioridad: DeepSeek > Groq > Fallback local
    
    // Intentar con DeepSeek primero (mejor para matemáticas)
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const systemPrompt = `Eres un tutor experto en integrales triples especializado en responder preguntas específicas sobre esta integral:

INTEGRAL ACTUAL:
- Función: ${integral.functionInput}
- Sistema: ${integral.coordinateSystem}
- Límites: x∈[${integral.limits.x.join(',')}], y∈[${integral.limits.y.join(',')}], z∈[${integral.limits.z.join(',')}]
${integral.result ? `- Resultado: ${integral.result.decimal}` : ''}

PREGUNTA ESPECÍFICA: "${question}"

INSTRUCCIONES:
- Responde DIRECTAMENTE a esta pregunta específica
- Si preguntan "¿Hay un método más fácil?" → Analiza si coordenadas cilíndricas o esféricas serían mejores
- Si preguntan "Explícame más a detalle" → Da pasos matemáticos específicos
- Si preguntan sobre el resultado → Explica cómo se obtuvo
- Usa LaTeX: \\(x^2\\) para inline, \\[\\int\\] para display
- Sé específico y contextual, NO genérico
- Responde en español`;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: "system", content: systemPrompt },
              ...(conversationHistory || []),
              { role: "user", content: question }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        });

        if (!response.ok) {
          throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            data: {
              explanation: data.choices[0].message.content,
              timestamp: Date.now(),
              source: 'deepseek'
            }
          })
        };
      } catch (deepseekError) {
        console.error('Error con DeepSeek:', deepseekError);
        // Continuar al fallback Groq
      }
    }
    
    // Fallback a Groq
    if (process.env.GROQ_API_KEY) {
      try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const systemPrompt = `Eres un tutor experto en integrales triples especializado en responder preguntas específicas sobre esta integral:

INTEGRAL ACTUAL:
- Función: ${integral.functionInput}
- Sistema: ${integral.coordinateSystem}
- Límites: x∈[${integral.limits.x.join(',')}], y∈[${integral.limits.y.join(',')}], z∈[${integral.limits.z.join(',')}]
${integral.result ? `- Resultado: ${integral.result.decimal}` : ''}

PREGUNTA ESPECÍFICA: "${question}"

INSTRUCCIONES:
- Responde DIRECTAMENTE a esta pregunta específica
- Si preguntan "¿Hay un método más fácil?" → Analiza si coordenadas cilíndricas o esféricas serían mejores
- Si preguntan "Explícame más a detalle" → Da pasos matemáticos específicos
- Si preguntan sobre el resultado → Explica cómo se obtuvo
- Usa LaTeX: \\(x^2\\) para inline, \\[\\int\\] para display
- Sé específico y contextual, NO genérico
- Responde en español`;

        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            ...(conversationHistory || []),
            { role: "user", content: question }
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
            data: {
              explanation: completion.choices[0].message.content,
              timestamp: Date.now(),
              source: 'groq'
            }
          })
        };
      } catch (groqError) {
        console.error('Error con Groq:', groqError);
        // Continuar al fallback
      }
    }

    // Fallback local
    const fallbackResponse = `**Explicación de la Integral**

**Función:** ${integral.functionInput}
**Sistema:** ${integral.coordinateSystem}
**Límites:** x∈[${integral.limits.x.join(',')}], y∈[${integral.limits.y.join(',')}], z∈[${integral.limits.z.join(',')}]

**Pasos generales:**
1. **Identificar la región:** Analiza los límites de integración
2. **Verificar el sistema:** ${integral.coordinateSystem} es apropiado para esta región
3. **Aplicar Jacobiano:** ${integral.coordinateSystem === 'cylindrical' ? 'J = r' : integral.coordinateSystem === 'spherical' ? 'J = ρ²sin(φ)' : 'J = 1'}
4. **Integrar:** Procede de adentro hacia afuera

${integral.result ? `**Resultado:** ${integral.result.decimal.toFixed(4)}` : ''}

*Para una explicación más detallada, configura tu API key de Groq.*`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: {
          explanation: fallbackResponse,
          timestamp: Date.now(),
          source: 'fallback'
        }
      })
    };

  } catch (error) {
    console.error('Error en explain:', error);
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

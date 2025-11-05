// Función serverless para el chat de IA
const OpenAI = require('openai');

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, context: chatContext } = JSON.parse(event.body);

    // Verificar si hay API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      // Sistema de fallback local
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          response: getFallbackResponse(message),
          source: 'local'
        })
      };
    }

    // Usar OpenAI si hay API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un tutor experto en integrales triples y cálculo multivariable. 
          RESTRICCIONES ESTRICTAS:
          - SOLO respondes sobre integrales triples
          - NUNCA resuelves problemas nuevos (guías al usuario al solver)
          - Explicas conceptos: Jacobiano, coordenadas, límites
          - Formato educativo con pasos numerados
          - Usa LaTeX para ecuaciones`
        },
        ...chatContext,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        response: completion.choices[0].message.content,
        source: 'openai'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    // Fallback en caso de error
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        response: getFallbackResponse(JSON.parse(event.body).message),
        source: 'local-fallback'
      })
    };
  }
};

// Sistema de respuestas locales
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('jacobiano')) {
    return `**El Jacobiano en Integrales Triples**

El Jacobiano es un factor de corrección que usamos al cambiar de sistema de coordenadas.

**¿Por qué es necesario?**
Cuando cambiamos de coordenadas, los elementos de volumen se deforman. El Jacobiano compensa esta deformación.

**Valores según sistema:**
- **Cartesianas:** J = 1 (sin cambio)
- **Cilíndricas:** J = r (crece con el radio)
- **Esféricas:** J = ρ²·sin(φ) (más complejo)

**Ejemplo:**
En cilíndricas, dV = r dr dθ dz
El "r" es el Jacobiano que corrige el volumen.`;
  }

  if (lowerMessage.includes('cilíndrica') || lowerMessage.includes('cilindrica')) {
    return `**Coordenadas Cilíndricas**

**Variables:**
- r: distancia al eje z (radio)
- θ: ángulo en el plano xy
- z: altura

**Conversión:**
- x = r·cos(θ)
- y = r·sin(θ)
- z = z

**Jacobiano:** J = r

**Cuándo usar:**
✅ Cilindros
✅ Conos
✅ Funciones con x² + y²
✅ Simetría circular

**Ejemplo:**
Para x² + y² ≤ 4, usa r ≤ 2 (mucho más simple!)`;
  }

  if (lowerMessage.includes('esférica') || lowerMessage.includes('esferica')) {
    return `**Coordenadas Esféricas**

**Variables:**
- ρ: distancia al origen
- φ: ángulo desde eje z (polar)
- θ: ángulo en plano xy (azimutal)

**Conversión:**
- x = ρ·sin(φ)·cos(θ)
- y = ρ·sin(φ)·sin(θ)
- z = ρ·cos(φ)

**Jacobiano:** J = ρ²·sin(φ)

**Cuándo usar:**
✅ Esferas
✅ Conos desde el origen
✅ Funciones con x² + y² + z²
✅ Simetría radial completa`;
  }

  if (lowerMessage.includes('límite') || lowerMessage.includes('limite')) {
    return `**Establecer Límites de Integración**

**Pasos:**
1. **Visualiza la región** - Dibuja o imagina el sólido
2. **Identifica simetrías** - Busca patrones circulares o esféricos
3. **Elige sistema** - Según la simetría
4. **Establece orden** - Generalmente de adentro hacia afuera

**Ejemplo Cilíndricas:**
Para un cilindro de radio 2 y altura 5:
- r: 0 → 2 (del centro al borde)
- θ: 0 → 2π (vuelta completa)
- z: 0 → 5 (de abajo hacia arriba)

**Consejo:**
Los límites constantes son más fáciles. Intenta orientar la región para maximizar límites constantes.`;
  }

  // Respuesta por defecto
  return `**Tutor IA de Integrales Triples**

Puedo ayudarte con:

📊 **Conceptos:**
- Jacobiano y transformaciones
- Sistemas de coordenadas
- Límites de integración

🔄 **Comparaciones:**
- Cartesianas vs Cilíndricas vs Esféricas
- Ventajas de cada método

📐 **Estrategias:**
- Qué sistema usar
- Cómo simplificar

**Pregúntame sobre:**
- "¿Qué es el Jacobiano?"
- "¿Cuándo usar cilíndricas?"
- "¿Cómo establecer límites?"

💡 **Nota:** Estoy en modo local (sin OpenAI). Para respuestas más avanzadas, configura OPENAI_API_KEY en Netlify.`;
}

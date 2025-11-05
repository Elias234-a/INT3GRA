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

    // Debug: Verificar configuración
    console.log('=== DEBUG GROQ ===');
    console.log('API Key disponible:', !!process.env.GROQ_API_KEY);
    console.log('API Key length:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0);
    console.log('Mensaje:', message);
    
    // Prioridad: Groq > OpenAI > Fallback local
    
    // Intentar con Groq primero (gratis y rápido)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('Intentando conectar con Groq...');
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Eres un profesor experto en INTEGRALES TRIPLES y cálculo multivariable. Respondes TODO tipo de preguntas sobre este tema.

🎯 TIPOS DE PREGUNTAS QUE MANEJAS:

**CONCEPTUALES:**
- ¿Qué es el Jacobiano? ¿Por qué se usa?
- ¿Cuándo usar coordenadas cilíndricas/esféricas?
- ¿Cómo establecer límites de integración?
- ¿Qué significa geométricamente una integral triple?

**METODOLÓGICAS:**
- ¿Hay un método más fácil para resolver esto?
- ¿Cómo cambio de coordenadas cartesianas a cilíndricas?
- ¿Cuál es el orden de integración más conveniente?
- ¿Cómo visualizo esta región de integración?

**PASO A PASO:**
- Explícame cómo resolver esta integral detalladamente
- ¿Por qué este resultado es correcto?
- ¿Cómo verifico mi respuesta?
- Muéstrame cada paso del cálculo

**COMPARATIVAS:**
- ¿Cuál es mejor: cartesianas vs cilíndricas vs esféricas?
- ¿Qué diferencia hay entre estos métodos?
- ¿Por qué un sistema es más eficiente que otro?

**APLICACIONES:**
- ¿Para qué sirven las integrales triples en la vida real?
- ¿Cómo calculo volúmenes, masas, centros de masa?
- ¿Qué problemas físicos resuelvo con esto?

**ERRORES COMUNES:**
- ¿Por qué me da un resultado diferente?
- ¿Qué estoy haciendo mal en los límites?
- ¿Cómo evito errores típicos?

📝 FORMATO DE RESPUESTA:
- Respuesta DIRECTA y ESPECÍFICA a la pregunta
- Usa LaTeX: \\(x^2 + y^2\\) inline, \\[\\iiint f(x,y,z)\\,dV\\] display
- Ejemplos concretos cuando sea útil
- Pasos numerados para procedimientos
- Explicaciones intuitivas + rigor matemático
- SIEMPRE en español
- Tono educativo y amigable

🚫 NO HAGAS:
- Respuestas genéricas o plantillas
- "Consulta tu libro de texto"
- Evadir preguntas específicas
- Respuestas demasiado cortas sin explicación`
            },
            ...(conversationHistory || chatContext || []),
            { role: "user", content: message }
          ],
          model: "llama3-70b-8192",
          temperature: 0.7,
          max_tokens: 1500
        });

        console.log('✅ Groq respondió exitosamente');
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
        console.error('❌ Error con Groq:', groqError.message || groqError);
        console.error('Tipo de error:', groqError.constructor.name);
        // Continuar al fallback
      }
    } else {
      console.log('❌ No hay API Key de Groq configurada');
    }

    // Fallback local inteligente basado en palabras clave
    let fallbackResponse = "**🤖 Tutor IA - INTEGRA (Modo Offline)**\n\n";
    
    const messageLower = message.toLowerCase();
    
    // Detectar tipo de pregunta y responder específicamente
    if (messageLower.includes('método') && messageLower.includes('fácil')) {
      fallbackResponse += `**¿Hay un método más fácil?**

Para la función que estás analizando, considera:

**1. Analizar la simetría:**
- Si tiene \\(x^2 + y^2\\) → **Cilíndricas** son más fáciles
- Si tiene \\(x^2 + y^2 + z^2\\) → **Esféricas** son ideales
- Si es rectangular → **Cartesianas** están bien

**2. Verificar los límites:**
- Límites circulares → Cilíndricas
- Límites esféricos → Esféricas
- Límites rectangulares → Cartesianas

**3. Cambiar orden de integración:**
- A veces \\(dz\\,dy\\,dx\\) es más fácil que \\(dx\\,dy\\,dz\\)

*Para análisis específico de tu integral, configura Groq AI.*`;
    } else if (messageLower.includes('detalle') || messageLower.includes('paso')) {
      fallbackResponse += `**Explicación Paso a Paso**

**Pasos generales para resolver integrales triples:**

**1. Identificar la región D:**
- Analiza los límites de integración
- Dibuja o visualiza la región si es posible

**2. Elegir el sistema de coordenadas:**
- Cartesianas: regiones rectangulares
- Cilíndricas: simetría circular
- Esféricas: simetría radial

**3. Establecer los límites correctos:**
- Orden: de adentro hacia afuera
- Verificar que cubran toda la región

**4. Aplicar el Jacobiano:**
- Cartesianas: J = 1
- Cilíndricas: J = r
- Esféricas: J = ρ²sin(φ)

**5. Integrar paso a paso:**
- Empezar por la integral más interna
- Proceder hacia afuera

*Para pasos específicos de tu integral, configura Groq AI.*`;
    } else if (messageLower.includes('jacobiano')) {
      fallbackResponse += `**El Jacobiano en Integrales Triples**

**¿Qué es?**
El Jacobiano es un factor de corrección que compensa la "deformación" del espacio al cambiar coordenadas.

**Valores según el sistema:**
- **Cartesianas (x,y,z):** J = 1
- **Cilíndricas (r,θ,z):** J = r  
- **Esféricas (ρ,θ,φ):** J = ρ²sin(φ)

**¿Por qué es necesario?**
Cuando cambias coordenadas, los "cubitos" infinitesimales se deforman. El Jacobiano mide cuánto se estiran o comprimen.

**Ejemplo visual:**
En cilíndricas, los "cubitos" cerca del origen (r pequeño) son más pequeños que los alejados (r grande). El factor "r" compensa esto.`;
    } else if (messageLower.includes('cilindrica') || messageLower.includes('cilíndrica')) {
      fallbackResponse += `**Coordenadas Cilíndricas (r, θ, z)**

**Transformación:**
- x = r·cos(θ)
- y = r·sin(θ)  
- z = z

**Cuándo usar:**
- Funciones con \\(x^2 + y^2\\)
- Regiones circulares en xy
- Cilindros, conos, paraboloides circulares

**Límites típicos:**
- r: [0, R] donde R es el radio
- θ: [0, 2π] para círculo completo
- z: según la región

**Jacobiano:** J = r

**Ejemplo:** \\(\\iiint (x^2 + y^2)\\,dV\\) se convierte en \\(\\iiint r^2 \\cdot r\\,dr\\,d\\theta\\,dz = \\iiint r^3\\,dr\\,d\\theta\\,dz\\)`;
    } else if (messageLower.includes('esferica') || messageLower.includes('esférica')) {
      fallbackResponse += `**Coordenadas Esféricas (ρ, θ, φ)**

**Transformación:**
- x = ρ·sin(φ)·cos(θ)
- y = ρ·sin(φ)·sin(θ)
- z = ρ·cos(φ)

**Cuándo usar:**
- Funciones con \\(x^2 + y^2 + z^2\\)
- Regiones esféricas
- Esferas, hemisferios, conos desde el origen

**Límites típicos:**
- ρ: [0, R] donde R es el radio
- θ: [0, 2π] para rotación completa
- φ: [0, π] desde polo norte a sur

**Jacobiano:** J = ρ²sin(φ)

**Ejemplo:** \\(\\iiint (x^2 + y^2 + z^2)\\,dV\\) se convierte en \\(\\iiint ρ^2 \\cdot ρ^2\\sin(φ)\\,dρ\\,d\\theta\\,dφ\\)`;
    } else if (messageLower.includes('límite') || messageLower.includes('limite')) {
      fallbackResponse += `**Establecer Límites de Integración**

**Principio clave:** Los límites van de **adentro hacia afuera**

**Pasos:**
1. **Identifica la región D** en el espacio
2. **Proyecta** sobre los planos coordenados
3. **Establece límites** empezando por la variable más "interna"

**Ejemplo en cartesianas:**
Para una esfera \\(x^2 + y^2 + z^2 ≤ 1\\):
- z: desde \\(-\\sqrt{1-x^2-y^2}\\) hasta \\(\\sqrt{1-x^2-y^2}\\)
- y: desde \\(-\\sqrt{1-x^2}\\) hasta \\(\\sqrt{1-x^2}\\)  
- x: desde -1 hasta 1

**Consejo:** Dibuja la región o usa el visualizador 3D de INTEGRA.`;
    } else {
      fallbackResponse += `**🎓 Tutor de Integrales Triples**

Puedo ayudarte con **cualquier pregunta** sobre integrales triples:

**📚 Conceptos:**
- Jacobiano, coordenadas, límites
- Interpretación geométrica
- Aplicaciones físicas

**🔧 Métodos:**
- Cuándo usar cada sistema de coordenadas
- Cómo cambiar entre sistemas
- Trucos para simplificar cálculos

**📝 Resolución:**
- Pasos detallados
- Verificación de resultados
- Errores comunes

**❓ Pregúntame cosas como:**
- "¿Hay un método más fácil?"
- "Explícame el Jacobiano"
- "¿Cuándo uso esféricas?"
- "¿Cómo establezco estos límites?"

*Para respuestas más detalladas y específicas, configura tu API key de Groq.*`;
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

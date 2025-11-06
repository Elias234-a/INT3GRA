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

    // Sistema de pensamiento especializado en integrales triples
    console.log('=== TUTOR IA ESPECIALIZADO - INTEGRA ===');
    console.log('Mensaje recibido:', message);
    
    // Intentar con DeepSeek primero (mejor para matemáticas)
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        console.log('🧠 Activando pensamiento especializado con DeepSeek...');
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: "system",
                content: `Eres un experto especializado en INTEGRALES TRIPLES y cálculo multivariable.

ÁREA DE ESPECIALIZACIÓN:
- Integrales triples en coordenadas cartesianas, cilíndricas y esféricas
- Teoremas de integración (Gauss, Stokes, Green)
- Aplicaciones físicas y geométricas
- Cambios de orden de integración
- Transformaciones de coordenadas
- Jacobianos y determinantes

INSTRUCCIONES CRÍTICAS:
1. NO resolverás integrales triples numéricamente de forma directa
2. EN LUGAR DE ESO, proporcionarás:
   - El método de resolución paso a paso detallado
   - Justificación de cada paso matemático
   - Explicación del por qué se usa ese método
   - Identificación de la región de integración
   - Transformaciones de coordenadas si aplica
   - El resultado final con análisis

3. Para cada respuesta DEBES incluir:
   - Análisis de la región D de integración
   - Determinación del sistema de coordenadas más apropiado
   - Establecimiento de los límites de integración
   - Explicación del Jacobiano si hay transformación
   - Reducción paso a paso a integrales simples
   - Técnicas de integración específicas usadas
   - Verificación o interpretación geométrica del resultado

4. Si el usuario pregunta sobre:
   - Coordenadas cartesianas: Explica cómo identificar límites en x, y, z
   - Coordenadas cilíndricas: Justifica cuándo usarlas, explica r, θ, z
   - Coordenadas esféricas: Detalla ρ, θ, φ y sus rangos
   - Cambio de orden: Muestra todas las permutaciones posibles
   - Aplicaciones: Volumen, masa, centro de masa, momentos de inercia

5. CONTEXTO Y EXPANSIÓN:
   - Proporciona ejemplos relacionados si es relevante
   - Sugiere extensiones o variaciones del problema
   - Conecta con teoremas de integración cuando sea pertinente
   - Explica las dificultades comunes en este tipo de integrales

6. RESTRICCIONES:
   - Solo responde sobre integrales triples y temas directamente relacionados
   - Si la pregunta sale de este ámbito, redirecciona educadamente
   - Mantén rigor matemático en todas las explicaciones
   - Usa notación LaTeX: \\(x^2\\) inline, \\[\\iiint f(x,y,z)\\,dV\\] display

CONTEXTO DETECTADO: Integrales Triples
NIVEL DE DETALLE: Expansivo y pedagógico
RESPONDE SIEMPRE EN ESPAÑOL`
              },
              ...(conversationHistory || chatContext || []),
              { role: "user", content: message }
            ],
            temperature: 0.1, // Máxima precisión y determinismo
            max_tokens: 3000  // Más tokens para respuestas muy detalladas
          })
        });

        if (!response.ok) {
          throw new Error(`DeepSeek API error: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('✅ DeepSeek respondió con pensamiento especializado');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            response: data.choices[0].message.content,
            timestamp: Date.now(),
            source: 'deepseek-especializado'
          })
        };
      } catch (deepseekError) {
        console.error('❌ Error con DeepSeek especializado:', deepseekError.message || deepseekError);
        // Continuar al fallback Groq
      }
    } else {
      console.log('❌ No hay API Key de DeepSeek configurada');
    }
    
    // Fallback a Groq si DeepSeek falla
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('Intentando conectar con Groq como fallback...');
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

    // Fallback especializado en integrales triples
    console.log('🧠 Activando fallback especializado...');
    let fallbackResponse = "**🎓 Experto en Integrales Triples - INTEGRA (Modo Especializado)**\n\n";
    
    const messageLower = message.toLowerCase();
    
    // Análisis especializado del tipo de consulta
    
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

**4. Análisis de la región D:**
- Identifica si es una región tipo I, II o III
- Determina si hay simetrías aprovechables
- Verifica si los límites son constantes o variables

**5. Consideraciones del Jacobiano:**
- Cartesianas: dV = dx dy dz
- Cilíndricas: dV = r dr dθ dz  
- Esféricas: dV = ρ² sin(φ) dρ dθ dφ

*Para análisis específico de tu integral, configura DeepSeek AI.*`;
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
    } else if (messageLower.includes('aplicación') || messageLower.includes('aplicacion') || messageLower.includes('física') || messageLower.includes('fisica')) {
      fallbackResponse += `**Aplicaciones de Integrales Triples**

**🏗️ Aplicaciones Geométricas:**
- **Volumen:** \\(V = \\iiint 1\\,dV\\)
- **Volumen con densidad:** \\(V = \\iiint ρ(x,y,z)\\,dV\\)

**⚖️ Aplicaciones Físicas:**
- **Masa total:** \\(M = \\iiint ρ(x,y,z)\\,dV\\)
- **Centro de masa:** \\(\\bar{x} = \\frac{1}{M}\\iiint x\\,ρ(x,y,z)\\,dV\\)
- **Momento de inercia:** \\(I = \\iiint r^2\\,ρ(x,y,z)\\,dV\\)

**🔬 Aplicaciones en Ingeniería:**
- **Flujo de calor:** Distribución de temperatura
- **Campos electromagnéticos:** Densidad de carga
- **Mecánica de fluidos:** Distribución de presión
- **Estructuras:** Análisis de esfuerzos

**💡 Ejemplo:** Para encontrar el centro de masa de un sólido con densidad variable ρ(x,y,z), necesitas calcular tres integrales triples para las coordenadas del centroide.`;
    } else if (messageLower.includes('teorema') || messageLower.includes('gauss') || messageLower.includes('stokes') || messageLower.includes('green')) {
      fallbackResponse += `**Teoremas de Integración Relacionados**

**📐 Teorema de Gauss (Divergencia):**
\\[\\iiint_D (\\nabla \\cdot \\mathbf{F})\\,dV = \\iint_{\\partial D} \\mathbf{F} \\cdot \\mathbf{n}\\,dS\\]

**🌀 Teorema de Stokes:**
\\[\\iint_S (\\nabla \\times \\mathbf{F}) \\cdot \\mathbf{n}\\,dS = \\oint_{\\partial S} \\mathbf{F} \\cdot d\\mathbf{r}\\]

**🔄 Teorema de Green (caso 2D):**
\\[\\iint_D \\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)dA = \\oint_{\\partial D} (P\\,dx + Q\\,dy)\\]

**🔗 Conexión con Integrales Triples:**
- Gauss relaciona integrales triples con integrales de superficie
- Útil para verificar resultados
- Permite convertir problemas complejos en más simples
- Fundamental en física matemática y ecuaciones diferenciales

**💡 Aplicación:** Si tienes \\(\\iiint_D \\nabla \\cdot \\mathbf{F}\\,dV\\), puedes convertirla en \\(\\iint_{\\partial D} \\mathbf{F} \\cdot \\mathbf{n}\\,dS\\) si es más fácil calcular.`;
    } else if (messageLower.includes('orden') || messageLower.includes('cambio')) {
      fallbackResponse += `**Cambio de Orden de Integración**

**🎯 Principio:** El orden de integración puede cambiar la dificultad del cálculo

**📋 Los 6 órdenes posibles:**
1. \\(\\int\\int\\int f(x,y,z)\\,dx\\,dy\\,dz\\)
2. \\(\\int\\int\\int f(x,y,z)\\,dx\\,dz\\,dy\\)
3. \\(\\int\\int\\int f(x,y,z)\\,dy\\,dx\\,dz\\)
4. \\(\\int\\int\\int f(x,y,z)\\,dy\\,dz\\,dx\\)
5. \\(\\int\\int\\int f(x,y,z)\\,dz\\,dx\\,dy\\)
6. \\(\\int\\int\\int f(x,y,z)\\,dz\\,dy\\,dx\\)

**🧠 Estrategia para elegir:**
- **Límites constantes** → Integrar primero
- **Límites complejos** → Integrar al final
- **Función simple en una variable** → Integrar esa variable primero

**⚡ Ejemplo:** Si \\(f(x,y,z) = e^{z^2}\\), integra en z al final porque \\(\\int e^{z^2}dz\\) no tiene forma cerrada.

**🔄 Cambio de región:** A veces cambiar el orden requiere redefinir la región D completamente.`;
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

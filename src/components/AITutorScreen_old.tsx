import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Lightbulb, BookOpen, Calculator, Eye, RotateCcw, ArrowLeft, Moon, Sun } from 'lucide-react';
import AIExplanationAgent from '../services/AIAgent';
import IntegralSolver from '../services/IntegralSolver';
import { IntegralProblem, CoordinateSystem, ExplanationType } from '../types/integra.types';

interface AITutorScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  integralContext?: string | null;
  history?: any[];
  onClearContext?: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  explanationType?: ExplanationType;
}

const AITutorScreen: React.FC<AITutorScreenProps> = ({ colors, onBack, isDark, toggleTheme, integralContext, history = [], onClearContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: '**¡Hola! Soy tu Tutor de Integrales Triples**\n\nEstoy aquí para ayudarte a dominar las integrales triples. Puedo asistirte con:\n\n• **Resolver integrales** paso a paso\n• **Explicar conceptos** fundamentales (Jacobiano, coordenadas)\n• **Elegir el sistema** de coordenadas más apropiado\n• **Establecer límites** de integración correctamente\n• **Aplicaciones prácticas** en física e ingeniería\n\n**¿En qué tema específico necesitas ayuda?**\n\nPuedes hacer preguntas como:\n• "¿Cómo funciona el Jacobiano?"\n• "¿Cuándo uso coordenadas cilíndricas?"\n• "Ayúdame con esta integral..."\n\n*Nota: Si el backend está ejecutándose, tendré acceso a respuestas más avanzadas con IA.*',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<IntegralProblem | null>(null);
  const [explanationMode, setExplanationMode] = useState<ExplanationType>(ExplanationType.INTUITIVE);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiAgent = AIExplanationAgent.getInstance();
  const solver = IntegralSolver.getInstance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Generar respuesta con delay realista
    setTimeout(async () => {
      try {
        const aiResponse = await generateAIResponse(inputMessage);
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date(),
          explanationType: explanationMode
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error generando respuesta:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'Lo siento, hubo un error procesando tu pregunta. ¿Podrías intentar reformularla?',
          timestamp: new Date(),
          explanationType: explanationMode
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 800 + Math.random() * 800);
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      console.log('Enviando mensaje al backend:', userInput);
      
      // Llamar al backend para obtener respuesta de IA
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          context: currentProblem,
          conversationHistory: messages.slice(-5).map(msg => ({
            type: msg.type,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        console.error('Error HTTP:', response.status, response.statusText);
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta del backend:', data);
      
      // Verificar si la respuesta tiene el formato esperado
      if (data.response && data.response.text) {
        return data.response.text;
      } else if (typeof data.response === 'string') {
        return data.response;
      } else {
        console.warn('Formato de respuesta inesperado:', data);
        return 'Recibí tu pregunta, pero hubo un problema con el formato de la respuesta. ¿Podrías reformular tu pregunta?';
      }
    } catch (error) {
      console.error('Error al obtener respuesta de IA:', error);
      
      // Mostrar mensaje más específico según el tipo de error
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return 'No pude conectar con el servidor. Asegúrate de que el backend esté ejecutándose en el puerto 5000. Mientras tanto, puedo ayudarte con respuestas básicas.';
      }
      
      // Fallback a respuesta local con mensaje explicativo
      const localResponse = generateLocalResponse(userInput);
      return `**[Modo sin conexión]**\n\n${localResponse}\n\n*Nota: Estoy usando respuestas predefinidas porque no pude conectar con el sistema de IA avanzado.*`;
    }
  };

  const generateLocalResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

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
    const detectCategory = (msg: string): string => {
      const scores: Record<string, number> = {};
      Object.keys(keywords).forEach(category => {
        scores[category] = (keywords as Record<string, string[]>)[category].filter((keyword: string) => 
          msg.includes(keyword)
        ).length;
      });
      const maxScore = Math.max(...Object.values(scores));
      if (maxScore === 0) return 'general';
      return Object.keys(scores).find(key => scores[key] === maxScore) || 'general';
    };
    
    const category = detectCategory(lowerInput);
    
    switch (category) {
      case 'jacobiano':
        return `**El Jacobiano en Integrales Triples**\n\nEl Jacobiano es el factor de escala cuando cambias de sistema de coordenadas.\n\n**¿Por qué lo necesitas?**\nCuando transformas coordenadas, el "tamaño" de cada elemento de volumen cambia. El Jacobiano corrige esta distorsión.\n\n**Fórmulas clave:**\n\n**Cilíndricas (r, θ, z):**\n• Jacobiano: J = r\n• Elemento de volumen: dV = r dr dθ dz\n\n**Esféricas (ρ, θ, φ):**\n• Jacobiano: J = ρ² sin(φ)\n• Elemento de volumen: dV = ρ² sin(φ) dρ dθ dφ\n\n**Regla de oro:** ¡NUNCA olvides incluir el Jacobiano en la transformación!\n\n¿Quieres ver un ejemplo específico de cálculo?`;
        
      case 'coordenadas':
        if (lowerInput.includes('cilindrica')) {
          return `**Coordenadas Cilíndricas (r, θ, z)**\n\n**¿Cuándo usarlas?**\n✓ Regiones con simetría circular (cilindros, conos)\n✓ Funciones que contienen x² + y²\n✓ Límites de integración circulares\n\n**Transformación:**\n• x = r cos(θ)\n• y = r sin(θ)\n• z = z\n\n**Jacobiano:** J = r\n\n**Ejemplo:** Para integrar sobre un cilindro x² + y² ≤ 4, 0 ≤ z ≤ 3\n• En cartesianas: límites complicados con √(4-x²)\n• En cilíndricas: r ∈ [0,2], θ ∈ [0,2π], z ∈ [0,3] ¡Mucho más simple!`;
        }
        
        if (lowerInput.includes('esferica')) {
          return `**Coordenadas Esféricas (ρ, θ, φ)**\n\n**¿Cuándo usarlas?**\n✓ Regiones esféricas o con simetría radial\n✓ Funciones que contienen x² + y² + z²\n✓ Problemas físicos (gravedad, campos)\n\n**Transformación:**\n• x = ρ sin(φ) cos(θ)\n• y = ρ sin(φ) sin(θ)\n• z = ρ cos(φ)\n\n**Jacobiano:** J = ρ² sin(φ)\n\n**Límites típicos:**\n• ρ: [0, R] (radio)\n• θ: [0, 2π] (azimut)\n• φ: [0, π] (polar)\n\n**Importante:** φ = 0 es polo norte, φ = π es polo sur`;
        }
        
        return `**Sistemas de Coordenadas**\n\n**¿Cuál elegir?**\n\n**Cartesianas (x, y, z):** Regiones rectangulares\n**Cilíndricas (r, θ, z):** Simetría circular\n**Esféricas (ρ, θ, φ):** Simetría esférica\n\n**Regla práctica:** Elige el sistema que haga los límites más simples.`;
        
      case 'integral':
        return handleIntegralRequest(userInput);
        
      case 'limites':
        return `**Establecer Límites de Integración**\n\n**Proceso:**\n1. Identifica las superficies que delimitan la región\n2. Determina el orden de integración (adentro → afuera)\n3. Establece los límites para cada variable\n4. Verifica que describan completamente la región\n\n**Tip:** Dibuja la región para visualizar mejor los límites.`;
        
      case 'aplicaciones':
        return `**Aplicaciones de Integrales Triples**\n\n**Física e Ingeniería:**\n• Cálculo de volúmenes: ∫∫∫ 1 dV\n• Masa total: ∫∫∫ ρ(x,y,z) dV\n• Centro de masa: (1/M) ∫∫∫ x ρ(x,y,z) dV\n• Momento de inercia: ∫∫∫ r² ρ(x,y,z) dV\n\n**Ingeniería de Sistemas:**\n• Análisis de distribución de datos 3D\n• Cálculo de capacidades\n• Modelado de flujos de energía`;
        
      default:
        return `**Tutor de Integrales Triples**\n\nPuedo ayudarte con:\n\n• **Conceptos fundamentales** (Jacobiano, coordenadas)\n• **Resolución paso a paso** de integrales\n• **Elección de coordenadas** apropiadas\n• **Establecimiento de límites** de integración\n• **Aplicaciones prácticas**\n\n**¿En qué tema específico necesitas ayuda?**\n\nPuedes preguntarme:\n• "¿Cómo calculo el Jacobiano?"\n• "¿Cuándo uso coordenadas cilíndricas?"\n• "Ayúdame a resolver esta integral..."\n• "¿Cómo establezco los límites?"`;
    }
  };

  const handleIntegralRequest = (input: string): string => {
    return `**Excelente! Vamos a resolver una integral triple.**\n\nPara ayudarte de manera efectiva, necesito:\n\n1. **La función a integrar:** f(x,y,z) = ?\n   Ejemplos: x² + y² + z², xyz, sin(x²+y²), etc.\n\n2. **La región de integración:** ¿Cómo está definida?\n   Ejemplos:\n   • "cilindro x²+y² ≤ 1, 0 ≤ z ≤ 2"\n   • "esfera x²+y²+z² ≤ 4"\n   • "cubo [0,1]³"\n\n3. **Sistema de coordenadas:** (opcional)\n   • Cartesianas (x,y,z)\n   • Cilíndricas (r,θ,z)\n   • Esféricas (ρ,θ,φ)\n   • Déjame recomendarte el mejor\n\n**Formato sugerido:**\n"Resolver ∫∫∫ (x²+y²) dV en el cilindro x²+y² ≤ 4, 0 ≤ z ≤ 3"\n\nCon esta información te guiaré paso a paso hasta la solución.`;
  };

  const generateContextualResponse = (input: string): string => {
    const responses = [
      `Interesante pregunta sobre integrales triples. Para ayudarte mejor, ¿podrías ser más específico sobre qué aspecto te gustaría explorar?`,
      
      `Puedo ayudarte con eso. Las integrales triples tienen muchas aplicaciones. ¿Te interesa más la teoría o prefieres resolver problemas prácticos?`,
      
      `Buena pregunta. Para darte la mejor respuesta, necesito más contexto:\n• ¿Es sobre un problema específico?\n• ¿Necesitas ayuda con algún concepto?\n• ¿Quieres practicar alguna técnica?`,
      
      `Excelente área para explorar. Los estudiantes aprenden mejor conectando teoría con ejemplos concretos. ¿Hay algún tipo de problema que te resulte especialmente desafiante?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickActions = [
    {
      icon: Calculator,
      label: 'Resolver Integral',
      action: () => setInputMessage('Quiero resolver una integral triple paso a paso')
    },
    {
      icon: Lightbulb,
      label: 'Explicar Concepto',
      action: () => setInputMessage('Explícame qué es el Jacobiano')
    },
    {
      icon: Eye,
      label: 'Coordenadas',
      action: () => setInputMessage('¿Cuándo uso coordenadas cilíndricas vs esféricas?')
    },
    {
      icon: BookOpen,
      label: 'Ejemplos',
      action: () => setInputMessage('Dame ejemplos de integrales triples en la vida real')
    }
  ];

  const explanationModes = [
    { type: ExplanationType.INTUITIVE, label: 'Intuitivo', icon: 'INT' },
    { type: ExplanationType.RIGOROUS, label: 'Riguroso', icon: 'RIG' },
    { type: ExplanationType.PRACTICAL, label: 'Práctico', icon: 'PRA' },
    { type: ExplanationType.COMPARATIVE, label: 'Comparativo', icon: 'COM' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.bg, 
      color: colors.text,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header Neo Brutalism */}
      <div style={{
        padding: '1rem 2rem',
        background: '#4C763B',
        border: '4px solid #000000',
        borderRadius: '20px',
        margin: '1rem',
        boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '1rem',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#FFFD8F', color: '#000000' }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            style={{
              background: '#FFFD8F',
              border: '4px solid #000000',
              borderRadius: '12px',
              color: '#000000',
              fontSize: '1.5rem',
              fontWeight: '900',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: '#FFFD8F',
              border: '4px solid #000000',
              borderRadius: '12px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
            }}>
              <Bot size={24} color="#000000" />
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.75rem', 
              fontWeight: '900',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '-0.025em',
              textShadow: '2px 2px 0 rgba(0,0,0,0.3)'
            }}>
              TUTOR IA - INTEGRA
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Modo de explicación */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#FFFFFF',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              MODO:
            </span>
            <select
              value={explanationMode}
              onChange={(e) => setExplanationMode(e.target.value as ExplanationType)}
              style={{
                background: isDark ? colors.tertiary : '#FFFFFF',
                border: '4px solid #000000',
                color: isDark ? colors.white : '#000000',
                padding: '0.5rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
              }}
            >
              {explanationModes.map(mode => (
                <option key={mode.type} value={mode.type}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#B0CE88' }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              background: '#B0CE88',
              border: '4px solid #000000',
              borderRadius: '12px',
              color: '#000000',
              fontSize: '1.2rem',
              fontWeight: '900',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Contexto de Integral Actual */}
      {integralContext && history.length > 0 && (() => {
        const currentIntegral = history.find((item: any) => item.id === integralContext);
        return currentIntegral ? (
          <div style={{
            margin: '1rem',
            background: '#FFFD8F',
            border: '4px solid #000000',
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: '#000000',
                textTransform: 'uppercase',
                letterSpacing: '-0.025em'
              }}>
                HABLANDO SOBRE:
              </div>
              <button
                onClick={() => onClearContext && onClearContext()}
                style={{
                  background: '#B0CE88',
                  border: '3px solid #000000',
                  borderRadius: '8px',
                  padding: '0.25rem 0.5rem',
                  color: '#000000',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                LIMPIAR
              </button>
            </div>
            
            <div style={{
              background: isDark ? colors.tertiary : '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: '700',
                color: isDark ? colors.white : '#000000',
                marginBottom: '0.5rem'
              }}>
                ∫∫∫ {currentIntegral.function} dV
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#4C763B',
                fontWeight: '600'
              }}>
                {currentIntegral.coordinateSystem === 'cartesian' ? 'CARTESIANAS' : 
                 currentIntegral.coordinateSystem === 'cylindrical' ? 'CILÍNDRICAS' : 'ESFÉRICAS'} • 
                Resultado: {currentIntegral.result?.decimal?.toFixed(4) || 'N/A'}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => {/* Ver en 3D */}}
                style={{
                  background: '#B0CE88',
                  border: '3px solid #000000',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: '#000000',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Eye size={14} />
                VER EN 3D
              </button>
              
              <button
                onClick={() => {/* Ver pasos */}}
                style={{
                  background: isDark ? colors.tertiary : '#FFFFFF',
                  border: '3px solid #000000',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  color: isDark ? colors.white : '#000000',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Calculator size={14} />
                VER PASOS
              </button>
            </div>
          </div>
        ) : null;
      })()}

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              {message.type === 'ai' && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: colors.accent2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={20} color="white" />
                </div>
              )}
              
              <div style={{
                maxWidth: '70%',
                padding: '1rem',
                borderRadius: '1rem',
                backgroundColor: message.type === 'user' ? colors.accent3 : colors.hover,
                color: message.type === 'user' ? 'white' : colors.text,
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5'
              }}>
                {message.content}
                <div style={{
                  fontSize: '0.75rem',
                  opacity: 0.6,
                  marginTop: '0.5rem',
                  textAlign: 'right'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.type === 'user' && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: colors.accent3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={20} color="white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: colors.accent2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{
              padding: '1rem',
              borderRadius: '1rem',
              backgroundColor: colors.hover,
              display: 'flex',
              gap: '0.25rem',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '1rem' }}>Pensando</div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: colors.accent2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '1rem',
        borderTop: `1px solid ${colors.border}`,
        backgroundColor: colors.bg
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ 
                scale: 1.02, 
                backgroundColor: '#FFFD8F',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
              }}
              whileTap={{ scale: 0.98, transform: 'translateY(0px)' }}
              onClick={action.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                border: '4px solid #000000',
                borderRadius: '12px',
                backgroundColor: '#B0CE88',
                color: '#000000',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '-0.025em',
                boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{
                background: '#FFFFFF',
                border: '2px solid #000000',
                borderRadius: '8px',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <action.icon size={16} />
              </div>
              {action.label}
            </motion.button>
          ))}
        </div>

        {/* Input Neo Brutalism */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Pregúntame sobre integrales triples, conceptos, métodos..."
              style={{
                width: '100%',
                minHeight: '80px',
                maxHeight: '120px',
                padding: '1rem',
                border: '4px solid #000000',
                borderRadius: '12px',
                backgroundColor: isDark ? colors.tertiary : '#FFFFFF',
                color: isDark ? colors.white : '#000000',
                resize: 'vertical',
                fontSize: '1rem',
                lineHeight: '1.4',
                fontWeight: '500',
                boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              backgroundColor: inputMessage.trim() ? '#4C763B' : '#B0CE88',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
            }}
            whileTap={{ scale: 0.95, transform: 'translateY(0px)' }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              border: '4px solid #000000',
              backgroundColor: inputMessage.trim() ? '#FFFD8F' : '#B0CE88',
              color: '#000000',
              cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
              opacity: inputMessage.trim() ? 1 : 0.6
            }}
          >
            <Send size={24} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AITutorScreen;
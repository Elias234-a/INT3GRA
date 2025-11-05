import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Lightbulb, BookOpen, Calculator, Eye, RotateCcw, ArrowLeft, Moon, Sun, MessageCircle, Zap, TrendingUp, X } from 'lucide-react';
import { aiClient, AIUtils, AIExplanationRequest } from '../services/ai-client';
import { HistoryItem } from '../App';

interface AITutorScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  integralContext?: string | null;
  history?: HistoryItem[];
  onClearContext?: () => void;
  onVisualize?: (integralData: any) => void;
  onCompare?: (integralId: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  source?: string;
}

const AITutorScreen: React.FC<AITutorScreenProps> = ({ 
  colors, 
  onBack, 
  isDark, 
  toggleTheme, 
  integralContext, 
  history = [], 
  onClearContext,
  onVisualize,
  onCompare
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: '**¡Hola! Soy tu Tutor IA de Integrales Triples**\n\nEstoy especializado ÚNICAMENTE en integrales triples. Puedo ayudarte con:\n\n• **Explicar conceptos**: Jacobiano, sistemas de coordenadas, límites\n• **Analizar tu integral**: Si tienes una integral resuelta del historial, puedo explicarla\n• **Comparar métodos**: ¿Cartesianas vs Cilíndricas vs Esféricas?\n• **Sugerir estrategias**: El mejor enfoque para cada problema\n• **Visualizar en 3D**: Graficar la región de integración\n\n**¿En qué necesitas ayuda?**\n\n*Consejo: Resuelve una integral primero o selecciona una del historial para obtener explicaciones específicas.*',
      timestamp: new Date(),
      source: 'system'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<'explain' | 'concept'>('concept');
  const [currentIntegral, setCurrentIntegral] = useState<HistoryItem | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar integral del contexto si está disponible
  useEffect(() => {
    if (integralContext && history.length > 0) {
      const integral = history.find(item => item.id === integralContext);
      if (integral) {
        setCurrentIntegral(integral);
        setChatMode('explain');
        
        // Agregar mensaje de contexto
        const contextMessage: ChatMessage = {
          id: `context_${Date.now()}`,
          type: 'ai',
          content: `**📊 Integral Cargada en Contexto:**\n\n${aiClient.formatIntegralContext({
            id: integral.id,
            functionInput: integral.function,
            limits: {
              x: integral.limits.x.map(String),
              y: integral.limits.y.map(String),
              z: integral.limits.z.map(String)
            },
            coordinateSystem: integral.coordinateSystem,
            result: integral.result
          })}\n\n**Ahora puedo responder preguntas específicas sobre esta integral.** ¿Qué te gustaría saber?`,
          timestamp: new Date(),
          source: 'context'
        };
        
        setMessages(prev => [...prev, contextMessage]);
      }
    }
  }, [integralContext, history]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Agregar mensaje de carga
    const loadingMessage: ChatMessage = {
      id: `loading_${Date.now()}`,
      type: 'ai',
      content: 'Pensando...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      let aiResponse = '';
      let source = 'fallback';

      // Determinar tipo de pregunta y usar endpoint apropiado
      const questionType = AIUtils.suggestQuestionType(inputMessage, !!currentIntegral);
      
      if (questionType === 'concept' || chatMode === 'concept') {
        // Pregunta conceptual
        aiResponse = await aiClient.answerConceptQuestion(inputMessage);
        source = 'concept';
      } else if (currentIntegral && chatMode === 'explain') {
        // Pregunta sobre integral específica
        const conversationHistory = AIUtils.formatConversationHistory(
          messages.slice(-5).map(m => ({ type: m.type, content: m.content }))
        );

        const integralData: AIExplanationRequest['integral'] = {
          id: currentIntegral.id,
          functionInput: currentIntegral.function,
          limits: {
            x: currentIntegral.limits.x.map(String),
            y: currentIntegral.limits.y.map(String),
            z: currentIntegral.limits.z.map(String)
          },
          coordinateSystem: currentIntegral.coordinateSystem,
          result: currentIntegral.result
        };

        aiResponse = await aiClient.explainIntegral({
          integral: integralData,
          question: inputMessage,
          conversationHistory
        });
        source = 'explain';
      } else {
        // Chat general
        const chatResponse = await aiClient.chat(inputMessage, currentIntegral);
        aiResponse = chatResponse.response?.text || chatResponse.response || 'No pude procesar tu pregunta.';
        source = 'chat';
      }

      // Formatear respuesta
      const formattedResponse = AIUtils.formatAIResponse(aiResponse);

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: formattedResponse,
        timestamp: new Date(),
        source
      };

      // Reemplazar mensaje de carga con respuesta real
      setMessages(prev => prev.filter(m => !m.isLoading).concat([aiMessage]));

    } catch (error) {
      console.error('Error en chat IA:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: `**⚠️ No pude conectar con el servidor de IA**\n\nPosibles causas:\n• El backend no está ejecutándose (puerto 5000)\n• Problemas de conexión\n• El servicio de IA no está disponible\n\n**Solución:**\n1. Asegúrate de que el backend esté corriendo: \`npm start\` en la carpeta \`server\`\n2. Verifica que el puerto 5000 esté disponible\n3. Intenta reformular tu pregunta\n\n**Mientras tanto, puedes:**\n• Usar el botón "VER EN 3D" para visualizar la integral\n• Revisar los pasos de resolución en el historial\n• Comparar métodos en el Comparador de Sistemas`,
        timestamp: new Date(),
        source: 'error'
      };

      setMessages(prev => prev.filter(m => !m.isLoading).concat([errorMessage]));
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (isTyping) return;

    // Si es cambio de modo, no necesita integral
    if (action === 'concept-mode') {
      setChatMode('concept');
      setCurrentIntegral(null);
      const modeMessage: ChatMessage = {
        id: `mode_${Date.now()}`,
        type: 'ai',
        content: '**Modo Conceptos Activado**\n\nAhora puedo responder preguntas generales sobre integrales triples. ¿Qué concepto te gustaría que explique?',
        timestamp: new Date(),
        source: 'mode-change'
      };
      setMessages(prev => [...prev, modeMessage]);
      return;
    }

    if (action === 'explain-mode') {
      if (!currentIntegral) {
        alert('Primero debes cargar una integral del historial');
        return;
      }
      setChatMode('explain');
      const modeMessage: ChatMessage = {
        id: `mode_${Date.now()}`,
        type: 'ai',
        content: '**Modo Explicar Integral Activado**\n\nAhora puedo responder preguntas específicas sobre tu integral. ¿Qué te gustaría saber?',
        timestamp: new Date(),
        source: 'mode-change'
      };
      setMessages(prev => [...prev, modeMessage]);
      return;
    }

    // Para acciones que requieren integral
    if (!currentIntegral) {
      alert('Primero debes cargar una integral del historial');
      return;
    }

    setIsTyping(true);

    const loadingMessage: ChatMessage = {
      id: `loading_${Date.now()}`,
      type: 'ai',
      content: 'Generando explicación...',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      let question = '';
      
      switch (action) {
        case 'step-by-step':
          question = 'Explica paso a paso cómo resolver esta integral';
          break;
        case 'suggest-method':
          question = '¿Cuál es el mejor método para resolver esta integral y por qué?';
          break;
        default:
          question = 'Explica esta integral';
      }

      // Enviar pregunta al chat
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: question,
        timestamp: new Date()
      };

      setMessages(prev => prev.filter(m => !m.isLoading).concat([userMessage]));

      // Obtener respuesta de IA
      const integralData: AIExplanationRequest['integral'] = {
        id: currentIntegral.id,
        functionInput: currentIntegral.function,
        limits: {
          x: currentIntegral.limits.x.map(String),
          y: currentIntegral.limits.y.map(String),
          z: currentIntegral.limits.z.map(String)
        },
        coordinateSystem: currentIntegral.coordinateSystem,
        result: currentIntegral.result
      };

      const response = await aiClient.chat(question, integralData, messages.map(m => ({
        type: m.type,
        content: m.content
      })));

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: AIUtils.formatAIResponse(response.text),
        timestamp: new Date(),
        source: response.source || action
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error en acción rápida:', error);
      
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: `❌ Error al generar respuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: new Date(),
        source: 'error'
      };

      setMessages(prev => prev.filter(m => !m.isLoading).concat([errorMessage]));
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearContext = () => {
    setCurrentIntegral(null);
    setChatMode('concept');
    if (onClearContext) onClearContext();
    
    const clearMessage: ChatMessage = {
      id: `clear_${Date.now()}`,
      type: 'ai',
      content: '**Contexto limpiado.** Ahora puedo responder preguntas generales sobre integrales triples.\n\n¿En qué concepto te gustaría que te ayude?',
      timestamp: new Date(),
      source: 'system'
    };
    
    setMessages(prev => [...prev, clearMessage]);
  };

  const getQuickSuggestions = () => {
    if (currentIntegral) {
      return aiClient.getQuickSuggestions({
        id: currentIntegral.id,
        functionInput: currentIntegral.function,
        limits: {
          x: currentIntegral.limits.x.map(String),
          y: currentIntegral.limits.y.map(String),
          z: currentIntegral.limits.z.map(String)
        },
        coordinateSystem: currentIntegral.coordinateSystem,
        result: currentIntegral.result
      });
    }
    return aiClient.getQuickSuggestions();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
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
            whileHover={{ scale: 1.05, backgroundColor: '#FFFD8F' }}
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
              TUTOR IA - INTEGRALES
            </h1>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#B0CE88' }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          style={{
            background: '#B0CE88',
            border: '4px solid #000000',
            borderRadius: '12px',
            color: '#000000',
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

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        
        {/* Contexto de Integral */}
        {currentIntegral && (
          <div style={{
            background: '#FFFD8F',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <button
              onClick={handleClearContext}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#FF6B6B',
                border: '3px solid #000000',
                borderRadius: '8px',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
            
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '1.2rem',
              fontWeight: '900',
              color: '#000000',
              textTransform: 'uppercase'
            }}>
              📊 INTEGRAL EN CONTEXTO
            </h3>
            
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '12px'
            }}>
              ∫∫∫ {currentIntegral.function} dV
            </div>
            
            <div style={{
              fontSize: '0.9rem',
              color: '#000000',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px'
            }}>
              <div><strong>Sistema:</strong> {currentIntegral.coordinateSystem}</div>
              <div><strong>Resultado:</strong> {currentIntegral.result.decimal.toFixed(4)}</div>
              <div><strong>Dificultad:</strong> {'⭐'.repeat(currentIntegral.metadata.difficulty)}</div>
            </div>
          </div>
        )}

        {/* Selector de Integrales del Historial */}
        {!currentIntegral && history && history.length > 0 && (
          <div style={{
            background: isDark ? colors.tertiary : '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '1rem',
              fontWeight: '900',
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: '-0.025em'
            }}>
              Selecciona una integral del historial
            </h3>
            <div style={{
              display: 'grid',
              gap: '12px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentIntegral(item);
                    setChatMode('explain');
                    const contextMessage: ChatMessage = {
                      id: `context_${Date.now()}`,
                      type: 'ai',
                      content: `**📊 Integral Cargada:**\n\n∫∫∫ ${item.function} dV\n\nSistema: ${item.coordinateSystem}\nResultado: ${item.result.decimal.toFixed(4)}\n\n**Ahora puedo responder preguntas específicas sobre esta integral.**`,
                      timestamp: new Date(),
                      source: 'context'
                    };
                    setMessages(prev => [...prev, contextMessage]);
                  }}
                  style={{
                    background: isDark ? colors.dark : colors.secondary,
                    border: '3px solid #000000',
                    borderRadius: '12px',
                    padding: '12px',
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.background = colors.primary;
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = isDark ? colors.dark : colors.secondary;
                    e.currentTarget.style.color = isDark ? '#FFFFFF' : '#000000';
                  }}
                >
                  <div style={{ fontFamily: 'monospace', marginBottom: '4px' }}>
                    f(x,y,z) = {item.function}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {item.coordinateSystem} • {item.result.decimal.toFixed(4)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modo de Chat */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setChatMode('concept')}
            style={{
              background: chatMode === 'concept' ? '#B0CE88' : (isDark ? colors.tertiary : '#FFFFFF'),
              border: '3px solid #000000',
              borderRadius: '12px',
              padding: '8px 16px',
              color: '#000000',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={16} />
            CONCEPTOS
          </button>
          
          <button
            onClick={() => setChatMode('explain')}
            disabled={!currentIntegral}
            style={{
              background: chatMode === 'explain' ? '#B0CE88' : (isDark ? colors.tertiary : '#FFFFFF'),
              border: '3px solid #000000',
              borderRadius: '12px',
              padding: '8px 16px',
              color: currentIntegral ? '#000000' : '#666',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: currentIntegral ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: currentIntegral ? 1 : 0.5
            }}
          >
            <Calculator size={16} />
            EXPLICAR INTEGRAL
          </button>
        </div>

        {/* Acciones Rápidas */}
        {currentIntegral && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => handleQuickAction('step-by-step')}
              disabled={isTyping}
              style={{
                background: '#FFFD8F',
                border: '3px solid #000000',
                borderRadius: '12px',
                padding: '8px 16px',
                color: '#000000',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: isTyping ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isTyping ? 0.5 : 1
              }}
            >
              <Lightbulb size={14} />
              PASO A PASO
            </button>
            
            <button
              onClick={() => handleQuickAction('suggest-method')}
              disabled={isTyping}
              style={{
                background: '#B0CE88',
                border: '3px solid #000000',
                borderRadius: '12px',
                padding: '8px 16px',
                color: '#000000',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: isTyping ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isTyping ? 0.5 : 1
              }}
            >
              <TrendingUp size={14} />
              SUGERIR MÉTODO
            </button>
            
            <button
              onClick={() => {
                if (currentIntegral && onCompare) {
                  onCompare(currentIntegral.id);
                } else {
                  alert('Primero debes cargar una integral del historial');
                }
              }}
              disabled={!currentIntegral || !onCompare}
              style={{
                background: '#4C763B',
                border: '3px solid #000000',
                borderRadius: '12px',
                padding: '8px 16px',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: (!currentIntegral || !onCompare) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: (!currentIntegral || !onCompare) ? 0.5 : 1
              }}
            >
              <RotateCcw size={14} />
              COMPARAR
            </button>

            {onVisualize && currentIntegral && (
              <button
                onClick={() => onVisualize({
                  function: currentIntegral.function,
                  limits: currentIntegral.limits,
                  coordinateSystem: currentIntegral.coordinateSystem,
                  result: currentIntegral.result
                })}
                style={{
                  background: '#FFFD8F',
                  border: '3px solid #000000',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  color: '#000000',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={14} />
                VER EN 3D
              </button>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div style={{
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
          minHeight: '400px',
          maxHeight: '600px',
          overflowY: 'auto'
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
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '16px',
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  background: message.type === 'user' ? '#FFFD8F' : '#B0CE88',
                  border: '3px solid #000000',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '40px',
                  height: '40px'
                }}>
                  {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div style={{
                  background: message.type === 'user' ? '#FFFD8F' : (isDark ? colors.dark : '#F8F9FA'),
                  border: '3px solid #000000',
                  borderRadius: '16px',
                  padding: '16px',
                  maxWidth: '70%',
                  color: isDark ? colors.white : '#000000',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="loading-dots">
                        <span>●</span><span>●</span><span>●</span>
                      </div>
                      Generando respuesta...
                    </div>
                  ) : (
                    message.content
                  )}
                  
                  {message.source && !message.isLoading && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#666',
                      marginTop: '8px',
                      fontStyle: 'italic'
                    }}>
                      {message.source === 'openai' ? '🤖 OpenAI' : 
                       message.source === 'fallback' ? '💡 Sistema local' :
                       message.source === 'context' ? '📊 Contexto' :
                       message.source === 'system' ? '⚙️ Sistema' : ''}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias Rápidas */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {getQuickSuggestions().slice(0, 4).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              style={{
                background: isDark ? colors.dark : '#F0F0F0',
                border: '2px solid #666',
                borderRadius: '8px',
                padding: '4px 8px',
                color: isDark ? colors.white : '#000000',
                fontSize: '0.8rem',
                cursor: 'pointer',
                opacity: 0.8
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={
              chatMode === 'explain' && currentIntegral
                ? "Pregunta sobre esta integral... (Ej: ¿Por qué usar cilíndricas?)"
                : "Pregunta sobre conceptos de integrales triples..."
            }
            disabled={isTyping}
            style={{
              flex: 1,
              minHeight: '60px',
              maxHeight: '120px',
              padding: '16px',
              fontSize: '1rem',
              fontWeight: '600',
              background: isDark ? colors.tertiary : '#FFFFFF',
              color: isDark ? colors.white : '#000000',
              border: '4px solid #000000',
              borderRadius: '16px',
              resize: 'vertical',
              boxShadow: '0 4px 0 rgba(0,0,0,0.15)'
            }}
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={{
              background: '#4C763B',
              border: '4px solid #000000',
              borderRadius: '16px',
              color: '#FFFFFF',
              cursor: (!inputMessage.trim() || isTyping) ? 'not-allowed' : 'pointer',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '60px',
              height: '60px',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
              opacity: (!inputMessage.trim() || isTyping) ? 0.5 : 1
            }}
          >
            {isTyping ? <MessageCircle size={24} /> : <Send size={24} />}
          </motion.button>
        </div>
      </div>

      <style>{`
        .loading-dots span {
          animation: loading 1.4s infinite ease-in-out;
          display: inline-block;
          margin: 0 2px;
        }
        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        .loading-dots span:nth-child(3) { animation-delay: 0s; }
        
        @keyframes loading {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AITutorScreen;

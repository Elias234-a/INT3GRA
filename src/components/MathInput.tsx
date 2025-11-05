import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Eye, Lightbulb, CheckCircle, AlertCircle, Target } from 'lucide-react';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  colors: any;
  showPreview?: boolean;
  showSuggestions?: boolean;
  onValidation?: (isValid: boolean, error?: string) => void;
}

const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  placeholder = "Ingresa una función matemática...",
  label,
  colors,
  showPreview = true,
  showSuggestions = true,
  onValidation
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionPanel, setShowSuggestionPanel] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Funciones matemáticas comunes
  const mathFunctions = [
    { symbol: 'x²', latex: 'x^2', description: 'x al cuadrado' },
    { symbol: 'y²', latex: 'y^2', description: 'y al cuadrado' },
    { symbol: 'z²', latex: 'z^2', description: 'z al cuadrado' },
    { symbol: 'x² + y²', latex: 'x^2 + y^2', description: 'Suma de cuadrados (cilíndricas)' },
    { symbol: 'x² + y² + z²', latex: 'x^2 + y^2 + z^2', description: 'Suma de cuadrados (esféricas)' },
    { symbol: 'sin(x)', latex: '\\sin(x)', description: 'Función seno' },
    { symbol: 'cos(y)', latex: '\\cos(y)', description: 'Función coseno' },
    { symbol: 'e^x', latex: 'e^x', description: 'Función exponencial' },
    { symbol: 'ln(x)', latex: '\\ln(x)', description: 'Logaritmo natural' },
    { symbol: 'sqrt(x)', latex: '\\sqrt{x}', description: 'Raíz cuadrada' },
    { symbol: 'xyz', latex: 'xyz', description: 'Producto de variables' },
    { symbol: '1', latex: '1', description: 'Constante (para calcular volumen)' }
  ];

  // Ejemplos por contexto
  const contextExamples = [
    {
      category: 'Volumen',
      examples: [
        { func: '1', desc: 'Volumen de la región' },
        { func: 'x + y + z', desc: 'Volumen con densidad lineal' }
      ]
    },
    {
      category: 'Masa',
      examples: [
        { func: 'x² + y²', desc: 'Densidad radial' },
        { func: 'e^(-x²-y²-z²)', desc: 'Distribución gaussiana' }
      ]
    },
    {
      category: 'Momento de Inercia',
      examples: [
        { func: '(x² + y²)', desc: 'Respecto al eje z' },
        { func: '(y² + z²)', desc: 'Respecto al eje x' }
      ]
    }
  ];

  // Validación de la función
  useEffect(() => {
    validateFunction(value);
  }, [value]);

  const validateFunction = (func: string) => {
    if (!func.trim()) {
      setValidationState({ isValid: true });
      onValidation?.(true);
      return;
    }

    try {
      // Validaciones básicas
      const invalidChars = /[^a-zA-Z0-9+\-*/()^.\s]/g;
      if (invalidChars.test(func)) {
        throw new Error('Caracteres no válidos detectados');
      }

      // Verificar paréntesis balanceados
      let openParens = 0;
      for (const char of func) {
        if (char === '(') openParens++;
        if (char === ')') openParens--;
        if (openParens < 0) throw new Error('Paréntesis no balanceados');
      }
      if (openParens !== 0) throw new Error('Paréntesis no balanceados');

      // Verificar variables válidas
      const variables = func.match(/[a-zA-Z]+/g) || [];
      const validVars = ['x', 'y', 'z', 'r', 'theta', 'phi', 'rho', 'sin', 'cos', 'tan', 'exp', 'ln', 'log', 'sqrt', 'pi', 'e'];
      const invalidVars = variables.filter(v => !validVars.includes(v.toLowerCase()));
      
      if (invalidVars.length > 0) {
        throw new Error(`Variables no reconocidas: ${invalidVars.join(', ')}`);
      }

      setValidationState({ isValid: true });
      onValidation?.(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de sintaxis';
      setValidationState({ isValid: false, error: errorMessage });
      onValidation?.(false, errorMessage);
    }
  };

  const insertFunction = (func: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = value.substring(0, start) + func + value.substring(end);
    
    onChange(newValue);
    
    // Posicionar cursor después de la inserción
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + func.length, start + func.length);
    }, 0);
    
    setShowSuggestionPanel(false);
  };

  const quickInsertButtons = [
    { symbol: 'x²', value: 'x^2' },
    { symbol: 'y²', value: 'y^2' },
    { symbol: 'z²', value: 'z^2' },
    { symbol: '√', value: 'sqrt(' },
    { symbol: 'sin', value: 'sin(' },
    { symbol: 'cos', value: 'cos(' },
    { symbol: 'e^', value: 'exp(' },
    { symbol: 'ln', value: 'ln(' }
  ];

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          color: colors.text
        }}>
          {label}
        </label>
      )}

      {/* Input principal */}
      <div style={{
        position: 'relative',
        marginBottom: '1rem'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '1rem 3rem 1rem 1rem',
            border: `2px solid ${
              !validationState.isValid ? '#EF4444' :
              isFocused ? colors.accent2 : colors.border
            }`,
            borderRadius: '0.75rem',
            backgroundColor: colors.hover,
            color: colors.text,
            fontSize: '1rem',
            transition: 'all 0.2s',
            fontFamily: 'monospace'
          }}
        />

        {/* Icono de estado */}
        <div style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {validationState.isValid ? (
            <CheckCircle size={20} color={colors.accent2} />
          ) : (
            <AlertCircle size={20} color="#EF4444" />
          )}
          
          {showSuggestions && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSuggestionPanel(!showSuggestionPanel)}
              style={{
                background: 'none',
                border: 'none',
                color: colors.accent2,
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <Lightbulb size={18} />
            </motion.button>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {!validationState.isValid && validationState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                marginTop: '0.25rem',
                border: '1px solid #FECACA'
              }}
            >
              {validationState.error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botones de inserción rápida */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {quickInsertButtons.map((button, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => insertFunction(button.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              backgroundColor: colors.hover,
              color: colors.text,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              transition: 'all 0.2s'
            }}
          >
            {button.symbol}
          </motion.button>
        ))}
      </div>

      {/* Panel de sugerencias */}
      <AnimatePresence>
        {showSuggestionPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              backgroundColor: colors.hover,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}
          >
            <h4 style={{
              margin: '0 0 1rem 0',
              color: colors.accent2,
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Lightbulb size={20} />
              Funciones Comunes
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem'
            }}>
              {mathFunctions.map((func, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => insertFunction(func.symbol)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    backgroundColor: colors.bg,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: colors.accent3,
                    marginBottom: '0.25rem'
                  }}>
                    {func.symbol}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: colors.text,
                    opacity: 0.7
                  }}>
                    {func.description}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Ejemplos por contexto */}
            <div style={{ marginTop: '1.5rem' }}>
              <h5 style={{
                margin: '0 0 0.75rem 0',
                color: colors.text,
                fontSize: '0.9rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Target size={16} />
                Ejemplos por Aplicación
              </h5>
              
              {contextExamples.map((category, catIndex) => (
                <div key={catIndex} style={{ marginBottom: '1rem' }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: colors.accent2,
                    marginBottom: '0.5rem'
                  }}>
                    {category.category}:
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    {category.examples.map((example, exIndex) => (
                      <motion.button
                        key={exIndex}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => insertFunction(example.func)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          border: `1px solid ${colors.accent1}`,
                          borderRadius: '1rem',
                          backgroundColor: colors.accent1 + '20',
                          color: colors.accent4,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace'
                        }}
                        title={example.desc}
                      >
                        {example.func}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview de la función */}
      {showPreview && value && validationState.isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            backgroundColor: colors.accent1 + '20',
            border: `1px solid ${colors.accent1}`,
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <Eye size={16} color={colors.accent3} />
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: colors.accent3
            }}>
              Vista Previa
            </span>
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            color: colors.accent4,
            backgroundColor: 'white',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: `1px solid ${colors.accent1}`
          }}>
            f(x,y,z) = {value}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MathInput;
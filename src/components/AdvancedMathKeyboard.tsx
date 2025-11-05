import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { evaluate, parse } from 'mathjs';

interface AdvancedMathKeyboardProps {
  onInsert: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  currentInput: string;
  colors: any;
  isDark: boolean;
  showLatexPreview?: boolean;
  compactMode?: boolean;
}

interface KeyboardButton {
  label: string;
  value: string;
  latex?: string;
  tooltip?: string;
  type?: 'number' | 'operator' | 'function' | 'symbol';
}

const AdvancedMathKeyboard: React.FC<AdvancedMathKeyboardProps> = ({
  onInsert,
  onBackspace,
  onClear,
  onSubmit,
  currentInput,
  colors,
  isDark,
  showLatexPreview = true,
  compactMode = false
}) => {
  const [activeCategory, setActiveCategory] = useState('numbers');
  const [latexPreview, setLatexPreview] = useState('');
  const [isValidExpression, setIsValidExpression] = useState(true);

  // Categorías del teclado
  const categories = [
    { id: 'numbers', label: '# Números', icon: '123' },
    { id: 'functions', label: 'ƒ Funciones', icon: 'ƒ' },
    { id: 'integrals', label: '∫ Integrales', icon: '∫' },
    { id: 'symbols', label: '◇ Símbolos', icon: '◇' }
  ];

  // Definición de botones por categoría
  const keyboardButtons = {
    numbers: [
      { label: '7', value: '7', type: 'number' },
      { label: '8', value: '8', type: 'number' },
      { label: '9', value: '9', type: 'number' },
      { label: '÷', value: '/', latex: '\\div', type: 'operator' },
      { label: '4', value: '4', type: 'number' },
      { label: '5', value: '5', type: 'number' },
      { label: '6', value: '6', type: 'number' },
      { label: '×', value: '*', latex: '\\times', type: 'operator' },
      { label: '1', value: '1', type: 'number' },
      { label: '2', value: '2', type: 'number' },
      { label: '3', value: '3', type: 'number' },
      { label: '−', value: '-', latex: '-', type: 'operator' },
      { label: '0', value: '0', type: 'number' },
      { label: '.', value: '.', type: 'number' },
      { label: '(', value: '(', type: 'operator' },
      { label: ')', value: ')', type: 'operator' },
      { label: '+', value: '+', type: 'operator' },
      { label: '^', value: '^', latex: '^', tooltip: 'Potencia: x^2', type: 'operator' },
      { label: 'x', value: 'x', latex: 'x', type: 'symbol' },
      { label: 'y', value: 'y', latex: 'y', type: 'symbol' },
      { label: 'z', value: 'z', latex: 'z', type: 'symbol' }
    ],
    functions: [
      { label: 'sin', value: 'sin(', latex: '\\sin', tooltip: 'Ejemplo: sin(x)', type: 'function' },
      { label: 'cos', value: 'cos(', latex: '\\cos', tooltip: 'Ejemplo: cos(y)', type: 'function' },
      { label: 'tan', value: 'tan(', latex: '\\tan', tooltip: 'Ejemplo: tan(z)', type: 'function' },
      { label: 'exp', value: 'exp(', latex: 'e^', tooltip: 'Ejemplo: exp(x)', type: 'function' },
      { label: 'ln', value: 'ln(', latex: '\\ln', tooltip: 'Logaritmo natural', type: 'function' },
      { label: 'log', value: 'log(', latex: '\\log', tooltip: 'Logaritmo base 10', type: 'function' },
      { label: '√', value: 'sqrt(', latex: '\\sqrt', tooltip: 'Ejemplo: sqrt(x^2+y^2)', type: 'function' },
      { label: '|x|', value: 'abs(', latex: '|', tooltip: 'Valor absoluto', type: 'function' },
      { label: 'sinh', value: 'sinh(', latex: '\\sinh', tooltip: 'Seno hiperbólico', type: 'function' },
      { label: 'cosh', value: 'cosh(', latex: '\\cosh', tooltip: 'Coseno hiperbólico', type: 'function' },
      { label: 'tanh', value: 'tanh(', latex: '\\tanh', tooltip: 'Tangente hiperbólica', type: 'function' },
      { label: 'asin', value: 'asin(', latex: '\\arcsin', tooltip: 'Arcoseno', type: 'function' }
    ],
    integrals: [
      { label: '∫', value: '∫', latex: '\\int', tooltip: 'Integral simple', type: 'symbol' },
      { label: '∬', value: '∬', latex: '\\iint', tooltip: 'Integral doble', type: 'symbol' },
      { label: '∭', value: '∭', latex: '\\iiint', tooltip: 'Integral triple', type: 'symbol' },
      { label: 'dx', value: 'dx', latex: 'dx', tooltip: 'Diferencial de x', type: 'symbol' },
      { label: 'dy', value: 'dy', latex: 'dy', tooltip: 'Diferencial de y', type: 'symbol' },
      { label: 'dz', value: 'dz', latex: 'dz', tooltip: 'Diferencial de z', type: 'symbol' },
      { label: 'dV', value: 'dV', latex: 'dV', tooltip: 'Elemento de volumen', type: 'symbol' },
      { label: 'dr', value: 'dr', latex: 'dr', tooltip: 'Diferencial radial', type: 'symbol' },
      { label: 'dθ', value: 'dθ', latex: 'd\\theta', tooltip: 'Diferencial angular', type: 'symbol' },
      { label: 'dφ', value: 'dφ', latex: 'd\\phi', tooltip: 'Diferencial polar', type: 'symbol' },
      { label: 'dρ', value: 'dρ', latex: 'd\\rho', tooltip: 'Diferencial esférico', type: 'symbol' }
    ],
    symbols: [
      { label: 'π', value: 'pi', latex: '\\pi', tooltip: 'Pi = 3.14159...', type: 'symbol' },
      { label: 'e', value: 'e', latex: 'e', tooltip: 'Número de Euler', type: 'symbol' },
      { label: '∞', value: 'Infinity', latex: '\\infty', tooltip: 'Infinito', type: 'symbol' },
      { label: '≤', value: '<=', latex: '\\leq', tooltip: 'Menor o igual', type: 'symbol' },
      { label: '≥', value: '>=', latex: '\\geq', tooltip: 'Mayor o igual', type: 'symbol' },
      { label: '≠', value: '!=', latex: '\\neq', tooltip: 'Diferente', type: 'symbol' },
      { label: '±', value: '±', latex: '\\pm', tooltip: 'Más menos', type: 'symbol' },
      { label: '∂', value: '∂', latex: '\\partial', tooltip: 'Derivada parcial', type: 'symbol' },
      { label: 'α', value: 'alpha', latex: '\\alpha', tooltip: 'Alfa', type: 'symbol' },
      { label: 'β', value: 'beta', latex: '\\beta', tooltip: 'Beta', type: 'symbol' },
      { label: 'γ', value: 'gamma', latex: '\\gamma', tooltip: 'Gamma', type: 'symbol' },
      { label: 'θ', value: 'theta', latex: '\\theta', tooltip: 'Theta', type: 'symbol' },
      { label: 'φ', value: 'phi', latex: '\\phi', tooltip: 'Phi', type: 'symbol' },
      { label: 'ρ', value: 'rho', latex: '\\rho', tooltip: 'Rho', type: 'symbol' },
      { label: 'σ', value: 'sigma', latex: '\\sigma', tooltip: 'Sigma', type: 'symbol' }
    ]
  };

  // Convertir expresión matemática a LaTeX
  const convertToLatex = (expression: string): string => {
    if (!expression.trim()) return '';
    
    try {
      let latex = expression
        // Funciones trigonométricas
        .replace(/sin\(/g, '\\sin(')
        .replace(/cos\(/g, '\\cos(')
        .replace(/tan\(/g, '\\tan(')
        .replace(/exp\(/g, 'e^{')
        .replace(/sqrt\(/g, '\\sqrt{')
        .replace(/ln\(/g, '\\ln(')
        .replace(/log\(/g, '\\log(')
        .replace(/abs\(/g, '|')
        // Potencias
        .replace(/\^([0-9]+)/g, '^{$1}')
        .replace(/\^([a-zA-Z])/g, '^{$1}')
        // Símbolos griegos
        .replace(/pi/g, '\\pi')
        .replace(/theta/g, '\\theta')
        .replace(/phi/g, '\\phi')
        .replace(/rho/g, '\\rho')
        .replace(/alpha/g, '\\alpha')
        .replace(/beta/g, '\\beta')
        .replace(/gamma/g, '\\gamma')
        .replace(/sigma/g, '\\sigma')
        // Operadores
        .replace(/\*/g, '\\cdot ')
        .replace(/\//g, '\\div ')
        // Cerrar llaves para exp y sqrt
        .replace(/e\^{([^}]+)\)/g, 'e^{$1}')
        .replace(/\\sqrt{([^}]+)\)/g, '\\sqrt{$1}');

      return latex;
    } catch (error) {
      return expression;
    }
  };

  // Validar expresión matemática
  const validateExpression = (expression: string): boolean => {
    if (!expression.trim()) return true;
    
    try {
      // Reemplazar símbolos para validación
      const testExpr = expression
        .replace(/pi/g, '3.14159')
        .replace(/e/g, '2.71828')
        .replace(/theta/g, '1')
        .replace(/phi/g, '1')
        .replace(/rho/g, '1')
        .replace(/alpha/g, '1')
        .replace(/beta/g, '1')
        .replace(/gamma/g, '1')
        .replace(/sigma/g, '1')
        .replace(/x/g, '1')
        .replace(/y/g, '1')
        .replace(/z/g, '1')
        .replace(/\^/g, '**');

      // Intentar parsear con mathjs
      parse(testExpr);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Actualizar vista previa LaTeX cuando cambia la entrada
  useEffect(() => {
    if (showLatexPreview) {
      const latex = convertToLatex(currentInput);
      setLatexPreview(latex);
      setIsValidExpression(validateExpression(currentInput));
    }
  }, [currentInput, showLatexPreview]);

  const handleButtonClick = (button: KeyboardButton) => {
    onInsert(button.value);
  };

  const getButtonStyle = (button: KeyboardButton) => ({
    padding: compactMode ? '8px' : '12px',
    backgroundColor: button.type === 'number' ? colors.primary + '20' :
                    button.type === 'operator' ? colors.accent2 + '20' :
                    button.type === 'function' ? colors.accent1 + '20' :
                    colors.accent3 + '20',
    border: `2px solid ${
      button.type === 'number' ? colors.primary :
      button.type === 'operator' ? colors.accent2 :
      button.type === 'function' ? colors.accent1 :
      colors.accent3
    }`,
    borderRadius: '8px',
    color: isDark ? colors.white : colors.neutral,
    fontSize: compactMode ? '12px' : '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: compactMode ? '32px' : '40px',
    position: 'relative' as const
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: isDark ? colors.tertiary : colors.white
    }}>
      {/* Vista Previa LaTeX */}
      {showLatexPreview && (
        <div style={{
          padding: '16px',
          backgroundColor: isValidExpression ? colors.bg : '#ffebee',
          border: `2px solid ${isValidExpression ? colors.border : '#f44336'}`,
          borderRadius: '8px',
          marginBottom: '16px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: colors.accent2,
              marginBottom: '8px'
            }}>
              Vista Previa LaTeX
            </div>
            {latexPreview ? (
              <div style={{ fontSize: '18px' }}>
                <InlineMath math={latexPreview} />
              </div>
            ) : (
              <div style={{
                fontSize: '14px',
                color: colors.text,
                opacity: 0.6,
                fontStyle: 'italic'
              }}>
                Ingresa una función matemática...
              </div>
            )}
            {!isValidExpression && currentInput && (
              <div style={{
                fontSize: '10px',
                color: '#f44336',
                marginTop: '4px'
              }}>
                ⚠️ Expresión inválida
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pestañas de Categorías */}
      <div style={{
        display: 'flex',
        marginBottom: '12px',
        backgroundColor: colors.bg,
        borderRadius: '8px',
        padding: '4px'
      }}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            style={{
              flex: 1,
              padding: compactMode ? '6px 8px' : '8px 12px',
              backgroundColor: activeCategory === category.id ? colors.primary : 'transparent',
              color: activeCategory === category.id ? colors.white : colors.text,
              border: 'none',
              borderRadius: '6px',
              fontSize: compactMode ? '10px' : '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: compactMode ? '12px' : '14px', marginBottom: '2px' }}>
              {category.icon}
            </div>
            <div style={{ fontSize: compactMode ? '8px' : '9px' }}>
              {category.label.split(' ')[1]}
            </div>
          </button>
        ))}
      </div>

      {/* Botones del Teclado */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: activeCategory === 'numbers' 
                ? 'repeat(4, 1fr)' 
                : 'repeat(3, 1fr)',
              gap: compactMode ? '6px' : '8px'
            }}
          >
            {keyboardButtons[activeCategory as keyof typeof keyboardButtons].map((button, index) => (
              <div
                key={`${activeCategory}-${index}`}
                onClick={() => handleButtonClick(button)}
                style={getButtonStyle(button)}
                title={button.tooltip}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {button.label}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botones de Control */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 2fr',
        gap: '8px',
        marginTop: '12px'
      }}>
        <button
          onClick={onBackspace}
          style={{
            padding: compactMode ? '8px' : '12px',
            backgroundColor: colors.accent3,
            color: colors.white,
            border: 'none',
            borderRadius: '8px',
            fontSize: compactMode ? '12px' : '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ⌫
        </button>
        <button
          onClick={onClear}
          style={{
            padding: compactMode ? '8px' : '12px',
            backgroundColor: '#f44336',
            color: colors.white,
            border: 'none',
            borderRadius: '8px',
            fontSize: compactMode ? '10px' : '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          CLEAR
        </button>
        <button
          onClick={onSubmit}
          style={{
            padding: compactMode ? '8px' : '12px',
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: '8px',
            fontSize: compactMode ? '12px' : '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          CALCULAR
        </button>
      </div>
    </div>
  );
};

export default AdvancedMathKeyboard;

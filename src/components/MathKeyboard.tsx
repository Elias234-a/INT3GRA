import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, RotateCcw, Send, Clock, Lightbulb, Eye, Edit3 } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface MathKeyboardProps {
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit?: () => void;
  currentInput?: string;
  colors: any;
  isDark?: boolean;
  showLatexPreview?: boolean;
  compactMode?: boolean;
  onEditRequest?: () => void;
}

const MathKeyboard: React.FC<MathKeyboardProps> = ({
  onInsert,
  onBackspace,
  onClear,
  onSubmit,
  currentInput = '',
  colors,
  isDark = false,
  showLatexPreview = true,
  compactMode = false,
  onEditRequest
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [latexPreview, setLatexPreview] = useState('');
  const [showPreview, setShowPreview] = useState(showLatexPreview);
  const previewRef = useRef<HTMLDivElement>(null);

  // Enhanced keyboard categories with exact specifications
  const keyboardTabs = [
    {
      name: 'Números',
      shortName: 'Núm',
      icon: '#',
      keys: [
        ['7', '8', '9', '÷', '='],
        ['4', '5', '6', '×', '+'],
        ['1', '2', '3', '-', '('],
        ['0', '.', ',', ')', 'C']
      ]
    },
    {
      name: 'Funciones',
      shortName: 'Func',
      icon: 'ƒ',
      keys: [
        ['sin', 'cos', 'tan', 'ln', 'log'],
        ['exp', 'e', 'π', '^', '√'],
        ['abs', '|', 'sec', 'csc', 'cot'],
        ['sinh', 'cosh', 'tanh', 'arcsin', 'arccos']
      ]
    },
    {
      name: 'Integrales',
      shortName: 'Int',
      icon: '∫',
      keys: [
        ['∫', '∬', '∭', 'dx', 'dy'],
        ['dz', 'dr', 'dθ', 'dρ', 'dφ'],
        ['x', 'y', 'z', 'r', 'θ'],
        ['ρ', 'φ', 't', 'u', 'v']
      ]
    },
    {
      name: 'Símbolos',
      shortName: 'Símb',
      icon: '◊',
      keys: [
        ['(', ')', '[', ']', '{'],
        ['}', '|', '∞', '≤', '≥'],
        ['≠', '≈', '±', '∓', '·'],
        ['°', '%', '!', '?', ',']
      ]
    }
  ];

  // Predefined limits for quick access
  const predefinedLimits = [
    { label: '[0,1]', value: '[0,1]' },
    { label: '[0,2π]', value: '[0,2\\pi]' },
    { label: '[0,∞]', value: '[0,\\infty]' },
    { label: '[-1,1]', value: '[-1,1]' },
    { label: '[a,b]', value: '[a,b]' },
    { label: '[0,R]', value: '[0,R]' }
  ];

  // Convert input to LaTeX for preview
  const convertToLatex = (input: string): string => {
    let latex = input
      .replace(/\*/g, '\\cdot')
      .replace(/×/g, '\\times')
      .replace(/÷/g, '\\div')
      .replace(/≤/g, '\\leq')
      .replace(/≥/g, '\\geq')
      .replace(/≠/g, '\\neq')
      .replace(/≈/g, '\\approx')
      .replace(/±/g, '\\pm')
      .replace(/∓/g, '\\mp')
      .replace(/∞/g, '\\infty')
      .replace(/π/g, '\\pi')
      .replace(/θ/g, '\\theta')
      .replace(/ρ/g, '\\rho')
      .replace(/φ/g, '\\phi')
      .replace(/∫/g, '\\int')
      .replace(/∬/g, '\\iint')
      .replace(/∭/g, '\\iiint')
      .replace(/√/g, '\\sqrt')
      .replace(/sin/g, '\\sin')
      .replace(/cos/g, '\\cos')
      .replace(/tan/g, '\\tan')
      .replace(/ln/g, '\\ln')
      .replace(/log/g, '\\log')
      .replace(/exp/g, '\\exp')
      .replace(/abs/g, '\\left|')
      .replace(/\^/g, '^')
      .replace(/dx/g, '\\,dx')
      .replace(/dy/g, '\\,dy')
      .replace(/dz/g, '\\,dz')
      .replace(/dr/g, '\\,dr')
      .replace(/dθ/g, '\\,d\\theta')
      .replace(/dρ/g, '\\,d\\rho')
      .replace(/dφ/g, '\\,d\\phi');
    
    return latex || 'f(x,y,z)';
  };

  // Add symbol to recent and track suggestion
  const addSymbolToRecent = (symbol: string) => {
    if (symbol === 'C') {
      onClear();
      return;
    }
    
    setRecentSymbols(prev => {
      const filtered = prev.filter(s => s !== symbol);
      return [symbol, ...filtered].slice(0, 8);
    });
    onInsert(symbol);
    generateSuggestions(currentInput + symbol);
  };

  // Enhanced contextual suggestions
  const generateSuggestions = (input: string) => {
    const suggs: string[] = [];

    // Integral suggestions
    if (input.includes('∫')) {
      if (!input.match(/d[xyz]/)) {
        if (!input.includes('dx')) suggs.push('dx');
        if (!input.includes('dy')) suggs.push('dy');
        if (!input.includes('dz')) suggs.push('dz');
      }
      // Suggest limits
      if (!input.includes('[')) {
        suggs.push('[0,1]', '[0,2π]');
      }
    }

    // Double/Triple integral suggestions
    if (input.includes('∬') && !input.match(/d[xyz].*d[xyz]/)) {
      suggs.push('dx dy', 'dy dx', 'dr dθ');
    }
    if (input.includes('∭') && !input.match(/d[xyz].*d[xyz].*d[xyz]/)) {
      suggs.push('dx dy dz', 'dr dθ dz', 'dρ dθ dφ');
    }

    // Coordinate system suggestions
    if (input.includes('r') && input.includes('θ') && !input.includes('dθ')) {
      suggs.push('dθ', 'dr dθ');
    }
    if (input.includes('ρ') && !input.includes('dρ')) {
      suggs.push('dρ dθ dφ');
    }

    // Parenthesis matching
    const openParens = (input.match(/\(/g) || []).length - (input.match(/\)/g) || []).length;
    const openBrackets = (input.match(/\[/g) || []).length - (input.match(/\]/g) || []).length;
    const openBraces = (input.match(/\{/g) || []).length - (input.match(/\}/g) || []).length;
    
    if (openParens > 0) suggs.push(')');
    if (openBrackets > 0) suggs.push(']');
    if (openBraces > 0) suggs.push('}');

    // Function suggestions
    if (input.match(/sin|cos|tan|exp|ln|log|sqrt/) && !input.endsWith('(')) {
      suggs.push('(');
    }

    // Power suggestions
    if (input.endsWith('^')) {
      suggs.push('2', '3', '(', '{');
    }

    // Variable completion
    if (input.endsWith('x') && !input.match(/dx|exp/)) {
      suggs.push('dx');
    }
    if (input.endsWith('y') && !input.includes('dy')) {
      suggs.push('dy');
    }
    if (input.endsWith('z') && !input.includes('dz')) {
      suggs.push('dz');
    }

    setSuggestions([...new Set(suggs)].slice(0, 4));
  };

  useEffect(() => {
    generateSuggestions(currentInput);
    if (showPreview) {
      setLatexPreview(convertToLatex(currentInput));
    }
  }, [currentInput, showPreview]);

  // Enhanced physical keyboard with shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd shortcuts
        if (key === 'i') {
          e.preventDefault();
          addSymbolToRecent('∫');
        } else if (key === 'p') {
          e.preventDefault();
          addSymbolToRecent('π');
        } else if (key === '1') {
          e.preventDefault();
          setActiveTab(0);
        } else if (key === '2') {
          e.preventDefault();
          setActiveTab(1);
        } else if (key === '3') {
          e.preventDefault();
          setActiveTab(2);
        } else if (key === '4') {
          e.preventDefault();
          setActiveTab(3);
        }
        return;
      }
      
      if (key === 'backspace') {
        e.preventDefault();
        onBackspace();
      } else if (key === 'delete') {
        e.preventDefault();
        onClear();
      } else if (key === 'enter' && onSubmit) {
        e.preventDefault();
        onSubmit();
      } else if (key === 'escape') {
        e.preventDefault();
        onClear();
      } else if (/[0-9+\-*/(\)\[\]{}.,=]/.test(key)) {
        e.preventDefault();
        let insertKey = key;
        if (key === '*') insertKey = '×';
        if (key === '/') insertKey = '÷';
        addSymbolToRecent(insertKey);
      } else if (key === 'tab') {
        e.preventDefault();
        setActiveTab((prev) => (prev + 1) % keyboardTabs.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackspace, onClear, onSubmit, currentInput]);

  const Tab = ({ index, name, icon }: any) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveTab(index)}
      className="neo-button"
      style={{
        flex: 1,
        padding: '12px 8px',
        backgroundColor: activeTab === index ? colors.tertiary : colors.primary,
        color: activeTab === index ? colors.white : colors.neutral,
        border: `4px solid ${colors.neutral}`,
        borderRadius: '16px 16px 0 0',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 900,
        letterSpacing: '-0.025em',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        flexDirection: 'column',
        boxShadow: activeTab === index ? '0 4px 0 rgba(0, 0, 0, 0.25)' : '0 2px 0 rgba(0, 0, 0, 0.15)',
        transform: activeTab === index ? 'translateY(-2px)' : 'translateY(0)'
      }}
    >
      <span style={{ fontSize: '16px', fontWeight: 900 }}>{icon}</span>
      <span style={{ fontWeight: 900 }}>{name}</span>
    </motion.button>
  );

  const Key = ({ label, value }: any) => {
    const isOperator = ['+', '-', '×', '÷', '=', '^', '√'].includes(label);
    const isIntegral = ['∫', '∬', '∭'].includes(label);
    const isSpecial = ['(', ')', '[', ']', '{', '}'].includes(label);

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => addSymbolToRecent(value || label)}
        className="neo-button"
        style={{
          padding: '12px 8px',
          backgroundColor: isIntegral ? colors.primary : isOperator ? colors.secondary : isSpecial ? colors.tertiary : colors.white,
          color: isIntegral ? colors.neutral : isOperator ? colors.neutral : isSpecial ? colors.white : colors.neutral,
          border: `4px solid ${colors.neutral}`,
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 900,
          letterSpacing: '-0.025em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: label.length === 1 ? 'monospace' : 'inherit',
          boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
        }}
      >
        {label}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="neo-card"
      style={{
        backgroundColor: colors.bg,
        border: `4px solid ${colors.neutral}`,
        borderRadius: '20px',
        padding: '16px',
        width: '100%',
        boxShadow: '0 8px 0 rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2px',
        marginBottom: '8px'
      }}>
        {keyboardTabs.map((tab, index) => (
          <Tab key={index} index={index} name={tab.name} icon={tab.icon} />
        ))}
      </div>

      {/* Keyboard Grid */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px',
          marginBottom: '8px',
          minHeight: '120px'
        }}
      >
        {keyboardTabs[activeTab].keys.map((row, rowIndex) => 
          row.map((key, keyIndex) => (
            <Key key={`${rowIndex}-${keyIndex}`} label={key} value={key} />
          ))
        )}
      </motion.div>

      {/* Recent Symbols */}
      {recentSymbols.length > 0 && (
        <div className="neo-card" style={{
          marginBottom: '12px',
          padding: '12px',
          backgroundColor: colors.primary,
          borderRadius: '16px',
          border: `4px solid ${colors.neutral}`,
          boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: colors.neutral
          }}>
            <Clock size={12} />
            Recientes
          </div>
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            {recentSymbols.map((symbol, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addSymbolToRecent(symbol)}
                className="neo-button"
                style={{
                  padding: '8px 12px',
                  backgroundColor: colors.secondary,
                  border: `3px solid ${colors.neutral}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  color: colors.neutral,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'monospace',
                  boxShadow: '0 3px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                {symbol}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* LaTeX Preview */}
      {showPreview && currentInput && (
        <div className="neo-card" style={{
          marginBottom: '12px',
          padding: '16px',
          backgroundColor: colors.white,
          borderRadius: '16px',
          border: `4px solid ${colors.neutral}`,
          minHeight: '60px',
          boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 900,
              letterSpacing: '-0.025em',
              color: colors.neutral
            }}>
              <Eye size={14} />
              Vista Previa LaTeX
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: colors.text,
                opacity: 0.7
              }}
            >
              <Eye size={12} />
            </motion.button>
          </div>
          <div style={{
            backgroundColor: colors.white,
            border: `3px solid ${colors.neutral}`,
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 0 rgba(0, 0, 0, 0.1)'
          }}>
            {latexPreview && (
              <InlineMath math={latexPreview} />
            )}
          </div>
        </div>
      )}

      {/* Predefined Limits */}
      {activeTab === 2 && (
        <div className="neo-card" style={{
          marginBottom: '12px',
          padding: '16px',
          backgroundColor: colors.secondary,
          borderRadius: '16px',
          border: `4px solid ${colors.neutral}`,
          boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: colors.neutral
          }}>
            Límites Predefinidos
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px'
          }}>
            {predefinedLimits.map((limit, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addSymbolToRecent(limit.value)}
                className="neo-button"
                style={{
                  padding: '8px 12px',
                  backgroundColor: colors.primary,
                  border: `3px solid ${colors.neutral}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  color: colors.neutral,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'monospace',
                  boxShadow: '0 3px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                {limit.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Contextual Suggestions */}
      {suggestions.length > 0 && showSuggestions && (
        <div style={{
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: colors.hover,
          borderRadius: '8px',
          borderLeft: `3px solid ${colors.accent2}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: colors.accent3
          }}>
            <Lightbulb size={14} />
            Sugerencias
          </div>
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            {suggestions.map((sugg, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => addSymbolToRecent(sugg)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: colors.accent2 + '40',
                  border: `1px solid ${colors.accent2}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.accent4,
                  transition: 'all 0.2s'
                }}
              >
                {sugg}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: onSubmit ? (onEditRequest ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)') : 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onBackspace}
          title="Retroceso (Backspace)"
          className="neo-button"
          style={{
            padding: '16px',
            backgroundColor: colors.secondary,
            color: colors.neutral,
            border: `4px solid ${colors.neutral}`,
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 900,
            fontSize: '14px',
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
          }}
        >
          <Delete size={16} />
          <span style={{ display: 'none' }}>←</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClear}
          title="Limpiar todo (Delete)"
          className="neo-button"
          style={{
            padding: '16px',
            backgroundColor: '#FF4444',
            color: colors.white,
            border: `4px solid ${colors.neutral}`,
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 900,
            fontSize: '14px',
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
          }}
        >
          <RotateCcw size={16} />
          <span style={{ fontSize: '13px' }}>C</span>
        </motion.button>

        {onSubmit && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onSubmit}
            title="Enviar (Enter)"
            style={{
              padding: '12px',
              backgroundColor: colors.accent3,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              gridColumn: onSubmit !== undefined ? 'span 1' : 'span 2'
            }}
          >
            <Send size={16} />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowPreview(!showPreview)}
          title="Alternar vista previa LaTeX"
          style={{
            padding: '12px',
            backgroundColor: showPreview ? colors.accent1 : colors.hover,
            color: showPreview ? colors.accent4 : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <Eye size={16} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowSuggestions(!showSuggestions)}
          title="Alternar sugerencias"
          style={{
            padding: '12px',
            backgroundColor: showSuggestions ? colors.accent2 : colors.hover,
            color: showSuggestions ? colors.accent4 : colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <Lightbulb size={16} />
        </motion.button>

        {onEditRequest && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onEditRequest}
            title="Editar en visualizador"
            style={{
              padding: '12px',
              backgroundColor: colors.accent3,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Edit3 size={16} />
          </motion.button>
        )}
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '6px',
        padding: '4px',
        backgroundColor: colors.hover,
        borderRadius: '4px',
        fontSize: '10px',
        opacity: 0.6,
        textAlign: 'center',
        color: colors.text
      }}>
        <strong>Atajos:</strong> Ctrl+I, Ctrl+P, Ctrl+1-4 | <strong>Teclado físico disponible</strong>
      </div>
    </motion.div>
  );
};

export default MathKeyboard;

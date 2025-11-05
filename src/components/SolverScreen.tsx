import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Moon, Sun, Calculator, Eye, BarChart3, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { HistoryItem, Exercise, IntegralStep } from '../App';
import MathKeyboard from './MathKeyboard';

interface SolverScreenProps {
  colors: any;
  onBack: () => void;
  addToHistory: (item: HistoryItem) => void;
  prefilledExercise: Exercise | null;
  isDark: boolean;
  toggleTheme: () => void;
  onVisualize: (data: any) => void;
  onCompare: (integralId: string) => void;
  onChatWithContext: (integralId: string) => void;
}

const SolverScreen: React.FC<SolverScreenProps> = ({
  colors,
  onBack,
  addToHistory,
  prefilledExercise,
  isDark,
  toggleTheme,
  onVisualize,
  onCompare,
  onChatWithContext
}) => {
  const [functionInput, setFunctionInput] = useState('');
  const [xMin, setXMin] = useState('0');
  const [xMax, setXMax] = useState('1');
  const [yMin, setYMin] = useState('0');
  const [yMax, setYMax] = useState('1');
  const [zMin, setZMin] = useState('0');
  const [zMax, setZMax] = useState('1');
  const [coordType, setCoordType] = useState('cartesian');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentIntegralId, setCurrentIntegralId] = useState<string | null>(null);
  const hasAutoSolved = useRef(false);

  useEffect(() => {
    if (prefilledExercise && !hasAutoSolved.current) {
      hasAutoSolved.current = true;
      console.log('Cargando caso de estudio:', prefilledExercise);
      setFunctionInput(prefilledExercise.function);
      setXMin(prefilledExercise.limits.x[0].toString());
      setXMax(prefilledExercise.limits.x[1].toString());
      setYMin(prefilledExercise.limits.y[0].toString());
      setYMax(prefilledExercise.limits.y[1].toString());
      setZMin(prefilledExercise.limits.z[0].toString());
      setZMax(prefilledExercise.limits.z[1].toString());
      setCoordType(prefilledExercise.type);
      
      setTimeout(() => {
        calculateIntegral();
      }, 100);
    } else if (!prefilledExercise) {
      hasAutoSolved.current = false;
    }
  }, [prefilledExercise]);

  const evaluateFunction = (func: string, x: number, y: number, z: number): number => {
    try {
      const sanitized = func
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/exp/g, 'Math.exp')
        .replace(/ln/g, 'Math.log')
        .replace(/π/g, 'Math.PI')
        .replace(/pi/g, 'Math.PI');
      
      const evalFunc = new Function('x', 'y', 'z', 'Math', `return ${sanitized}`);
      return evalFunc(x, y, z, Math);
    } catch (error) {
      throw new Error('Error evaluando función');
    }
  };

  const calculateIntegral = async () => {
    setError('');
    setResult(null);

    if (!functionInput.trim()) {
      setError('Por favor ingresa una función');
      return;
    }

    try {
      const xMinNum = parseFloat(xMin);
      const xMaxNum = parseFloat(xMax);
      const yMinNum = parseFloat(yMin);
      const yMaxNum = parseFloat(yMax);
      const zMinNum = parseFloat(zMin);
      const zMaxNum = parseFloat(zMax);

      if (isNaN(xMinNum) || isNaN(xMaxNum) || isNaN(yMinNum) || 
          isNaN(yMaxNum) || isNaN(zMinNum) || isNaN(zMaxNum)) {
        setError('Los límites deben ser números válidos');
        return;
      }

      const startTime = Date.now();
      const divisions = 20;
      const dx = (xMaxNum - xMinNum) / divisions;
      const dy = (yMaxNum - yMinNum) / divisions;
      const dz = (zMaxNum - zMinNum) / divisions;

      let sum = 0;

      for (let i = 0; i < divisions; i++) {
        for (let j = 0; j < divisions; j++) {
          for (let k = 0; k < divisions; k++) {
            const x = xMinNum + (i + 0.5) * dx;
            const y = yMinNum + (j + 0.5) * dy;
            const z = zMinNum + (k + 0.5) * dz;

            let funcValue = evaluateFunction(functionInput, x, y, z);
            
            if (coordType === 'cylindrical') {
              const r = Math.sqrt(x * x + y * y);
              funcValue *= r;
            } else if (coordType === 'spherical') {
              const rho = Math.sqrt(x * x + y * y + z * z);
              const phi = Math.acos(z / (rho || 1));
              funcValue *= rho * rho * Math.sin(phi);
            }

            sum += funcValue;
          }
        }
      }

      const integralValue = sum * dx * dy * dz;
      const calculationTime = Date.now() - startTime;

      const steps: IntegralStep[] = [
        {
          step: 1,
          description: 'Identificar la región de integración',
          equation: `R: ${xMin}  x  ${xMax}, ${yMin}  y  ${yMax}, ${zMin}  z  ${zMax}`,
          explanation: `La región está definida por los límites dados.`
        },
        {
          step: 2,
          description: 'Escribir la integral triple',
          equation: ` ${functionInput} dV`,
          explanation: `Integral triple de la función ${functionInput}.`
        },
        {
          step: 3,
          description: 'Aplicar el método numérico',
          equation: `Suma de Riemann con ${divisions} subdivisiones`,
          explanation: 'Aproximación numérica.'
        },
        {
          step: 4,
          description: 'Resultado',
          equation: ` ${integralValue.toFixed(6)}`,
          explanation: `El valor aproximado es ${integralValue.toFixed(6)}.`
        }
      ];

      const integralId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const historyItem: HistoryItem = {
        id: integralId,
        function: functionInput,
        limits: {
          x: [xMinNum, xMaxNum],
          y: [yMinNum, yMaxNum],
          z: [zMinNum, zMaxNum]
        },
        coordinateSystem: coordType as 'cartesian' | 'cylindrical' | 'spherical',
        result: {
          decimal: integralValue,
          steps: steps,
          method: 'numerical'
        },
        timestamp: new Date(),
        calculationTime: calculationTime,
        tags: [],
        isFavorite: false,
        viewCount: 0,
        chatQuestions: 0,
        metadata: {
          difficulty: coordType === 'cartesian' ? 2 : coordType === 'cylindrical' ? 3 : 4,
          jacobian: coordType === 'cartesian' ? '1' : coordType === 'cylindrical' ? 'r' : 'ρ sin(φ)',
          method: 'Suma de Riemann'
        }
      };

      setResult(historyItem.result);
      setCurrentIntegralId(integralId);
      addToHistory(historyItem);
      
      console.log('✅ Integral calculada:', integralValue);
      console.log('✅ Result establecido:', historyItem.result);
      console.log('✅ ID integral:', integralId);

    } catch (err) {
      console.error('❌ Error calculando:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: isDark ? colors.dark : colors.bg }}>
      {/* Header */}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            style={{
              background: '#FFFD8F',
              border: '4px solid #000000',
              borderRadius: '12px',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              width: '48px',
              height: '48px'
            }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: '#FFFD8F',
              border: '4px solid #000000',
              borderRadius: '12px',
              padding: '0.5rem'
            }}>
              <Calculator size={24} color="#000000" />
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.75rem', 
              fontWeight: '900',
              color: '#FFFFFF',
              textTransform: 'uppercase'
            }}>
              RESOLVER INTEGRAL TRIPLE
            </h1>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            background: '#B0CE88',
            border: '4px solid #000000',
            borderRadius: '12px',
            padding: '0.5rem',
            cursor: 'pointer',
            width: '48px',
            height: '48px'
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        
        {/* Notificación caso de estudio */}
        {prefilledExercise && (
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: colors.primary + '20',
            border: `2px solid ${colors.primary}`,
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: colors.primary }}>
              CASO DE INGENIERÍA CARGADO
            </div>
            <div style={{ fontSize: '13px', color: colors.text }}>
              {prefilledExercise.title}
            </div>
          </div>
        )}

        {/* Configuración */}
        <div style={{
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '24px', color: colors.primary, textTransform: 'uppercase' }}>
            CONFIGURACIÓN
          </h2>

          {/* Función */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px', color: colors.text }}>
              Función f(x,y,z)
            </label>
            <input
              type="text"
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              placeholder="Ejemplo: x*y*z"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                border: '3px solid #000000',
                borderRadius: '12px',
                background: isDark ? colors.dark : '#FFFFFF',
                color: colors.text,
                fontFamily: 'monospace'
              }}
            />
            
            {/* Teclado Matemático */}
            <div style={{ marginTop: '16px' }}>
              <MathKeyboard
                onInsert={(symbol) => setFunctionInput(prev => prev + symbol)}
                onBackspace={() => setFunctionInput(prev => prev.slice(0, -1))}
                onClear={() => setFunctionInput('')}
                currentInput={functionInput}
                colors={colors}
                isDark={isDark}
                showLatexPreview={false}
                compactMode={true}
              />
            </div>
          </div>

          {/* Límites */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              fontWeight: '700', 
              marginBottom: '12px', 
              display: 'block', 
              color: colors.text,
              textTransform: 'uppercase'
            }}>
              Límites de Integración
            </label>
            
            {/* Límites X */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                marginBottom: '6px',
                color: colors.text,
                opacity: 0.8
              }}>
                Variable X
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={xMin} 
                  onChange={(e) => setXMin(e.target.value)} 
                  placeholder="0" 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }} 
                />
                <span style={{ fontWeight: '700', color: colors.text }}>≤ x ≤</span>
                <input 
                  type="text" 
                  value={xMax} 
                  onChange={(e) => setXMax(e.target.value)} 
                  placeholder="1" 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }} 
                />
              </div>
            </div>

            {/* Límites Y */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                marginBottom: '6px',
                color: colors.text,
                opacity: 0.8
              }}>
                Variable Y
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={yMin} 
                  onChange={(e) => setYMin(e.target.value)} 
                  placeholder="0" 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }} 
                />
                <span style={{ fontWeight: '700', color: colors.text }}>≤ y ≤</span>
                <input 
                  type="text" 
                  value={yMax} 
                  onChange={(e) => setYMax(e.target.value)} 
                  placeholder="1" 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }} 
                />
              </div>
            </div>

            {/* Límites Z */}
            <div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                marginBottom: '6px',
                color: colors.text,
                opacity: 0.8
              }}>
                Variable Z
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={zMin} 
                  onChange={(e) => setZMin(e.target.value)} 
                  placeholder="0" 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }} 
                />
                <span style={{ fontWeight: '700', color: colors.text }}>≤ z ≤</span>
                <input 
                  type="text" 
                  value={zMax} 
                  onChange={(e) => setZMax(e.target.value)} 
                  placeholder="1" 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Sistema de Coordenadas */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: '700', marginBottom: '12px', display: 'block', color: colors.text, textTransform: 'uppercase' }}>
              Sistema de Coordenadas
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['cartesian', 'cylindrical', 'spherical'].map((system) => (
                <button
                  key={system}
                  onClick={() => setCoordType(system)}
                  style={{
                    padding: '12px 24px',
                    background: coordType === system ? colors.primary : (isDark ? colors.dark : '#FFFFFF'),
                    border: '3px solid #000000',
                    borderRadius: '12px',
                    color: coordType === system ? '#000000' : colors.text,
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
                    transition: 'all 0.2s'
                  }}
                >
                  {system === 'cartesian' ? 'Cartesianas' : system === 'cylindrical' ? 'Cilíndricas' : 'Esféricas'}
                </button>
              ))}
            </div>
          </div>

          {/* Botón Calcular */}
          <button
            onClick={calculateIntegral}
            style={{
              width: '100%',
              padding: '20px',
              background: colors.primary,
              border: '4px solid #000000',
              borderRadius: '16px',
              fontSize: '1.3rem',
              fontWeight: '900',
              cursor: 'pointer'
            }}
          >
            CALCULAR
          </button>

          {error && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#ff4444', border: '3px solid #000000', borderRadius: '12px', color: '#FFFFFF' }}>
              {error}
            </div>
          )}
        </div>

        {/* Resultado */}
        {result && (
          <div style={{
            background: isDark ? colors.tertiary : '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '900', 
              marginBottom: '24px',
              color: colors.primary,
              textTransform: 'uppercase'
            }}>
              RESULTADO
            </h2>
            
            <div style={{ 
              padding: '24px', 
              background: colors.primary, 
              border: '3px solid #000000', 
              borderRadius: '16px', 
              textAlign: 'center', 
              marginBottom: '24px',
              boxShadow: '0 4px 0 rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'monospace', color: '#000000' }}>
                {result.decimal.toFixed(6)}
              </div>
            </div>

            {/* Botones Principales */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '700', 
                marginBottom: '12px',
                color: colors.text,
                textTransform: 'uppercase'
              }}>
                Acciones Principales
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => onVisualize({ 
                    function: functionInput, 
                    limits: { 
                      x: [parseFloat(xMin), parseFloat(xMax)], 
                      y: [parseFloat(yMin), parseFloat(yMax)], 
                      z: [parseFloat(zMin), parseFloat(zMax)] 
                    }, 
                    coordinateSystem: coordType, 
                    result 
                  })}
                  style={{ 
                    padding: '20px', 
                    background: '#FFFD8F', 
                    border: '4px solid #000000', 
                    borderRadius: '16px', 
                    fontWeight: '900', 
                    fontSize: '1.1rem',
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    textTransform: 'uppercase',
                    boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 0 rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
                  }}
                >
                  <Eye size={24} />
                  GRAFICAR 3D
                </button>
                
                <button
                  onClick={() => currentIntegralId && onChatWithContext(currentIntegralId)}
                  style={{ 
                    padding: '20px', 
                    background: '#4C763B', 
                    border: '4px solid #000000', 
                    borderRadius: '16px', 
                    color: '#FFFFFF', 
                    fontWeight: '900',
                    fontSize: '1.1rem',
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    textTransform: 'uppercase',
                    boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 0 rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
                  }}
                >
                  <MessageCircle size={24} />
                  EXPLICAR IA
                </button>
              </div>
            </div>

            {/* Botones Secundarios */}
            <div>
              <h3 style={{ 
                fontSize: '0.9rem', 
                fontWeight: '700', 
                marginBottom: '12px',
                color: colors.text,
                textTransform: 'uppercase',
                opacity: 0.8
              }}>
                Otras Acciones
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => currentIntegralId && onCompare(currentIntegralId)}
                  style={{ 
                    flex: 1,
                    minWidth: '200px',
                    padding: '14px', 
                    background: '#B0CE88', 
                    border: '3px solid #000000', 
                    borderRadius: '12px', 
                    fontWeight: '700', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <BarChart3 size={18} />
                  COMPARAR MÉTODOS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolverScreen;

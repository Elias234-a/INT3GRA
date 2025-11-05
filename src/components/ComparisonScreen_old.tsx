import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Calculator, Eye, Star, Copy, RotateCcw, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { HistoryItem, IntegralStep } from '../App';

interface ComparisonScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  integralId?: string | null;
  history: HistoryItem[];
  onSelectIntegral: (id: string) => void;
  onVisualize: (integralData: any) => void;
  onOpenChat: (integralId: string) => void;
}

interface CoordinateComparison {
  system: 'cartesian' | 'cylindrical' | 'spherical';
  integral: string;
  limits: string;
  jacobian: string;
  steps: IntegralStep[];
  difficulty: number;
  result: string;
  isOptimal: boolean;
  canSolve: boolean;
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({
  colors,
  onBack,
  isDark,
  toggleTheme,
  integralId,
  history,
  onSelectIntegral,
  onVisualize,
  onOpenChat
}) => {
  const [selectedIntegral, setSelectedIntegral] = useState<HistoryItem | null>(null);
  const [comparisons, setComparisons] = useState<CoordinateComparison[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (integralId) {
      const integral = history.find(item => item.id === integralId);
      if (integral) {
        setSelectedIntegral(integral);
        generateComparisons(integral);
      }
    }
  }, [integralId, history]);

  const analyzeFunction = async (functionStr: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/solver/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: functionStr })
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setAnalysisResult(analysis);
        return analysis;
      }
    } catch (error) {
      console.error('Error analyzing function:', error);
    }
    return null;
  };

  const generateComparisons = async (integral: HistoryItem) => {
    setLoading(true);
    
    try {
      // Primero analizar la función
      const analysis = await analyzeFunction(integral.function);
      
      const systems: Array<'cartesian' | 'cylindrical' | 'spherical'> = ['cartesian', 'cylindrical', 'spherical'];
      const newComparisons: CoordinateComparison[] = [];

      for (const system of systems) {
        const comparison = await generateComparisonForSystem(integral, system, analysis);
        newComparisons.push(comparison);
        canSolve: true
      },
      {
        system: 'cylindrical',
        integral: `∫∫∫ ${convertToCylindrical(integral.function)} r dr dθ dz`,
        limits: 'r: [0, R], θ: [0, 2π], z: [z₁, z₂]',
        jacobian: 'J = r',
        steps: generateStepsForSystem('cylindrical', integral),
        difficulty: calculateDifficulty('cylindrical', integral),
        result: integral.result.decimal.toFixed(4),
        isOptimal: integral.coordinateSystem === 'cylindrical',
        canSolve: canSolveInSystem('cylindrical', integral)
      },
      {
        system: 'spherical',
        integral: `∫∫∫ ${convertToSpherical(integral.function)} ρ² sin(φ) dρ dθ dφ`,
        limits: 'ρ: [0, R], θ: [0, 2π], φ: [0, π]',
        jacobian: 'J = ρ² sin(φ)',
        steps: generateStepsForSystem('spherical', integral),
        difficulty: calculateDifficulty('spherical', integral),
        result: integral.result.decimal.toFixed(4),
        isOptimal: integral.coordinateSystem === 'spherical',
        canSolve: canSolveInSystem('spherical', integral)
      }
    ];
    
    setComparisons(comparisons);
    setIsCalculating(false);
  };

  const convertToCylindrical = (func: string): string => {
    return func
      .replace(/x\^2\s*\+\s*y\^2/g, 'r²')
      .replace(/x\*\*2\s*\+\s*y\*\*2/g, 'r²')
      .replace(/x\^2/g, 'r²cos²(θ)')
      .replace(/y\^2/g, 'r²sin²(θ)')
      .replace(/x/g, 'r cos(θ)')
      .replace(/y/g, 'r sin(θ)');
  };

  const convertToSpherical = (func: string): string => {
    return func
      .replace(/x\^2\s*\+\s*y\^2\s*\+\s*z\^2/g, 'ρ²')
      .replace(/x\*\*2\s*\+\s*y\*\*2\s*\+\s*z\*\*2/g, 'ρ²')
      .replace(/x/g, 'ρ sin(φ) cos(θ)')
      .replace(/y/g, 'ρ sin(φ) sin(θ)')
      .replace(/z/g, 'ρ cos(φ)');
  };

  const generateStepsForSystem = (system: string, integral: HistoryItem): IntegralStep[] => {
    const baseSteps = integral.result.steps.length;
    const multiplier = system === 'cartesian' ? 1 : system === 'cylindrical' ? 0.4 : 0.6;
    
    return Array.from({ length: Math.ceil(baseSteps * multiplier) }, (_, i) => ({
      step: i + 1,
      description: `Paso ${i + 1} en ${system}`,
      equation: `Ecuación paso ${i + 1}`,
      explanation: `Explicación del paso ${i + 1} en coordenadas ${system}`
    }));
  };

  const calculateDifficulty = (system: string, integral: HistoryItem): number => {
    const func = integral.function.toLowerCase();
    
    if (func.includes('x^2 + y^2') || func.includes('x**2 + y**2')) {
      return system === 'cylindrical' ? 1 : system === 'cartesian' ? 4 : 3;
    }
    
    if (func.includes('x^2 + y^2 + z^2') || func.includes('x**2 + y**2 + z**2')) {
      return system === 'spherical' ? 1 : system === 'cylindrical' ? 3 : 5;
    }
    
    return system === 'cartesian' ? 2 : 3;
  };

  const canSolveInSystem = (system: string, integral: HistoryItem): boolean => {
    // Lógica para determinar si la integral se puede resolver en el sistema
    return true; // Por simplicidad, asumimos que todas se pueden resolver
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < difficulty ? '#FFFD8F' : 'none'}
        color={i < difficulty ? '#000000' : '#666666'}
      />
    ));
  };

  const getSystemName = (system: string): string => {
    switch (system) {
      case 'cartesian': return 'CARTESIANAS';
      case 'cylindrical': return 'CILÍNDRICAS';
      case 'spherical': return 'ESFÉRICAS';
      default: return system.toUpperCase();
    }
  };

  const getBestSystem = (): CoordinateComparison | null => {
    if (comparisons.length === 0) return null;
    return comparisons.reduce((best, current) => 
      current.difficulty < best.difficulty ? current : best
    );
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
              <BarChart3 size={24} color="#000000" />
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
              COMPARADOR DE SISTEMAS
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

      {/* Content */}
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Selector de Integral */}
        {!selectedIntegral && (
          <div className="neo-card" style={{
            backgroundColor: '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
          }}>
            <h2 style={{
              margin: '0 0 1.5rem',
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#4C763B',
              textTransform: 'uppercase',
              letterSpacing: '-0.025em',
              textAlign: 'center'
            }}>
              SELECCIONA UNA INTEGRAL DEL HISTORIAL
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {history.slice(0, 6).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02, transform: 'translateY(-2px)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedIntegral(item);
                    generateComparisons(item);
                  }}
                  style={{
                    background: '#B0CE88',
                    border: '3px solid #000000',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#000000', marginBottom: '0.5rem' }}>
                    f(x,y,z) = {item.function}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#000000', opacity: 0.8 }}>
                    {getSystemName(item.coordinateSystem)} • {item.result.decimal.toFixed(4)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Comparación de Sistemas */}
        {selectedIntegral && (
          <>
            {/* Información de la Integral */}
            <div className="neo-card" style={{
              backgroundColor: '#FFFD8F',
              border: '4px solid #000000',
              borderRadius: '20px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
            }}>
              <h2 style={{
                margin: '0 0 1rem',
                fontSize: '1.25rem',
                fontWeight: '900',
                color: '#000000',
                textTransform: 'uppercase',
                letterSpacing: '-0.025em',
                textAlign: 'center'
              }}>
                MISMO PROBLEMA EN DIFERENTES SISTEMAS
              </h2>
              
              <div style={{
                background: '#FFFFFF',
                border: '3px solid #000000',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#000000'
              }}>
                ∫∫∫ {selectedIntegral.function} dV
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setSelectedIntegral(null)}
                  style={{
                    background: '#B0CE88',
                    border: '3px solid #000000',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    color: '#000000',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RotateCcw size={16} />
                  CAMBIAR INTEGRAL
                </button>
              </div>
            </div>

            {/* Comparación */}
            {isCalculating ? (
              <div style={{
                background: '#FFFFFF',
                border: '4px solid #000000',
                borderRadius: '20px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4C763B' }}>
                  CALCULANDO COMPARACIONES...
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {comparisons.map((comparison) => (
                  <div
                    key={comparison.system}
                    className="neo-card"
                    style={{
                      backgroundColor: comparison.isOptimal ? '#B0CE88' : '#FFFFFF',
                      border: `4px solid ${comparison.isOptimal ? '#4C763B' : '#000000'}`,
                      borderRadius: '20px',
                      padding: '1.5rem',
                      boxShadow: comparison.isOptimal ? '0 8px 0 rgba(76,118,59,0.4)' : '0 8px 0 rgba(0,0,0,0.25)',
                      position: 'relative'
                    }}
                  >
                    {comparison.isOptimal && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '1rem',
                        background: '#FFFD8F',
                        border: '3px solid #000000',
                        borderRadius: '8px',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.8rem',
                        fontWeight: '900',
                        color: '#000000'
                      }}>
                        USADO ORIGINALMENTE
                      </div>
                    )}

                    <h3 style={{
                      margin: '0 0 1rem',
                      fontSize: '1.1rem',
                      fontWeight: '900',
                      color: comparison.isOptimal ? '#FFFFFF' : '#4C763B',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.025em',
                      textAlign: 'center'
                    }}>
                      {getSystemName(comparison.system)}
                    </h3>

                    {comparison.canSolve ? (
                      <>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            color: comparison.isOptimal ? '#000000' : '#4C763B',
                            marginBottom: '0.5rem'
                          }}>
                            INTEGRAL:
                          </div>
                          <div style={{
                            background: comparison.isOptimal ? '#FFFFFF' : '#F5F5F5',
                            border: '2px solid #000000',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: '#000000'
                          }}>
                            {comparison.integral}
                          </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            color: comparison.isOptimal ? '#000000' : '#4C763B',
                            marginBottom: '0.5rem'
                          }}>
                            JACOBIANO:
                          </div>
                          <div style={{
                            background: comparison.isOptimal ? '#FFFFFF' : '#F5F5F5',
                            border: '2px solid #000000',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: '#000000'
                          }}>
                            {comparison.jacobian}
                          </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            color: comparison.isOptimal ? '#000000' : '#4C763B',
                            marginBottom: '0.5rem'
                          }}>
                            DIFICULTAD:
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            {getDifficultyStars(comparison.difficulty)}
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              fontSize: '0.8rem', 
                              color: comparison.isOptimal ? '#000000' : '#666666'
                            }}>
                              ({comparison.steps.length} pasos)
                            </span>
                          </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            color: comparison.isOptimal ? '#000000' : '#4C763B',
                            marginBottom: '0.5rem'
                          }}>
                            RESULTADO:
                          </div>
                          <div style={{
                            background: comparison.isOptimal ? '#FFFFFF' : '#F5F5F5',
                            border: '2px solid #000000',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            fontFamily: 'monospace',
                            fontSize: '1.1rem',
                            fontWeight: '900',
                            color: '#000000',
                            textAlign: 'center'
                          }}>
                            {comparison.result}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            style={{
                              background: '#FFFD8F',
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
                            VER PASOS
                          </button>
                          
                          <button
                            onClick={() => onVisualize({
                              function: selectedIntegral.function,
                              limits: selectedIntegral.limits,
                              coordinateSystem: comparison.system,
                              result: selectedIntegral.result
                            })}
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
                            <Calculator size={14} />
                            VER 3D
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#666666',
                        fontStyle: 'italic'
                      }}>
                        No es óptima para esta región
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Conclusión */}
            {!isCalculating && comparisons.length > 0 && (
              <div className="neo-card" style={{
                backgroundColor: '#4C763B',
                border: '4px solid #000000',
                borderRadius: '20px',
                padding: '1.5rem',
                marginTop: '2rem',
                boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
                textAlign: 'center'
              }}>
                <h3 style={{
                  margin: '0 0 1rem',
                  fontSize: '1.2rem',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.025em'
                }}>
                  CONCLUSIÓN
                </h3>
                
                {(() => {
                  const best = getBestSystem();
                  if (!best) return null;
                  
                  const others = comparisons.filter(c => c.system !== best.system && c.canSolve);
                  const improvement = others.length > 0 ? 
                    Math.max(...others.map(c => c.difficulty)) - best.difficulty : 0;
                  
                  return (
                    <div style={{
                      background: '#FFFD8F',
                      border: '3px solid #000000',
                      borderRadius: '12px',
                      padding: '1rem',
                      color: '#000000',
                      fontWeight: '700'
                    }}>
                      {getSystemName(best.system)} es {improvement > 0 ? `${improvement}x más fácil` : 'la mejor opción'}
                      <br />
                      <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>
                        GANADOR: {getSystemName(best.system)}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonScreen;

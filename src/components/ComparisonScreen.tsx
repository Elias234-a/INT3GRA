import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, BarChart3, Eye, Star, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
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
  steps: number;
  difficulty: number;
  result: string;
  isOptimal: boolean;
  canSolve: boolean;
  reasons: string[];
  complexity_score: number;
}

interface FunctionAnalysis {
  function: string;
  recommended_system: string;
  complexity_score: number;
  reasons: string[];
  confidence: string;
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
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FunctionAnalysis | null>(null);

  useEffect(() => {
    if (integralId) {
      const integral = history.find(item => item.id === integralId);
      if (integral) {
        setSelectedIntegral(integral);
        generateComparisons(integral);
      }
    }
  }, [integralId, history]);

  const analyzeFunction = async (functionStr: string): Promise<FunctionAnalysis | null> => {
    try {
      const response = await fetch('http://localhost:5001/api/solver/analyze', {
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
        const comparison = generateComparisonForSystem(integral, system, analysis);
        newComparisons.push(comparison);
      }

      // Ordenar por dificultad (más fácil primero)
      newComparisons.sort((a, b) => a.difficulty - b.difficulty);
      
      // Marcar el óptimo
      if (newComparisons.length > 0) {
        newComparisons[0].isOptimal = true;
      }

      setComparisons(newComparisons);
    } catch (error) {
      console.error('Error generating comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComparisonForSystem = (
    integral: HistoryItem, 
    system: 'cartesian' | 'cylindrical' | 'spherical',
    analysis: FunctionAnalysis | null
  ): CoordinateComparison => {
    
    const transformedFunction = transformFunction(integral.function, system);
    const jacobianInfo = getJacobianInfo(system);
    const difficulty = calculateDifficulty(system, integral.function, analysis);
    const canSolve = canSolveInSystem(system, integral.function);
    const reasons = getReasons(system, integral.function, analysis);

    return {
      system,
      integral: `∫∫∫ ${transformedFunction} ${jacobianInfo.element}`,
      limits: getLimitsString(system),
      jacobian: jacobianInfo.jacobian,
      steps: estimateSteps(system, integral.function),
      difficulty,
      result: integral.result.decimal.toFixed(4),
      isOptimal: false, // Se marca después
      canSolve,
      reasons,
      complexity_score: analysis?.complexity_score || 1
    };
  };

  const transformFunction = (func: string, system: string): string => {
    switch (system) {
      case 'cylindrical':
        return func
          .replace(/x\^2\s*\+\s*y\^2/g, 'r²')
          .replace(/x\*\*2\s*\+\s*y\*\*2/g, 'r²')
          .replace(/x/g, 'r cos(θ)')
          .replace(/y/g, 'r sin(θ)');
      
      case 'spherical':
        return func
          .replace(/x\^2\s*\+\s*y\^2\s*\+\s*z\^2/g, 'ρ²')
          .replace(/x\*\*2\s*\+\s*y\*\*2\s*\+\s*z\*\*2/g, 'ρ²')
          .replace(/x/g, 'ρ sin(φ) cos(θ)')
          .replace(/y/g, 'ρ sin(φ) sin(θ)')
          .replace(/z/g, 'ρ cos(φ)');
      
      default:
        return func;
    }
  };

  const getJacobianInfo = (system: string) => {
    const jacobians = {
      cartesian: { jacobian: 'J = 1', element: 'dx dy dz' },
      cylindrical: { jacobian: 'J = r', element: 'r dr dθ dz' },
      spherical: { jacobian: 'J = ρ² sin(φ)', element: 'ρ² sin(φ) dρ dθ dφ' }
    };
    return jacobians[system as keyof typeof jacobians];
  };

  const getLimitsString = (system: string): string => {
    const limits = {
      cartesian: 'x: [a, b], y: [c, d], z: [e, f]',
      cylindrical: 'r: [0, R], θ: [0, 2π], z: [z₁, z₂]',
      spherical: 'ρ: [0, R], θ: [0, 2π], φ: [0, π]'
    };
    return limits[system as keyof typeof limits];
  };

  const calculateDifficulty = (
    system: string, 
    func: string, 
    analysis: FunctionAnalysis | null
  ): number => {
    let baseDifficulty = { cartesian: 3, cylindrical: 2, spherical: 4 }[system] || 3;
    
    // Usar análisis si está disponible
    if (analysis && analysis.recommended_system === system) {
      baseDifficulty = Math.max(1, baseDifficulty - 2);
    }
    
    // Ajustes basados en patrones
    const funcLower = func.toLowerCase();
    if (system === 'cylindrical' && (funcLower.includes('x^2 + y^2') || funcLower.includes('x**2 + y**2'))) {
      baseDifficulty = 1;
    }
    if (system === 'spherical' && (funcLower.includes('x^2 + y^2 + z^2') || funcLower.includes('x**2 + y**2 + z**2'))) {
      baseDifficulty = 1;
    }
    
    return Math.max(1, Math.min(5, baseDifficulty));
  };

  const estimateSteps = (system: string, func: string): number => {
    const baseSteps = { cartesian: 6, cylindrical: 5, spherical: 7 }[system] || 6;
    const complexity = func.length > 20 ? 2 : func.includes('sin') || func.includes('cos') ? 1 : 0;
    return baseSteps + complexity;
  };

  const canSolveInSystem = (system: string, func: string): boolean => {
    // La mayoría de funciones se pueden resolver en cualquier sistema
    // Aquí podrías agregar lógica más específica
    return true;
  };

  const getReasons = (
    system: string, 
    func: string, 
    analysis: FunctionAnalysis | null
  ): string[] => {
    const reasons: string[] = [];
    
    if (analysis && analysis.reasons) {
      reasons.push(...analysis.reasons);
    }
    
    const funcLower = func.toLowerCase();
    
    if (system === 'cylindrical') {
      if (funcLower.includes('x^2 + y^2') || funcLower.includes('x**2 + y**2')) {
        reasons.push('x² + y² se convierte en r² (más simple)');
      }
      if (funcLower.includes('sqrt(x^2 + y^2)')) {
        reasons.push('√(x² + y²) se convierte en r');
      }
    }
    
    if (system === 'spherical') {
      if (funcLower.includes('x^2 + y^2 + z^2') || funcLower.includes('x**2 + y**2 + z**2')) {
        reasons.push('x² + y² + z² se convierte en ρ²');
      }
    }
    
    if (system === 'cartesian') {
      reasons.push('Sistema estándar, siempre funciona');
    }
    
    return reasons;
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < difficulty ? '#FFFD8F' : 'none'}
        color={i < difficulty ? '#FFFD8F' : '#666'}
      />
    ));
  };

  const getSystemName = (system: string): string => {
    const names = {
      cartesian: 'CARTESIANAS',
      cylindrical: 'CILÍNDRICAS', 
      spherical: 'ESFÉRICAS'
    };
    return names[system as keyof typeof names] || system.toUpperCase();
  };

  const getBestSystem = (): CoordinateComparison | null => {
    if (comparisons.length === 0) return null;
    return comparisons.find(c => c.isOptimal) || comparisons[0];
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* Función Analizada */}
        {selectedIntegral && (
          <div style={{
            background: '#FFFD8F',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '1.5rem',
              fontWeight: '900',
              color: '#000000',
              textTransform: 'uppercase'
            }}>
              FUNCIÓN A COMPARAR
            </h2>
            
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '16px',
              padding: '12px',
              background: '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: '12px'
            }}>
              ∫∫∫ {selectedIntegral.function} dV
            </div>

            {analysisResult && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                color: '#000000'
              }}>
                <TrendingUp size={20} />
                <span>Sistema recomendado: {getSystemName(analysisResult.recommended_system)}</span>
                <span style={{
                  background: '#B0CE88',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '2px solid #000000'
                }}>
                  Confianza: {analysisResult.confidence}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: colors.text
          }}>
            Analizando sistemas de coordenadas...
          </div>
        )}

        {/* Comparaciones */}
        {!loading && comparisons.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {comparisons.map((comparison) => (
              <motion.div
                key={comparison.system}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: comparison.isOptimal ? '#B0CE88' : (isDark ? colors.tertiary : '#FFFFFF'),
                  border: '4px solid #000000',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
                  position: 'relative'
                }}
              >
                {comparison.isOptimal && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '24px',
                    background: '#FFFD8F',
                    border: '3px solid #000000',
                    borderRadius: '12px',
                    padding: '4px 12px',
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={16} />
                    ÓPTIMO
                  </div>
                )}

                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '1.3rem',
                  fontWeight: '900',
                  color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#000000'),
                  textTransform: 'uppercase'
                }}>
                  {getSystemName(comparison.system)}
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#000000'),
                    marginBottom: '8px'
                  }}>
                    {comparison.integral}
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#666'),
                    marginBottom: '8px'
                  }}>
                    {comparison.limits}
                  </div>

                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#000000')
                  }}>
                    {comparison.jacobian}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#000000')
                  }}>
                    Dificultad:
                  </span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {getDifficultyStars(comparison.difficulty)}
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#666')
                  }}>
                    ({comparison.steps} pasos)
                  </span>
                </div>

                {comparison.reasons.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#000000'),
                      marginBottom: '8px'
                    }}>
                      Razones:
                    </div>
                    {comparison.reasons.map((reason, index) => (
                      <div key={index} style={{
                        fontSize: '0.8rem',
                        color: comparison.isOptimal ? '#000000' : (isDark ? colors.white : '#666'),
                        marginBottom: '4px',
                        paddingLeft: '12px',
                        position: 'relative'
                      }}>
                        <span style={{ position: 'absolute', left: 0 }}>•</span>
                        {reason}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  <button
                    onClick={() => selectedIntegral && onVisualize({ 
                      function: selectedIntegral.function,
                      limits: selectedIntegral.limits,
                      coordinateSystem: comparison.system,
                      result: selectedIntegral.result
                    })}
                    style={{
                      background: '#FFFD8F',
                      border: '3px solid #000000',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#000000',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={14} />
                    VER EN 3D
                  </button>

                  <button
                    onClick={() => selectedIntegral && onOpenChat(selectedIntegral.id)}
                    style={{
                      background: isDark ? colors.tertiary : '#FFFFFF',
                      border: '3px solid #000000',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: isDark ? colors.white : '#000000',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    EXPLICAR
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Recomendación Final */}
        {!loading && comparisons.length > 0 && (() => {
          const best = getBestSystem();
          if (!best) return null;
          
          const others = comparisons.filter(c => c.system !== best.system && c.canSolve);
          const improvement = others.length > 0 ? 
            Math.max(...others.map(c => c.difficulty)) - best.difficulty : 0;
          
          return (
            <div style={{
              background: '#FFFD8F',
              border: '3px solid #000000',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '1.3rem',
                fontWeight: '900',
                color: '#000000',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={24} />
                RECOMENDACIÓN FINAL
              </h3>
              
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#000000'
              }}>
                El sistema <strong>{getSystemName(best.system)}</strong> es el más eficiente para esta integral.
              </p>
              
              {improvement > 0 && (
                <p style={{
                  margin: '0',
                  fontSize: '1rem',
                  color: '#000000'
                }}>
                  Es <strong>{improvement} nivel{improvement > 1 ? 'es' : ''}</strong> más fácil que otros métodos.
                </p>
              )}
            </div>
          );
        })()}

        {/* Selector de Integrales del Historial */}
        {!selectedIntegral && history.length > 0 && (
          <div style={{
            background: isDark ? colors.tertiary : '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '1.5rem',
              fontWeight: '900',
              color: isDark ? colors.white : '#000000',
              textTransform: 'uppercase'
            }}>
              SELECCIONAR INTEGRAL DEL HISTORIAL
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {history.slice(0, 6).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedIntegral(item);
                    generateComparisons(item);
                  }}
                  style={{
                    background: '#FFFD8F',
                    border: '3px solid #000000',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
                  }}
                >
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#000000',
                    marginBottom: '8px'
                  }}>
                    {item.function}
                  </div>
                  
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    {getSystemName(item.coordinateSystem)} • {item.result.decimal.toFixed(4)}
                  </div>
                  
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#999'
                  }}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonScreen;

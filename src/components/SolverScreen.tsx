import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Moon, Sun, Calculator, Eye, BarChart3, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { HistoryItem, Exercise, IntegralStep } from '../App';
import MathKeyboard from './MathKeyboard';
import { robustSolver } from '../services/RobustIntegralSolver';
import { highPrecisionSolver } from '../services/HighPrecisionSolver';
import { pythonSolverService, PythonSolverLimits } from '../services/PythonSolverService';
import { universalSolver } from '../services/UniversalIntegralSolver';

// Parser para extraer límites de integrales completas
interface ParsedIntegral {
  function: string;
  limits: {
    x: [string, string];
    y: [string, string];
    z: [string, string];
  };
  variables: string[];
}

const parseIntegralWithLimits = (input: string): ParsedIntegral | null => {
  try {
    // Limpiar el input y normalizar símbolos matemáticos
    let cleanInput = input.trim()
      .replace(/\s+/g, '')
      .replace(/–/g, '-') // Reemplazar guión largo con guión normal
      .replace(/−/g, '-'); // Reemplazar signo menos matemático
    
    // Aplicar normalización de símbolos matemáticos
    cleanInput = normalizeMathSymbols(cleanInput);
    
    console.log('🔍 Parseando integral con símbolos normalizados:', cleanInput);
    
    // Patrón específico para el formato: ∫z=1z=0∫y=4y=2∫x=5x=–1(x+yz2)dxdydz
    // Dividir en partes para manejar mejor
    const integralParts = cleanInput.split('∫').filter(part => part.length > 0);
    console.log('🔍 Partes de la integral:', integralParts);
    
    if (integralParts.length >= 3) {
      const limits: any = {};
      let functionPart = '';
      
      // Procesar cada parte de la integral
      for (let i = 0; i < integralParts.length; i++) {
        const part = integralParts[i];
        
        // Buscar patrón variable=número variable=número
        const limitPattern = /([xyz])=([^xyz(]+?)([xyz])=([^xyz(]+)/;
        const limitMatch = part.match(limitPattern);
        
        if (limitMatch) {
          const [, var1, upper, var2, lower] = limitMatch;
          if (var1 === var2) {
            limits[var1] = [
              lower.replace(/[^0-9.-]/g, ''), 
              upper.replace(/[^0-9.-]/g, '')
            ];
            console.log(`📊 Límite ${var1}: [${limits[var1][0]}, ${limits[var1][1]}]`);
          }
        }
        
        // Buscar la función (entre paréntesis)
        const funcMatch = part.match(/\(([^)]+)\)/);
        if (funcMatch) {
          functionPart = funcMatch[1];
          console.log('🎯 Función encontrada:', functionPart);
        }
      }
      
      // Si encontramos límites y función, devolver resultado
      if (Object.keys(limits).length >= 2 && functionPart) {
        console.log('✅ Parsing exitoso:', { limits, functionPart });
        
        return {
          function: functionPart.trim(),
          limits: {
            x: limits.x || ['0', '1'],
            y: limits.y || ['0', '1'],
            z: limits.z || ['0', '1']
          },
          variables: Object.keys(limits)
        };
      }
    }
    
    // Patrón alternativo más general: ∫z=a∫y=b∫x=c(función)dxdydz
    const generalPattern = /∫([xyz])=([^∫]+?)∫([xyz])=([^∫]+?)∫([xyz])=([^(]+?)\(([^)]+)\)d[xyz]d[xyz]d[xyz]/;
    const generalMatch = cleanInput.match(generalPattern);
    
    if (generalMatch) {
      console.log('✅ Formato general detectado:', generalMatch);
      const [, var1, limits1, var2, limits2, var3, limits3, func] = generalMatch;
      
      // Parsear límites que pueden estar en formato "1z=0" o "1^0"
      const parseLimits = (limitStr: string, variable: string): [string, string] => {
        // Buscar patrón variable=número
        const varPattern = new RegExp(`([^${variable}]*?)${variable}=([^${variable}]*)`);
        const varMatch = limitStr.match(varPattern);
        
        if (varMatch) {
          const upper = varMatch[1].replace(/[^0-9.-]/g, '');
          const lower = varMatch[2].replace(/[^0-9.-]/g, '');
          return [lower, upper];
        }
        
        // Fallback: buscar números
        const numbers = limitStr.match(/-?\d+\.?\d*/g);
        if (numbers && numbers.length >= 2) {
          return [numbers[1], numbers[0]]; // Orden invertido para límites
        }
        return ['0', '1'];
      };
      
      const limit1 = parseLimits(limits1, var1);
      const limit2 = parseLimits(limits2, var2);
      const limit3 = parseLimits(limits3, var3);
      
      // Mapear variables a coordenadas
      const variableMap: any = {};
      variableMap[var1] = limit1;
      variableMap[var2] = limit2;
      variableMap[var3] = limit3;
      
      console.log('📊 Límites extraídos (general):', variableMap);
      
      return {
        function: func.trim(),
        limits: {
          x: variableMap.x || ['0', '1'],
          y: variableMap.y || ['0', '1'],
          z: variableMap.z || ['0', '1']
        },
        variables: [var1, var2, var3]
      };
    }
    
    // Si no se puede parsear, intentar extraer solo la función
    const functionPattern = /\(([^)]+)\)/;
    const functionMatch = cleanInput.match(functionPattern);
    
    if (functionMatch) {
      console.log('⚠️ Solo función detectada:', functionMatch[1]);
      return {
        function: functionMatch[1].trim(),
        limits: {
          x: ['0', '1'],
          y: ['0', '1'],
          z: ['0', '1']
        },
        variables: ['x', 'y', 'z']
      };
    }
    
    console.log('❌ No se pudo parsear la integral');
    return null;
    
  } catch (error) {
    console.warn('Error parsing integral:', error);
    return null;
  }
};

// Función para normalizar símbolos matemáticos
const normalizeMathSymbols = (input: string): string => {
  return input
    .replace(/√/g, 'sqrt') // Raíz cuadrada
    .replace(/∛/g, 'cbrt') // Raíz cúbica
    .replace(/∜/g, 'sqrt4') // Raíz cuarta
    .replace(/²/g, '^2') // Superíndice cuadrado
    .replace(/³/g, '^3') // Superíndice cúbico
    .replace(/⁴/g, '^4') // Superíndice cuarto
    .replace(/⁵/g, '^5') // Superíndice quinto
    .replace(/⁶/g, '^6') // Superíndice sexto
    .replace(/⁷/g, '^7') // Superíndice séptimo
    .replace(/⁸/g, '^8') // Superíndice octavo
    .replace(/⁹/g, '^9') // Superíndice noveno
    .replace(/⁰/g, '^0') // Superíndice cero
    .replace(/¹/g, '^1') // Superíndice uno
    .replace(/α/g, 'alpha') // Alfa
    .replace(/β(?!eta)/g, 'beta') // Beta (evitar conflicto con 'beta')
    .replace(/γ(?!amma)/g, 'gamma') // Gamma (evitar conflicto con 'gamma')
    .replace(/δ(?!elta)/g, 'delta') // Delta (evitar conflicto con 'delta')
    .replace(/θ(?!eta)/g, 'theta') // Theta (evitar conflicto con 'theta')
    .replace(/λ(?!ambda)/g, 'lambda') // Lambda (evitar conflicto con 'lambda')
    .replace(/μ(?!u)/g, 'mu') // Mu (evitar conflicto con 'mu')
    .replace(/ρ(?!ho)/g, 'rho') // Rho (evitar conflicto con 'rho')
    .replace(/σ(?!igma)/g, 'sigma') // Sigma (evitar conflicto con 'sigma')
    .replace(/φ(?!i)/g, 'phi') // Phi (evitar conflicto con 'phi')
    .replace(/ω(?!mega)/g, 'omega') // Omega (evitar conflicto con 'omega')
    .replace(/∞/g, 'Infinity') // Infinito
    .replace(/≤/g, '<=') // Menor o igual
    .replace(/≥/g, '>=') // Mayor o igual
    .replace(/≠/g, '!=') // Diferente
    .replace(/≈/g, '~=') // Aproximadamente igual
    .replace(/±/g, '+-') // Más menos
    .replace(/∑/g, 'sum') // Sumatoria
    .replace(/∏/g, 'prod') // Productoria
    .replace(/∂/g, 'd') // Derivada parcial
    .replace(/∇/g, 'nabla') // Nabla
    .replace(/∆/g, 'Delta') // Delta mayúscula
    .replace(/∈/g, 'in') // Pertenece
    .replace(/∉/g, 'notin') // No pertenece
    .replace(/∪/g, 'union') // Unión
    .replace(/∩/g, 'intersection') // Intersección
    .replace(/⊂/g, 'subset') // Subconjunto
    .replace(/⊃/g, 'superset') // Superconjunto
    .replace(/⊆/g, 'subseteq') // Subconjunto o igual
    .replace(/⊇/g, 'superseteq') // Superconjunto o igual
    .replace(/∅/g, 'emptyset') // Conjunto vacío
    .replace(/ℝ/g, 'R') // Números reales
    .replace(/ℕ/g, 'N') // Números naturales
    .replace(/ℤ/g, 'Z') // Números enteros
    .replace(/ℚ/g, 'Q') // Números racionales
    .replace(/ℂ/g, 'C') // Números complejos
    .replace(/\be\b/g, 'Math.E') // Número e (solo palabra completa)
    .replace(/π/g, 'Math.PI') // Pi
    .replace(/\bpi\b/g, 'Math.PI'); // Pi alternativo (solo palabra completa)
};

// Función para construir integral completa desde límites individuales
const buildCompleteIntegral = (
  func: string,
  type: 'simple' | 'double' | 'triple',
  xMin: string, xMax: string,
  yMin: string, yMax: string,
  zMin: string, zMax: string,
  regionType: 'rectangular' | 'general' = 'rectangular',
  variableLimits?: {
    xMinFunc?: string, xMaxFunc?: string,
    yMinFunc?: string, yMaxFunc?: string,
    zMinFunc?: string, zMaxFunc?: string
  }
): string => {
  if (!func.trim()) return '';
  
  // Construir según el tipo de integral
  switch (type) {
    case 'simple':
      if (regionType === 'general' && variableLimits?.xMinFunc && variableLimits?.xMaxFunc) {
        return `∫[${variableLimits.xMinFunc}]^[${variableLimits.xMaxFunc}] (${func}) dx`;
      }
      return `∫[${xMin}]^[${xMax}] (${func}) dx`;
      
    case 'double':
      if (regionType === 'general') {
        const yLimits = variableLimits?.yMinFunc && variableLimits?.yMaxFunc 
          ? `[${variableLimits.yMinFunc}]^[${variableLimits.yMaxFunc}]`
          : `[${yMin}]^[${yMax}]`;
        const xLimits = variableLimits?.xMinFunc && variableLimits?.xMaxFunc
          ? `[${variableLimits.xMinFunc}]^[${variableLimits.xMaxFunc}]`
          : `[${xMin}]^[${xMax}]`;
        return `∬ ∫${yLimits} ∫${xLimits} (${func}) dx dy`;
      }
      return `∬[${xMin},${xMax}]×[${yMin},${yMax}] (${func}) dx dy`;
      
    case 'triple':
    default:
      if (regionType === 'general') {
        const zLimits = variableLimits?.zMinFunc && variableLimits?.zMaxFunc
          ? `[${variableLimits.zMinFunc}]^[${variableLimits.zMaxFunc}]`
          : `[${zMin}]^[${zMax}]`;
        const yLimits = variableLimits?.yMinFunc && variableLimits?.yMaxFunc
          ? `[${variableLimits.yMinFunc}]^[${variableLimits.yMaxFunc}]`
          : `[${yMin}]^[${yMax}]`;
        const xLimits = variableLimits?.xMinFunc && variableLimits?.xMaxFunc
          ? `[${variableLimits.xMinFunc}]^[${variableLimits.xMaxFunc}]`
          : `[${xMin}]^[${xMax}]`;
        return `∭ ∫${zLimits} ∫${yLimits} ∫${xLimits} (${func}) dx dy dz`;
      }
      return `∫z=${zMax}z=${zMin}∫y=${yMax}y=${yMin}∫x=${xMax}x=${xMin}(${func})dxdydz`;
  }
};

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
  const [integralType, setIntegralType] = useState<'simple' | 'double' | 'triple'>('triple');
  const [regionType, setRegionType] = useState<'rectangular' | 'general'>('rectangular');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentIntegralId, setCurrentIntegralId] = useState<string | null>(null);
  
  // Estados para límites variables (regiones generales)
  const [xMinFunc, setXMinFunc] = useState('');
  const [xMaxFunc, setXMaxFunc] = useState('');
  const [yMinFunc, setYMinFunc] = useState('');
  const [yMaxFunc, setYMaxFunc] = useState('');
  const [zMinFunc, setZMinFunc] = useState('');
  const [zMaxFunc, setZMaxFunc] = useState('');
  const hasAutoSolved = useRef(false);
  const [showExamples, setShowExamples] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [usePythonSolver, setUsePythonSolver] = useState(true);
  const [pythonSolverAvailable, setPythonSolverAvailable] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Estados para sincronización bidireccional
  const [isUpdatingFromParsing, setIsUpdatingFromParsing] = useState(false);
  const [isUpdatingFromLimits, setIsUpdatingFromLimits] = useState(false);
  const [completeIntegralDisplay, setCompleteIntegralDisplay] = useState('');

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

  // Verificar disponibilidad del Python Solver al cargar
  useEffect(() => {
    const checkPythonSolver = async () => {
      try {
        const health = await pythonSolverService.checkHealth();
        setPythonSolverAvailable(health.available);
        console.log('🐍 Python Solver disponible:', health.available);
      } catch (error) {
        setPythonSolverAvailable(false);
        console.log('❌ Python Solver no disponible');
      }
    };
    
    checkPythonSolver();
  }, []);

  // Efecto para actualizar la integral completa cuando cambien los límites individuales
  useEffect(() => {
    if (!isUpdatingFromParsing && functionInput.trim()) {
      setIsUpdatingFromLimits(true);
      const completeIntegral = buildCompleteIntegral(
        functionInput, 
        integralType,
        xMin, xMax, yMin, yMax, zMin, zMax,
        regionType,
        {
          xMinFunc, xMaxFunc,
          yMinFunc, yMaxFunc,
          zMinFunc, zMaxFunc
        }
      );
      setCompleteIntegralDisplay(completeIntegral);
      console.log('🔄 Integral completa actualizada:', completeIntegral);
      
      // Reset flag después de un pequeño delay
      setTimeout(() => setIsUpdatingFromLimits(false), 100);
    }
  }, [functionInput, xMin, xMax, yMin, yMax, zMin, zMax, integralType, regionType, xMinFunc, xMaxFunc, yMinFunc, yMaxFunc, zMinFunc, zMaxFunc, isUpdatingFromParsing]);

  const evaluateFunction = (func: string, x: number, y: number, z: number): number => {
    try {
      // Normalizar símbolos matemáticos primero
      let sanitized = normalizeMathSymbols(func);
      
      // Aplicar transformaciones adicionales para JavaScript
      sanitized = sanitized
        .replace(/\^/g, '**') // Potencias
        .replace(/(\d)([a-zA-Z])/g, '$1*$2') // 2x -> 2*x
        .replace(/([a-zA-Z])(\d)/g, '$1*$2') // x2 -> x*2
        .replace(/\)\(/g, ')*(') // )( -> )*(
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/cbrt/g, 'Math.cbrt')
        .replace(/sqrt4/g, '(x => Math.pow(x, 1/4))')
        .replace(/exp/g, 'Math.exp')
        .replace(/ln/g, 'Math.log')
        .replace(/log/g, 'Math.log10')
        .replace(/abs/g, 'Math.abs')
        .replace(/floor/g, 'Math.floor')
        .replace(/ceil/g, 'Math.ceil')
        .replace(/round/g, 'Math.round')
        .replace(/min/g, 'Math.min')
        .replace(/max/g, 'Math.max')
        .replace(/pow/g, 'Math.pow')
        .replace(/asin/g, 'Math.asin')
        .replace(/acos/g, 'Math.acos')
        .replace(/atan/g, 'Math.atan')
        .replace(/atan2/g, 'Math.atan2')
        .replace(/sinh/g, 'Math.sinh')
        .replace(/cosh/g, 'Math.cosh')
        .replace(/tanh/g, 'Math.tanh');
      
      console.log('🔧 Función sanitizada:', sanitized);
      
      const evalFunc = new Function('x', 'y', 'z', 'Math', `return ${sanitized}`);
      return evalFunc(x, y, z, Math);
    } catch (error) {
      console.warn('Error evaluando función:', error);
      throw new Error('Error evaluando función');
    }
  };

  const calculateIntegral = async () => {
    setError('');
    setResult(null);
    setIsCalculating(true);

    if (!functionInput.trim()) {
      setError('Por favor ingresa una función');
      setIsCalculating(false);
      return;
    }

    try {
      console.log('🧮 Iniciando cálculo de integral:', {
        function: functionInput,
        limits: { x: [xMin, xMax], y: [yMin, yMax], z: [zMin, zMax] },
        coordinateSystem: coordType,
        usePythonSolver,
        pythonSolverAvailable
      });

      const limits = {
        x: [parseFloat(xMin), parseFloat(xMax)] as [number, number],
        y: [parseFloat(yMin), parseFloat(yMax)] as [number, number],
        z: [parseFloat(zMin), parseFloat(zMax)] as [number, number]
      };

      let integralResult;
      let usedPythonSolverFlag = false;

      // Usar el nuevo sistema mejorado con fallback automático
      if (usePythonSolver && pythonSolverAvailable) {
        console.log('🐍 Usando Python Solver con fallback automático...');
        
        // Crear fallback solver
        const fallbackSolver = async (func: string, lims: any, coord: string) => {
          console.log('⚡ Ejecutando fallback JavaScript...');
          let result = await highPrecisionSolver.solveWithHighPrecision(func, lims, coord as any);
          if (!result || result.precision < 0.7) {
            result = await robustSolver.solveTripleIntegral(func, lims, coord as any);
          }
          return result;
        };

        // Usar el método mejorado con opciones
        integralResult = await pythonSolverService.solveWithFallback(
          functionInput,
          limits as PythonSolverLimits,
          coordType as any,
          fallbackSolver,
          {
            method: 'auto', // Intentar simbólico primero, luego numérico
            precision: 0.001,
            timeout: 30
          }
        );

        // Determinar si se usó Python o fallback
        usedPythonSolverFlag = !integralResult.metadata?.fallback_used;
        
      } else {
        console.log(`⚡ Usando Universal Solver para integral ${integralType}...`);
        
        // Usar el UniversalIntegralSolver que soporta todos los tipos
        integralResult = await universalSolver.solveAnyIntegral(
          functionInput, 
          limits, 
          integralType, 
          coordType as any
        );
        
        // Si falla, usar fallback según el tipo
        if (!integralResult || integralResult.success === false) {
          if (integralType === 'triple') {
            console.log('🔄 Fallback a HighPrecisionSolver...');
            integralResult = await highPrecisionSolver.solveWithHighPrecision(functionInput, limits, coordType as any);
            
            if (!integralResult || integralResult.precision < 0.7) {
              console.log('🔄 Fallback a RobustSolver...');
              integralResult = await robustSolver.solveTripleIntegral(functionInput, limits, coordType as any);
            }
          }
        }
      }

      if (!integralResult || integralResult.success === false) {
        throw new Error(integralResult?.error || 'No se pudo resolver la integral');
      }

      // Generar ID único para esta integral
      const integralId = `integral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentIntegralId(integralId);

      // Construir el objeto de resultado con metadatos completos
      const historyItem: HistoryItem = {
        id: integralId,
        function: functionInput,
        limits: limits,
        coordinateSystem: coordType as 'cartesian' | 'cylindrical' | 'spherical',
        result: integralResult.result,
        timestamp: new Date(),
        calculationTime: integralResult.execution_time || 0,
        tags: [integralType, regionType],
        isFavorite: false,
        viewCount: 0,
        chatQuestions: 0,
        metadata: {
          difficulty: integralResult.difficulty || 1,
          jacobian: integralResult.jacobian || '1',
          transformations: integralResult.transformations || [],
          method: integralResult.method || (usedPythonSolverFlag ? 'Python (SymPy/SciPy)' : 'Universal Solver'),
          confidence: integralResult.confidence || integralResult.precision || integralResult.accuracy || 0.85,
          analysis: integralResult.analysis || integralResult.metadata || {}
        }
      };

      setResult({
        decimal: integralResult.result,
        exact: integralResult.exact,
        steps: integralResult.steps || [],
        method: historyItem.metadata.method,
        confidence: integralResult.confidence || integralResult.precision || 0.85,
        analysis: integralResult.analysis || integralResult.metadata || {}
      });

      // Agregar al historial
      addToHistory(historyItem);

      console.log('📝 Integral agregada al historial:', integralId);

    } catch (error) {
      console.error('Error calculando integral:', error);
      setError('Error calculando la integral. Verifica la función y los límites.');
    } finally {
      setIsCalculating(false);
    }
  };

  const loadExample = (example: any) => {
    setFunctionInput(example.function);
    setXMin(example.limits.x[0].toString());
    setXMax(example.limits.x[1].toString());
    setYMin(example.limits.y[0].toString());
    setYMax(example.limits.y[1].toString());
    setZMin(example.limits.z[0].toString());
    setZMax(example.limits.z[1].toString());
    setCoordType(example.system);
    setShowExamples(false);
    setResult(null);
    setError('');
  };

  // Función para validar que todos los datos estén sincronizados
  const validateDataSynchronization = () => {
    const hasResult = result && result.decimal !== undefined;
    const hasIntegralId = currentIntegralId !== null;
    const hasValidFunction = functionInput.trim() !== '';
    const hasValidLimits = !isNaN(parseFloat(xMin)) && !isNaN(parseFloat(xMax)) && 
                          !isNaN(parseFloat(yMin)) && !isNaN(parseFloat(yMax)) && 
                          !isNaN(parseFloat(zMin)) && !isNaN(parseFloat(zMax));
    
    return hasResult && hasIntegralId && hasValidFunction && hasValidLimits;
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

          {/* Tipo de Integral */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px', color: colors.text }}>
              Tipo de Integral
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {(['simple', 'double', 'triple'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setIntegralType(type)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: '3px solid #000000',
                    borderRadius: '8px',
                    background: integralType === type ? colors.primary : (isDark ? colors.dark : '#FFFFFF'),
                    color: integralType === type ? '#000000' : colors.text,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {type === 'simple' ? '∫ Simple' : type === 'double' ? '∬ Doble' : '∭ Triple'}
                </button>
              ))}
            </div>
            
            {/* Tipo de Región */}
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: colors.text, fontSize: '0.9rem' }}>
              Tipo de Región
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['rectangular', 'general'] as const).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionType(region)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: '2px solid #000000',
                    borderRadius: '6px',
                    background: regionType === region ? colors.secondary : (isDark ? colors.dark : '#FFFFFF'),
                    color: regionType === region ? '#000000' : colors.text,
                    cursor: 'pointer'
                  }}
                >
                  {region === 'rectangular' ? '📐 Rectangular' : '🌊 General'}
                </button>
              ))}
            </div>
          </div>

          {/* Función */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px', color: colors.text }}>
              {integralType === 'simple' ? 'Función f(x)' : 
               integralType === 'double' ? 'Función f(x,y)' : 
               'Función f(x,y,z)'}
            </label>
            <input
              type="text"
              value={functionInput}
              onChange={(e) => {
                const newValue = e.target.value;
                
                // Intentar parsear si parece una integral completa
                if (newValue.includes('∫') && newValue.includes('d') && !isUpdatingFromLimits) {
                  const parsed = parseIntegralWithLimits(newValue);
                  if (parsed) {
                    console.log('🎯 Auto-llenando límites desde input principal:', parsed);
                    setIsUpdatingFromParsing(true);
                    
                    // Actualizar función y límites
                    setFunctionInput(parsed.function);
                    setXMin(parsed.limits.x[0]);
                    setXMax(parsed.limits.x[1]);
                    setYMin(parsed.limits.y[0]);
                    setYMax(parsed.limits.y[1]);
                    setZMin(parsed.limits.z[0]);
                    setZMax(parsed.limits.z[1]);
                    
                    // Reset flag después de un delay
                    setTimeout(() => setIsUpdatingFromParsing(false), 100);
                    return;
                  }
                }
                
                // Actualización normal de la función
                if (!isUpdatingFromLimits) {
                  setFunctionInput(newValue);
                }
              }}
              placeholder="Ejemplo: √(x²+y²+z²) o ∫z=1z=0∫y=4y=2∫x=5x=–1(√(x+yz²))dxdydz"
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
            
            {/* Mensaje informativo sobre integrales completas */}
            <div style={{ 
              marginTop: '8px', 
              padding: '8px 12px', 
              background: isDark ? colors.dark : colors.secondary + '20',
              border: '2px solid ' + colors.secondary,
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: colors.text
            }}>
              💡 <strong>Auto-llenado de límites:</strong> Pega una integral completa y los límites se extraerán automáticamente
              <br />
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                ∫z=1z=0∫y=4y=2∫x=5x=–1(√(x²+yz²))dxdydz
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginTop: '2px' }}>
                → Función: √(x²+yz²) | x: [-1,5] | y: [2,4] | z: [0,1]
              </span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', marginTop: '2px' }}>
                ✨ Soporta: √, ², ³, π, sin, cos, exp, ln y más símbolos matemáticos
              </span>
              <button
                onClick={() => {
                  const exampleIntegral = "∫z=1z=0∫y=4y=2∫x=5x=–1(√(x²+yz²))dxdydz";
                  const parsed = parseIntegralWithLimits(exampleIntegral);
                  if (parsed) {
                    setFunctionInput(parsed.function);
                    setXMin(parsed.limits.x[0]);
                    setXMax(parsed.limits.x[1]);
                    setYMin(parsed.limits.y[0]);
                    setYMax(parsed.limits.y[1]);
                    setZMin(parsed.limits.z[0]);
                    setZMax(parsed.limits.z[1]);
                  }
                }}
                style={{
                  marginTop: '6px',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  background: colors.primary,
                  color: '#000000',
                  border: '2px solid #000000',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                📋 Probar Ejemplo
              </button>
            </div>
            
            {/* Display de integral completa construida automáticamente */}
            {completeIntegralDisplay && !isUpdatingFromParsing && (
              <div style={{ 
                marginTop: '12px', 
                padding: '8px 12px', 
                background: isDark ? colors.tertiary : colors.primary + '20',
                border: '2px solid ' + colors.primary,
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: colors.text
              }}>
                <strong>🔄 Integral Completa Construida:</strong>
                <br />
                <span style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem', 
                  display: 'block', 
                  marginTop: '4px',
                  wordBreak: 'break-all'
                }}>
                  {completeIntegralDisplay}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(completeIntegralDisplay);
                    console.log('📋 Integral copiada al portapapeles');
                  }}
                  style={{
                    marginTop: '6px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    background: colors.secondary,
                    color: '#000000',
                    border: '2px solid #000000',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  📋 Copiar
                </button>
              </div>
            )}
            
            {/* Teclado Matemático - Solo activo cuando no hay input de límites enfocado */}
            {!focusedInput && (
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
            )}
            
            {/* Mensaje cuando hay input de límites enfocado */}
            {focusedInput && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: isDark ? '#374151' : '#F3F4F6',
                borderRadius: '8px',
                border: '2px solid #10B981',
                textAlign: 'center',
                color: colors.text
              }}>
                📝 Editando {focusedInput}. Escribe directamente o haz click fuera para usar el teclado matemático.
              </div>
            )}
          </div>

          {/* Configuración del Solver */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '700', 
              marginBottom: '12px', 
              color: colors.text,
              textTransform: 'uppercase'
            }}>
              🐍 Solver de Integrales
            </label>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              padding: '16px',
              background: isDark ? '#374151' : '#F3F4F6',
              borderRadius: '12px',
              border: '2px solid #000000'
            }}>
              {/* Toggle Python Solver */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="pythonSolver"
                  checked={usePythonSolver}
                  onChange={(e) => setUsePythonSolver(e.target.checked)}
                  disabled={!pythonSolverAvailable}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: pythonSolverAvailable ? 'pointer' : 'not-allowed'
                  }}
                />
                <label 
                  htmlFor="pythonSolver" 
                  style={{ 
                    color: colors.text, 
                    fontWeight: '600',
                    cursor: pythonSolverAvailable ? 'pointer' : 'not-allowed',
                    opacity: pythonSolverAvailable ? 1 : 0.5
                  }}
                >
                  Python Solver (SymPy + SciPy)
                </label>
              </div>

              {/* Estado del servicio */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: pythonSolverAvailable ? '#10B981' : '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#FFFFFF'
                }}></div>
                {pythonSolverAvailable ? 'DISPONIBLE' : 'NO DISPONIBLE'}
              </div>

              {/* Botón de reconexión */}
              {!pythonSolverAvailable && (
                <button
                  onClick={async () => {
                    console.log('🔄 Intentando reconectar con Python Solver...');
                    const health = await pythonSolverService.checkHealth();
                    setPythonSolverAvailable(health.available);
                    
                    if (!health.available) {
                      alert(`❌ No se pudo conectar con Python Solver:\n\n${health.error}\n\n🔧 Soluciones:\n1. Ejecuta: start-python-solver.bat\n2. Verifica que el puerto 5001 esté libre\n3. Revisa la consola del navegador para más detalles`);
                    } else {
                      alert('✅ Python Solver conectado exitosamente!');
                    }
                  }}
                  style={{
                    background: '#3B82F6',
                    color: '#FFFFFF',
                    border: '2px solid #000000',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Reconectar
                </button>
              )}
            </div>

            {/* Información del solver */}
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: isDark ? '#1F2937' : '#F9FAFB',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: colors.text
            }}>
              {usePythonSolver && pythonSolverAvailable ? (
                <div>
                  <strong>🎯 Modo Activo:</strong> Resolución simbólica exacta con SymPy + cálculo numérico de alta precisión con SciPy
                  <br />
                  <strong>📊 Capacidades:</strong> Integrales exactas, transformaciones de coordenadas automáticas, pasos detallados
                  <br />
                  <strong>🎨 Visualización:</strong> Plotly Python con superficies 3D, gradientes y hasta 1000 puntos de muestra
                </div>
              ) : (
                <div>
                  <strong>⚡ Modo Fallback:</strong> Solvers JavaScript de alta precisión y robusto
                  <br />
                  <strong>📊 Capacidades:</strong> Integración numérica adaptativa, múltiples algoritmos
                  <br />
                  <strong>🎨 Visualización:</strong> JavaScript con Plotly.js básico
                </div>
              )}
              
              {result && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  background: isDark ? '#1F2937' : '#E5E7EB', 
                  borderRadius: '6px',
                  border: '2px solid #10B981'
                }}>
                  <strong>✅ Estado Actual:</strong> Resultado calculado y listo para visualización 3D y explicación IA
                  <br />
                  <strong>🔗 Sincronización:</strong> Todos los datos están enlazados correctamente
                </div>
              )}
            </div>
          </div>

          {/* Límites */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ 
                fontWeight: '700', 
                color: colors.text,
                textTransform: 'uppercase'
              }}>
                Límites de Integración
              </label>
              <button
                onClick={() => {
                  setXMin('0'); setXMax('1');
                  setYMin('0'); setYMax('1');
                  setZMin('0'); setZMax('1');
                }}
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: '2px solid #000000',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔄 Resetear
              </button>
            </div>
            
            {/* Mensaje informativo sobre sincronización bidireccional */}
            <div style={{ 
              marginBottom: '16px', 
              padding: '6px 10px', 
              background: isDark ? colors.dark : colors.tertiary + '20',
              border: '2px solid ' + colors.tertiary,
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: colors.text
            }}>
              <strong>🔄 Sincronización Bidireccional:</strong> Al modificar estos límites se construye automáticamente la integral completa arriba
              <button
                onClick={() => {
                  // Ejemplo dinámico según el tipo de integral
                  if (integralType === 'simple') {
                    setFunctionInput('x²+sin(x)');
                    setXMin('0');
                    setXMax('π');
                  } else if (integralType === 'double') {
                    setFunctionInput('x*y+cos(x*y)');
                    setXMin('0');
                    setXMax('2');
                    setYMin('0');
                    setYMax('1');
                  } else {
                    setFunctionInput('√(x²+y²+z²)');
                    setXMin('-2');
                    setXMax('2');
                    setYMin('0');
                    setYMax('3');
                    setZMin('-1');
                    setZMax('1');
                  }
                }}
                style={{
                  marginLeft: '8px',
                  padding: '3px 6px',
                  fontSize: '0.65rem',
                  background: colors.tertiary,
                  color: '#FFFFFF',
                  border: '1px solid #000000',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🧪 Probar
              </button>
            </div>
            
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
                  onChange={(e) => {
                    if (!isUpdatingFromParsing) {
                      setXMin(e.target.value);
                      console.log('📝 Límite X mínimo actualizado:', e.target.value);
                    }
                  }} 
                  onFocus={() => setFocusedInput('límite X mínimo')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="0"
                  tabIndex={1}
                  readOnly={false}
                  disabled={false} 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    cursor: 'text',
                    zIndex: 20
                  }} 
                />
                <span style={{ fontWeight: '700', color: colors.text }}>≤ x ≤</span>
                <input 
                  type="text" 
                  value={xMax} 
                  onChange={(e) => {
                    if (!isUpdatingFromParsing) {
                      setXMax(e.target.value);
                      console.log('📝 Límite X máximo actualizado:', e.target.value);
                    }
                  }} 
                  onFocus={() => setFocusedInput('límite X máximo')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="1"
                  tabIndex={2}
                  readOnly={false}
                  disabled={false} 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    cursor: 'text',
                    zIndex: 20
                  }} 
                />
              </div>
            </div>

            {/* Límites Y - Solo para integrales dobles y triples */}
            {(integralType === 'double' || integralType === 'triple') && (
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
                  onChange={(e) => {
                    if (!isUpdatingFromParsing) {
                      setYMin(e.target.value);
                      console.log('📝 Límite Y mínimo actualizado:', e.target.value);
                    }
                  }} 
                  onFocus={() => setFocusedInput('límite Y mínimo')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="0"
                  tabIndex={3}
                  readOnly={false}
                  disabled={false} 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    cursor: 'text',
                    zIndex: 20
                  }} 
                />
                <span style={{ fontWeight: '700', color: colors.text }}>≤ y ≤</span>
                <input 
                  type="text" 
                  value={yMax} 
                  onChange={(e) => {
                    if (!isUpdatingFromParsing) {
                      setYMax(e.target.value);
                      console.log('📝 Límite Y máximo actualizado:', e.target.value);
                    }
                  }} 
                  onFocus={() => setFocusedInput('límite Y máximo')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="1"
                  tabIndex={4}
                  readOnly={false}
                  disabled={false} 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    cursor: 'text',
                    zIndex: 20
                  }} 
                />
              </div>
            </div>
            )}

            {/* Límites Z - Solo para integrales triples */}
            {integralType === 'triple' && (
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
                  onChange={(e) => {
                    if (!isUpdatingFromParsing) {
                      setZMin(e.target.value);
                      console.log('📝 Límite Z mínimo actualizado:', e.target.value);
                    }
                  }} 
                  onFocus={() => setFocusedInput('límite Z mínimo')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="0"
                  tabIndex={5}
                  readOnly={false}
                  disabled={false} 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    cursor: 'text',
                    zIndex: 20
                  }} 
                />
                <span style={{ fontWeight: '700', color: colors.text }}>≤ z ≤</span>
                <input 
                  type="text" 
                  value={zMax} 
                  onChange={(e) => {
                    if (!isUpdatingFromParsing) {
                      setZMax(e.target.value);
                      console.log('📝 Límite Z máximo actualizado:', e.target.value);
                    }
                  }} 
                  onFocus={() => setFocusedInput('límite Z máximo')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="1"
                  tabIndex={6}
                  readOnly={false}
                  disabled={false} 
                  style={{ 
                    width: '100px',
                    padding: '10px', 
                    border: '3px solid #000000', 
                    borderRadius: '8px',
                    background: isDark ? colors.dark : '#FFFFFF',
                    color: colors.text,
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    textAlign: 'center',
                    pointerEvents: 'auto',
                    userSelect: 'text',
                    cursor: 'text',
                    zIndex: 20
                  }} 
                />
              </div>
            </div>
            )}

            {/* Límites Variables - Solo para regiones generales */}
            {regionType === 'general' && (
              <div style={{ marginTop: '20px', padding: '16px', background: isDark ? colors.dark : colors.secondary + '10', border: '2px solid ' + colors.secondary, borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: colors.text, fontSize: '1rem', fontWeight: '700' }}>
                  🌊 Límites Variables (Región General)
                </h4>
                
                {/* Límites X Variables */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: colors.text }}>
                    Límites de X: desde g₁(y{integralType === 'triple' ? ',z' : ''}) hasta g₂(y{integralType === 'triple' ? ',z' : ''})
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={xMinFunc}
                      onChange={(e) => setXMinFunc(e.target.value)}
                      placeholder="ej: y^2"
                      style={{
                        width: '120px',
                        padding: '8px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        background: isDark ? colors.dark : '#FFFFFF',
                        color: colors.text,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                      }}
                    />
                    <span style={{ fontWeight: '700', color: colors.text }}>≤ x ≤</span>
                    <input
                      type="text"
                      value={xMaxFunc}
                      onChange={(e) => setXMaxFunc(e.target.value)}
                      placeholder="ej: √y"
                      style={{
                        width: '120px',
                        padding: '8px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        background: isDark ? colors.dark : '#FFFFFF',
                        color: colors.text,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                {/* Límites Y Variables - Solo para dobles y triples */}
                {(integralType === 'double' || integralType === 'triple') && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: colors.text }}>
                      Límites de Y: desde h₁({integralType === 'triple' ? 'z' : 'constante'}) hasta h₂({integralType === 'triple' ? 'z' : 'constante'})
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={yMinFunc}
                        onChange={(e) => setYMinFunc(e.target.value)}
                        placeholder={integralType === 'triple' ? 'ej: z^2' : 'ej: 0'}
                        style={{
                          width: '120px',
                          padding: '8px',
                          border: '2px solid #000000',
                          borderRadius: '6px',
                          background: isDark ? colors.dark : '#FFFFFF',
                          color: colors.text,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }}
                      />
                      <span style={{ fontWeight: '700', color: colors.text }}>≤ y ≤</span>
                      <input
                        type="text"
                        value={yMaxFunc}
                        onChange={(e) => setYMaxFunc(e.target.value)}
                        placeholder={integralType === 'triple' ? 'ej: √z' : 'ej: 2'}
                        style={{
                          width: '120px',
                          padding: '8px',
                          border: '2px solid #000000',
                          borderRadius: '6px',
                          background: isDark ? colors.dark : '#FFFFFF',
                          color: colors.text,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Límites Z Variables - Solo para triples */}
                {integralType === 'triple' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: colors.text }}>
                      Límites de Z: desde k₁ hasta k₂ (constantes)
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={zMinFunc}
                        onChange={(e) => setZMinFunc(e.target.value)}
                        placeholder="ej: 0"
                        style={{
                          width: '120px',
                          padding: '8px',
                          border: '2px solid #000000',
                          borderRadius: '6px',
                          background: isDark ? colors.dark : '#FFFFFF',
                          color: colors.text,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }}
                      />
                      <span style={{ fontWeight: '700', color: colors.text }}>≤ z ≤</span>
                      <input
                        type="text"
                        value={zMaxFunc}
                        onChange={(e) => setZMaxFunc(e.target.value)}
                        placeholder="ej: 1"
                        style={{
                          width: '120px',
                          padding: '8px',
                          border: '2px solid #000000',
                          borderRadius: '6px',
                          background: isDark ? colors.dark : '#FFFFFF',
                          color: colors.text,
                          fontFamily: 'monospace',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
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
            disabled={isCalculating}
            style={{
              width: '100%',
              padding: '20px',
              background: isCalculating ? '#6B7280' : colors.primary,
              border: '4px solid #000000',
              borderRadius: '16px',
              fontSize: '1.3rem',
              fontWeight: '900',
              cursor: isCalculating ? 'not-allowed' : 'pointer',
              opacity: isCalculating ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {isCalculating && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid #000000',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
            {isCalculating ? 'CALCULANDO...' : 'CALCULAR'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  margin: 0,
                  color: colors.text,
                  textTransform: 'uppercase'
                }}>
                  Acciones Principales
                </h3>
                
                {/* Indicador de sincronización */}
                {validateDataSynchronization() && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    background: '#10B981',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#FFFFFF'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    SINCRONIZADO ✓
                  </div>
                )}
              </div>
              {/* Selector de Sistema de Coordenadas para Visualización */}
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                background: isDark ? '#374151' : '#F3F4F6',
                border: '3px solid #000000',
                borderRadius: '12px'
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: isDark ? '#FFFFFF' : '#000000',
                  textTransform: 'uppercase'
                }}>
                  Visualizar en Sistema de Coordenadas:
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'cartesian', label: 'CARTESIANAS', desc: '(x,y,z)' },
                    { key: 'cylindrical', label: 'CILÍNDRICAS', desc: '(r,θ,z)' },
                    { key: 'spherical', label: 'ESFÉRICAS', desc: '(ρ,θ,φ)' }
                  ].map((system) => (
                    <button
                      key={system.key}
                      onClick={() => onVisualize({ 
                        function: functionInput, 
                        limits: { 
                          x: [parseFloat(xMin), parseFloat(xMax)], 
                          y: [parseFloat(yMin), parseFloat(yMax)], 
                          z: [parseFloat(zMin), parseFloat(zMax)] 
                        }, 
                        coordinateSystem: system.key, 
                        result,
                        integralId: currentIntegralId,
                        solverInfo: {
                          usedPythonSolver: usePythonSolver && pythonSolverAvailable,
                          pythonAvailable: pythonSolverAvailable,
                          method: result?.analysis?.solver || 'JavaScript'
                        },
                        calculationData: {
                          executionTime: result?.analysis?.execution_time || 0,
                          confidence: result?.confidence || 0.85,
                          steps: result?.steps || []
                        }
                      })}
                      style={{
                        flex: '1',
                        minWidth: '120px',
                        padding: '12px 8px',
                        background: system.key === coordType ? '#FFFD8F' : (isDark ? '#4B5563' : '#FFFFFF'),
                        border: '3px solid #000000',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        color: '#000000',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: system.key === coordType ? '0 4px 0 rgba(0,0,0,0.25)' : '0 2px 0 rgba(0,0,0,0.25)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (system.key !== coordType) {
                          e.currentTarget.style.background = '#B0CE88';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (system.key !== coordType) {
                          e.currentTarget.style.background = isDark ? '#4B5563' : '#FFFFFF';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', marginBottom: '2px' }}>
                          <Eye size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          {system.label}
                        </div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          {system.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de Comparación de Sistemas */}
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                background: '#FFFD8F',
                border: '3px solid #000000',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => {
                    // Crear datos para comparación de los tres sistemas
                    const comparisonData = {
                      function: functionInput,
                      limits: { 
                        x: [parseFloat(xMin), parseFloat(xMax)], 
                        y: [parseFloat(yMin), parseFloat(yMax)], 
                        z: [parseFloat(zMin), parseFloat(zMax)] 
                      },
                      result,
                      integralId: currentIntegralId,
                      solverInfo: {
                        usedPythonSolver: usePythonSolver && pythonSolverAvailable,
                        pythonAvailable: pythonSolverAvailable,
                        method: result?.analysis?.solver || 'JavaScript'
                      },
                      calculationData: {
                        executionTime: result?.analysis?.execution_time || 0,
                        confidence: result?.confidence || 0.85,
                        steps: result?.steps || []
                      },
                      compareAllSystems: true // Flag para indicar comparación
                    };
                    
                    // Abrir visualización para cada sistema
                    ['cartesian', 'cylindrical', 'spherical'].forEach((system, index) => {
                      setTimeout(() => {
                        onVisualize({
                          ...comparisonData,
                          coordinateSystem: system,
                          windowTitle: `${system.toUpperCase()} - ${functionInput}`
                        });
                      }, index * 500); // Delay para abrir ventanas secuencialmente
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#B0CE88',
                    border: '3px solid #000000',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '1rem',
                    color: '#000000',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 0 rgba(0,0,0,0.25)';
                    e.currentTarget.style.background = '#9ACD32';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 0 rgba(0,0,0,0.25)';
                    e.currentTarget.style.background = '#B0CE88';
                  }}
                >
                  <Eye size={20} />
                  <BarChart3 size={20} />
                  <span>COMPARAR LOS 3 SISTEMAS</span>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '8px' }}>
                    (Cartesianas, Cilíndricas, Esféricas)
                  </div>
                </button>
              </div>

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
                    result,
                    integralId: currentIntegralId,
                    solverInfo: {
                      usedPythonSolver: usePythonSolver && pythonSolverAvailable,
                      pythonAvailable: pythonSolverAvailable,
                      method: result?.analysis?.solver || 'JavaScript'
                    },
                    calculationData: {
                      executionTime: result?.analysis?.execution_time || 0,
                      confidence: result?.confidence || 0.85,
                      steps: result?.steps || []
                    }
                  })}
                  style={{ 
                    padding: '20px', 
                    background: '#4C763B', 
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
                    transition: 'all 0.2s',
                    color: '#FFFFFF'
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
                  <BarChart3 size={24} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>GRÁFICA ACTUAL</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      {usePythonSolver && pythonSolverAvailable ? 'Plotly Python' : 'JavaScript'}
                    </span>
                  </div>
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span>EXPLICAR IA</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      Con contexto completo
                    </span>
                  </div>
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

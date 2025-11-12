import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Box, RotateCcw, Download, Play, Pause, Grid3X3, Layers } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import { pythonSolverService } from '../services/PythonSolverService';

interface VisualizationScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  integralData?: any;
}

const ImprovedVisualizationScreen: React.FC<VisualizationScreenProps> = ({ 
  colors, 
  onBack, 
  isDark, 
  toggleTheme, 
  integralData 
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [functionInput, setFunctionInput] = useState('');
  const [coordinateSystem, setCoordinateSystem] = useState('cartesian');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRegion, setShowRegion] = useState(true);
  const [showFunction, setShowFunction] = useState(true);
  const [resolution, setResolution] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const [usePythonVisualization, setUsePythonVisualization] = useState(true);
  const [pythonVisualizationAvailable, setPythonVisualizationAvailable] = useState(false);
  const [isGeneratingPlot, setIsGeneratingPlot] = useState(false);
  const [plotType, setPlotType] = useState<'surface' | 'scatter' | 'wireframe' | 'slices' | 'all'>('all');

  // Verificar disponibilidad del Python Solver para visualización
  useEffect(() => {
    const checkPythonVisualization = async () => {
      try {
        const health = await pythonSolverService.checkHealth();
        setPythonVisualizationAvailable(health.available);
        console.log('📊 Python Visualization disponible:', health.available);
      } catch (error) {
        setPythonVisualizationAvailable(false);
        console.log('❌ Python Visualization no disponible');
      }
    };
    
    checkPythonVisualization();
  }, []);

  useEffect(() => {
    console.log('🎨 ImprovedVisualizationScreen montado con datos:', integralData);
    
    // Verificar que Plotly esté disponible
    if (typeof Plotly === 'undefined' || !Plotly.newPlot) {
      console.error('❌ Plotly no está disponible');
      setError('Error: Plotly no se ha cargado correctamente');
      return;
    }
    
    try {
      if (integralData && typeof integralData === 'object') {
        console.log('📊 Datos de integral recibidos:', integralData);
        const func = integralData.function || 'x*y*z';
        setFunctionInput(func);
        setCoordinateSystem(integralData.coordinateSystem || 'cartesian');
        
        // Configurar el solver según lo que se usó en el cálculo
        if (integralData.solverInfo) {
          setUsePythonVisualization(integralData.solverInfo.usedPythonSolver);
          setPythonVisualizationAvailable(integralData.solverInfo.pythonAvailable);
          console.log('🔧 Configurando visualización según solver usado:', {
            usedPython: integralData.solverInfo.usedPythonSolver,
            pythonAvailable: integralData.solverInfo.pythonAvailable
          });
        }
        
        // Validar que los límites existan y tengan la estructura correcta
        const limits = integralData.limits || { x: [-1, 1], y: [-1, 1], z: [-1, 1] };
        const validLimits = {
          x: Array.isArray(limits.x) && limits.x.length >= 2 ? limits.x : [-1, 1],
          y: Array.isArray(limits.y) && limits.y.length >= 2 ? limits.y : [-1, 1],
          z: Array.isArray(limits.z) && limits.z.length >= 2 ? limits.z : [-1, 1]
        };
        
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(async () => {
          await plotTripleIntegralWithPlotly(func, validLimits, integralData.coordinateSystem || 'cartesian');
        }, 100);
      } else {
        console.log('📊 Sin datos de integral, usando valores por defecto');
        // Gráfica por defecto
        setTimeout(async () => {
          await plotTripleIntegralWithPlotly('x*y*z', { x: [-1, 1], y: [-1, 1], z: [-1, 1] }, 'cartesian');
        }, 100);
      }
    } catch (error) {
      console.error('❌ Error en useEffect de ImprovedVisualizationScreen:', error);
      setError(`Error inicializando visualización: ${error}`);
    }
  }, [integralData, isDark]);

  // Función para evaluar expresiones matemáticas
  const evaluateFunction = (func: string, x: number, y: number, z: number): number => {
    try {
      let expression = func
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/exp/g, 'Math.exp')
        .replace(/ln/g, 'Math.log')
        .replace(/log/g, 'Math.log10')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/pi/g, 'Math.PI')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Reemplazar variables
      expression = expression.replace(/\bx\b/g, x.toString());
      expression = expression.replace(/\by\b/g, y.toString());
      expression = expression.replace(/\bz\b/g, z.toString());

      // Para coordenadas cilíndricas y esféricas
      if (coordinateSystem === 'cylindrical') {
        const r = Math.sqrt(x*x + y*y);
        const theta = Math.atan2(y, x);
        expression = expression.replace(/\br\b/g, r.toString());
        expression = expression.replace(/\btheta\b/g, theta.toString());
      } else if (coordinateSystem === 'spherical') {
        const rho = Math.sqrt(x*x + y*y + z*z);
        const theta = Math.atan2(y, x);
        const phi = Math.acos(z / (rho || 1));
        expression = expression.replace(/\brho\b/g, rho.toString());
        expression = expression.replace(/\btheta\b/g, theta.toString());
        expression = expression.replace(/\bphi\b/g, phi.toString());
      }

      const result = Function('"use strict"; return (' + expression + ')')();
      return isFinite(result) ? result : 0;
    } catch (error) {
      return 0;
    }
  };

  // Función avanzada que usa Plotly Python para generar gráficas completas
  const plotTripleIntegralWithPlotly = async (func: string, limits: any, system: string) => {
    console.log('🎨 Iniciando plotTripleIntegralWithPlotly:', { func, limits, system });
    
    if (!plotRef.current) {
      console.error('❌ plotRef.current es null');
      return;
    }

    setIsGeneratingPlot(true);
    setError(null);

    try {
      // Intentar usar Plotly Python si está disponible
      if (usePythonVisualization && pythonVisualizationAvailable) {
        console.log('🐍 Usando Plotly Python para visualización avanzada...');
        
        try {
          const plotlyResult = await pythonSolverService.generatePlotly3D(
            func,
            limits,
            system as 'cartesian' | 'cylindrical' | 'spherical',
            resolution,
            plotType
          );

          if (plotlyResult.success) {
            console.log('✅ Datos Plotly Python recibidos:', plotlyResult.plotlyData.metadata);
            
            // Usar directamente los datos de Plotly Python
            const plotlyData = plotlyResult.plotlyData;
            
            console.log('🎯 Creando gráfica con datos Plotly Python...');
            await Plotly.newPlot(
              plotRef.current, 
              plotlyData.data, 
              plotlyData.layout, 
              plotlyData.config
            );
            
            console.log('✅ Gráfica Plotly Python creada exitosamente');
            setError(null);
            return;
          } else {
            console.log('❌ Plotly Python falló, usando fallback:', plotlyResult.error);
          }
        } catch (error) {
          console.error('❌ Error con Plotly Python:', error);
        }
      }

      // Fallback a la función mejorada anterior
      console.log('⚡ Usando visualización JavaScript mejorada...');
      await plotTripleIntegralEnhanced(func, limits, system);

    } catch (error) {
      console.error('❌ Error al graficar:', error);
      setError(`Error al crear la gráfica: ${error}`);
    } finally {
      setIsGeneratingPlot(false);
    }
  };

  // Función mejorada para graficar integrales triples con Python Solver
  const plotTripleIntegralEnhanced = async (func: string, limits: any, system: string) => {
    console.log('🎨 Iniciando plotTripleIntegralEnhanced:', { func, limits, system });
    
    if (!plotRef.current) {
      console.error('❌ plotRef.current es null');
      return;
    }

    setIsGeneratingPlot(true);
    setError(null);

    try {
      let traces: any[] = [];

      // Intentar usar Python Solver para generar datos si está disponible
      if (usePythonVisualization && pythonVisualizationAvailable) {
        console.log('🐍 Usando Python Solver para visualización...');
        
        try {
          const pythonPlotData = await pythonSolverService.generatePlotData(
            func,
            limits,
            system as 'cartesian' | 'cylindrical' | 'spherical',
            resolution
          );

          if (pythonPlotData.success) {
            console.log('✅ Datos de Python recibidos:', pythonPlotData.plotData.statistics);
            traces = await createTracesFromPythonData(pythonPlotData.plotData, system);
          } else {
            console.log('❌ Python visualization falló, usando fallback:', pythonPlotData.error);
            traces = await createTracesJavaScript(func, limits, system);
          }
        } catch (error) {
          console.error('❌ Error con Python visualization:', error);
          traces = await createTracesJavaScript(func, limits, system);
        }
      } else {
        console.log('⚡ Usando visualización JavaScript...');
        traces = await createTracesJavaScript(func, limits, system);
      }

      // Configurar layout
      const layout = {
        title: {
          text: `Integral Triple: ∫∫∫ ${func} dV (${system})`,
          font: { size: 16, color: colors.text }
        },
        scene: {
          xaxis: { 
            title: { text: system === 'spherical' ? 'X (ρsinφcosθ)' : system === 'cylindrical' ? 'X (rcosθ)' : 'X' },
            range: [limits.x[0] - 0.5, limits.x[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          yaxis: { 
            title: { text: system === 'spherical' ? 'Y (ρsinφsinθ)' : system === 'cylindrical' ? 'Y (rsinθ)' : 'Y' },
            range: [limits.y[0] - 0.5, limits.y[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          zaxis: { 
            title: { text: system === 'spherical' ? 'Z (ρcosφ)' : 'Z' },
            range: [limits.z[0] - 0.5, limits.z[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          bgcolor: isDark ? '#1F2937' : '#FFFFFF',
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1.5 }
          }
        },
        paper_bgcolor: isDark ? colors.dark : '#FFFFFF',
        plot_bgcolor: isDark ? colors.dark : '#FFFFFF',
        font: { color: colors.text },
        margin: { l: 0, r: 0, t: 50, b: 0 }
      };

      const config = {
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
        displaylogo: false,
        responsive: true
      } as any;

      console.log('🎯 Creando gráfica con Plotly.newPlot...');
      console.log('📊 Traces:', traces.length, 'elementos');
      
      await Plotly.newPlot(plotRef.current, traces, layout, config);
      console.log('✅ Gráfica creada exitosamente');
      setError(null);

    } catch (error) {
      console.error('❌ Error al graficar:', error);
      setError(`Error al crear la gráfica: ${error}`);
    } finally {
      setIsGeneratingPlot(false);
    }
  };

  // Crear trazos desde datos de Python
  const createTracesFromPythonData = async (plotData: any, system: string): Promise<any[]> => {
    const traces: any[] = [];

    // 1. Región de integración (wireframe)
    if (showRegion && plotData.region_wireframe) {
      const regionTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: [] as (number | null)[],
        y: [] as (number | null)[],
        z: [] as (number | null)[],
        line: {
          color: '#10B981',
          width: 4
        },
        name: 'Región de Integración',
        showlegend: true
      };

      // Agregar líneas del wireframe
      plotData.region_wireframe.lines.forEach((line: any) => {
        regionTrace.x.push(line.start[0], line.end[0], null);
        regionTrace.y.push(line.start[1], line.end[1], null);
        regionTrace.z.push(line.start[2], line.end[2], null);
      });

      traces.push(regionTrace);
    }

    // 2. Superficies de la función (planos de corte)
    if (showFunction && plotData.surface_data) {
      plotData.surface_data.forEach((slice: any, index: number) => {
        const surfaceTrace = {
          type: 'scatter3d',
          mode: 'markers',
          x: slice.x,
          y: slice.y,
          z: slice.z,
          marker: {
            size: 3,
            color: slice.values,
            colorscale: 'Viridis',
            opacity: 0.6,
            colorbar: index === 0 ? {
              title: 'f(x,y,z)',
              titleside: 'right'
            } : undefined
          },
          name: `Plano z=${slice.z_level.toFixed(2)}`,
          showlegend: false
        };
        traces.push(surfaceTrace);
      });
    }

    // 3. Puntos de muestra
    if (plotData.sample_points && plotData.sample_points.length > 0) {
      const sampleTrace = {
        type: 'scatter3d',
        mode: 'markers',
        x: plotData.sample_points.map((p: any) => p.x),
        y: plotData.sample_points.map((p: any) => p.y),
        z: plotData.sample_points.map((p: any) => p.z),
        marker: {
          size: 4,
          color: plotData.sample_points.map((p: any) => p.value),
          colorscale: 'RdYlBu',
          opacity: 0.8,
          line: {
            color: '#000000',
            width: 1
          }
        },
        name: 'Puntos de Muestra (Python)',
        showlegend: true
      };
      traces.push(sampleTrace);
    }

    return traces;
  };

  // Crear trazos usando JavaScript (fallback)
  const createTracesJavaScript = async (func: string, limits: any, system: string): Promise<any[]> => {
    const traces: any[] = [];

    // 1. Crear región de integración (wireframe)
    if (showRegion) {
      const regionTrace = createIntegrationRegion(limits, system);
      traces.push(regionTrace);
    }

    // 2. Crear superficie de la función (si es visualizable)
    if (showFunction) {
      const functionTraces = createFunctionVisualization(func, limits, system);
      traces.push(...functionTraces);
    }

    // 3. Crear puntos de muestra para mostrar el comportamiento de la función
    const samplePoints = createSamplePoints(func, limits, system);
    traces.push(samplePoints);

    return traces;
  };

  // Función principal para graficar integrales triples (original como fallback)
  const plotTripleIntegral = async (func: string, limits: any, system: string) => {
    console.log('🎨 Iniciando plotTripleIntegral:', { func, limits, system });
    
    if (!plotRef.current) {
      console.error('❌ plotRef.current es null');
      return;
    }

    console.log('✅ plotRef.current existe, procediendo...');

    try {
      const traces: any[] = [];

      // 1. Crear región de integración (wireframe)
      if (showRegion) {
        const regionTrace = createIntegrationRegion(limits, system);
        traces.push(regionTrace);
      }

      // 2. Crear superficie de la función (si es visualizable)
      if (showFunction) {
        const functionTraces = createFunctionVisualization(func, limits, system);
        traces.push(...functionTraces);
      }

      // 3. Crear puntos de muestra para mostrar el comportamiento de la función
      const samplePoints = createSamplePoints(func, limits, system);
      traces.push(samplePoints);

      // Configurar layout
      const layout = {
        title: {
          text: `Integral Triple: ∫∫∫ ${func} dV (${system})`,
          font: { size: 16, color: colors.text }
        },
        scene: {
          xaxis: { 
            title: { text: system === 'spherical' ? 'X (ρsinφcosθ)' : system === 'cylindrical' ? 'X (rcosθ)' : 'X' },
            range: [limits.x[0] - 0.5, limits.x[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          yaxis: { 
            title: { text: system === 'spherical' ? 'Y (ρsinφsinθ)' : system === 'cylindrical' ? 'Y (rsinθ)' : 'Y' },
            range: [limits.y[0] - 0.5, limits.y[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          zaxis: { 
            title: { text: system === 'spherical' ? 'Z (ρcosφ)' : 'Z' },
            range: [limits.z[0] - 0.5, limits.z[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          bgcolor: isDark ? '#1F2937' : '#FFFFFF',
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1.5 }
          }
        },
        paper_bgcolor: isDark ? colors.dark : '#FFFFFF',
        plot_bgcolor: isDark ? colors.dark : '#FFFFFF',
        font: { color: colors.text },
        margin: { l: 0, r: 0, t: 50, b: 0 }
      };

      const config = {
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
        displaylogo: false,
        responsive: true
      } as any;

      console.log('🎯 Creando gráfica con Plotly.newPlot...');
      console.log('📊 Traces:', traces.length, 'elementos');
      console.log('🎨 Layout configurado');
      
      await Plotly.newPlot(plotRef.current, traces, layout, config);
      console.log('✅ Gráfica creada exitosamente');
      setError(null);

    } catch (error) {
      console.error('❌ Error al graficar:', error);
      setError(`Error al crear la gráfica: ${error}`);
    }
  };

  // Crear región de integración como wireframe
  const createIntegrationRegion = (limits: any, system: string) => {
    const { x: [xMin, xMax], y: [yMin, yMax], z: [zMin, zMax] } = limits;
    
    // Crear los 8 vértices del paralelepípedo
    const vertices = [
      [xMin, yMin, zMin], [xMax, yMin, zMin],
      [xMax, yMax, zMin], [xMin, yMax, zMin],
      [xMin, yMin, zMax], [xMax, yMin, zMax],
      [xMax, yMax, zMax], [xMin, yMax, zMax]
    ];

    // Crear las 12 aristas
    const edges = [
      [0,1], [1,2], [2,3], [3,0], // Base inferior
      [4,5], [5,6], [6,7], [7,4], // Base superior
      [0,4], [1,5], [2,6], [3,7]  // Aristas verticales
    ];

    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];

    edges.forEach(([i, j]) => {
      x.push(vertices[i][0], vertices[j][0], null as any);
      y.push(vertices[i][1], vertices[j][1], null as any);
      z.push(vertices[i][2], vertices[j][2], null as any);
    });

    return {
      type: 'scatter3d',
      mode: 'lines',
      x: x,
      y: y,
      z: z,
      line: {
        color: '#10B981',
        width: 4
      },
      name: 'Región de Integración',
      showlegend: true
    };
  };

  // Crear visualización de la función
  const createFunctionVisualization = (func: string, limits: any, system: string) => {
    const traces: any[] = [];
    const { x: [xMin, xMax], y: [yMin, yMax], z: [zMin, zMax] } = limits;

    // Crear planos de corte para mostrar el comportamiento de la función
    const nPlanes = 5;
    
    // Planos en Z constante
    for (let i = 0; i < nPlanes; i++) {
      const zVal = zMin + (i / (nPlanes - 1)) * (zMax - zMin);
      const planeTrace = createFunctionPlane(func, limits, 'z', zVal, system);
      if (planeTrace) traces.push(planeTrace);
    }

    return traces;
  };

  // Crear un plano de corte de la función
  const createFunctionPlane = (func: string, limits: any, axis: string, value: number, system: string) => {
    const { x: [xMin, xMax], y: [yMin, yMax] } = limits;
    const n = 20;
    
    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const xVal = xMin + (i / (n - 1)) * (xMax - xMin);
        const yVal = yMin + (j / (n - 1)) * (yMax - yMin);
        const zVal = value;

        const funcValue = evaluateFunction(func, xVal, yVal, zVal);
        
        x.push(xVal);
        y.push(yVal);
        z.push(zVal);
        colors.push(funcValue);
      }
    }

    return {
      type: 'scatter3d',
      mode: 'markers',
      x: x,
      y: y,
      z: z,
      marker: {
        size: 3,
        color: colors,
        colorscale: 'Viridis',
        opacity: 0.6,
        colorbar: {
          title: 'f(x,y,z)',
          titleside: 'right'
        }
      },
      name: `f(x,y,${value.toFixed(2)})`,
      showlegend: false
    };
  };

  // Crear puntos de muestra
  const createSamplePoints = (func: string, limits: any, system: string) => {
    const { x: [xMin, xMax], y: [yMin, yMax], z: [zMin, zMax] } = limits;
    const nSamples = 100;
    
    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < nSamples; i++) {
      const xVal = xMin + Math.random() * (xMax - xMin);
      const yVal = yMin + Math.random() * (yMax - yMin);
      const zVal = zMin + Math.random() * (zMax - zMin);

      const funcValue = evaluateFunction(func, xVal, yVal, zVal);
      
      x.push(xVal);
      y.push(yVal);
      z.push(zVal);
      colors.push(funcValue);
    }

    return {
      type: 'scatter3d',
      mode: 'markers',
      x: x,
      y: y,
      z: z,
      marker: {
        size: 4,
        color: colors,
        colorscale: 'RdYlBu',
        opacity: 0.8,
        line: {
          color: '#000000',
          width: 1
        }
      },
      name: 'Puntos de Muestra',
      showlegend: true
    };
  };

  // Función para animar la gráfica
  const toggleAnimation = () => {
    if (isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      animateRotation();
    }
  };

  const animateRotation = () => {
    if (!plotRef.current || !isAnimating) return;

    try {
      const update = {
        scene: {
          camera: {
            eye: {
              x: 2 * Math.cos(Date.now() * 0.001),
              y: 2 * Math.sin(Date.now() * 0.001),
              z: 1.5
            }
          }
        }
      };

      Plotly.relayout(plotRef.current, update);
      animationRef.current = requestAnimationFrame(animateRotation);
    } catch (error) {
      console.error('❌ Error en animación:', error);
      setIsAnimating(false);
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
        justifyContent: 'space-between'
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
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <Box size={32} color="#FFFFFF" />
          <h1 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
            VISUALIZACIÓN 3D
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Controles */}
          <button
            onClick={() => setShowRegion(!showRegion)}
            style={{
              background: showRegion ? '#10B981' : '#6B7280',
              color: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <Grid3X3 size={20} />
          </button>
          
          <button
            onClick={() => setShowFunction(!showFunction)}
            style={{
              background: showFunction ? '#8B5CF6' : '#6B7280',
              color: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            <Layers size={20} />
          </button>

          <button
            onClick={toggleAnimation}
            style={{
              background: isAnimating ? '#EF4444' : '#3B82F6',
              color: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {isAnimating ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Toggle Python Visualization */}
          <button
            onClick={() => setUsePythonVisualization(!usePythonVisualization)}
            disabled={!pythonVisualizationAvailable}
            style={{
              background: usePythonVisualization && pythonVisualizationAvailable ? '#10B981' : '#6B7280',
              color: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: pythonVisualizationAvailable ? 'pointer' : 'not-allowed',
              opacity: pythonVisualizationAvailable ? 1 : 0.5,
              fontSize: '0.75rem',
              fontWeight: '600'
            }}
            title={pythonVisualizationAvailable ? 'Python Visualization' : 'Python no disponible'}
          >
            🐍
          </button>

          <button
            onClick={toggleTheme}
            style={{
              background: '#F59E0B',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {isDark ? <Sun size={20} color="#FFFFFF" /> : <Moon size={20} color="#000000" />}
          </button>
        </div>
      </div>

      {/* Información de la Integral */}
      {integralData && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          background: isDark ? '#374151' : '#F3F4F6',
          border: '3px solid #000000',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: colors.text, margin: '0 0 0.5rem 0' }}>
            📊 Información de la Integral
          </h3>
          <div style={{ color: colors.text, fontSize: '0.9rem' }}>
            <p><strong>Función:</strong> f(x,y,z) = {integralData.function}</p>
            <p><strong>Sistema:</strong> {integralData.coordinateSystem}</p>
            <p><strong>Límites:</strong> 
              x ∈ [{integralData.limits?.x?.[0]}, {integralData.limits?.x?.[1]}], 
              y ∈ [{integralData.limits?.y?.[0]}, {integralData.limits?.y?.[1]}], 
              z ∈ [{integralData.limits?.z?.[0]}, {integralData.limits?.z?.[1]}]
            </p>
            {integralData.result !== undefined && integralData.result !== null && (
              <p><strong>Resultado:</strong> {
                typeof integralData.result === 'number' && !isNaN(integralData.result)
                  ? integralData.result.toFixed(6)
                  : String(integralData.result)
              }</p>
            )}
            
            {/* Información del Solver */}
            {integralData.solverInfo && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: isDark ? '#1F2937' : '#E5E7EB', borderRadius: '6px' }}>
                <p><strong>🔧 Solver Usado:</strong> {integralData.solverInfo.usedPythonSolver ? '🐍 Python (SymPy/SciPy)' : '⚡ JavaScript'}</p>
                {integralData.calculationData && (
                  <>
                    <p><strong>⏱️ Tiempo:</strong> {integralData.calculationData.executionTime.toFixed(3)}s</p>
                    <p><strong>🎯 Confianza:</strong> {(integralData.calculationData.confidence * 100).toFixed(1)}%</p>
                    <p><strong>📝 Pasos:</strong> {integralData.calculationData.steps.length} pasos de resolución</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado de Visualización */}
      <div style={{
        margin: '1rem',
        padding: '1rem',
        background: isDark ? '#374151' : '#F3F4F6',
        border: '3px solid #000000',
        borderRadius: '12px'
      }}>
        <h3 style={{ color: colors.text, margin: '0 0 0.5rem 0' }}>
          🎨 Estado de Visualización
        </h3>
        <div style={{ color: colors.text, fontSize: '0.9rem' }}>
          <p><strong>Método:</strong> {usePythonVisualization && pythonVisualizationAvailable ? '🐍 Plotly Python (Avanzado)' : '⚡ JavaScript (Fallback)'}</p>
          <p><strong>Resolución:</strong> {resolution} puntos por eje</p>
          <p><strong>Tipo de Gráfica:</strong> {plotType === 'all' ? 'Completa' : plotType}</p>
          <p><strong>Python Disponible:</strong> {pythonVisualizationAvailable ? '✅ Sí' : '❌ No'}</p>
          {isGeneratingPlot && (
            <p style={{ color: '#3B82F6', fontWeight: '600' }}>
              🔄 Generando visualización...
            </p>
          )}
        </div>
        
        {/* Controles de tipo de gráfica */}
        {usePythonVisualization && pythonVisualizationAvailable && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ color: colors.text, fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
              Tipo de Visualización:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['all', 'surface', 'scatter', 'wireframe', 'slices'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPlotType(type)}
                  style={{
                    background: plotType === type ? '#10B981' : '#6B7280',
                    color: '#FFFFFF',
                    border: '2px solid #000000',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {type === 'all' ? 'Completa' : type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          background: '#FEE2E2',
          border: '3px solid #EF4444',
          borderRadius: '12px',
          color: '#DC2626'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>❌ Error de Visualización</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Gráfica */}
      <div style={{
        margin: '1rem',
        background: isDark ? colors.dark : '#FFFFFF',
        border: '4px solid #000000',
        borderRadius: '20px',
        padding: '1rem',
        boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
      }}>
        <div 
          ref={plotRef} 
          style={{ 
            width: '100%', 
            height: '600px',
            borderRadius: '12px',
            overflow: 'hidden'
          }} 
        />
      </div>

      {/* Controles adicionales */}
      <div style={{
        margin: '1rem',
        padding: '1rem',
        background: isDark ? '#374151' : '#F3F4F6',
        border: '3px solid #000000',
        borderRadius: '12px',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <label style={{ color: colors.text, fontWeight: '600' }}>
          Resolución:
        </label>
        <input
          type="range"
          min="10"
          max="50"
          value={resolution}
          onChange={(e) => setResolution(parseInt(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ color: colors.text }}>{resolution}</span>
        
        <button
          onClick={async () => {
            if (integralData) {
              await plotTripleIntegralWithPlotly(integralData.function, integralData.limits, integralData.coordinateSystem);
            }
          }}
          disabled={isGeneratingPlot}
          style={{
            background: isGeneratingPlot ? '#6B7280' : '#10B981',
            color: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: isGeneratingPlot ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: isGeneratingPlot ? 0.7 : 1
          }}
        >
          {isGeneratingPlot ? '🔄 Generando...' : '🔄 Actualizar'}
        </button>
      </div>
    </div>
  );
};

export default ImprovedVisualizationScreen;

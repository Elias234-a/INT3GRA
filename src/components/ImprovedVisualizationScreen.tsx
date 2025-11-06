import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Box, RotateCcw, Download, Play, Pause, Grid3X3, Layers } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';

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
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (integralData) {
      console.log('📊 Datos de integral recibidos:', integralData);
      const func = integralData.function || 'x*y*z';
      setFunctionInput(func);
      setCoordinateSystem(integralData.coordinateSystem || 'cartesian');
      
      plotTripleIntegral(func, integralData.limits, integralData.coordinateSystem || 'cartesian');
    } else {
      // Gráfica por defecto
      plotTripleIntegral('x*y*z', { x: [-1, 1], y: [-1, 1], z: [-1, 1] }, 'cartesian');
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

  // Función principal para graficar integrales triples
  const plotTripleIntegral = (func: string, limits: any, system: string) => {
    if (!plotRef.current) return;

    console.log('🎨 Graficando integral triple:', { func, limits, system });

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
            title: system === 'spherical' ? 'X (ρsinφcosθ)' : system === 'cylindrical' ? 'X (rcosθ)' : 'X',
            range: [limits.x[0] - 0.5, limits.x[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          yaxis: { 
            title: system === 'spherical' ? 'Y (ρsinφsinθ)' : system === 'cylindrical' ? 'Y (rsinθ)' : 'Y',
            range: [limits.y[0] - 0.5, limits.y[1] + 0.5],
            color: colors.text,
            gridcolor: isDark ? '#374151' : '#E5E7EB'
          },
          zaxis: { 
            title: system === 'spherical' ? 'Z (ρcosφ)' : 'Z',
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
        modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
        displaylogo: false,
        responsive: true
      };

      Plotly.newPlot(plotRef.current, traces, layout, config);

    } catch (error) {
      console.error('Error al graficar:', error);
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

    const update = {
      'scene.camera.eye': {
        x: 2 * Math.cos(Date.now() * 0.001),
        y: 2 * Math.sin(Date.now() * 0.001),
        z: 1.5
      }
    };

    Plotly.relayout(plotRef.current, update);
    animationRef.current = requestAnimationFrame(animateRotation);
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

      {/* Información de la integral */}
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
            {integralData.result && (
              <p><strong>Resultado:</strong> {integralData.result.toFixed(6)}</p>
            )}
          </div>
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
          onClick={() => {
            if (integralData) {
              plotTripleIntegral(integralData.function, integralData.limits, integralData.coordinateSystem);
            }
          }}
          style={{
            background: '#10B981',
            color: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
};

export default ImprovedVisualizationScreen;

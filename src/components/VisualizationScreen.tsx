import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Box, RotateCcw, Download, Play, Pause } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import {
  CoordinateSystemType,
  coordinateSystems,
  detectCoordinateSystem,
  getDefaultLimits,
  createParametricSurface
} from '../utils/coordinateTransforms';

interface VisualizationScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  integralData?: any;
}

const VisualizationScreen: React.FC<VisualizationScreenProps> = ({ 
  colors, 
  onBack, 
  isDark, 
  toggleTheme, 
  integralData 
}) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const [functionInput, setFunctionInput] = useState('');
  const [coordinateSystem, setCoordinateSystem] = useState<CoordinateSystemType>('cartesian');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Cargar integral desde datos
  useEffect(() => {
    if (integralData) {
      const func = integralData.function || 'x*y';
      setFunctionInput(func);
      
      // Detectar sistema de coordenadas
      const system = detectCoordinateSystem(integralData.coordinateSystem || 'cartesian');
      setCoordinateSystem(system);
      
      plotFunctionInSystem(func, system, integralData.limits);
    } else {
      // Gráfica por defecto
      plotFunctionInSystem('x*y*z', 'cartesian');
    }
  }, [integralData, isDark]);

  // Regraficar cuando cambia el sistema
  useEffect(() => {
    if (functionInput) {
      plotFunctionInSystem(functionInput, coordinateSystem);
    }
  }, [coordinateSystem]);

  // Graficar función en el sistema especificado
  const plotFunctionInSystem = (func: string, system: CoordinateSystemType, customLimits?: any) => {
    if (!plotRef.current) return;

    try {
      const coordSystem = coordinateSystems[system];
      const limits = customLimits || getDefaultLimits(system);

      // Convertir límites al formato esperado
      const uLimits: [number, number] = Array.isArray(limits.u) ? limits.u : 
                                         Array.isArray(limits.x) ? limits.x : [-2, 2];
      const vLimits: [number, number] = Array.isArray(limits.v) ? limits.v : 
                                         Array.isArray(limits.y) ? limits.y : [-2, 2];

      // Crear función evaluadora
      const evalFunc = (u: number, v: number): number => {
        try {
          return evaluateFunction(func, u, v, 0);
        } catch {
          return 0;
        }
      };

      // Generar superficie paramétrica
      const surface = createParametricSurface(
        system,
        evalFunc,
        { u: uLimits, v: vLimits },
        50
      );

      // Configurar superficie 3D
      const surfaceData: any = {
        type: 'surface',
        x: surface.x,
        y: surface.y,
        z: surface.z,
        colorscale: [
          [0, '#2D70B3'],
          [0.5, '#FFFD8F'],
          [1, '#C74440']
        ],
        opacity: 0.9,
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: '#000000',
            project: { z: true }
          }
        }
      };

      const data: any[] = [surfaceData];

      // Layout 3D
      const layout: any = {
        title: {
          text: `${coordSystem.displayName}: ${func}`,
          font: {
            size: 18,
            family: 'monospace',
            color: isDark ? '#FFFFFF' : '#000000'
          }
        },
        scene: {
          xaxis: {
            title: 'X',
            gridcolor: isDark ? '#444444' : '#CCCCCC',
            showbackground: true,
            backgroundcolor: isDark ? '#1a1a1a' : '#f5f5f5'
          },
          yaxis: {
            title: 'Y',
            gridcolor: isDark ? '#444444' : '#CCCCCC',
            showbackground: true,
            backgroundcolor: isDark ? '#1a1a1a' : '#f5f5f5'
          },
          zaxis: {
            title: 'Z',
            gridcolor: isDark ? '#444444' : '#CCCCCC',
            showbackground: true,
            backgroundcolor: isDark ? '#1a1a1a' : '#f5f5f5'
          },
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1.3 }
          }
        },
        paper_bgcolor: isDark ? '#1a1a1a' : '#FFFFFF',
        plot_bgcolor: isDark ? '#1a1a1a' : '#FFFFFF',
        margin: { l: 0, r: 0, t: 40, b: 0 },
        autosize: true
      };

      const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'],
        toImageButtonOptions: {
          format: 'png',
          filename: `integral-3d-${system}-${Date.now()}`,
          height: 1080,
          width: 1920,
          scale: 2
        }
      };

      Plotly.newPlot(plotRef.current, data, layout, config);
      
      console.log(`✅ Gráfica 3D creada en ${coordSystem.displayName}`);

    } catch (error) {
      console.error('Error graficando función:', error);
    }
  };

  // Evaluar función matemática
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
        .replace(/log/g, 'Math.log10')
        .replace(/π/g, 'Math.PI')
        .replace(/pi/g, 'Math.PI')
        .replace(/e(?![a-z])/g, 'Math.E');
      
      // Reemplazar variables según el sistema
      const coordSystem = coordinateSystems[coordinateSystem];
      const varReplacements: any = {
        cartesian: { x, y, z },
        cylindrical: { r: x, theta: y, z },
        spherical: { rho: x, theta: y, phi: z }
      };
      
      const vars = varReplacements[coordinateSystem];
      const evalFunc = new Function(...Object.keys(vars), 'Math', `return ${sanitized}`);
      return evalFunc(...Object.values(vars), Math);
    } catch (error) {
      throw new Error('Error evaluando función');
    }
  };

  // Graficar desde input
  const handlePlotFunction = () => {
    if (functionInput.trim()) {
      plotFunctionInSystem(functionInput, coordinateSystem);
    }
  };

  // Animación de rotación
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
    if (!plotRef.current) return;

    const update = {
      scene: {
        camera: {
          eye: {
            x: 1.5 * Math.cos(Date.now() * 0.001),
            y: 1.5 * Math.sin(Date.now() * 0.001),
            z: 1.3
          }
        }
      }
    };

    Plotly.relayout(plotRef.current, update);
    animationRef.current = requestAnimationFrame(animateRotation);
  };

  // Reset vista
  const resetView = () => {
    if (!plotRef.current) return;
    Plotly.relayout(plotRef.current, {
      'scene.camera.eye': { x: 1.5, y: 1.5, z: 1.3 }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? 
        'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 
        'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      padding: '0',
      overflow: 'auto'
    }}>
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
            whileHover={{ scale: 1.05 }}
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
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
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
              <Box size={24} color="#000000" />
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
              VISUALIZACIÓN 3D
            </h1>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
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
            boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>

      {/* Selector de Sistema de Coordenadas */}
      <div style={{
        margin: '1rem',
        padding: '1.5rem',
        background: isDark ? '#2d2d2d' : '#FFFFFF',
        border: '4px solid #000000',
        borderRadius: '20px',
        boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
      }}>
        <h2 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.25rem',
          fontWeight: '900',
          color: isDark ? '#FFFFFF' : '#000000',
          textTransform: 'uppercase'
        }}>
          SISTEMA DE COORDENADAS
        </h2>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(['cartesian', 'cylindrical', 'spherical'] as CoordinateSystemType[]).map((system) => {
            const coordSys = coordinateSystems[system];
            const isActive = coordinateSystem === system;
            
            return (
              <motion.button
                key={system}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCoordinateSystem(system)}
                style={{
                  background: isActive ? '#FFFD8F' : (isDark ? '#3d3d3d' : '#FFFFFF'),
                  border: '4px solid #000000',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  color: '#000000',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 6px 0 rgba(0,0,0,0.25)' : '0 4px 0 rgba(0,0,0,0.25)',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                    {coordSys.displayName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', opacity: 0.7 }}>
                    {coordSys.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Información de la Integral (si existe) */}
      {integralData && (
        <div style={{
          margin: '1rem',
          padding: '1.5rem',
          background: '#FFFD8F',
          border: '4px solid #000000',
          borderRadius: '20px',
          boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            fontWeight: '900',
            color: '#000000',
            textTransform: 'uppercase'
          }}>
            INFORMACIÓN DE LA INTEGRAL
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Función:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{integralData.function}</div>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Sistema:</div>
              <div style={{ textTransform: 'capitalize' }}>{integralData.coordinateSystem}</div>
            </div>
            {integralData.result && (
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Resultado:</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700' }}>
                  {integralData.result.decimal?.toFixed(4) || integralData.result}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controles */}
      <div style={{
        margin: '1rem',
        padding: '1.5rem',
        background: isDark ? '#2d2d2d' : '#FFFFFF',
        border: '4px solid #000000',
        borderRadius: '20px',
        boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={functionInput}
            onChange={(e) => setFunctionInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePlotFunction()}
            placeholder={`Función en ${coordinateSystems[coordinateSystem].description}`}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '12px 16px',
              border: '4px solid #000000',
              borderRadius: '12px',
              fontSize: '1rem',
              fontFamily: 'monospace',
              background: isDark ? '#3d3d3d' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#000000'
            }}
          />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlotFunction}
            style={{
              background: '#4C763B',
              border: '4px solid #000000',
              borderRadius: '12px',
              color: '#FFFFFF',
              padding: '12px 24px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
            }}
          >
            GRAFICAR
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAnimation}
            style={{
              background: isAnimating ? '#C74440' : '#B0CE88',
              border: '4px solid #000000',
              borderRadius: '12px',
              color: '#000000',
              padding: '12px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isAnimating ? <Pause size={20} /> : <Play size={20} />}
            {isAnimating ? 'PAUSAR' : 'ANIMAR'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetView}
            style={{
              background: '#FFFD8F',
              border: '4px solid #000000',
              borderRadius: '12px',
              color: '#000000',
              padding: '12px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RotateCcw size={20} />
            RESET
          </motion.button>
        </div>
      </div>

      {/* Gráfica 3D */}
      <div style={{
        margin: '1rem',
        padding: '1rem',
        background: isDark ? '#2d2d2d' : '#FFFFFF',
        border: '4px solid #000000',
        borderRadius: '20px',
        boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
        minHeight: '600px'
      }}>
        <div ref={plotRef} style={{ width: '100%', height: '600px' }} />
      </div>

      {/* Instrucciones */}
      <div style={{
        margin: '1rem',
        padding: '1.5rem',
        background: isDark ? '#2d2d2d' : '#FFFFFF',
        border: '4px solid #000000',
        borderRadius: '20px',
        boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.1rem',
          fontWeight: '900',
          color: isDark ? '#FFFFFF' : '#000000',
          textTransform: 'uppercase'
        }}>
          INSTRUCCIONES
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: '700', marginBottom: '8px', color: isDark ? '#FFFD8F' : '#4C763B' }}>
              Controles del Mouse:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: isDark ? '#CCCCCC' : '#333333' }}>
              <li>Arrastrar: Rotar vista</li>
              <li>Rueda: Zoom in/out</li>
              <li>Shift + Arrastrar: Mover</li>
            </ul>
          </div>
          
          <div>
            <div style={{ fontWeight: '700', marginBottom: '8px', color: isDark ? '#FFFD8F' : '#4C763B' }}>
              Sistemas de Coordenadas:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: isDark ? '#CCCCCC' : '#333333' }}>
              <li>Cartesianas: (x, y, z)</li>
              <li>Cilíndricas: (r, θ, z)</li>
              <li>Esféricas: (ρ, θ, φ)</li>
            </ul>
          </div>
          
          <div>
            <div style={{ fontWeight: '700', marginBottom: '8px', color: isDark ? '#FFFD8F' : '#4C763B' }}>
              Funciones Disponibles:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: isDark ? '#CCCCCC' : '#333333' }}>
              <li>sin, cos, tan</li>
              <li>sqrt, exp, ln, log</li>
              <li>Operadores: +, -, *, /, ^</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationScreen;

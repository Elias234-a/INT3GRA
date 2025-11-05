import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Box, RotateCcw, Download, Play, Pause } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Cargar integral desde datos
  useEffect(() => {
    if (integralData) {
      const func = integralData.function || 'x*y';
      setFunctionInput(func);
      plotFunction(func, integralData.limits);
    } else {
      // Gráfica por defecto
      plotFunction('x*y*z', { x: [-2, 2], y: [-2, 2], z: [-2, 2] });
    }
  }, [integralData, isDark]);

  // Graficar función 3D
  const plotFunction = (func: string, limits?: any) => {
    if (!plotRef.current) return;

    try {
      // Límites por defecto
      const xRange = limits?.x || [-2, 2];
      const yRange = limits?.y || [-2, 2];
      const zRange = limits?.z || [-2, 2];

      // Generar malla de puntos
      const size = 50;
      const xValues: number[] = [];
      const yValues: number[] = [];
      const zValues: number[][] = [];

      for (let i = 0; i < size; i++) {
        const x = xRange[0] + (i / (size - 1)) * (xRange[1] - xRange[0]);
        xValues.push(x);
      }

      for (let j = 0; j < size; j++) {
        const y = yRange[0] + (j / (size - 1)) * (yRange[1] - yRange[0]);
        yValues.push(y);
      }

      // Calcular z = f(x, y)
      for (let i = 0; i < size; i++) {
        const row: number[] = [];
        for (let j = 0; j < size; j++) {
          const x = xValues[i];
          const y = yValues[j];
          try {
            const z = evaluateFunction(func, x, y, 0);
            row.push(z);
          } catch {
            row.push(0);
          }
        }
        zValues.push(row);
      }

      // Configurar superficie 3D
      const surfaceData: any = {
        type: 'surface',
        x: xValues,
        y: yValues,
        z: zValues,
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

      // Agregar región de integración si hay límites
      const data: any[] = [surfaceData];

      if (limits) {
        // Líneas de límites
        const boundaryLines = createBoundaryBox(limits);
        data.push(...boundaryLines);
      }

      // Layout 3D
      const layout: any = {
        title: {
          text: `z = ${func}`,
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
          filename: `integral-3d-${Date.now()}`,
          height: 1080,
          width: 1920,
          scale: 2
        }
      };

      Plotly.newPlot(plotRef.current, data, layout, config);
      
      console.log('✅ Gráfica 3D creada con Plotly');

    } catch (error) {
      console.error('Error graficando función:', error);
    }
  };

  // Crear caja de límites
  const createBoundaryBox = (limits: any): any[] => {
    const { x, y, z } = limits;
    
    const lines: any[] = [];
    
    // Líneas en X
    const xLines = [
      { x: [x[0], x[1]], y: [y[0], y[0]], z: [z[0], z[0]], color: '#C74440' },
      { x: [x[0], x[1]], y: [y[1], y[1]], z: [z[0], z[0]], color: '#C74440' },
      { x: [x[0], x[1]], y: [y[0], y[0]], z: [z[1], z[1]], color: '#C74440' },
      { x: [x[0], x[1]], y: [y[1], y[1]], z: [z[1], z[1]], color: '#C74440' }
    ];

    // Líneas en Y
    const yLines = [
      { x: [x[0], x[0]], y: [y[0], y[1]], z: [z[0], z[0]], color: '#388C46' },
      { x: [x[1], x[1]], y: [y[0], y[1]], z: [z[0], z[0]], color: '#388C46' },
      { x: [x[0], x[0]], y: [y[0], y[1]], z: [z[1], z[1]], color: '#388C46' },
      { x: [x[1], x[1]], y: [y[0], y[1]], z: [z[1], z[1]], color: '#388C46' }
    ];

    // Líneas en Z
    const zLines = [
      { x: [x[0], x[0]], y: [y[0], y[0]], z: [z[0], z[1]], color: '#2D70B3' },
      { x: [x[1], x[1]], y: [y[0], y[0]], z: [z[0], z[1]], color: '#2D70B3' },
      { x: [x[0], x[0]], y: [y[1], y[1]], z: [z[0], z[1]], color: '#2D70B3' },
      { x: [x[1], x[1]], y: [y[1], y[1]], z: [z[0], z[1]], color: '#2D70B3' }
    ];

    [...xLines, ...yLines, ...zLines].forEach(line => {
      lines.push({
        type: 'scatter3d',
        mode: 'lines',
        x: line.x,
        y: line.y,
        z: line.z,
        line: {
          color: line.color,
          width: 4,
          dash: 'dash'
        },
        showlegend: false,
        hoverinfo: 'skip'
      });
    });

    return lines;
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
      
      const evalFunc = new Function('x', 'y', 'z', 'Math', `return ${sanitized}`);
      return evalFunc(x, y, z, Math);
    } catch (error) {
      throw new Error('Error evaluando función');
    }
  };

  // Graficar desde input
  const handlePlotFunction = () => {
    if (functionInput.trim()) {
      const limits = integralData?.limits || { x: [-2, 2], y: [-2, 2], z: [-2, 2] };
      plotFunction(functionInput, limits);
    }
  };

  // Reset vista
  const resetView = () => {
    if (plotRef.current) {
      Plotly.relayout(plotRef.current, {
        'scene.camera.eye': { x: 1.5, y: 1.5, z: 1.3 }
      });
    }
  };

  // Animar rotación
  const toggleAnimation = () => {
    if (isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      let angle = 0;
      
      const animate = () => {
        angle += 0.01;
        const x = 1.5 * Math.cos(angle);
        const y = 1.5 * Math.sin(angle);
        
        if (plotRef.current) {
          Plotly.relayout(plotRef.current, {
            'scene.camera.eye': { x, y, z: 1.3 }
          });
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    }
  };

  // Exportar imagen
  const exportImage = () => {
    if (plotRef.current) {
      Plotly.downloadImage(plotRef.current, {
        format: 'png',
        width: 1920,
        height: 1080,
        filename: `integral-3d-${Date.now()}`
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: isDark ? colors.dark : colors.bg }}>
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
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
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
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
            }}>
              <Box size={24} color="#000000" />
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.75rem', 
              fontWeight: '900',
              color: '#FFFFFF',
              textTransform: 'uppercase'
            }}>
              VISUALIZACIÓN 3D - PLOTLY
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
            height: '48px',
            boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* Información de Integral */}
        {integralData && (
          <div style={{
            background: '#FFFD8F',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ 
              fontSize: '1.3rem', 
              fontWeight: '900', 
              marginBottom: '16px',
              color: '#000000',
              textTransform: 'uppercase'
            }}>
              INTEGRAL ACTUAL
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                    {integralData.result.decimal?.toFixed(6) || 'N/A'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input de Función */}
        <div style={{
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
        }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '900', 
            marginBottom: '16px',
            color: colors.primary,
            textTransform: 'uppercase'
          }}>
            GRAFICAR FUNCIÓN 3D
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '700', 
                marginBottom: '8px',
                color: colors.text
              }}>
                z = f(x,y)
              </label>
              <input
                type="text"
                value={functionInput}
                onChange={(e) => setFunctionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePlotFunction()}
                placeholder="Ejemplo: x^2 + y^2"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1.1rem',
                  border: '3px solid #000000',
                  borderRadius: '12px',
                  background: isDark ? colors.dark : '#FFFFFF',
                  color: colors.text,
                  fontFamily: 'monospace'
                }}
              />
            </div>
            
            <button
              onClick={handlePlotFunction}
              style={{
                marginTop: '28px',
                padding: '14px 28px',
                background: colors.primary,
                border: '3px solid #000000',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '1rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap'
              }}
            >
              GRAFICAR
            </button>
          </div>
          
          <div style={{ 
            marginTop: '12px', 
            fontSize: '0.85rem', 
            color: colors.text,
            opacity: 0.7
          }}>
            💡 Ejemplos: x^2 + y^2, sin(x)*cos(y), x*y*z, sqrt(x^2 + y^2)
          </div>
        </div>

        {/* Controles */}
        <div style={{
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
        }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '900', 
            marginBottom: '16px',
            color: colors.primary,
            textTransform: 'uppercase'
          }}>
            CONTROLES 3D
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={toggleAnimation}
              style={{
                padding: '12px 20px',
                background: isAnimating ? '#C74440' : '#B0CE88',
                border: '3px solid #000000',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
                color: isAnimating ? '#FFFFFF' : '#000000'
              }}
            >
              {isAnimating ? <Pause size={18} /> : <Play size={18} />}
              {isAnimating ? 'PAUSAR' : 'ANIMAR'}
            </button>
            
            <button
              onClick={resetView}
              style={{
                padding: '12px 20px',
                background: '#B0CE88',
                border: '3px solid #000000',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 0 rgba(0,0,0,0.15)'
              }}
            >
              <RotateCcw size={18} />
              RESET VISTA
            </button>
            
            <button
              onClick={exportImage}
              style={{
                padding: '12px 20px',
                background: '#FFFD8F',
                border: '3px solid #000000',
                borderRadius: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 0 rgba(0,0,0,0.15)'
              }}
            >
              <Download size={18} />
              EXPORTAR PNG
            </button>
          </div>
        </div>

        {/* Gráfica 3D Plotly */}
        <div style={{
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
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

        {/* Instrucciones */}
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '3px solid #000000',
          borderRadius: '16px',
          boxShadow: '0 4px 0 rgba(0,0,0,0.15)'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '900', 
            marginBottom: '12px',
            color: colors.primary
          }}>
            📖 INSTRUCCIONES 3D
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            color: colors.text,
            lineHeight: '1.8'
          }}>
            <li><strong>Rotar:</strong> Click y arrastrar</li>
            <li><strong>Zoom:</strong> Rueda del mouse o pinch</li>
            <li><strong>Mover:</strong> Click derecho y arrastrar</li>
            <li><strong>Animar:</strong> Rotación automática continua</li>
            <li><strong>Exportar:</strong> PNG de alta calidad (1920x1080)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VisualizationScreen;

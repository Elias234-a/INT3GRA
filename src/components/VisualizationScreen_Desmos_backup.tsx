import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Box, Play, RotateCcw, Download, Edit3 } from 'lucide-react';

// Declarar tipos para Desmos API
declare global {
  interface Window {
    Desmos: any;
  }
}

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
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [calculator, setCalculator] = useState<any>(null);
  const [desmosLoaded, setDesmosLoaded] = useState(false);
  const [functionInput, setFunctionInput] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Cargar script de Desmos
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Desmos API cargada');
      setDesmosLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Error cargando Desmos API');
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Inicializar calculadora Desmos
  useEffect(() => {
    if (desmosLoaded && calculatorRef.current && !calculator) {
      try {
        const calc = window.Desmos.GraphingCalculator(calculatorRef.current, {
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          expressionsTopbar: true,
          pointsOfInterest: true,
          trace: true,
          border: false,
          lockViewport: false,
          projectorMode: isDark ? false : true,
          invertedColors: isDark,
          fontSize: 14,
          keypad: false,
          graphpaper: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          xAxisNumbers: true,
          yAxisNumbers: true,
          polarNumbers: false
        });
        
        setCalculator(calc);
        console.log('✅ Calculadora Desmos inicializada');
        
        // Configurar vista inicial 3D
        calc.setMathBounds({
          left: -5,
          right: 5,
          bottom: -5,
          top: 5
        });
        
      } catch (error) {
        console.error('Error inicializando Desmos:', error);
      }
    }
  }, [desmosLoaded, calculator, isDark]);

  // Cargar integral desde datos
  useEffect(() => {
    if (integralData && calculator) {
      const func = integralData.function || 'x*y';
      setFunctionInput(func);
      plotFunction(func);
      
      // Mostrar región de integración
      if (integralData.limits) {
        plotIntegrationRegion(integralData.limits);
      }
    }
  }, [integralData, calculator]);

  // Graficar función
  const plotFunction = (func: string) => {
    if (!calculator) return;
    
    try {
      // Limpiar gráficas anteriores
      calculator.setBlank();
      
      // Convertir función a formato Desmos
      const desmosFunc = convertToDesmos(func);
      
      // Agregar la función principal
      calculator.setExpression({
        id: 'main-function',
        latex: `z=${desmosFunc}`,
        color: '#2D70B3',
        lineWidth: 3,
        fillOpacity: 0.4
      });
      
      console.log('✅ Función graficada:', desmosFunc);
      
    } catch (error) {
      console.error('Error graficando función:', error);
    }
  };

  // Graficar región de integración
  const plotIntegrationRegion = (limits: any) => {
    if (!calculator) return;
    
    try {
      const { x, y, z } = limits;
      
      // Dibujar límites de la región
      calculator.setExpression({
        id: 'region-x-min',
        latex: `x=${x[0]}`,
        color: '#C74440',
        lineStyle: window.Desmos.Styles.DASHED,
        lineWidth: 2
      });
      
      calculator.setExpression({
        id: 'region-x-max',
        latex: `x=${x[1]}`,
        color: '#C74440',
        lineStyle: window.Desmos.Styles.DASHED,
        lineWidth: 2
      });
      
      calculator.setExpression({
        id: 'region-y-min',
        latex: `y=${y[0]}`,
        color: '#388C46',
        lineStyle: window.Desmos.Styles.DASHED,
        lineWidth: 2
      });
      
      calculator.setExpression({
        id: 'region-y-max',
        latex: `y=${y[1]}`,
        color: '#388C46',
        lineStyle: window.Desmos.Styles.DASHED,
        lineWidth: 2
      });
      
      // Ajustar vista para mostrar la región
      calculator.setMathBounds({
        left: x[0] - 1,
        right: x[1] + 1,
        bottom: y[0] - 1,
        top: y[1] + 1
      });
      
      console.log('✅ Región de integración graficada');
      
    } catch (error) {
      console.error('Error graficando región:', error);
    }
  };

  // Convertir función a formato Desmos
  const convertToDesmos = (func: string): string => {
    return func
      .replace(/\*/g, '')  // Desmos no necesita * para multiplicación
      .replace(/\^/g, '^')  // Mantener potencias
      .replace(/sqrt/g, '\\sqrt')  // Raíz cuadrada
      .replace(/sin/g, '\\sin')  // Seno
      .replace(/cos/g, '\\cos')  // Coseno
      .replace(/tan/g, '\\tan')  // Tangente
      .replace(/ln/g, '\\ln')  // Logaritmo natural
      .replace(/log/g, '\\log')  // Logaritmo
      .replace(/pi/gi, '\\pi')  // Pi
      .replace(/π/g, '\\pi');  // Pi
  };

  // Resetear vista
  const resetView = () => {
    if (!calculator) return;
    
    calculator.setMathBounds({
      left: -5,
      right: 5,
      bottom: -5,
      top: 5
    });
    
    console.log('✅ Vista reseteada');
  };

  // Exportar imagen
  const exportImage = () => {
    if (!calculator) return;
    
    try {
      calculator.asyncScreenshot({
        width: 1920,
        height: 1080,
        targetPixelRatio: 2
      }, (data: string) => {
        const link = document.createElement('a');
        link.download = `integral-3d-${Date.now()}.png`;
        link.href = data;
        link.click();
        console.log('✅ Imagen exportada');
      });
    } catch (error) {
      console.error('Error exportando imagen:', error);
    }
  };

  // Graficar función desde input
  const handlePlotFunction = () => {
    if (functionInput.trim()) {
      plotFunction(functionInput);
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
              VISUALIZACIÓN 3D - DESMOS
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
            GRAFICAR FUNCIÓN
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '700', 
                marginBottom: '8px',
                color: colors.text
              }}>
                f(x,y) =
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
            💡 Ejemplos: x^2 + y^2, sin(x)*cos(y), x*y, sqrt(x^2 + y^2)
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
            CONTROLES
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
              EXPORTAR
            </button>
          </div>
        </div>

        {/* Calculadora Desmos */}
        <div style={{
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
          minHeight: '600px'
        }}>
          <div 
            ref={calculatorRef} 
            style={{ 
              width: '100%', 
              height: '600px',
              border: '3px solid #000000',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          />
          
          {!desmosLoaded && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '600px',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: colors.text
            }}>
              ⏳ Cargando Desmos Calculator...
            </div>
          )}
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
            📖 INSTRUCCIONES
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            color: colors.text,
            lineHeight: '1.8'
          }}>
            <li><strong>Zoom:</strong> Rueda del mouse o pinch</li>
            <li><strong>Mover:</strong> Arrastrar con el mouse</li>
            <li><strong>Graficar:</strong> Escribe una función y presiona GRAFICAR o Enter</li>
            <li><strong>Exportar:</strong> Guarda la gráfica como imagen PNG de alta calidad</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VisualizationScreen;

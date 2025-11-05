import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Box, Play, RotateCcw, Download } from 'lucide-react';

// Declarar tipos para GeoGebra API
declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface GeoGebraApplet {
  inject: (id: string) => void;
  evalCommand: (command: string) => void;
  setCoordSystem: (xmin: number, xmax: number, ymin: number, ymax: number, zmin: number, zmax: number) => void;
  reset: () => void;
  setAxisLabels: (x: string, y: string, z: string) => void;
  setCaption: (objName: string, caption: string) => void;
  getValue: (objName: string) => number;
  getPNGBase64?: (scale: number, transparent: boolean, dpi: number) => string;
}

import Canvas3D from './Canvas3D';

interface VisualizationScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  integralData?: any;
}

interface IntegralRegion {
  id: string;
  name: string;
  function: string;
  xMin: string;
  xMax: string;
  yMin: string;
  yMax: string;
  zMin: string;
  zMax: string;
  coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical';
  geogebraCommands: string[];
}

const VisualizationScreen: React.FC<VisualizationScreenProps> = ({ colors, onBack, isDark, toggleTheme, integralData }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('cube');
  const [geogebraLoaded, setGeogebraLoaded] = useState(false);
  const [applet, setApplet] = useState<GeoGebraApplet | null>(null);
  const [currentFunction, setCurrentFunction] = useState('x*y*z');
  const [isAnimating, setIsAnimating] = useState(false);
  const geogebraRef = useRef<HTMLDivElement>(null);

  // Regiones predefinidas con comandos GeoGebra
  const integralRegions: IntegralRegion[] = [
    {
      id: 'cube',
      name: 'Cubo Unitario',
      function: 'x*y*z',
      xMin: '0', xMax: '1',
      yMin: '0', yMax: '1', 
      zMin: '0', zMax: '1',
      coordinateSystem: 'cartesian',
      geogebraCommands: [
        'SetActiveView(2)',
        'cube = Cube((0,0,0), (1,1,1))',
        'SetColor(cube, "blue")',
        'SetTransparency(cube, 0.3)',
        'f(x,y,z) = x*y*z',
        'SetCaption(cube, "Cubo: [0,1]³")',
        'ShowLabel(cube, true)'
      ]
    },
    {
      id: 'cylinder',
      name: 'Cilindro',
      function: 'x^2 + y^2',
      xMin: '-1', xMax: '1',
      yMin: '-1', yMax: '1',
      zMin: '0', zMax: '2',
      coordinateSystem: 'cylindrical',
      geogebraCommands: [
        'SetActiveView(2)',
        'cylinder = Cylinder((0,0,0), (0,0,2), 1)',
        'SetColor(cylinder, "green")',
        'SetTransparency(cylinder, 0.3)',
        'f(r,θ,z) = r²',
        'SetCaption(cylinder, "Cilindro: r ≤ 1, 0 ≤ z ≤ 2")',
        'ShowLabel(cylinder, true)'
      ]
    },
    {
      id: 'sphere',
      name: 'Esfera Unitaria',
      function: 'x^2 + y^2 + z^2',
      xMin: '-1', xMax: '1',
      yMin: '-1', yMax: '1',
      zMin: '-1', zMax: '1',
      coordinateSystem: 'spherical',
      geogebraCommands: [
        'SetActiveView(2)',
        'sphere = Sphere((0,0,0), 1)',
        'SetColor(sphere, "red")',
        'SetTransparency(sphere, 0.3)',
        'f(ρ,θ,φ) = ρ²',
        'SetCaption(sphere, "Esfera: ρ ≤ 1")',
        'ShowLabel(sphere, true)'
      ]
    },
    {
      id: 'paraboloid',
      name: 'Paraboloide',
      function: 'x^2 + y^2',
      xMin: '-2', xMax: '2',
      yMin: '-2', yMax: '2',
      zMin: '0', zMax: '4',
      coordinateSystem: 'cartesian',
      geogebraCommands: [
        'SetActiveView(2)',
        'paraboloid = Surface(u, v, u² + v², u, -2, 2, v, -2, 2)',
        'SetColor(paraboloid, "purple")',
        'SetTransparency(paraboloid, 0.3)',
        'f(x,y,z) = x² + y²',
        'SetCaption(paraboloid, "Paraboloide: z = x² + y²")',
        'ShowLabel(paraboloid, true)'
      ]
    }
  ];

  // Cargar GeoGebra API
  useEffect(() => {
    const loadGeoGebra = () => {
      if (window.GGBApplet) {
        setGeogebraLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.onload = () => {
        setGeogebraLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGeoGebra();
  }, []);

  // Actualizar función y región cuando se reciben datos de integral
  useEffect(() => {
    if (integralData) {
      setCurrentFunction(integralData.function);
      // Determinar la mejor región basada en los límites
      const { limits, coordinateSystem } = integralData;
      
      if (coordinateSystem === 'cylindrical') {
        setSelectedRegion('cylinder');
      } else if (coordinateSystem === 'spherical') {
        setSelectedRegion('sphere');
      } else {
        // Cartesian - determinar si es cubo o paraboloide
        if (limits.x[0] === 0 && limits.x[1] === 1 && 
            limits.y[0] === 0 && limits.y[1] === 1 && 
            limits.z[0] === 0 && limits.z[1] === 1) {
          setSelectedRegion('cube');
        } else {
          setSelectedRegion('paraboloid');
        }
      }
    }
  }, [integralData]);

  // Inicializar GeoGebra cuando esté cargado
  useEffect(() => {
    if (geogebraLoaded && geogebraRef.current && !applet) {
      try {
        const parameters = {
          appName: "3d",
          width: 800,
          height: 600,
          showToolBar: true,
          showAlgebraInput: false,
          showMenuBar: false,
          enableRightClick: false,
          enableShiftDragZoom: true,
          showResetIcon: true,
          language: "es",
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
          appletOnLoad: (api: GeoGebraApplet) => {
            console.log('✅ GeoGebra cargado exitosamente');
            setApplet(api);
            // Configuración inicial con timeout para asegurar que la API esté lista
            setTimeout(() => {
              try {
                api.setCoordSystem(-3, 3, -3, 3, -3, 3);
                api.setAxisLabels("x", "y", "z");
                loadRegion('cube', api);
              } catch (error) {
                console.error('Error en configuración inicial:', error);
              }
            }, 500);
          }
        };

        const ggbApp = new window.GGBApplet(parameters, true);
        ggbApp.inject('geogebra-applet');
      } catch (error) {
        console.error('Error inicializando GeoGebra:', error);
      }
    }
  }, [geogebraLoaded, isDark, applet]);

  // Cargar región en GeoGebra
  const loadRegion = (regionId: string, ggbApplet?: GeoGebraApplet) => {
    const targetApplet = ggbApplet || applet;
    if (!targetApplet) {
      console.warn('Applet no disponible');
      return;
    }

    const region = integralRegions.find(r => r.id === regionId);
    if (!region) {
      console.warn('Región no encontrada:', regionId);
      return;
    }

    try {
      // Limpiar applet
      targetApplet.reset();
      
      console.log(`🔄 Cargando región: ${region.name}`);
      
      // Ejecutar comandos de la región con delay entre cada uno
      region.geogebraCommands.forEach((command, index) => {
        setTimeout(() => {
          try {
            targetApplet.evalCommand(command);
            console.log(`✅ Comando ejecutado: ${command}`);
          } catch (error) {
            console.error(`❌ Error ejecutando comando: ${command}`, error);
          }
        }, index * 100); // 100ms entre cada comando
      });

      setCurrentFunction(region.function);
    } catch (error) {
      console.error('Error cargando región:', error);
    }
  };

  // Animar rotación
  const toggleAnimation = () => {
    if (!applet) {
      console.warn('Applet no disponible para animación');
      return;
    }
    
    try {
      if (isAnimating) {
        applet.evalCommand('StopAnimation()');
        console.log('⏸️ Animación pausada');
      } else {
        // Crear variable de ángulo si no existe
        applet.evalCommand('rotateAngle = 0');
        applet.evalCommand('StartAnimation(rotateAngle)');
        applet.evalCommand('SetAnimationSpeed(rotateAngle, 1)');
        console.log('▶️ Animación iniciada');
      }
      setIsAnimating(!isAnimating);
    } catch (error) {
      console.error('Error en animación:', error);
      alert('La animación no está disponible en este momento');
    }
  };

  // Resetear vista
  const resetView = () => {
    if (!applet) {
      console.warn('Applet no disponible para reset');
      return;
    }
    
    try {
      console.log('🔄 Reseteando vista...');
      applet.setCoordSystem(-3, 3, -3, 3, -3, 3);
      loadRegion(selectedRegion);
      setIsAnimating(false);
      console.log('✅ Vista reseteada');
    } catch (error) {
      console.error('Error reseteando vista:', error);
      // Intentar recargar completamente
      try {
        applet.reset();
        setTimeout(() => loadRegion(selectedRegion), 500);
      } catch (retryError) {
        console.error('Error en retry de reset:', retryError);
      }
    }
  };

  // Exportar imagen
  const exportImage = () => {
    if (!applet) {
      alert('GeoGebra no está cargado. Por favor espera un momento.');
      return;
    }
    
    try {
      console.log('📸 Exportando imagen...');
      if (applet.getPNGBase64) {
        const dataURL = applet.getPNGBase64(1, true, 72);
        const link = document.createElement('a');
        link.download = `integral-region-${selectedRegion}-${Date.now()}.png`;
        link.href = 'data:image/png;base64,' + dataURL;
        link.click();
        console.log('✅ Imagen exportada');
      } else {
        console.warn('getPNGBase64 no disponible');
        alert('La función de exportación no está disponible en esta versión de GeoGebra.\n\nPuedes hacer captura de pantalla manualmente.');
      }
    } catch (error) {
      console.error('Error exportando imagen:', error);
      alert('Error al exportar la imagen. Intenta hacer una captura de pantalla.');
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
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
            whileHover={{ scale: 1.05, backgroundColor: '#FFFD8F', color: '#000000' }}
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
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '24px'
        }}
      >
        {/* Información de Integral (cuando viene del SolverScreen) */}
        {integralData && (
          <div className="neo-card" style={{
            backgroundColor: '#FFFD8F',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.25)'
          }}>
            <h2 className="neo-title neo-title--md" style={{
              margin: '0 0 16px',
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '-0.025em',
              color: '#000000',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>
              📊 Integral Calculada
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                background: '#FFFFFF',
                border: '3px solid #000000',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#4C763B', marginBottom: '8px' }}>
                  FUNCIÓN
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#000000', fontFamily: 'monospace' }}>
                  f(x,y,z) = {integralData.function}
                </div>
              </div>
              
              <div style={{
                background: '#FFFFFF',
                border: '3px solid #000000',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#4C763B', marginBottom: '8px' }}>
                  COORDENADAS
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#000000', textTransform: 'uppercase' }}>
                  {integralData.coordinateSystem === 'cartesian' ? 'Cartesianas' : 
                   integralData.coordinateSystem === 'cylindrical' ? 'Cilíndricas' : 'Esféricas'}
                </div>
              </div>
              
              {integralData.result && (
                <div style={{
                  background: '#B0CE88',
                  border: '3px solid #000000',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '8px' }}>
                    RESULTADO
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#000000', fontFamily: 'monospace' }}>
                    {(integralData.result.decimal || integralData.result.value)?.toFixed(4) || 'N/A'}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{
              background: '#FFFFFF',
              border: '3px solid #000000',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              color: '#000000'
            }}>
              <strong>Límites de integración:</strong><br/>
              x: [{integralData.limits.x[0]}, {integralData.limits.x[1]}], 
              y: [{integralData.limits.y[0]}, {integralData.limits.y[1]}], 
              z: [{integralData.limits.z[0]}, {integralData.limits.z[1]}]
            </div>
          </div>
        )}

        {/* Region Selection */}
        <div className="neo-card" style={{
          backgroundColor: colors.bg,
          border: `4px solid ${colors.neutral}`,
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 8px 0 rgba(0, 0, 0, 0.25)'
        }}>
          <h2 className="neo-title neo-title--md" style={{
            margin: '0 0 24px',
            fontSize: '24px',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: colors.tertiary,
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            Seleccionar Región de Integración
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {integralRegions.map((region) => (
              <div
                key={region.id}
                onClick={() => {
                  setSelectedRegion(region.id);
                  loadRegion(region.id);
                }}
                className="neo-card"
                style={{
                  padding: '24px',
                  backgroundColor: selectedRegion === region.id ? colors.tertiary : colors.white,
                  color: selectedRegion === region.id ? colors.white : colors.neutral,
                  border: `4px solid ${colors.neutral}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  boxShadow: selectedRegion === region.id ? '0 8px 0 rgba(0, 0, 0, 0.3)' : '0 6px 0 rgba(0, 0, 0, 0.25)'
                }}
                onMouseEnter={(e) => {
                  if (selectedRegion !== region.id) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRegion !== region.id) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.backgroundColor = colors.white;
                  }
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  {region.id === 'cube' && <Box size={36} />}
                  {region.id === 'cylinder' && <Box size={36} />}
                  {region.id === 'sphere' && <Box size={36} />}
                  {region.id === 'paraboloid' && <Box size={36} />}
                </div>
                <h3 className="neo-title neo-title--sm" style={{ 
                  margin: '0 0 12px', 
                  fontSize: '18px', 
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  textTransform: 'uppercase'
                }}>
                  {region.name}
                </h3>
                <p style={{ 
                  margin: '0 0 8px', 
                  fontSize: '14px', 
                  fontWeight: 700,
                  opacity: 0.8 
                }}>
                  f(x,y,z) = {region.function}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '12px', 
                  fontWeight: 600,
                  opacity: 0.6 
                }}>
                  {region.coordinateSystem === 'cartesian' && 'Cartesianas'}
                  {region.coordinateSystem === 'cylindrical' && 'Cilíndricas'}
                  {region.coordinateSystem === 'spherical' && 'Esféricas'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* GeoGebra Visualization */}
        <div className="neo-card" style={{
          backgroundColor: colors.bg,
          border: `4px solid ${colors.neutral}`,
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 8px 0 rgba(0, 0, 0, 0.25)'
        }}>
          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h2 className="neo-title neo-title--md" style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '-0.025em',
              color: colors.tertiary,
              textTransform: 'uppercase'
            }}>
              Visualización 3D Interactiva
            </h2>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={toggleAnimation}
                className="neo-button"
                style={{
                  padding: '12px 16px',
                  backgroundColor: isAnimating ? colors.primary : colors.secondary,
                  border: `3px solid ${colors.neutral}`,
                  borderRadius: '12px',
                  color: colors.neutral,
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '14px',
                  letterSpacing: '-0.025em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Play size={16} />
                {isAnimating ? 'PAUSAR' : 'ANIMAR'}
              </button>
              
              <button
                onClick={resetView}
                className="neo-button"
                style={{
                  padding: '12px 16px',
                  backgroundColor: colors.secondary,
                  border: `3px solid ${colors.neutral}`,
                  borderRadius: '12px',
                  color: colors.neutral,
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '14px',
                  letterSpacing: '-0.025em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <RotateCcw size={16} />
                RESET
              </button>
              
              <button
                onClick={exportImage}
                className="neo-button"
                style={{
                  padding: '12px 16px',
                  backgroundColor: colors.tertiary,
                  border: `3px solid ${colors.neutral}`,
                  borderRadius: '12px',
                  color: colors.white,
                  cursor: 'pointer',
                  fontWeight: 900,
                  fontSize: '14px',
                  letterSpacing: '-0.025em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
                }}
              >
                <Download size={16} />
                EXPORTAR
              </button>
            </div>
          </div>

          {/* Function Info */}
          <div className="neo-card" style={{
            backgroundColor: colors.primary,
            border: `3px solid ${colors.neutral}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 4px 0 rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{
                  fontWeight: 900,
                  fontSize: '16px',
                  letterSpacing: '-0.025em',
                  color: colors.neutral
                }}>
                  FUNCIÓN ACTUAL:
                </span>
                <span style={{
                  marginLeft: '8px',
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.neutral
                }}>
                  f(x,y,z) = {currentFunction}
                </span>
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: colors.neutral,
                opacity: 0.8
              }}>
                Región: {integralRegions.find(r => r.id === selectedRegion)?.name}
              </div>
            </div>
          </div>

          {/* GeoGebra Applet Container */}
          <div
            ref={geogebraRef}
            style={{
              width: '100%',
              minHeight: '600px',
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderRadius: '16px',
              border: `3px solid ${colors.neutral}`,
              boxShadow: 'inset 0 2px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {!geogebraLoaded ? (
              <div style={{
                textAlign: 'center',
                color: colors.text,
                padding: '40px'
              }}>
                <div style={{
                  fontSize: '24px',
                  marginBottom: '16px'
                }}>
                  ⏳
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '12px'
                }}>
                  Cargando GeoGebra 3D...
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.7
                }}>
                  Preparando visualización interactiva
                </div>
              </div>
            ) : (
              <div id="geogebra-applet" style={{ width: '100%', height: '600px' }} />
            )}
          </div>

          {/* Instructions */}
          <div className="neo-card" style={{
            backgroundColor: colors.secondary,
            border: `3px solid ${colors.neutral}`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '24px',
            boxShadow: '0 4px 0 rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{
              margin: '0 0 12px',
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '-0.025em',
              color: colors.neutral,
              textTransform: 'uppercase'
            }}>
              Instrucciones de Uso
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              fontSize: '14px',
              fontWeight: 700,
              color: colors.neutral
            }}>
              <div>
                • **Rotar:** Arrastrar con el mouse
              </div>
              <div>
                • **Zoom:** Rueda del mouse o pinch
              </div>
              <div>
                • **Mover:** Shift + arrastrar
              </div>
              <div>
                • **Animar:** Botón de reproducción
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationScreen;
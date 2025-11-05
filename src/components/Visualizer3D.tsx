import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  Eye, 
  Layers,
  Settings,
  Download,
  Edit3
} from 'lucide-react';

interface Visualizer3DProps {
  colors: any;
  functionExpression?: string;
  region?: any;
  coordinateSystem?: 'cartesian' | 'cylindrical' | 'spherical';
  showGrid?: boolean;
  showAxes?: boolean;
  animateIntegration?: boolean;
  onEditRequest?: () => void;
  showEditButton?: boolean;
}

const Visualizer3D: React.FC<Visualizer3DProps> = ({
  colors,
  functionExpression = "x² + y²",
  region,
  coordinateSystem = 'cartesian',
  showGrid = true,
  showAxes = true,
  animateIntegration = false,
  onEditRequest,
  showEditButton = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [maxLayers] = useState(20);
  const [viewSettings, setViewSettings] = useState({
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
    pan: { x: 0, y: 0 }
  });
  const [mouseState, setMouseState] = useState({
    isDown: false,
    lastX: 0,
    lastY: 0
  });

  // Renderizado 3D mejorado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas con alta resolución
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);

    // Limpiar canvas con gradiente de fondo
    const bgGradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    bgGradient.addColorStop(0, colors.bg);
    bgGradient.addColorStop(1, colors.hover);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Dibujar visualización 3D mejorada
    drawEnhanced3D(ctx, rect.width, rect.height);
  }, [colors, viewSettings, currentLayer, showGrid, showAxes, coordinateSystem, functionExpression, animateIntegration]);

  const drawEnhanced3D = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 120 * viewSettings.zoom;

    // Aplicar transformaciones de vista
    ctx.save();
    ctx.translate(centerX + viewSettings.pan.x, centerY + viewSettings.pan.y);
    
    // Simular rotación 3D con transformaciones 2D
    const rotX = viewSettings.rotation.x;
    const rotY = viewSettings.rotation.y;
    
    // Dibujar elementos en orden de profundidad (back to front)
    
    // 1. Fondo y grilla si están habilitados
    if (showGrid) {
      drawEnhancedGrid(ctx, scale, rotX, rotY);
    }

    // 2. Ejes de coordenadas si están habilitados
    if (showAxes) {
      drawEnhancedAxes(ctx, scale, rotX, rotY);
    }

    // 3. Región de integración
    drawEnhancedRegion(ctx, scale, rotX, rotY);

    // 4. Superficie de la función
    drawEnhancedSurface(ctx, scale, rotX, rotY);

    // 5. Elementos de animación si está activa
    if (animateIntegration && isAnimating) {
      drawIntegrationAnimation(ctx, scale, rotX, rotY);
    }

    ctx.restore();

    // 6. UI elements (no afectados por transformaciones)
    drawCoordinateInfo(ctx, width, height);
    drawFunctionInfo(ctx, width, height);
  };

  const drawEnhancedAxes = (ctx: CanvasRenderingContext2D, scale: number, rotX: number, rotY: number) => {
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Calcular puntos 3D proyectados
    const project3D = (x: number, y: number, z: number) => {
      // Rotación simple alrededor de Y y X
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      
      // Rotar alrededor de Y
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      
      // Rotar alrededor de X
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      
      // Proyección perspectiva simple
      const perspective = 300 / (300 + z2);
      return {
        x: x1 * perspective,
        y: y1 * perspective,
        depth: z2
      };
    };

    // Eje X (rojo)
    ctx.strokeStyle = '#EF4444';
    ctx.beginPath();
    const xStart = project3D(-scale, 0, 0);
    const xEnd = project3D(scale, 0, 0);
    ctx.moveTo(xStart.x, xStart.y);
    ctx.lineTo(xEnd.x, xEnd.y);
    ctx.stroke();
    
    // Flecha X
    drawArrow(ctx, xStart, xEnd, '#EF4444');

    // Eje Y (verde)
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    const yStart = project3D(0, -scale, 0);
    const yEnd = project3D(0, scale, 0);
    ctx.moveTo(yStart.x, yStart.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.stroke();
    
    // Flecha Y
    drawArrow(ctx, yStart, yEnd, '#10B981');

    // Eje Z (azul)
    ctx.strokeStyle = '#3B82F6';
    ctx.beginPath();
    const zStart = project3D(0, 0, -scale);
    const zEnd = project3D(0, 0, scale);
    ctx.moveTo(zStart.x, zStart.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.stroke();
    
    // Flecha Z
    drawArrow(ctx, zStart, zEnd, '#3B82F6');

    // Etiquetas de ejes
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('X', xEnd.x + 20, xEnd.y);
    ctx.fillText('Y', yEnd.x, yEnd.y - 20);
    ctx.fillText('Z', zEnd.x - 20, zEnd.y);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: any, end: any, color: string) => {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    // Punta de flecha
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - arrowAngle),
      end.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + arrowAngle),
      end.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.5;

    const gridSize = scale / 5;
    
    // Líneas verticales
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * gridSize, centerY - scale);
      ctx.lineTo(centerX + i * gridSize, centerY + scale);
      ctx.stroke();
    }

    // Líneas horizontales
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - scale, centerY + i * gridSize);
      ctx.lineTo(centerX + scale, centerY + i * gridSize);
      ctx.stroke();
    }
  };

  const drawRegion = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    ctx.fillStyle = colors.accent1 + '40';
    ctx.strokeStyle = colors.accent2;
    ctx.lineWidth = 2;

    switch (coordinateSystem) {
      case 'cylindrical':
        // Dibujar cilindro
        ctx.beginPath();
        ctx.arc(centerX, centerY, scale * 0.6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;

      case 'spherical':
        // Dibujar esfera (círculo en 2D)
        ctx.beginPath();
        ctx.arc(centerX, centerY, scale * 0.7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;

      default:
        // Dibujar cubo (rectángulo en 2D)
        const size = scale * 0.8;
        ctx.fillRect(centerX - size/2, centerY - size/2, size, size);
        ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);
    }
  };

  const drawSurface = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    // Simular superficie de la función con gradiente
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale);
    gradient.addColorStop(0, colors.accent3 + '80');
    gradient.addColorStop(0.5, colors.accent2 + '60');
    gradient.addColorStop(1, colors.accent1 + '40');

    ctx.fillStyle = gradient;
    
    // Dibujar "superficie" como una serie de círculos concéntricos
    for (let i = 0; i < maxLayers; i++) {
      if (isAnimating && i > currentLayer) break;
      
      const radius = (scale * 0.8 * i) / maxLayers;
      const alpha = 1 - (i / maxLayers) * 0.7;
      
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawCoordinateInfo = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Panel de información
    const panelWidth = 200;
    const panelHeight = 120;
    
    ctx.fillStyle = colors.hover + 'E6';
    ctx.fillRect(10, 10, panelWidth, panelHeight);
    
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(10, 10, panelWidth, panelHeight);

    // Texto de información
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    
    const info = [
      `Sistema: ${coordinateSystem}`,
      `Función: ${functionExpression}`,
      `Zoom: ${(viewSettings.zoom * 100).toFixed(0)}%`,
      `Capa: ${currentLayer}/${maxLayers}`
    ];

    info.forEach((text, index) => {
      ctx.fillText(text, 20, 30 + index * 20);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseState({
      isDown: true,
      lastX: e.clientX,
      lastY: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseState.isDown) return;

    const deltaX = e.clientX - mouseState.lastX;
    const deltaY = e.clientY - mouseState.lastY;

    setViewSettings(prev => ({
      ...prev,
      rotation: {
        x: prev.rotation.x + deltaY * 0.01,
        y: prev.rotation.y + deltaX * 0.01,
        z: prev.rotation.z
      }
    }));

    setMouseState(prev => ({
      ...prev,
      lastX: e.clientX,
      lastY: e.clientY
    }));
  };

  const handleMouseUp = () => {
    setMouseState(prev => ({ ...prev, isDown: false }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    
    setViewSettings(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom * zoomFactor))
    }));
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetView = () => {
    setViewSettings({
      rotation: { x: 0, y: 0, z: 0 },
      zoom: 1,
      pan: { x: 0, y: 0 }
    });
    setCurrentLayer(0);
  };

  // Animación automática
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCurrentLayer(prev => {
        if (prev >= maxLayers) {
          setIsAnimating(false);
          return maxLayers;
        }
        return prev + 1;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isAnimating, maxLayers]);

  const controls = [
    {
      icon: isAnimating ? Pause : Play,
      label: isAnimating ? 'Pausar' : 'Animar',
      action: toggleAnimation,
      color: colors.accent2
    },
    {
      icon: RotateCcw,
      label: 'Reset',
      action: resetView,
      color: colors.accent3
    },
    {
      icon: ZoomIn,
      label: 'Zoom +',
      action: () => setViewSettings(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) })),
      color: colors.text
    },
    {
      icon: ZoomOut,
      label: 'Zoom -',
      action: () => setViewSettings(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom * 0.8) })),
      color: colors.text
    },
    ...(showEditButton && onEditRequest ? [{
      icon: Edit3,
      label: 'Editar función',
      action: onEditRequest,
      color: colors.accent1
    }] : [])
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: colors.bg,
      borderRadius: '1rem',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`
    }}>
      {/* Canvas 3D */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          cursor: mouseState.isDown ? 'grabbing' : 'grab'
        }}
      />

      {/* Controles */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: colors.hover + 'E6',
        padding: '0.75rem',
        borderRadius: '2rem',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.border}`
      }}>
        {controls.map((control, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={control.action}
            title={control.label}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: control.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <control.icon size={20} />
          </motion.button>
        ))}
      </div>

      {/* Slider de capas */}
      {isAnimating && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: colors.hover + 'E6',
          padding: '1rem',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border}`,
          minWidth: '200px'
        }}>
          <div style={{ 
            fontSize: '0.9rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            color: colors.text
          }}>
            Integración por Capas
          </div>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: colors.border,
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentLayer / maxLayers) * 100}%`,
              height: '100%',
              backgroundColor: colors.accent2,
              transition: 'width 0.2s'
            }} />
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            marginTop: '0.5rem',
            color: colors.text,
            opacity: 0.7
          }}>
            Capa {currentLayer} de {maxLayers}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        backgroundColor: colors.hover + 'E6',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${colors.border}`,
        fontSize: '0.8rem',
        color: colors.text,
        opacity: 0.8
      }}>
        <div>Arrastra para rotar</div>
        <div>Rueda para zoom</div>
        <div>Play para animar</div>
      </div>
    </div>
  );

  const drawEnhancedGrid = (ctx: CanvasRenderingContext2D, scale: number, rotX: number, rotY: number) => {
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;

    const project3D = (x: number, y: number, z: number) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      
      const perspective = 300 / (300 + z2);
      return { x: x1 * perspective, y: y1 * perspective };
    };

    const gridSize = scale / 4;
    const gridCount = 8;

    // Grilla en plano XY
    for (let i = -gridCount; i <= gridCount; i++) {
      // Líneas paralelas a X
      ctx.beginPath();
      const start = project3D(-scale, i * gridSize, 0);
      const end = project3D(scale, i * gridSize, 0);
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Líneas paralelas a Y
      ctx.beginPath();
      const start2 = project3D(i * gridSize, -scale, 0);
      const end2 = project3D(i * gridSize, scale, 0);
      ctx.moveTo(start2.x, start2.y);
      ctx.lineTo(end2.x, end2.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  const drawEnhancedRegion = (ctx: CanvasRenderingContext2D, scale: number, rotX: number, rotY: number) => {
    const project3D = (x: number, y: number, z: number) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      
      const perspective = 300 / (300 + z2);
      return { x: x1 * perspective, y: y1 * perspective, depth: z2 };
    };

    ctx.fillStyle = colors.accent1 + '20';
    ctx.strokeStyle = colors.accent2;
    ctx.lineWidth = 2;

    switch (coordinateSystem) {
      case 'cylindrical':
        // Dibujar cilindro
        const cylinderRadius = scale * 0.6;
        const cylinderHeight = scale * 0.8;
        
        // Base inferior
        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
          const point = project3D(
            cylinderRadius * Math.cos(angle),
            cylinderRadius * Math.sin(angle),
            -cylinderHeight / 2
          );
          if (angle === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.fill();
        ctx.stroke();
        
        // Base superior
        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
          const point = project3D(
            cylinderRadius * Math.cos(angle),
            cylinderRadius * Math.sin(angle),
            cylinderHeight / 2
          );
          if (angle === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.fill();
        ctx.stroke();
        break;

      case 'spherical':
        // Dibujar esfera con líneas de latitud y longitud
        const sphereRadius = scale * 0.7;
        
        // Círculos de latitud
        for (let lat = -Math.PI/2; lat <= Math.PI/2; lat += Math.PI/4) {
          ctx.beginPath();
          const r = sphereRadius * Math.cos(lat);
          const z = sphereRadius * Math.sin(lat);
          
          for (let lon = 0; lon <= Math.PI * 2; lon += 0.1) {
            const point = project3D(
              r * Math.cos(lon),
              r * Math.sin(lon),
              z
            );
            if (lon === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        }
        
        // Círculos de longitud
        for (let lon = 0; lon < Math.PI * 2; lon += Math.PI/4) {
          ctx.beginPath();
          for (let lat = -Math.PI/2; lat <= Math.PI/2; lat += 0.1) {
            const r = sphereRadius * Math.cos(lat);
            const z = sphereRadius * Math.sin(lat);
            const point = project3D(
              r * Math.cos(lon),
              r * Math.sin(lon),
              z
            );
            if (lat === -Math.PI/2) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        }
        break;

      default:
        // Dibujar cubo
        const cubeSize = scale * 0.8;
        const vertices = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ].map(([x, y, z]) => project3D(x * cubeSize/2, y * cubeSize/2, z * cubeSize/2));

        // Dibujar caras del cubo
        const faces = [
          [0, 1, 2, 3], // cara trasera
          [4, 5, 6, 7], // cara frontal
          [0, 1, 5, 4], // cara inferior
          [2, 3, 7, 6], // cara superior
          [0, 3, 7, 4], // cara izquierda
          [1, 2, 6, 5]  // cara derecha
        ];

        faces.forEach((face, index) => {
          ctx.beginPath();
          ctx.moveTo(vertices[face[0]].x, vertices[face[0]].y);
          face.forEach(vertexIndex => {
            ctx.lineTo(vertices[vertexIndex].x, vertices[vertexIndex].y);
          });
          ctx.closePath();
          
          ctx.globalAlpha = 0.1 + index * 0.05;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.stroke();
        });
    }
  };

  const drawEnhancedSurface = (ctx: CanvasRenderingContext2D, scale: number, rotX: number, rotY: number) => {
    if (!functionExpression) return;

    const project3D = (x: number, y: number, z: number) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      
      const perspective = 300 / (300 + z2);
      return { x: x1 * perspective, y: y1 * perspective, depth: z2 };
    };

    // Evaluar función en una grilla
    const resolution = 20;
    const step = (scale * 2) / resolution;
    
    for (let i = 0; i < resolution - 1; i++) {
      for (let j = 0; j < resolution - 1; j++) {
        const x1 = -scale + i * step;
        const y1 = -scale + j * step;
        const x2 = x1 + step;
        const y2 = y1 + step;
        
        // Evaluar función (simulación)
        const z1 = evaluateFunction(x1, y1) * scale * 0.3;
        const z2 = evaluateFunction(x2, y1) * scale * 0.3;
        const z3 = evaluateFunction(x2, y2) * scale * 0.3;
        const z4 = evaluateFunction(x1, y2) * scale * 0.3;
        
        // Proyectar puntos
        const p1 = project3D(x1, y1, z1);
        const p2 = project3D(x2, y1, z2);
        const p3 = project3D(x2, y2, z3);
        const p4 = project3D(x1, y2, z4);
        
        // Colorear basado en altura
        const avgZ = (z1 + z2 + z3 + z4) / 4;
        const intensity = Math.max(0, Math.min(1, (avgZ + scale * 0.3) / (scale * 0.6)));
        
        const r = Math.floor(255 * (1 - intensity));
        const g = Math.floor(255 * intensity);
        const b = 100;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
        ctx.strokeStyle = colors.accent3;
        ctx.lineWidth = 0.5;
        
        // Dibujar cuadrilátero
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  const evaluateFunction = (x: number, y: number): number => {
    if (!functionExpression) return 0;
    
    try {
      // Normalizar coordenadas
      const nx = x / 100;
      const ny = y / 100;
      
      // Evaluar funciones comunes
      if (functionExpression.includes('x^2 + y^2')) {
        return nx * nx + ny * ny;
      } else if (functionExpression.includes('x^2')) {
        return nx * nx;
      } else if (functionExpression.includes('sin')) {
        return Math.sin(nx) * Math.cos(ny);
      } else if (functionExpression.includes('cos')) {
        return Math.cos(nx) * Math.sin(ny);
      } else {
        return nx + ny; // Función lineal por defecto
      }
    } catch {
      return 0;
    }
  };

  const drawIntegrationAnimation = (ctx: CanvasRenderingContext2D, scale: number, rotX: number, rotY: number) => {
    if (!isAnimating) return;

    const project3D = (x: number, y: number, z: number) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      
      const perspective = 300 / (300 + z2);
      return { x: x1 * perspective, y: y1 * perspective };
    };

    // Dibujar capas de integración
    const layerHeight = (scale * 2) / maxLayers;
    const currentHeight = -scale + (currentLayer * layerHeight);
    
    ctx.fillStyle = colors.accent2 + '40';
    ctx.strokeStyle = colors.accent2;
    ctx.lineWidth = 2;
    
    // Dibujar plano de integración actual
    const planeSize = scale * 0.8;
    const corners = [
      project3D(-planeSize, -planeSize, currentHeight),
      project3D(planeSize, -planeSize, currentHeight),
      project3D(planeSize, planeSize, currentHeight),
      project3D(-planeSize, planeSize, currentHeight)
    ];
    
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    corners.forEach(corner => ctx.lineTo(corner.x, corner.y));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawFunctionInfo = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!functionExpression) return;

    // Panel de información de la función
    const panelWidth = 250;
    const panelHeight = 80;
    const panelX = width - panelWidth - 10;
    const panelY = height - panelHeight - 10;
    
    ctx.fillStyle = colors.hover + 'F0';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.strokeStyle = colors.border;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Información de la función
    ctx.fillStyle = colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    
    ctx.fillText(`Función: f(x,y,z) = ${functionExpression}`, panelX + 10, panelY + 25);
    ctx.fillText(`Sistema: ${coordinateSystem}`, panelX + 10, panelY + 45);
    
    if (animateIntegration && isAnimating) {
      ctx.fillText(`Progreso: ${Math.round((currentLayer / maxLayers) * 100)}%`, panelX + 10, panelY + 65);
    }
  };
};

export default Visualizer3D;
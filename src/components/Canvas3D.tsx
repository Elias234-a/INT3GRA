import React, { useRef, useEffect, useState } from 'react';

interface Canvas3DProps {
  colors: any;
  regionType: 'rectangular' | 'cylindrical' | 'spherical' | 'complex';
}

const Canvas3D: React.FC<Canvas3DProps> = ({ colors, regionType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Setup 3D projection parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 80;

    // Project 3D point to 2D
    const project = (x: number, y: number, z: number) => {
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Rotate around Y axis
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection
      const perspective = 1 / (1 + z2 * 0.002);
      const screenX = centerX + x1 * scale * perspective;
      const screenY = centerY - y1 * scale * perspective;

      return { x: screenX, y: screenY, z: z2 };
    };

    // Draw axes
    const drawAxes = () => {
      const axisLength = 3;
      
      // X axis (red)
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      const xStart = project(0, 0, 0);
      const xEnd = project(axisLength, 0, 0);
      ctx.beginPath();
      ctx.moveTo(xStart.x, xStart.y);
      ctx.lineTo(xEnd.x, xEnd.y);
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.fillText('X', xEnd.x + 10, xEnd.y);

      // Y axis (green)
      ctx.strokeStyle = '#22C55E';
      const yStart = project(0, 0, 0);
      const yEnd = project(0, axisLength, 0);
      ctx.beginPath();
      ctx.moveTo(yStart.x, yStart.y);
      ctx.lineTo(yEnd.x, yEnd.y);
      ctx.stroke();
      ctx.fillStyle = '#22C55E';
      ctx.fillText('Y', yEnd.x, yEnd.y - 10);

      // Z axis (blue)
      ctx.strokeStyle = '#3B82F6';
      const zStart = project(0, 0, 0);
      const zEnd = project(0, 0, axisLength);
      ctx.beginPath();
      ctx.moveTo(zStart.x, zStart.y);
      ctx.lineTo(zEnd.x, zEnd.y);
      ctx.stroke();
      ctx.fillStyle = '#3B82F6';
      ctx.fillText('Z', zEnd.x + 10, zEnd.y);
    };

    // Draw rectangular region
    const drawRectangular = () => {
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // back face
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]  // front face
      ];

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // back face
        [4, 5], [5, 6], [6, 7], [7, 4], // front face
        [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
      ];

      // Project vertices
      const projected = vertices.map(v => project(v[0], v[1], v[2]));

      // Draw faces with transparency
      ctx.fillStyle = colors.accent2 + '40';
      ctx.strokeStyle = colors.accent3;
      ctx.lineWidth = 2;

      // Draw edges
      edges.forEach(edge => {
        const start = projected[edge[0]];
        const end = projected[edge[1]];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      });
    };

    // Draw cylindrical region
    const drawCylindrical = () => {
      const segments = 32;
      const radius = 1.2;
      const height = 2;

      ctx.strokeStyle = colors.accent3;
      ctx.lineWidth = 2;

      // Top circle
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const point = project(x, height / 2, z);
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Bottom circle
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const point = project(x, -height / 2, z);
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Vertical lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const top = project(x, height / 2, z);
        const bottom = project(x, -height / 2, z);
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.stroke();
      }

      // Fill with transparency
      ctx.fillStyle = colors.accent2 + '30';
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const point = project(x, height / 2, z);
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.fill();
    };

    // Draw spherical region
    const drawSpherical = () => {
      const segments = 24;
      const radius = 1.5;

      ctx.strokeStyle = colors.accent3;
      ctx.lineWidth = 2;

      // Draw latitude circles
      for (let lat = -2; lat <= 2; lat++) {
        const y = (lat / 2) * radius;
        const circleRadius = Math.sqrt(radius * radius - y * y);
        
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const x = Math.cos(angle) * circleRadius;
          const z = Math.sin(angle) * circleRadius;
          const point = project(x, y, z);
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
      }

      // Draw longitude lines
      for (let lon = 0; lon < 8; lon++) {
        const angle = (lon / 8) * Math.PI * 2;
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const phi = (i / segments) * Math.PI;
          const y = Math.cos(phi) * radius;
          const r = Math.sin(phi) * radius;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          const point = project(x, y, z);
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
      }
    };

    // Draw complex region (combination)
    const drawComplex = () => {
      const segments = 32;
      
      ctx.strokeStyle = colors.accent3;
      ctx.lineWidth = 2;

      // Draw a twisted shape
      for (let layer = 0; layer < 10; layer++) {
        const y = (layer / 10) * 2 - 1;
        const twist = (layer / 10) * Math.PI;
        const scale = 1 + Math.sin(y * Math.PI) * 0.3;

        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2 + twist;
          const x = Math.cos(angle) * scale;
          const z = Math.sin(angle) * scale;
          const point = project(x, y, z);
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
      }
    };

    // Draw based on region type
    drawAxes();
    
    switch (regionType) {
      case 'rectangular':
        drawRectangular();
        break;
      case 'cylindrical':
        drawCylindrical();
        break;
      case 'spherical':
        drawSpherical();
        break;
      case 'complex':
        drawComplex();
        break;
    }

  }, [rotation, regionType, colors]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));
    
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{
        width: '100%',
        maxWidth: '600px',
        height: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        borderRadius: '12px',
        backgroundColor: colors.bg
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default Canvas3D;

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, Dumbbell } from 'lucide-react';
import { Exercise } from '../App';

interface ExercisesScreenProps {
  colors: any;
  onBack: () => void;
  navigateToSolver: (exercise: Exercise) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ExercisesScreen: React.FC<ExercisesScreenProps> = ({ colors, onBack, navigateToSolver, isDark, toggleTheme }) => {
  const exercises: Exercise[] = [
    {
      level: 'Básico',
      title: 'Volumen de un cubo',
      description: 'Calcula el volumen de un cubo de lado 2 usando integrales triples.',
      function: '1',
      limits: { x: [0, 2], y: [0, 2], z: [0, 2] },
      type: 'cartesian',
      application: '💡 Almacenamiento en cubos de datos'
    },
    {
      level: 'Básico',
      title: 'Región rectangular simple',
      description: 'Volumen bajo una función constante en una región unitaria.',
      function: '2',
      limits: { x: [0, 1], y: [0, 1], z: [0, 1] },
      type: 'cartesian',
      application: '💡 Capacidad básica de almacenamiento'
    },
    {
      level: 'Intermedio',
      title: 'Región bajo un plano',
      description: 'Integral de x+y+z en la región unitaria. Representa una distribución lineal.',
      function: 'x + y + z',
      limits: { x: [0, 1], y: [0, 1], z: [0, 1] },
      type: 'cartesian',
      application: '💡 Distribución de densidad en 3D'
    },
    {
      level: 'Intermedio',
      title: 'Función cuadrática',
      description: 'Integración de una función cuadrática en espacio 3D.',
      function: 'x*x + y*y + z*z',
      limits: { x: [0, 1], y: [0, 1], z: [0, 1] },
      type: 'cartesian',
      application: '💡 Energía potencial en un sistema'
    },
    {
      level: 'Intermedio',
      title: 'Cilindro simple',
      description: 'Volumen de un cilindro usando coordenadas cilíndricas.',
      function: '1',
      limits: { x: [0, 1], y: [0, 6.28], z: [0, 2] },
      type: 'cylindrical',
      application: '💡 Almacenamiento cilíndrico'
    },
    {
      level: 'Avanzado',
      title: 'Función exponencial',
      description: 'Integral de una gaussiana 3D, útil en distribuciones de probabilidad.',
      function: 'exp(-x*x-y*y-z*z)',
      limits: { x: [-2, 2], y: [-2, 2], z: [-2, 2] },
      type: 'cartesian',
      application: '💡 Dispersión de energía o probabilidad'
    },
    {
      level: 'Avanzado',
      title: 'Función trigonométrica',
      description: 'Combinación de funciones trigonométricas en 3D.',
      function: 'sin(x) * cos(y) * z',
      limits: { x: [0, 3.14], y: [0, 3.14], z: [0, 1] },
      type: 'cartesian',
      application: '💡 Ondas y vibraciones en sistemas'
    },
    {
      level: 'Avanzado',
      title: 'Esfera unitaria',
      description: 'Volumen de una esfera usando coordenadas esféricas.',
      function: '1',
      limits: { x: [0, 1], y: [0, 6.28], z: [0, 3.14] },
      type: 'spherical',
      application: '💡 Modelado de regiones esféricas'
    }
  ];

  const getLevelColor = (level: string) => {
    if (level === 'Básico') return colors.accent2;
    if (level === 'Intermedio') return colors.accent1;
    return colors.accent3;
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
              <Dumbbell size={24} color="#000000" />
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
              EJERCICIOS APLICADOS
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
          maxWidth: '900px',
          margin: '0 auto',
          padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px)'
        }}
      >
        {exercises.map((exercise, index) => (
          <div
            key={index}
            style={{
              backgroundColor: colors.hover,
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Level Badge */}
            <div>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: getLevelColor(exercise.level),
                  color: exercise.level === 'Avanzado' ? '#FFFFFF' : colors.accent4,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {exercise.level}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: colors.text
              }}
            >
              {exercise.title}
            </h3>

            {/* Description */}
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                opacity: 0.7,
                lineHeight: 1.5
              }}
            >
              {exercise.description}
            </p>

            {/* Function Display */}
            <div
              style={{
                backgroundColor: colors.bg,
                padding: '12px',
                borderRadius: '10px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: colors.accent3
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <span style={{ opacity: 0.7 }}>f(x,y,z) = </span>
                <span style={{ fontWeight: 700 }}>{exercise.function}</span>
              </div>
              <div style={{ fontSize: '12px', opacity: 0.6 }}>
                x: [{exercise.limits.x[0]}, {exercise.limits.x[1]}], 
                y: [{exercise.limits.y[0]}, {exercise.limits.y[1]}], 
                z: [{exercise.limits.z[0]}, {exercise.limits.z[1]}]
              </div>
              <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '4px' }}>
                Coordenadas: {exercise.type === 'cartesian' ? 'Cartesianas' : exercise.type === 'cylindrical' ? 'Cilíndricas' : 'Esféricas'}
              </div>
            </div>

            {/* Application */}
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                fontStyle: 'italic',
                opacity: 0.7
              }}
            >
              {exercise.application}
            </p>

            {/* Solve Button */}
            <button
              onClick={() => navigateToSolver(exercise)}
              style={{
                alignSelf: 'flex-start',
                padding: '10px 20px',
                backgroundColor: colors.accent3,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Resolver →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExercisesScreen;

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon, Sun, BookOpen } from 'lucide-react';

interface TheoryScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const TheoryScreen: React.FC<TheoryScreenProps> = ({ colors, onBack, isDark, toggleTheme }) => {
  const theoryCards = [
    {
      title: '¿Qué es una Integral Triple?',
      description: 'Una integral triple extiende el concepto de integración a tres dimensiones. Se utiliza para calcular volúmenes, masas, centros de masa y otras propiedades de regiones tridimensionales.',
      example: '∫∫∫ f(x,y,z) dx dy dz',
      context: 'Extensión natural de las integrales dobles al espacio 3D'
    },
    {
      title: 'Coordenadas Cartesianas',
      description: 'Sistema de coordenadas rectangular estándar donde cada punto se define por tres valores perpendiculares entre sí: x, y, z. Ideal para regiones rectangulares o con bordes paralelos a los ejes.',
      example: 'x ∈ [a,b], y ∈ [c,d], z ∈ [e,f]',
      context: 'Uso: Regiones rectangulares y cuboides'
    },
    {
      title: 'Coordenadas Cilíndricas',
      description: 'Sistema que combina coordenadas polares en el plano xy con la altura z. Usa radio (r), ángulo (θ) y altura (z). Muy útil cuando hay simetría circular o axial.',
      example: 'dV = r dr dθ dz',
      context: 'Uso: Cilindros, conos, regiones con simetría circular'
    },
    {
      title: 'Coordenadas Esféricas',
      description: 'Sistema donde cada punto se define por su distancia al origen (ρ), ángulo azimutal (θ) y ángulo polar (φ). Perfecto para regiones con simetría esférica.',
      example: 'dV = ρ² sin(φ) dρ dθ dφ',
      context: 'Uso: Esferas, cascarones esféricos, simetría radial'
    },
    {
      title: 'Aplicaciones en Ingeniería',
      description: 'Las integrales triples son fundamentales en ingeniería de sistemas para modelar: distribución de datos en espacios 3D, cálculo de capacidades de almacenamiento, análisis de flujos de energía, y simulaciones volumétricas.',
      example: 'Almacenamiento | Distribución de Datos | Flujo de Energía',
      context: 'Aplicaciones prácticas en análisis de sistemas complejos'
    },
    {
      title: 'Propiedades Importantes',
      description: 'Linealidad: la integral de una suma es la suma de las integrales. Aditividad: el dominio puede dividirse en subdominios. Teorema de Fubini: permite cambiar el orden de integración bajo ciertas condiciones.',
      example: '∫∫∫ (αf + βg) dV = α∫∫∫ f dV + β∫∫∫ g dV',
      context: 'Propiedades que simplifican cálculos complejos'
    }
  ];

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
              <BookOpen size={24} color="#000000" />
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
              TEORÍA INTERACTIVA
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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: 'clamp(16px, 3vw, 24px)'
          }}
        >
          {theoryCards.map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: colors.hover,
                border: `1px solid ${colors.border}`,
                borderRadius: 'clamp(12px, 2.5vw, 16px)',
                padding: 'clamp(16px, 4vw, 24px)',
                transition: 'all 0.3s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.accent3
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  margin: '0 0 16px',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  opacity: 0.8
                }}
              >
                {card.description}
              </p>
              <div
                style={{
                  backgroundColor: colors.bg,
                  padding: '12px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  textAlign: 'center',
                  marginBottom: '12px'
                }}
              >
                {card.example}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  opacity: 0.6,
                  fontStyle: 'italic'
                }}
              >
                {card.context}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TheoryScreen;
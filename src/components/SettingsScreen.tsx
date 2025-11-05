import React from 'react';
import { ArrowLeft, Moon, Sun, Settings, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  precision: number;
  setPrecision: (value: number) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  colors, 
  onBack, 
  isDark, 
  toggleTheme,
  precision,
  setPrecision
}) => {
  const precisionLevels = [
    { value: 10, label: 'Baja (10³)', description: '1,000 subdivisiones - Rápido' },
    { value: 15, label: 'Media (15³)', description: '3,375 subdivisiones - Recomendado' },
    { value: 20, label: 'Alta (20³)', description: '8,000 subdivisiones - Preciso' },
    { value: 30, label: 'Muy Alta (30³)', description: '27,000 subdivisiones - Muy preciso' }
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
              <Settings size={24} color="#000000" />
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
              CONFIGURACIÓN
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
          maxWidth: '800px',
          margin: '0 auto',
          padding: '32px 24px'
        }}
      >
        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: colors.hover,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Settings size={24} color={colors.accent3} />
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: colors.accent3
              }}
            >
              Apariencia
            </h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600 }}>
                Tema {isDark ? 'Oscuro' : 'Claro'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>
                Cambia entre modo claro y oscuro
              </p>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.accent3,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              Cambiar Tema
            </button>
          </div>
        </motion.div>

        {/* Precision Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: colors.hover,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Sliders size={24} color={colors.accent3} />
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: colors.accent3
              }}
            >
              Precisión de Cálculo
            </h2>
          </div>
          
          <p style={{ margin: '0 0 20px', fontSize: '13px', opacity: 0.7, lineHeight: 1.6 }}>
            Ajusta el número de subdivisiones para las sumas de Riemann. Mayor precisión requiere más tiempo de cálculo.
          </p>

          <div style={{ display: 'grid', gap: '12px' }}>
            {precisionLevels.map((level) => (
              <div
                key={level.value}
                onClick={() => setPrecision(level.value)}
                style={{
                  backgroundColor: precision === level.value ? colors.accent2 : colors.bg,
                  border: precision === level.value ? `2px solid ${colors.accent3}` : `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (precision !== level.value) {
                    e.currentTarget.style.backgroundColor = colors.hover;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (precision !== level.value) {
                    e.currentTarget.style.backgroundColor = colors.bg;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${precision === level.value ? colors.accent3 : colors.border}`,
                      backgroundColor: precision === level.value ? colors.accent3 : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {precision === level.value && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF'
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700 }}>
                      {level.label}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>
                      {level.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700 }}>
            INT3GRA v1.0
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>
            Integrales Triples para Ingeniería de Sistemas
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsScreen;

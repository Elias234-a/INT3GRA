import React from 'react';
import { BookOpen, Calculator, Box, Dumbbell, History, Moon, Sun, Settings, Bot, Building, Lightbulb, BarChart3, Target, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
// @ts-ignore
import logoImage from '../assets/Rerso 9.png';

interface HomeScreenProps {
  colors: any;
  navigateTo: (screen: string) => void;
  historyCount: number;
  isDark: boolean;
  toggleTheme: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ colors, navigateTo, historyCount, isDark, toggleTheme }) => {
  const cards = [
    {
      icon: Calculator,
      title: 'Resolver Integral',
      description: 'Motor IA que resuelve integrales triples paso a paso',
      screen: 'solver',
      color: colors.accent2,
      featured: true
    },
    {
      icon: Bot,
      title: 'Tutor IA',
      description: 'Asistente inteligente que explica conceptos y métodos',
      screen: 'aitutor',
      color: '#8B5CF6',
      featured: true
    },
    {
      icon: Box,
      title: 'Visualización 3D',
      description: 'Graficador interactivo de regiones y superficies',
      screen: 'visualization',
      color: '#3B82F6',
      featured: false
    },
    {
      icon: Building,
      title: 'Casos Reales',
      description: 'Problemas de ingeniería, física y medicina',
      screen: 'casestudy',
      color: '#10B981',
      featured: true
    },
    {
      icon: BarChart3,
      title: 'Comparador',
      description: 'Compara métodos de coordenadas lado a lado',
      screen: 'comparison',
      color: '#F97316',
      featured: true
    },
    {
      icon: History,
      title: 'Historial',
      description: 'Revisa tus cálculos y progreso',
      screen: 'history',
      color: colors.accent3,
      featured: false
    },
    {
      icon: Settings,
      title: 'Configuración',
      description: 'Personaliza la app y ajusta precisión',
      screen: 'settings',
      color: '#6B7280',
      featured: false
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, paddingTop: 'clamp(20px, 4vw, 32px)' }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.accent3}, ${colors.accent4})`,
          padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)',
          textAlign: 'center',
          margin: '0 clamp(12px, 3vw, 24px) clamp(12px, 3vw, 24px)',
          borderRadius: 'clamp(12px, 3vw, 20px)',
          position: 'relative'
        }}
      >
        {/* Theme Toggle Button - Neo Brutalism */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#B0CE88' }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: 'clamp(12px, 2.5vw, 20px)',
            right: 'clamp(12px, 2.5vw, 20px)',
            width: 'clamp(44px, 8vw, 48px)',
            height: 'clamp(44px, 8vw, 48px)',
            borderRadius: '12px',
            border: '4px solid #000000',
            backgroundColor: '#B0CE88',
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
            fontWeight: '900'
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: 'inline-block',
            marginBottom: 'clamp(12px, 3vw, 16px)'
          }}
        >
          <img
            src={logoImage}
            alt="INT3GRA Logo"
            style={{ 
              height: 'clamp(40px, 10vw, 60px)',
              width: 'auto',
              display: 'block'
            }} 
          />
        </motion.div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px)'
        }}
      >
        {/* Featured Cards */}
        <div style={{ marginBottom: 'clamp(32px, 6vw, 48px)' }}>
          <h2 className="neo-title neo-title--lg" style={{ 
            fontSize: 'clamp(24px, 5vw, 32px)', 
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: colors.tertiary,
            marginBottom: 'clamp(24px, 4vw, 32px)',
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            Características Principales
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
              gap: 'clamp(20px, 4vw, 32px)'
            }}
          >
            {cards.filter(card => card.featured).map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                onClick={() => navigateTo(card.screen)}
                className="neo-card"
                style={{
                  backgroundColor: isDark ? colors.tertiary : colors.white,
                  border: `4px solid ${colors.neutral}`,
                  borderRadius: '20px',
                  padding: 'clamp(32px, 6vw, 40px) clamp(24px, 5vw, 32px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: '0 8px 0 rgba(0, 0, 0, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 0 rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 0 rgba(0, 0, 0, 0.25)';
                }}
              >
                {/* Sparkle effect */}
                
                <div
                  className="neo-card"
                  style={{
                    width: 'clamp(64px, 14vw, 80px)',
                    height: 'clamp(64px, 14vw, 80px)',
                    backgroundColor: card.color,
                    border: `4px solid ${colors.neutral}`,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto clamp(20px, 4vw, 28px)',
                    boxShadow: '0 6px 0 rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <card.icon size={32} color="white" />
                </div>
                <h3
                  className="neo-title neo-title--md"
                  style={{
                    margin: '0 0 clamp(16px, 3vw, 20px)',
                    fontSize: 'clamp(20px, 4.5vw, 26px)',
                    fontWeight: 900,
                    letterSpacing: '-0.025em',
                    color: isDark ? colors.white : colors.neutral,
                    textTransform: 'uppercase'
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(15px, 3.5vw, 18px)',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.4,
                    color: isDark ? colors.white : colors.neutral
                  }}
                >
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Other Features */}
        <div style={{ marginBottom: 'clamp(24px, 5vw, 48px)' }}>
          <h3 className="neo-title neo-title--md" style={{ 
            fontSize: 'clamp(20px, 4vw, 24px)', 
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: colors.tertiary,
            marginBottom: 'clamp(20px, 4vw, 24px)',
            textAlign: 'center',
            textTransform: 'uppercase'
          }}>
            Herramientas Adicionales
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
              gap: 'clamp(16px, 3vw, 20px)'
            }}
          >
            {cards.filter(card => !card.featured).map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => navigateTo(card.screen)}
                className="neo-card"
                style={{
                  backgroundColor: isDark ? colors.dark : colors.secondary,
                  border: `4px solid ${colors.neutral}`,
                  borderRadius: '16px',
                  padding: 'clamp(24px, 5vw, 28px) clamp(20px, 4vw, 24px)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  boxShadow: '0 6px 0 rgba(0, 0, 0, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 9px 0 rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                }}
              >
                <div
                  className="neo-card"
                  style={{
                    width: 'clamp(48px, 10vw, 56px)',
                    height: 'clamp(48px, 10vw, 56px)',
                    backgroundColor: card.color,
                    border: `3px solid ${colors.neutral}`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto clamp(16px, 3vw, 20px)',
                    boxShadow: '0 4px 0 rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <card.icon size={24} color="white" />
                </div>
                <h4
                  className="neo-title neo-title--sm"
                  style={{
                    margin: '0 0 clamp(8px, 2vw, 12px)',
                    fontSize: 'clamp(16px, 3.5vw, 18px)',
                    fontWeight: 900,
                    letterSpacing: '-0.025em',
                    color: isDark ? colors.white : colors.neutral,
                    textTransform: 'uppercase'
                  }}
                >
                  {card.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(13px, 3vw, 15px)',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.3,
                    color: isDark ? colors.white : colors.neutral
                  }}
                >
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Statistics Section - Neo Brutalism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="neo-card"
          style={{
            backgroundColor: isDark ? colors.tertiary : colors.primary,
            border: `4px solid ${colors.neutral}`,
            borderRadius: '20px',
            padding: 'clamp(24px, 5vw, 32px)',
            textAlign: 'center',
            boxShadow: '0 8px 0 rgba(0, 0, 0, 0.25)'
          }}
        >
          <h3
            style={{
              margin: '0 0 clamp(16px, 3vw, 20px)',
              fontSize: 'clamp(18px, 4vw, 22px)',
              fontWeight: 900,
              color: isDark ? colors.white : colors.neutral,
              textTransform: 'uppercase',
              letterSpacing: '-0.025em',
              textShadow: isDark ? '2px 2px 0 rgba(0,0,0,0.3)' : 'none'
            }}
          >
            Estadísticas
          </h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(8px, 2vw, 12px)'
            }}
          >
            <div
              style={{
                fontSize: 'clamp(36px, 9vw, 52px)',
                fontWeight: 900,
                color: isDark ? colors.white : colors.neutral,
                textShadow: isDark ? '3px 3px 0 rgba(0,0,0,0.4)' : '2px 2px 0 rgba(0,0,0,0.1)'
              }}
            >
              {historyCount}
            </div>
            <div
              style={{
                textAlign: 'left',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                color: isDark ? colors.white : colors.neutral,
                opacity: 0.8,
                fontWeight: 600
              }}
            >
              <div>Integrales</div>
              <div>Resueltas</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeScreen;
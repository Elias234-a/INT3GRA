import React from 'react';
import { ArrowLeft, Download, Trash2, History as HistoryIcon, Moon, Sun, TrendingUp, Calculator, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { HistoryItem } from '../App';

interface HistoryScreenProps {
  colors: any;
  onBack: () => void;
  history: HistoryItem[];
  clearHistory: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  toggleFavorite: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  getAllTags: () => string[];
  getItemsByTag: (tag: string) => HistoryItem[];
  getFavorites: () => HistoryItem[];
  getPopularTags: (limit?: number) => Array<{tag: string, count: number}>;
  removeFromHistory: (id: string) => void;
  onVisualize: (integralData: any) => void;
  onCompare: (integralId: string) => void;
  onChatWithContext: (integralId: string) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
  colors, 
  onBack, 
  history, 
  clearHistory, 
  isDark, 
  toggleTheme,
  toggleFavorite,
  addTag,
  removeTag,
  getAllTags,
  getItemsByTag,
  getFavorites,
  getPopularTags,
  removeFromHistory,
  onVisualize,
  onCompare,
  onChatWithContext
}) => {
  const downloadHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `int3gra-historial-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    total: history.length,
    cartesian: history.filter(h => h.coordinateSystem === 'cartesian').length,
    cylindrical: history.filter(h => h.coordinateSystem === 'cylindrical').length,
    spherical: history.filter(h => h.coordinateSystem === 'spherical').length,
    averageResult: history.length > 0 
      ? (history.reduce((sum, h) => sum + h.result.decimal, 0) / history.length).toFixed(2)
      : '0'
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
              <HistoryIcon size={24} color="#000000" />
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
              HISTORIAL
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#FFFD8F' }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadHistory}
              style={{
                background: '#FFFD8F',
                border: '4px solid #000000',
                borderRadius: '12px',
                color: '#000000',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Download size={16} />
              DESCARGAR
            </motion.button>
          )}
          
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
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px)'
        }}
      >
        {history.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: colors.hover,
              border: `1px solid ${colors.border}`,
              borderRadius: '16px',
              padding: '60px 24px',
              textAlign: 'center'
            }}
          >
            <HistoryIcon
              size={48}
              style={{
                opacity: 0.3,
                marginBottom: '16px'
              }}
            />
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '18px',
                fontWeight: 700
              }}
            >
              Sin historial aún
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                opacity: 0.7
              }}
            >
              Resuelve integrales para ver tu historial aquí
            </p>
          </motion.div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  backgroundColor: colors.hover,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}
              >
                <Calculator size={24} color={colors.accent3} style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '28px', fontWeight: 800, color: colors.accent3, marginBottom: '4px' }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  Total Calculadas
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  backgroundColor: colors.hover,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}
              >
                <TrendingUp size={24} color={colors.accent3} style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '28px', fontWeight: 800, color: colors.accent3, marginBottom: '4px' }}>
                  {stats.averageResult}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  Promedio
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  backgroundColor: colors.hover,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}
              >
                <Clock size={24} color={colors.accent3} style={{ marginBottom: '12px' }} />
                <div style={{ fontSize: '16px', fontWeight: 700, color: colors.accent3, marginBottom: '4px' }}>
                  {stats.cartesian}/{stats.cylindrical}/{stats.spherical}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  Cart/Cil/Esf
                </div>
              </motion.div>
            </div>

            {/* Header Info */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  opacity: 0.8
                }}
              >
                Cálculos recientes
              </div>
              <button
                onClick={clearHistory}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #EF4444',
                  color: '#EF4444',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#EF4444';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#EF4444';
                }}
              >
                <Trash2 size={14} />
                Limpiar
              </button>
            </div>

            {/* History Items */}
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  backgroundColor: colors.hover,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}
              >
                {/* Left Column */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      opacity: 0.6,
                      marginBottom: '8px'
                    }}
                  >
                    f(x,y,z) = {item.function}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      opacity: 0.5,
                      marginBottom: '8px'
                    }}
                  >
                    x: [{item.limits.x[0]}, {item.limits.x[1]}], y: [{item.limits.y[0]}, {item.limits.y[1]}], z: [{item.limits.z[0]}, {item.limits.z[1]}]
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      opacity: 0.4
                    }}
                  >
                    {item.timestamp.toLocaleString('es-ES')}
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: colors.accent3,
                      marginBottom: '4px'
                    }}
                  >
                    {item.result.decimal.toFixed(4)}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      opacity: 0.5
                    }}
                  >
                    {item.coordinateSystem === 'cartesian' ? 'Cartesianas' : item.coordinateSystem === 'cylindrical' ? 'Cilíndricas' : 'Esféricas'}
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
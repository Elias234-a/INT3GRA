import React, { useState } from 'react';
import { ArrowLeft, Download, Trash2, History as HistoryIcon, Moon, Sun, TrendingUp, Calculator, Clock, Star, Tag, Plus, X, Eye, BarChart3, MessageCircle, Filter } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | 'favorites' | 'cartesian' | 'cylindrical' | 'spherical' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [addingTagToId, setAddingTagToId] = useState<string | null>(null);

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

  const getFilteredHistory = (): HistoryItem[] => {
    let filtered = history;

    // Filtro por tipo
    if (filter === 'favorites') {
      filtered = getFavorites();
    } else if (filter === 'cartesian' || filter === 'cylindrical' || filter === 'spherical') {
      filtered = history.filter(item => item.coordinateSystem === filter);
    } else if (selectedTag) {
      filtered = getItemsByTag(selectedTag);
    }

    // Búsqueda por texto
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.function.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleAddTag = (id: string) => {
    if (newTagInput.trim() && !newTagInput.includes(' ')) {
      addTag(id, newTagInput.trim().toLowerCase());
      setNewTagInput('');
      setAddingTagToId(null);
    }
  };

  const getSystemColor = (system: string): string => {
    const systemColors = {
      cartesian: '#FFFD8F',
      cylindrical: '#B0CE88',
      spherical: '#4C763B'
    };
    return systemColors[system as keyof typeof systemColors] || '#FFFD8F';
  };

  const getSystemName = (system: string): string => {
    const names = {
      cartesian: 'CARTESIANAS',
      cylindrical: 'CILÍNDRICAS',
      spherical: 'ESFÉRICAS'
    };
    return names[system as keyof typeof names] || system.toUpperCase();
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < difficulty ? '#FFFD8F' : 'none'}
        color={i < difficulty ? '#FFFD8F' : '#666'}
      />
    ));
  };

  // Calculate statistics
  const stats = {
    total: history.length,
    cartesian: history.filter(h => h.coordinateSystem === 'cartesian').length,
    cylindrical: history.filter(h => h.coordinateSystem === 'cylindrical').length,
    spherical: history.filter(h => h.coordinateSystem === 'spherical').length,
    favorites: getFavorites().length,
    averageTime: history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.calculationTime, 0) / history.length) : 0
  };

  const filteredHistory = getFilteredHistory();
  const allTags = getAllTags();
  const popularTags = getPopularTags(8);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg }}>
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
            whileHover={{ scale: 1.05, backgroundColor: '#FFFD8F' }}
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        
        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#FFFD8F',
            border: '4px solid #000000',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#000000' }}>{stats.total}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#000000', textTransform: 'uppercase' }}>Total</div>
          </div>
          
          <div style={{
            background: '#B0CE88',
            border: '4px solid #000000',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#000000' }}>{stats.favorites}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#000000', textTransform: 'uppercase' }}>Favoritos</div>
          </div>
          
          <div style={{
            background: '#4C763B',
            border: '4px solid #000000',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FFFFFF' }}>{stats.averageTime}ms</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' }}>Promedio</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{
          background: isDark ? colors.tertiary : '#FFFFFF',
          border: '4px solid #000000',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '1.2rem',
            fontWeight: '900',
            color: isDark ? colors.white : '#000000',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Filter size={20} />
            FILTROS Y BÚSQUEDA
          </h3>

          {/* Search */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Buscar por función o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                background: isDark ? colors.dark : '#FFFFFF',
                color: isDark ? colors.white : '#000000',
                border: '3px solid #000000',
                borderRadius: '12px',
                boxShadow: '0 4px 0 rgba(0,0,0,0.15)'
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {['all', 'favorites', 'cartesian', 'cylindrical', 'spherical'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => {
                  setFilter(filterType);
                  setSelectedTag(null);
                }}
                style={{
                  background: filter === filterType ? '#FFFD8F' : (isDark ? colors.dark : '#FFFFFF'),
                  border: '3px solid #000000',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  color: '#000000',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {filterType === 'all' ? 'TODAS' : 
                 filterType === 'favorites' ? 'FAVORITOS' :
                 getSystemName(filterType)}
              </button>
            ))}
          </div>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: isDark ? colors.white : '#000000',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                Tags Populares:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {popularTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setFilter('all');
                    }}
                    style={{
                      background: selectedTag === tag ? '#B0CE88' : (isDark ? colors.dark : '#F0F0F0'),
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      color: '#000000',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Tag size={12} />
                    {tag} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Items */}
        {filteredHistory.length === 0 ? (
          <div style={{
            background: isDark ? colors.tertiary : '#FFFFFF',
            border: '4px solid #000000',
            borderRadius: '20px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)'
          }}>
            <HistoryIcon size={48} color={isDark ? colors.white : '#666'} style={{ marginBottom: '16px' }} />
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: isDark ? colors.white : '#000000'
            }}>
              No hay integrales que mostrar
            </h3>
            <p style={{
              margin: 0,
              color: isDark ? colors.white : '#666'
            }}>
              {searchQuery || selectedTag || filter !== 'all' 
                ? 'Prueba cambiando los filtros o la búsqueda'
                : 'Resuelve tu primera integral para ver el historial'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '20px'
          }}>
            {filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: isDark ? colors.tertiary : '#FFFFFF',
                  border: '4px solid #000000',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 6px 0 rgba(0,0,0,0.25)',
                  position: 'relative'
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: getSystemColor(item.coordinateSystem),
                    border: '2px solid #000000',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: '#000000'
                  }}>
                    {getSystemName(item.coordinateSystem)}
                  </div>
                  
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Star
                      size={20}
                      fill={item.isFavorite ? '#FFFD8F' : 'none'}
                      color={item.isFavorite ? '#FFFD8F' : '#666'}
                    />
                  </button>
                </div>

                {/* Function */}
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: isDark ? colors.white : '#000000',
                  marginBottom: '12px',
                  wordBreak: 'break-all'
                }}>
                  ∫∫∫ {item.function} dV
                </div>

                {/* Result and Difficulty */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#4C763B'
                    }}>
                      {item.result.decimal.toFixed(4)}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: isDark ? colors.white : '#666'
                    }}>
                      {item.calculationTime}ms
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {getDifficultyStars(item.metadata.difficulty)}
                  </div>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginBottom: '8px'
                  }}>
                    {item.tags.map((tag) => (
                      <div
                        key={tag}
                        style={{
                          background: '#B0CE88',
                          border: '2px solid #000000',
                          borderRadius: '6px',
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Tag size={10} />
                        {tag}
                        <button
                          onClick={() => removeTag(item.id, tag)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0',
                            color: '#000000'
                          }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    
                    {addingTagToId === item.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag(item.id)}
                          placeholder="nuevo tag"
                          style={{
                            width: '80px',
                            padding: '2px 4px',
                            fontSize: '0.7rem',
                            border: '1px solid #000000',
                            borderRadius: '4px'
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddTag(item.id)}
                          style={{
                            background: '#FFFD8F',
                            border: '1px solid #000000',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setAddingTagToId(null);
                            setNewTagInput('');
                          }}
                          style={{
                            background: '#FF6B6B',
                            border: '1px solid #000000',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTagToId(item.id)}
                        style={{
                          background: isDark ? colors.dark : '#F0F0F0',
                          border: '2px dashed #666',
                          borderRadius: '6px',
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={10} />
                        tag
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => onVisualize({
                      function: item.function,
                      limits: item.limits,
                      coordinateSystem: item.coordinateSystem,
                      result: item.result
                    })}
                    style={{
                      background: '#FFFD8F',
                      border: '3px solid #000000',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: '#000000',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={12} />
                    VER 3D
                  </button>

                  <button
                    onClick={() => onCompare(item.id)}
                    style={{
                      background: '#B0CE88',
                      border: '3px solid #000000',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: '#000000',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <BarChart3 size={12} />
                    COMPARAR
                  </button>

                  <button
                    onClick={() => onChatWithContext(item.id)}
                    style={{
                      background: '#4C763B',
                      border: '3px solid #000000',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MessageCircle size={12} />
                    CHAT IA
                  </button>

                  <button
                    onClick={() => removeFromHistory(item.id)}
                    style={{
                      background: '#FF6B6B',
                      border: '3px solid #000000',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={12} />
                    ELIMINAR
                  </button>
                </div>

                {/* Timestamp */}
                <div style={{
                  fontSize: '0.7rem',
                  color: '#666',
                  marginTop: '12px',
                  textAlign: 'right'
                }}>
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '24px',
          justifyContent: 'center'
        }}>
          <button
            onClick={downloadHistory}
            style={{
              background: '#B0CE88',
              border: '4px solid #000000',
              borderRadius: '16px',
              padding: '12px 24px',
              color: '#000000',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'uppercase',
              boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
            }}
          >
            <Download size={20} />
            Exportar JSON
          </button>

          <button
            onClick={clearHistory}
            style={{
              background: '#FF6B6B',
              border: '4px solid #000000',
              borderRadius: '16px',
              padding: '12px 24px',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'uppercase',
              boxShadow: '0 6px 0 rgba(0,0,0,0.25)'
            }}
          >
            <Trash2 size={20} />
            Limpiar Todo
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  Zap, 
  Atom, 
  Cpu, 
  Cog, 
  Car,
  ChevronRight,
  Play,
  BookOpen,
  Calculator,
  Eye,
  Award,
  Filter,
  Search,
  Clock,
  TrendingUp,
  Users,
  Globe,
  Lightbulb,
  Target,
  BarChart3,
  Settings,
  Download,
  Share2,
  ArrowLeft,
  Moon,
  Sun,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { 
  engineeringCases, 
  EngineeringCase, 
  getCasesByCategory, 
  getCasesByDifficulty,
  searchCases,
  getCasesStats 
} from '../data/engineeringCases';

interface CaseStudyScreenProps {
  colors: any;
  onBack: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  onSolveCase?: (caseData: EngineeringCase) => void;
}

const CaseStudyScreen: React.FC<CaseStudyScreenProps> = ({ 
  colors, 
  onBack, 
  isDark, 
  toggleTheme,
  onSolveCase 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<EngineeringCase | null>(null);
  const [editingCase, setEditingCase] = useState<EngineeringCase | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'difficulty' | 'category' | 'complexity'>('difficulty');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCases, setFilteredCases] = useState<EngineeringCase[]>(engineeringCases);

  // Categorías de ingeniería
  const categories = [
    { id: 'all', name: 'Todos los Casos', icon: BookOpen, color: colors.primary },
    { id: 'sistemas', name: 'Ing. Sistemas', icon: Cpu, color: colors.accent1 },
    { id: 'mecanica', name: 'Ing. Mecánica', icon: Cog, color: colors.accent2 },
    { id: 'industrial', name: 'Ing. Industrial', icon: Building, color: colors.accent3 },
    { id: 'civil', name: 'Ing. Civil', icon: Building, color: colors.tertiary }
  ];

  // Filtrar casos según criterios
  useEffect(() => {
    let cases = engineeringCases;

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      cases = getCasesByCategory(selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      cases = searchCases(searchTerm);
    }

    // Ordenar casos
    cases = cases.sort((a, b) => {
      switch (sortBy) {
        case 'difficulty':
          return a.difficulty - b.difficulty;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'complexity':
          return a.complexity.localeCompare(b.complexity);
        default:
          return 0;
      }
    });

    setFilteredCases(cases);
  }, [selectedCategory, searchTerm, sortBy]);

  // Obtener estadísticas
  const stats = getCasesStats();

  // Función para resolver un caso
  const handleSolveCase = (engineeringCase: EngineeringCase) => {
    if (onSolveCase) {
      onSolveCase(engineeringCase);
      // onSolveCase ya maneja la navegación al solver
      // NO llamar onBack() aquí
    }
  };

  // Obtener icono por categoría
  const getCategoryIcon = (category: string) => {
    const categoryMap: Record<string, any> = {
      sistemas: Cpu,
      mecanica: Cog,
      industrial: Building,
      civil: Building
    };
    return categoryMap[category] || BookOpen;
  };

  // Obtener color por dificultad
  const getDifficultyColor = (difficulty: number) => {
    const colorMap: Record<number, string> = {
      1: colors.success,
      2: colors.info,
      3: colors.warning,
      4: colors.error,
      5: '#8B5CF6'
    };
    return colorMap[difficulty] || colors.neutral;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDark ? colors.dark : colors.bg,
      color: isDark ? colors.white : colors.neutral
    }}>
      {/* Header Neo Brutalism */}
      <div style={{
        padding: '1rem 2rem',
        background: colors.tertiary,
        border: `4px solid ${colors.neutral}`,
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
              background: colors.primary,
              border: `4px solid ${colors.neutral}`,
              borderRadius: '12px',
              color: colors.neutral,
              fontSize: '1.5rem',
              fontWeight: '900',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
            }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: colors.primary,
              border: `4px solid ${colors.neutral}`,
              borderRadius: '12px',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
            }}>
              <Building size={24} color={colors.neutral} />
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.75rem', 
              fontWeight: '900',
              color: colors.white,
              textTransform: 'uppercase',
              letterSpacing: '-0.025em',
              textShadow: '2px 2px 0 rgba(0,0,0,0.3)'
            }}>
              CASOS DE ESTUDIO - INGENIERÍA
            </h1>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          style={{
            background: colors.secondary,
            border: `4px solid ${colors.neutral}`,
            borderRadius: '12px',
            color: colors.neutral,
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            boxShadow: '0 4px 0 rgba(0,0,0,0.25)'
          }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '0 2rem 2rem' }}>
        {/* Estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: colors.primary + '20',
            border: `2px solid ${colors.primary}`,
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: colors.primary }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Casos Totales</div>
          </div>
          
          <div style={{
            background: colors.secondary + '20',
            border: `2px solid ${colors.secondary}`,
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: colors.secondary }}>
              {Object.keys(stats.categories).length}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Especialidades</div>
          </div>
          
          <div style={{
            background: colors.tertiary + '20',
            border: `2px solid ${colors.tertiary}`,
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: colors.tertiary }}>
              {stats.industries}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Industrias</div>
          </div>
        </div>

        {/* Controles de filtrado */}
        <div style={{
          background: isDark ? colors.tertiary : colors.white,
          border: `2px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Barra de búsqueda */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.text,
                  opacity: 0.6
                }}
              />
              <input
                type="text"
                placeholder="Buscar casos por título, industria o tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: colors.bg,
                  color: colors.text,
                  fontSize: '14px'
                }}
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '12px',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '14px'
              }}
            >
              <option value="difficulty">Por Dificultad</option>
              <option value="category">Por Categoría</option>
              <option value="complexity">Por Complejidad</option>
            </select>
          </div>

          {/* Categorías */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: isActive ? category.color : colors.bg,
                    color: isActive ? colors.white : colors.text,
                    border: `2px solid ${category.color}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  <Icon size={16} />
                  {category.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Lista de casos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1rem'
        }}>
          {filteredCases.map((engineeringCase) => {
            const CategoryIcon = getCategoryIcon(engineeringCase.category);
            
            return (
              <motion.div
                key={engineeringCase.id}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: isDark ? colors.tertiary : colors.white,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
                onClick={() => setSelectedCase(engineeringCase)}
              >
                {/* Header del caso */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    background: getDifficultyColor(engineeringCase.difficulty) + '20',
                    border: `2px solid ${getDifficultyColor(engineeringCase.difficulty)}`,
                    borderRadius: '6px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CategoryIcon size={16} color={getDifficultyColor(engineeringCase.difficulty)} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: colors.text,
                      marginBottom: '2px'
                    }}>
                      {engineeringCase.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.text,
                      opacity: 0.7,
                      textTransform: 'capitalize'
                    }}>
                      {engineeringCase.category.replace('_', ' ')} • {engineeringCase.industry}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    {Array.from({ length: engineeringCase.difficulty }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={getDifficultyColor(engineeringCase.difficulty)}
                        color={getDifficultyColor(engineeringCase.difficulty)}
                      />
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <p style={{
                  fontSize: '13px',
                  color: colors.text,
                  opacity: 0.8,
                  margin: '0 0 0.75rem 0',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {engineeringCase.problemStatement}
                </p>

                {/* Tags */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginBottom: '0.75rem'
                }}>
                  {engineeringCase.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 6px',
                        backgroundColor: colors.primary + '20',
                        color: colors.primary,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: colors.text,
                    opacity: 0.6
                  }}>
                    <Clock size={12} />
                    {engineeringCase.timeToSolve}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSolveCase(engineeringCase);
                    }}
                    style={{
                      background: colors.success,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Calculator size={12} />
                    RESOLVER
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal de detalle del caso */}
        <AnimatePresence>
          {selectedCase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
              }}
              onClick={() => setSelectedCase(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{
                  background: isDark ? colors.tertiary : colors.white,
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '800px',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  border: `4px solid ${colors.neutral}`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del modal */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: colors.text
                  }}>
                    {selectedCase.title}
                  </h2>
                  
                  <button
                    onClick={() => setSelectedCase(null)}
                    style={{
                      background: colors.error,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Contenido del caso */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Contexto */}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: colors.primary }}>
                      Contexto Real
                    </h3>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>
                      {selectedCase.realWorldContext}
                    </p>
                  </div>

                  {/* Problema */}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: colors.secondary }}>
                      Planteamiento del Problema
                    </h3>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>
                      {selectedCase.problemStatement}
                    </p>
                  </div>

                  {/* Función matemática */}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: colors.tertiary }}>
                      Función a Integrar
                    </h3>
                    <div style={{
                      background: colors.bg,
                      padding: '1rem',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '1.1rem',
                      border: `2px solid ${colors.border}`
                    }}>
                      f(x,y,z) = {selectedCase.function}
                    </div>
                  </div>

                  {/* Límites */}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: colors.info }}>
                      Límites de Integración
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <strong>X:</strong> [{selectedCase.limits.x[0]}, {selectedCase.limits.x[1]}]
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <strong>Y:</strong> [{selectedCase.limits.y[0]}, {selectedCase.limits.y[1]}]
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <strong>Z:</strong> [{selectedCase.limits.z[0]}, {selectedCase.limits.z[1]}]
                      </div>
                    </div>
                  </div>

                  {/* Aplicaciones */}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: colors.success }}>
                      Aplicaciones Industriales
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {selectedCase.applications.map((app, index) => (
                        <li key={index} style={{ marginBottom: '0.25rem' }}>
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botones de acción */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleSolveCase(selectedCase);
                        setSelectedCase(null);
                      }}
                      style={{
                        flex: 1,
                        background: colors.primary,
                        color: colors.neutral,
                        border: `2px solid ${colors.neutral}`,
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Calculator size={16} />
                      RESOLVER AHORA
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCase(null)}
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `2px solid ${colors.border}`,
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cerrar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CaseStudyScreen;

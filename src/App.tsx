import React, { useState, useEffect } from 'react';
import './neo-brutalism.css';
import { usePersistence, UserPreferences } from './services/persistence';
import HomeScreen from './components/HomeScreen';
import TheoryScreen from './components/TheoryScreen';
import SolverScreen from './components/SolverScreen';
import ExercisesScreen from './components/ExercisesScreen';
import HistoryScreen from './components/HistoryScreen';
import ImprovedVisualizationScreen from './components/ImprovedVisualizationScreen';
import SettingsScreen from './components/SettingsScreen';
import SplashScreen from './components/SplashScreen';
import CaseStudyScreen from './components/CaseStudyScreen';
import AITutorScreen from './components/AITutorScreen';
import ComparisonScreen from './components/ComparisonScreen';

export interface IntegralStep {
  step: number;
  description: string;
  equation: string;
  explanation: string;
}

export interface HistoryItem {
  id: string; // hash_timestamp
  function: string;
  limits: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  coordinateSystem: 'cartesian' | 'cylindrical' | 'spherical';
  result: {
    exact?: string;
    decimal: number;
    steps: IntegralStep[];
    method?: string;
    confidence?: number;
    analysis?: any;
    verification?: any;
    executionTime?: number;
  };
  timestamp: Date;
  calculationTime: number; // milliseconds
  tags: string[];
  isFavorite: boolean;
  viewCount: number;
  chatQuestions: number;
  metadata: {
    difficulty: number; // 1-5 stars
    jacobian?: string;
    transformations?: string[];
    method?: string;
    confidence?: number;
    analysis?: any;
  };
}

export interface Exercise {
  level: string;
  title: string;
  description: string;
  function: string;
  limits: {
    x: [number, number];
    y: [number, number];
    z: [number, number];
  };
  type: string;
  application: string;
}

const App = () => {
  // Sistema de persistencia avanzado
  const persistence = usePersistence();
  
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  
  // Cargar preferencias del usuario
  const [preferences, setPreferences] = useState<UserPreferences>(() => 
    persistence.loadPreferences()
  );
  
  const [isDark, setIsDark] = useState(preferences.theme === 'dark');
  const [precision, setPrecision] = useState(preferences.precision);
  
  // Cargar historial y sesión
  const [history, setHistory] = useState<HistoryItem[]>(() => 
    persistence.loadHistory()
  );
  
  const [prefilledExercise, setPrefilledExercise] = useState<Exercise | null>(null);
  const [integralVisualizationData, setIntegralVisualizationData] = useState<any>(null);
  const [currentIntegralContext, setCurrentIntegralContext] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'favorites' | 'cartesian' | 'cylindrical' | 'spherical'>('all');

  // Persistencia automática de preferencias
  useEffect(() => {
    const newPreferences: Partial<UserPreferences> = {
      theme: isDark ? 'dark' : 'light',
      precision: precision
    };
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    persistence.savePreferences(newPreferences);
  }, [isDark, precision]); // Removido persistence de dependencias

  // Persistencia automática del historial
  useEffect(() => {
    if (history.length > 0) {
      persistence.saveHistory(history);
    }
  }, [history]); // Removido persistence de dependencias

  // Guardar sesión actual
  useEffect(() => {
    const session = {
      currentScreen,
      sessionStartTime: Date.now()
    };
    persistence.saveSession(session);
  }, [currentScreen]); // Removido persistence de dependencias

  // Limpiar sesión al cerrar
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistence.clearSession();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // Array vacío para ejecutar solo una vez

  // Neo Brutalism Color System
  const colors = {
    // Paleta oficial INTEGRA
    primary: '#FFFD8F',     // Amarillo crema energético
    secondary: '#B0CE88',   // Verde lima suave
    tertiary: '#4C763B',    // Verde oscuro profesional
    dark: '#043915',        // Verde bosque profundo
    neutral: '#000000',     // Negro puro
    white: '#FFFFFF',       // Blanco puro
    
    // Mapeo para compatibilidad
    accent1: '#FFFD8F',
    accent2: '#B0CE88', 
    accent3: '#4C763B',
    accent4: '#043915',
    
    // Contextuales
    bg: isDark ? '#043915' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    border: '#000000',      // Siempre negro para Neo Brutalism
    hover: isDark ? '#4C763B' : '#FFFD8F',
    
    // Neo Brutalism specific
    stroke: '#000000',      // Bordes siempre negros
    shadow: 'rgba(0, 0, 0, 0.25)',
    
    // Estados
    success: '#B0CE88',
    warning: '#FFFD8F', 
    error: '#FF4444',
    info: '#4C763B'
  };

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => {
      const newHistory = [item, ...prev];
      return newHistory;
    });
    // La persistencia se maneja automáticamente en useEffect
    // No necesitamos llamar persistence.addToHistory aquí para evitar duplicación
  };

  const clearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
      setHistory([]);
      persistence.saveHistory([]);
    }
  };

  // Funciones del historial centralizado con persistencia
  const updateHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
    setHistory(prev => {
      const newHistory = prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      return newHistory;
    });
    // Actualizar también en persistencia
    persistence.updateHistoryItem(id, updates);
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    persistence.removeFromHistory(id);
  };

  const toggleFavorite = (id: string) => {
    const item = history.find(item => item.id === id);
    if (item) {
      updateHistoryItem(id, { 
        isFavorite: !item.isFavorite 
      });
    }
  };

  const incrementViewCount = (id: string) => {
    const item = history.find(item => item.id === id);
    if (item) {
      updateHistoryItem(id, { viewCount: item.viewCount + 1 });
    }
  };

  const incrementChatQuestions = (id: string) => {
    const item = history.find(item => item.id === id);
    if (item) {
      updateHistoryItem(id, { chatQuestions: item.chatQuestions + 1 });
    }
  };

  const addTagToHistory = (id: string, tag: string) => {
    const item = history.find(item => item.id === id);
    if (item && !item.tags.includes(tag)) {
      updateHistoryItem(id, { tags: [...item.tags, tag] });
    }
  };

  const removeTagFromHistory = (id: string, tag: string) => {
    const item = history.find(item => item.id === id);
    if (item) {
      updateHistoryItem(id, { tags: item.tags.filter(t => t !== tag) });
    }
  };

  const getAllTags = (): string[] => {
    const allTags = history.flatMap(item => item.tags);
    return [...new Set(allTags)].sort();
  };

  const getItemsByTag = (tag: string): HistoryItem[] => {
    return history.filter(item => item.tags.includes(tag));
  };

  const getFavorites = (): HistoryItem[] => {
    return history.filter(item => item.isFavorite);
  };

  const getPopularTags = (limit: number = 5): Array<{tag: string, count: number}> => {
    const tagCounts: Record<string, number> = {};
    history.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };

  // Función removeFromHistory ya definida arriba con persistencia

  const getFilteredHistory = () => {
    return history.filter(item => {
      switch (historyFilter) {
        case 'favorites':
          return item.isFavorite;
        case 'cartesian':
        case 'cylindrical':
        case 'spherical':
          return item.coordinateSystem === historyFilter;
        default:
          return true;
      }
    });
  };

  const setIntegralContext = (id: string | null) => {
    setCurrentIntegralContext(id);
    if (id) {
      incrementViewCount(id);
    }
  };

  const navigateTo = (screen: string, exercise?: Exercise) => {
    setCurrentScreen(screen);
    if (exercise) {
      setPrefilledExercise(exercise);
    } else if (screen !== 'solver') {
      // Limpiar prefilledExercise cuando no vamos al solver
      setPrefilledExercise(null);
    }
  };

  const handleVisualization = (integralData: any) => {
    // Guardar los datos de la integral para la visualización
    setIntegralVisualizationData(integralData);
    navigateTo('visualization');
  };

  const handleComparison = (integralId: string) => {
    setCurrentIntegralContext(integralId);
    navigateTo('comparison');
  };

  const handleChatWithContext = (integralId: string) => {
    setCurrentIntegralContext(integralId);
    incrementChatQuestions(integralId);
    navigateTo('aitutor');
  };

  const navigateToWithContext = (screen: string, integralId?: string) => {
    if (integralId) {
      setCurrentIntegralContext(integralId);
    }
    navigateTo(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'theory':
        return <TheoryScreen colors={colors} onBack={() => navigateTo('home')} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />;
      case 'solver':
        return (
          <SolverScreen
            colors={colors}
            onBack={() => navigateTo('home')}
            addToHistory={addToHistory}
            prefilledExercise={prefilledExercise}
            isDark={isDark}
            toggleTheme={() => setIsDark(!isDark)}
            onVisualize={handleVisualization}
            onCompare={handleComparison}
            onChatWithContext={handleChatWithContext}
          />
        );
      case 'exercises':
        return <ExercisesScreen colors={colors} onBack={() => navigateTo('home')} navigateToSolver={(exercise) => navigateTo('solver', exercise)} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />;
      case 'history':
        return (
          <HistoryScreen
            colors={colors}
            onBack={() => navigateTo('home')}
            history={history}
            clearHistory={clearHistory}
            isDark={isDark}
            toggleTheme={() => setIsDark(!isDark)}
            toggleFavorite={toggleFavorite}
            addTag={addTagToHistory}
            removeTag={removeTagFromHistory}
            getAllTags={getAllTags}
            getItemsByTag={getItemsByTag}
            getFavorites={getFavorites}
            getPopularTags={getPopularTags}
            removeFromHistory={removeFromHistory}
            onVisualize={handleVisualization}
            onCompare={handleComparison}
            onChatWithContext={handleChatWithContext}
          />
        );
      case 'visualization':
        return <ImprovedVisualizationScreen colors={colors} onBack={() => navigateTo('home')} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} integralData={integralVisualizationData} />;
      case 'casestudy':
        return (
          <CaseStudyScreen 
            colors={colors} 
            onBack={() => navigateTo('home')} 
            isDark={isDark} 
            toggleTheme={() => setIsDark(!isDark)}
            onSolveCase={(engineeringCase) => {
              console.log('🏗️ Caso seleccionado:', engineeringCase);
              // Convertir caso de ingeniería a formato Exercise
              const exercise = {
                level: `Nivel ${engineeringCase.difficulty}`,
                title: engineeringCase.title,
                description: engineeringCase.problemStatement,
                function: engineeringCase.function,
                limits: {
                  x: [parseFloat(engineeringCase.limits.x[0]), parseFloat(engineeringCase.limits.x[1])] as [number, number],
                  y: [parseFloat(engineeringCase.limits.y[0]), parseFloat(engineeringCase.limits.y[1])] as [number, number],
                  z: [parseFloat(engineeringCase.limits.z[0]), parseFloat(engineeringCase.limits.z[1])] as [number, number]
                },
                type: engineeringCase.coordinateSystem,
                application: engineeringCase.industry
              };
              console.log('📝 Exercise creado:', exercise);
              setPrefilledExercise(exercise);
              console.log('🚀 Navegando al solver...');
              navigateTo('solver');
            }}
          />
        );
      case 'aitutor':
        return (
          <AITutorScreen 
            colors={colors} 
            onBack={() => navigateTo('home')} 
            isDark={isDark} 
            toggleTheme={() => setIsDark(!isDark)}
            integralContext={currentIntegralContext}
            history={history}
            onClearContext={() => setCurrentIntegralContext(null)}
          />
        );
      case 'comparison':
        return (
          <ComparisonScreen
            colors={colors}
            onBack={() => navigateTo('home')}
            isDark={isDark}
            toggleTheme={() => setIsDark(!isDark)}
            integralId={currentIntegralContext}
            history={history}
            onSelectIntegral={setIntegralContext}
            onVisualize={handleVisualization}
            onOpenChat={handleChatWithContext}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            colors={colors}
            onBack={() => navigateTo('home')}
            isDark={isDark}
            toggleTheme={() => setIsDark(!isDark)}
            precision={precision}
            setPrecision={setPrecision}
          />
        );
      default:
        return <HomeScreen colors={colors} navigateTo={navigateTo} historyCount={history.length} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />;
    }
  };

  if (showSplash) {
    return <SplashScreen colors={colors} onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        color: colors.text,
        transition: 'all 0.3s'
      }}
    >
      {renderScreen()}
    </div>
  );
};

export default App;
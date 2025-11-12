// Sistema de Persistencia de Datos para INTEGRA
// Guarda y recupera todo el estado del usuario automáticamente

import { HistoryItem } from '../App';

interface UserPreferences {
  theme: 'light' | 'dark';
  precision: number;
  defaultCoordinateSystem: 'cartesian' | 'cylindrical' | 'spherical';
  defaultMethod: string;
  showLatexPreview: boolean;
  compactKeyboard: boolean;
  autoSave: boolean;
  language: 'es' | 'en';
}

interface UserSession {
  currentFunction: string;
  currentLimits: {
    x: [string, string];
    y: [string, string];
    z: [string, string];
  };
  selectedCoordinateSystem: string;
  selectedMethod: string;
  lastCalculation?: any;
  sessionStartTime: number;
  calculationsCount: number;
}

interface UserStats {
  totalCalculations: number;
  totalTimeSpent: number; // milliseconds
  favoriteMethod: string;
  mostUsedCoordinateSystem: string;
  averageCalculationTime: number;
  streakDays: number;
  lastActiveDate: string;
  achievementsUnlocked: string[];
}

class PersistenceManager {
  private readonly STORAGE_KEYS = {
    HISTORY: 'integra_history',
    PREFERENCES: 'integra_preferences',
    SESSION: 'integra_session',
    STATS: 'integra_stats',
    FAVORITES: 'integra_favorites',
    TAGS: 'integra_tags',
    BACKUP: 'integra_backup'
  };

  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAutoSave();
    this.performMaintenance();
  }

  // ==================== HISTORIAL ====================

  /**
   * Guardar historial completo
   */
  saveHistory(history: HistoryItem[]): void {
    try {
      const serializedHistory = JSON.stringify(history, this.dateReplacer);
      localStorage.setItem(this.STORAGE_KEYS.HISTORY, serializedHistory);
      
      // Crear backup automático cada 10 elementos
      if (history.length % 10 === 0) {
        this.createBackup();
      }
      
      console.log(`💾 Historial guardado: ${history.length} elementos`);
    } catch (error) {
      console.error('Error guardando historial:', error);
      this.handleStorageError(error);
    }
  }

  /**
   * Cargar historial completo
   */
  loadHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.HISTORY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored, this.dateReviver);
      console.log(`📂 Historial cargado: ${parsed.length} elementos`);
      return parsed;
    } catch (error) {
      console.error('Error cargando historial:', error);
      return this.tryRecoverFromBackup() || [];
    }
  }

  /**
   * Agregar elemento al historial
   */
  addToHistory(item: HistoryItem): void {
    const history = this.loadHistory();
    history.unshift(item); // Agregar al inicio
    
    // Limitar a 1000 elementos para rendimiento
    if (history.length > 1000) {
      history.splice(1000);
    }
    
    this.saveHistory(history);
    this.updateStats(item);
  }

  /**
   * Actualizar elemento del historial
   */
  updateHistoryItem(id: string, updates: Partial<HistoryItem>): void {
    const history = this.loadHistory();
    const index = history.findIndex(item => item.id === id);
    
    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      this.saveHistory(history);
    }
  }

  /**
   * Eliminar elemento del historial
   */
  removeFromHistory(id: string): void {
    const history = this.loadHistory();
    const filtered = history.filter(item => item.id !== id);
    this.saveHistory(filtered);
  }

  // ==================== PREFERENCIAS ====================

  /**
   * Guardar preferencias del usuario
   */
  savePreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.loadPreferences();
      const updated = { ...current, ...preferences };
      
      localStorage.setItem(this.STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
      console.log('⚙️ Preferencias guardadas:', Object.keys(preferences));
    } catch (error) {
      console.error('Error guardando preferencias:', error);
    }
  }

  /**
   * Cargar preferencias del usuario
   */
  loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES);
      if (!stored) return this.getDefaultPreferences();
      
      const parsed = JSON.parse(stored);
      return { ...this.getDefaultPreferences(), ...parsed };
    } catch (error) {
      console.error('Error cargando preferencias:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Preferencias por defecto
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      precision: 4,
      defaultCoordinateSystem: 'cartesian',
      defaultMethod: 'auto',
      showLatexPreview: true,
      compactKeyboard: false,
      autoSave: true,
      language: 'es'
    };
  }

  // ==================== SESIÓN ====================

  /**
   * Guardar estado de la sesión actual
   */
  saveSession(session: Partial<UserSession>): void {
    try {
      const current = this.loadSession();
      const updated = { ...current, ...session };
      
      localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(updated));
    } catch (error) {
      console.error('Error guardando sesión:', error);
    }
  }

  /**
   * Cargar estado de la sesión
   */
  loadSession(): UserSession {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SESSION);
      if (!stored) return this.getDefaultSession();
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error cargando sesión:', error);
      return this.getDefaultSession();
    }
  }

  /**
   * Sesión por defecto
   */
  private getDefaultSession(): UserSession {
    return {
      currentFunction: '',
      currentLimits: {
        x: ['0', '1'],
        y: ['0', '1'],
        z: ['0', '1']
      },
      selectedCoordinateSystem: 'cartesian',
      selectedMethod: 'auto',
      sessionStartTime: Date.now(),
      calculationsCount: 0
    };
  }

  /**
   * Limpiar sesión (al cerrar la app)
   */
  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEYS.SESSION);
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Actualizar estadísticas del usuario
   */
  private updateStats(item: HistoryItem): void {
    const stats = this.loadStats();
    
    stats.totalCalculations++;
    stats.totalTimeSpent += item.calculationTime;
    stats.averageCalculationTime = stats.totalTimeSpent / stats.totalCalculations;
    stats.lastActiveDate = new Date().toISOString().split('T')[0];
    
    // Actualizar método favorito
    const history = this.loadHistory();
    const methodCounts = history.reduce((acc, h) => {
      const method = h.result.method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    stats.favoriteMethod = Object.keys(methodCounts).reduce((a, b) => 
      methodCounts[a] > methodCounts[b] ? a : b, 'auto');
    
    // Actualizar sistema más usado
    const systemCounts = history.reduce((acc, h) => {
      acc[h.coordinateSystem] = (acc[h.coordinateSystem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    stats.mostUsedCoordinateSystem = Object.keys(systemCounts).reduce((a, b) => 
      systemCounts[a] > systemCounts[b] ? a : b, 'cartesian');
    
    // Calcular racha de días
    this.updateStreak(stats);
    
    this.saveStats(stats);
  }

  /**
   * Cargar estadísticas
   */
  loadStats(): UserStats {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.STATS);
      if (!stored) return this.getDefaultStats();
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Guardar estadísticas
   */
  private saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error guardando estadísticas:', error);
    }
  }

  /**
   * Estadísticas por defecto
   */
  private getDefaultStats(): UserStats {
    return {
      totalCalculations: 0,
      totalTimeSpent: 0,
      favoriteMethod: 'auto',
      mostUsedCoordinateSystem: 'cartesian',
      averageCalculationTime: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      achievementsUnlocked: []
    };
  }

  /**
   * Actualizar racha de días consecutivos
   */
  private updateStreak(stats: UserStats): void {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (stats.lastActiveDate === yesterday) {
      stats.streakDays++;
    } else if (stats.lastActiveDate !== today) {
      stats.streakDays = 1;
    }
  }

  // ==================== FAVORITOS Y TAGS ====================

  /**
   * Guardar favoritos
   */
  saveFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error guardando favoritos:', error);
    }
  }

  /**
   * Cargar favoritos
   */
  loadFavorites(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      return [];
    }
  }

  /**
   * Guardar tags
   */
  saveTags(tags: Record<string, string[]>): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.TAGS, JSON.stringify(tags));
    } catch (error) {
      console.error('Error guardando tags:', error);
    }
  }

  /**
   * Cargar tags
   */
  loadTags(): Record<string, string[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.TAGS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error cargando tags:', error);
      return {};
    }
  }

  // ==================== BACKUP Y RECUPERACIÓN ====================

  /**
   * Crear backup completo
   */
  createBackup(): void {
    try {
      const backup = {
        timestamp: Date.now(),
        history: this.loadHistory(),
        preferences: this.loadPreferences(),
        stats: this.loadStats(),
        favorites: this.loadFavorites(),
        tags: this.loadTags(),
        version: '1.0.0'
      };
      
      localStorage.setItem(this.STORAGE_KEYS.BACKUP, JSON.stringify(backup, this.dateReplacer));
      console.log('💾 Backup creado exitosamente');
    } catch (error) {
      console.error('Error creando backup:', error);
    }
  }

  /**
   * Restaurar desde backup
   */
  restoreFromBackup(): boolean {
    try {
      const backup = this.tryRecoverFromBackup();
      if (!backup) return false;
      
      // Restaurar todos los datos
      this.saveHistory(backup.history || []);
      this.savePreferences(backup.preferences || {});
      this.saveStats(backup.stats || this.getDefaultStats());
      this.saveFavorites(backup.favorites || []);
      this.saveTags(backup.tags || {});
      
      console.log('🔄 Datos restaurados desde backup');
      return true;
    } catch (error) {
      console.error('Error restaurando backup:', error);
      return false;
    }
  }

  /**
   * Intentar recuperar desde backup
   */
  private tryRecoverFromBackup(): any {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.BACKUP);
      if (!stored) return null;
      
      return JSON.parse(stored, this.dateReviver);
    } catch (error) {
      console.error('Error recuperando backup:', error);
      return null;
    }
  }

  /**
   * Exportar datos para descarga
   */
  exportData(): string {
    const data = {
      exportDate: new Date().toISOString(),
      history: this.loadHistory(),
      preferences: this.loadPreferences(),
      stats: this.loadStats(),
      favorites: this.loadFavorites(),
      tags: this.loadTags(),
      version: '1.0.0'
    };
    
    return JSON.stringify(data, this.dateReplacer, 2);
  }

  /**
   * Importar datos desde archivo
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData, this.dateReviver);
      
      // Validar estructura
      if (!data.version || !data.exportDate) {
        throw new Error('Formato de archivo inválido');
      }
      
      // Importar datos
      if (data.history) this.saveHistory(data.history);
      if (data.preferences) this.savePreferences(data.preferences);
      if (data.stats) this.saveStats(data.stats);
      if (data.favorites) this.saveFavorites(data.favorites);
      if (data.tags) this.saveTags(data.tags);
      
      console.log('📥 Datos importados exitosamente');
      return true;
    } catch (error) {
      console.error('Error importando datos:', error);
      return false;
    }
  }

  // ==================== AUTO-GUARDADO ====================

  /**
   * Inicializar auto-guardado
   */
  private initializeAutoSave(): void {
    const preferences = this.loadPreferences();
    
    if (preferences.autoSave) {
      this.autoSaveInterval = setInterval(() => {
        this.createBackup();
      }, 5 * 60 * 1000); // Cada 5 minutos
    }
  }

  /**
   * Detener auto-guardado
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // ==================== MANTENIMIENTO ====================

  /**
   * Realizar mantenimiento de datos
   */
  private performMaintenance(): void {
    try {
      // Limpiar datos antiguos (más de 6 meses)
      const history = this.loadHistory();
      const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
      
      const cleaned = history.filter(item => {
        try {
          // Asegurar que timestamp es un objeto Date válido
          const timestamp = item.timestamp instanceof Date 
            ? item.timestamp 
            : new Date(item.timestamp);
          
          return timestamp.getTime() > sixMonthsAgo;
        } catch (error) {
          // Si no se puede convertir a fecha, mantener el elemento
          console.warn('Elemento con timestamp inválido:', item.id);
          return true;
        }
      });
      
      if (cleaned.length !== history.length) {
        this.saveHistory(cleaned);
        console.log(`🧹 Limpieza: ${history.length - cleaned.length} elementos antiguos eliminados`);
      }
      
      // Verificar integridad de datos
      this.verifyDataIntegrity();
      
    } catch (error) {
      console.error('Error en mantenimiento:', error);
    }
  }

  /**
   * Verificar integridad de datos
   */
  private verifyDataIntegrity(): void {
    const history = this.loadHistory();
    const preferences = this.loadPreferences();
    const stats = this.loadStats();
    
    // Verificar que todos los elementos del historial tengan ID único
    const ids = new Set();
    const duplicates = history.filter(item => {
      if (ids.has(item.id)) return true;
      ids.add(item.id);
      return false;
    });
    
    if (duplicates.length > 0) {
      console.warn(`⚠️ ${duplicates.length} elementos duplicados encontrados en historial`);
    }
    
    console.log('✅ Verificación de integridad completada');
  }

  /**
   * Manejar errores de almacenamiento
   */
  private handleStorageError(error: any): void {
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ Cuota de almacenamiento excedida, limpiando datos antiguos...');
      this.performMaintenance();
    }
  }

  /**
   * Obtener información de almacenamiento
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      
      // Calcular espacio usado
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }
      
      // Estimar espacio disponible (5MB típico)
      const available = 5 * 1024 * 1024; // 5MB
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Replacer para serializar fechas
   */
  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  /**
   * Reviver para deserializar fechas
   */
  private dateReviver(key: string, value: any): any {
    // Manejar formato específico con __type
    if (value && value.__type === 'Date') {
      return new Date(value.value);
    }
    
    // Manejar campos que sabemos que son fechas
    if (key === 'timestamp' && typeof value === 'string') {
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? new Date() : date;
      } catch (error) {
        return new Date();
      }
    }
    
    return value;
  }

  /**
   * Limpiar todos los datos
   */
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Todos los datos eliminados');
  }
}

// Instancia singleton
export const persistenceManager = new PersistenceManager();

// Hooks de React para usar la persistencia
export const usePersistence = () => {
  return {
    // Historial
    saveHistory: (history: HistoryItem[]) => persistenceManager.saveHistory(history),
    loadHistory: () => persistenceManager.loadHistory(),
    addToHistory: (item: HistoryItem) => persistenceManager.addToHistory(item),
    updateHistoryItem: (id: string, updates: Partial<HistoryItem>) => 
      persistenceManager.updateHistoryItem(id, updates),
    removeFromHistory: (id: string) => persistenceManager.removeFromHistory(id),
    
    // Preferencias
    savePreferences: (prefs: Partial<UserPreferences>) => 
      persistenceManager.savePreferences(prefs),
    loadPreferences: () => persistenceManager.loadPreferences(),
    
    // Sesión
    saveSession: (session: Partial<UserSession>) => persistenceManager.saveSession(session),
    loadSession: () => persistenceManager.loadSession(),
    clearSession: () => persistenceManager.clearSession(),
    
    // Estadísticas
    loadStats: () => persistenceManager.loadStats(),
    
    // Backup
    createBackup: () => persistenceManager.createBackup(),
    restoreFromBackup: () => persistenceManager.restoreFromBackup(),
    exportData: () => persistenceManager.exportData(),
    importData: (data: string) => persistenceManager.importData(data),
    
    // Información
    getStorageInfo: () => persistenceManager.getStorageInfo(),
    clearAllData: () => persistenceManager.clearAllData()
  };
};

export type { UserPreferences, UserSession, UserStats };

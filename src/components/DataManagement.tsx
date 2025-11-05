import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Database,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { usePersistence, UserStats } from '../services/persistence';

interface DataManagementProps {
  colors: any;
  isDark: boolean;
}

const DataManagement: React.FC<DataManagementProps> = ({ colors, isDark }) => {
  const persistence = usePersistence();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Cargar estadísticas y información de almacenamiento
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(persistence.loadStats());
    setStorageInfo(persistence.getStorageInfo());
  };

  // Mostrar notificación temporal
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Exportar datos
  const handleExport = () => {
    try {
      const data = persistence.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `integra-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Datos exportados exitosamente');
    } catch (error) {
      showNotification('error', 'Error al exportar datos');
    }
  };

  // Importar datos
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = persistence.importData(data);
        
        if (success) {
          showNotification('success', 'Datos importados exitosamente');
          loadData();
          // Recargar página para aplicar cambios
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showNotification('error', 'Error: formato de archivo inválido');
        }
      } catch (error) {
        showNotification('error', 'Error al leer el archivo');
      }
    };
    reader.readAsText(file);
    
    // Limpiar input
    event.target.value = '';
  };

  // Crear backup
  const handleBackup = () => {
    try {
      persistence.createBackup();
      showNotification('success', 'Backup creado exitosamente');
      loadData();
    } catch (error) {
      showNotification('error', 'Error al crear backup');
    }
  };

  // Restaurar desde backup
  const handleRestore = () => {
    setShowConfirmDialog('restore');
  };

  // Limpiar todos los datos
  const handleClearAll = () => {
    setShowConfirmDialog('clear');
  };

  // Confirmar acción
  const confirmAction = (action: string) => {
    try {
      if (action === 'restore') {
        const success = persistence.restoreFromBackup();
        if (success) {
          showNotification('success', 'Datos restaurados desde backup');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showNotification('error', 'No se encontró backup válido');
        }
      } else if (action === 'clear') {
        persistence.clearAllData();
        showNotification('success', 'Todos los datos eliminados');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      showNotification('error', 'Error al ejecutar la acción');
    }
    
    setShowConfirmDialog(null);
  };

  // Formatear bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear tiempo
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Notificación */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '12px 16px',
            backgroundColor: notification.type === 'success' ? colors.success :
                            notification.type === 'error' ? colors.error : colors.info,
            color: colors.white,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {notification.type === 'success' && <CheckCircle size={20} />}
          {notification.type === 'error' && <AlertTriangle size={20} />}
          {notification.type === 'info' && <Info size={20} />}
          {notification.message}
        </motion.div>
      )}

      {/* Diálogo de confirmación */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: colors.bg,
            padding: '24px',
            borderRadius: '12px',
            border: `4px solid ${colors.neutral}`,
            boxShadow: '0 8px 0 rgba(0,0,0,0.25)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={24} color={colors.warning} />
              <h3 style={{ margin: 0, color: colors.text }}>
                {showConfirmDialog === 'restore' ? 'Restaurar Backup' : 'Eliminar Todos los Datos'}
              </h3>
            </div>
            
            <p style={{ margin: '0 0 20px 0', color: colors.text }}>
              {showConfirmDialog === 'restore' 
                ? '¿Estás seguro de que quieres restaurar desde el backup? Esto sobrescribirá todos los datos actuales.'
                : '¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.'
              }
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmDialog(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmAction(showConfirmDialog)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.error,
                  border: `2px solid ${colors.error}`,
                  borderRadius: '8px',
                  color: colors.white,
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: 900,
        color: colors.tertiary,
        textTransform: 'uppercase'
      }}>
        Gestión de Datos
      </h2>

      {/* Estadísticas del usuario */}
      {stats && (
        <div style={{
          backgroundColor: colors.primary + '20',
          border: `2px solid ${colors.primary}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: colors.tertiary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Database size={20} />
            Estadísticas de Uso
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: colors.tertiary }}>
                {stats.totalCalculations}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Integrales calculadas</div>
            </div>
            
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: colors.tertiary }}>
                {formatTime(stats.totalTimeSpent)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Tiempo total de uso</div>
            </div>
            
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: colors.tertiary }}>
                {stats.streakDays}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Días consecutivos</div>
            </div>
            
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: colors.tertiary }}>
                {stats.favoriteMethod.replace('_', ' ').toUpperCase()}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Método favorito</div>
            </div>
          </div>
        </div>
      )}

      {/* Información de almacenamiento */}
      <div style={{
        backgroundColor: colors.info + '20',
        border: `2px solid ${colors.info}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: 700,
          color: colors.tertiary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <HardDrive size={20} />
          Almacenamiento Local
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '12px'
        }}>
          <div style={{
            flex: 1,
            height: '8px',
            backgroundColor: colors.bg,
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(storageInfo.percentage, 100)}%`,
              height: '100%',
              backgroundColor: storageInfo.percentage > 80 ? colors.error : 
                             storageInfo.percentage > 60 ? colors.warning : colors.success,
              transition: 'width 0.3s'
            }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            {storageInfo.percentage.toFixed(1)}%
          </span>
        </div>
        
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Usado: {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}
        </div>
      </div>

      {/* Acciones de gestión de datos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {/* Exportar datos */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          style={{
            padding: '20px',
            backgroundColor: colors.success + '20',
            border: `2px solid ${colors.success}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center'
          }}
        >
          <Download size={32} color={colors.success} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.success }}>
              Exportar Datos
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              Descargar backup completo en formato JSON
            </div>
          </div>
        </motion.button>

        {/* Importar datos */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '20px',
            backgroundColor: colors.info + '20',
            border: `2px solid ${colors.info}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center'
          }}
        >
          <Upload size={32} color={colors.info} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.info }}>
              Importar Datos
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              Cargar backup desde archivo JSON
            </div>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </motion.label>

        {/* Crear backup */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBackup}
          style={{
            padding: '20px',
            backgroundColor: colors.primary + '20',
            border: `2px solid ${colors.primary}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center'
          }}
        >
          <FileText size={32} color={colors.primary} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.primary }}>
              Crear Backup
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              Guardar copia de seguridad local
            </div>
          </div>
        </motion.button>

        {/* Restaurar backup */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRestore}
          style={{
            padding: '20px',
            backgroundColor: colors.warning + '20',
            border: `2px solid ${colors.warning}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center'
          }}
        >
          <RefreshCw size={32} color={colors.warning} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.warning }}>
              Restaurar Backup
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              Recuperar desde backup local
            </div>
          </div>
        </motion.button>

        {/* Limpiar todos los datos */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClearAll}
          style={{
            padding: '20px',
            backgroundColor: colors.error + '20',
            border: `2px solid ${colors.error}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center'
          }}
        >
          <Trash2 size={32} color={colors.error} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.error }}>
              Eliminar Todo
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              Borrar todos los datos permanentemente
            </div>
          </div>
        </motion.button>

        {/* Configuración avanzada */}
        <motion.div
          style={{
            padding: '20px',
            backgroundColor: colors.tertiary + '20',
            border: `2px solid ${colors.tertiary}`,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center'
          }}
        >
          <Settings size={32} color={colors.tertiary} />
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.tertiary }}>
              Auto-guardado
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
              Backup automático cada 5 minutos
            </div>
            <div style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: colors.success,
              color: colors.white,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              ACTIVO
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataManagement;

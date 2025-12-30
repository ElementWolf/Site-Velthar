import { useEffect, useState } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';
import Toast from '../Toast';

const BADGE_INFO = {
  sinLogica: [
    { key: 'estudiante_puntual', label: 'Estudiante Puntual' },
    { key: 'companero_solidario', label: 'Compañero Solidario' },
    { key: 'proyecto_creativo', label: 'Proyecto Creativo' },
    { key: 'perseverancia', label: 'Perseverancia' },
    { key: 'estrella_participacion', label: 'Estrella de Participación' },
    { key: 'campeon_lectura', label: 'Campeón de Lectura' },
    { key: 'lider_equipo', label: 'Líder de Equipo' },
    { key: 'actitud_positiva', label: 'Actitud Positiva' },
  ],
  conLogica: [
    { key: 'primer_canje', label: 'Primer Canje', desc: 'Se asigna automáticamente al primer canje.' },
    { key: 'cinco_canjes', label: '5 Canjes', desc: 'Se asigna automáticamente al llegar a 5 canjes.' },
    { key: 'diez_canjes', label: '10 Canjes', desc: 'Se asigna automáticamente al llegar a 10 canjes.' },
    { key: 'top_del_mes', label: 'Top del Mes', desc: 'Se asigna automáticamente al estudiante con más puntos al final del mes.' },
  ]
};

export default function AdminExtraTools() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [msgSuccess, setMsgSuccess] = useState('');
  const [badges, setBadges] = useState([
    { key: 'firstExchange', label: 'Primer Canje' },
    { key: 'fiveExchanges', label: '5 Canjes' },
    { key: 'tenExchanges', label: '10 Canjes' },
    { key: 'topStudent', label: 'Top del Mes' },
  ]);
  const [logSuccess, setLogSuccess] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [topStudent, setTopStudent] = useState(null);
  const [showTopToast, setShowTopToast] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [badgesByUser, setBadgesByUser] = useState({});
  
  // Estados para CRUD de insignias personalizadas
  const [customBadges, setCustomBadges] = useState([]);
  const [newBadge, setNewBadge] = useState({ key: '', label: '' });
  const [editingBadge, setEditingBadge] = useState(null);
  const [badgeFormSuccess, setBadgeFormSuccess] = useState('');
  const [showAssignSection, setShowAssignSection] = useState(false);
  
  // Estados para limpiar historial
  const [historyInfo, setHistoryInfo] = useState(null);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [selectedClearType, setSelectedClearType] = useState('all');
  const [clearConfirmation, setClearConfirmation] = useState('');
  const [clearLoading, setClearLoading] = useState(false);

  // Estados para la configuración de puntos por defecto
  const [defaultPoints, setDefaultPoints] = useState(10); // Valor actual configurado
  const [newDefaultPoints, setNewDefaultPoints] = useState(10); // Valor que se está editando
  const [pointsLoading, setPointsLoading] = useState(false); // Estado de carga durante actualización
  const [pointsSuccess, setPointsSuccess] = useState(''); // Mensaje de éxito

  // Cargar logs reales
  useEffect(() => {
    api.get('/api/admin/audit-logs').then(res => {
      setLogs(res.data || []);
      setLoading(false);
      setLogSuccess('Logs actualizados');
      setTimeout(() => setLogSuccess(''), 1500);
    });
    // Cargar anuncios reales
    api.get('/api/admin/announcement').then(res => {
      setAnnouncements(res.data || []);
      setAnnLoading(false);
    });
    // Obtener ranking para mostrar el top student
    api.get('/api/admin/audit-stats').then(res => {
      if (res.data && res.data.ranking && res.data.ranking.length > 0) {
        setTopStudent(res.data.ranking[0]);
      }
    });
    // Cargar estudiantes para asignación de insignias
    api.get('/api/admin/students').then(res => {
      setStudents(res.data.users || []);
    });
    api.get('/api/admin/badges').then(res => {
      setBadgesByUser(res.data || {});
    });
    // Cargar configuración actual de puntos por defecto
    api.get('/api/admin/default-points').then(res => {
      if (res.data && res.data.success) {
        // Actualizar tanto el estado actual como el estado de edición
        setDefaultPoints(res.data.defaultPoints);
        setNewDefaultPoints(res.data.defaultPoints);
      }
    });
  }, []);

  const [sendingMessage, setSendingMessage] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSendingMessage(true);
    try {
      await api.post('/api/admin/announcement', { message });
      setMsgSuccess('✅ Mensaje enviado a todos los estudiantes');
      setMessage('');
      // Refrescar anuncios
      const res = await api.get('/api/admin/announcement');
      setAnnouncements(res.data || []);
      setTimeout(() => setMsgSuccess(''), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage('❌ Error al enviar mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.delete('/api/admin/announcement', { data: { id } });
      // Refrescar anuncios
      const res = await api.get('/api/admin/announcement');
      setAnnouncements(res.data || []);
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleAssignTopStudent = async () => {
    await api.post('/api/cron/assign-top-student');
    setLogSuccess('Insignia Top del Mes asignada');
    setShowTopToast(true);
    // Forzar refresco de ranking y badges
    setTimeout(() => {
      window.dispatchEvent(new Event('saldo:refresh'));
      // Si tienes un método global para refrescar el ranking, puedes llamarlo aquí
    }, 500);
    setTimeout(() => setShowTopToast(false), 3000);
    setTimeout(() => setLogSuccess(''), 2000);
  };
  const handleAssignBadgeToStudent = async (userId, badgeKey) => {
    await api.post('/api/admin/badges', { userId, badge: badgeKey });
    setAssignSuccess('Insignia asignada correctamente');
    setShowTopToast(true);
    setTimeout(() => setShowTopToast(false), 3000);
  };
  const handleRemoveBadgeFromStudent = async (userId, badgeKey) => {
    await api.delete('/api/admin/badges', { data: { userId, badge: badgeKey } });
    setAssignSuccess('Insignia eliminada correctamente');
    setShowTopToast(true);
    setTimeout(() => setShowTopToast(false), 3000);
    // Refrescar insignias del usuario
    const res = await api.get('/api/admin/badges');
    setBadgesByUser(res.data || {});
  };

  // Funciones CRUD para insignias personalizadas
  const handleCreateBadge = () => {
    if (!newBadge.key.trim() || !newBadge.label.trim()) {
      setBadgeFormSuccess('⚠️ Por favor completa todos los campos');
      setTimeout(() => setBadgeFormSuccess(''), 3000);
      return;
    }
    
    // Verificar que no exista ya
    const allBadges = [...BADGE_INFO.sinLogica, ...customBadges];
    if (allBadges.find(b => b.key === newBadge.key)) {
      setBadgeFormSuccess('⚠️ Ya existe una insignia con esa clave');
      setTimeout(() => setBadgeFormSuccess(''), 3000);
      return;
    }
    
    setCustomBadges([...customBadges, { ...newBadge }]);
    setNewBadge({ key: '', label: '' });
    setBadgeFormSuccess('✅ Insignia creada exitosamente');
    setTimeout(() => setBadgeFormSuccess(''), 3000);
  };

  const handleEditBadge = (badge) => {
    setEditingBadge(badge);
    setNewBadge({ key: badge.key, label: badge.label });
  };

  const handleUpdateBadge = () => {
    if (!newBadge.label.trim()) {
      setBadgeFormSuccess('⚠️ El nombre no puede estar vacío');
      setTimeout(() => setBadgeFormSuccess(''), 3000);
      return;
    }
    
    setCustomBadges(customBadges.map(b => 
      b.key === editingBadge.key ? { ...b, label: newBadge.label } : b
    ));
    setEditingBadge(null);
    setNewBadge({ key: '', label: '' });
    setBadgeFormSuccess('✅ Insignia actualizada exitosamente');
    setTimeout(() => setBadgeFormSuccess(''), 3000);
  };

  const handleDeleteBadge = (key) => {
    if (confirm('¿Estás seguro de eliminar esta insignia? Los estudiantes que la tengan la perderán.')) {
      setCustomBadges(customBadges.filter(b => b.key !== key));
      setBadgeFormSuccess('✅ Insignia eliminada exitosamente');
      setTimeout(() => setBadgeFormSuccess(''), 3000);
    }
  };

  const cancelEdit = () => {
    setEditingBadge(null);
    setNewBadge({ key: '', label: '' });
  };

  // Funciones para limpiar historial
  const fetchHistoryInfo = async () => {
    try {
      const response = await api.get('/api/admin/clear-history');
      setHistoryInfo(response.data.historyInfo);
    } catch (error) {
      console.error('Error fetching history info:', error);
      setMessage('Error al obtener información del historial');
    }
  };

  const handleClearHistory = async () => {
    if (clearConfirmation !== 'CONFIRMAR_LIMPIEZA') {
      setMessage('Debes escribir "CONFIRMAR_LIMPIEZA" para proceder');
      return;
    }

    setClearLoading(true);
    try {
      const response = await api.post('/api/admin/clear-history', {
        clearType: selectedClearType,
        confirmation: clearConfirmation
      });
      
      setMessage(`✅ ${response.data.message}. Se limpiaron ${response.data.clearedCount} elementos.`);
      setShowClearHistoryModal(false);
      setClearConfirmation('');
      fetchHistoryInfo(); // Actualizar información
    } catch (error) {
      console.error('Error clearing history:', error);
      setMessage('Error al limpiar historial: ' + (error.response?.data?.error || error.message));
    } finally {
      setClearLoading(false);
    }
  };

  const openClearHistoryModal = () => {
    fetchHistoryInfo();
    setShowClearHistoryModal(true);
  };

  /**
   * Función para actualizar los puntos por defecto para nuevos usuarios
   * Valida que el valor sea válido y hace la petición al servidor
   * Actualiza el estado local y muestra mensajes de éxito/error
   */
  const handleUpdateDefaultPoints = async () => {
    // Validar que los puntos no sean negativos
    if (newDefaultPoints < 0) {
      setMessage('Los puntos por defecto deben ser mayor o igual a 0');
      return;
    }
    
    setPointsLoading(true);
    try {
      // Enviar petición POST al endpoint de configuración
      const response = await api.post('/api/admin/default-points', {
        points: newDefaultPoints
      });
      
      // Si la respuesta es exitosa, actualizar el estado local
      if (response.data && response.data.success) {
        setDefaultPoints(newDefaultPoints);
        setPointsSuccess(`Puntos por defecto actualizados a ${newDefaultPoints} MB`);
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setPointsSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating default points:', error);
      // Mostrar mensaje de error al usuario
      setMessage('Error al actualizar puntos por defecto: ' + (error.response?.data?.error || error.message));
    } finally {
      setPointsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
      <h2 className="text-xl font-bold text-[#3465B4] mb-4">Panel de Auditoría</h2>
      {loading ? <LoadingSpinner /> : (
        <div className="mb-6 max-h-48 overflow-y-auto bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-4">
          {logs.length === 0 ? (
            <div className="text-gray-400">No hay logs de auditoría recientes.</div>
          ) : logs.map((log, idx) => (
            <div key={idx} className="text-sm text-gray-700 border-b border-[#F3F4F6] py-2 last:border-b-0">{log.action} - {log.user} {log.details && `(${log.details})`} <span className="text-gray-400">{new Date(log.date).toLocaleString()}</span></div>
          ))}
        </div>
      )}
      {logSuccess && <div className="text-[#3465B4] mb-2 animate-pulse font-medium">{logSuccess}</div>}
      
      <h2 className="text-xl font-bold text-[#3465B4] mb-4 mt-8 flex items-center gap-2">
        <span>📢</span>
        Mensajes o Anuncios
        {announcements.length > 0 && (
          <span className="ml-2 bg-[#C62B34] text-white text-xs font-bold px-2 py-1 rounded-full">
            {announcements.length}
          </span>
        )}
      </h2>
      
      {/* Formulario para enviar mensajes */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
        <label className="block text-sm font-semibold text-[#3465B4] mb-2">
          Escribe un mensaje para todos los estudiantes:
        </label>
        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C62B34] transition-all resize-none"
            placeholder="Ej: Recuerden que mañana es el examen final. ¡Buena suerte! 📚"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows="2"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={sendingMessage || !message.trim()}
            className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white font-bold px-6 py-3 rounded-lg transition-all shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:min-w-[10rem]"
          >
            {sendingMessage && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {sendingMessage ? 'Enviando...' : '📨 Enviar'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">💡 Tip: Presiona Ctrl+Enter para enviar rápidamente</p>
      </div>

      {msgSuccess && (
        <div className="mb-4 bg-green-100 border-2 border-green-300 text-green-700 rounded-xl px-4 py-3 font-medium animate-slide-up-fade flex items-center gap-2">
          <span className="text-xl">✅</span>
          {msgSuccess}
        </div>
      )}

      {/* Lista de anuncios */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-[#3465B4] mb-3 flex items-center gap-2">
          <span>📋</span>
          Anuncios Publicados
        </h3>
        {annLoading ? (
          <LoadingSpinner />
        ) : announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📭</div>
            <p>No hay anuncios publicados</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {announcements.map((announcement, idx) => (
              <div
                key={announcement.id || idx}
                className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">💬</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium mb-2 break-words">{announcement.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📅 {new Date(announcement.date).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  {announcement.id && (
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                      title="Eliminar anuncio"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Sección de Configuración de Puntos por Defecto */}
      <h2 className="text-xl font-bold text-[#3465B4] mb-4 mt-8">Configuración de Puntos por Defecto</h2>
      <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            {/* Etiqueta descriptiva */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntos por defecto para nuevos usuarios:
            </label>
            {/* Input numérico para configurar los puntos */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                className="border-2 border-gray-200 rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-[#C62B34] transition-all"
                value={newDefaultPoints}
                onChange={e => setNewDefaultPoints(Number(e.target.value))}
                placeholder="10"
              />
              <span className="text-gray-600 font-medium">MB</span>
            </div>
            {/* Texto explicativo */}
            <p className="text-xs text-gray-500 mt-1">
              Los nuevos usuarios recibirán estos puntos automáticamente al ser aprobados.
            </p>
          </div>
          {/* Botón para actualizar la configuración */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleUpdateDefaultPoints}
              disabled={pointsLoading || newDefaultPoints === defaultPoints}
              className="bg-gradient-to-r from-[#3465B4] to-[#2a4f8f] hover:from-[#2a4f8f] hover:to-[#1e3a6b] text-white font-bold px-4 py-2 rounded-lg transition-all shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[8.75rem]"
            >
              {pointsLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {pointsLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        {/* Mensaje de éxito cuando se actualiza la configuración */}
        {pointsSuccess && (
          <div className="mt-3 text-green-600 font-medium animate-pulse">{pointsSuccess}</div>
        )}
        {/* Panel que muestra el valor actual configurado */}
        <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Valor actual:</strong> {defaultPoints} MB por defecto
          </p>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-[#C62B34] mb-6 mt-8 text-center flex items-center justify-center gap-2">
        <span>🏅</span>
        Catálogo de Insignias
      </h2>
      
      {/* Formulario para Crear/Editar Insignias */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-[#3465B4] mb-4 flex items-center gap-2">
          <span>✏️</span>
          {editingBadge ? 'Editar Insignia Manual' : 'Crear Nueva Insignia Manual'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Clave única (sin espacios):</label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#C62B34] transition-all"
              placeholder="ej: mejor_estudiante"
              value={newBadge.key}
              onChange={e => setNewBadge({ ...newBadge, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              disabled={editingBadge !== null}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre visible:</label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#C62B34] transition-all"
              placeholder="ej: Mejor Estudiante"
              value={newBadge.label}
              onChange={e => setNewBadge({ ...newBadge, label: e.target.value })}
            />
          </div>
          <div className="flex items-end gap-2">
            {editingBadge ? (
              <>
                <button
                  onClick={handleUpdateBadge}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all shadow active:scale-95"
                >
                  💾 Actualizar
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all shadow active:scale-95"
                >
                  ✖️
                </button>
              </>
            ) : (
              <button
                onClick={handleCreateBadge}
                className="w-full bg-gradient-to-r from-[#3465B4] to-[#2a4f8f] hover:from-[#2a4f8f] hover:to-[#1e3a6b] text-white font-bold py-2 px-4 rounded-lg transition-all shadow active:scale-95"
              >
                ➕ Crear Insignia
              </button>
            )}
          </div>
        </div>
        {badgeFormSuccess && (
          <div className="mt-3 text-center font-medium animate-pulse">
            {badgeFormSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Insignias Manuales */}
        <div className="bg-gradient-to-br from-[#F8D7DA] to-[#F3F4F6] rounded-2xl shadow-lg p-6 border-2 border-[#F3F4F6]">
          <h3 className="text-lg font-bold text-[#3465B4] mb-4 flex items-center gap-2">
            <span>🏅</span>
            Insignias Manuales
            <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {BADGE_INFO.sinLogica.length + customBadges.length}
            </span>
          </h3>
          <p className="text-xs text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            💡 Estas insignias se asignan manualmente usando la lista de abajo
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Insignias predeterminadas */}
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Predeterminadas:</p>
            {BADGE_INFO.sinLogica.map(b => (
              <div key={b.key} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <span className="text-xl">🎖️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{b.label}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{b.key}</p>
                </div>
              </div>
            ))}
            
            {/* Insignias personalizadas */}
            {customBadges.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2 mt-4">Personalizadas:</p>
                {customBadges.map(b => (
                  <div key={b.key} className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg shadow-sm border-2 border-green-200">
                    <span className="text-xl">✨</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{b.label}</p>
                      <p className="text-xs text-gray-400 font-mono truncate">{b.key}</p>
                    </div>
                    <button
                      onClick={() => handleEditBadge(b)}
                      className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-100 rounded transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteBadge(b.key)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        {/* Insignias Automáticas */}
        <div className="bg-gradient-to-br from-[#E3EAFD] to-[#F3F4F6] rounded-2xl shadow-lg p-6 border-2 border-[#3465B4]/30">
          <h3 className="text-lg font-bold text-[#3465B4] mb-4 flex items-center gap-2">
            <span>✨</span>
            Insignias Automáticas
            <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Solo info</span>
          </h3>
          <p className="text-xs text-gray-600 mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            🤖 Estas se asignan automáticamente por el sistema
          </p>
          <ul className="space-y-2">
            {BADGE_INFO.conLogica.map(b => (
              <li key={b.key} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">⚡</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{b.label}</p>
                    <p className="text-xs text-gray-400 font-mono truncate mb-1">{b.key}</p>
                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">{b.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-[#3465B4] mb-4 mt-8">Top del Mes</h2>
      {topStudent ? (
        <div className="mb-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow border border-yellow-200 flex items-center gap-4">
          <span className="text-3xl font-bold text-yellow-600">🏆</span>
          <span className="font-bold text-[#3465B4]">{topStudent.firstName} {topStudent.lastName}</span>
          <span className="text-[#C62B34] font-bold">({topStudent.points} MB)</span>
          <button
            onClick={handleAssignTopStudent}
            className="ml-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-4 py-2 rounded-lg transition-all shadow active:scale-95"
          >
            Finalizar mes y asignar insignia
          </button>
        </div>
      ) : (
        <div className="text-gray-400 mb-4 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-4 text-center">No hay estudiantes en el ranking.</div>
      )}
      
      <div className="mt-8 mb-4">
        <button
          onClick={() => setShowAssignSection(!showAssignSection)}
          className="w-full bg-gradient-to-r from-[#3465B4] to-[#2a4f8f] hover:from-[#2a4f8f] hover:to-[#1e3a6b] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎖️</span>
            <span className="text-lg">Asignar Insignias Manuales a Estudiantes</span>
            <span className="ml-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              {BADGE_INFO.sinLogica.length + customBadges.length} insignias
            </span>
          </div>
          <span className="text-2xl transition-transform duration-300" style={{ transform: showAssignSection ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </button>
      </div>
      
      {showAssignSection && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-slide-up-fade">
        {[...BADGE_INFO.sinLogica, ...customBadges].map(badge => (
          <div key={badge.key} className="bg-white border-2 border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-100">
              <span className="text-3xl">🎖️</span>
              <div className="flex-1">
                <h3 className="font-bold text-[#3465B4] text-lg">{badge.label}</h3>
                <p className="text-xs text-gray-400 font-mono">{badge.key}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Seleccionar estudiante:
              </label>
              <select
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                value={selectedBadge === badge.key ? selectedBadge : ''}
                onChange={e => {
                  setSelectedBadge(badge.key);
                  if (e.target.value) {
                    handleAssignBadgeToStudent(e.target.value, badge.key);
                    e.target.value = ''; // Reset después de asignar
                  }
                }}
              >
                <option value="">-- Selecciona un estudiante --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.id})
                  </option>
                ))}
              </select>
              
              {/* Mostrar estudiantes que tienen esta insignia */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Estudiantes con esta insignia:</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {students.filter(s => badgesByUser[s.id]?.includes(badge.key)).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Ninguno aún</p>
                  ) : (
                    students.filter(s => badgesByUser[s.id]?.includes(badge.key)).map(student => (
                      <span
                        key={student.id}
                        className="inline-flex items-center bg-gradient-to-r from-[#F8D7DA] to-[#F3F4F6] text-[#C62B34] px-3 py-1 rounded-full text-xs font-bold border border-[#F3F4F6] shadow-sm"
                      >
                        {student.firstName} {student.lastName}
                        <button
                          className="ml-2 text-[#C62B34] hover:text-[#a81e28] transition-colors font-bold"
                          title="Eliminar insignia"
                          onClick={() => handleRemoveBadgeFromStudent(student.id, badge.key)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      {showTopToast && (
        <Toast message={assignSuccess || "¡Insignia asignada exitosamente!"} onClose={() => setShowTopToast(false)} />
      )}

      {/* Sección de Limpiar Historial */}
      <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
        <h3 className="text-lg font-bold text-red-800 mb-4">🗑️ Limpiar Historial de Base de Datos</h3>
        <p className="text-red-700 mb-4">
          <strong>⚠️ ADVERTENCIA:</strong> Esta acción eliminará permanentemente los datos del historial. 
          Esta acción no se puede deshacer.
        </p>
        
        {historyInfo && (
          <div className="mb-4 p-4 bg-white border border-red-300 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Estado actual del historial:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div>Historial de asignaciones: <span className="font-bold">{historyInfo.assignHistory}</span></div>
              <div>Logs de auditoría: <span className="font-bold">{historyInfo.auditLogs}</span></div>
              <div>Anuncios: <span className="font-bold">{historyInfo.announcements}</span></div>
              <div>Solicitudes de canje: <span className="font-bold">{historyInfo.exchangeRequests}</span></div>
              <div>Solicitudes de registro: <span className="font-bold">{historyInfo.registrationRequests}</span></div>
              <div className="col-span-2 md:col-span-1">
                <strong>Total: {historyInfo.total} elementos</strong>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={openClearHistoryModal}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          🗑️ Limpiar Historial
        </button>
      </div>

      {/* Modal de confirmación para limpiar historial */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ⚠️ Confirmar Limpieza de Historial
              </h3>
              <p className="text-gray-600 mb-4">
                Esta acción eliminará <strong>PERMANENTEMENTE</strong> todos los datos del historial seleccionado.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de limpieza:
                </label>
                <select
                  value={selectedClearType}
                  onChange={(e) => setSelectedClearType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Todo el historial</option>
                  <option value="assignHistory">Historial de asignaciones</option>
                  <option value="auditLogs">Logs de auditoría</option>
                  <option value="announcements">Anuncios</option>
                  <option value="exchangeRequests">Solicitudes de canje</option>
                  <option value="registrationRequests">Solicitudes de registro</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para confirmar, escribe: <code className="bg-gray-100 px-2 py-1 rounded">CONFIRMAR_LIMPIEZA</code>
                </label>
                <input
                  type="text"
                  value={clearConfirmation}
                  onChange={(e) => setClearConfirmation(e.target.value)}
                  placeholder="CONFIRMAR_LIMPIEZA"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleClearHistory}
                  disabled={clearLoading || clearConfirmation !== 'CONFIRMAR_LIMPIEZA'}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[8.75rem]"
                >
                  {clearLoading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {clearLoading ? 'Limpiando...' : '🗑️ Limpiar'}
                </button>
                <button
                  onClick={() => {
                    setShowClearHistoryModal(false);
                    setClearConfirmation('');
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

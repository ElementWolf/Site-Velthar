import { useState, useEffect } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';

/**
 * Componente para mostrar anuncios del administrador a los estudiantes
 * Muestra los mensajes más recientes en un formato atractivo
 */
const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar anuncios al montar el componente
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/admin/announcement');
      setAnnouncements(response.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('No se pudieron cargar los anuncios');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear la fecha de manera amigable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Hace un momento' : `Hace ${diffInMinutes} minutos`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-sm">
        ⚠️ {error}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">📢</div>
        <p className="text-gray-500 font-medium">No hay anuncios por el momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📢</span>
        <h3 className="text-lg font-bold text-[#3465B4]">Anuncios del Profesor</h3>
        {announcements.length > 0 && (
          <span className="ml-auto bg-[#C62B34] text-white text-xs font-bold px-2 py-1 rounded-full">
            {announcements.length}
          </span>
        )}
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id || index}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">💬</div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-2">{announcement.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-semibold">📅 {formatDate(announcement.date)}</span>
                  <span className="text-gray-300">•</span>
                  <span>Por: Prof. Merlyn</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAnnouncements;


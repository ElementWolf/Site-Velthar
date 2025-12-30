import api from '@/axios';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import Toast from '../Toast';

const AdminExchangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/exchange');
      if (res.data.success) {
        setRequests(res.data.exchanges || []);
      } else {
        setError('No se pudieron cargar las solicitudes');
      }
    } catch (e) {
      setError('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/admin/exchange', { id, status });
      setSuccess(status === 'Aprobado' ? 'Canje aprobado correctamente' : 'Canje rechazado correctamente');
      setToastMsg(status === 'Aprobado' ? '¡Canje aprobado exitosamente!' : '¡Canje rechazado exitosamente!');
      setShowToast(true);
      fetchRequests();
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      setError('Error al actualizar la solicitud');
      setToastMsg('Error al actualizar la solicitud');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
      <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Solicitudes de Canje Pendientes</h2>
      {error && <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2">{error}</div>}
      {success && <div className="mb-4 bg-green-100 text-green-800 border border-green-300 font-medium rounded-lg px-4 py-2">{success}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#F8D7DA]">
            <tr>
              <th className="py-4 px-4 text-left text-[#C62B34] text-sm font-bold uppercase">Fecha</th>
              <th className="py-4 px-4 text-left text-[#C62B34] text-sm font-bold uppercase">Estudiante</th>
              <th className="py-4 px-4 text-left text-[#C62B34] text-sm font-bold uppercase">Tipo</th>
              <th className="py-4 px-4 text-left text-[#C62B34] text-sm font-bold uppercase">Cantidad</th>
              <th className="py-4 px-4 text-left text-[#C62B34] text-sm font-bold uppercase">Descripción</th>
              <th className="py-4 px-4 text-center text-[#C62B34] text-sm font-bold uppercase">Estado</th>
              <th className="py-4 px-4 text-center text-[#C62B34] text-sm font-bold uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-gray-500 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl">No hay solicitudes pendientes</td></tr>
            )}
            {requests.filter(r => r.status === 'Pendiente').map((req) => (
              <tr key={req.id} className="border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F8D7DA]/20 transition-colors">
                <td className="py-3 px-4 text-gray-700 font-medium">{new Date(req.date).toLocaleString('es-ES')}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{req.firstName} {req.lastName} ({req.userId})</td>
                <td className="py-3 px-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F8D7DA] text-[#C62B34]">
                    {req.type}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-[#3465B4]">{req.amount} MB</td>
                <td className="py-3 px-4 text-gray-700">{req.description}</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs font-bold">
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-1 px-3 rounded-lg font-medium transition-all shadow active:scale-95 disabled:opacity-60"
                      onClick={() => handleAction(req.id, 'Aprobado')}
                      disabled={loading}
                    >
                      Aprobar
                    </button>
                    <button
                      className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white py-1 px-3 rounded-lg font-medium transition-all shadow active:scale-95 disabled:opacity-60"
                      onClick={() => handleAction(req.id, 'Rechazado')}
                      disabled={loading}
                    >
                      Rechazar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default AdminExchangeRequests;

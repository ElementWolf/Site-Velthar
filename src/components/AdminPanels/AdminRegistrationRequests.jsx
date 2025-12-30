import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import { useState, useMemo } from 'react';
import { useToast } from '@/contexts/ToastContext';
import api from '@/axios';

const formatDate = (date) => {
    try {
        return new Date(date).toLocaleString('es-ES');
    } catch (error) {
        return 'Fecha inválida';
    }
};

const AdminRegistrationRequests = () => {
    const { data, loading, error, refetch } = useApi('/api/admin/registration-requests');
    const { showToast } = useToast();
    const requests = data?.requests || [];
    
    // Estados para filtros
    const [filters, setFilters] = useState({
        status: '',
        student: '',
        dateFrom: '',
        dateTo: ''
    });

    // Estados para modal de revisión
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Filtrar solicitudes
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            // Filtro por estado
            if (filters.status && req.status !== filters.status) return false;
            
            // Filtro por estudiante
            if (filters.student) {
                const fullName = `${req.firstName} ${req.lastName}`.toLowerCase();
                if (!fullName.includes(filters.student.toLowerCase())) return false;
            }
            
            // Filtro por fecha desde
            if (filters.dateFrom) {
                const reqDate = new Date(req.date);
                const fromDate = new Date(filters.dateFrom);
                if (reqDate < fromDate) return false;
            }
            
            // Filtro por fecha hasta
            if (filters.dateTo) {
                const reqDate = new Date(req.date);
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (reqDate > toDate) return false;
            }
            
            return true;
        });
    }, [requests, filters]);

    // Obtener valores únicos para los filtros
    const uniqueStatuses = useMemo(() => {
        const statuses = [...new Set(requests.map(req => req.status).filter(Boolean))];
        return statuses.sort();
    }, [requests]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            student: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    const openReviewModal = (request) => {
        setSelectedRequest(request);
        setReviewNotes('');
    };

    const closeReviewModal = () => {
        setSelectedRequest(null);
        setReviewNotes('');
    };

    const handleReview = async (status) => {
        if (!selectedRequest) return;
        
        setIsProcessing(true);
        try {
            const response = await api.post('/api/admin/registration-requests', {
                requestId: selectedRequest.id,
                status,
                reviewNotes: reviewNotes.trim() || null
            });

            const result = response.data;
            
            if (result.success) {
                showToast(result.message, 'success');
                closeReviewModal();
                refetch(); // Recargar datos
            } else {
                showToast(result.error || 'Error al procesar la solicitud', 'error');
            }
        } catch (error) {
            console.error('Error reviewing request:', error);
            showToast('Error de conexión', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-4 sm:p-8 animate-slide-up-fade">
            <h2 className="text-xl sm:text-2xl font-bold text-[#C62B34] mb-6">Solicitudes de Registro</h2>
            {error && <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-3 py-2 text-sm sm:text-base">{error}</div>}
            
            {/* Filtros */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#3465B4] mb-4">Filtros</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Filtro por estado */}
                    <div>
                        <label className="block text-sm font-medium text-[#C62B34] mb-1">Estado</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C62B34] transition-all"
                        >
                            <option value="">Todos los estados</option>
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro por estudiante */}
                    <div>
                        <label className="block text-sm font-medium text-[#C62B34] mb-1">Estudiante</label>
                        <input
                            type="text"
                            placeholder="Buscar estudiante..."
                            value={filters.student}
                            onChange={(e) => handleFilterChange('student', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C62B34] transition-all"
                        />
                    </div>

                    {/* Filtro por fecha desde */}
                    <div>
                        <label className="block text-sm font-medium text-[#C62B34] mb-1">Desde</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C62B34] transition-all"
                        />
                    </div>

                    {/* Botón limpiar filtros */}
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full bg-gradient-to-r from-[#3465B4] to-[#2a4f8f] hover:from-[#2a4f8f] hover:to-[#1e3a6b] text-white font-bold px-4 py-2 rounded-lg transition-all shadow active:scale-95 text-sm"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>

                {/* Resumen de filtros activos */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                        if (!value) return null;
                        return (
                            <span key={key} className="inline-flex items-center bg-white text-[#C62B34] px-3 py-1 rounded-full text-xs font-bold border border-[#F3F4F6] shadow-sm">
                                {key === 'status' && 'Estado: '}
                                {key === 'student' && 'Estudiante: '}
                                {key === 'dateFrom' && 'Desde: '}
                                {key === 'dateTo' && 'Hasta: '}
                                {value}
                                <button
                                    onClick={() => handleFilterChange(key, '')}
                                    className="ml-2 text-[#C62B34] hover:text-[#a81e28] transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                </div>
            </div>
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-[#F3F4F6]">
                            <thead className="bg-[#F8D7DA]">
                                <tr>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Fecha</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Cédula</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Nombre</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Estado</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Revisado por</th>
                                    <th className="py-3 px-2 sm:px-4 text-center text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#F3F4F6]">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-500 py-8 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl text-sm">
                                            {requests.length === 0 ? 'No hay solicitudes de registro.' : 'No se encontraron solicitudes con los filtros aplicados.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req, idx) => (
                                        <tr key={req.id || idx} className="hover:bg-[#F8D7DA]/20 transition-colors">
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm whitespace-nowrap">
                                                {formatDate(req.date)}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm whitespace-nowrap">
                                                {req.userId}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm max-w-[9.375rem]">
                                                <div className="truncate" title={`${req.firstName} ${req.lastName}`}>
                                                    {req.firstName} {req.lastName}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                                    req.status === 'Aprobado' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm">
                                                {req.reviewedBy ? (
                                                    <div>
                                                        <div className="font-medium">{req.reviewedBy}</div>
                                                        <div className="text-xs text-gray-500">{formatDate(req.reviewedDate)}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-center">
                                                {req.status === 'Pendiente' ? (
                                                    <button
                                                        onClick={() => openReviewModal(req)}
                                                        className="bg-gradient-to-r from-[#3465B4] to-[#2a4f8f] hover:from-[#2a4f8f] hover:to-[#1e3a6b] text-white font-bold px-3 py-1 rounded-lg transition-all shadow active:scale-95 text-xs"
                                                    >
                                                        Revisar
                                                    </button>
                                                ) : (
                                                    <div className="text-xs text-gray-500">
                                                        {req.reviewNotes && (
                                                            <div className="max-w-[12.5rem] truncate" title={req.reviewNotes}>
                                                                {req.reviewNotes}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {filteredRequests.length > 0 && (
                <div className="mt-4 text-xs sm:text-sm text-gray-500 text-center">
                    Mostrando {filteredRequests.length} de {requests.length} solicitudes
                </div>
            )}

            {/* Modal de revisión */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-[#C62B34] mb-4">
                            Revisar Solicitud de Registro
                        </h3>
                        
                        <div className="mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Cédula:</span>
                                    <div className="text-gray-900">{selectedRequest.userId}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Fecha:</span>
                                    <div className="text-gray-900">{formatDate(selectedRequest.date)}</div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className="font-medium text-gray-700">Nombre:</span>
                                <div className="text-gray-900">{selectedRequest.firstName} {selectedRequest.lastName}</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#C62B34] mb-2">
                                Notas de revisión (opcional)
                            </label>
                            <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Agregar comentarios sobre la decisión..."
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C62B34] transition-all resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleReview('Aprobado')}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition-all shadow active:scale-95"
                            >
                                {isProcessing ? 'Procesando...' : 'Aprobar'}
                            </button>
                            <button
                                onClick={() => handleReview('Rechazado')}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition-all shadow active:scale-95"
                            >
                                {isProcessing ? 'Procesando...' : 'Rechazar'}
                            </button>
                            <button
                                onClick={closeReviewModal}
                                disabled={isProcessing}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition-all shadow active:scale-95"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRegistrationRequests; 
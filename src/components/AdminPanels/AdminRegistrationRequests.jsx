import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import { useState, useMemo } from 'react';
import { useToast } from '@/contexts/ToastContext';
import api from '@/axios';

const formatDate = (date) => {
    try {
        return new Date(date).toLocaleString('es-ES');
    } catch (error) {
        return 'FECHA_CORRUPTA';
    }
};

const AdminActivityLogs = () => {
    // Cambiamos el endpoint a uno de logs/auditoría
    const { data, loading, error, refetch } = useApi('/api/admin/system-logs');
    const { showToast } = useToast();
    const logs = data?.logs || [];
    
    const [filters, setFilters] = useState({
        level: '', // Nivel de alerta (Info, Warning, Critical)
        agent: '',
        dateFrom: '',
        dateTo: ''
    });

    const [selectedLog, setSelectedLog] = useState(null);

    // Filtrar Logs con temática SCP
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (filters.level && log.level !== filters.level) return false;
            
            if (filters.agent) {
                const agentName = `${log.agentName} ${log.agentId}`.toLowerCase();
                if (!agentName.includes(filters.agent.toLowerCase())) return false;
            }
            
            if (filters.dateFrom) {
                const logDate = new Date(log.date);
                if (logDate < new Date(filters.dateFrom)) return false;
            }
            
            return true;
        });
    }, [logs, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ level: '', agent: '', dateFrom: '', dateTo: '' });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 sm:p-8 animate-slide-up-fade">
            {/* Header Estilo SCP */}
            <div className="border-b-2 border-[#C62B34] pb-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-[#C62B34] uppercase tracking-tighter">
                    Terminal de Auditoría SCiP-NET
                </h2>
                <p className="text-gray-500 text-xs font-mono italic">Monitoreo de Acceso y Modificaciones de Archivos</p>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 text-[#C62B34] border-l-4 border-[#C62B34] font-mono p-3 text-sm">
                    [ERROR_DE_SISTEMA]: {error}
                </div>
            )}
            
            {/* Panel de Filtros */}
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Parámetros de Búsqueda</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-[#C62B34] uppercase mb-1">Nivel de Alerta</label>
                        <select
                            value={filters.level}
                            onChange={(e) => handleFilterChange('level', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-[#C62B34] outline-none"
                        >
                            <option value="">TODOS</option>
                            <option value="INFO">INFO (Acceso)</option>
                            <option value="WARN">WARN (Modificación)</option>
                            <option value="CRIT">CRIT (Eliminación)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#C62B34] uppercase mb-1">Agente / ID</label>
                        <input
                            type="text"
                            placeholder="Buscar sujeto..."
                            value={filters.agent}
                            onChange={(e) => handleFilterChange('agent', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-[#C62B34] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-[#C62B34] uppercase mb-1">Fecha Inicial</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full bg-gray-800 hover:bg-black text-white font-bold py-2 rounded-lg transition-all text-xs uppercase tracking-widest"
                        >
                            Resetear Terminal
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Tabla de Logs */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-inner bg-gray-50">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-800 text-white font-mono text-[10px] uppercase tracking-widest">
                        <tr>
                            <th className="py-3 px-4 text-left">Timestamp</th>
                            <th className="py-3 px-4 text-left">Personal</th>
                            <th className="py-3 px-4 text-left">Acción Realizada</th>
                            <th className="py-3 px-4 text-left">Nivel</th>
                            <th className="py-3 px-4 text-center">Detalles</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-xs">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-10 text-center text-gray-400 italic">No se registran anomalías en los registros.</td>
                            </tr>
                        ) : (
                            filteredLogs.map((log, idx) => (
                                <tr key={log.id || idx} className="hover:bg-red-50/50 transition-colors">
                                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{formatDate(log.date)}</td>
                                    <td className="py-3 px-4">
                                        <span className="font-bold text-gray-900">{log.agentName}</span>
                                        <div className="text-[10px] text-gray-400">ID: {log.agentId}</div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-700">{log.action}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            log.level === 'CRIT' ? 'bg-red-600 text-white animate-pulse' :
                                            log.level === 'WARN' ? 'bg-yellow-400 text-black' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button 
                                            onClick={() => setSelectedLog(log)}
                                            className="text-[#3465B4] hover:underline text-[10px] font-bold uppercase"
                                        >
                                            [VER_EXPEDIENTE]
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Detalles del Log */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-t-8 border-[#C62B34] rounded-lg shadow-2xl max-w-lg w-full p-6 font-mono">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-lg font-black text-gray-900 uppercase">Detalle de Actividad SCiP</h3>
                            <span className="bg-gray-100 px-2 py-1 text-[10px]">LOG_ID: {selectedLog.id}</span>
                        </div>
                        
                        <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                            <p><span className="text-gray-400 font-bold uppercase text-[10px]">Sujeto:</span> {selectedLog.agentName} ({selectedLog.agentId})</p>
                            <p><span className="text-gray-400 font-bold uppercase text-[10px]">Acción:</span> {selectedLog.action}</p>
                            <p><span className="text-gray-400 font-bold uppercase text-[10px]">Ubicación IP:</span> {selectedLog.ipAddress || '192.168.X.X'}</p>
                            <div className="mt-4">
                                <span className="text-gray-400 font-bold uppercase text-[10px]">Metadatos de la Operación:</span>
                                <pre className="bg-gray-900 text-green-500 p-3 rounded mt-2 text-xs overflow-x-auto">
                                    {JSON.stringify(selectedLog.metadata || { status: "Success", target: "File_SCP_001" }, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedLog(null)}
                            className="w-full bg-[#C62B34] hover:bg-[#a81e28] text-white font-bold py-2 rounded uppercase text-xs tracking-widest transition-all"
                        >
                            Cerrar Expediente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminActivityLogs;
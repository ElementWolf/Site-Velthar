import { useState, useEffect, useMemo } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';
import Tooltip from '../Tooltip';
import Toast from '../Toast';
import { exportStudentsList } from '@/lib/csvExport'; // Reutilizamos la lógica de exportación

/**
 * COMPONENTE: AdminTransactionHistory
 * Temática: Registro de Transferencia de Datos - Nivel de Seguridad 4
 */

const formatDate = (date) => {
    if (!date) return 'Sin fecha';
    try {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
};

const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0 MB';
    const strAmount = String(amount);
    const cleanAmount = strAmount.replace(/^[+-]/, '');
    const sign = strAmount.startsWith('-') ? '-' : '+';
    return `${sign}${cleanAmount} MB`;
};

const AdminTransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Estados para filtros operativos
    const [filters, setFilters] = useState({
        type: '',
        student: '',
        cedula: '',
        status: '',
        dateFrom: '',
        dateTo: ''
    });

    useEffect(() => {
        setIsClient(true);
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/api/admin/history');
            setTransactions(res.data.history || []);
        } catch (err) {
            setError('Error de conexión con la base de datos central de la Fundación.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtrado en tiempo real
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (filters.type && tx.type !== filters.type) return false;
            if (filters.student && !tx.student?.toLowerCase().includes(filters.student.toLowerCase())) return false;
            if (filters.cedula && !tx.cedula?.toLowerCase().includes(filters.cedula.toLowerCase())) return false;
            if (filters.status && tx.status !== filters.status) return false;
            
            const txDate = new Date(tx.date);
            if (filters.dateFrom && txDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (txDate > toDate) return false;
            }
            return true;
        });
    }, [transactions, filters]);

    const uniqueTypes = useMemo(() => [...new Set(transactions.map(tx => tx.type).filter(Boolean))].sort(), [transactions]);
    const uniqueStatuses = useMemo(() => [...new Set(transactions.map(tx => tx.status).filter(Boolean))].sort(), [transactions]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ type: '', student: '', cedula: '', status: '', dateFrom: '', dateTo: '' });
    };

    const handleExport = () => {
        if (filteredTransactions.length === 0) return;
        exportStudentsList(filteredTransactions); // Asumiendo que la función es genérica para objetos
        setToastMsg('Registro de transacciones exportado a terminal local.');
        setShowToast(true);
    };

    if (!isClient || loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border-2 border-[#F3F4F6] rounded-2xl shadow-xl p-4 sm:p-8 animate-slide-up-fade">
            {/* Cabecera Estilo Fundación */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-2 border-[#F8D7DA] pb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#C62B34] tracking-tighter uppercase">
                        Historial de Transacciones
                    </h2>
                    <p className="text-[#3465B4] text-xs font-mono font-bold mt-1">
                        SISTEMA DE MONITOREO DE RECURSOS DIGITALES | NIVEL 4
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <Tooltip content="Exportar registros filtrados">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 text-sm"
                        >
                            <span>📄</span> EXPORTAR CSV
                        </button>
                    </Tooltip>
                    <button
                        onClick={fetchHistory}
                        className="bg-[#E3EAFD] text-[#3465B4] border-2 border-[#3465B4] font-bold p-2 rounded-lg hover:bg-[#3465B4] hover:text-white transition-all"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-[#F8D7DA] text-[#C62B34] border-l-4 border-[#C62B34] font-bold p-4 text-sm animate-pulse">
                    ⚠️ ALERTA: {error}
                </div>
            )}

            {/* Panel de Filtros Operativos */}
            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-[#C62B34] uppercase mb-1">Clasificación</label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-md px-2 py-1.5 text-sm focus:border-[#3465B4] outline-none transition-colors"
                        >
                            <option value="">TODOS</option>
                            {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[#C62B34] uppercase mb-1">Sujeto (Nombre)</label>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={filters.student}
                            onChange={(e) => handleFilterChange('student', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-md px-2 py-1.5 text-sm focus:border-[#3465B4] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[#C62B34] uppercase mb-1">Identificación</label>
                        <input
                            type="text"
                            placeholder="V-..."
                            value={filters.cedula}
                            onChange={(e) => handleFilterChange('cedula', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-md px-2 py-1.5 text-sm focus:border-[#3465B4] outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[#C62B34] uppercase mb-1">Estado de Transacción</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-md px-2 py-1.5 text-sm focus:border-[#3465B4] outline-none"
                        >
                            <option value="">TODOS</option>
                            {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[#C62B34] uppercase mb-1">Rango Temporal</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-md px-2 py-1.5 text-sm"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-md transition-all text-xs uppercase"
                        >
                            Reiniciar
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Registros */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#F3F4F6]">
                        <tr>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-[#C62B34] uppercase tracking-widest">Sello Temporal</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-[#C62B34] uppercase tracking-widest">Sujeto</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-[#C62B34] uppercase tracking-widest">Tipo</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-[#C62B34] uppercase tracking-widest">Descripción</th>
                            <th className="py-4 px-4 text-right text-[10px] font-black text-[#C62B34] uppercase tracking-widest">Cuota</th>
                            <th className="py-4 px-4 text-center text-[10px] font-black text-[#C62B34] uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-400 font-mono text-sm italic">
                                    [ NO SE ENCONTRARON REGISTROS QUE COINCIDAN CON LOS CRITERIOS DE BÚSQUEDA ]
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((tx, idx) => (
                                <tr key={tx.id || idx} className="hover:bg-[#F8D7DA]/5 transition-colors group">
                                    <td className="py-4 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-sm font-bold text-gray-800">{tx.student || 'Sujeto Desconocido'}</div>
                                        <div className="text-[10px] font-mono text-[#3465B4]">{tx.cedula || 'N/A'}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded border ${
                                            tx.type === 'Canje' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                            tx.type === 'Subasta' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                            'border-gray-200 bg-gray-50 text-gray-700'
                                        }`}>
                                            {tx.type?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-xs text-gray-600 max-w-xs">
                                        <p className="truncate" title={tx.description}>{tx.description || 'Sin detalles'}</p>
                                    </td>
                                    <td className={`py-4 px-4 text-right font-mono font-bold text-sm ${String(tx.amount).startsWith('-') ? 'text-[#C62B34]' : 'text-green-600'}`}>
                                        {formatAmount(tx.amount)}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`inline-block w-24 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                                            tx.status === 'Aprobado' ? 'bg-green-100 text-green-800' : 
                                            tx.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 animate-pulse' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer de Tabla */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Total de entradas en base de datos: {transactions.length}</span>
                <span>Visualizando: {filteredTransactions.length} registros</span>
            </div>

            {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default AdminTransactionHistory;
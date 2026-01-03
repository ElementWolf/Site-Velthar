import { useState, useEffect, useMemo } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';
import Tooltip from '../Tooltip';
import Toast from '../Toast';
import { exportStudentsList } from '@/lib/csvExport';

/**
 * COMPONENTE: AdminTransactionHistory (RE-CLASIFICADO)
 * Temática: Registro de Contención y Transferencia de Activos - Nivel 4
 */

const formatDate = (date) => {
    if (!date) return '00/00/00 00:00';
    try {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        return 'ERROR_DATE_CORRUPT';
    }
};

const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0.00 MB';
    const strAmount = String(amount);
    const cleanAmount = strAmount.replace(/^[+-]/, '');
    const sign = strAmount.startsWith('-') ? '▼' : '▲';
    return `${sign} ${cleanAmount} MB`;
};

const AdminTransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isClient, setIsClient] = useState(false);

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
            setError('FALLO EN LA SINCRONIZACIÓN CON EL NÚCLEO DE DATOS DE LA FUNDACIÓN.');
        } finally {
            setLoading(false);
        }
    };

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
        exportStudentsList(filteredTransactions);
        setToastMsg('REGISTRO DE CONTENCIÓN DESCARGADO EXITOSAMENTE.');
        setShowToast(true);
    };

    if (!isClient || loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border-2 border-black rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-4 sm:p-8 animate-slide-up-fade font-sans">
            {/* CABECERA: PROTOCOLO DE SEGURIDAD */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-4 border-black pb-6">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block p-2 bg-black text-white rounded-full">
                        <svg width="40" height="40" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z"/>
                            <circle cx="50" cy="50" r="15"/>
                            <path d="M50 25v10M25 50h10M50 75v10M75 50h10"/>
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tighter uppercase italic">
                            Registros de Contención
                        </h2>
                        <p className="bg-black text-white text-[10px] font-mono px-2 py-0.5 inline-block mt-1">
                            SEGURIDAD DE DATOS: NIVEL 4 (SECRETO)
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Tooltip content="Exportar registros a Terminal">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-white border-2 border-black text-black hover:bg-black hover:text-white font-black px-4 py-2 transition-all active:translate-y-1 text-xs uppercase"
                        >
                            ENCRIPTAR Y EXPORTAR
                        </button>
                    </Tooltip>
                    <button
                        onClick={fetchHistory}
                        className="border-2 border-black font-black p-2 hover:bg-gray-100 transition-all"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-[#C62B34] text-white font-black p-4 text-sm flex items-center gap-3">
                    <span className="text-2xl">⚠️</span> {error}
                </div>
            )}

            {/* PANEL DE CONTROL DE BÚSQUEDA OPERATIVA */}
            <div className="bg-gray-100 p-5 mb-8 border-2 border-black border-dashed">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-black uppercase mb-1">Clasificación Objeto</label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full border-2 border-black rounded-none px-2 py-1.5 text-sm focus:bg-yellow-50 outline-none transition-colors font-bold"
                        >
                            <option value="">[ TODOS ]</option>
                            {uniqueTypes.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-black uppercase mb-1">ID Sujeto (Nombre)</label>
                        <input
                            type="text"
                            placeholder="Identificar..."
                            value={filters.student}
                            onChange={(e) => handleFilterChange('student', e.target.value)}
                            className="w-full border-2 border-black rounded-none px-2 py-1.5 text-sm focus:bg-yellow-50 outline-none font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-black uppercase mb-1">Cédula del Sujeto</label>
                        <input
                            type="text"
                            placeholder="V-..."
                            value={filters.cedula}
                            onChange={(e) => handleFilterChange('cedula', e.target.value)}
                            className="w-full border-2 border-black rounded-none px-2 py-1.5 text-sm focus:bg-yellow-50 outline-none font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-black uppercase mb-1">Estado Operativo</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full border-2 border-black rounded-none px-2 py-1.5 text-sm focus:bg-yellow-50 outline-none font-bold"
                        >
                            <option value="">[ TODOS ]</option>
                            {uniqueStatuses.map(status => <option key={status} value={status}>{status.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-black uppercase mb-1">Registro Inicial</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="w-full border-2 border-black rounded-none px-2 py-1.5 text-sm font-bold"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full bg-black text-white hover:bg-gray-800 font-black py-2.5 transition-all text-[10px] uppercase tracking-tighter"
                        >
                            Limpiar Terminal
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLA DE CONTENCIÓN */}
            <div className="overflow-x-auto border-2 border-black">
                <table className="min-w-full divide-y-2 divide-black">
                    <thead className="bg-black">
                        <tr>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Stamp_UTC</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Sujeto_ID</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Tipo_Cont</th>
                            <th className="py-4 px-4 text-left text-[10px] font-black text-white uppercase tracking-widest">Descripción_Log</th>
                            <th className="py-4 px-4 text-right text-[10px] font-black text-white uppercase tracking-widest">Carga_Datos</th>
                            <th className="py-4 px-4 text-center text-[10px] font-black text-white uppercase tracking-widest">Status_Red</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-20 text-black font-mono text-xs font-black uppercase">
                                    [ ADVERTENCIA: NO SE ENCONTRARON ENTRADAS EN EL LOG CENTRAL ]
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((tx, idx) => (
                                <tr key={tx.id || idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4 font-mono text-[11px] text-gray-600 border-r border-gray-100">
                                        {formatDate(tx.date)}
                                    </td>
                                    <td className="py-4 px-4 border-r border-gray-100">
                                        <div className="text-sm font-black text-black">{tx.student || 'NON_IDENTIFIED'}</div>
                                        <div className="text-[10px] font-mono font-bold text-[#3465B4]">{tx.cedula || 'NO_ID'}</div>
                                    </td>
                                    <td className="py-4 px-4 border-r border-gray-100">
                                        <span className={`text-[10px] font-black px-2 py-0.5 border-2 ${
                                            tx.type === 'Canje' ? 'border-blue-500 text-blue-600' :
                                            tx.type === 'Subasta' ? 'border-purple-500 text-purple-600' :
                                            'border-black text-black'
                                        }`}>
                                            {tx.type?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-[11px] text-gray-600 max-w-xs border-r border-gray-100 font-medium italic">
                                        "{tx.description || 'Sin bitácora adicional'}"
                                    </td>
                                    <td className={`py-4 px-4 text-right font-mono font-black text-sm ${String(tx.amount).startsWith('-') ? 'text-[#C62B34]' : 'text-green-700'}`}>
                                        {formatAmount(tx.amount)}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`inline-block w-24 py-1 text-[10px] font-black uppercase border ${
                                            tx.status === 'Aprobado' ? 'bg-green-600 text-white border-green-700' : 
                                            tx.status === 'Pendiente' ? 'bg-yellow-400 text-black border-yellow-500 animate-pulse' : 
                                            'bg-red-600 text-white border-red-700'
                                        }`}>
                                            {tx.status === 'Aprobado' ? 'ASEGURADO' : tx.status === 'Pendiente' ? 'EN_ESPERA' : 'FALLIDO'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* BARRA DE ESTADO INFERIOR */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-black p-2 text-[10px] font-mono font-bold text-white uppercase tracking-tighter">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    Terminal_Link: Establecido
                </span>
                <span>Entradas_Totales: {transactions.length} | Filtradas: {filteredTransactions.length}</span>
                <span className="hidden md:block">Acceso_Autorizado: [ADMIN_O5]</span>
            </div>

            {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default AdminTransactionHistory;
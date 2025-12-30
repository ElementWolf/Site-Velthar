import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import { useState, useMemo } from 'react';

const formatDate = (date) => {
    try {
        return new Date(date).toLocaleString('es-ES');
    } catch (error) {
        return 'Fecha inválida';
    }
};

const formatAmount = (amount) => {
    if (!amount) return '0 MB';
    const cleanAmount = amount.replace(/^[+-]/, '');
    const sign = amount.startsWith('-') ? '-' : '+';
    return `${sign}${cleanAmount} MB`;
};

const AdminTransactionHistory = () => {
    const { data, loading, error } = useApi('/api/admin/history');
    const transactions = data?.history || [];
    
    // Estados para filtros
    const [filters, setFilters] = useState({
        type: '',
        student: '',
        cedula: '',
        status: '',
        dateFrom: '',
        dateTo: ''
    });

    // Filtrar transacciones
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            // Filtro por tipo
            if (filters.type && tx.type !== filters.type) return false;
            
            // Filtro por estudiante
            if (filters.student && !tx.student?.toLowerCase().includes(filters.student.toLowerCase())) return false;
            
            // Filtro por cédula
            if (filters.cedula && !tx.cedula?.toLowerCase().includes(filters.cedula.toLowerCase())) return false;
            
            // Filtro por estado
            if (filters.status && tx.status !== filters.status) return false;
            
            // Filtro por fecha desde
            if (filters.dateFrom) {
                const txDate = new Date(tx.date);
                const fromDate = new Date(filters.dateFrom);
                if (txDate < fromDate) return false;
            }
            
            // Filtro por fecha hasta
            if (filters.dateTo) {
                const txDate = new Date(tx.date);
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999); // Incluir todo el día
                if (txDate > toDate) return false;
            }
            
            return true;
        });
    }, [transactions, filters]);

    // Obtener valores únicos para los filtros
    const uniqueTypes = useMemo(() => {
        const types = [...new Set(transactions.map(tx => tx.type).filter(Boolean))];
        return types.sort();
    }, [transactions]);

    const uniqueStatuses = useMemo(() => {
        const statuses = [...new Set(transactions.map(tx => tx.status).filter(Boolean))];
        return statuses.sort();
    }, [transactions]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            student: '',
            cedula: '',
            status: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-4 sm:p-8 animate-slide-up-fade">
            <h2 className="text-xl sm:text-2xl font-bold text-[#C62B34] mb-6">Historial de Transacciones</h2>
            {error && <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-3 py-2 text-sm sm:text-base">{error}</div>}
            
            {/* Filtros */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#3465B4] mb-4">Filtros</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
                    {/* Filtro por tipo */}
                    <div>
                        <label className="block text-sm font-medium text-[#C62B34] mb-1">Tipo</label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C62B34] transition-all"
                        >
                            <option value="">Todos los tipos</option>
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
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

                    {/* Filtro por cédula */}
                    <div>
                        <label className="block text-sm font-medium text-[#C62B34] mb-1">Cédula</label>
                        <input
                            type="text"
                            placeholder="Buscar cédula..."
                            value={filters.cedula}
                            onChange={(e) => handleFilterChange('cedula', e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C62B34] transition-all"
                        />
                    </div>

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

                    {/* Filtro por fecha hasta */}
                    <div>
                        <label className="block text-sm font-medium text-[#C62B34] mb-1">Hasta</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
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
                                {key === 'type' && 'Tipo: '}
                                {key === 'student' && 'Estudiante: '}
                                {key === 'cedula' && 'Cédula: '}
                                {key === 'status' && 'Estado: '}
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
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Usuario</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Cédula</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Tipo</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Descripción</th>
                                    <th className="py-3 px-2 sm:px-4 text-right text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Cantidad</th>
                                    <th className="py-3 px-2 sm:px-4 text-center text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#F3F4F6]">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-gray-500 py-8 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl text-sm">
                                            {transactions.length === 0 ? 'No hay transacciones registradas.' : 'No se encontraron transacciones con los filtros aplicados.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx, idx) => (
                                        <tr key={tx.id || idx} className="hover:bg-[#F8D7DA]/20 transition-colors">
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm whitespace-nowrap">
                                                {formatDate(tx.date)}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm max-w-[7.5rem] sm:max-w-none">
                                                <div className="truncate" title={tx.student || 'Usuario desconocido'}>
                                                    {tx.student || 'Usuario desconocido'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm whitespace-nowrap">
                                                {tx.cedula || 'N/A'}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                                    tx.type === 'Canje' ? 'bg-blue-100 text-blue-800' :
                                                    tx.type === 'Subasta' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-[#F8D7DA] text-[#C62B34]'
                                                }`} title={tx.type}>
                                                    {tx.type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 text-xs sm:text-sm max-w-[9.375rem] sm:max-w-[12.5rem]">
                                                <div className="truncate" title={tx.description || 'Sin descripción'}>
                                                    {tx.description || 'Sin descripción'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-right font-bold text-[#3465B4] text-xs sm:text-sm whitespace-nowrap">
                                                {formatAmount(tx.amount)}
                                            </td>
                                            <td className="py-3 px-2 sm:px-4 text-center">
                                                {tx.status ? (
                                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                                        tx.status === 'Aprobado' ? 'bg-green-100 text-green-800' : 
                                                        tx.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                                        tx.status === 'Rechazado' ? 'bg-red-100 text-red-800' :
                                                        'bg-[#F8D7DA] text-[#C62B34]'
                                                    }`}>
                                                        {tx.status}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
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
            
            {filteredTransactions.length > 0 && (
                <div className="mt-4 text-xs sm:text-sm text-gray-500 text-center">
                    Mostrando {filteredTransactions.length} de {transactions.length} transacciones
                </div>
            )}
        </div>
    );
};

export default AdminTransactionHistory;
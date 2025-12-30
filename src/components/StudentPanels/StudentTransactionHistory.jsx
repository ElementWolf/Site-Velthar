import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';

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

const StudentTransactionHistory = () => {
    const { data, loading, error } = useApi('/api/student/history');
    const transactions = data?.history || [];

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-4 sm:p-8 animate-slide-up-fade">
            <h2 className="text-xl sm:text-2xl font-bold text-[#C62B34] mb-6">Mi Historial de Transacciones</h2>
            {error && <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-3 py-2 text-sm sm:text-base">{error}</div>}
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-[#F3F4F6]">
                            <thead className="bg-[#F8D7DA]">
                                <tr>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Fecha</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Tipo</th>
                                    <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Descripción</th>
                                    <th className="py-3 px-2 sm:px-4 text-right text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Cantidad</th>
                                    <th className="py-3 px-2 sm:px-4 text-center text-[#C62B34] text-xs sm:text-sm font-bold whitespace-nowrap">Estado</th>
                        </tr>
                    </thead>
                            <tbody className="bg-white divide-y divide-[#F3F4F6]">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-gray-500 py-8 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl text-sm">
                                            No tienes transacciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx, idx) => (
                                        <tr key={tx.id || idx} className="hover:bg-[#F8D7DA]/20 transition-colors">
                                            <td className="py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm whitespace-nowrap">
                                                {formatDate(tx.date)}
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
            
            {transactions.length > 0 && (
                <div className="mt-4 text-xs sm:text-sm text-gray-500 text-center">
                    Total de transacciones: {transactions.length}
                </div>
            )}
        </div>
    );
};

export default StudentTransactionHistory;
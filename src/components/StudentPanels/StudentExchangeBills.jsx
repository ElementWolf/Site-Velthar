import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';
import { useAuth } from '@/contexts/UserAuthContext';

const StudentExchangeBills = () => {
    const { data: rateData, loading: loadingRate } = useApi('/api/student/exchange-rate');
    const exchangeRate = rateData?.rate || 100;
    const [academicPoints, setAcademicPoints] = useState('');
    const [equivalentPoints, setEquivalentPoints] = useState(0);
    const [pendingExchanges, setPendingExchanges] = useState([]);
    const [allExchanges, setAllExchanges] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, checkAuthStatus } = useAuth();

    useEffect(() => {
        fetchPending();
        fetchAll();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/api/student/exchange');
            setPendingExchanges(res.data.exchanges || []);
        } catch (e) {
            setErrorMsg('No se pudo cargar canjes pendientes');
        }
    };

    const fetchAll = async () => {
        try {
            const res = await api.get('/api/student/exchange');
            setAllExchanges(res.data.exchanges || []);
        } catch (e) {
            console.error('Error fetching all exchanges:', e);
            // Silenciosamente manejar el error para no interrumpir la UI
        }
    };

    const fetchUser = async () => {
        if (checkAuthStatus) {
            await checkAuthStatus();
        }
    };

    const calculatePoints = (mb) => {
        const points = Number(mb) / exchangeRate;
        setEquivalentPoints(isNaN(points) ? 0 : points);
    };

    const emitSaldoRefresh = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('saldo:refresh'));
        }
    };

    const handleAcademicExchange = async () => {
        if (!academicPoints || Number(academicPoints) <= 0) {
            setErrorMsg('Debes ingresar una cantidad válida mayor a 0 MB');
            return;
        }
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);
        try {
            await api.post('/api/student/exchange', {
                type: 'Puntos Académicos',
                amount: academicPoints,
                description: `Canje de ${academicPoints} MB por puntos académicos`
            });
            setSuccessMsg('Solicitud enviada correctamente');
            setAcademicPoints('');
            setEquivalentPoints(0);
            fetchPending();
            fetchAll();
            await fetchUser(); // Refresca el saldo instantáneamente
            emitSaldoRefresh(); // <-- shimmer
        } catch (e) {
            if (e?.response?.data?.error?.includes('Saldo insuficiente')) {
                setErrorMsg('No tienes suficientes Merlyn Bills para este canje.');
            } else {
                setErrorMsg('Error al solicitar canje');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loadingRate) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
            <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Canjear Merlyn Bills</h2>

            {successMsg && <div className="mb-4 bg-green-100 text-green-800 border border-green-300 font-medium rounded-lg px-4 py-2 animate-slide-up-fade">{successMsg}</div>}
            {errorMsg && <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2 animate-slide-up-fade">{errorMsg}</div>}

            {/* Academic Points Section */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h3 className="text-lg font-bold text-[#3465B4]">Puntos Académicos</h3>
                    <span className="bg-[#C62B34] text-white py-1 px-3 rounded-full text-sm font-bold mt-2 md:mt-0">
                        Tasa: {exchangeRate} MB = 1 punto
                    </span>
                </div>

                <p className="text-gray-700 mb-4">
                    Canjea tus Merlyn Bills por puntos adicionales en tu calificación. Este es el único tipo de canje disponible en el sistema.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-[#3465B4] text-sm font-semibold mb-2">
                            Cantidad a canjear (MB)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                            placeholder="Ingresa la cantidad en MB"
                            min="0.01"
                            value={academicPoints}
                            onChange={(e) => {
                                setAcademicPoints(e.target.value);
                                calculatePoints(e.target.value);
                            }}
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Cantidad mínima: 0.01 MB
                        </p>
                    </div>

                    <div className="bg-white p-4 border-2 border-gray-200 rounded-lg">
                        <label className="block text-[#3465B4] text-sm font-semibold mb-2">
                            Equivale a
                        </label>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-[#C62B34]">
                                {equivalentPoints.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="block text-gray-500 text-sm">puntos académicos</span>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-blue-800 mb-2">ℹ️ Información del Canje</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Los puntos se calculan dividiendo los MB entre la tasa de cambio actual</li>
                        <li>• El canje debe ser aprobado por el administrador</li>
                        <li>• Una vez aprobado, los puntos se aplicarán a tu calificación</li>
                        <li>• Puedes ver el estado de tus solicitudes en la sección de abajo</li>
                    </ul>
                </div>

                <div className="flex justify-center md:justify-end">
                    <button
                        className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white font-bold py-3 px-8 rounded-lg transition-all shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[11.25rem]"
                        onClick={handleAcademicExchange}
                        disabled={loading}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Enviando...' : 'Solicitar Canje'}
                    </button>
                </div>
            </div>

            {/* Pending Exchanges */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-[#3465B4] mb-4">Mis Canjes Pendientes</h3>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <thead className="bg-[#F8D7DA]">
                            <tr>
                                <th className="py-3 px-4 text-left text-[#C62B34] text-sm font-bold">Fecha</th>
                                <th className="py-3 px-4 text-left text-[#C62B34] text-sm font-bold">Tipo de Canje</th>
                                <th className="py-3 px-4 text-right text-[#C62B34] text-sm font-bold">Cantidad</th>
                                <th className="py-3 px-4 text-center text-[#C62B34] text-sm font-bold">Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pendingExchanges.length === 0 && (
                                <tr><td colSpan={4} className="py-4 text-center text-gray-500">No tienes canjes pendientes</td></tr>
                            )}
                            {pendingExchanges.map((exchange, index) => (
                                <tr key={exchange.id || index} className="border-b border-gray-200">
                                    <td className="py-3 px-4 text-gray-700">{new Date(exchange.date).toLocaleString('es-ES')}</td>
                                    <td className="py-3 px-4 text-gray-700">{exchange.type}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{exchange.amount} MB</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">
                                            {exchange.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Todos los Canjes */}
            <div>
                <h3 className="text-lg font-bold text-[#3465B4] mb-4">Historial de mis Canjes</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-gray-700 text-sm font-medium">Fecha</th>
                                <th className="py-3 px-4 text-left text-gray-700 text-sm font-medium">Tipo de Canje</th>
                                <th className="py-3 px-4 text-right text-gray-700 text-sm font-medium">Cantidad</th>
                                <th className="py-3 px-4 text-center text-gray-700 text-sm font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allExchanges.length === 0 && (
                                <tr><td colSpan={4} className="py-4 text-center text-gray-500">No tienes canjes registrados</td></tr>
                            )}
                            {allExchanges.map((exchange, index) => (
                                <tr key={exchange.id || index} className="border-b border-gray-200">
                                    <td className="py-3 px-4 text-gray-700">{new Date(exchange.date).toLocaleString('es-ES')}</td>
                                    <td className="py-3 px-4 text-gray-700">{exchange.type}</td>
                                    <td className="py-3 px-4 text-right text-gray-700">{exchange.amount} MB</td>
                                    <td className="py-3 px-4 text-center">
                                        {exchange.status === 'Pendiente' && (
                                            <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs">Pendiente</span>
                                        )}
                                        {exchange.status === 'Aprobado' && (
                                            <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs">Aprobado</span>
                                        )}
                                        {exchange.status === 'Rechazado' && (
                                            <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-xs">Rechazado</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentExchangeBills;

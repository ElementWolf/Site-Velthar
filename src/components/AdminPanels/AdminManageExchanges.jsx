import { useState, useEffect } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';

const AdminManageExchanges = () => {
    const [exchangeRate, setExchangeRate] = useState(100);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchExchangeRate();
    }, []);

    const fetchExchangeRate = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/exchange-rate');
            setExchangeRate(res.data.rate);
        } catch (e) {
            setErrorMsg('Error al cargar la tasa de cambio');
            setTimeout(() => setErrorMsg(''), 3000);
        } finally { 
            setLoading(false); 
        }
    };

    const handleExchangeRateChange = (e) => {
        setExchangeRate(e.target.value);
    };

    const handleSaveExchangeRate = async () => {
        try {
            setLoading(true);
            await api.post('/api/admin/exchange-rate', { rate: exchangeRate });
            setSuccessMsg('¡Tasa de cambio guardada correctamente!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (e) {
            setErrorMsg('Error al guardar la tasa de cambio');
            setTimeout(() => setErrorMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
            <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Configuración de Canjes</h2>

            {successMsg && (
                <div className="bg-green-100 text-green-800 border border-green-300 px-4 py-2 rounded-lg mb-4 text-center font-medium">
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] px-4 py-2 rounded-lg mb-4 text-center font-medium">
                    {errorMsg}
                </div>
            )}

            {/* Exchange Configuration */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#3465B4] mb-4">Canje por Puntos Académicos</h3>
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-[#3465B4]">Puntos Académicos</h4>
                        <span className="bg-[#C62B34] text-white py-1 px-3 rounded-full text-sm font-bold">
                            Canje Principal
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-[#3465B4] text-sm font-semibold mb-2">
                                Tasa de Cambio (MB por 1 punto)
                            </label>
                            <input
                                type="number"
                                min="1"
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                                value={exchangeRate}
                                onChange={handleExchangeRateChange}
                                placeholder="Ej: 100"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Actualmente: {exchangeRate} MB = 1 punto académico
                            </p>
                        </div>
                        <div>
                            <label className="block text-[#3465B4] text-sm font-semibold mb-2">
                                Ejemplo de Conversión
                            </label>
                            <div className="bg-white p-3 border-2 border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>100 MB</strong> = <strong>{(100 / exchangeRate).toFixed(2)} puntos</strong>
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>500 MB</strong> = <strong>{(500 / exchangeRate).toFixed(2)} puntos</strong>
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>1000 MB</strong> = <strong>{(1000 / exchangeRate).toFixed(2)} puntos</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold text-blue-800 mb-2">ℹ️ Información del Canje</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Los estudiantes pueden canjear sus Merlyn Bills por puntos académicos</li>
                            <li>• Los puntos se calculan dividiendo los MB entre la tasa de cambio</li>
                            <li>• Este es el único tipo de canje disponible en el sistema</li>
                            <li>• Los canjes deben ser aprobados por el administrador</li>
                        </ul>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveExchangeRate}
                            disabled={loading}
                            className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white font-bold py-3 px-8 rounded-lg transition-all shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : 'Guardar Tasa de Cambio'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminManageExchanges;

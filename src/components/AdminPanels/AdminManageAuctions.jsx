import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';

const AdminManageAuctions = () => {
    const [auctionData, setAuctionData] = useState({
        title: '',
        basePrice: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    const { data, loading, error, refetch } = useApi('/api/admin/auctions');
    const auctions = data?.auctions || [];
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setActionError('');
        setSuccess('');
        
        // Validaciones básicas
        if (!auctionData.title || !auctionData.basePrice || !auctionData.startDate || !auctionData.endDate) {
            setActionError('Todos los campos obligatorios deben estar completos');
            setActionLoading(false);
            return;
        }
        
        if (new Date(auctionData.endDate) <= new Date(auctionData.startDate)) {
            setActionError('La fecha de finalización debe ser posterior a la de inicio');
            setActionLoading(false);
            return;
        }
        
        try {
            const response = await api.post('/api/admin/auctions', {
                ...auctionData,
                createdBy: 'admin'
            });
            
            if (response.data.success) {
                setSuccess('Subasta creada correctamente');
                setAuctionData({ title: '', basePrice: '', description: '', startDate: '', endDate: '' });
                refetch();
            } else {
                setActionError(response.data.message || 'Error al crear subasta');
            }
        } catch (e) {
            console.error('Error creating auction:', e);
            setActionError(e?.response?.data?.message || 'Error al crear subasta');
        }
        setActionLoading(false);
    };

    const handleInputChange = (e) => {
        setAuctionData({
            ...auctionData,
            [e.target.id]: e.target.value
        });
    };

    const handleStatus = async (id, status) => {
        setActionLoading(true);
        setActionError('');
        setSuccess('');
        try {
            const response = await api.patch('/api/admin/auctions', { id, status });
            if (response.data.success) {
                setSuccess('Subasta actualizada correctamente');
                refetch();
            } else {
                setActionError(response.data.message || 'Error al actualizar subasta');
            }
        } catch (e) {
            console.error('Error updating auction:', e);
            setActionError(e?.response?.data?.message || 'Error al actualizar subasta');
        }
        setActionLoading(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
            <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Gestión de Subastas</h2>
            
            {error && (
                <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2">
                    Error al cargar subastas: {error}
                </div>
            )}
            
            {actionError && (
                <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2">
                    {actionError}
                </div>
            )}
            
            {success && (
                <div className="mb-4 bg-green-100 text-green-800 border border-green-300 font-medium rounded-lg px-4 py-2">
                    {success}
                </div>
            )}
            
            {/* Active Auctions */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-[#3465B4] mb-4">Subastas Activas</h3>
                {auctions.length === 0 ? (
                    <div className="text-gray-500 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-6 text-center">
                        No hay subastas activas.
                    </div>
                ) : (
                    auctions.map((auction) => (
                        <div key={auction.id} className="flex items-stretch mb-4">
                            {/* Red Decorative Bar */}
                            <div className="w-2 bg-gradient-to-b from-[#C62B34] to-[#a81e28] relative rounded-l-xl">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap">
                                    <span className="text-white font-mono font-bold text-sm"></span>
                                </div>
                            </div>
                            {/* Auction Card */}
                            <div className="bg-gradient-to-br from-[#F8D7DA] to-[#F3F4F6] p-6 rounded-r-xl flex-1 border border-[#F3F4F6] shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <h4 className="text-lg font-bold text-[#3465B4]">{auction.title}</h4>
                                    <span className="bg-[#C62B34] text-white px-3 py-1 rounded-full text-sm font-bold mt-2 md:mt-0">{auction.status}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white rounded-lg p-3 border border-[#F3F4F6]">
                                        <p className="text-sm text-gray-500 mb-1">Precio base</p>
                                        <p className="font-bold text-[#C62B34]">{auction.basePrice} MB</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-[#F3F4F6]">
                                        <p className="text-sm text-gray-500 mb-1">Oferta más alta</p>
                                        <p className="font-bold text-[#3465B4]">{auction.highestBid} MB</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-[#F3F4F6]">
                                        <p className="text-sm text-gray-500 mb-1">Finaliza</p>
                                        <p className="font-medium text-gray-700">{new Date(auction.endDate).toLocaleString('es-ES')}</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <h5 className="font-bold text-[#3465B4] mb-3">Ofertas recibidas</h5>
                                    <div className="bg-white rounded-lg p-4 max-h-40 overflow-y-auto border border-[#F3F4F6]">
                                        {auction.bids && auction.bids.length === 0 ? (
                                            <span className="text-gray-400">Sin ofertas</span>
                                        ) : (
                                            (auction.bids || []).map((bid, bidIndex) => (
                                                <div key={bidIndex} className="flex justify-between items-center py-2 border-b border-[#F3F4F6] last:border-b-0">
                                                    <span className="text-gray-700 font-medium">{bid.firstName} {bid.lastName}</span>
                                                    <span className="font-bold text-[#C62B34]">{bid.amount} MB</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    {auction.status === 'Activa' && (
                                        <button 
                                            className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white px-4 py-2 rounded-lg font-bold transition-all shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed" 
                                            onClick={() => handleStatus(auction.id, 'Finalizada')} 
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Procesando...' : 'Finalizar'}
                                        </button>
                                    )}
                                    {auction.status === 'Activa' && (
                                        <button 
                                            className="bg-[#3465B4] hover:bg-[#2a4f8f] text-white px-4 py-2 rounded-lg font-bold transition-all shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed" 
                                            onClick={() => handleStatus(auction.id, 'Cancelada')} 
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? 'Procesando...' : 'Cancelar'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Create New Auction */}
            <div>
                <h3 className="text-lg font-bold text-[#3465B4] mb-4">Crear Nueva Subasta</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#3465B4] text-sm font-semibold mb-2">Título de la Subasta *</label>
                            <input 
                                id="title" 
                                type="text" 
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#C62B34] transition-all bg-white" 
                                placeholder="Ej: Punto Extra en Examen Final" 
                                value={auctionData.title} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[#3465B4] text-sm font-semibold mb-2">Precio Base (MB) *</label>
                            <input 
                                id="basePrice" 
                                type="number" 
                                min="1"
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#C62B34] transition-all bg-white" 
                                placeholder="Ej: 100" 
                                value={auctionData.basePrice} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[#3465B4] text-sm font-semibold mb-2">Descripción</label>
                        <textarea 
                            id="description" 
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#C62B34] transition-all bg-white" 
                            rows="3" 
                            placeholder="Descripción detallada de lo que se subasta..." 
                            value={auctionData.description} 
                            onChange={handleInputChange} 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#3465B4] text-sm font-semibold mb-2">Fecha de Inicio *</label>
                            <input 
                                id="startDate" 
                                type="date" 
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#C62B34] transition-all bg-white" 
                                value={auctionData.startDate} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-[#3465B4] text-sm font-semibold mb-2">Fecha de Finalización *</label>
                            <input 
                                id="endDate" 
                                type="date" 
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#C62B34] transition-all bg-white" 
                                value={auctionData.endDate} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white px-6 py-3 rounded-lg font-bold transition-all shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed" 
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Creando...' : 'Crear Subasta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminManageAuctions;
import { useState } from 'react';
import api from '@/axios';
import { useAuth } from '@/contexts/UserAuthContext';
import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';

const StudentAuctions = () => {
    const { user } = useAuth();
    const { data, loading, error, refetch } = useApi('/api/student/auctions');
    const auctions = data?.auctions || [];
    const [success, setSuccess] = useState('');
    const [bidAmount, setBidAmount] = useState({}); // auctionId: valor
    const [bidLoading, setBidLoading] = useState(false);
    const [bidError, setBidError] = useState('');

    const handleBid = async (auction) => {
        if (!bidAmount[auction.id] || Number(bidAmount[auction.id]) <= Number(auction.highestBid)) {
            setBidError('La oferta debe ser mayor a la oferta más alta actual');
            return;
        }

        setBidLoading(true);
        setBidError('');
        setSuccess('');
        
        try {
            const response = await api.post('/api/student/auctions', {
                auctionId: auction.id,
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                amount: bidAmount[auction.id]
            });
            
            if (response.data.success) {
                setSuccess('Oferta realizada correctamente');
                setBidAmount({ ...bidAmount, [auction.id]: '' });
                refetch();
            } else {
                setBidError(response.data.message || 'Error al realizar oferta');
            }
        } catch (e) {
            console.error('Error placing bid:', e);
            setBidError(e?.response?.data?.message || 'Error al realizar oferta');
        }
        setBidLoading(false);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
            <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Subastas Activas</h2>
            
            {error && (
                <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2">
                    Error al cargar subastas: {error}
                </div>
            )}
            
            {bidError && (
                <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2">
                    {bidError}
                </div>
            )}
            
            {success && (
                <div className="mb-4 bg-green-100 text-green-800 border border-green-300 font-medium rounded-lg px-4 py-2">
                    {success}
                </div>
            )}
            
            {auctions.length === 0 ? (
                <div className="text-gray-500 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-6 text-center">
                    No hay subastas activas en este momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {auctions.map((auction) => (
                        <div key={auction.id} className="bg-[#F8D7DA]/60 border border-[#F3F4F6] rounded-xl p-6 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-[#C62B34] text-white text-xs font-bold">{auction.status}</span>
                            </div>
                            <h3 className="text-lg font-bold text-[#3465B4] mb-1">{auction.title}</h3>
                            <p className="text-gray-700 mb-2">{auction.description}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-[#C62B34]">{auction.highestBid} MB</span>
                                <input
                                    type="number"
                                    className="w-24 p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all mr-2"
                                    placeholder={`>${auction.highestBid}`}
                                    value={bidAmount[auction.id] || ''}
                                    min={auction.highestBid + 1}
                                    onChange={e => setBidAmount({ ...bidAmount, [auction.id]: e.target.value })}
                                    disabled={bidLoading}
                                />
                                <button
                                    className="bg-[#C62B34] hover:bg-[#a81e28] text-white font-bold py-2 px-6 rounded-xl transition-all shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[6.25rem]"
                                    onClick={() => handleBid(auction)}
                                    disabled={bidLoading || !bidAmount[auction.id] || Number(bidAmount[auction.id]) <= Number(auction.highestBid)}
                                >
                                    {bidLoading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                            Ofertando...
                                        </span>
                                    ) : (
                                        'Ofertar'
                                    )}
                                </button>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-medium mb-2 text-[#3465B4]">Historial de Ofertas</h4>
                                <div className="bg-white rounded-lg p-3 max-h-32 overflow-y-auto">
                                    {auction.bids && auction.bids.length === 0 ? (
                                        <span className="text-gray-400">Sin ofertas</span>
                                    ) : (
                                        (auction.bids || []).slice().reverse().map((bid, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-1">
                                                <span className="text-gray-700">{bid.firstName} {bid.lastName}</span>
                                                <span className="font-medium text-gray-800">{bid.amount} MB</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentAuctions;
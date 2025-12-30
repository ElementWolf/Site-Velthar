import api from '@/axios';
import { useAuth } from '@/contexts/UserAuthContext';
import StudentAuctions from '@/components/StudentPanels/StudentAuctions';
import StudentExchangeBills from '@/components/StudentPanels/StudentExchangeBills';
import StudentTransactionHistory from '@/components/StudentPanels/StudentTransactionHistory';
import StudentPublicStats from '@/components/StudentPanels/StudentPublicStats';
import StudentAnnouncements from '@/components/StudentPanels/StudentAnnouncements';
import React, { useEffect, useState } from 'react';

function SaldoShimmer() {
  return (
    <span className="block w-32 h-10 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded animate-pulse mb-6" />
  );
}

function StudentPage() {
    const { user } = useAuth();
    const [userPoints, setUserPoints] = useState(0);
    const [activeTab, setActiveTab] = useState('historial');
    const [saldoLoading, setSaldoLoading] = useState(false);
    const [pendingAmount, setPendingAmount] = useState(0);
    const [committedPoints, setCommittedPoints] = useState(0);

    // Función para refrescar el saldo desde el backend
    const refreshSaldo = async () => {
        setSaldoLoading(true);
        try {
            const res = await api.get(`/api/student/points?userId=${user.id}`);
            if (res.data.success) {
            setUserPoints(res.data.points);
                setCommittedPoints(res.data.committedPoints || 0);
            }
            // Consultar canjes pendientes
            const pend = await api.get('/api/student/exchange');
            const pending = pend.data.exchanges || [];
            const totalPending = pending.reduce((acc, ex) => acc + Number(ex.amount || 0), 0);
            setPendingAmount(totalPending);
        } catch {}
        setTimeout(() => setSaldoLoading(false), 500); // shimmer mínimo 0.5s
    };

    useEffect(() => {
        if (user && typeof user.points !== 'undefined') {
            setUserPoints(user.points);
        } else {
            refreshSaldo();
        }
        // eslint-disable-next-line
    }, [user]);

    // Escuchar eventos de actualización de saldo desde los paneles hijos
    useEffect(() => {
        const handler = () => refreshSaldo();
        window.addEventListener('saldo:refresh', handler);
        return () => window.removeEventListener('saldo:refresh', handler);
    }, []);

    return (
        <div className="grow flex flex-col md:flex-row p-4 md:p-6 bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD] min-h-screen">
            {/* Left Panel */}
            <div className="w-full md:w-1/4 bg-white border border-[#F3F4F6] rounded-2xl p-6 shadow-md mb-4 md:mb-0 flex flex-col gap-6">
                {/* Saldo */}
                <div>
                    <h2 className="text-lg font-bold text-[#3465B4] mb-4">Mi Saldo</h2>
                    {saldoLoading ? <SaldoShimmer /> : <>
                      <p className="text-3xl font-bold text-[#C62B34] mb-1">{userPoints} MB</p>
                      {(pendingAmount > 0 || committedPoints > 0) && (
                        <div className="text-sm text-gray-600 mb-5">
                      {pendingAmount > 0 && (
                            <p className="text-yellow-600">-({pendingAmount} MB pendientes de canje)</p>
                      )}
                          {committedPoints > 0 && (
                            <p className="text-blue-600">-({committedPoints} MB comprometidos en subastas)</p>
                          )}
                        </div>
                      )}
                      {(pendingAmount === 0 && committedPoints === 0) && <div className="mb-5" />}
                    </>}
                </div>

                {/* Anuncios */}
                <div>
                    <StudentAnnouncements />
                </div>

                {/* Panel de Control */}
                <div>
                    <h3 className="text-md font-semibold text-[#3465B4] mb-2">Panel de Control</h3>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => setActiveTab('historial')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'historial' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Mi Historial
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('canjear')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'canjear' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Canjear Merlyn Bills
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('subastas')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'subastas' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Subastas
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('publico')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'publico' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Ranking, Estadísticas y Logros
                        </button>
                    </li>
                </ul>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-3/4 md:ml-8 bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 md:p-10 animate-slide-up-fade">
                {activeTab === 'historial' && (
                    <StudentTransactionHistory onAction={refreshSaldo} />
                )}
                {activeTab === 'canjear' && (
                    <StudentExchangeBills onAction={refreshSaldo} />
                )}
                {activeTab === 'subastas' && (
                    <StudentAuctions onAction={refreshSaldo} />
                )}
                {activeTab === 'publico' && (
                    <StudentPublicStats />
                )}
            </div>
        </div>
    );
}

export default StudentPage;

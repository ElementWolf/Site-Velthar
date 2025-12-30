"use client"

import AdminManageAuctions from '@/components/AdminPanels/AdminManageAuctions';
import AdminManageBills from '@/components/AdminPanels/AdminManageBills';
import AdminManageExchanges from '@/components/AdminPanels/AdminManageExchanges';
import AdminTransactionHistory from '@/components/AdminPanels/AdminTransactionHistory';
import AdminExchangeRequests from '@/components/AdminPanels/AdminExchangeRequests';
import AdminRegistrationRequests from '@/components/AdminPanels/AdminRegistrationRequests';
import AdminManageStudents from '@/components/AdminPanels/AdminManageStudents';
import StudentPublicStats from '@/components/StudentPanels/StudentPublicStats';
import AdminExtraTools from '@/components/AdminPanels/AdminExtraTools';
import React, { useState, useEffect } from 'react'

function AdminPage() {
    const [activeTab, setActiveTab] = useState('asignar');
    const [isClient, setIsClient] = useState(false);

    // Asegurar que estamos en el cliente
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Si no estamos en el cliente, mostrar loading
    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62B34] mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando panel de administración...</p>
                </div>
            </div>
        );
    }

    const renderActiveTab = () => {
        try {
            switch (activeTab) {
                case 'asignar':
                    return <AdminManageBills />;
                case 'registros':
                    return <AdminRegistrationRequests />;
                case 'estudiantes':
                    return <AdminManageStudents />;
                case 'historial':
                    return <AdminTransactionHistory />;
                case 'canjes':
                    return (
                        <>
                            <AdminManageExchanges />
                            <AdminExchangeRequests />
                        </>
                    );
                case 'subastas':
                    return <AdminManageAuctions />;
                case 'publico':
                    return (
                        <>
                            <StudentPublicStats />
                            <AdminExtraTools />
                        </>
                    );
                default:
                    return <AdminManageBills />;
            }
        } catch (error) {
            console.error('Error rendering tab:', error);
            return (
                <div className="text-center p-8">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Error al cargar el panel</h3>
                    <p className="text-gray-600">Ha ocurrido un error inesperado. Por favor, intenta cambiar de pestaña.</p>
                </div>
            );
        }
    };

    return (
        <div className="grow flex flex-col md:flex-row p-4 md:p-6 bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD] min-h-screen">
            {/* Left Panel */}
            <div className="w-full md:w-1/4 bg-white border border-[#F3F4F6] rounded-2xl p-6 shadow-md mb-4 md:mb-0">
                <h3 className="text-lg font-bold text-[#3465B4] mb-4">Panel de Control</h3>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => setActiveTab('asignar')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'asignar' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Asignar Merlyn Bills
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('registros')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'registros' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Solicitudes de Registro
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('estudiantes')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'estudiantes' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Estudiantes
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('historial')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'historial' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Historial de Transacciones
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('canjes')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'canjes' ? 'bg-[#F8D7DA] text-[#C62B34] shadow' : 'text-gray-700 hover:bg-[#F3F4F6] hover:text-[#C62B34]'}`}
                        >
                            Gestionar Canjes
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

            {/* Right Panel */}
            <div className="w-full md:w-3/4 md:ml-8 bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 md:p-10 animate-slide-up-fade">
                {renderActiveTab()}
            </div>
        </div>
    );
}

export default AdminPage
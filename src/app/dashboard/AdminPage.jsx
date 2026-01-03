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
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">Accediendo a la Base de Datos de la Fundación...</p>
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
        <div className="grow flex flex-col md:flex-row p-2 sm:p-4 md:p-6 bg-black text-white min-h-screen overflow-x-hidden">
            {/* Left Panel */}
            <div className="w-full md:w-1/4 bg-gray-900 border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-md mb-4 md:mb-0">
                <h3 className="text-lg font-bold text-red-500 mb-4">Centro de Comando O5</h3>
                
                {/* Estado del Sitio */}
                <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                    <h4 className="text-md font-semibold text-red-400 mb-2">Estado del Sitio</h4>
                    <p className="text-green-400 text-sm font-bold">SEGURIDAD: VERDE</p>
                    <p className="text-gray-400 text-xs mt-1">
                        Todas las anomalías contenidas. Operaciones normales.
                    </p>
                </div>
                
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => setActiveTab('asignar')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'asignar' ? 'bg-red-900 text-red-300 shadow' : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'}`}
                        >
                            Terminal de registro
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('registros')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'registros' ? 'bg-red-900 text-red-300 shadow' : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'}`}
                        >
                            Terminal de auditoría
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('estudiantes')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'estudiantes' ? 'bg-red-900 text-red-300 shadow' : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'}`}
                        >
                            Base de Datos de Personal
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('historial')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'historial' ? 'bg-red-900 text-red-300 shadow' : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'}`}
                        >
                            Registros de Contención
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('canjes')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'canjes' ? 'bg-red-900 text-red-300 shadow' : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'}`}
                        >
                            Intercambios de Recursos
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('subastas')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'subastas' ? 'bg-red-900 text-red-300 shadow' : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'}`}
                        >
                            Subastas de Anomalías
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setActiveTab('publico')}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-all font-medium ${activeTab === 'publico' ? 'bg-red-900 text-red-300 shadow' : 'text-gray-300 hover:bg-gray-800 hover:text-red-400'}`}
                        >
                            Informes de Campo
                        </button>
                    </li>
                </ul>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-3/4 md:ml-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 animate-slide-up-fade text-white overflow-x-auto">
                {renderActiveTab()}
            </div>
        </div>
    );
}

export default AdminPage
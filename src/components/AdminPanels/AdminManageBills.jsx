import api from '@/axios';
import { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const AdminManageBills = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        id: '',
        password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.id.trim() || !formData.password.trim()) {
            setErrorMsg('Todos los campos son obligatorios.');
            return;
        }
        
        if (!/^\d+$/.test(formData.id.trim())) {
            setErrorMsg('La cédula debe contener solo números.');
            return;
        }
        
        if (formData.password.length < 6) {
            setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await api.post('/auth/register', {
                id: formData.id.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                password: formData.password
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setFormData({ firstName: '', lastName: '', id: '', password: '' });
            setSuccessMsg('Agente registrado exitosamente en la Base de Datos de la Fundación.');
        } catch (e) {
            const errorMessage = e.response?.data?.message || 'Error al registrar estudiante.';
            setErrorMsg(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 mb-6 animate-slide-up-fade">
            {/* Header con acento rojo SCP */}
            <div className="border-b-2 border-[#C62B34] pb-4 mb-6">
                <h2 className="text-2xl font-black text-[#C62B34] uppercase tracking-tighter">
                    Terminal de Registro - Nivel de Acceso O5
                </h2>
                <p className="text-gray-500 text-sm italic font-mono">Clasificación: Top Secret // Solo Personal Autorizado</p>
            </div>

            {/* Mensajes de Estado */}
            {errorMsg && (
                <div className="mb-4 bg-red-50 text-[#C62B34] border-l-4 border-[#C62B34] font-medium rounded-r-lg px-4 py-3 text-sm flex items-center">
                    <span className="mr-2">⚠️</span> {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500 font-medium rounded-r-lg px-4 py-3 text-sm flex items-center">
                    <span className="mr-2">✅</span> {successMsg}
                </div>
            )}

            {/* Registration Form - Fondo Gris Técnico */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-md font-bold text-gray-700 mb-6 uppercase tracking-widest border-b border-gray-200 pb-2">
                    Credenciales del Nuevo Agente
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-600 text-xs font-bold uppercase mb-2">Nombre</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] focus:ring-1 focus:ring-[#C62B34] transition-all bg-white"
                            placeholder="Nombre"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-600 text-xs font-bold uppercase mb-2">Apellido</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] focus:ring-1 focus:ring-[#C62B34] transition-all bg-white"
                            placeholder="Apellido"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-600 text-xs font-bold uppercase mb-2">Cédula (ID)</label>
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] focus:ring-1 focus:ring-[#C62B34] transition-all bg-white font-mono"
                            placeholder="Ej: 80123456"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-600 text-xs font-bold uppercase mb-2">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] focus:ring-1 focus:ring-[#C62B34] transition-all bg-white"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                
                <div className="bg-slate-800 border-l-4 border-yellow-500 rounded-lg p-4">
                    <p className="text-white text-[11px] font-mono leading-tight">
                        <span className="text-yellow-400 font-bold">PROTOCOLO DE SEGURIDAD:</span> El nuevo agente será asignado a la Clase-D hasta su validación oficial por el consejo. Todo intento de registro falso será rastreado por la IA de la Fundación.
                    </p>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button 
                    onClick={handleRegister} 
                    disabled={submitting}
                    className="bg-[#C62B34] hover:bg-[#a81e28] text-white font-black py-4 px-10 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center gap-3 border-b-4 border-[#8b1a22]"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Procesando...
                        </>
                    ) : (
                        'Autorizar Registro'
                    )}
                </button>
            </div>
        </div>
    );
};

export default AdminManageBills;
import api from '@/axios';
import { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const AdminManageBills = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        id: '',
        password: '',
        accessLevel: '', // Nuevo campo
        department: ''   // Nuevo campo
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
        
        // Validación de campos obligatorios (incluyendo los nuevos)
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.id.trim() || 
            !formData.password.trim() || !formData.accessLevel || !formData.department) {
            setErrorMsg('Todos los campos son obligatorios, incluyendo nivel y departamento.');
            return;
        }
        
        if (!/^\d+$/.test(formData.id.trim())) {
            setErrorMsg('La identidad debe contener solo números.');
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
                password: formData.password,
                role: formData.accessLevel, // Enviando nivel como rol
                department: formData.department // Enviando departamento
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Limpiar formulario
            setFormData({ 
                firstName: '', 
                lastName: '', 
                id: '', 
                password: '', 
                accessLevel: '', 
                department: '' 
            });
            setSuccessMsg('Agente registrado exitosamente en la Base de Datos de la Fundación.');
        } catch (e) {
            const errorMessage = e.response?.data?.message || 'Error al registrar agente.';
            setErrorMsg(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = "w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] focus:ring-1 focus:ring-[#C62B34] transition-all bg-white text-gray-900 placeholder-gray-400 appearance-none";

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 mb-6 animate-slide-up-fade">
            {/* Header */}
            <div className="border-b-2 border-[#C62B34] pb-4 mb-6 text-left">
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

            {/* Registration Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-md font-bold text-gray-700 mb-6 uppercase tracking-widest border-b border-gray-200 pb-2 text-left">
                    Credenciales del Nuevo Agente
                </h3>
                
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="text-left">
                        <label className="block text-gray-700 text-xs font-bold uppercase mb-2">Nombre</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={inputStyle}
                            placeholder="Nombre del Agente"
                        />
                    </div>
                    
                    <div className="text-left">
                        <label className="block text-gray-700 text-xs font-bold uppercase mb-2">Apellido</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={inputStyle}
                            placeholder="Apellido del Agente"
                        />
                    </div>
                </div>
                
                {/* ID y Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="text-left">
                        <label className="block text-gray-700 text-xs font-bold uppercase mb-2">Identificación</label>
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            className={`${inputStyle} font-mono`}
                            placeholder="Ej: 80123456"
                        />
                    </div>
                    
                    <div className="text-left">
                        <label className="block text-gray-700 text-xs font-bold uppercase mb-2">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={inputStyle}
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {/* NUEVOS INPUTS: Nivel de Acceso y Departamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="text-left">
                        <label className="block text-gray-700 text-xs font-bold uppercase mb-2">Nivel de Acceso</label>
                        <select
                            name="accessLevel"
                            value={formData.accessLevel}
                            onChange={handleInputChange}
                            className={inputStyle}
                        >
                            <option value="">Seleccionar Nivel...</option>
                            <option value="1">Nivel 1 (Personal de Clase D)</option>
                            <option value="2">Nivel 2 (Investigador Jr)</option>
                            <option value="3">Nivel 3 (Agente de Campo)</option>
                            <option value="4">Nivel 4 (Director de Sitio)</option>
                            <option value="5">Nivel 5 (Consejo O5)</option>
                        </select>
                    </div>
                    
                    <div className="text-left">
                        <label className="block text-gray-700 text-xs font-bold uppercase mb-2">Departamento / Rol</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className={inputStyle}
                        >
                            <option value="">Seleccionar Área...</option>
                            <optgroup label="Operaciones">
                                <option value="logistica">Logística / Gois</option>
                                <option value="seguridad">Seguridad Interna</option>
                                <option value="contencion">Equipos de Contención</option>
                            </optgroup>
                            <optgroup label="Científico">
                                <option value="investigacion">Investigación y Desarrollo</option>
                                <option value="medico">Departamento Médico</option>
                            </optgroup>
                            <optgroup label="Administrativo">
                                <option value="rrhh">Recursos Humanos</option>
                                <option value="it">Sistemas / IT</option>
                            </optgroup>
                        </select>
                    </div>
                </div>
                
                <div className="bg-slate-800 border-l-4 border-yellow-500 rounded-lg p-4 text-left">
                    <p className="text-white text-[11px] font-mono leading-tight">
                        <span className="text-yellow-400 font-bold">PROTOCOLO DE SEGURIDAD:</span> Asegúrese de que el nuevo agente haya obtenido su validación oficial. Las credenciales creadas aquí deben ser manejadas con la máxima confidencialidad.
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
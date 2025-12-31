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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        
        // Validaciones básicas
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
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setFormData({
                firstName: '',
                lastName: '',
                id: '',
                password: ''
            });
            setSuccessMsg('Estudiante registrado exitosamente en la Base de Datos de la Fundación.');
        } catch (e) {
            console.error('Error registering student:', e);
            const errorMessage = e.response?.data?.message || 'Error al registrar estudiante.';
            setErrorMsg(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 mb-6 animate-slide-up-fade">
            <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Registro de Personal - Nivel O5</h2>

            {errorMsg && <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2 animate-slide-up-fade">{errorMsg}</div>}
            {successMsg && <div className="mb-4 bg-green-100 text-green-800 border border-green-300 font-medium rounded-lg px-4 py-2 animate-slide-up-fade">{successMsg}</div>}

            {/* Registration Form */}
            <div className="bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#3465B4] mb-4">Datos del Nuevo Agente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-[#3465B4] font-medium mb-2">Nombre</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                            placeholder="Ingrese el nombre"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[#3465B4] font-medium mb-2">Apellido</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                            placeholder="Ingrese el apellido"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-[#3465B4] font-medium mb-2">Cédula</label>
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                            placeholder="Número de identificación"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[#3465B4] font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                            placeholder="Contraseña segura"
                        />
                    </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                        <strong>Nota de Seguridad:</strong> La contraseña debe tener al menos 6 caracteres. 
                        El nuevo agente será registrado con Nivel de Acceso 1 y requerirá aprobación final.
                    </p>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button 
                    onClick={handleRegister} 
                    disabled={submitting}
                    className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transform hover:shadow-xl flex items-center justify-center gap-2 min-w-[13.75rem]"
                >
                    {submitting && (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {submitting ? 'Registrando...' : 'Registrar Agente'}
                </button>
            </div>
        </div>
    );
};

export default AdminManageBills;
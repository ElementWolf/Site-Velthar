import api from '@/axios';
import { useState, useEffect } from 'react';

const AdminManageBills = () => {
    // Lógica de departamentos dinámicos
    const [departments, setDepartments] = useState(['Científico']); 
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        id: '',
        password: '',
        accessLevel: '1',
        department: 'Científico'
    });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    // Cargar departamentos desde la base de datos
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/api/admin/departments'); 
                if (res.data && res.data.length > 0) {
                    setDepartments(res.data);
                    setFormData(prev => ({ ...prev, department: res.data[0] }));
                }
            } catch (err) {
                console.log("Usando departamentos por defecto (Científico).");
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        // Validación de identidad numérica y longitud (características del original)
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.id.trim() || !formData.password.trim()) {
            setStatus({ loading: false, error: 'TODOS LOS CAMPOS SON OBLIGATORIOS.', success: '' });
            return;
        }
        
        if (!/^\d+$/.test(formData.id.trim())) {
            setStatus({ loading: false, error: 'LA IDENTIDAD DEBE CONTENER SOLO NÚMEROS.', success: '' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await api.post('/auth/register', {
                id: formData.id.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                password: formData.password,
                role: formData.accessLevel,
                department: formData.department
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setStatus({ 
                loading: false, 
                error: '', 
                success: 'AGENTE REGISTRADO EXITOSAMENTE EN LA BASE DE DATOS DE LA FUNDACIÓN.' 
            });
            
            setFormData(prev => ({ ...prev, firstName: '', lastName: '', id: '', password: '' }));
        } catch (err) {
            const msg = err.response?.data?.message || 'FALLO EN EL REGISTRO DEL AGENTE.';
            setStatus({ loading: false, error: msg.toUpperCase(), success: '' });
        }
    };

    // Estilos SCP Originales
    const inputClass = "w-full p-3 border-2 border-gray-700 rounded-lg bg-black text-white focus:border-red-600 outline-none font-mono transition-all placeholder-gray-800 appearance-none";
    const labelClass = "block text-gray-400 text-xs font-bold uppercase mb-2 tracking-widest";

    return (
        <div className="bg-black border border-gray-800 rounded-2xl shadow-2xl p-8 mb-6 animate-slide-up-fade text-left">
            {/* Header Terminal */}
            <div className="border-b-2 border-red-600 pb-4 mb-6">
                <h2 className="text-2xl font-black text-red-600 uppercase tracking-tighter">
                    Terminal de Registro - Nivel de Acceso O5
                </h2>
                <p className="text-gray-500 text-sm italic font-mono">Clasificación: Top Secret // Solo Personal Autorizado</p>
            </div>

            {/* Mensajes de Estado */}
            {status.error && (
                <div className="mb-4 bg-red-900/20 text-red-500 border-l-4 border-red-600 font-medium rounded-r-lg px-4 py-3 text-sm flex items-center font-mono">
                    <span className="mr-2">⚠️</span> {status.error}
                </div>
            )}
            {status.success && (
                <div className="mb-4 bg-green-900/20 text-green-500 border-l-4 border-green-500 font-medium rounded-r-lg px-4 py-3 text-sm flex items-center font-mono">
                    <span className="mr-2">✅</span> {status.success}
                </div>
            )}

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                <h3 className="text-md font-bold text-gray-400 mb-6 uppercase tracking-widest border-b border-gray-800 pb-2">
                    Credenciales del Nuevo Agente
                </h3>
                
                <form onSubmit={handleRegister}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className={labelClass}>Nombre</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="NOMBRE"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Apellido</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="APELLIDO"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className={labelClass}>Identificación</label>
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                className={`${inputClass} font-mono`}
                                placeholder="ID NUMÉRICO"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className={labelClass}>Nivel de Acceso</label>
                            <select
                                name="accessLevel"
                                value={formData.accessLevel}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="1">NIVEL 1</option>
                                <option value="2">NIVEL 2</option>
                                <option value="3">NIVEL 3</option>
                                <option value="4">NIVEL 4</option>
                                <option value="5">NIVEL 5 (O5)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Departamento / Rol</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>{dept.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Mensaje de Protocolo */}
                    <div className="bg-gray-800 border-l-4 border-yellow-600 rounded-lg p-4 mb-6">
                        <p className="text-white text-[11px] font-mono leading-tight">
                            <span className="text-yellow-500 font-bold">PROTOCOLO DE SEGURIDAD:</span> Asegúrese de que el nuevo agente haya obtenido su validación oficial. Las credenciales creadas aquí deben ser manejadas con la máxima confidencialidad.
                        </p>
                    </div>

                    <div className="flex justify-end border-t border-gray-800 pt-6">
                        <button 
                            type="submit" 
                            disabled={status.loading}
                            className="bg-red-700 hover:bg-red-600 text-white font-black py-4 px-10 rounded-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs flex items-center gap-3 border-b-4 border-red-900"
                        >
                            {status.loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Sincronizando...
                                </>
                            ) : (
                                'Autorizar Registro'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminManageBills;
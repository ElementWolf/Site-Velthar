import api from '@/axios';
import { useState, useEffect } from 'react';

const AdminManageBills = () => {
    const [departments, setDepartments] = useState(['Científico']); // "Científico" garantizado por defecto
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        id: '',
        password: '',
        accessLevel: '1',
        department: 'Científico'
    });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    // Cargar departamentos desde la base de datos al iniciar
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                // Asumiendo que crearás este endpoint o que el de stats/config los tiene
                const res = await api.get('/api/admin/departments'); 
                if (res.data && res.data.length > 0) {
                    setDepartments(res.data);
                    // Si el default no está en la lista nueva, ponemos el primero que llegue
                    setFormData(prev => ({ ...prev, department: res.data[0] }));
                }
            } catch (err) {
                console.log("Usando departamentos por defecto (Científico).");
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '', success: '' });

        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.id.trim() || !formData.password.trim()) {
            setStatus({ loading: false, error: 'TODOS LOS CAMPOS SON OBLIGATORIOS.', success: '' });
            return;
        }

        try {
            await api.post('/api/admin/students', formData);
            setStatus({ 
                loading: false, 
                error: '', 
                success: `PERSONAL [${formData.lastName.toUpperCase()}] REGISTRADO EXITOSAMENTE.` 
            });
            setFormData(prev => ({ ...prev, firstName: '', lastName: '', id: '', password: '' }));
        } catch (err) {
            const msg = err.response?.data?.error || 'FALLO EN LA CONEXIÓN CON EL SITIO.';
            setStatus({ loading: false, error: msg.toUpperCase(), success: '' });
        }
    };

    const inputClass = "w-full bg-black border border-gray-700 p-2.5 text-white text-sm focus:border-red-600 outline-none font-mono transition-colors";
    const labelClass = "block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest";

    return (
        <div className="max-w-4xl mx-auto animate-slide-up-fade">
            <div className="mb-8 border-b-2 border-red-900 pb-4">
                <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter italic">Alta de Personal Nuevo</h2>
                <p className="text-gray-500 text-xs font-mono mt-1">SISTEMA DE GESTIÓN DE EXPEDIENTES // ACCESO O5-RESTRINGIDO</p>
            </div>

            {status.error && (
                <div className="mb-6 bg-red-900/10 border-l-4 border-red-600 p-4 text-red-500 text-xs font-mono">
                    ⚠️ [ADVERTENCIA]: {status.error}
                </div>
            )}
            {status.success && (
                <div className="mb-6 bg-green-900/10 border-l-4 border-green-600 p-4 text-green-500 text-xs font-mono">
                    ✅ [SISTEMA]: {status.success}
                </div>
            )}

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/50 p-6 border border-gray-800 rounded-lg">
                <div>
                    <label className={labelClass}>Nombre del Sujeto</label>
                    <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="NOMBRE" />
                </div>

                <div>
                    <label className={labelClass}>Apellido del Sujeto</label>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="APELLIDO" />
                </div>

                <div>
                    <label className={labelClass}>Identificación (ID)</label>
                    <input name="id" value={formData.id} onChange={handleChange} className={inputClass} placeholder="NÚMERO DE REGISTRO" />
                </div>

                <div>
                    <label className={labelClass}>Clave de Acceso</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="********" />
                </div>

                <div>
                    <label className={labelClass}>Nivel de Autorización</label>
                    <select name="accessLevel" value={formData.accessLevel} onChange={handleChange} className={inputClass}>
                        <option value="1">NIVEL 1</option>
                        <option value="2">NIVEL 2</option>
                        <option value="3">NIVEL 3</option>
                        <option value="4">NIVEL 4</option>
                        <option value="5">NIVEL 5 (O5)</option>
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Departamento Asignado</label>
                    <select name="department" value={formData.department} onChange={handleChange} className={inputClass}>
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-gray-800 mt-4">
                    <button 
                        type="submit" 
                        disabled={status.loading}
                        className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-4 uppercase tracking-[0.4em] text-xs transition-all border-b-4 border-red-900 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                    >
                        {status.loading ? "SINCRONIZANDO BASE DE DATOS..." : "REGISTRAR EN EL SISTEMA"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminManageBills;
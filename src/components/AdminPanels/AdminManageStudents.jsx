import { useState, useEffect } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';
import SkeletonLoader from '../SkeletonLoader';
import Tooltip from '../Tooltip';
import Toast from '../Toast';
import { validateName, validateCedula } from '@/lib/validations';
import { exportStudentsList } from '@/lib/csvExport';

const AdminManageStudents = () => {
    const [students, setStudents] = useState([]); // Representa al Personal
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        password: ''
    });

    /* // COMENTADO: Lógica de registro de nuevo personal
    const [addForm, setAddForm] = useState({
        firstName: '',
        lastName: '',
        id: '',
        password: ''
    });
    */

    const [validationErrors, setValidationErrors] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchStudents = async () => {
        if (!isClient) return;
        setLoading(true);
        setError('');
        try {
            const url = searchTerm ?
                `/api/admin/students?search=${encodeURIComponent(searchTerm)}` : '/api/admin/students';
            const res = await api.get(url);
            setStudents(res.data.students || []);
        } catch (err) {
            setError('Error al conectar con el servidor de la Fundación');
            console.error('Error fetching personnel:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isClient) {
            fetchStudents();
        }
    }, [searchTerm, isClient]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStudentClick = async (student) => {
        if (!student || !student.id) return;
        setSelectedStudent(student);
        setEditForm({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            password: ''
        });
        setEditMode(false);
        setValidationErrors({});
    };

    const handleEdit = () => {
        setEditMode(true);
        setValidationErrors({});
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        if (selectedStudent) {
            setEditForm({
                firstName: selectedStudent.firstName || '',
                lastName: selectedStudent.lastName || '',
                password: ''
            });
        }
        setValidationErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
        if (name === 'firstName' || name === 'lastName') {
            const validation = validateName(value, name === 'firstName' ? 'Nombre' : 'Apellido');
            setValidationErrors(prev => ({
                ...prev,
                [name]: validation.isValid ? null : validation.message
            }));
        }
    };

    /*
    // COMENTADO: Handlers para registro de nuevo personal
    const handleAddInputChange = (e) => { ... };
    const validateAddForm = () => { ... };
    const handleAddSubmit = async () => { ... };
    */

    const validateForm = () => {
        const errors = {};
        const firstNameValidation = validateName(editForm.firstName, 'Nombre');
        if (!firstNameValidation.isValid) errors.firstName = firstNameValidation.message;
        const lastNameValidation = validateName(editForm.lastName, 'Apellido');
        if (!lastNameValidation.isValid) errors.lastName = lastNameValidation.message;
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!selectedStudent || !selectedStudent.id) {
            setToastMsg('No hay registro seleccionado');
            setShowToast(true);
            return;
        }
        if (!validateForm()) {
            setToastMsg('Error de validación en los archivos de personal');
            setShowToast(true);
            return;
        }
        setLoading(true);
        try {
            const updateData = {
                studentId: selectedStudent.id,
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim()
            };
            if (editForm.password?.trim()) updateData.password = editForm.password;
            await api.put('/api/admin/students', updateData);
            setToastMsg('Expediente actualizado exitosamente');
            setShowToast(true);
            setEditMode(false);
            fetchStudents();
            setSelectedStudent(prev => ({
                ...prev,
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim()
            }));
            setEditForm(prev => ({ ...prev, password: '' }));
        } catch (err) {
            setToastMsg('Fallo en la actualización del servidor central');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedStudent || !selectedStudent.id) return;
        setLoading(true);
        try {
            await api.delete(`/api/admin/students?id=${selectedStudent.id}`);
            setToastMsg('Personal dado de baja (Terminado)');
            setShowToast(true);
            setSelectedStudent(null);
            setEditMode(false);
            setShowDeleteConfirm(false);
            fetchStudents();
        } catch (err) {
            setToastMsg('Error al procesar la terminación');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        try {
            exportStudentsList(students);
            setToastMsg('Manifiesto de personal exportado');
            setShowToast(true);
        } catch (error) {
            setToastMsg('Error en la exportación de datos');
            setShowToast(true);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (!isClient) return <SkeletonLoader type="card" />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
            {/* Header Temática SCP */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b-2 border-[#C62B34] pb-4">
                <div>
                    <h2 className="text-2xl font-black text-[#C62B34] uppercase tracking-tighter">Base de Datos de Personal</h2>
                    <p className="text-gray-500 text-xs font-mono italic">S.C.P. Foundation - Intranet Administrativa</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Botón de Agregar Comentado
                    <Tooltip content="Registrar nuevo personal">
                        <button onClick={() => setShowAddForm(true)} ...>➕ Agregar Personal</button>
                    </Tooltip> 
                    */}
                    <Tooltip content="Exportar manifiesto de personal">
                        <button
                            onClick={handleExportCSV}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border border-gray-600 text-gray-600 bg-gray-50 hover:bg-gray-600 hover:text-white transition-all shadow active:scale-95"
                            disabled={loading || students.length === 0}
                        >
                            📊 Exportar Manifiesto
                        </button>
                    </Tooltip>
                    <Tooltip content="Sincronizar con el Sitio-19">
                        <button
                            onClick={fetchStudents}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border border-[#3465B4] text-[#3465B4] bg-[#E3EAFD] hover:bg-[#3465B4] hover:text-white transition-all shadow"
                            disabled={loading}
                        >
                            {loading ? 'Sincronizando...' : '🔄 Recargar'}
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna de Búsqueda y Lista */}
                <div className="lg:col-span-1">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar por ID, nombre o rango..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full p-3 border border-[#F3F4F6] rounded-lg focus:ring-2 focus:ring-[#C62B34] bg-gray-50 font-mono text-sm"
                        />
                    </div>

                    <div className="bg-gray-50 border border-[#F3F4F6] rounded-xl p-4 max-h-[500px] overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Registros Detectados ({students.length})</h3>
                        {loading ? <SkeletonLoader type="list" lines={5} /> : (
                            <div className="space-y-2">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => handleStudentClick(student)}
                                        className={`p-3 rounded border transition-all cursor-pointer ${
                                            selectedStudent?.id === student.id
                                                ? 'bg-[#C62B34] text-white border-[#C62B34] shadow-md'
                                                : 'bg-white hover:border-[#C62B34] border-[#F3F4F6]'
                                        }`}
                                    >
                                        <div className="font-bold uppercase text-xs tracking-tighter">
                                            {student.lastName}, {student.firstName}
                                        </div>
                                        <div className={`text-[10px] font-mono ${selectedStudent?.id === student.id ? 'text-red-100' : 'text-gray-500'}`}>
                                            ID-NUM: {student.id}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna de Detalles / Edición */}
                <div className="lg:col-span-2">
                    {selectedStudent ? (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 relative overflow-hidden">
                            {/* Marca de agua decorativa opcional */}
                            <div className="absolute top-2 right-2 opacity-10 font-black text-4xl select-none uppercase">Confidencial</div>
                            
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter border-l-4 border-[#C62B34] pl-3"> Expediente del Agente </h3>
                                {!editMode && (
                                    <div className="flex gap-2">
                                        <button onClick={handleEdit} className="px-3 py-1.5 bg-[#3465B4] text-white rounded text-xs font-bold hover:bg-[#2d5aa0] transition-colors"> ✏️ Modificar </button>
                                        <button onClick={() => setShowDeleteConfirm(true)} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"> 🗑️ Terminar </button>
                                    </div>
                                )}
                            </div>

                            {editMode ? (
                                <div className="space-y-4 font-mono text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Nombre</label>
                                            <input name="firstName" value={editForm.firstName} onChange={handleInputChange} className={`w-full p-2 border rounded ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Apellido</label>
                                            <input name="lastName" value={editForm.lastName} onChange={handleInputChange} className={`w-full p-2 border rounded ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Nueva Credencial (Opcional)</label>
                                        <input type="password" name="password" value={editForm.password} onChange={handleInputChange} placeholder="••••••••" className="w-full p-2 border border-gray-300 rounded" />
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button onClick={handleSave} className="px-6 py-2 bg-green-700 text-white rounded font-bold text-xs uppercase tracking-widest"> Autorizar Cambios </button>
                                        <button onClick={handleCancelEdit} className="px-6 py-2 bg-gray-500 text-white rounded font-bold text-xs uppercase tracking-widest"> Abortar </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Identificador de Sujeto</label>
                                            <p className="text-lg font-bold text-gray-800">{selectedStudent.id}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Nombre Completo</label>
                                            <p className="text-lg font-bold text-gray-800">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase">Créditos de Acceso (MB)</label>
                                            <p className="text-2xl font-black text-[#C62B34]">{selectedStudent.points || 0} MB</p>
                                        </div>
                                        {selectedStudent.registrationDate && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase">Fecha de Incorporación</label>
                                                <p className="text-sm text-gray-700">{formatDate(selectedStudent.registrationDate)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dotted border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center h-64 opacity-50">
                            <div className="w-16 h-16 border-4 border-gray-300 rounded-full mb-4 flex items-center justify-center font-black text-2xl text-gray-300">?</div>
                            <p className="text-sm font-mono uppercase tracking-widest">Esperando Selección de Personal</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmación (Mantenido igual pero con textos SCP) */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full border-t-8 border-red-600 shadow-2xl">
                        <h3 className="text-xl font-black text-red-600 uppercase mb-4 tracking-tighter">⚠️ Orden de Terminación</h3>
                        <p className="text-gray-600 font-mono text-sm mb-6">
                            ¿Confirmar eliminación permanente del registro de <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>? 
                            <br/><br/>
                            <span className="text-xs italic text-red-500">Esta acción purgará al agente de la base de datos central.</span>
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded font-bold text-xs uppercase">Confirmar Purga</button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-2 bg-gray-500 text-white rounded font-bold text-xs uppercase">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* // COMENTADO: Formulario Modal de registro de personal
            {showAddForm && ( ... )} 
            */}

            {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default AdminManageStudents;
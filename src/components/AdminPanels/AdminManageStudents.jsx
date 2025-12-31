import { useState, useEffect } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';
import SkeletonLoader from '../SkeletonLoader';
import Tooltip from '../Tooltip';
import Toast from '../Toast';
import { validateName, validateCedula } from '@/lib/validations';
import { exportStudentsList } from '@/lib/csvExport';

const AdminManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        password: ''
    });
    const [addForm, setAddForm] = useState({
        firstName: '',
        lastName: '',
        id: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [error, setError] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // Asegurar que estamos en el cliente
    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchStudents = async () => {
        if (!isClient) return;
        
        setLoading(true);
        setError('');
        try {
            const url = searchTerm ? `/api/admin/students?search=${encodeURIComponent(searchTerm)}` : '/api/admin/students';
            const res = await api.get(url);
            setStudents(res.data.students || []);
        } catch (err) {
            setError('Error al cargar estudiantes');
            console.error('Error fetching students:', err);
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
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validar en tiempo real
        if (name === 'firstName' || name === 'lastName') {
            const validation = validateName(value, name === 'firstName' ? 'Nombre' : 'Apellido');
            setValidationErrors(prev => ({
                ...prev,
                [name]: validation.isValid ? null : validation.message
            }));
        }
    };

    const handleAddInputChange = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateAddForm = () => {
        const errors = {};
        
        if (!addForm.id?.trim()) {
            errors.id = 'La cédula es obligatoria';
        } else {
            const cedulaValidation = validateCedula(addForm.id);
            if (!cedulaValidation.isValid) {
                errors.id = cedulaValidation.message;
            }
        }
        
        const firstNameValidation = validateName(addForm.firstName, 'Nombre');
        if (!firstNameValidation.isValid) {
            errors.firstName = firstNameValidation.message;
        }
        
        const lastNameValidation = validateName(addForm.lastName, 'Apellido');
        if (!lastNameValidation.isValid) {
            errors.lastName = lastNameValidation.message;
        }
        
        if (!addForm.password?.trim()) {
            errors.password = 'La contraseña es obligatoria';
        } else if (addForm.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddSubmit = async () => {
        if (!validateAddForm()) {
            setToastMsg('Por favor corrige los errores en el formulario');
            setShowToast(true);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/auth/register', {
                id: addForm.id.trim(),
                firstName: addForm.firstName.trim(),
                lastName: addForm.lastName.trim(),
                password: addForm.password
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setToastMsg('Estudiante registrado exitosamente');
            setShowToast(true);
            setShowAddForm(false);
            setAddForm({
                firstName: '',
                lastName: '',
                id: '',
                password: ''
            });
            fetchStudents(); // Recargar lista
        } catch (err) {
            console.error('Error adding student:', err);
            const errorMessage = err.response?.data?.message || 'Error al registrar estudiante';
            setToastMsg(errorMessage);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedStudent || !selectedStudent.id) {
            setToastMsg('No hay estudiante seleccionado');
            setShowToast(true);
            return;
        }

        if (!validateForm()) {
            setToastMsg('Por favor corrige los errores en el formulario');
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

            if (editForm.password?.trim()) {
                updateData.password = editForm.password;
            }

            await api.put('/api/admin/students', updateData);
            
            setToastMsg('Estudiante actualizado exitosamente');
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
            setToastMsg('Error al actualizar estudiante');
            setShowToast(true);
            console.error('Error updating student:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        console.log('=== INICIO ELIMINACIÓN DESDE FRONTEND ===');
        
        if (!selectedStudent || !selectedStudent.id) {
            console.log('❌ Error: No hay estudiante seleccionado');
            setToastMsg('No hay estudiante seleccionado');
            setShowToast(true);
            return;
        }

        console.log('🔄 Iniciando eliminación del estudiante:', selectedStudent.id);
        setLoading(true);
        
        try {
            console.log('🔄 Enviando petición DELETE a:', `/api/admin/students?id=${selectedStudent.id}`);
            const response = await api.delete(`/api/admin/students?id=${selectedStudent.id}`);
            console.log('✅ Respuesta del servidor:', response.data);
            
            setToastMsg('Estudiante eliminado exitosamente');
            setShowToast(true);
            setSelectedStudent(null);
            setEditMode(false);
            setShowDeleteConfirm(false);
            
            console.log('🔄 Recargando lista de estudiantes...');
            fetchStudents();
            
        } catch (err) {
            console.error('❌ ERROR DETALLADO en eliminación:', err);
            console.error('Response data:', err.response?.data);
            console.error('Response status:', err.response?.status);
            console.error('Response headers:', err.response?.headers);
            console.error('Request config:', err.config);
            
            const errorMessage = err.response?.data?.error || err.response?.data?.details || 'Error al eliminar estudiante';
            setToastMsg(errorMessage);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleExportCSV = () => {
        try {
            exportStudentsList(students);
            setToastMsg('Lista de estudiantes exportada exitosamente');
            setShowToast(true);
        } catch (error) {
            setToastMsg('Error al exportar la lista');
            setShowToast(true);
            console.error('Error exporting CSV:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        try {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    // Si no estamos en el cliente, mostrar loading
    if (!isClient) {
        return <SkeletonLoader type="card" />;
    }

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[#C62B34]">Gestión de Estudiantes</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 student-management-buttons">
                    <Tooltip content="Agregar nuevo estudiante">
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border border-[#C62B34] text-[#C62B34] bg-[#F8D7DA] hover:bg-[#C62B34] hover:text-white transition-all shadow active:scale-95 whitespace-nowrap"
                        >
                            ➕ Agregar Estudiante
                        </button>
                    </Tooltip>
                    <Tooltip content="Exportar lista de estudiantes a CSV">
                        <button
                            onClick={handleExportCSV}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border border-green-600 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white transition-all shadow active:scale-95 whitespace-nowrap"
                            disabled={loading || students.length === 0}
                        >
                            📊 Exportar CSV
                        </button>
                    </Tooltip>
                    <Tooltip content="Recargar lista de estudiantes">
                        <button
                            onClick={fetchStudents}
                            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold border border-[#3465B4] text-[#3465B4] bg-[#E3EAFD] hover:bg-[#3465B4] hover:text-white transition-all shadow active:scale-95 whitespace-nowrap"
                            disabled={loading}
                        >
                            {loading ? 'Actualizando...' : '🔄 Recargar'}
                        </button>
                    </Tooltip>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar por cédula, nombre o apellido..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full p-3 border border-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent"
                        />
                    </div>

                    <div className="bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-4 max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-[#C62B34] mb-3">
                            Estudiantes ({students.length})
                        </h3>
                        
                        {loading ? (
                            <SkeletonLoader type="list" lines={5} />
                        ) : students.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes registrados'}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => handleStudentClick(student)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                                            selectedStudent?.id === student.id
                                                ? 'bg-[#3465B4] text-white border-[#3465B4]'
                                                : 'bg-white hover:bg-[#F8D7DA]/50 border-[#F3F4F6]'
                                        }`}
                                    >
                                        <div className="font-medium">
                                            {student.firstName || 'Sin nombre'} {student.lastName || 'Sin apellido'}
                                        </div>
                                        <div className={`text-sm ${selectedStudent?.id === student.id ? 'text-blue-100' : 'text-gray-600'}`}>
                                            Cédula: {student.id}
                                        </div>
                                        <div className={`text-sm font-bold ${selectedStudent?.id === student.id ? 'text-blue-100' : 'text-[#C62B34]'}`}>
                                            {student.points || 0} MB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedStudent ? (
                        <div className="bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-[#C62B34]">
                                    Detalles del Estudiante
                                </h3>
                                {!editMode && (
                                    <div className="flex gap-2">
                                        <Tooltip content="Editar información del estudiante">
                                            <button
                                                onClick={handleEdit}
                                                className="px-4 py-2 bg-[#3465B4] text-white rounded-lg hover:bg-[#2d5aa0] transition-colors font-medium"
                                            >
                                                ✏️ Editar
                                            </button>
                                        </Tooltip>
                                        <Tooltip content="Eliminar estudiante permanentemente">
                                            <button
                                                onClick={confirmDelete}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>

                            {editMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={editForm.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent ${
                                                validationErrors.firstName ? 'border-red-500' : 'border-[#F3F4F6]'
                                            }`}
                                        />
                                        {validationErrors.firstName && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={editForm.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent ${
                                                validationErrors.lastName ? 'border-red-500' : 'border-[#F3F4F6]'
                                            }`}
                                        />
                                        {validationErrors.lastName && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nueva Contraseña (opcional)
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={editForm.password}
                                            onChange={handleInputChange}
                                            placeholder="Dejar vacío para mantener la actual"
                                            className="w-full p-3 border border-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={loading || Object.keys(validationErrors).some(key => validationErrors[key])}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Guardando...' : '💾 Guardar'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                        >
                                            ❌ Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Cédula de Identidad
                                            </label>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {selectedStudent.id}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Saldo Actual
                                            </label>
                                            <p className="text-2xl font-bold text-[#C62B34]">
                                                {selectedStudent.points || 0} MB
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Nombre
                                            </label>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {selectedStudent.firstName || 'Sin nombre'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Apellido
                                            </label>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {selectedStudent.lastName || 'Sin apellido'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedStudent.registrationDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Fecha de Registro
                                            </label>
                                            <p className="text-lg font-semibold text-gray-800">
                                                {formatDate(selectedStudent.registrationDate)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-6 flex items-center justify-center h-64">
                            <div className="text-center text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <p className="text-lg font-medium">Selecciona un estudiante</p>
                                <p className="text-sm">Haz clic en un estudiante de la lista para ver sus detalles</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                ¿Eliminar estudiante?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que quieres eliminar a <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>? 
                                Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-60"
                                >
                                    {loading ? 'Eliminando...' : 'Sí, eliminar'}
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-[#C62B34] mb-6">Agregar Nuevo Estudiante</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Cédula *
                                </label>
                                <input
                                    type="text"
                                    name="id"
                                    value={addForm.id}
                                    onChange={handleAddInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent"
                                    placeholder="Ingrese la cédula"
                                />
                                {validationErrors.id && <p className="text-red-500 text-sm mt-1">{validationErrors.id}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={addForm.firstName}
                                    onChange={handleAddInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent"
                                    placeholder="Ingrese el nombre"
                                />
                                {validationErrors.firstName && <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Apellido *
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={addForm.lastName}
                                    onChange={handleAddInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent"
                                    placeholder="Ingrese el apellido"
                                />
                                {validationErrors.lastName && <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Contraseña *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={addForm.password}
                                    onChange={handleAddInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3465B4] focus:border-transparent"
                                    placeholder="Ingrese la contraseña"
                                />
                                {validationErrors.password && <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>}
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleAddSubmit}
                                disabled={loading}
                                className="flex-1 px-6 py-2 bg-[#C62B34] text-white rounded-lg hover:bg-[#A0232E] transition-colors font-medium disabled:opacity-50"
                            >
                                {loading ? 'Registrando...' : 'Registrar'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setAddForm({ firstName: '', lastName: '', id: '', password: '' });
                                    setValidationErrors({});
                                }}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && <Toast message={toastMsg} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default AdminManageStudents;

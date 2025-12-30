import api from '@/axios';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const AdminManageBills = () => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [observation, setObservation] = useState('');
    const [students, setStudents] = useState([])
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoadingStudents(true);
        api.get(`/api/admin/students`).then(x => {
            setStudents(x.data.students || []);
            setLoadingStudents(false);
        }).catch(err => {
            console.error("Error fetching students for bills management:", err);
            setErrorMsg("No se pudieron cargar los estudiantes.");
            setLoadingStudents(false);
        });
    }, [])

    const handleRewardClick = (amount) => {
        setCustomAmount(amount);
    };

    const handleAssignButton = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        if (!selectedStudent) {
            setErrorMsg('Debes seleccionar un estudiante.');
            return;
        }
        if (!customAmount || isNaN(customAmount) || Number(customAmount) <= 0) {
            setErrorMsg('Debes ingresar una cantidad válida mayor a 0.');
            return;
        }
        setSubmitting(true);
        try {
            await api.post(`/api/admin/assign`, {
                id: selectedStudent,
                amount: customAmount,
                observation: observation
            });
            setSelectedStudent("");
            setCustomAmount("");
            setObservation("");
            setSuccessMsg('Asignación exitosa.');
        } catch (e) {
            setErrorMsg('Error al asignar Merlyn Bills.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingStudents) return <LoadingSpinner />;

    return (
        <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 mb-6 animate-slide-up-fade">
            <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Asignar Merlyn Bills</h2>

            {errorMsg && <div className="mb-4 bg-[#F8D7DA] text-[#C62B34] border border-[#C62B34] font-medium rounded-lg px-4 py-2 animate-slide-up-fade">{errorMsg}</div>}
            {successMsg && <div className="mb-4 bg-green-100 text-green-800 border border-green-300 font-medium rounded-lg px-4 py-2 animate-slide-up-fade">{successMsg}</div>}

            {/* Student Selection */}
            <div className="mb-8 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl p-6">
                <label className="block text-[#3465B4] text-lg font-semibold mb-3">Seleccionar Estudiante</label>
                <select
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                >
                    <option value="">Seleccione un estudiante</option>
                    {students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} - {student.id}
                        </option>
                    ))}
                </select>
            </div>

            {/* Predefined Actions Grid */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#3465B4] mb-4">Acciones Predefinidas</h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    {[
                        ['Participación activa', 15],
                        ['Resolver ejercicio en pizarra', 25],
                        ['Respuesta correcta', 20],
                        ['Ayudar a compañeros', 30],
                    ].map(([label, amount], index) => (
                        <div
                            key={index}
                            onClick={() => handleRewardClick(amount)}
                            className="predefined-action p-3 sm:p-4 border border-[#F3F4F6] rounded-xl hover:bg-[#F8D7DA] hover:border-[#C62B34] cursor-pointer transition-all bg-white shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                                <span className="text-gray-700 font-medium text-sm sm:text-base break-words">{label}</span>
                                <span className="text-[#C62B34] font-bold text-base sm:text-lg whitespace-nowrap">+{amount} MB</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-8 bg-[#F3F4F6]/50 border border-[#F3F4F6] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#3465B4] mb-4">Cantidad Personalizada</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <input
                        type="number"
                        className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white min-w-0"
                        placeholder="0"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                    />
                    <span className="text-[#3465B4] font-bold text-lg text-center sm:text-left whitespace-nowrap">MB</span>
                </div>
            </div>

            {/* Observations */}
            <div className="mb-8 bg-[#F8D7DA]/20 border border-[#F3F4F6] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#3465B4] mb-4">Observación (opcional)</h3>
                <textarea
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#C62B34] transition-all bg-white"
                    rows="3"
                    placeholder="Añada una observación..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button 
                    onClick={() => handleAssignButton()} 
                    disabled={submitting}
                    className="bg-gradient-to-r from-[#C62B34] to-[#a81e28] hover:from-[#a81e28] hover:to-[#8b1a22] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transform hover:shadow-xl flex items-center justify-center gap-2 min-w-[13.75rem]"
                >
                    {submitting && (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {submitting ? 'Asignando...' : 'Asignar Merlyn Bills'}
                </button>
            </div>
        </div>
    );
};

export default AdminManageBills;
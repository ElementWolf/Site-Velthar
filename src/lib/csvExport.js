/**
 * ========================================
 * SISTEMA DE EXPORTACIÓN CSV - MERLYN BILLS
 * ========================================
 * 
 * Este archivo contiene funciones para exportar datos del sistema
 * a formato CSV para análisis y respaldo de información.
 * 
 * Funciones incluidas:
 * - Exportación genérica a CSV
 * - Exportación de historial de transacciones
 * - Exportación de lista de estudiantes
 * - Exportación de solicitudes de canje
 */

// ========================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN CSV
// ========================================
/**
 * Función genérica para exportar cualquier array de objetos a CSV
 * @param {Array} data - Array de objetos a exportar
 * @param {string} filename - Nombre del archivo CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
    if (!data || data.length === 0) {
        console.warn('No hay datos para exportar');
        return;
    }

    // Obtener las columnas del primer objeto
    const columns = Object.keys(data[0]);
    
    // Crear el header del CSV
    const header = columns.map(column => `"${column}"`).join(',');
    
    // Crear las filas del CSV
    const rows = data.map(row => 
        columns.map(column => {
            const value = row[column];
            // Escapar comillas y manejar valores especiales
            if (value === null || value === undefined) {
                return '""';
            }
            const stringValue = String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
    );
    
    // Combinar header y filas
    const csvContent = [header, ...rows].join('\n');
    
    // Crear el blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ========================================
// EXPORTACIÓN DE HISTORIAL DE TRANSACCIONES
// ========================================
/**
 * Exporta el historial completo de transacciones del sistema
 * @param {Array} transactions - Array de transacciones a exportar
 */
export const exportTransactionHistory = (transactions) => {
    const formattedData = transactions.map(tx => ({
        'ID Transacción': tx.id || 'N/A',
        'Usuario': tx.userId || 'N/A',
        'Tipo': tx.type || 'N/A',
        'Cantidad': tx.amount || 0,
        'Descripción': tx.description || 'N/A',
        'Fecha': tx.date ? new Date(tx.date).toLocaleString('es-ES') : 'N/A',
        'Estado': tx.status || 'N/A'
    }));
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    exportToCSV(formattedData, `historial-transacciones-${timestamp}.csv`);
};

// ========================================
// EXPORTACIÓN DE LISTA DE ESTUDIANTES
// ========================================
/**
 * Exporta la lista completa de estudiantes registrados
 * @param {Array} students - Array de estudiantes a exportar
 */
export const exportStudentsList = (students) => {
    const formattedData = students.map(student => ({
        'Cédula': student.id || 'N/A',
        'Nombre': student.firstName || 'N/A',
        'Apellido': student.lastName || 'N/A',
        'Puntos MB': student.points || 0,
        'Estado': student.status || 'N/A',
        'Fecha de Registro': student.registrationDate ? 
            new Date(student.registrationDate).toLocaleDateString('es-ES') : 'N/A'
    }));
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    exportToCSV(formattedData, `lista-estudiantes-${timestamp}.csv`);
};

// ========================================
// EXPORTACIÓN DE SOLICITUDES DE CANJE
// ========================================
/**
 * Exporta las solicitudes de canje de Merlyn Bills por puntos académicos
 * @param {Array} requests - Array de solicitudes de canje a exportar
 */
export const exportExchangeRequests = (requests) => {
    const formattedData = requests.map(req => ({
        'ID Solicitud': req.id || 'N/A',
        'Usuario': req.userId || 'N/A',
        'Cantidad MB': req.amount || 0,
        'Puntos Académicos': req.academicPoints || 0,
        'Estado': req.status || 'N/A',
        'Fecha': req.date ? new Date(req.date).toLocaleString('es-ES') : 'N/A',
        'Comentarios': req.comments || 'N/A'
    }));
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    exportToCSV(formattedData, `solicitudes-canje-${timestamp}.csv`);
}; 
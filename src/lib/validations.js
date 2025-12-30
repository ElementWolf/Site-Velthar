/**
 * ========================================
 * SISTEMA DE VALIDACIONES - MERLYN BILLS
 * ========================================
 * 
 * Este archivo contiene todas las funciones de validación utilizadas
 * en el sistema Merlyn Bills para asegurar la integridad de los datos
 * ingresados por los usuarios.
 * 
 * Funciones incluidas:
 * - Validación de cédula venezolana
 * - Validación de nombres y apellidos
 * - Validación de contraseñas
 * - Validación de cantidades/puntos
 * - Validación de descripciones
 * - Validación de fechas
 * - Validación de emails
 * - Funciones de sanitización y formateo
 */

// ========================================
// VALIDACIÓN DE CÉDULA DE IDENTIDAD
// ========================================
/**
 * Valida el formato de cédula de identidad venezolana
 * @param {string} cedula - Cédula a validar
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateCedula = (cedula) => {
    if (!cedula) return { isValid: false, message: 'La cédula es obligatoria' };
    
    // Remover espacios y guiones
    const cleanCedula = cedula.replace(/[\s-]/g, '');
    
    // Verificar que solo contenga números
    if (!/^\d+$/.test(cleanCedula)) {
        return { isValid: false, message: 'La cédula debe contener solo números' };
    }
    
    // Verificar longitud (Venezuela: 7-8 dígitos)
    if (cleanCedula.length < 7 || cleanCedula.length > 8) {
        return { isValid: false, message: 'La cédula debe tener entre 7 y 8 dígitos' };
    }
    
    return { isValid: true, message: 'Cédula válida' };
};

// ========================================
// VALIDACIÓN DE NOMBRES Y APELLIDOS
// ========================================
/**
 * Valida nombres y apellidos (solo letras, espacios y acentos)
 * @param {string} name - Nombre a validar
 * @param {string} fieldName - Nombre del campo para mensajes de error
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateName = (name, fieldName = 'Nombre') => {
    if (!name) return { isValid: false, message: `${fieldName} es obligatorio` };
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
        return { isValid: false, message: `${fieldName} debe tener al menos 2 caracteres` };
    }
    
    if (trimmedName.length > 50) {
        return { isValid: false, message: `${fieldName} no puede exceder 50 caracteres` };
    }
    
    // Permitir letras, espacios, acentos y ñ
    const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    if (!nameRegex.test(trimmedName)) {
        return { isValid: false, message: `${fieldName} debe contener solo letras y espacios` };
    }
    
    return { isValid: true, message: `${fieldName} válido` };
};

// ========================================
// VALIDACIÓN DE CONTRASEÑAS
// ========================================
/**
 * Valida contraseñas con requisitos de seguridad básicos
 * @param {string} password - Contraseña a validar
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validatePassword = (password) => {
    if (!password) return { isValid: false, message: 'La contraseña es obligatoria' };
    
    if (password.length < 6) {
        return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    if (password.length > 50) {
        return { isValid: false, message: 'La contraseña no puede exceder 50 caracteres' };
    }
    
    // Verificar que no contenga caracteres especiales problemáticos
    const invalidChars = /[<>"'&]/;
    if (invalidChars.test(password)) {
        return { isValid: false, message: 'La contraseña contiene caracteres no permitidos' };
    }
    
    return { isValid: true, message: 'Contraseña válida' };
};

// ========================================
// VALIDACIÓN DE CANTIDADES Y PUNTOS
// ========================================
/**
 * Valida cantidades de puntos Merlyn Bills
 * @param {number|string} points - Cantidad a validar
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validatePoints = (points) => {
    if (points === null || points === undefined || points === '') {
        return { isValid: false, message: 'La cantidad es obligatoria' };
    }
    
    const numPoints = Number(points);
    
    if (isNaN(numPoints)) {
        return { isValid: false, message: 'La cantidad debe ser un número válido' };
    }
    
    if (numPoints < 0) {
        return { isValid: false, message: 'La cantidad no puede ser negativa' };
    }
    
    if (numPoints > 1000000) {
        return { isValid: false, message: 'La cantidad no puede exceder 1,000,000' };
    }
    
    // Verificar que sea un número entero
    if (!Number.isInteger(numPoints)) {
        return { isValid: false, message: 'La cantidad debe ser un número entero' };
    }
    
    return { isValid: true, message: 'Cantidad válida' };
};

// ========================================
// VALIDACIÓN DE DESCRIPCIONES Y COMENTARIOS
// ========================================
/**
 * Valida descripciones y comentarios con límite de caracteres
 * @param {string} description - Descripción a validar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateDescription = (description, maxLength = 500) => {
    if (!description) return { isValid: true, message: 'Descripción opcional' };
    
    const trimmedDesc = description.trim();
    
    if (trimmedDesc.length > maxLength) {
        return { isValid: false, message: `La descripción no puede exceder ${maxLength} caracteres` };
    }
    
    // Verificar caracteres peligrosos
    const dangerousChars = /[<>]/;
    if (dangerousChars.test(trimmedDesc)) {
        return { isValid: false, message: 'La descripción contiene caracteres no permitidos' };
    }
    
    return { isValid: true, message: 'Descripción válida' };
};

// ========================================
// VALIDACIÓN DE FECHAS
// ========================================
/**
 * Valida fechas y verifica que no sean futuras
 * @param {string} dateString - Fecha a validar
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateDate = (dateString) => {
    if (!dateString) return { isValid: false, message: 'La fecha es obligatoria' };
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return { isValid: false, message: 'Formato de fecha inválido' };
    }
    
    // Verificar que no sea una fecha futura (para fechas pasadas)
    const now = new Date();
    if (date > now) {
        return { isValid: false, message: 'La fecha no puede ser futura' };
    }
    
    return { isValid: true, message: 'Fecha válida' };
};

// ========================================
// VALIDACIÓN DE EMAILS
// ========================================
/**
 * Valida formato de email (para futuras implementaciones)
 * @param {string} email - Email a validar
 * @returns {Object} - {isValid: boolean, message: string}
 */
export const validateEmail = (email) => {
    if (!email) return { isValid: false, message: 'El email es obligatorio' };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Formato de email inválido' };
    }
    
    if (email.length > 100) {
        return { isValid: false, message: 'El email no puede exceder 100 caracteres' };
    }
    
    return { isValid: true, message: 'Email válido' };
};

// ========================================
// FUNCIONES DE SANITIZACIÓN Y FORMATEO
// ========================================
/**
 * Sanitiza texto removiendo caracteres peligrosos para prevenir XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeText = (text) => {
    if (!text) return '';
    
    return text
        .replace(/[<>]/g, '') // Remover < y >
        .replace(/&/g, '&amp;') // Escapar &
        .replace(/"/g, '&quot;') // Escapar comillas
        .replace(/'/g, '&#x27;') // Escapar apóstrofe
        .trim();
};

/**
 * Formatea cédula añadiendo guiones para mejor legibilidad
 * @param {string} cedula - Cédula a formatear
 * @returns {string} - Cédula formateada con guiones
 */
export const formatCedula = (cedula) => {
    if (!cedula) return '';
    
    const cleanCedula = cedula.replace(/[\s-]/g, '');
    
    if (cleanCedula.length <= 4) {
        return cleanCedula;
    } else if (cleanCedula.length <= 7) {
        return `${cleanCedula.slice(0, 4)}-${cleanCedula.slice(4)}`;
    } else {
        return `${cleanCedula.slice(0, 4)}-${cleanCedula.slice(4, 7)}-${cleanCedula.slice(7)}`;
    }
}; 
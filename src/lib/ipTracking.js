/**
 * ========================================
 * SISTEMA DE SEGUIMIENTO IP Y SEGURIDAD - MERLYN BILLS
 * ========================================
 * 
 * Este archivo maneja el seguimiento de direcciones IP y funciones de seguridad
 * para el sistema Merlyn Bills. Incluye detección de actividad sospechosa,
 * logging de actividades de usuario y obtención de información geográfica.
 * 
 * Funcionalidades principales:
 * - Obtención de IP del cliente desde diferentes headers
 * - Validación de formato de direcciones IP
 * - Logging de actividades de usuario con IP
 * - Detección de patrones de actividad sospechosa
 * - Obtención de información geográfica de IPs
 * - Limpieza de logs antiguos
 * 
 * Uso: Se utiliza principalmente en las rutas de API para tracking
 * y auditoría de seguridad del sistema.
 */

// ========================================
// OBTENCIÓN DE DIRECCIÓN IP
// ========================================
/**
 * Obtiene la dirección IP del cliente desde diferentes headers HTTP
 * Maneja proxies, CDNs y diferentes configuraciones de servidor
 * @param {Request} request - Objeto request de Next.js
 * @returns {string} - Dirección IP del cliente o 'unknown' si no se puede determinar
 */
export const getClientIP = (request) => {
    try {
        // Intentar obtener IP de diferentes headers
        const forwarded = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const cfConnectingIP = request.headers.get('cf-connecting-ip');
        
        if (forwarded) {
            // x-forwarded-for puede contener múltiples IPs, tomar la primera
            return forwarded.split(',')[0].trim();
        }
        
        if (realIP) {
            return realIP;
        }
        
        if (cfConnectingIP) {
            return cfConnectingIP;
        }
        
        // Fallback para desarrollo local
        return '127.0.0.1';
    } catch (error) {
        console.error('Error getting client IP:', error);
        return 'unknown';
    }
};

// ========================================
// VALIDACIÓN DE DIRECCIONES IP
// ========================================
/**
 * Valida el formato de una dirección IP (IPv4 o IPv6)
 * @param {string} ip - Dirección IP a validar
 * @returns {boolean} - true si la IP es válida, false en caso contrario
 */
export const isValidIP = (ip) => {
    if (!ip || ip === 'unknown' || ip === '127.0.0.1') {
        return false;
    }
    
    // Validar formato IPv4
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) {
        return true;
    }
    
    // Validar formato IPv6 (básico)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) {
        return true;
    }
    
    return false;
};

// ========================================
// LOGGING DE ACTIVIDADES DE USUARIO
// ========================================
/**
 * Registra la actividad de un usuario en el sistema con su IP
 * Almacena información detallada para auditoría y seguridad
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción realizada
 * @param {Object} details - Detalles adicionales de la actividad
 * @param {string} ipAddress - Dirección IP del usuario
 * @returns {Promise<boolean>} - true si se registró exitosamente
 */
export const logUserActivity = async (userId, action, details = {}, ipAddress = null) => {
    try {
        const { getFirebaseDB } = await import('../app/api/firebase');
        const db = getFirebaseDB();
        const docRef = db.collection('database').doc('main');
        
        const activityLog = {
            id: Date.now().toString(),
            userId,
            action,
            details,
            ipAddress: ipAddress || 'No registrada',
            timestamp: new Date().toISOString(),
            userAgent: details.userAgent || 'No registrado'
        };
        
        const doc = await docRef.get();
        if (!doc.exists) {
            console.error('Database document not found');
            return false;
        }
        
        const data = doc.data();
        const activityLogs = data.activityLogs || [];
        
        // Añadir nuevo log
        activityLogs.push(activityLog);
        
        // Mantener solo los últimos 5000 logs
        if (activityLogs.length > 5000) {
            activityLogs.splice(0, activityLogs.length - 5000);
        }
        
        await docRef.update({
            activityLogs: activityLogs
        });
        
        return true;
    } catch (error) {
        console.error('Error logging user activity:', error);
        return false;
    }
};

// ========================================
// DETECCIÓN DE ACTIVIDAD SOSPECHOSA
// ========================================
/**
 * Detecta patrones de actividad sospechosa basándose en IP, usuario y acción
 * Define umbrales y ventanas de tiempo para diferentes tipos de actividad
 * @param {string} ipAddress - Dirección IP del usuario
 * @param {string} userId - ID del usuario
 * @param {string} action - Acción realizada
 * @returns {Object} - Información sobre la actividad sospechosa detectada
 */
export const detectSuspiciousActivity = (ipAddress, userId, action) => {
    const suspiciousPatterns = {
        // Múltiples intentos de login fallidos
        loginFailures: {
            threshold: 5,
            timeWindow: 15 * 60 * 1000, // 15 minutos
            action: 'LOGIN_FAILED'
        },
        
        // Múltiples cambios de perfil en poco tiempo
        rapidChanges: {
            threshold: 10,
            timeWindow: 5 * 60 * 1000, // 5 minutos
            action: 'PROFILE_CHANGE'
        },
        
        // Actividad desde IPs diferentes en poco tiempo
        multipleIPs: {
            threshold: 3,
            timeWindow: 10 * 60 * 1000, // 10 minutos
            action: 'IP_CHANGE'
        }
    };
    
    // Por ahora, retornar false (no implementado completamente)
    // En una implementación real, se verificaría contra logs existentes
    return {
        isSuspicious: false,
        reason: null,
        riskLevel: 'low'
    };
};

// ========================================
// INFORMACIÓN GEOGRÁFICA DE IP
// ========================================
/**
 * Obtiene información geográfica de una dirección IP
 * Utiliza el servicio ip-api.com para obtener datos de ubicación
 * @param {string} ipAddress - Dirección IP a consultar
 * @returns {Promise<Object>} - Información geográfica de la IP
 */
export const getIPInfo = async (ipAddress) => {
    if (!isValidIP(ipAddress)) {
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            isp: 'Unknown'
        };
    }
    
    try {
        // Usar un servicio gratuito para obtener info de IP
        const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    country: data.country || 'Unknown',
                    city: data.city || 'Unknown',
                    region: data.regionName || 'Unknown',
                    isp: data.isp || 'Unknown',
                    timezone: data.timezone || 'Unknown',
                    isProxy: data.proxy || false,
                    isHosting: data.hosting || false
                };
            }
        }
    } catch (error) {
        console.error('Error getting IP info:', error);
    }
    
    return {
        country: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        isp: 'Unknown'
    };
};

// ========================================
// MANTENIMIENTO Y LIMPIEZA
// ========================================
/**
 * Limpia logs antiguos del sistema para mantener el rendimiento
 * Se puede ejecutar periódicamente para mantener la base de datos optimizada
 * @param {number} daysToKeep - Número de días de logs a mantener
 * @returns {Promise<boolean>} - true si se limpió exitosamente
 */
export const cleanupOldLogs = async (daysToKeep = 30) => {
    try {
        const { getFirebaseDB } = await import('../app/api/firebase');
        const db = getFirebaseDB();
        const docRef = db.collection('database').doc('main');
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const doc = await docRef.get();
        if (!doc.exists) {
            return false;
        }
        
        const data = doc.data();
        const activityLogs = data.activityLogs || [];
        const profileChanges = data.profileChanges || [];
        
        // Filtrar logs antiguos
        const filteredActivityLogs = activityLogs.filter(log => 
            new Date(log.timestamp) > cutoffDate
        );
        
        const filteredProfileChanges = profileChanges.filter(change => 
            new Date(change.timestamp) > cutoffDate
        );
        
        await docRef.update({
            activityLogs: filteredActivityLogs,
            profileChanges: filteredProfileChanges
        });
        
        return true;
    } catch (error) {
        console.error('Error cleaning up old logs:', error);
        return false;
    }
}; 
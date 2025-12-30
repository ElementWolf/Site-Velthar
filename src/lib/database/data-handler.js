/**
 * ========================================
 * MANEJADOR DE DATOS - MERLYN BILLS
 * ========================================
 * 
 * Este archivo es el núcleo del sistema de base de datos de Merlyn Bills.
 * Maneja todas las operaciones CRUD (Create, Read, Update, Delete) 
 * utilizando Firebase Firestore como backend.
 * 
 * Funcionalidades principales:
 * - Gestión de usuarios y estudiantes
 * - Asignación y manejo de puntos Merlyn Bills
 * - Sistema de canjes por puntos académicos
 * - Gestión de solicitudes de registro
 * - Sistema de subastas
 * - Historial de transacciones
 * - Anuncios y logs de auditoría
 * - Configuración del sistema
 * 
 * Arquitectura:
 * - Una sola colección 'database' con un documento 'main'
 * - Todos los datos se almacenan en este documento único
 * - Operaciones atómicas para mantener consistencia
 */

import initializeFirebase from './firebase';

// ========================================
// CONFIGURACIÓN DE BASE DE DATOS
// ========================================
const DB_COLLECTION = 'database'; // Nombre de la colección en Firestore
const DB_DOC = 'main'; // Nombre del documento principal

// ========================================
// FUNCIONES DE LECTURA Y ESCRITURA
// ========================================
/**
 * Lee todos los datos del documento principal de la base de datos
 * @returns {Promise<Object>} - Datos completos de la base de datos
 * @throws {Error} - Si hay problemas de conexión o permisos
 */
async function readDatabase() {
    const db = initializeFirebase();
    if (!db) {
        throw new Error("La base de datos no está disponible. Verifica la configuración de Firebase.");
    }
    
    try {
        const docRef = db.collection(DB_COLLECTION).doc(DB_DOC);
        const doc = await docRef.get();
        if (!doc.exists) {
            throw new Error('El documento principal no existe en la base de datos.');
        }
        return doc.data();
    } catch (error) {
        console.error("Error al leer la base de datos:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Error de permisos en Firebase. Verifica las credenciales del service account.");
        }
        if (error.code === 'unavailable') {
            throw new Error("Firebase no está disponible en este momento.");
        }
        throw new Error(`Error al leer la base de datos: ${error.message}`);
    }
}

/**
 * Escribe datos al documento principal de la base de datos
 * @param {Object} dbData - Datos a escribir en la base de datos
 * @throws {Error} - Si hay problemas de conexión o permisos
 */
async function writeDatabase(dbData) {
    const db = initializeFirebase();
    if (!db) {
        console.error("Firestore no está inicializado. No se puede escribir en la base de datos.");
        throw new Error("La base de datos no está disponible.");
    }
    const docRef = db.collection(DB_COLLECTION).doc(DB_DOC);
    await docRef.set(dbData);
}

// ========================================
// GESTIÓN DE USUARIOS Y ESTUDIANTES
// ========================================
/**
 * Busca un usuario por su ID (cédula) en la base de datos
 * Incluye búsqueda en usuarios activos, solicitudes pendientes y rechazadas
 * @param {string} id - ID del usuario a buscar
 * @returns {Promise<Object|null>} - Usuario encontrado o null si no existe
 */
async function FindUserById(id) {
    const dbData = await readDatabase();
    const idStr = String(id).trim();
    if (idStr === String(process.env.ADMIN_USERNAME)) {
        return { id: process.env.ADMIN_USERNAME, firstName: "Prof.", lastName: "Merlyn", status: 'Activo' };
    }
    const user = (dbData.users || []).find(user => String(user.id).trim() === idStr);
    if (user) {
        return { ...user, status: user.status || 'Activo' };
    }
    const pendingRequest = (dbData.registrationRequests || []).find(req => String(req.userId).trim() === idStr && req.status === 'Pendiente');
    if (pendingRequest) {
        return { id: pendingRequest.userId, firstName: pendingRequest.firstName, lastName: pendingRequest.lastName, password: pendingRequest.password, status: 'Pendiente', points: 0 };
    }
    const rejectedRequest = (dbData.registrationRequests || []).find(req => String(req.userId).trim() === idStr && req.status === 'Rechazado');
    if (rejectedRequest) {
        return { id: rejectedRequest.userId, firstName: rejectedRequest.firstName, lastName: rejectedRequest.lastName, password: rejectedRequest.password, status: 'Rechazado', points: 0 };
    }
    return null;
}

/**
 * Verifica si un usuario es administrador del sistema
 * @param {Object} user - Usuario a verificar
 * @returns {boolean} - true si es admin, false en caso contrario
 */
function esAdmin(user) {
    if (!user || !user.id) return false;
    const adminUsername = process.env.ADMIN_USERNAME;
    if (adminUsername && String(user.id).toLowerCase() === String(adminUsername).toLowerCase()) return true;
    if (user.firstName && user.firstName.toLowerCase().includes('admin')) return true;
    return false;
}

/**
 * Obtiene todos los usuarios activos (excluyendo administradores)
 * @returns {Promise<Array>} - Array de usuarios con información básica
 */
async function getAllUsers() {
    const dbData = await readDatabase();
    return (dbData.users || []).filter(u => !esAdmin(u)).map(x => ({ id: x.id, firstName: x.firstName, lastName: x.lastName, points: x.points || 0 }));
}

/**
 * Crea un nuevo usuario o actualiza uno existente
 * @param {Object} user - Datos del usuario a crear/actualizar
 */
async function CreateOrUpdateUser(user) {
    const dbData = await readDatabase();
    const index = (dbData.users || []).findIndex(u => String(u.id).trim() === String(user.id).trim());
    if (index !== -1) {
        dbData.users[index] = user;
    } else {
        if (!dbData.users) dbData.users = [];
        dbData.users.push(user);
    }
    await writeDatabase(dbData);
}

// ========================================
// SISTEMA DE PUNTOS MERLYN BILLS
// ========================================
/**
 * Asigna puntos Merlyn Bills a un usuario específico
 * Registra la transacción en el historial de asignaciones
 * @param {string} userId - ID del usuario
 * @param {number} amount - Cantidad de puntos a asignar
 * @param {string} observation - Observación de la asignación
 */
async function AssignPoints(userId, amount, observation) {
    const dbData = await readDatabase();
    const user = (dbData.users || []).find(u => String(u.id).trim() === String(userId).trim());
    if (user) {
        user.points = (user.points || 0) + Number(amount);
        if(!dbData.assignHistory) dbData.assignHistory = [];
        dbData.assignHistory.push({
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            amount: amount,
            observation: observation && observation.toLowerCase().includes('asignación') ? observation : `Asignación: ${observation || ''}`,
            date: new Date().toISOString()
        });
        dbData.users = dbData.users.map(u => String(u.id).trim() === String(user.id).trim() ? user : u);
        syncUserPointsWithHistory(dbData);
        await writeDatabase(dbData);
    }
}

// ========================================
// SISTEMA DE CANJES POR PUNTOS ACADÉMICOS
// ========================================
/**
 * Crea una nueva solicitud de canje de Merlyn Bills por puntos académicos
 * Descuenta los puntos del usuario inmediatamente
 * @param {Object} params - Parámetros del canje
 * @param {string} params.userId - ID del usuario
 * @param {string} params.type - Tipo de canje
 * @param {number} params.amount - Cantidad de MB a canjear
 * @param {string} params.description - Descripción del canje
 * @returns {Promise<boolean>} - true si se creó exitosamente
 */
async function addExchangeRequest({ userId, type, amount, description }) {
    const dbData = await readDatabase();
    const user = (dbData.users || []).find(u => String(u.id).trim() === String(userId).trim());
    if (!user) return false;
    const mb = Number(amount);
    if (isNaN(mb) || mb <= 0 || (user.points || 0) < mb) return false;
    dbData.exchangeRequests = dbData.exchangeRequests || [];
    const reqId = Date.now() + '-' + Math.random().toString(36).slice(2);
    dbData.exchangeRequests.push({ id: reqId, userId: user.id, firstName: user.firstName, lastName: user.lastName, type, amount: mb, description, status: 'Pendiente', date: new Date().toISOString() });
    user.points -= mb;
    if(!dbData.assignHistory) dbData.assignHistory = [];
    dbData.assignHistory.push({ userId: user.id, firstName: user.firstName, lastName: user.lastName, amount: -mb, observation: `Canje pendiente: ${type}`, date: new Date().toISOString() });
    syncUserPointsWithHistory(dbData);
    await writeDatabase(dbData);
    return true;
}

/**
 * Obtiene las solicitudes de canje pendientes de un usuario específico
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Array de solicitudes pendientes
 */
async function getPendingExchanges(userId) {
    const dbData = await readDatabase();
    return (dbData.exchangeRequests || []).filter(x => String(x.userId) === String(userId) && x.status === 'Pendiente');
}

/**
 * Obtiene todas las solicitudes de canje ordenadas por fecha (más recientes primero)
 * @returns {Promise<Array>} - Array de todas las solicitudes de canje
 */
async function getAllExchangeRequests() {
    const dbData = await readDatabase();
    return (dbData.exchangeRequests || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ========================================
// SISTEMA DE INSIGNIAS (BADGES)
// ========================================
/**
 * Asigna una insignia a un usuario si no la tiene ya
 * @param {Object} dbData - Datos de la base de datos
 * @param {string} userId - ID del usuario
 * @param {string} badgeKey - Clave de la insignia a asignar
 */
function assignBadgeIfNeeded(dbData, userId, badgeKey) {
    dbData.badges = dbData.badges || {};
    dbData.badges[userId] = dbData.badges[userId] || [];
    if (!dbData.badges[userId].includes(badgeKey)) {
        dbData.badges[userId].push(badgeKey);
    }
}

/**
 * Asigna la insignia de "Mejor Estudiante" al usuario con más puntos
 * Remueve la insignia de todos los usuarios antes de asignarla al nuevo ganador
 */
async function assignTopStudentBadge() {
    const dbData = await readDatabase();
    if (!dbData.users || dbData.users.length === 0) return;
    let top = dbData.users[0];
    dbData.users.forEach(u => { if ((u.points || 0) > (top.points || 0)) top = u; });
    dbData.users.forEach(u => {
        dbData.badges = dbData.badges || {};
        dbData.badges[u.id] = (dbData.badges[u.id] || []).filter(b => b !== 'topStudent');
    });
    assignBadgeIfNeeded(dbData, top.id, 'topStudent');
    await writeDatabase(dbData);
}

/**
 * Actualiza el estado de una solicitud de canje (Aprobado/Rechazado)
 * Maneja la lógica de devolución de puntos y asignación de insignias
 * @param {string} id - ID de la solicitud de canje
 * @param {string} status - Nuevo estado (Aprobado/Rechazado)
 * @returns {Promise<Object|null>} - Solicitud actualizada o null si no se encuentra
 */
async function updateExchangeStatus(id, status) {
    const dbData = await readDatabase();
    const req = (dbData.exchangeRequests || []).find(x => x.id === id);
    if (!req) return null;
    req.status = status;
    req.resolvedDate = new Date().toISOString();
    dbData.assignHistory = dbData.assignHistory || [];
    let obs = '';
    let historyAmount = 0;
    if (String(status).toLowerCase() === 'aprobado') {
        obs = `Canje aprobado: ${req.type}${req.type === 'Puntos Académicos' ? ' (MB a puntos)' : ''}`;
        historyAmount = -Number(req.amount); // Descuenta los MB
        const userId = req.userId;
        const approved = (dbData.exchangeRequests || []).filter(x => x.userId === userId && x.status === 'Aprobado');
        if (approved.length === 1) assignBadgeIfNeeded(dbData, userId, 'firstExchange');
        if (approved.length === 5) assignBadgeIfNeeded(dbData, userId, 'fiveExchanges');
        if (approved.length === 3) assignBadgeIfNeeded(dbData, userId, 'threeExchanges');
    } else if (String(status).toLowerCase() === 'rechazado') {
        obs = `Canje rechazado: ${req.type}`;
        historyAmount = Number(req.amount); // Devuelve los MB (positivo)
    } else {
        obs = `Canje actualizado: ${req.type}`;
        historyAmount = 0;
    }
    dbData.assignHistory.push({ 
        userId: req.userId, 
        firstName: req.firstName, 
        lastName: req.lastName, 
        amount: historyAmount, 
        observation: obs, 
        date: new Date().toISOString() 
    });
    if (String(status).toLowerCase() === 'aprobado' && req.type === 'Puntos Académicos') {
        const user = (dbData.users || []).find(u => String(u.id) === String(req.userId));
        if (user) {
            const rate = await getExchangeRate();
            const academicPoints = Number((Number(req.amount) / rate).toFixed(2));
            dbData.assignHistory.push({ 
                userId: req.userId, 
                firstName: req.firstName, 
                lastName: req.lastName, 
                amount: academicPoints, 
                observation: `Puntos académicos otorgados: ${academicPoints} puntos`, 
                date: new Date().toISOString() 
            });
        }
    }
    syncUserPointsWithHistory(dbData);
    await writeDatabase(dbData);
    return req;
}

// ========================================
// HISTORIAL DE TRANSACCIONES
// ========================================
/**
 * Obtiene el historial completo de transacciones del sistema
 * Procesa y formatea los datos del historial de asignaciones
 * @returns {Promise<Array>} - Array de transacciones formateadas
 */
async function getAllHistory() {
    const dbData = await readDatabase();
    const result = [];
    for (const x of dbData.assignHistory || []) {
        if (esAdmin({ id: x.userId, firstName: x.firstName })) continue;
        const fecha = x.date && !isNaN(Date.parse(x.date)) ? x.date : new Date().toISOString();
        const firstName = x.firstName || 'Desconocido';
        const lastName = x.lastName || '';
        const userId = x.userId || 'N/A';
        const obs = x.observation ? x.observation.toLowerCase() : '';
        const user = (dbData.users || []).find(u => String(u.id) === String(userId));
        const cedula = user?.cedula || user?.id || userId;
        let type = 'Asignación';
        let status = '';
        let points = null;
        if (obs.includes('canje')) {
            type = 'Canje';
            if (obs.includes('aprobado')) {
                status = 'Aprobado';
                if (obs.includes('puntos académicos') && x.amount) {
                    const rate = await getExchangeRate();
                    points = (Math.abs(Number(x.amount)) / rate).toFixed(2);
                }
            } else if (obs.includes('rechazado') || obs.includes('devolución')) {
                status = 'Rechazado';
            } else {
                status = 'Pendiente';
            }
        }
        if (obs.includes('subasta')) type = 'Subasta';
        let amount = typeof x.amount === 'string' ? parseFloat(x.amount) || 0 : typeof x.amount === 'number' ? x.amount : 0;
        if (amount !== 0 || obs.trim() !== '') {
            result.push({ id: `${userId}-${fecha}-${Math.random().toString(36).slice(2)}`, userId, date: fecha, student: `${firstName} ${lastName}`.trim(), cedula: cedula, type, status, description: x.observation || 'Sin descripción', amount: `${amount >= 0 ? '+' : ''}${amount}`, points: points });
        }
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ========================================
// CONFIGURACIÓN DEL SISTEMA
// ========================================
/**
 * Obtiene la tasa de cambio actual para canjes (MB a puntos académicos)
 * @returns {Promise<number>} - Tasa de cambio (por defecto 100)
 */
async function getExchangeRate() {
    const dbData = await readDatabase();
    return dbData.exchangeRate || 100;
}

/**
 * Obtiene los puntos por defecto configurados para nuevos usuarios
 * @returns {Promise<number>} Número de puntos por defecto (10 si no está configurado)
 */
async function getDefaultPoints() {
    const dbData = await readDatabase();
    return dbData.defaultPoints || 10; // 10 puntos por defecto si no está configurado
}

/**
 * Configura los puntos por defecto para nuevos usuarios
 * @param {number} points - Número de puntos por defecto a configurar
 * @returns {Promise<void>}
 */
async function setDefaultPoints(points) {
    const dbData = await readDatabase();
    dbData.defaultPoints = Number(points);
    await writeDatabase(dbData);
}

/**
 * Configura la nueva tasa de cambio para canjes
 * @param {number} newRate - Nueva tasa de cambio
 */
async function setExchangeRate(newRate) {
    const dbData = await readDatabase();
    dbData.exchangeRate = Number(newRate);
    await writeDatabase(dbData);
}

/**
 * Sincroniza los puntos de los usuarios con el historial de transacciones
 * Recalcula los puntos basándose en todas las transacciones registradas
 * @param {Object} dbData - Datos de la base de datos
 */
function syncUserPointsWithHistory(dbData) {
    dbData.users = (dbData.users || []).filter(u => typeof u === 'object' && u !== null && u.id);
    const users = dbData.users;
    const history = dbData.assignHistory || [];
    const pointsByUser = {};
    users.forEach(u => { pointsByUser[u.id] = 0; });
    history.forEach(h => { if (pointsByUser[h.userId] !== undefined) pointsByUser[h.userId] += Number(h.amount); });
    users.forEach(u => { u.points = Number(pointsByUser[u.id]?.toFixed(2) || 0); });
}

// ========================================
// GESTIÓN DE SOLICITUDES DE REGISTRO
// ========================================
/**
 * Crea una nueva solicitud de registro de usuario
 * @param {Object} userData - Datos del usuario que solicita registro
 * @returns {Promise<boolean>} - true si se creó exitosamente
 */
async function addRegistrationRequest(userData) {
    const dbData = await readDatabase();
    const existingRequest = (dbData.registrationRequests || []).find(req => String(req.id) === String(userData.id));
    if (existingRequest) return false;
    const existingUser = (dbData.users || []).find(user => String(user.id) === String(userData.id));
    if (existingUser) return false;
    dbData.registrationRequests = dbData.registrationRequests || [];
    const requestId = Date.now() + '-' + Math.random().toString(36).slice(2);
    dbData.registrationRequests.push({ id: requestId, userId: userData.id, firstName: userData.firstName, lastName: userData.lastName, password: userData.password, status: 'Pendiente', date: new Date().toISOString(), reviewedBy: null, reviewedDate: null, reviewNotes: null });
    await writeDatabase(dbData);
    return true;
}

/**
 * Obtiene todas las solicitudes de registro ordenadas por fecha
 * @returns {Promise<Array>} - Array de solicitudes de registro
 */
async function getAllRegistrationRequests() {
    const dbData = await readDatabase();
    return (dbData.registrationRequests || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Obtiene solicitudes de registro filtradas por estado
 * @param {string} status - Estado a filtrar (Pendiente, Aprobado, Rechazado)
 * @returns {Promise<Array>} - Array de solicitudes filtradas
 */
async function getRegistrationRequestsByStatus(status) {
    const dbData = await readDatabase();
    return (dbData.registrationRequests || []).filter(req => req.status === status);
}

/**
 * Actualiza el estado de una solicitud de registro (Aprobado/Rechazado)
 * Si se aprueba, crea el usuario con puntos por defecto y lo registra en el historial
 * @param {string} requestId - ID de la solicitud de registro
 * @param {string} status - Estado: 'Aprobado' o 'Rechazado'
 * @param {string} reviewedBy - Usuario que revisó la solicitud
 * @param {string} reviewNotes - Notas adicionales del revisor (opcional)
 * @returns {Promise<Object|null>} La solicitud actualizada o null si no se encuentra
 */
async function updateRegistrationStatus(requestId, status, reviewedBy, reviewNotes = null) {
    const dbData = await readDatabase();
    const request = (dbData.registrationRequests || []).find(req => req.id === requestId);
    if (!request) return null;
    
    // Actualizar información de la solicitud
    request.status = status;
    request.reviewedBy = reviewedBy;
    request.reviewedDate = new Date().toISOString();
    request.reviewNotes = reviewNotes;
    
    if (status === 'Aprobado') {
        // Obtener puntos por defecto configurados
        const defaultPoints = await getDefaultPoints();
        
        // Crear nuevo usuario con puntos por defecto
        const newUser = { 
            id: request.userId, 
            firstName: request.firstName, 
            lastName: request.lastName, 
            password: request.password, 
            points: defaultPoints, // Asignar puntos por defecto
            cedula: request.userId, 
            registrationDate: new Date().toISOString(), 
            status: 'Activo' 
        };
        
        // Añadir usuario a la lista
        if(!dbData.users) dbData.users = [];
        dbData.users.push(newUser);
        
        // Registrar en el historial la asignación de puntos de bienvenida
        dbData.assignHistory = dbData.assignHistory || [];
        dbData.assignHistory.push({ 
            userId: request.userId, 
            firstName: request.firstName, 
            lastName: request.lastName, 
            amount: defaultPoints, 
            observation: `Registro aprobado por ${reviewedBy} - Puntos de bienvenida: ${defaultPoints} MB`, 
            date: new Date().toISOString() 
        });
        
        // Eliminar la solicitud de la lista de pendientes
        dbData.registrationRequests = dbData.registrationRequests.filter(req => req.id !== requestId);
    } else if (status === 'Rechazado') {
        // Registrar rechazo en el historial
        dbData.assignHistory = dbData.assignHistory || [];
        dbData.assignHistory.push({ 
            userId: request.userId, 
            firstName: request.firstName, 
            lastName: request.lastName, 
            amount: 0, 
            observation: `Registro rechazado por ${reviewedBy}${reviewNotes ? `: ${reviewNotes}` : ''}`, 
            date: new Date().toISOString() 
        });
        
        // Eliminar la solicitud de la lista de pendientes
        dbData.registrationRequests = dbData.registrationRequests.filter(req => req.id !== requestId);
    }
    
    await writeDatabase(dbData);
    return request;
}

// Funciones de Anuncios y Logs de Auditoría
// ========================================
// SISTEMA DE ANUNCIOS Y LOGS DE AUDITORÍA
// ========================================
/**
 * Obtiene todos los anuncios del sistema
 * @returns {Promise<Array>} - Array de anuncios
 */
async function getAnnouncements() {
    const dbData = await readDatabase();
    return dbData.announcements || [];
}

/**
 * Crea un nuevo anuncio en el sistema
 * @param {Object} announcement - Datos del anuncio
 * @returns {Promise<Object>} - Anuncio creado
 */
async function AddAnnouncement(announcement) {
    const dbData = await readDatabase();
    dbData.announcements = dbData.announcements || [];
    const newAnnouncement = {
        id: `announcement-${Date.now()}`,
        message: announcement.message,
        author: announcement.author || 'admin',
        date: new Date().toISOString()
    };
    dbData.announcements.unshift(newAnnouncement);
    await writeDatabase(dbData);
    return newAnnouncement;
}

/**
 * Obtiene todos los logs de auditoría del sistema
 * @returns {Promise<Array>} - Array de logs de auditoría
 */
async function getAuditLogs() {
    const dbData = await readDatabase();
    return dbData.auditLogs || [];
}

/**
 * Crea un nuevo log de auditoría
 * @param {Object} log - Datos del log
 * @returns {Promise<Object>} - Log creado
 */
async function AddAuditLog(log) {
    const dbData = await readDatabase();
    dbData.auditLogs = dbData.auditLogs || [];
    const newLog = {
        id: `log-${Date.now()}`,
        action: log.action,
        user: log.user,
        details: log.details || '',
        date: new Date().toISOString()
    };
    dbData.auditLogs.unshift(newLog);
    await writeDatabase(dbData);
    return newLog;
}

// ========================================
// SISTEMA DE SUBASTAS
// ========================================
/**
 * Finaliza una subasta y determina el ganador
 * Procesa los puntos de todos los participantes
 * @param {string} auctionId - ID de la subasta a finalizar
 * @returns {Promise<Object|null>} - Subasta finalizada o null si no se encuentra
 */
async function finalizeAuction(auctionId) {
    const dbData = await readDatabase();
    const auction = (dbData.auctions || []).find(a => a.id === auctionId);
    if (!auction) return null;
    
    const bids = auction.bids || [];
    if (bids.length > 0) {
        // Encontrar el ganador (última oferta)
        const winner = bids[bids.length - 1];
        const winningAmount = winner.amount;
        
        // Procesar puntos para todos los participantes
        bids.forEach((bid, index) => {
            const user = (dbData.users || []).find(u => String(u.id).trim() === String(bid.userId).trim());
            if (user) {
                if (index === bids.length - 1) {
                    // Ganador: descontar los puntos de la oferta ganadora
                    user.points -= bid.amount;
                    dbData.assignHistory = dbData.assignHistory || [];
                    dbData.assignHistory.push({
                        userId: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        amount: -bid.amount, // Descontar puntos
                        observation: `¡Ganó la subasta: ${auction.title}! (${bid.amount} MB descontados)`,
                        date: new Date().toISOString()
                    });
                } else {
                    // Perdedores: no hacer nada (los puntos nunca se descontaron)
                    dbData.assignHistory = dbData.assignHistory || [];
                    dbData.assignHistory.push({
                        userId: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        amount: 0, // No cambia el saldo
                        observation: `Perdió la subasta: ${auction.title} (${bid.amount} MB liberados)`,
                        date: new Date().toISOString()
                    });
                }
            }
        });
    }
    
    auction.status = 'Finalizada';
    syncUserPointsWithHistory(dbData);
    await writeDatabase(dbData);
    return auction;
}

/**
 * Coloca una oferta en una subasta
 * Verifica que el usuario tenga suficientes puntos disponibles
 * @param {string} auctionId - ID de la subasta
 * @param {string} userId - ID del usuario
 * @param {string} firstName - Nombre del usuario
 * @param {string} lastName - Apellido del usuario
 * @param {number} amount - Cantidad de la oferta
 * @returns {Promise<Object>} - Resultado de la operación
 */
async function placeAuctionBid(auctionId, userId, firstName, lastName, amount) {
    const dbData = await readDatabase();
    const user = (dbData.users || []).find(u => String(u.id).trim() === String(userId).trim());
    if (!user) return { success: false, message: 'Usuario no encontrado' };
    
    const userPoints = user.points || 0;
    const bidAmount = Number(amount);
    
    // Verificar que tenga suficientes puntos (incluyendo los ya comprometidos)
    const committedPoints = getCommittedPoints(userId, dbData.auctions || []);
    const availablePoints = userPoints - committedPoints;
    
    if (availablePoints < bidAmount) {
        return { success: false, message: 'Saldo insuficiente para realizar esta oferta' };
    }
    
    const auction = (dbData.auctions || []).find(a => a.id === auctionId);
    if (!auction) return { success: false, message: 'Subasta no encontrada' };
    
    if (auction.status !== 'Activa') {
        return { success: false, message: 'La subasta no está activa' };
    }
    
    if (new Date(auction.endDate) < new Date()) {
        return { success: false, message: 'La subasta ya finalizó' };
    }
    
    if (bidAmount <= Number(auction.highestBid)) {
        return { success: false, message: 'La oferta debe ser mayor a la oferta más alta' };
    }
    
    // Registrar la oferta (sin descontar puntos aún)
    const bid = { userId, firstName, lastName, amount: bidAmount, date: new Date().toISOString() };
    auction.bids = auction.bids || [];
    auction.bids.push(bid);
    auction.highestBid = bidAmount;
    
    // Registrar en el historial como oferta comprometida
    dbData.assignHistory = dbData.assignHistory || [];
    dbData.assignHistory.push({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        amount: 0, // No cambia el saldo, solo compromete
        observation: `Oferta comprometida en subasta: ${auction.title} (${bidAmount} MB)`,
        date: new Date().toISOString()
    });
    
    await writeDatabase(dbData);
    return { success: true, auction };
}

/**
 * Calcula los puntos comprometidos por un usuario en subastas activas
 * @param {string} userId - ID del usuario
 * @param {Array} auctions - Array de subastas
 * @returns {number} - Total de puntos comprometidos
 */
function getCommittedPoints(userId, auctions) {
    let committed = 0;
    auctions.forEach(auction => {
        if (auction.status === 'Activa') {
            const userBids = (auction.bids || []).filter(bid => bid.userId === userId);
            if (userBids.length > 0) {
                // Solo contar la oferta más alta del usuario en esta subasta
                const highestBid = Math.max(...userBids.map(bid => bid.amount));
                committed += highestBid;
            }
        }
    });
    return committed;
}

// ========================================
// FUNCIONES DE MANTENIMIENTO
// ========================================
/**
 * Limpia datos históricos del sistema según el tipo especificado
 * @param {string} clearType - Tipo de datos a limpiar
 * @returns {Promise<Object>} - Resultado de la operación
 */
async function clearHistoryData(clearType = 'all') {
    const dbData = await readDatabase();
    let clearedItems = [];
    
    try {
        switch (clearType) {
            case 'assignHistory':
                clearedItems = dbData.assignHistory || [];
                dbData.assignHistory = [];
                break;
            case 'auditLogs':
                clearedItems = dbData.auditLogs || [];
                dbData.auditLogs = [];
                break;
            case 'announcements':
                clearedItems = dbData.announcements || [];
                dbData.announcements = [];
                break;
            case 'exchangeRequests':
                clearedItems = dbData.exchangeRequests || [];
                dbData.exchangeRequests = [];
                break;
            case 'registrationRequests':
                clearedItems = dbData.registrationRequests || [];
                dbData.registrationRequests = [];
                break;
            case 'all':
                clearedItems = {
                    assignHistory: dbData.assignHistory || [],
                    auditLogs: dbData.auditLogs || [],
                    announcements: dbData.announcements || [],
                    exchangeRequests: dbData.exchangeRequests || [],
                    registrationRequests: dbData.registrationRequests || []
                };
                dbData.assignHistory = [];
                dbData.auditLogs = [];
                dbData.announcements = [];
                dbData.exchangeRequests = [];
                dbData.registrationRequests = [];
                break;
            default:
                throw new Error('Tipo de limpieza no válido');
        }
        
        await writeDatabase(dbData);
        
        // Registrar la acción de limpieza en auditLogs
        await AddAuditLog({
            action: `Limpieza de historial: ${clearType}`,
            user: 'admin',
            details: `Se limpiaron ${Array.isArray(clearedItems) ? clearedItems.length : Object.values(clearedItems).flat().length} elementos`
        });
        
        return {
            success: true,
            clearedType: clearType,
            clearedCount: Array.isArray(clearedItems) ? clearedItems.length : Object.values(clearedItems).flat().length,
            message: `Historial de ${clearType} limpiado exitosamente`
        };
    } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
    }
}

// ========================================
// EXPORTACIÓN DE FUNCIONES
// ========================================
/**
 * Exporta todas las funciones del manejador de datos
 * para su uso en otros módulos del sistema
 */
export {
    readDatabase,
    writeDatabase,
    FindUserById,
    getAllUsers,
    CreateOrUpdateUser,
    AssignPoints,
    addExchangeRequest,
    getPendingExchanges,
    getAllExchangeRequests,
    assignTopStudentBadge,
    updateExchangeStatus,
    getAllHistory,
    getExchangeRate,
    setExchangeRate,
    getDefaultPoints,
    setDefaultPoints,
    addRegistrationRequest,
    getAllRegistrationRequests,
    getRegistrationRequestsByStatus,
    updateRegistrationStatus,
    getAnnouncements,
    AddAnnouncement,
    getAuditLogs,
    AddAuditLog,
    finalizeAuction,
    placeAuctionBid,
    clearHistoryData
};
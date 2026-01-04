/**
 * ========================================
 * NÚCLEO DE DATOS - FUNDACIÓN SCP
 * ========================================
 * * Este archivo gestiona el acceso a la Base de Datos Central de la Fundación.
 * Implementa protocolos de seguridad para el registro de personal y niveles de acceso.
 */

import { getFirebaseDB } from './firebase';

// CONFIGURACIÓN DE PROTOCOLO
const DB_COLLECTION = 'foundation_database'; // Nueva colección para la Fundación
const DB_DOC = 'central_records'; 

// ========================================
// PROTOCOLOS DE COMUNICACIÓN (Firestore)
// ========================================

async function readDatabase() {
    const db = getFirebaseDB();
    try {
        const docRef = db.collection(DB_COLLECTION).doc(DB_DOC);
        const doc = await docRef.get();
        if (!doc.exists) {
            // Si no existe, inicializamos una estructura limpia
            return { users: [], registrationRequests: [], logs: [] };
        }
        return doc.data();
    } catch (error) {
        console.error("❌ ERROR DE LECTURA [NIVEL 5]:", error);
        throw new Error("Fallo en la conexión con el servidor central.");
    }
}

async function writeDatabase(dbData) {
    const db = getFirebaseDB();
    const docRef = db.collection(DB_COLLECTION).doc(DB_DOC);
    await docRef.set(dbData);
}

// ========================================
// GESTIÓN DE PERSONAL Y IDENTIDADES
// ========================================

/**
 * Busca un agente por su ID en los registros activos o pendientes
 */
export async function FindUserById(id) {
    const dbData = await readDatabase();
    const idStr = String(id).trim();

    // 1. Verificar si es la cuenta del Administrador O5 (desde .env)
    if (idStr === String(process.env.ADMIN_USERNAME)) {
        return { 
            id: process.env.ADMIN_USERNAME, 
            firstName: "Consejo", 
            lastName: "O5", 
            role: '5', 
            department: 'Administración',
            status: 'Activo' 
        };
    }

    // 2. Buscar en personal activo
    const user = (dbData.users || []).find(u => String(u.id).trim() === idStr);
    if (user) return { ...user, status: 'Activo' };

    // 3. Buscar en solicitudes de acceso pendientes
    const pending = (dbData.registrationRequests || []).find(req => String(req.id).trim() === idStr);
    if (pending) return { ...pending, status: 'Pendiente' };

    return null;
}

/**
 * Crea una nueva solicitud de registro de personal
 * Recibe: id, firstName, lastName, password, role (nivel), department
 */
export async function addRegistrationRequest(userData) {
    const dbData = await readDatabase();
    
    // Evitar duplicados
    const existing = await FindUserById(userData.id);
    if (existing) return false;

    if (!dbData.registrationRequests) dbData.registrationRequests = [];

    // Protocolo de inserción de datos
    dbData.registrationRequests.push({
        id: String(userData.id).trim(),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        password: userData.password, // Nota: Se recomienda hash en el futuro
        role: userData.role,         // Nivel de Acceso (1-5)
        department: userData.department,
        status: 'Pendiente',
        createdAt: new Date().toISOString()
    });

    await writeDatabase(dbData);
    
    // Log de auditoría
    await AddAuditLog(`Solicitud de registro creada para ID: ${userData.id}`);
    
    return true;
}

/**
 * Obtiene todas las solicitudes de acceso para la terminal O5
 */
export async function getAllRegistrationRequests() {
    const dbData = await readDatabase();
    return (dbData.registrationRequests || []).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// ========================================
// SISTEMA DE AUDITORÍA Y SEGURIDAD
// ========================================

export async function AddAuditLog(action) {
    const dbData = await readDatabase();
    if (!dbData.logs) dbData.logs = [];
    
    dbData.logs.unshift({
        id: `LOG-${Date.now()}`,
        action: action.toUpperCase(),
        timestamp: new Date().toISOString(),
        clearance: 'TOP SECRET'
    });

    // Mantener solo los últimos 100 logs para optimizar
    if (dbData.logs.length > 100) dbData.logs = dbData.logs.slice(0, 100);
    
    await writeDatabase(dbData);
}

/**
 * Obtiene el personal activo de la fundación
 */
export async function getAllUsers() {
    const dbData = await readDatabase();
    return dbData.users || [];
}
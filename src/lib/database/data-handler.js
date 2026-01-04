/**
 * ========================================
 * NÚCLEO DE DATOS - FUNDACIÓN SCP
 * ========================================
 */

import { getFirebaseDB } from '@/lib/database/firebase';

const DB_COLLECTION = 'foundation_database'; 
const DB_DOC = 'central_records'; 

// ========================================
// PROTOCOLOS DE COMUNICACIÓN (Firestore)
// ========================================

// AÑADIDO 'export' AQUÍ
export async function readDatabase() {
    const db = getFirebaseDB();
    try {
        const docRef = db.collection(DB_COLLECTION).doc(DB_DOC);
        const doc = await docRef.get();
        if (!doc.exists) {
            return { users: [], registrationRequests: [], logs: [] };
        }
        return doc.data();
    } catch (error) {
        console.error("❌ ERROR DE LECTURA [NIVEL 5]:", error);
        throw new Error("Fallo en la conexión con el servidor central.");
    }
}

// AÑADIDO 'export' AQUÍ
export async function writeDatabase(dbData) {
    const db = getFirebaseDB();
    const docRef = db.collection(DB_COLLECTION).doc(DB_DOC);
    await docRef.set(dbData);
}

// ========================================
// GESTIÓN DE PERSONAL Y IDENTIDADES
// ========================================

export async function FindUserById(id) {
    const dbData = await readDatabase();
    const idStr = String(id).trim();

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

    const user = (dbData.users || []).find(u => String(u.id).trim() === idStr);
    if (user) return { ...user, status: 'Activo' };

    const pending = (dbData.registrationRequests || []).find(req => String(req.id).trim() === idStr);
    if (pending) return { ...pending, status: 'Pendiente' };

    return null;
}

export async function addRegistrationRequest(userData) {
    const dbData = await readDatabase();
    const existing = await FindUserById(userData.id);
    if (existing) return false;

    if (!dbData.registrationRequests) dbData.registrationRequests = [];

    dbData.registrationRequests.push({
        id: String(userData.id).trim(),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        password: userData.password, 
        role: userData.role,
        department: userData.department,
        status: 'Pendiente',
        createdAt: new Date().toISOString()
    });

    await writeDatabase(dbData);
    await AddAuditLog(`Solicitud de registro creada para ID: ${userData.id}`);
    return true;
}

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

    if (dbData.logs.length > 100) dbData.logs = dbData.logs.slice(0, 100);
    await writeDatabase(dbData);
}

export async function getAllUsers() {
    const dbData = await readDatabase();
    return dbData.users || [];
}
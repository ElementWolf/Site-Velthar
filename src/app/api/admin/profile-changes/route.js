import { NextResponse } from "next/server";
import { verifyJwtFromRequest } from "../../auth/utils";
import { getFirebaseDB } from "../../firebase";

// Obtener historial de cambios de un usuario
export async function GET(request) {
    try {
        const userId = verifyJwtFromRequest(request);
        if (userId !== process.env.ADMIN_USERNAME) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');
        
        if (!targetUserId) {
            return NextResponse.json(
                { success: false, error: "ID de usuario requerido" },
                { status: 400 }
            );
        }
        
        const db = getFirebaseDB();
        const docRef = db.collection('database').doc('main');
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return NextResponse.json(
                { success: false, error: "Base de datos no encontrada" },
                { status: 404 }
            );
        }
        
        const data = doc.data();
        const profileChanges = data.profileChanges || [];
        
        // Filtrar cambios del usuario específico
        const userChanges = profileChanges
            .filter(change => change.userId === targetUserId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return NextResponse.json({
            success: true,
            changes: userChanges,
            total: userChanges.length
        });
        
    } catch (error) {
        console.error("Error getting profile changes:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener historial de cambios" },
            { status: 500 }
        );
    }
}

// Registrar un cambio en el perfil
export async function POST(request) {
    try {
        const userId = verifyJwtFromRequest(request);
        if (userId !== process.env.ADMIN_USERNAME) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }
        
        const { targetUserId, field, oldValue, newValue, reason, ipAddress } = await request.json();
        
        if (!targetUserId || !field) {
            return NextResponse.json(
                { success: false, error: "ID de usuario y campo son requeridos" },
                { status: 400 }
            );
        }
        
        const changeRecord = {
            id: Date.now().toString(),
            userId: targetUserId,
            field,
            oldValue: oldValue || null,
            newValue: newValue || null,
            reason: reason || 'Modificación de perfil',
            adminId: userId,
            timestamp: new Date().toISOString(),
            ipAddress: ipAddress || 'No registrada'
        };
        
        const db = getFirebaseDB();
        const docRef = db.collection('database').doc('main');
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return NextResponse.json(
                { success: false, error: "Base de datos no encontrada" },
                { status: 404 }
            );
        }
        
        const data = doc.data();
        const profileChanges = data.profileChanges || [];
        
        // Añadir el nuevo cambio
        profileChanges.push(changeRecord);
        
        // Mantener solo los últimos 1000 cambios para evitar sobrecarga
        if (profileChanges.length > 1000) {
            profileChanges.splice(0, profileChanges.length - 1000);
        }
        
        await docRef.update({
            profileChanges: profileChanges
        });
        
        return NextResponse.json({
            success: true,
            message: "Cambio registrado exitosamente",
            change: changeRecord
        });
        
    } catch (error) {
        console.error("Error recording profile change:", error);
        return NextResponse.json(
            { success: false, error: "Error al registrar cambio" },
            { status: 500 }
        );
    }
} 
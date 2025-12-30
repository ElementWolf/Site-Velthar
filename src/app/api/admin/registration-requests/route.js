import { NextResponse } from "next/server";
import { getAllRegistrationRequests, updateRegistrationStatus } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

export async function GET(req) {
    const userId = verifyJwtFromRequest(req);
    if (userId === process.env.ADMIN_USERNAME) {
        try {
            const requests = await getAllRegistrationRequests();
            return NextResponse.json(
                { success: true, requests },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error getting registration requests:", error);
            return NextResponse.json(
                { success: false, error: "Error al obtener solicitudes de registro" },
                { status: 500 }
            );
        }
    }
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}

export async function POST(req) {
    const userId = verifyJwtFromRequest(req);
    if (userId === process.env.ADMIN_USERNAME) {
        try {
            const { requestId, status, reviewNotes } = await req.json();
            
            if (!requestId || !status) {
                return NextResponse.json(
                    { success: false, error: "ID de solicitud y estado son requeridos" },
                    { status: 400 }
                );
            }
            
            if (!['Aprobado', 'Rechazado'].includes(status)) {
                return NextResponse.json(
                    { success: false, error: "Estado debe ser 'Aprobado' o 'Rechazado'" },
                    { status: 400 }
                );
            }
            
            const updatedRequest = await updateRegistrationStatus(
                requestId, 
                status, 
                userId, 
                reviewNotes
            );
            
            if (!updatedRequest) {
                return NextResponse.json(
                    { success: false, error: "Solicitud no encontrada" },
                    { status: 404 }
                );
            }
            
            return NextResponse.json(
                { 
                    success: true, 
                    message: `Solicitud ${status.toLowerCase()} exitosamente`,
                    request: updatedRequest
                },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error updating registration request:", error);
            return NextResponse.json(
                { success: false, error: "Error al actualizar solicitud de registro" },
                { status: 500 }
            );
        }
    }
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
} 
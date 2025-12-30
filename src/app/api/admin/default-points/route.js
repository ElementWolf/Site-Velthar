import { NextResponse } from "next/server";
import { getDefaultPoints, setDefaultPoints } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

/**
 * Endpoint GET para obtener los puntos por defecto configurados
 * Solo accesible para administradores
 * @param {Request} req - Objeto de solicitud HTTP
 * @returns {Promise<Response>} Respuesta JSON con los puntos por defecto
 */
export async function GET(req) {
    // Verificar que el usuario sea administrador
    const userId = verifyJwtFromRequest(req);
    if (userId === process.env.ADMIN_USERNAME) {
        try {
            // Obtener puntos por defecto desde la base de datos
            const defaultPoints = await getDefaultPoints();
            return NextResponse.json({
                success: true,
                defaultPoints: defaultPoints
            });
        } catch (error) {
            console.error("Error getting default points:", error);
            return NextResponse.json(
                { success: false, error: "Error al obtener puntos por defecto" },
                { status: 500 }
            );
        }
    }
    // Usuario no autorizado
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}

/**
 * Endpoint POST para configurar los puntos por defecto
 * Solo accesible para administradores
 * @param {Request} req - Objeto de solicitud HTTP con { points: number }
 * @returns {Promise<Response>} Respuesta JSON confirmando la configuración
 */
export async function POST(req) {
    // Verificar que el usuario sea administrador
    const userId = verifyJwtFromRequest(req);
    if (userId === process.env.ADMIN_USERNAME) {
        try {
            const { points } = await req.json();
            
            // Validar que los puntos sean un número válido y no negativo
            if (typeof points !== 'number' || points < 0) {
                return NextResponse.json(
                    { success: false, error: "Los puntos deben ser un número mayor o igual a 0" },
                    { status: 400 }
                );
            }
            
            // Guardar la nueva configuración en la base de datos
            await setDefaultPoints(points);
            
            return NextResponse.json({
                success: true,
                message: `Puntos por defecto configurados a ${points} MB`,
                defaultPoints: points
            });
        } catch (error) {
            console.error("Error setting default points:", error);
            return NextResponse.json(
                { success: false, error: "Error al configurar puntos por defecto" },
                { status: 500 }
            );
        }
    }
    // Usuario no autorizado
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}

import { FindUserById } from "../../data-handler";
import { verifyJwtFromRequest } from "../utils";

export async function GET(request) {
    try {
        const userId = verifyJwtFromRequest(request);
        console.log('[AUTH CHECK] userId extraído del token:', userId);
        
        // Verificar si es admin
        if (userId === process.env.ADMIN_USERNAME) {
            console.log('[AUTH CHECK] Usuario admin verificado');
            return new Response(JSON.stringify({ 
                success: true, 
                user: {
                    id: process.env.ADMIN_USERNAME,
                    firstName: "Agente",
                    lastName: "████",
                    points: 0,
                    type: "admin"
                } 
            }), {
                status: 200,
            });
        }
        
        // Buscar usuario en la base de datos
        const user = await FindUserById(userId);
        console.log('[AUTH CHECK] Usuario encontrado:', user);
        
        if (user && user.status === 'Activo') {
            return new Response(JSON.stringify({ 
                success: true, 
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    points: user.points,
                    type: "student"
                } 
            }), {
                status: 200,
            });
        }
        
        console.log('[AUTH CHECK] Usuario no encontrado o no activo, devolviendo 403');
        return new Response(JSON.stringify({ success: false }), {
            status: 403,
        });
    } catch (error) {
        console.error('[AUTH CHECK] Error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
        });
    }
}

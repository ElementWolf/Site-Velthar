import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { FindUserById, getRegistrationRequestsByStatus } from "../../data-handler";

function isAdmin(user, password) {
    if (user === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        return true;
    }
    return false;
}

export async function POST(req) {
    console.log('[LOGIN] === INICIO DE LOGIN ===');
    console.log('[LOGIN] Timestamp:', new Date().toISOString());
    console.log('[LOGIN] Variables de entorno check:');
    console.log('[LOGIN] JWT_SECRET presente:', !!process.env.JWT_SECRET);
    console.log('[LOGIN] ADMIN_USERNAME presente:', !!process.env.ADMIN_USERNAME);
    console.log('[LOGIN] ADMIN_PASSWORD presente:', !!process.env.ADMIN_PASSWORD);
    
    try {
        const data = await req.json();
        const { id, password } = data;
        console.log('[LOGIN] Intentando login con:', id, password ? '[PASSWORD PRESENTE]' : '[PASSWORD VACIO]');

        if (!id || !password) {
            return NextResponse.json(
                { success: false, message: "Credenciales de seguridad insuficientes. Acceso denegado." },
                { status: 400 }
            );
        }

        console.log('[LOGIN] Login admin exitoso');
        if (!process.env.JWT_SECRET) {
            console.error('[LOGIN] JWT_SECRET no configurado para admin login');
            return NextResponse.json(
                { success: false, message: "Configuración de seguridad incompleta." },
                { status: 500 }
            );
        }
            const token = jwt.sign({ userId: process.env.ADMIN_USERNAME }, process.env.JWT_SECRET, { expiresIn: "1h" });
            return NextResponse.json(
                {
                    success: true, 
                    message: "Acceso autorizado. Bienvenido al sistema de la Fundación.", 
                    token: token,
                    user: {
                        id: process.env.ADMIN_USERNAME,
                        firstName: "Prof.",
                        lastName: "Merlyn",
                        points: 0,
                        type: "admin"
                    }
                },
                { status: 200 }
            );
        }

        const user = await FindUserById(id);
        console.log('[LOGIN] Usuario encontrado:', user);

        if (!user || password !== user?.password) {
            console.log('[LOGIN] Usuario no encontrado o contraseña incorrecta');
            return NextResponse.json(
                { success: false, message: "Credenciales no reconocidas en la base de datos de la Fundación. Acceso denegado." },
                { status: 404 }
            );
        }

        // Verificar que el usuario esté aprobado
        if (user.status !== 'Activo') {
            console.log('[LOGIN] Usuario no está aprobado:', user.status);
            return NextResponse.json(
                { success: false, message: "Cuenta pendiente de aprobación por el Consejo de Seguridad. Contacta al administrador de nivel 4." },
                { status: 403 }
            );
        }

        console.log('[LOGIN] Login exitoso para usuario:', user);
        if (!process.env.JWT_SECRET) {
            console.error('[LOGIN] JWT_SECRET no configurado para user login');
            return NextResponse.json(
                { success: false, message: "Configuración de seguridad incompleta." },
                { status: 500 }
            );
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return NextResponse.json(
            {
                success: true, 
                message: "Inicio de sesión exitoso.", 
                token: token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    points: user.points,
                    type: "student"
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[LOGIN] === ERROR EN LOGIN ===");
        console.error("[LOGIN] Error message:", error.message);
        console.error("[LOGIN] Error stack:", error.stack);
        console.error("[LOGIN] Error code:", error.code);
        console.error("[LOGIN] Error details:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del sistema de contención. Protocolo de seguridad activado." },
            { status: 500 }
        );
    }
}

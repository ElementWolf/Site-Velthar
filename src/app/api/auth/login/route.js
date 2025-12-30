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
    try {
        const data = await req.json();
        const { id, password } = data;
        console.log('[LOGIN] Intentando login con:', id, password);

        if (!id || !password) {
            return NextResponse.json(
                { success: false, message: "ID y contraseña obligatorios." },
                { status: 400 }
            );
        }

        if (isAdmin(id, password)) {
            console.log('[LOGIN] Login admin exitoso');
            const token = jwt.sign({ userId: process.env.ADMIN_USERNAME }, process.env.JWT_SECRET, { expiresIn: "1h" });
            return NextResponse.json(
                {
                    success: true, 
                    message: "Inicio de sesión exitoso.", 
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
                { success: false, message: "Usuario no encontrado o contraseña incorrecta." },
                { status: 404 }
            );
        }

        // Verificar que el usuario esté aprobado
        if (user.status !== 'Activo') {
            console.log('[LOGIN] Usuario no está aprobado:', user.status);
            return NextResponse.json(
                { success: false, message: "Tu cuenta está pendiente de aprobación. Contacta al administrador." },
                { status: 403 }
            );
        }

        console.log('[LOGIN] Login exitoso para usuario:', user);
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
        console.error("POST /api/auth/login error:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor o base de datos no disponible." },
            { status: 500 }
        );
    }
}

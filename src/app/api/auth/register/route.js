import { NextResponse } from "next/server";
import { FindUserById, addRegistrationRequest } from "../../data-handler";

export async function POST(req) {
    try {
        const data = await req.json();

        // Basic validation
        const { id, firstName, lastName, password } = data;
        if (!id || !firstName || !lastName || !password) {
            return NextResponse.json(
                { success: false, message: "Todos los campos son obligatorios." },
                { status: 400 }
            );
        }

        if (!/^\d+$/.test(id.toString())) {
            return NextResponse.json(
                { success: false, message: "El ID debe contener solo números." },
                { status: 400 }
            );
        }

        const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

        if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
            return NextResponse.json(
                { success: false, message: "El nombre y apellido deben contener solo letras y espacios." },
                { status: 400 }
            );
        }

        // Verificar si el usuario ya existe (activo o pendiente)
        const existingUser = await FindUserById(id);

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "El usuario ya existe." },
                { status: 409 }
            );
        }

        // Crear solicitud de registro pendiente
        const success = await addRegistrationRequest({
            id: String(id).trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password,
        });

        if (!success) {
            return NextResponse.json(
                { success: false, message: "Ya existe una solicitud pendiente para este usuario." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Solicitud de registro enviada. Será revisada por un administrador." },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/auth/register error:", error);
        
        // Manejar errores específicos de Firebase
        if (error.code === 'permission-denied') {
            return NextResponse.json(
                { success: false, message: "Error de permisos en la base de datos." },
                { status: 500 }
            );
        }
        
        if (error.code === 'unavailable') {
            return NextResponse.json(
                { success: false, message: "La base de datos no está disponible en este momento." },
                { status: 503 }
            );
        }
        
        // Error genérico
        return NextResponse.json(
            { success: false, message: "Error interno del servidor. Inténtalo de nuevo más tarde." },
            { status: 500 }
        );
    }
}

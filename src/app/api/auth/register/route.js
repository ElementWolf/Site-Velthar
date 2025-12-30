import { NextResponse } from "next/server";
import { FindUserById, addRegistrationRequest } from "../../data-handler";

export async function POST(req) {
    try {
        const data = await req.json();

        // Basic validation
        const { id, firstName, lastName, password } = data;
        if (!id || !firstName || !lastName || !password) {
            return NextResponse.json(
                { success: false, message: "Todos los campos de identificación son obligatorios para el protocolo de contención." },
                { status: 400 }
            );
        }

        if (!/^\d+$/.test(id.toString())) {
            return NextResponse.json(
                { success: false, message: "ID debe contener solo números para el sistema de clasificación." },
                { status: 400 }
            );
        }

        const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

        if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
            return NextResponse.json(
                { success: false, message: "Nombre y apellido deben contener solo caracteres alfanuméricos autorizados." },
                { status: 400 }
            );
        }

        // Verificar si el usuario ya existe (activo o pendiente)
        const existingUser = await FindUserById(id);

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "Identidad ya registrada en la base de datos de la Fundación." },
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
                { success: false, message: "Ya existe una solicitud de acceso pendiente para esta identidad." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Solicitud de acceso enviada. Será evaluada por el Consejo de Seguridad." },
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
            { success: false, message: "Error interno del sistema de contención. Protocolo de seguridad activado." },
            { status: 500 }
        );
    }
}

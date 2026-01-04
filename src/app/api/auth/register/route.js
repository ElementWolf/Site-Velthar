import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
// Importación desde tu nueva ubicación del data-handler
import { FindUserById, addRegistrationRequest } from "@/lib/database/data-handler"; 

export async function POST(req) {
    try {
        // 1. Verificar token de admin
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: "ACCESO DENEGADO. CREDENCIALES O5 REQUERIDAS." },
                { status: 403 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.userId !== process.env.ADMIN_USERNAME) {
            return NextResponse.json(
                { success: false, message: "NIVEL DE AUTORIZACIÓN INSUFICIENTE." },
                { status: 403 }
            );
        }

        const data = await req.json();

        // 2. Extraer todos los campos (incluyendo rol/nivel y departamento)
        const { id, firstName, lastName, password, role, department } = data;

        // 3. Validaciones de Protocolo
        if (!id || !firstName || !lastName || !password || !role || !department) {
            return NextResponse.json(
                { success: false, message: "TODOS LOS CAMPOS SON OBLIGATORIOS PARA EL PROTOCOLO DE SEGURIDAD." },
                { status: 400 }
            );
        }

        // 4. Verificar si la identidad ya existe
        const existingUser = await FindUserById(id);
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "IDENTIDAD YA REGISTRADA EN LOS ARCHIVOS CENTRALES." },
                { status: 409 }
            );
        }

        // 5. Crear solicitud con el nuevo formato de la Fundación
        const success = await addRegistrationRequest({
            id: String(id).trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password,
            role,       // Nivel de Acceso 1-5
            department  // Departamento seleccionado
        });

        if (!success) {
            return NextResponse.json(
                { success: false, message: "ERROR EN LA CREACIÓN DE FICHA DE PERSONAL." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: "SOLICITUD DE ACCESO ENVIADA AL CONSEJO O5." },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/auth/register error:", error);
        return NextResponse.json(
            { success: false, message: "FALLO EN EL SISTEMA DE CONTENCIÓN DE DATOS." },
            { status: 500 }
        );
    }
}
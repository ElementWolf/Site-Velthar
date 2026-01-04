import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { FindUserById, addRegistrationRequest } from "../../data-handler";

export async function POST(req) {
    try {
        // 1. Verificar token de autorización (Protocolo O5)
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: "ACCESO DENEGADO. SOLO EL ADMINISTRADOR PUEDE REGISTRAR PERSONAL." },
                { status: 403 }
            );
        }

        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { success: false, message: "ERROR DE CONFIGURACIÓN DE SEGURIDAD." },
                { status: 500 }
            );
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.userId !== process.env.ADMIN_USERNAME) {
                return NextResponse.json(
                    { success: false, message: "TOKEN NO AUTORIZADO." },
                    { status: 403 }
                );
            }
        } catch (err) {
            return NextResponse.json(
                { success: false, message: "TOKEN INVÁLIDO O EXPIRADO." },
                { status: 403 }
            );
        }

        // 2. Obtener y validar datos del cuerpo de la solicitud
        const data = await req.json();
        const { id, firstName, lastName, password, role, department } = data;

        // Validación de campos obligatorios
        if (!id || !firstName || !lastName || !password || !role || !department) {
            return NextResponse.json(
                { success: false, message: "TODOS LOS CAMPOS (ID, NOMBRE, NIVEL Y DPTO) SON REQUERIDOS." },
                { status: 400 }
            );
        }

        // Validación de formato de ID
        if (!/^\d+$/.test(id.toString())) {
            return NextResponse.json(
                { success: false, message: "EL ID DEBE SER ÚNICAMENTE NUMÉRICO." },
                { status: 400 }
            );
        }

        // 3. Verificar si la identidad ya existe en la base de datos
        const existingUser = await FindUserById(id);
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "IDENTIDAD YA REGISTRADA EN LOS ARCHIVOS DE LA FUNDACIÓN." },
                { status: 409 }
            );
        }

        // 4. Crear solicitud de registro con los nuevos campos
        const success = await addRegistrationRequest({
            id: String(id).trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password: password, // En producción debería estar hasheado
            role: role,         // Nivel de acceso (1-5)
            department: department // Departamento dinámico
        });

        if (!success) {
            return NextResponse.json(
                { success: false, message: "YA EXISTE UNA SOLICITUD PENDIENTE PARA ESTA IDENTIDAD." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: "REGISTRO AUTORIZADO. SOLICITUD ENVIADA AL CONSEJO DE SEGURIDAD." },
            { status: 201 }
        );

    } catch (error) {
        console.error("CRITICAL ERROR EN POST /api/auth/register:", error);
        return NextResponse.json(
            { success: false, message: "ERROR INTERNO DEL SISTEMA. PROTOCOLO DE CONTENCIÓN ACTIVADO." },
            { status: 500 }
        );
    }
}
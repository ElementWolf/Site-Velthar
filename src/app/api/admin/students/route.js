import { NextResponse } from "next/server";
import { getAllUsers, CreateOrUpdateUser } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

// Obtener todos los estudiantes
export async function GET(request) {
    try {
    const userId = verifyJwtFromRequest(request);
        if (userId !== process.env.ADMIN_USERNAME) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }
        
            const { searchParams } = new URL(request.url);
            const search = searchParams.get('search');
            
            const users = await getAllUsers();
            
            // Filtrar por búsqueda si se proporciona
            let filteredUsers = users;
            if (search) {
                const searchLower = search.toLowerCase();
                filteredUsers = users.filter(user => 
                    user.id.toLowerCase().includes(searchLower) ||
                    user.firstName.toLowerCase().includes(searchLower) ||
                    user.lastName.toLowerCase().includes(searchLower)
                );
            }
            
            return NextResponse.json({
                success: true,
                students: filteredUsers,
                total: filteredUsers.length
            });

        } catch (error) {
        console.error("[ERROR EN RUTA] /api/admin/students:", error);
        return NextResponse.json({
            success: false,
            error: "Error interno del servidor (capturado en la ruta)",
            errorMessage: error.message,
            errorStack: error.stack
        }, { status: 500 });
    }
}

// Actualizar estudiante
export async function PUT(request) {
    const userId = verifyJwtFromRequest(request);
    if (userId === process.env.ADMIN_USERNAME) {
        try {
            const { studentId, firstName, lastName, password } = await request.json();
            
            if (!studentId || !firstName || !lastName) {
                return NextResponse.json(
                    { success: false, error: "ID, nombre y apellido son requeridos" },
                    { status: 400 }
                );
            }
            
            // Validar formato del nombre
            const nameRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
            if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
                return NextResponse.json(
                    { success: false, error: "El nombre y apellido deben contener solo letras y espacios" },
                    { status: 400 }
                );
            }
            
            // Obtener usuario actual
            const users = await getAllUsers();
            const currentUser = users.find(u => u.id === studentId);
            
            if (!currentUser) {
                return NextResponse.json(
                    { success: false, error: "Estudiante no encontrado" },
                    { status: 404 }
                );
            }
            
            // Actualizar datos
            const updatedUser = {
                ...currentUser,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                ...(password && { password }) // Solo actualizar contraseña si se proporciona
            };
            
            await CreateOrUpdateUser(updatedUser);
            
            return NextResponse.json({
                success: true,
                message: "Estudiante actualizado exitosamente",
                student: {
                    id: updatedUser.id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    points: updatedUser.points
                }
            });
        } catch (error) {
            console.error("Error updating student:", error);
            return NextResponse.json(
                { success: false, error: "Error al actualizar estudiante" },
                { status: 500 }
            );
        }
    }
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}

// Obtener estudiante específico por ID
export async function POST(request) {
    const userId = verifyJwtFromRequest(request);
    if (userId === process.env.ADMIN_USERNAME) {
        try {
            const { studentId } = await request.json();
            
            if (!studentId) {
                return NextResponse.json(
                    { success: false, error: "ID de estudiante requerido" },
                    { status: 400 }
                );
            }
            
            const users = await getAllUsers();
            const student = users.find(u => u.id === studentId);
            
            if (!student) {
                return NextResponse.json(
                    { success: false, error: "Estudiante no encontrado" },
                    { status: 404 }
                );
            }
            
            return NextResponse.json({
                success: true,
                student: {
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    points: student.points,
                    cedula: student.cedula || student.id,
                    registrationDate: student.registrationDate
                }
            });
        } catch (error) {
            console.error("Error getting student:", error);
            return NextResponse.json(
                { success: false, error: "Error al obtener estudiante" },
                { status: 500 }
            );
        }
    }
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}

// Eliminar estudiante
export async function DELETE(request) {
    console.log('=== INICIO FUNCIÓN DELETE ESTUDIANTE ===');
    
    try {
        const userId = verifyJwtFromRequest(request);
        console.log('Usuario autenticado:', userId);
        console.log('Admin username:', process.env.ADMIN_USERNAME);
        
        if (userId === process.env.ADMIN_USERNAME) {
            console.log('✅ Usuario autorizado como admin');
            
            // Importar funciones del data-handler una sola vez
            const { readDatabase, writeDatabase } = await import('../../data-handler');
            
            const { searchParams } = new URL(request.url);
            const studentId = searchParams.get('id');
            console.log('ID del estudiante a eliminar:', studentId);
            
            if (!studentId) {
                console.log('❌ Error: ID de estudiante no proporcionado');
                return NextResponse.json(
                    { success: false, error: "ID de estudiante requerido" },
                    { status: 400 }
                );
            }
            
            // Verificar que no sea el admin
            if (studentId === process.env.ADMIN_USERNAME) {
                console.log('❌ Error: Intento de eliminar al administrador');
                return NextResponse.json(
                    { success: false, error: "No se puede eliminar al administrador" },
                    { status: 400 }
                );
            }
            
            console.log('🔄 Obteniendo lista de usuarios...');
            // Usar readDatabase directamente para obtener todos los usuarios, no solo los no-admin
            const databaseData = await readDatabase();
            const allUsers = databaseData.users || [];
            console.log('Usuarios encontrados:', allUsers.length);
            
            const studentToDelete = allUsers.find(u => u.id === studentId);
            console.log('Estudiante encontrado:', studentToDelete ? 'Sí' : 'No');
            
            if (!studentToDelete) {
                console.log('❌ Error: Estudiante no encontrado');
                return NextResponse.json(
                    { success: false, error: "Estudiante no encontrado" },
                    { status: 404 }
                );
            }
            
            console.log('🔄 Eliminando estudiante de la lista...');
            // Eliminar el usuario
            const usersAfterDeletion = allUsers.filter(u => u.id !== studentId);
            console.log('Usuarios después de eliminar:', usersAfterDeletion.length);
            
            console.log('🔄 Actualizando base de datos Firebase...');
            // Actualizar la base de datos
            databaseData.users = usersAfterDeletion;
            
            console.log('🔄 Guardando cambios en Firebase...');
            await writeDatabase(databaseData);
            
            console.log('✅ Estudiante eliminado exitosamente');
            return NextResponse.json({
                success: true,
                message: "Estudiante eliminado exitosamente",
                deletedStudent: {
                    id: studentToDelete.id,
                    firstName: studentToDelete.firstName,
                    lastName: studentToDelete.lastName
                }
            });
        } else {
            console.log('❌ Error: Usuario no autorizado');
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }
    } catch (error) {
        console.error("❌ ERROR DETALLADO al eliminar estudiante:", error);
        console.error("Stack trace:", error.stack);
        console.error("Tipo de error:", typeof error);
        console.error("Mensaje de error:", error.message);
        
        return NextResponse.json(
            { 
                success: false, 
                error: "Error al eliminar estudiante",
                details: error.message,
                type: typeof error
            },
            { status: 500 }
        );
    }
}
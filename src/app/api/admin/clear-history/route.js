import { NextResponse } from "next/server";
import { clearHistoryData } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

// Limpiar historial de la base de datos
export async function POST(request) {
    console.log('=== INICIO LIMPIEZA DE HISTORIAL ===');
    
    try {
        const userId = verifyJwtFromRequest(request);
        console.log('Usuario autenticado:', userId);
        console.log('Admin username:', process.env.ADMIN_USERNAME);
        
        if (userId !== process.env.ADMIN_USERNAME) {
            console.log('❌ Error: Usuario no autorizado');
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }
        
        console.log('✅ Usuario autorizado como admin');
        
        const { clearType, confirmation } = await request.json();
        console.log('Tipo de limpieza solicitado:', clearType);
        console.log('Confirmación recibida:', confirmation);
        
        // Verificar que se proporcione confirmación
        if (!confirmation || confirmation !== 'CONFIRMAR_LIMPIEZA') {
            console.log('❌ Error: Confirmación requerida');
            return NextResponse.json({
                success: false,
                error: "Se requiere confirmación explícita para limpiar el historial"
            }, { status: 400 });
        }
        
        // Validar tipo de limpieza
        const validTypes = ['all', 'assignHistory', 'auditLogs', 'announcements', 'exchangeRequests', 'registrationRequests'];
        if (!validTypes.includes(clearType)) {
            console.log('❌ Error: Tipo de limpieza no válido');
            return NextResponse.json({
                success: false,
                error: "Tipo de limpieza no válido. Tipos válidos: " + validTypes.join(', ')
            }, { status: 400 });
        }
        
        console.log('🔄 Iniciando limpieza de historial...');
        const result = await clearHistoryData(clearType);
        console.log('✅ Limpieza completada:', result);
        
        return NextResponse.json({
            success: true,
            message: result.message,
            clearedType: result.clearedType,
            clearedCount: result.clearedCount,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error("❌ ERROR al limpiar historial:", error);
        console.error("Stack trace:", error.stack);
        console.error("Mensaje de error:", error.message);
        
        return NextResponse.json({
            success: false,
            error: "Error al limpiar historial",
            details: error.message
        }, { status: 500 });
    }
}

// Obtener información sobre el historial (para mostrar antes de limpiar)
export async function GET(request) {
    try {
        const userId = verifyJwtFromRequest(request);
        
        if (userId !== process.env.ADMIN_USERNAME) {
            return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
        }
        
        const { readDatabase } = await import('../../data-handler');
        const dbData = await readDatabase();
        
        const historyInfo = {
            assignHistory: (dbData.assignHistory || []).length,
            auditLogs: (dbData.auditLogs || []).length,
            announcements: (dbData.announcements || []).length,
            exchangeRequests: (dbData.exchangeRequests || []).length,
            registrationRequests: (dbData.registrationRequests || []).length,
            total: 0
        };
        
        historyInfo.total = Object.values(historyInfo).reduce((sum, count) => 
            typeof count === 'number' ? sum + count : sum, 0
        );
        
        return NextResponse.json({
            success: true,
            historyInfo
        });
        
    } catch (error) {
        console.error("Error getting history info:", error);
        return NextResponse.json({
            success: false,
            error: "Error al obtener información del historial"
        }, { status: 500 });
    }
}

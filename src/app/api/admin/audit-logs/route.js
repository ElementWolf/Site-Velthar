import { NextResponse } from "next/server";
import { readDatabase, writeDatabase } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

// GET: Devuelve todos los logs de auditoría
export async function GET() {
  try {
    const data = await readDatabase();
    const logs = (data.auditLogs || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  return NextResponse.json(logs);
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return NextResponse.json({ error: 'Error al obtener logs de auditoría' }, { status: 500 });
  }
}

// POST: Crea un nuevo log de auditoría
export async function POST(request) {
  const userId = verifyJwtFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  try {
  const { action, user, details = '', date = new Date().toISOString() } = await request.json();
  if (!action || !user) return NextResponse.json({ error: 'Acción y usuario requeridos' }, { status: 400 });
    
    const data = await readDatabase();
    const log = { id: `log-${Date.now()}`, action, user, details, date };
    data.auditLogs = data.auditLogs || [];
    data.auditLogs.unshift(log);
    await writeDatabase(data);
  return NextResponse.json(log);
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: 'Error al crear log de auditoría' }, { status: 500 });
  }
}

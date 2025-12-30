import { NextResponse } from "next/server";
import { readDatabase, writeDatabase } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

export async function GET() {
  try {
    const data = await readDatabase();
    return NextResponse.json(data.announcements || []);
  } catch (error) {
    console.error('Error getting announcements:', error);
    return NextResponse.json({ error: 'Error al obtener anuncios' }, { status: 500 });
  }
}

export async function POST(request) {
  const userId = verifyJwtFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  try {
    const { message, author = 'admin', date = new Date().toISOString() } = await request.json();
    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    
    const data = await readDatabase();
    const newAnnouncement = { 
      id: Date.now().toString(), // Añadir ID único
      message, 
      author, 
      date 
    };
    data.announcements = data.announcements || [];
    data.announcements.unshift(newAnnouncement);
    await writeDatabase(data);
    return NextResponse.json(newAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Error al crear anuncio' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const userId = verifyJwtFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    
    const data = await readDatabase();
    data.announcements = data.announcements || [];
    data.announcements = data.announcements.filter(a => a.id !== id);
    await writeDatabase(data);
    return NextResponse.json({ success: true, message: 'Anuncio eliminado' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Error al eliminar anuncio' }, { status: 500 });
  }
}

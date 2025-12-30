import { NextResponse } from "next/server";
import { readDatabase, writeDatabase } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

// Obtener todas las insignias
export async function GET(request) {
    const userId = verifyJwtFromRequest(request);
    if (!userId) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    try {
        const dbData = await readDatabase();
        return NextResponse.json({ success: true, badges: dbData.badges || {} });
    } catch (error) {
        console.error("Error getting badges:", error);
        return NextResponse.json(
            { success: false, error: "Error al obtener insignias" },
            { status: 500 }
        );
    }
}

// POST: { userId, badge }
export async function POST(request) {
  const userId = verifyJwtFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { userId: targetUserId, badge } = await request.json();
  if (!targetUserId || !badge) return NextResponse.json({ error: 'userId y badge requeridos' }, { status: 400 });
  const docRef = db.collection('database').doc('main');
  const doc = await docRef.get();
  const data = doc.exists ? doc.data() : { badges: {} };
  data.badges = data.badges || {};
  data.badges[targetUserId] = data.badges[targetUserId] || [];
  if (!data.badges[targetUserId].includes(badge)) {
    data.badges[targetUserId].push(badge);
    await docRef.set(data);
  }
  return NextResponse.json({ userId: targetUserId, badges: data.badges[targetUserId] });
}

// DELETE: { userId, badge }
export async function DELETE(request) {
  const userId = verifyJwtFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { userId: targetUserId, badge } = await request.json();
  if (!targetUserId || !badge) return NextResponse.json({ error: 'userId y badge requeridos' }, { status: 400 });
  const docRef = db.collection('database').doc('main');
  const doc = await docRef.get();
  const data = doc.exists ? doc.data() : { badges: {} };
  data.badges = data.badges || {};
  data.badges[targetUserId] = (data.badges[targetUserId] || []).filter(b => b !== badge);
  await docRef.set(data);
  return NextResponse.json({ userId: targetUserId, badges: data.badges[targetUserId] });
}

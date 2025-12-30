import { NextResponse } from "next/server";
import { addExchangeRequest, getPendingExchanges } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

export async function POST(req) {
    const userId = verifyJwtFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const data = await req.json();
    const { type, amount, description } = data;
    const ok = await addExchangeRequest({ userId, type, amount, description });
    if (!ok) {
        return NextResponse.json({ success: false, error: 'Saldo insuficiente para solicitar el canje' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
}

export async function GET(req) {
    const userId = verifyJwtFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const exchanges = await getPendingExchanges(userId);
    return NextResponse.json({ success: true, exchanges });
}

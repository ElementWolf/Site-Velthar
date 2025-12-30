import { NextResponse } from "next/server";
import { getExchangeRate, setExchangeRate } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

export async function GET(req) {
    // Cualquier usuario autenticado puede consultar la tasa
    return NextResponse.json({ rate: await getExchangeRate() });
}

export async function POST(req) {
    const userId = verifyJwtFromRequest(req);
    if (userId !== process.env.ADMIN_USERNAME) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const { rate } = await req.json();
    if (!rate || isNaN(rate) || Number(rate) <= 0) {
        return NextResponse.json({ success: false, error: 'Tasa inválida' }, { status: 400 });
    }
    await setExchangeRate(rate);
    return NextResponse.json({ success: true, rate: Number(rate) });
}

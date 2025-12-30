import { NextResponse } from "next/server";
import { getAllExchangeRequests, updateExchangeStatus } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

export async function GET(req) {
    const userId = verifyJwtFromRequest(req);
    if (userId === process.env.ADMIN_USERNAME) {
        const exchanges = await getAllExchangeRequests();
        return NextResponse.json({ success: true, exchanges });
    }
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}

export async function POST(req) {
    const userId = verifyJwtFromRequest(req);
    if (userId !== process.env.ADMIN_USERNAME) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }
    const { id, status } = await req.json();
    const updated = await updateExchangeStatus(id, status);
    return NextResponse.json({ success: !!updated, updated });
}

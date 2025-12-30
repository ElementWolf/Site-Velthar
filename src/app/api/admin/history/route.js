import { NextResponse } from "next/server";
import { getAllHistory } from "../../data-handler";
import { verifyJwtFromRequest } from "../../auth/utils";

export async function GET(req) {
    const userId = verifyJwtFromRequest(req);
    if (userId === process.env.ADMIN_USERNAME) {
        const history = await getAllHistory();
        return NextResponse.json(
            { success: true, history: history },
            { status: 200 }
        );
    }
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}
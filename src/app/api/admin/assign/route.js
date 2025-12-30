import { NextResponse } from "next/server";
import { verifyJwtFromRequest } from "../../auth/utils";
import { AssignPoints } from "../../data-handler";

export async function POST(req) {
    const userId = verifyJwtFromRequest(req);
    if (userId === process.env.ADMIN_USERNAME) {
        const data = await req.json();
        if (!data.id || !data.amount) {
            return NextResponse.json(
                { success: false },
                { status: 400 }
            );
        }
        await AssignPoints(data.id, data.amount, data.observation);
        return NextResponse.json(
            { success: true, message: "Se han asignado los puntos exitosamente." },
            { status: 200 }
        );
    }
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
}
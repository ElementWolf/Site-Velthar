import { NextResponse } from "next/server";
import { verifyJwtFromRequest } from "../../auth/utils"
import { FindUserById } from "../../data-handler"
import { readDatabase } from '../../data-handler';

// Función auxiliar para calcular puntos comprometidos
function getCommittedPoints(userId, auctions) {
    let committed = 0;
    auctions.forEach(auction => {
        if (auction.status === 'Activa') {
            const userBids = (auction.bids || []).filter(bid => bid.userId === userId);
            if (userBids.length > 0) {
                // Solo contar la oferta más alta del usuario en esta subasta
                const highestBid = Math.max(...userBids.map(bid => bid.amount));
                committed += highestBid;
            }
        }
    });
    return committed;
}

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ success: false, message: 'ID de usuario requerido' }, { status: 400 });
        }
        
        const data = await readDatabase();
        const user = (data.users || []).find(u => String(u.id).trim() === String(userId).trim());

        if (!user) {
            return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
        }
        
        const totalPoints = user.points || 0;
        const committedPoints = getCommittedPoints(userId, data.auctions || []);
        const availablePoints = totalPoints - committedPoints;

        return NextResponse.json({
            success: true,
            points: totalPoints,
            committedPoints: committedPoints,
            availablePoints: availablePoints
        });
    } catch (error) {
        console.error('Error getting user points:', error);
        return NextResponse.json({ success: false, message: 'Error al obtener puntos del usuario' }, { status: 500 });
    }
}
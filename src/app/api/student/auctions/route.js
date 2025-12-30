import { NextResponse } from 'next/server';
import { readDatabase, placeAuctionBid } from '../../data-handler';

export async function GET() {
  try {
    const data = await readDatabase();
    const now = new Date();
    const active = (data.auctions || []).filter(a => a.status === 'Activa' && new Date(a.endDate) > now);
    return NextResponse.json({ auctions: active });
  } catch (error) {
    console.error('Error getting active auctions:', error);
    return NextResponse.json({ success: false, message: 'Error al obtener subastas activas' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { auctionId, userId, firstName, lastName, amount } = body;
    if (!auctionId || !userId || !amount) {
      return NextResponse.json({ success: false, message: 'Faltan campos obligatorios.' }, { status: 400 });
    }
    
    const result = await placeAuctionBid(auctionId, userId, firstName, lastName, amount);
    
    if (result.success) {
      return NextResponse.json({ success: true, auction: result.auction });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json({ success: false, message: 'Error al realizar oferta' }, { status: 500 });
  }
} 
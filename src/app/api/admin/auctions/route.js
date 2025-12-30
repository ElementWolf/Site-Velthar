import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, finalizeAuction } from '../../data-handler';

function isValidDate(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
}

export async function GET() {
  try {
    const data = await readDatabase();
    // Limpiar subastas corruptas
    data.auctions = (data.auctions || []).filter(a => a && a.id && a.title && isValidDate(a.startDate) && isValidDate(a.endDate));
    return NextResponse.json({ auctions: data.auctions });
  } catch (error) {
    console.error('Error getting auctions:', error);
    return NextResponse.json({ success: false, message: 'Error al obtener subastas' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, basePrice, startDate, endDate, createdBy } = body;
    // Validaciones estrictas
    if (!title || !basePrice || !startDate || !endDate) {
      return NextResponse.json({ success: false, message: 'Faltan campos obligatorios.' }, { status: 400 });
    }
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return NextResponse.json({ success: false, message: 'Fechas inválidas.' }, { status: 400 });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json({ success: false, message: 'La fecha de finalización debe ser posterior a la de inicio.' }, { status: 400 });
    }
    if (isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      return NextResponse.json({ success: false, message: 'El precio base debe ser un número mayor a 0.' }, { status: 400 });
    }
    const data = await readDatabase();
    const newAuction = {
      id: `auction-${Date.now()}`,
      title: String(title),
      description: String(description || ''),
      status: 'Activa',
      basePrice: Number(basePrice),
      highestBid: Number(basePrice),
      bids: [],
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      createdBy: createdBy || 'admin'
    };
    data.auctions = data.auctions || [];
    data.auctions.push(newAuction);
    await writeDatabase(data);
    console.log('[AUCTION] Subasta creada:', newAuction);
    return NextResponse.json({ success: true, auction: newAuction });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json({ success: false, message: 'Error al crear subasta', error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'ID y nuevo estado requeridos.' }, { status: 400 });
    }
    
    let auction;
    if (status === 'Finalizada') {
      auction = await finalizeAuction(id);
    } else {
    const data = await readDatabase();
      auction = data.auctions?.find(a => a.id === id);
      if (auction) {
        auction.status = status;
        await writeDatabase(data);
      }
    }
    
    if (!auction) {
      return NextResponse.json({ success: false, message: 'Subasta no encontrada.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, auction });
  } catch (error) {
    console.error('Error updating auction:', error);
    return NextResponse.json({ success: false, message: 'Error al actualizar subasta' }, { status: 500 });
  }
} 
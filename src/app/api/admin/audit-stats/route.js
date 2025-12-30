import { NextResponse } from "next/server";
import { getAllUsers, getAllHistory, getExchangeRate } from "../../data-handler";

export async function GET() {
  try {
    const users = await getAllUsers();
    const history = await getAllHistory();
    let totalAssignments = 0, totalExchanges = 0, totalBills = 0, totalPoints = 0;
    const studentStats = {};

    users.forEach(u => {
      studentStats[u.id] = {
        ...u,
        points: 0,
        academicPoints: 0,
        exchanges: 0,
      };
    });

    history.forEach(h => {
      // Verificar que el usuario existe en studentStats antes de procesar
      if (!studentStats[h.userId]) {
        console.warn(`Usuario no encontrado en estadísticas: ${h.userId}`);
        return; // Saltar este registro
      }

      if (h.type === 'Asignación') {
        totalAssignments++;
        studentStats[h.userId].points += Number(h.amount) || 0;
      } else if (h.type === 'Canje' && h.status === 'Aprobado') {
        totalExchanges++;
        studentStats[h.userId].exchanges++;
        if (h.points) {
          studentStats[h.userId].academicPoints += Number(h.points) || 0;
          totalPoints += Number(h.points) || 0;
        }
      }
      totalBills += Math.abs(Number(h.amount) || 0);
    });

    // Generar ranking ordenado por saldo (points)
    const ranking = Object.values(studentStats)
      .filter(s => typeof s.points === 'number')
      .sort((a, b) => b.points - a.points)
      .map(s => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        points: s.points,
        academicPoints: s.academicPoints,
        exchanges: s.exchanges
      }));

    return NextResponse.json({
      success: true,
      users,
      history,
      totalAssignments,
      totalExchanges,
      totalBills,
      totalPoints,
      studentStats,
      ranking
    });
  } catch (error) {
    console.error('Error en audit-stats:', error);
    return NextResponse.json({ success: false, message: "Error al obtener estadísticas." }, { status: 500 });
  }
}

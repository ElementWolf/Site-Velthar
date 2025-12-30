import { assignTopStudentBadge } from '../../data-handler';

// Endpoint para ser llamado por un cron job externo (ej: cada mes)
export async function POST() {
  assignTopStudentBadge();
  return Response.json({ success: true, message: 'Insignia Top del Mes asignada automáticamente.' });
}

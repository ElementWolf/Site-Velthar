import { assignTopStudentBadge } from '../../data-handler';

export async function POST() {
  assignTopStudentBadge();
  return Response.json({ success: true, message: 'Insignia Top del Mes asignada automáticamente.' });
}

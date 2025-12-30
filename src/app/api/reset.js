const resetDatabase = require('../resetDatabase.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido. Usa POST.' });
  }

  try {
    const result = await resetDatabase();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al ejecutar el script.', error: error.message });
  }
}

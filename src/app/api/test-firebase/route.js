import { getFirebaseDB } from '../firebase.js';

export async function GET() {
  console.log('=== PRUEBA ESPECÍFICA DE FIREBASE ===');
  
  try {
    console.log('🔄 Intentando inicializar Firebase...');
    const db = getFirebaseDB();
    
    if (!db) {
      console.error('❌ getFirebaseDB() devolvió null');
      return Response.json({
        success: false,
        error: 'Firebase devolvió null',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log('✅ Firebase inicializado correctamente');
    console.log('Tipo de db:', typeof db);
    
    // Probar una consulta simple
    console.log('🔄 Probando consulta a Firestore...');
    const testQuery = await db.collection('test').limit(1).get();
    console.log('✅ Consulta exitosa a Firestore');
    console.log('Número de documentos:', testQuery.size);
    
    return Response.json({
      success: true,
      message: 'Firebase funcionando correctamente',
      dbType: typeof db,
      documentsCount: testQuery.size,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en prueba de Firebase:', error);
    console.error('Stack trace:', error.stack);
    
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
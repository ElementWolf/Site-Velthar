"// test-firebase-prod.js" 

import { getFirebaseDB } from './src/app/api/firebase.js';

console.log('=== PRUEBA DE CONEXIÓN A FIREBASE ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FIREBASE_SERVICE_ACCOUNT_JSON definida:', !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
console.log('FIREBASE_SERVICE_ACCOUNT definida:', !!process.env.FIREBASE_SERVICE_ACCOUNT);

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT) {
  const varName = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? 'FIREBASE_SERVICE_ACCOUNT_JSON' : 'FIREBASE_SERVICE_ACCOUNT';
  const value = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
  console.log(`Longitud de ${varName}:`, value.length);
  console.log('Primeros 100 caracteres:', value.substring(0, 100));
}

try {
  console.log('\n--- Inicializando Firebase ---');
  const db = getFirebaseDB();
  
  if (!db) {
    console.error('❌ Error: getFirebaseDB() devolvió null');
    process.exit(1);
  }
  
  console.log('✅ Firebase inicializado correctamente');
  console.log('Tipo de db:', typeof db);
  
  // Probar una consulta simple
  console.log('\n--- Probando consulta a Firestore ---');
  const testQuery = await db.collection('test').limit(1).get();
  console.log('✅ Consulta exitosa a Firestore');
  console.log('Número de documentos:', testQuery.size);
  
  console.log('\n🎉 ¡Todas las pruebas pasaron! Firebase está funcionando correctamente.');
  
} catch (error) {
  console.error('\n❌ Error durante la prueba:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} 
 
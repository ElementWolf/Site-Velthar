import admin from 'firebase-admin';
import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let db = null;

function initializeFirebase() {
  if (db) {
    return db;
  }

  // DIAGNÓSTICO: Verificar todas las variables de entorno
  console.log('=== DIAGNÓSTICO DE VARIABLES DE ENTORNO ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('FIREBASE_SERVICE_ACCOUNT_JSON definida:', !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  console.log('FIREBASE_SERVICE_ACCOUNT definida:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('ADMIN_USERNAME definida:', !!process.env.ADMIN_USERNAME);
  console.log('JWT_SECRET definida:', !!process.env.JWT_SECRET);
  
  // Listar todas las variables de entorno disponibles
  console.log('Todas las variables de entorno:', Object.keys(process.env).filter(key => 
    key.includes('FIREBASE') || key.includes('ADMIN') || key.includes('JWT')
  ));

  try {
    let serviceAccount;

    if (process.env.NODE_ENV === 'production') {
      // En producción, usar SOLO variable de entorno
      console.log('Modo producción: usando variable de entorno');
      let serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      
      if (!serviceAccountString) {
        console.log('FIREBASE_SERVICE_ACCOUNT_JSON no encontrada, intentando FIREBASE_SERVICE_ACCOUNT');
        serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
      }
      
      if (!serviceAccountString) {
        console.error('❌ Ninguna variable de Firebase encontrada en producción');
        throw new Error('Variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT no configurada en Vercel.');
      }
      
      console.log('✅ Variable de Firebase encontrada en producción');
      serviceAccount = JSON.parse(serviceAccountString);
    } else {
      // En desarrollo, usar archivo local
      console.log('Modo desarrollo: usando archivo JSON local');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const jsonPath = join(__dirname, 'firebase-service-account.json');
      
      if (!existsSync(jsonPath)) {
        throw new Error('Archivo firebase-service-account.json no encontrado en desarrollo.');
      }
      
      const require = createRequire(import.meta.url);
      serviceAccount = require('./firebase-service-account.json');
    }
      
      // MEJORADO: Procesamiento más robusto de la clave privada
      if (serviceAccount.private_key) {
        console.log('🔄 Procesando clave privada...');
        console.log('Longitud original de private_key:', serviceAccount.private_key.length);
        console.log('Primeros 100 caracteres de private_key:', serviceAccount.private_key.substring(0, 100));
        
        // Limpiar la clave privada de diferentes formatos
        let cleanedKey = serviceAccount.private_key;
        
        // Reemplazar diferentes formatos de saltos de línea
        cleanedKey = cleanedKey.replace(/\\n/g, '\n');
        cleanedKey = cleanedKey.replace(/\\r\\n/g, '\n');
        cleanedKey = cleanedKey.replace(/\\r/g, '\n');
        
        // Asegurar que la clave tenga el formato correcto
        if (!cleanedKey.includes('-----BEGIN PRIVATE KEY-----')) {
          console.error('❌ La clave privada no tiene el formato PEM correcto');
          throw new Error('La clave privada no tiene el formato PEM correcto');
        }
        
        if (!cleanedKey.includes('-----END PRIVATE KEY-----')) {
          console.error('❌ La clave privada no tiene el formato PEM correcto');
          throw new Error('La clave privada no tiene el formato PEM correcto');
        }
        
        serviceAccount.private_key = cleanedKey;
        console.log('✅ Clave privada procesada correctamente');
        console.log('Longitud final de private_key:', serviceAccount.private_key.length);
      } else {
        console.error('❌ No se encontró private_key en el service account');
        throw new Error('No se encontró private_key en el service account');
      }
      
      // Verificar que tenemos los campos necesarios
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.error('❌ Campos faltantes en serviceAccount:', {
          hasProjectId: !!serviceAccount.project_id,
          hasPrivateKey: !!serviceAccount.private_key,
          hasClientEmail: !!serviceAccount.client_email
        });
        throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON no contiene los campos necesarios (project_id, private_key, client_email).');
      }
      
      console.log('✅ Todos los campos necesarios están presentes');
    }

    // Verificar si ya hay una app inicializada
    if (admin.apps.length === 0) {
      console.log('🔄 Inicializando Firebase Admin SDK...');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK inicializado');
    } else {
      console.log('ℹ️ Firebase Admin SDK ya estaba inicializado');
    }

    db = admin.firestore();
    console.log("🎉 Firebase inicializado y conexión a Firestore establecida.");
    return db;
  } catch (error) {
    console.error("❌ Error detallado al inicializar Firebase:", error);
    console.error("Stack trace:", error.stack);
    // Forzar un error más visible en los logs de Vercel
    throw new Error(`FIREBASE_ERROR: ${error.message}`);
  }
}

// Función para obtener la conexión de Firebase de forma segura
function getFirebaseDB() {
  if (!db) {
    db = initializeFirebase();
  }
  return db;
}

// Exportar solo la función para forzar la inicialización
export { getFirebaseDB }; 
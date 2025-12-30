"// resetDatabase.js" 

import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./src/app/api/firebase-service-account.json');

// Nuevas opciones CLI
const args = process.argv.slice(2);
const keepAdmin = args.includes('--keep-admin') || !args.includes('--drop-admin');
const adminIdArg = args.find(a => a.startsWith('--admin-id='));
const adminId = (adminIdArg ? adminIdArg.split('=')[1] : null) || process.env.ADMIN_USERNAME || 'admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function resetDatabase() {
  console.log('=== REINICIANDO BASE DE DATOS ===\n');
  console.log('Opciones:', { keepAdmin, adminId });
  
  const docRef = db.collection('database').doc('main');
  const doc = await docRef.get();
  let adminUser = null;
  
  if (keepAdmin && doc.exists) {
    const data = doc.data();
    // Busca el usuario admin
    adminUser = (data.users || []).find(u => 
      u.id === adminId || 
      u.firstName === 'Prof.' || 
      u.firstName === 'Admin'
    );
  }
  
  // Si no hay admin (o se indicó no conservar), crea uno por defecto
  if (!adminUser) {
    adminUser = {
      id: adminId,
      firstName: 'Prof.',
      lastName: 'Merlyn',
      points: 0,
      status: 'Activo',
      registrationDate: new Date().toISOString()
    };
  }
  
  // Estructura completa de la base de datos con todas las nuevas variables
  const newData = {
    // Usuarios y autenticación
    users: [adminUser],
    registrationRequests: [],
    
    // Historial y transacciones
    assignHistory: [],
    exchangeRequests: [],
    
    // Sistema de canjes (sin canjes predefinidos)
    customExchanges: [],
    exchangeRate: 100, // Tasa de cambio MB a puntos académicos
    
    // Sistema de subastas
    auctions: [],
    
    // Sistema de insignias y logros
    badges: {},
    
    // Sistema de anuncios
    announcements: [
      {
        id: 'welcome',
        message: '¡Bienvenido al sistema Merlyn Bills!',
        author: 'admin',
        date: new Date().toISOString()
      }
    ],
    
    // Logs de auditoría
    auditLogs: [
      {
        id: 'initial-setup',
        action: 'Sistema inicializado',
        user: 'admin',
        details: 'Base de datos reiniciada',
        date: new Date().toISOString()
      }
    ],
    
    // Configuraciones del sistema
    systemConfig: {
      version: '2.0.0',
      lastReset: new Date().toISOString(),
      maintenanceMode: false,
      registrationEnabled: true,
      exchangeEnabled: true,
      auctionEnabled: true
    },
    
    // Estadísticas del sistema
    stats: {
      totalUsers: 1,
      totalTransactions: 0,
      totalExchanges: 0,
      totalAuctions: 0,
      systemUptime: new Date().toISOString()
    }
  };
  
  await docRef.set(newData);
  
  console.log('✅ Base de datos reiniciada exitosamente');
  console.log('\n📋 Estructura creada:');
  console.log('   - Usuarios: 1 (admin)');
  console.log('   - Historial de transacciones: 0');
  console.log('   - Solicitudes de canje: 0');
  console.log('   - Canjes personalizados: 0');
  console.log('   - Subastas: 0');
  console.log('   - Solicitudes de registro: 0');
  console.log('   - Anuncios: 1');
  console.log('   - Logs de auditoría: 1');
  console.log('   - Tasa de cambio: 100 MB = 1 punto académico');
  console.log('\n⚠️ IMPORTANTE: Todos los datos han sido eliminados');
  console.log('⚠️ Solo queda el usuario administrador');
  console.log('\n✅ Reinicio completado');
}

resetDatabase().then(() => process.exit()); 

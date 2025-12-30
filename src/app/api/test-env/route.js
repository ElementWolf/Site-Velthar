export async function GET() {
  console.log('=== PRUEBA DE VARIABLES DE ENTORNO ===');
  
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? 'DEFINIDA' : 'NO DEFINIDA',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'DEFINIDA' : 'NO DEFINIDA',
    JWT_SECRET: process.env.JWT_SECRET ? 'DEFINIDA' : 'NO DEFINIDA',
    VERCEL: process.env.VERCEL ? 'DEFINIDA' : 'NO DEFINIDA',
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_REGION: process.env.VERCEL_REGION
  };
  
  console.log('Variables de entorno:', envVars);
  
  // Listar todas las variables que contengan FIREBASE, ADMIN, o JWT
  const relevantVars = Object.keys(process.env).filter(key => 
    key.includes('FIREBASE') || key.includes('ADMIN') || key.includes('JWT')
  );
  
  console.log('Variables relevantes encontradas:', relevantVars);
  
  return Response.json({
    success: true,
    message: 'Prueba de variables de entorno',
    envVars,
    relevantVars,
    timestamp: new Date().toISOString()
  });
} 
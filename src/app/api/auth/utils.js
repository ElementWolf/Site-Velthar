import jwt from 'jsonwebtoken';

export function verifyJwtFromRequest(request) {
    console.log('=== VERIFICACIÓN JWT ===');
    
    const authHeader = request.headers.get("authorization");
    console.log('Authorization header presente:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log('❌ Error: Authorization header inválido o faltante');
        return null;
    }

    const token = authHeader.split(" ")[1];
    console.log('Token extraído:', token ? 'Sí' : 'No');
    console.log('JWT_SECRET configurado:', !!process.env.JWT_SECRET);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verificado exitosamente, userId:', decoded.userId);
        return decoded.userId;
    } catch (error) {
        console.log('❌ Error al verificar token:', error.message);
        return null;
    }
}

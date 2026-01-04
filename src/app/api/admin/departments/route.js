import { NextResponse } from "next/server";
import { getFirebaseDB } from "../../../firebase"; // Ajuste según tu estructura

export async function GET() {
    try {
        const db = getFirebaseDB();
        
        // Buscamos en la colección 'departments'
        const snapshot = await db.collection('departments').get();
        
        // Caso A: Si la base de datos está vacía (0 roles establecidos)
        if (snapshot.empty) {
            console.log("Base de datos vacía. Devolviendo 'Científico' por defecto.");
            return NextResponse.json(['Científico'], { status: 200 });
        }

        // Caso B: Si ya hay datos, los extraemos
        const departments = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Usamos el campo 'name' del documento, o el ID del documento si no tiene campo name
            departments.push(data.name || doc.id);
        });

        // Aseguramos que 'Científico' siempre esté presente aunque no esté en la DB
        if (!departments.includes('Científico')) {
            departments.unshift('Científico');
        }

        return NextResponse.json(departments, { status: 200 });
    } catch (error) {
        console.error("Error al detectar departamentos:", error);
        // Si falla la conexión, devolvemos al menos el garantizado
        return NextResponse.json(['Científico'], { status: 200 });
    }
}
import { NextResponse } from "next/server";
import { getFirebaseDB } from "@/lib/database/firebase";

export async function GET() {
    try {
        const db = getFirebaseDB();
        
        // 1. Apuntamos a tu colección real: 'categories'
        const snapshot = await db.collection('categories').get();
        
        // 2. Definimos nuestra lista inicial con el valor garantizado
        let departments = ['Científico'];

        // 3. Si hay datos en la colección, los extraemos
        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                const data = doc.data();
                // Usamos el campo 'name' de tu estructura (ej: "SCP Objects", "Personnel")
                if (data.name) {
                    departments.push(data.name);
                }
            });
        }

        // 4. Limpiamos duplicados (por si acaso "Científico" ya existe en la DB)
        // y ordenamos alfabéticamente para que se vea profesional
        const uniqueDepartments = [...new Set(departments)].sort();

        return NextResponse.json(uniqueDepartments, { status: 200 });
    } catch (error) {
        console.error("Error al detectar categorías de Firebase:", error);
        // Fallback de seguridad: siempre devolvemos Científico si algo falla
        return NextResponse.json(['Científico'], { status: 200 });
    }
}
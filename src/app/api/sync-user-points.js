// Este script solo debe usarse en local. Elimínalo o desactívalo para producción en Vercel.

// import fs from "fs";
// import path from "path";

// const DATA_PATH = path.resolve(process.cwd(), "src/app/api/data.json");

// function syncUserPoints() {
//   const db = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
//   const users = db.users || [];
//   const history = db.assignHistory || [];
//   const pointsByUser = {};

//   users.forEach(u => {
//     pointsByUser[u.id] = 0;
//   });

//   history.forEach(h => {
//     if (pointsByUser[h.userId] !== undefined) {
//       pointsByUser[h.userId] += Number(h.amount);
//     }
//   });

//   let changed = false;
//   users.forEach(u => {
//     const realPoints = Number(pointsByUser[u.id]?.toFixed(2) || 0);
//     if (u.points !== realPoints) {
//       u.points = realPoints;
//       changed = true;
//     }
//   });

//   if (changed) {
//     fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2), "utf-8");
//     console.log("Saldos sincronizados correctamente.");
//   } else {
//     console.log("No hay diferencias, los saldos ya están sincronizados.");
//   }
// }

// syncUserPoints();

import { readDatabase, writeDatabase } from './data-handler';

export async function syncUserPoints() {
    const dbData = await readDatabase();
    const users = dbData.users || [];
    const history = dbData.assignHistory || [];
    const pointsByUser = {};
    users.forEach(u => {
        pointsByUser[u.id] = 0;
    });
    history.forEach(h => {
        if (pointsByUser[h.userId] !== undefined) {
            pointsByUser[h.userId] += Number(h.amount);
        }
    });
    users.forEach(u => {
        u.points = Number(pointsByUser[u.id]?.toFixed(2) || 0);
    });
    await writeDatabase(dbData);
}

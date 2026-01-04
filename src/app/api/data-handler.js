// ARCHIVO PUENTE - REDIRECCIÓN DE SEGURIDAD O5
// Este archivo redirige las peticiones antiguas al nuevo núcleo en src/lib/database

export * from "@/lib/database/data-handler";

import * as DataHandler from "@/lib/database/data-handler";
export default DataHandler;
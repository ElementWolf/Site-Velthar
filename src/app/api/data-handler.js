// 🛡️ PROTOCOLO DE REDIRECCIÓN SCP-DB
// Este archivo actúa como un túnel para que los módulos antiguos 
// encuentren las funciones en el nuevo núcleo /src/lib/database/

import * as NewCore from "@/lib/database/data-handler";

// Exportamos las funciones básicas que tus archivos están buscando
export const readDatabase = NewCore.readDatabase;
export const writeDatabase = NewCore.writeDatabase;
export const FindUserById = NewCore.FindUserById;
export const getAllUsers = NewCore.getAllUsers;
export const addRegistrationRequest = NewCore.addRegistrationRequest;
export const getAllRegistrationRequests = NewCore.getAllRegistrationRequests;
export const AddAuditLog = NewCore.AddAuditLog;

// Por si algún archivo importa todo el objeto por defecto
export default NewCore;
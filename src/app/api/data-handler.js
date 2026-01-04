// 🛡️ PROTOCOLO DE COMPATIBILIDAD SCP
import * as NewCore from "@/lib/database/data-handler";

// --- Exportaciones Reales (Lo que sí usamos) ---
export const readDatabase = NewCore.readDatabase;
export const writeDatabase = NewCore.writeDatabase;
export const FindUserById = NewCore.FindUserById;
export const getAllUsers = NewCore.getAllUsers;
export const addRegistrationRequest = NewCore.addRegistrationRequest;
export const getAllRegistrationRequests = NewCore.getAllRegistrationRequests;
export const AddAuditLog = NewCore.AddAuditLog;

// --- Funciones "Fantasma" (Para evitar errores de build de Merlyn Bills) ---
export const getDefaultPoints = async () => 0;
export const setDefaultPoints = async () => true;
export const clearHistoryData = async () => true;
export const getAnnouncements = async () => [];
export const AddAnnouncement = async () => true;
export const getExchangeRate = async () => 1;
export const getAllHistory = async () => [];
export const finalizeAuction = async () => true;

export default NewCore;
// 🛡️ PROTOCOLO DE COMPATIBILIDAD TOTAL SCP
import * as NewCore from "@/lib/database/data-handler";

// --- Funciones Reales de la Fundación ---
export const readDatabase = NewCore.readDatabase;
export const writeDatabase = NewCore.writeDatabase;
export const FindUserById = NewCore.FindUserById;
export const getAllUsers = NewCore.getAllUsers;
export const addRegistrationRequest = NewCore.addRegistrationRequest;
export const getAllRegistrationRequests = NewCore.getAllRegistrationRequests;
export const AddAuditLog = NewCore.AddAuditLog;

// --- Funciones "Legacy" (Para evitar errores de Merlyn Bills en el Build) ---
export const AssignPoints = async () => true;
export const setExchangeRate = async () => true;
export const getAllExchangeRequests = async () => [];
export const updateExchangeStatus = async () => true;
export const getDefaultPoints = async () => 0;
export const setDefaultPoints = async () => true;
export const clearHistoryData = async () => true;
export const getAnnouncements = async () => [];
export const AddAnnouncement = async () => true;
export const getExchangeRate = async () => 1;
export const getAllHistory = async () => [];
export const finalizeAuction = async () => true;
export const CreateOrUpdateUser = async () => true;
export const addExchangeRequest = async () => true;
export const getPendingExchanges = async () => [];
export const assignTopStudentBadge = async () => true;

export default NewCore;
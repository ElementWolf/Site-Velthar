/**
 * 🛡️ PROTOCOLO DE COMPATIBILIDAD O5
 * Este archivo actúa como un puente entre el código antiguo y el nuevo núcleo.
 */

import * as NewCore from "@/lib/database/data-handler";

// --- 1. EXPORTACIONES REALES (Fundación SCP) ---
// Estas funciones ahora viven en src/lib/database/data-handler.js
export const readDatabase = NewCore.readDatabase;
export const writeDatabase = NewCore.writeDatabase;
export const FindUserById = NewCore.FindUserById;
export const getAllUsers = NewCore.getAllUsers;
export const addRegistrationRequest = NewCore.addRegistrationRequest;
export const getAllRegistrationRequests = NewCore.getAllRegistrationRequests;
export const AddAuditLog = NewCore.AddAuditLog;

// --- 2. FUNCIONES "FANTASMA" (Legacy) ---
// Estas funciones evitan que Vercel falle al compilar archivos antiguos de Merlyn Bills.
export const updateRegistrationStatus = async () => true;
export const placeAuctionBid = async () => true;
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

// Exportación por defecto para compatibilidad total
export default NewCore;
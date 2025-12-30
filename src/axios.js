import axios from "axios";
import { notification } from "./lib/toast";

// Determinar la URL base dinámicamente
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // En el cliente, usar la URL actual
        return window.location.origin;
    }
    // En el servidor, usar localhost
    return process.env.NODE_ENV === 'production' 
        ? '' 
        : `http://localhost:${process.env.PORT || 3000}`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000, // 15 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(
    (config) => {
        // Verificar si estamos en el cliente antes de acceder a localStorage
        if (typeof window !== 'undefined') {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            }
        }
        
        // Log para debugging solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
        console.log('Request config:', {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`
        });
        }
        
        return config;
    },
    (error) => {
        console.error('Error en request interceptor:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        const message = response.data?.message;
        if (message && typeof window !== 'undefined') {
            notification(message);
        }
        return response;
    },
    (error) => {
        // No mostrar notificación para errores de cancelación
        if (error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
            return Promise.reject(error);
        }

        let errorMessage = 'Error de conexión';
        
        // Manejar diferentes tipos de errores
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            errorMessage = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
        } else if (error.response) {
            // El servidor respondió con un código de estado de error
            errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          `Error del servidor (${error.response.status})`;
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            errorMessage = 'No se recibió respuesta del servidor.';
        } else {
            // Algo más causó el error
            errorMessage = error.message || 'Error desconocido';
        }
        
        // Solo mostrar notificación para errores no cancelados y en el cliente
        if (errorMessage && !errorMessage.includes('canceled') && typeof window !== 'undefined') {
            notification(errorMessage);
        }
        
        // Log de errores solo en desarrollo - arreglado para evitar errores de serialización
        if (process.env.NODE_ENV === 'development') {
            try {
        console.error('Error en axios interceptor:', {
            message: errorMessage,
            status: error.response?.status,
                    url: error.config?.url,
                    method: error.config?.method
        });
            } catch (logError) {
                // Si falla el log, solo mostrar el mensaje básico
                console.error('Error en axios interceptor:', errorMessage);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
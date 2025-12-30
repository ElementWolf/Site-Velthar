"use client"
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { notification } from "@/lib/toast";
import api from "@/axios";
import { useRouter } from "next/navigation";
import { routesDictionary } from "@/routesDictionary";

// Create the context
const UserAuthContext = createContext();

// Custom hook
export const useAuth = () => {
    const context = useContext(UserAuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de UserAuthProvider');
    }
    return context;
};

// Provider component
export const UserAuthProvider = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuthStatus = useCallback(async () => {
        // Verificar si estamos en el cliente
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await api.get(`/api/auth/check`);
            if (response.data.success) {
                setUser(response.data.user);
            } else {
                // Token inválido
                localStorage.removeItem("token");
                setUser(null);
            }
        } catch (err) {
            console.error('Error checking auth status:', err);
            setError('Error al verificar autenticación');
            // Limpiar token inválido
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check login status on mount
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Log in function
    const logIn = useCallback(async (id, password) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await api.post(`/api/auth/login`, { id, password });
            const { token, user: userData } = response.data;
            
            if (token && userData) {
                localStorage.setItem("token", token);
                setUser(userData);
                
                console.log('Login exitoso, token guardado:', token);
                console.log('Datos del usuario:', userData);
                
                // Redirigir al dashboard
                router.push(routesDictionary.dashboard);
            } else {
                throw new Error('Respuesta inválida del servidor');
            }
        } catch (err) {
            console.error('Error en login:', err);
            setError(err?.response?.data?.message || 'Error al iniciar sesión');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Register function
    const register = useCallback(async (firstName, lastName, id, password) => {
        try {
            setError(null);
            setLoading(true);
            
            const response = await api.post(`/api/auth/register`, {
                id, firstName, lastName, password
            });
            
            // Mostrar mensaje de éxito
            notification(response.data.message || 'Usuario registrado exitosamente');
            
            // Redirigir al login
            router.push(routesDictionary.login);
        } catch (err) {
            console.error('Error en registro:', err);
            const errorMessage = err?.response?.data?.message || 
                               err?.response?.data?.error || 
                               err?.message || 
                               'Error al registrar usuario';
            
            setError(errorMessage);
            notification(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Log out function
    const logOut = useCallback(async () => {
        try {
            setError(null);
            // Limpiar token y usuario
            localStorage.removeItem("token");
            setUser(null);
            
            // Redirigir al inicio
            router.push(routesDictionary.index);
        } catch (err) {
            console.error('Error en logout:', err);
            setError('Error al cerrar sesión');
        }
    }, [router]);

    // Limpiar error después de un tiempo
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const value = {
        user,
        loading,
        error,
        logIn,
        register,
        logOut,
        checkAuthStatus
    };

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    );
};
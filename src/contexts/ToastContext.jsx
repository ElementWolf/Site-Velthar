"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Toast from "@/components/Toast";
import { setNotification } from "@/lib/toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ message: "", visible: false });

    const showToast = (message) => {
        setToast({ message, visible: true });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, visible: false }));
    };

    useEffect(() => {
        // Register the global trigger
        setNotification(showToast);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast.visible && (
                <Toast message={toast.message} onClose={hideToast} />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
"use client";

import { useEffect } from "react";

export default function Toast({ message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="flex justify-center fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-100 text-black px-4 py-2 rounded-lg shadow-lg animate-slide-up-fade z-50 min-w-[30vw]">
            {message}
        </div>
    );
}
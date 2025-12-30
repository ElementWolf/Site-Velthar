"use client";

import { useAuth } from "@/contexts/UserAuthContext";
import { notification } from "@/lib/toast";
import { routesDictionary } from "@/routesDictionary";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

const DynamicAuth = ({ params }) => {
    const router = useRouter();
    const { slug } = use(params);
    const [isLogin] = useState(slug === "login");
    const { logIn, register, user, loading: authLoading } = useAuth();
    const [inputValues, setInputValues] = useState({
        firstName: "",
        lastName: "",
        id: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (!authLoading && user) {
            router.push("/dashboard");
        }
    }, [user, authLoading, router]);

    // Mostrar loading mientras se verifica la autenticación
    if (authLoading) {
        return <LoadingSpinner />;
    }

    // Si ya está autenticado, mostrar loading mientras redirige
    if (user) {
        return <LoadingSpinner />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitch = () => {
        router.push(!isLogin ? routesDictionary.login : routesDictionary.register)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await logIn(inputValues.id, inputValues.password);
            } else {
                await register(inputValues.firstName, inputValues.lastName, inputValues.id, inputValues.password);
            }
        } catch (error) {
            console.error('Error en submit:', error);
            // El error ya se maneja en el contexto, no necesitamos hacer nada más aquí
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 pt-24">
            <div className="w-full max-w-lg bg-gray-900 p-8 rounded-lg shadow-lg border border-red-600 flex flex-col gap-2">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-red-500 mb-2">
                        SCP Foundation
                    </h1>
                    <p className="text-gray-400">Secure. Contain. Protect.</p>
                    <p className="text-sm text-gray-500 mt-2">Acceso Autorizado Solo</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="flex gap-3">
                            <div className="w-1/2">
                                <label className="block font-medium text-gray-300 mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={inputValues.firstName}
                                    onChange={handleChange}
                                    placeholder="Ingrese su nombre"
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block font-medium text-gray-300 mb-1">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={inputValues.lastName}
                                    onChange={handleChange}
                                    placeholder="Ingrese su apellido"
                                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block font-medium text-gray-300 mb-1">
                            ID de Usuario
                        </label>
                        <input
                            type="text"
                            name="id"
                            value={inputValues.id}
                            onChange={handleChange}
                            placeholder="Ingrese su ID"
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-300 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={inputValues.password}
                            onChange={handleChange}
                            placeholder="Ingrese su contraseña"
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition cursor-pointer flex items-center justify-center min-h-[2.75rem] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                Cargando...
                            </span>
                        ) : (
                            isLogin ? "Iniciar Sesión" : "Solicitar Registro"
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm text-gray-400">
                    {isLogin ? (
                        <>
                            ¿No tienes cuenta?{" "}
                            <button
                                onClick={handleSwitch}
                                className="text-red-400 font-medium hover:text-red-300 underline cursor-pointer"
                            >
                                Regístrate
                            </button>
                        </>
                    ) : (
                        <>
                            ¿Ya tienes cuenta?{" "}
                            <button
                                onClick={handleSwitch}
                                className="text-red-400 font-medium hover:text-red-300 underline cursor-pointer"
                            >
                                Iniciar Sesión
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-4 text-center text-xs text-gray-600">
                    <p>Acceso restringido a personal autorizado de la Fundación SCP.</p>
                    <p>Velthar Division - Site-██</p>
                </div>
            </div>
        </div>
    );
};

export default DynamicAuth;
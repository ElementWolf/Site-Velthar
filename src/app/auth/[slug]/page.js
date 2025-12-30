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
        <div className="login-bg grow flex items-center justify-center px-4" style={{background: 'linear-gradient(90deg, #3465B4 0%, #C62B34 100%)'}}>
            <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-lg flex flex-col gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-1">
                        Merlyn Bills
                    </h1>
                    <p className="text-md text-center text-gray-600 mb-5">
                        Sistema de gestión de incentivos académicos
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="flex gap-3">
                            <div className="w-1/2">
                                <label className="block font-medium text-gray-700 mb-1">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={inputValues.firstName}
                                    onChange={handleChange}
                                    placeholder="Ingrese su nombre"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block font-medium text-gray-700 mb-1">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={inputValues.lastName}
                                    onChange={handleChange}
                                    placeholder="Ingrese su apellido"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Cédula de Identidad
                        </label>
                        <input
                            type="text"
                            name="id"
                            value={inputValues.id}
                            onChange={handleChange}
                            placeholder="Ingrese su cédula"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={inputValues.password}
                            onChange={handleChange}
                            placeholder="Ingrese su contraseña"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-[#C62B34] text-white font-semibold rounded-md hover:opacity-90 transition cursor-pointer flex items-center justify-center min-h-[2.75rem] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                Cargando...
                            </span>
                        ) : (
                            isLogin ? "Iniciar Sesión" : "Registrarse"
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm text-gray-600">
                    {isLogin ? (
                        <>
                            ¿No tienes una cuenta?{" "}
                            <button
                                onClick={handleSwitch}
                                className="text-blue-600 font-medium hover:underline cursor-pointer"
                            >
                                Regístrate
                            </button>
                        </>
                    ) : (
                        <>
                            ¿Ya tienes una cuenta?{" "}
                            <button
                                onClick={handleSwitch}
                                className="text-blue-600 font-medium hover:underline cursor-pointer"
                            >
                                Iniciar Sesión
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DynamicAuth;
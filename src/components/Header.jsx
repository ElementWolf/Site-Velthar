"use client"

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/UserAuthContext';
import { routesDictionary } from '@/routesDictionary';
import Image from 'next/image';
import { useRouter } from 'next/navigation'

const Header = () => {
    const router = useRouter()
    const { user, logOut } = useAuth();
    const [show, setShow] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const lastScroll = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            if (current > lastScroll.current && current > 60) {
                setShow(false);
            } else {
                setShow(true);
            }
            lastScroll.current = current;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Búsqueda:', searchQuery);
    };

    return (
        <header className={`bg-gray-900 border-b-2 border-black w-full z-30 fixed top-0 left-0 transition-transform duration-300 ${show ? 'translate-y-0' : '-translate-y-full'}`} style={{willChange:'transform'}}>
            {/* Top Bar - Tamaño Original */}
            <div className="border-b border-gray-700">
                <div className="container mx-auto px-4 py-1 flex justify-between items-center">
                    {/* Logo and Title */}
                    <div onClick={() => router.push(routesDictionary.index)} className="cursor-pointer flex items-center space-x-3">
                        <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-black">
                            <Image src={"/logo.png"} width={40} height={40} alt='SCP Logo' className="rounded-full" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg md:text-xl leading-tight">Site-Velthar</h1>
                            <p className="text-gray-300 text-xs md:text-sm">Secure, Contain, Protect</p>
                        </div>
                    </div>

                    {/* Search and Auth */}
                    <div className="flex items-center space-x-4">
                        <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar..."
                                className="px-3 py-1 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-600"
                            />
                            <button
                                type="submit"
                                className="px-4 py-1 bg-amber-700 hover:bg-amber-600 text-white font-medium text-sm border border-black transition-colors"
                            >
                                Buscar
                            </button>
                        </form>

                        <div className="flex items-center space-x-2 text-sm">
                            {!user ? (
                                <button onClick={() => router.push(routesDictionary.login)} className="text-white hover:text-gray-300 transition-colors">
                                    Iniciar sesión
                                </button>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <span className="text-white">{user.firstName} {user.lastName}</span>
                                    <button onClick={() => logOut()} className="text-white hover:text-gray-300 transition-colors">
                                        Salir
                                    </button>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Bar - CLASSIFIED VERSION (Espaciado Original) */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="container mx-auto px-4">
                    <ul className="hidden md:flex space-x-1">
                        <li className="flex items-center space-x-4 px-4 py-3 text-red-600 font-mono text-sm font-bold uppercase tracking-widest select-none">
                            <span>Acceso Denegado:</span>
                            <span className="bg-black text-black px-2 cursor-not-allowed">█████████</span>
                            <span className="bg-black text-black px-2 cursor-not-allowed">███████████</span>
                            <span className="bg-black text-black px-2 cursor-not-allowed">████████</span>
                            <span className="text-gray-500 animate-pulse text-[10px] ml-4 font-normal">[NIVEL O5 REQUERIDO]</span>
                        </li>
                    </ul>

                    {/* Mobile Menu Clasificado */}
                    {menuOpen && (
                        <div className="md:hidden py-4 text-center">
                            <span className="text-red-600 font-bold text-xs uppercase tracking-tighter">
                                [CONTENIDO BAJO PROTOCOLO DE CENSURA]
                            </span>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
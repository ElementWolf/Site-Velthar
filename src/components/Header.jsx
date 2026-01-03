"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/UserAuthContext';
import { routesDictionary } from '@/routesDictionary';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();
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
        <header 
            className={`bg-gray-900 border-b-4 border-black w-full z-50 fixed top-0 left-0 transition-transform duration-300 ${show ? 'translate-y-0' : '-translate-y-full'}`}
        >
            <div className="border-b border-gray-700">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    
                    <div onClick={() => router.push(routesDictionary.index)} className="cursor-pointer flex items-center space-x-3 group">
                        <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center border-2 border-black shrink-0">
                            <Image src="/logo.png" width={40} height={40} alt='SCP Logo' className="rounded-full" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-base md:text-xl leading-tight">Velthar SCP</h1>
                            <p className="text-gray-300 text-[10px] md:text-sm uppercase tracking-tighter">Secure, Contain, Protect</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <form onSubmit={handleSearch} className="hidden lg:flex items-center space-x-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar archivo..."
                                className="px-3 py-1 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-500"
                            />
                            <button type="submit" className="px-4 py-1 bg-amber-700 hover:bg-amber-600 text-white font-black text-sm border border-black transition-colors uppercase">
                                Buscar
                            </button>
                        </form>

                        <div className="flex items-center space-x-2 text-xs md:text-sm font-bold">
                            {!user ? (
                                <button onClick={() => router.push(routesDictionary.login)} className="text-white hover:text-gray-400 uppercase tracking-widest">
                                    Acceder
                                </button>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <span className="text-white hidden sm:inline border-l border-gray-700 pl-3">
                                        Agente: {user.firstName}
                                    </span>
                                    <button onClick={() => logOut()} className="text-red-600 hover:text-red-500 uppercase">
                                        [ Salir ]
                                    </button>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 flex items-center justify-center bg-gray-800 border border-gray-700 text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <nav className="bg-gray-800 border-b border-gray-700 hidden md:block">
                <div className="container mx-auto px-4">
                    <ul className="flex">
                        <li><a href="#about" className="block px-5 py-2 text-white hover:bg-gray-700 text-xs font-black uppercase tracking-widest border-r border-gray-700">Acerca de</a></li>
                        <li><a href="#community" className="block px-5 py-2 text-white hover:bg-gray-700 text-xs font-black uppercase tracking-widest border-r border-gray-700">Comunidad</a></li>
                        <li><a href="#resources" className="block px-5 py-2 text-white hover:bg-gray-700 text-xs font-black uppercase tracking-widest border-r border-gray-700">Recursos</a></li>
                        <li><a href="#contact" className="block px-5 py-2 text-white hover:bg-gray-700 text-xs font-black uppercase tracking-widest">Contacto</a></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
}
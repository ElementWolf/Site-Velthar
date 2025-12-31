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
        // Implementar búsqueda
        console.log('Búsqueda:', searchQuery);
    };

    return (
        <header className={`bg-gray-900 border-b-4 border-black w-full z-30 fixed top-0 left-0 transition-transform duration-300 ${show ? 'translate-y-0' : '-translate-y-full'}`} style={{willChange:'transform'}}>
            {/* Top Bar */}
            <div className="border-b border-gray-700">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    {/* Logo and Title */}
                    <div onClick={() => router.push(routesDictionary.index)} className="cursor-pointer flex items-center space-x-3">
                        <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-black">
                            <Image src={"/logo.png"} width={40} height={40} alt='SCP Logo' className="rounded-full" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg md:text-xl leading-tight">Velthar SCP</h1>
                            <p className="text-gray-300 text-xs md:text-sm">Secure, Contain, Protect</p>
                        </div>
                    </div>

                    {/* Search and Auth */}
                    <div className="flex items-center space-x-4">
                        {/* Search Bar */}
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

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-2 text-sm">
                            {!user ? (
                                <>
                                    <button
                                        onClick={() => router.push(routesDictionary.login)}
                                        className="text-white hover:text-gray-300 transition-colors"
                                    >
                                        Iniciar sesión
                                    </button>
                                </>
                            ) : user.type === 'admin' ? (
                                <>
                                    <button
                                        onClick={() => router.push(routesDictionary.register)}
                                        className="text-white hover:text-gray-300 transition-colors"
                                    >
                                        Crear cuenta
                                    </button>
                                    <span className="text-gray-600">o</span>
                                    <button
                                        onClick={() => logOut()}
                                        className="text-white hover:text-gray-300 transition-colors"
                                    >
                                        Salir
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <span className="text-white text-sm">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <button
                                        onClick={() => logOut()}
                                        className="text-white hover:text-gray-300 transition-colors"
                                    >
                                        Salir
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Hamburger Menu */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="container mx-auto px-4">
                    <ul className="hidden md:flex space-x-1">
                        <li>
                            <a href="#about" className="block px-4 py-3 text-white hover:bg-gray-700 transition-colors font-medium">
                                Acerca de
                            </a>
                        </li>
                        <li>
                            <a href="#community" className="block px-4 py-3 text-white hover:bg-gray-700 transition-colors font-medium">
                                Comunidad
                            </a>
                        </li>
                        <li>
                            <a href="#resources" className="block px-4 py-3 text-white hover:bg-gray-700 transition-colors font-medium">
                                Recursos
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="block px-4 py-3 text-white hover:bg-gray-700 transition-colors font-medium">
                                Contacto
                            </a>
                        </li>
                    </ul>

                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div className="md:hidden py-2">
                            <a href="#about" className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors">
                                Acerca de
                            </a>
                            <a href="#community" className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors">
                                Comunidad
                            </a>
                            <a href="#resources" className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors">
                                Recursos
                            </a>
                            <a href="#contact" className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors">
                                Contacto
                            </a>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
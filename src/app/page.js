"use client"

import { useRouter } from 'next/navigation'
import { routesDictionary } from '@/routesDictionary';
import Image from 'next/image';
import { useAuth } from '@/contexts/UserAuthContext';

export default function Home() {
  const router = useRouter()
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Contenedor Principal: 
          Añadido pt-10 (en móvil) y lg:pt-16 (en escritorio) para separar el contenido del Header
      */}
      <div className="flex flex-col lg:flex-row w-full pt-10 lg:pt-16">
        
        {/* Left and Center Content */}
        <div className="flex-1 min-w-0 pb-8 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-5xl mx-auto">
            
            {/* Warning Banner: Reducido el mb (margen inferior) de 10 a 6 para compactar */}
            <div className="relative bg-black border-4 border-black mb-6 p-6 sm:p-8 md:p-10 lg:p-12 text-center shadow-lg overflow-hidden">
              {/* Background Watermark */}
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                <div className="text-[100px] sm:text-[150px] md:text-[200px] lg:text-[250px] font-bold select-none">⚛</div>
              </div>
              
              {/* Warning Text */}
              <div className="relative z-10">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold mb-3 text-white uppercase tracking-wide">
                  ADVERTENCIA: LA BASE DE DATOS DE LA FUNDACIÓN ESTÁ
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-red-600 mb-5 tracking-tighter leading-none break-words">
                  CLASIFICADA
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white uppercase tracking-wide max-w-2xl mx-auto">
                  EL PERSONAL NO AUTORIZADO SERÁ RASTREADO, LOCALIZADO Y DETENIDO
                </p>
              </div>
            </div>

            {/* Action Links */}
            <div className="space-y-3 mb-12">
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); }}
                className="block bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white font-bold py-4 px-8 text-lg border-2 border-black transition-all duration-200 flex items-center justify-between group shadow-md"
              >
                <span>Acerca de Velthar SCP</span>
                <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
              </a>
              <a
                href="#explore"
                onClick={(e) => { e.preventDefault(); }}
                className="block bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white font-bold py-4 px-8 text-lg border-2 border-black transition-all duration-200 flex items-center justify-between group shadow-md"
              >
                <span>Explorar el Universo</span>
                <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {/* Ajustado pt-10 para que el título "COMENZAR" no esté pegado al borde superior del sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 bg-gray-900 border-t-4 lg:border-t-0 lg:border-l-4 border-black p-6 sm:p-8 lg:p-10 lg:pt-16">
          <div className="space-y-10">
            {/* Get Started Section */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-5 uppercase tracking-tight">
                Comenzar
              </h2>
              <p className="text-gray-300 leading-relaxed text-base">
                Revisa nuestra{' '}
                <a href="#guide" className="text-red-600 hover:text-red-700 font-bold underline decoration-2">
                  Guía para Nuevos
                </a>
                . Para preguntas adicionales, consulta las{' '}
                <a href="#faq" className="text-red-600 hover:text-red-700 font-bold underline decoration-2">
                  Preguntas Frecuentes
                </a>
                .
              </p>
            </div>

            {/* Join the Wiki Section */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-5 uppercase tracking-tight">
                Únete a la Wiki
              </h2>
              <p className="text-gray-300 leading-relaxed text-base">
                Lee las{' '}
                <a href="#rules" className="text-red-600 hover:text-red-700 font-bold underline decoration-2">
                  Reglas del Sitio
                </a>
                {' '}y la{' '}
                <a href="#required" className="text-red-600 hover:text-red-700 font-bold underline decoration-2">
                  Lectura Requerida
                </a>
                , luego solicita{' '}
                <a href="#membership" className="text-red-600 hover:text-red-700 font-bold underline decoration-2">
                  membresía del sitio
                </a>
                .
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-5 uppercase tracking-tight">
                Enlaces Rápidos
              </h2>
              <ul className="space-y-3">
                <li>
                  <a href="#scp-list" className="text-red-600 hover:text-red-700 font-bold text-lg underline decoration-2">
                    Lista de SCPs
                  </a>
                </li>
                <li>
                  <a href="#tales" className="text-red-600 hover:text-red-700 font-bold text-lg underline decoration-2">
                    Historias
                  </a>
                </li>
                <li>
                  <a href="#goi" className="text-red-600 hover:text-red-700 font-bold text-lg underline decoration-2">
                    Grupos de Interés
                  </a>
                </li>
                <li>
                  <a href="#canons" className="text-red-600 hover:text-red-700 font-bold text-lg underline decoration-2">
                    Cánones
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
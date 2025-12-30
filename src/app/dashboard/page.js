"use client"

import { useAuth } from '@/contexts/UserAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import React from 'react'
import AdminPage from './AdminPage';
import StudentPage from './StudentPage';
import LoadingSpinner from '@/components/LoadingSpinner';

function DashboardPage() {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Asegurar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && isClient) {
      router.push('/auth/login');
    }
  }, [user, loading, router, isClient]);

  // Mostrar loading mientras se verifica la autenticación
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD]">
        <LoadingSpinner />
      </div>
    );
  }

  // Si hay error de autenticación, redirigir al login
  if (error && isClient) {
    router.push('/auth/login');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD]">
        <LoadingSpinner />
      </div>
    );
  }

  // Si no hay usuario, mostrar loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD]">
        <LoadingSpinner />
      </div>
    );
  }

  // Renderizar el dashboard correspondiente
  try {
    return (
      <>
        {user?.type === "admin" ? <AdminPage /> : <StudentPage />}
      </>
    );
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8D7DA] via-[#F3F4F6] to-[#E3EAFD]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error en el Dashboard</h2>
          <p className="text-gray-600">Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
        </div>
      </div>
    );
  }
}

export default DashboardPage
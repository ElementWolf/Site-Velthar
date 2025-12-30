import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import Badge from '../Badge';

const badgeList = [
  { key: 'punctualStudent', label: 'Estudiante Puntual', initials: 'EP' },
  { key: 'helper', label: 'Compañero Solidario', initials: 'CS' },
  { key: 'creativeProject', label: 'Proyecto Creativo', initials: 'PC' },
  { key: 'perseverance', label: 'Perseverancia', initials: 'PV' },
  { key: 'participationStar', label: 'Estrella de Participación', initials: 'EP' },
  { key: 'readingChampion', label: 'Campeón de Lectura', initials: 'CL' },
  { key: 'teamworkLeader', label: 'Líder de Equipo', initials: 'LE' },
  { key: 'ecoFriendly', label: 'Conciencia Ecológica', initials: 'CE' },
  { key: 'techGuru', label: 'Experto en Tecnología', initials: 'ET' },
  { key: 'positiveAttitude', label: 'Actitud Positiva', initials: 'AP' },
  { key: 'firstExchange', label: 'Primer Canje', initials: 'PC' },
  { key: 'fiveExchanges', label: '5 Canjes', initials: '5C' },
  { key: 'threeExchanges', label: '3 Canjes', initials: '3C' },
  { key: 'topStudent', label: 'Top del Mes', initials: 'TM' },
];

export default function StudentPublicStats() {
  const { data: stats, loading: loadingStats, error: statsError } = useApi('/api/admin/audit-stats');
  const { data: badgesByUser, loading: loadingBadges, error: badgesError } = useApi('/api/admin/badges');

  if (loadingStats || loadingBadges) return <LoadingSpinner />;
  
  if (statsError || badgesError) {
    return (
      <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
        <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Estadísticas Públicas</h2>
        <div className="text-center text-gray-500 py-8">
          {statsError && <p className="mb-2">Error al cargar estadísticas: {statsError}</p>}
          {badgesError && <p>Error al cargar insignias: {badgesError}</p>}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
        <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Estadísticas Públicas</h2>
        <div className="text-center text-gray-500 py-8">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
      <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Estadísticas Públicas</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#F8D7DA]/60 border border-[#F3F4F6] rounded-xl p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-[#C62B34] mb-2">{stats.totalBills || 0}</span>
          <span className="text-[#3465B4] font-semibold">Merlyn Bills</span>
        </div>
        <div className="bg-[#F3F4F6] border border-[#F3F4F6] rounded-xl p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-[#3465B4] mb-2">{stats.totalPoints || 0}</span>
          <span className="text-[#C62B34] font-semibold">Puntos Académicos</span>
        </div>
        <div className="bg-[#F8D7DA]/60 border border-[#F3F4F6] rounded-xl p-6 flex flex-col items-center">
          <span className="text-4xl font-bold text-[#C62B34] mb-2">{stats.totalExchanges || 0}</span>
          <span className="text-[#3465B4] font-semibold">Canjes Realizados</span>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <div>
              <h3 className="text-lg font-bold text-[#3465B4] mb-4">Insignias Obtenidas</h3>
              <div className="flex flex-wrap gap-3 max-w-full">
                {Array.isArray(stats.ranking) && stats.ranking.length > 0 && badgesByUser?.[stats.ranking[0].id]?.length > 0 ? (
                  badgesByUser[stats.ranking[0].id].map((badge) => {
                    const badgeInfo = badgeList.find(b => b.key === badge);
                    return <Badge key={badge} initials={badgeInfo?.initials || '?'} label={badgeInfo?.label || badge} />;
                  })
                ) : (
                  <span className="text-gray-500">Aún no tienes insignias ni ranking disponible.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

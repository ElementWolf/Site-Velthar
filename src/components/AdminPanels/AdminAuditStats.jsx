import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '@/axios';
import LoadingSpinner from '../LoadingSpinner';

const badgeList = [
  { key: 'firstExchange', label: 'Primer Canje', initials: 'PC', color: 'bg-yellow-200 text-yellow-800' },
  { key: 'fiveExchanges', label: '5 Canjes', initials: '5C', color: 'bg-blue-200 text-blue-800' },
  { key: 'tenExchanges', label: '10 Canjes', initials: '10C', color: 'bg-green-200 text-green-800' },
  { key: 'topStudent', label: 'Top del Mes', initials: 'TM', color: 'bg-purple-200 text-purple-800' },
];

function BadgeInitial({ badge, description }) {
  const [show, setShow] = useState(false);
  const isTouch = useMemo(() => 
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0), 
    []
  );

  const handleMouseEnter = useCallback(() => {
    if (!isTouch) setShow(true);
  }, [isTouch]);

  const handleMouseLeave = useCallback(() => {
    if (!isTouch) setShow(false);
  }, [isTouch]);

  const handleClick = useCallback(() => {
    if (isTouch) setShow(v => !v);
  }, [isTouch]);

  return (
    <span
      className={`inline-block w-8 h-8 mr-2 mb-2 rounded-full border font-bold text-xs flex items-center justify-center cursor-pointer transition-all duration-150 ${badge.color}`}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      aria-label={description}
      title={!isTouch ? description : undefined}
      style={{ position: 'relative', minWidth: '2rem', minHeight: '2rem' }}
    >
      {badge.initials}
      {show && (
        <span className="absolute z-20 left-1/2 -translate-x-1/2 top-10 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg animate-fade-in">
          {description}
        </span>
      )}
    </span>
  );
}

export default function AdminAuditStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [badgesByUser, setBadgesByUser] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    try {
      const [statsRes, badgesRes] = await Promise.all([
        api.get('/api/admin/audit-stats'),
        api.get('/api/admin/badges')
      ]);
      
      setStats(statsRes.data);
      setBadgesByUser(badgesRes.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refrescar cada 10 segundos automáticamente
  useEffect(() => {
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Memoizar datos procesados
  const processedStats = useMemo(() => {
    if (!stats) return null;
    
    return {
      totalAssignments: stats.totalAssignments ?? 0,
      totalExchanges: stats.totalExchanges ?? 0,
      totalBills: stats.totalBills ?? 0,
      ranking: stats.ranking || []
    };
  }, [stats]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
        <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Auditoría y Estadísticas</h2>
        <div className="text-center text-red-600 py-8">
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-[#C62B34] text-white px-4 py-2 rounded-lg hover:bg-[#a81e28] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!processedStats) {
    return (
      <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
        <h2 className="text-2xl font-bold text-[#C62B34] mb-6">Auditoría y Estadísticas</h2>
        <div className="text-center text-gray-500 py-8">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#F3F4F6] rounded-2xl shadow-lg p-8 animate-slide-up-fade">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#C62B34]">Auditoría y Estadísticas</h2>
        <button
          onClick={fetchStats}
          className={`ml-2 px-4 py-2 rounded-lg text-sm font-bold border border-[#3465B4] text-[#3465B4] bg-[#E3EAFD] hover:bg-[#3465B4] hover:text-white transition-all shadow active:scale-95 ${refreshing ? 'opacity-60 cursor-wait' : ''}`}
          disabled={refreshing}
          title="Recargar estadísticas"
        >
          {refreshing ? 'Actualizando...' : 'Recargar'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#F8D7DA] to-[#F3F4F6] border border-[#F3F4F6] rounded-xl p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-[#C62B34] mb-2">{processedStats.totalAssignments}</div>
          <div className="text-[#3465B4] font-semibold">Asignaciones</div>
          {processedStats.totalAssignments === 0 && (
            <div className="text-xs text-gray-400 mt-2 text-center">No hay datos suficientes como para mostrar asignaciones</div>
          )}
        </div>
        <div className="bg-gradient-to-br from-[#F3F4F6] to-[#E3EAFD] border border-[#F3F4F6] rounded-xl p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-[#3465B4] mb-2">{processedStats.totalExchanges}</div>
          <div className="text-[#C62B34] font-semibold">Canjes</div>
          {processedStats.totalExchanges === 0 && (
            <div className="text-xs text-gray-400 mt-2 text-center">No hay datos suficientes como para mostrar canjes</div>
          )}
        </div>
        <div className="bg-gradient-to-br from-[#F8D7DA] to-[#F3F4F6] border border-[#F3F4F6] rounded-xl p-6 flex flex-col items-center">
          <div className="text-4xl font-bold text-[#C62B34] mb-2">{processedStats.totalBills}</div>
          <div className="text-[#3465B4] font-semibold">Total Merlyn Bills</div>
          {processedStats.totalBills === 0 && (
            <div className="text-xs text-gray-400 mt-2 text-center">No hay datos suficientes como para mostrar Merlyn Bills asignados</div>
          )}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-[#3465B4] mb-4">Ranking de Estudiantes</h3>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        {processedStats.ranking.length === 0 ? (
          <div className="text-gray-400 text-center py-8 bg-[#F8D7DA]/30 border border-[#F3F4F6] rounded-xl">
            No hay datos suficientes como para mostrar el ranking de estudiantes
          </div>
        ) : (
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-[#F8D7DA]">
              <tr>
                <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] font-bold whitespace-nowrap">#</th>
                <th className="py-3 px-2 sm:px-4 text-left text-[#C62B34] font-bold whitespace-nowrap max-w-[7.5rem]">Estudiante</th>
                <th className="py-3 px-2 sm:px-4 text-right text-[#C62B34] font-bold whitespace-nowrap">Saldo MB</th>
                <th className="py-3 px-2 sm:px-4 text-right text-[#C62B34] font-bold whitespace-nowrap">Puntos</th>
                <th className="py-3 px-2 sm:px-4 text-center text-[#C62B34] font-bold whitespace-nowrap">Canjes</th>
                <th className="py-3 px-2 sm:px-4 text-center text-[#C62B34] font-bold whitespace-nowrap">Insignias</th>
            </tr>
          </thead>
          <tbody>
              {processedStats.ranking.map((student, idx) => (
                <tr key={student.id} className="border-b border-[#F3F4F6] last:border-b-0 hover:bg-[#F8D7DA]/20 transition-colors">
                  <td className="py-3 px-2 sm:px-4 font-bold text-[#3465B4] text-xs sm:text-sm whitespace-nowrap">{idx + 1}</td>
                  <td className="py-3 px-2 sm:px-4 font-medium text-gray-700 text-xs sm:text-sm max-w-[7.5rem] truncate" title={`${student.firstName} ${student.lastName}`}>{student.firstName} {student.lastName}</td>
                  <td className="py-3 px-2 sm:px-4 text-right font-bold text-[#C62B34] text-xs sm:text-sm whitespace-nowrap">{student.points}</td>
                  <td className="py-3 px-2 sm:px-4 text-right font-medium text-[#3465B4] text-xs sm:text-sm whitespace-nowrap">{student.academicPoints}</td>
                  <td className="py-3 px-2 sm:px-4 text-center font-medium text-gray-700 text-xs sm:text-sm whitespace-nowrap">{student.exchanges}</td>
                  <td className="py-3 px-2 sm:px-4 text-center">
                    <div className="flex flex-wrap gap-1 justify-center items-center min-w-[5rem]">
                      {badgeList.map(badge => 
                        (badgesByUser[student.id]?.includes(badge.key)) && (
                          <BadgeInitial key={badge.key} badge={badge} description={badge.label} />
                        )
                      )}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
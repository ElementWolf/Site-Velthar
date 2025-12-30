// Componente Badge reutilizable para mostrar insignias tipo "chip" con tooltip
export default function Badge({ initials, label, color }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full ${color || 'bg-[#F8D7DA] text-[#C62B34]'} font-bold text-xs shadow-sm cursor-pointer hover:bg-[#C62B34] hover:text-white transition-all`}
      title={label}
    >
      {initials}
    </span>
  );
} 
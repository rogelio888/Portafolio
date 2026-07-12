import { useEffect, useMemo } from 'react';
import { User, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, BellRing } from 'lucide-react';
import { getAsistenciasDelCliente } from '../data/db';

const ClientDetailsModal = ({ client, onClose }) => {
  // Manejador del Teclado Global para cerrar el Modal solo con Escape
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onClose]);

  const attendedDays = useMemo(() => {
    if (!client) return new Set();
    const asistencias = getAsistenciasDelCliente(client.id);
    return new Set(asistencias.map((a) => new Date(a.fecha + 'T00:00:00').getDate()));
  }, [client]);

  if (!client) return null;

  const status = client.status || 'Activo';
  const daysRemaining = client.daysRemaining !== undefined ? client.daysRemaining : 15;
  const plan = client.planName || 'Sin Plan Activo';

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    attended: attendedDays.has(i + 1),
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] border border-[#333]">

        {/* Banner de Estado */}
        <div className={`py-4 text-center shadow-lg ${
          status === 'Activo'
            ? (daysRemaining <= 3 ? 'bg-amber-500' : 'bg-emerald-500')
            : 'bg-red-500'
        }`}>
          <h1 className={`text-3xl font-black uppercase tracking-widest drop-shadow-md flex items-center justify-center gap-3
            ${daysRemaining <= 3 && status === 'Activo' ? 'text-black' : 'text-white'}
          `}>
            {status === 'Activo' ? (
              daysRemaining <= 3 ? <BellRing size={32} /> : <CheckCircle2 size={32} />
            ) : <AlertTriangle size={32} />}

            {status === 'Activo' && daysRemaining <= 3
              ? `VENCE EN ${daysRemaining} DÍAS`
              : status}
          </h1>
        </div>

        <div className="p-6">
          {/* Perfil */}
          <div className="flex items-center gap-4 mb-6 border-b border-[#333] pb-6">
            <div className="w-16 h-16 bg-[#2a2a2a] rounded-full border-2 border-[#444] flex items-center justify-center shrink-0">
              <User size={32} className="text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wide mb-1">{client.name}</h2>
              <div className="flex items-center gap-3">
                <span className="text-blue-400 font-mono font-bold">{client.code}</span>
                <span className="bg-[#2a2a2a] text-gray-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-[#444]">
                  {plan}
                </span>
              </div>
            </div>
          </div>

          {/* Calendario Mensual */}
          <div>
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <CalendarIcon size={16} />
              Asistencias del Mes
            </h3>

            {/* Grid del Calendario */}
            <div className="grid grid-cols-7 gap-1.5">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase pb-1">{d}</div>
              ))}

              {currentMonthDays.map((date) => (
                <div
                  key={date.day}
                  className={`h-9 rounded-md flex items-center justify-center font-bold text-xs transition-all
                    ${date.attended
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
                      : 'bg-[#2a2a2a] text-gray-500 border border-transparent'
                    }
                  `}
                >
                  {date.day}
                </div>
              ))}
            </div>
          </div>

          {/* Instrucción de Cierre y Botón */}
          <div className="mt-6 pt-5 border-t border-[#333] flex items-center justify-between">
            <p className="text-gray-500 text-xs font-bold animate-pulse">
              Presione <kbd className="bg-[#333] px-1.5 py-0.5 rounded text-gray-300 mx-1">ESC</kbd> para continuar
            </p>
            <button
              onClick={onClose}
              className="bg-[#2a2a2a] hover:bg-gray-700 text-white font-bold py-1.5 px-5 rounded-lg uppercase tracking-wider transition-colors text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientDetailsModal;

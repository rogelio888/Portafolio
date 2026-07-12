import { useState, useRef, useEffect } from 'react';
import { ScanLine, CheckCircle2, XCircle, Clock, Search, Activity, UserCheck, BellRing, AlertTriangle } from 'lucide-react';
import ClientDetailsModal from '../components/ClientDetailsModal';
import { registrarAsistencia } from '../data/db';

const Dashboard = () => {
  const [inputValue, setInputValue] = useState('');
  const [recentEntries, setRecentEntries] = useState([]);
  const [alertList, setAlertList] = useState([]); // HU11: Clientes detectados con vencimiento próximo
  const [notification, setNotification] = useState(null); 
  const [clientModal, setClientModal] = useState(null); 
  const inputRef = useRef(null);

  useEffect(() => {
    if (!clientModal) {
      inputRef.current?.focus();
    }
  }, [clientModal]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (clientModal && e.key === 'Escape') {
        e.preventDefault();
        setClientModal(null);
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [clientModal]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = inputValue.trim().toUpperCase();

      if (!code) return;

      const result = registrarAsistencia(code);
      const now = new Date();
      const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (result.notFound) {
        setNotification({ type: 'error', message: `El código ${code} no existe en el sistema.` });
      } else if (result.denied) {
        const client = result.cliente;
        setNotification({ type: 'error', message: `Acceso Denegado: ${client.name} está ${client.status}.` });
        setClientModal(client);
      } else {
        const client = result.cliente;
        // HU11: Si le quedan 3 días o menos, es una alerta preventiva
        const isWarning = client.daysRemaining <= 3;

        if (isWarning) {
          setNotification({ type: 'error', message: `¡Atención! A ${client.name} le quedan ${client.daysRemaining} días.` });
          setAlertList(prev => {
            if (!prev.find(c => c.id === client.id)) return [client, ...prev];
            return prev;
          });
        } else {
          setNotification({ type: 'success', message: `${client.name} ha ingresado.` });
        }

        setRecentEntries(prev => [
          { id: result.asistencia.id, client, time: timeString, isWarning },
          ...prev
        ].slice(0, 10));

        setClientModal(client);
      }

      setInputValue('');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 h-full flex flex-col relative">
      
      {/* SECCIÓN SUPERIOR: BARRA RÁPIDA DE ASISTENCIA */}
      <div className="flex flex-col items-center justify-center pt-8 pb-12">
        <div className="w-full max-w-2xl relative">
          
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <ScanLine className="text-blue-500 animate-pulse" size={32} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!!clientModal}
            placeholder="ESCANEE O INGRESE EL CÓDIGO Y PRESIONE ENTER"
            className="w-full bg-[#1e1e1e] border-2 border-[#333] focus:border-blue-500 text-white text-2xl font-black uppercase tracking-widest pl-20 pr-8 py-6 rounded-2xl outline-none shadow-2xl transition-all placeholder:text-gray-600 placeholder:text-lg placeholder:font-bold text-center disabled:opacity-50"
          />

          {/* Notificaciones Flotantes Rápidas */}
          {notification && !clientModal && (
            <div className={`absolute -bottom-16 left-0 w-full p-4 rounded-xl flex items-center justify-center gap-3 animate-[fadeIn_0.2s_ease-out] shadow-xl border
              ${notification.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : notification.message.includes('Atención') // Alerta HU11
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              <span className="font-bold text-lg tracking-wide">{notification.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: HISTORIAL DE INGRESOS */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Historial */}
        <div className="lg:col-span-2 bg-[#1e1e1e] border-t-4 border-blue-600 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="bg-[#1a1a1a] p-6 border-b border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-blue-500" size={24} />
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Ingresos Recientes</h2>
            </div>
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-bold border border-blue-500/30">
              Hoy: {recentEntries.length}
            </span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {recentEntries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                <UserCheck size={64} />
                <p className="font-bold uppercase tracking-widest text-sm">Esperando ingresos...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className={`bg-[#2a2a2a] p-4 rounded-xl flex items-center justify-between animate-[fadeIn_0.3s_ease-out] border
                      ${entry.isWarning ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-[#333]'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border 
                        ${entry.isWarning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-blue-600/10 border-blue-500/30'}`}>
                        <UserCheck className={entry.isWarning ? "text-amber-400" : "text-blue-400"} size={20} />
                      </div>
                      <div>
                        <p className={`font-black text-lg tracking-wide ${entry.isWarning ? 'text-amber-400' : 'text-white'}`}>
                          {entry.client.name}
                        </p>
                        <p className="text-gray-400 font-mono text-sm">{entry.client.code}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400 bg-[#1a1a1a] px-4 py-2 rounded-lg border border-[#333]">
                      <Clock size={16} className={entry.isWarning ? "text-amber-500" : "text-emerald-500"} />
                      <span className="font-bold font-mono">{entry.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral: Alertas Preventivas (HU11) */}
        <div className="bg-[#1e1e1e] border-2 border-[#2a2a2a] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <Activity className="absolute -bottom-10 -right-10 text-[#222] w-64 h-64 pointer-events-none" />
          
          <h2 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2">
            <BellRing size={20} className="text-amber-500" />
            Panel de Alertas
          </h2>
          
          <div className="space-y-4 relative z-10 flex-1 overflow-y-auto">
            {alertList.length === 0 ? (
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-600/20 border-dashed text-center mt-8">
                <Search className="text-gray-600 mx-auto mb-2" size={24} />
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Sin alertas recientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertList.map(client => (
                  <div key={client.id} className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-amber-400 font-bold text-sm tracking-wide">{client.name}</p>
                      <p className="text-amber-500/70 text-xs font-mono">{client.code}</p>
                    </div>
                    <div className="bg-amber-500 text-black px-2 py-1 rounded font-black text-xs uppercase text-center">
                      Quedan<br/>{client.daysRemaining} {client.daysRemaining === 1 ? 'Día' : 'Días'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL HU10/HU11: ESTADO Y CALENDARIO DEL CLIENTE */}
      <ClientDetailsModal client={clientModal} onClose={() => setClientModal(null)} />
    </div>
  );
};

export default Dashboard;

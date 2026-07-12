import { useState, useEffect } from 'react';
import { Activity, Search, Clock, Calendar, User, Info } from 'lucide-react';
import { getBitacora } from '../data/db';

const Bitacora = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(getBitacora());
  }, []);

  // Filtro simple por texto (usuario, módulo o acción)
  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.date.includes(searchTerm)
  );

  return (
    <div className="max-w-[1400px] mx-auto p-8">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="text-blue-500" size={32} />
            <h1 className="text-3xl font-black text-white uppercase tracking-wider">
              Bitácora de Auditoría
            </h1>
          </div>
          <p className="text-gray-400 font-medium">Registro inmutable de todas las acciones del sistema</p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-[#1e1e1e] border-2 border-[#2a2a2a] focus:border-blue-500 text-white rounded-lg pl-10 pr-4 py-3 outline-none transition-all placeholder-gray-500"
            placeholder="Buscar por usuario, módulo, fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Bitácora (Solo Lectura) */}
      <div className="bg-[#1e1e1e] border-t-4 border-blue-600 rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 bg-[#181818] border-b border-[#2a2a2a] flex items-center gap-2">
          <Info size={18} className="text-blue-400" />
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Mostrando {filteredLogs.length} registros (Vista de solo lectura)</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] border-b-2 border-[#2a2a2a]">
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-400 whitespace-nowrap">Fecha y Hora</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-400">Usuario Responsable</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-400">Módulo</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-400 w-1/2">Acción Realizada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#222] transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <Calendar size={14} className="text-blue-500" />
                          <span>{log.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Clock size={14} />
                          <span>{log.time}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#2a2a2a] p-2 rounded-full">
                          <User size={16} className="text-gray-300" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white tracking-wide">{log.user}</span>
                          <span className="text-xs text-blue-400 uppercase font-semibold">{log.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#2a2a2a] text-gray-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {log.action}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bitacora;

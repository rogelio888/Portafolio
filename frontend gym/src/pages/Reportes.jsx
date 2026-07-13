import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, LineChart, PieChart, Receipt, Download, Search, Filter, CalendarDays } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { getReporteFinanzas, getReporteEstadoClientes, getAsistenciasUltimos7Dias, getClientesDestacados } from '../data/db';

const MEDALS = ['🥇', '🥈', '🥉'];
const COLORS = { Activo: '#10b981', 'Por Vencer': '#f59e0b', Vencido: '#ef4444', 'Sin Plan': '#6b7280' };

const Reportes = () => {
  const { tab } = useParams();
  const activeTab = tab || 'finanzas';

  const [finanzas, setFinanzas] = useState([]);
  const [afluencia, setAfluencia] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [estadosClientes, setEstadosClientes] = useState([]);

  useEffect(() => {
    setFinanzas(getReporteFinanzas());
    setAfluencia(getAsistenciasUltimos7Dias());
    setDestacados(getClientesDestacados(3));
    setEstadosClientes(getReporteEstadoClientes());
  }, [activeTab]);

  const totalRecaudado = finanzas.reduce((acc, f) => acc + f.monto, 0);
  const totalEfectivo = finanzas.filter(f => f.metodoType === 'cash').reduce((acc, f) => acc + f.monto, 0);
  const totalDigital = totalRecaudado - totalEfectivo;

  const estadosStats = ['Activo', 'Por Vencer', 'Vencido', 'Sin Plan']
    .map(status => ({ name: status, value: estadosClientes.filter(c => c.status === status).length }))
    .filter(s => s.value > 0);
  const totalClientes = estadosClientes.length;

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
            <BarChart3 className="text-blue-500" size={40} />
            Centro de Reportes
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Análisis de caja, métricas operativas y retención de clientes</p>
        </div>

        <button
          onClick={handleExportPDF}
          className="bg-[#2a2a2a] hover:bg-[#333] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border border-[#444] hover:border-blue-500 uppercase tracking-wide"
        >
          <Download size={20} className="text-blue-500" />
          Exportar a PDF
        </button>
      </div>

      {/* Contenido Dinámico */}
      <div className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl flex flex-col">

        {/* =========================================
            PESTAÑA FINANZAS (HU15)
            ========================================= */}
        {activeTab === 'finanzas' && (
          <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Receipt className="text-blue-500" /> Cuadre de Caja y Cobranza
            </h2>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#2a2a2a] p-2 rounded-xl flex items-center gap-2 px-4 border border-[#333]">
                <CalendarDays size={18} className="text-gray-400" />
                <input type="date" className="bg-transparent text-white outline-none w-full text-sm" title="Desde" />
              </div>
              <div className="bg-[#2a2a2a] p-2 rounded-xl flex items-center gap-2 px-4 border border-[#333]">
                <CalendarDays size={18} className="text-gray-400" />
                <input type="date" className="bg-transparent text-white outline-none w-full text-sm" title="Hasta" />
              </div>
              <div className="bg-[#2a2a2a] p-2 rounded-xl flex items-center gap-2 px-4 border border-[#333]">
                <Filter size={18} className="text-gray-400" />
                <select className="bg-transparent text-white outline-none w-full text-sm">
                  <option value="todos" className="bg-[#2a2a2a]">Todos los Métodos</option>
                  <option value="efectivo" className="bg-[#2a2a2a]">Efectivo</option>
                  <option value="qr" className="bg-[#2a2a2a]">QR</option>
                </select>
              </div>
              <button className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white rounded-xl font-bold uppercase text-sm transition-colors">
                Aplicar Filtros
              </button>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border-2 border-emerald-500/30 p-6 rounded-2xl relative overflow-hidden">
                <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-2">Total Recaudado</p>
                <p className="text-4xl font-black text-white">Bs. {totalRecaudado}</p>
              </div>
              <div className="bg-[#2a2a2a] border border-[#333] p-6 rounded-2xl">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Ingresos Efectivo</p>
                <p className="text-3xl font-black text-amber-500">Bs. {totalEfectivo}</p>
              </div>
              <div className="bg-[#2a2a2a] border border-[#333] p-6 rounded-2xl">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Ingresos QR/Digital</p>
                <p className="text-3xl font-black text-blue-400">Bs. {totalDigital}</p>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto border border-[#2a2a2a] rounded-xl flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#2a2a2a] text-gray-400 text-xs uppercase tracking-widest">
                    <th className="px-6 py-4 font-bold">Fecha</th>
                    <th className="px-6 py-4 font-bold">Cliente</th>
                    <th className="px-6 py-4 font-bold">Plan</th>
                    <th className="px-6 py-4 font-bold">Método</th>
                    <th className="px-6 py-4 font-bold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {finanzas.map(row => (
                    <tr key={row.id} className="hover:bg-[#252525] transition-colors">
                      <td className="px-6 py-4 text-gray-400">{row.fecha}</td>
                      <td className="px-6 py-4 text-white font-bold">{row.cliente}</td>
                      <td className="px-6 py-4 text-gray-300">{row.plan}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                          row.metodoType === 'cash' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {row.metodo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-400 font-black">Bs. {row.monto}</td>
                    </tr>
                  ))}
                  {finanzas.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Sin cobros registrados todavía.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================
            PESTAÑA ASISTENCIA (HU16)
            ========================================= */}
        {activeTab === 'asistencia' && (
          <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <LineChart className="text-blue-500" /> Afluencia y Retención
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 bg-[#2a2a2a] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Asistencias Últimos 7 Días</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={afluencia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" tick={{fill: '#888', fontSize: 11}} tickFormatter={(val) => val.substring(0, 3)} interval={0} axisLine={false} tickLine={false} />
                      <YAxis stroke="#888" tick={{fill: '#888', fontSize: 11}} axisLine={false} tickLine={false} allowDecimals={false} width={25} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="asistencias" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-[#333]">
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-6">Clientes Destacados del Mes</h3>
                <div className="space-y-4">
                  {destacados.length === 0 && (
                    <p className="text-gray-500 text-sm">Aún no hay asistencias registradas.</p>
                  )}
                  {destacados.map((d, idx) => (
                    <div key={d.cliente.id} className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border-l-4" style={{ borderColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : '#b45309' }}>
                      <div>
                        <p className="text-white font-bold">{d.cliente.name}</p>
                        <p className="text-gray-500 text-sm">{d.count} Asistencias</p>
                      </div>
                      <span className="text-2xl">{MEDALS[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            PESTAÑA CLIENTES (HU17)
            ========================================= */}
        {activeTab === 'clientes' && (
          <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col h-full">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <PieChart className="text-blue-500" /> Reporte de Estado de Membresías
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-[#333] flex flex-col items-center justify-center">
                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm w-full text-left mb-2">Proporción de Retención</h3>
                <div className="h-60 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={estadosStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {estadosStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  {/* Etiqueta central */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white">{totalClientes}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 border border-[#2a2a2a] rounded-xl flex flex-col flex-1 h-full overflow-hidden">
                <div className="p-4 bg-[#2a2a2a] border-b border-[#333] flex flex-col md:flex-row items-stretch md:items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input type="text" placeholder="Filtrar por nombre o estado..." className="w-full bg-[#1e1e1e] border border-[#444] text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500" />
                  </div>
                  <select className="w-full md:w-auto bg-[#1e1e1e] border border-[#444] text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500">
                    <option value="todos">Todos los Estados</option>
                    <option value="activo">Activos</option>
                    <option value="por_vencer">Por Vencer</option>
                    <option value="vencido">Vencidos</option>
                  </select>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[500px]">
                  <thead>
                    <tr className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold">Cliente</th>
                      <th className="px-6 py-4 font-bold">Teléfono</th>
                      <th className="px-6 py-4 font-bold">Vencimiento</th>
                      <th className="px-6 py-4 font-bold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a]">
                    {estadosClientes.map(client => (
                      <tr key={client.id} className="hover:bg-[#252525] transition-colors">
                        <td className="px-6 py-4 text-white font-bold">{client.name}</td>
                        <td className="px-6 py-4 text-gray-400">{client.phone}</td>
                        <td className="px-6 py-4 text-gray-400">{client.expiration}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${
                            client.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            client.status === 'Por Vencer' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {client.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reportes;

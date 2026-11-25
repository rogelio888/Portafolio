import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  UserPlus,
  Search,
  QrCode,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Ban,
  ArrowRightLeft,
} from 'lucide-react';
import { useClientStore } from '../state/useClientStore';
import { useAuthStore } from '../../auth/state/useAuthStore';
import type { Client } from '../types/client.types';
import { ClientQrCardModal } from '../components/ClientQrCardModal';
import { ClientFormModal } from '../components/ClientFormModal';
import { AssignMembershipModal } from '../components/AssignMembershipModal';
import { ClientPeriodCalendar } from '../components/ClientPeriodCalendar';
import { TransferBranchModal } from '../components/TransferBranchModal';

export const ClientsListPage: React.FC = () => {
  const { clients, isLoading, fetchClients, theme } = useClientStore();
  const { hasPermission } = useAuthStore();
  const isDark = theme === 'dark';

  const canCreateClient = hasPermission('clients.create');
  const canEditClient = hasPermission('clients.edit');

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQrClient, setSelectedQrClient] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToRenew, setClientToRenew] = useState<Client | null>(null);
  const [clientToTransfer, setClientToTransfer] = useState<{ id: string; full_name: string; branch_id?: string; branch_name?: string } | null>(null);
  const [calendarClient, setCalendarClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  React.useEffect(() => {
    fetchClients(debouncedSearch, statusFilter);

    const handleBranchChanged = () => fetchClients(debouncedSearch, statusFilter);
    window.addEventListener('branch-changed', handleBranchChanged);
    return () => window.removeEventListener('branch-changed', handleBranchChanged);
  }, [fetchClients, debouncedSearch, statusFilter]);

  const filteredClients = clients.filter((client: Client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const matchesSearch =
      !debouncedSearch ||
      fullName.includes(debouncedSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      client.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      client.qrCode.toLowerCase().includes(debouncedSearch.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setClientToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setClientToEdit(client);
    setIsFormOpen(true);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-wide flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Users className={`h-5 w-5 sm:h-6 sm:w-6 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            Gestión de Clientes
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Administración de expedientes, membresías y códigos QR de acceso.
          </p>
        </div>

        {canCreateClient && (
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Registrar Nuevo Cliente
          </button>
        )}
      </div>

      <div className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800 shadow-md' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o UUID..."
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
              isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'expired'
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40'
                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Vencidos
          </button>
        </div>
      </div>

      <div className={`rounded-3xl border overflow-hidden transition-colors shadow-sm ${
        isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200'
      }`}>
        {/* Mobile Client Cards */}
        <div className={`md:hidden divide-y ${isDark ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
          {isLoading ? (
            [1, 2, 3].map((idx) => (
              <div key={idx} className="p-4 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className="space-y-2 flex-1">
                    <div className={`h-3.5 w-36 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    <div className={`h-2.5 w-24 rounded ${isDark ? 'bg-slate-800/60' : 'bg-slate-200/60'}`} />
                  </div>
                </div>
              </div>
            ))
          ) : filteredClients.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No se encontraron clientes con ese criterio.
            </div>
          ) : (
            filteredClients.map((client: Client) => (
              <div key={client.id} className="p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={client.photoUrl}
                      alt={client.firstName}
                      className="h-11 w-11 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {client.firstName} {client.lastName}
                      </p>
                      <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {client.email}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {client.status === 'active' && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle className="h-3 w-3" /> Activo
                      </span>
                    )}
                    {client.status === 'expired' && (
                      <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <XCircle className="h-3 w-3" /> Vencido
                      </span>
                    )}
                    {client.status === 'suspended' && (
                      <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <Ban className="h-3 w-3" /> Suspendido
                      </span>
                    )}
                    {client.status === 'pending_payment' && (
                      <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <AlertTriangle className="h-3 w-3" /> Pendiente
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-2xl bg-slate-950/40 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Membresía</span>
                    <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{client.membershipType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Vencimiento (Ver Calendario)</span>
                    <button
                      onClick={() => setCalendarClient(client)}
                      className={`font-mono font-bold hover:underline cursor-pointer ${
                        client.status === 'expired' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {client.endDate ? client.endDate.split('T')[0] : '—'}
                    </button>
                  </div>
                  <div className="col-span-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/40">
                    <span>Última asistencia:</span>
                    <span className="font-medium">{client.lastAttendance || 'Sin registros'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedQrClient(client)}
                    className="inline-flex items-center justify-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Tarjeta QR</span>
                  </button>

                  <button
                    onClick={() => setClientToRenew(client)}
                    className="inline-flex items-center justify-center gap-1.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-600 dark:text-teal-300 border border-teal-500/30 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-teal-400" />
                    <span>Renovar</span>
                  </button>

                  {canEditClient && (
                    <button
                      onClick={() => setClientToTransfer({ id: client.id, full_name: `${client.firstName} ${client.lastName}`, branch_id: client.branch_id, branch_name: client.branch_name })}
                      className="inline-flex items-center justify-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Transferir</span>
                    </button>
                  )}

                  {canEditClient && (
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isDark
                          ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      <Edit className="h-3.5 w-3.5 text-sky-400" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'border-slate-800 text-slate-400 bg-slate-950/60' : 'border-slate-200 text-slate-500 bg-slate-50'
              }`}>
                <th className="py-3.5 px-5">Cliente</th>
                <th className="py-3.5 px-5">Membresía</th>
                <th className="py-3.5 px-5">Estado</th>
                <th className="py-3.5 px-5">Vencimiento</th>
                <th className="py-3.5 px-5">Última Asistencia</th>
                <th className="py-3.5 px-5 text-right">Acciones QR / Gestión</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {isLoading ? (
                [1, 2, 3].map((idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-5 flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      <div className="space-y-1.5">
                        <div className={`h-3 w-32 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                        <div className={`h-2 w-24 rounded ${isDark ? 'bg-slate-800/60' : 'bg-slate-200/60'}`} />
                      </div>
                    </td>
                    <td className="py-4 px-5"><div className={`h-3 w-20 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} /></td>
                    <td className="py-4 px-5"><div className={`h-4 w-16 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} /></td>
                    <td className="py-4 px-5"><div className={`h-3 w-20 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} /></td>
                    <td className="py-4 px-5"><div className={`h-3 w-20 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} /></td>
                    <td className="py-4 px-5 text-right"><div className={`h-7 w-24 rounded-xl ml-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} /></td>
                  </tr>
                ))
              ) : (
                filteredClients.map((client: Client) => (
                  <tr key={client.id} className={isDark ? 'hover:bg-slate-800/40 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={client.photoUrl}
                          alt={client.firstName}
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
                        />
                        <div>
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {client.firstName} {client.lastName}
                          </p>
                          <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{client.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className={`py-4 px-5 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {client.membershipType}
                    </td>

                    <td className="py-4 px-5">
                      {client.status === 'active' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <CheckCircle className="h-3 w-3" /> Activo
                        </span>
                      )}
                      {client.status === 'expired' && (
                        <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <XCircle className="h-3 w-3" /> Vencido
                        </span>
                      )}
                      {client.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1 bg-slate-500/10 text-slate-400 border border-slate-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <Ban className="h-3 w-3" /> Suspendido
                        </span>
                      )}
                      {client.status === 'pending_payment' && (
                        <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="h-3 w-3" /> Pago Pendiente
                        </span>
                      )}
                    </td>

                    <td className={`py-4 px-5 font-mono text-xs whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <button
                        onClick={() => setCalendarClient(client)}
                        className={`hover:underline flex items-center gap-1.5 cursor-pointer transition-all font-bold ${
                          client.status === 'expired' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                        title="Clic para ver calendario de cobertura de membresía"
                      >
                        {client.endDate ? client.endDate.split('T')[0] : '—'}
                      </button>
                    </td>

                    <td className={`py-4 px-5 text-[11px] whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {client.lastAttendance || 'Sin registros'}
                    </td>

                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedQrClient(client)}
                          className="inline-flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
                          title="Ver y exportar carnet QR"
                        >
                          <QrCode className="h-4 w-4" />
                          <span>Tarjeta QR</span>
                        </button>

                        <button
                          onClick={() => setClientToRenew(client)}
                          className="inline-flex items-center gap-1.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-600 dark:text-teal-300 border border-teal-500/30 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
                          title="Renovar membresía del socio"
                        >
                          <RefreshCw className="h-4 w-4 text-teal-400" />
                          <span>Renovar</span>
                        </button>

                        {canEditClient && (
                          <button
                            onClick={() => setClientToTransfer({ id: client.id, full_name: `${client.firstName} ${client.lastName}`, branch_id: client.branch_id, branch_name: client.branch_name })}
                            className="inline-flex items-center gap-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
                            title="Transferir socio a otra sucursal"
                          >
                            <ArrowRightLeft className="h-4 w-4 text-indigo-400" />
                            <span>Transferir</span>
                          </button>
                        )}

                        {canEditClient && (
                          <button
                            onClick={() => handleOpenEdit(client)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                              isDark
                                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                            title="Editar datos del expediente"
                          >
                            <Edit className="h-4 w-4 text-sky-400" />
                            <span>Editar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientQrCardModal
        client={selectedQrClient}
        onClose={() => setSelectedQrClient(null)}
      />

      <ClientFormModal
        isOpen={isFormOpen}
        clientToEdit={clientToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setClientToEdit(null);
        }}
        onSuccess={(newId) => {
          fetchClients(debouncedSearch, statusFilter);
          const created = clients.find((c: Client) => c.id === newId);
          if (created && !clientToEdit) setSelectedQrClient(created);
        }}
      />

      <AssignMembershipModal
        isOpen={Boolean(clientToRenew)}
        client={clientToRenew}
        onClose={() => setClientToRenew(null)}
        onSuccess={() => {
          fetchClients(debouncedSearch, statusFilter);
        }}
      />

      <TransferBranchModal
        isOpen={Boolean(clientToTransfer)}
        client={clientToTransfer}
        onClose={() => setClientToTransfer(null)}
        onSuccess={() => {
          fetchClients(debouncedSearch, statusFilter);
        }}
      />

      {calendarClient && createPortal(
        <div className="fixed inset-0 !m-0 z-[9999] bg-slate-950/80 overflow-y-auto flex items-start sm:items-center justify-center p-3 sm:p-4">
          <div className="relative my-auto w-full max-w-sm">
            <button
              onClick={() => setCalendarClient(null)}
              className="absolute top-3 right-3 z-10 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full border border-slate-700 shadow-xl cursor-pointer"
            >
              ✕
            </button>
            <ClientPeriodCalendar
              startDate={calendarClient.startDate}
              endDate={calendarClient.endDate}
              clientName={`${calendarClient.firstName} ${calendarClient.lastName}`}
              planName={calendarClient.membershipType}
              attendanceDates={calendarClient.attendanceDates}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

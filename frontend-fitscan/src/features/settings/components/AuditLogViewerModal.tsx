import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldAlert, Building2, User, Clock, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../../services/api';

interface AuditLogItem {
  id: string;
  action: string;
  description: string;
  created_at: string;
  ip_address?: string;
  device_info?: string;
  branch?: { id: string; name: string } | null;
  user?: { id: string; name: string } | null;
  client?: { id: string; full_name: string } | null;
}

interface AuditLogViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogViewerModal: React.FC<AuditLogViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/audit-logs');
      setLogs(response.data.data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Registro de Auditoría de Acciones Críticas</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Trazabilidad inmutable por usuario, fecha y sucursal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchAuditLogs}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Recargar"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500 dark:text-emerald-400" />
            <span>Cargando bitácora de auditoría...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs font-bold">
            No hay registros de auditoría almacenados.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-start justify-between text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      {log.action}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{log.description}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1">
                    {log.branch && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        {log.branch.name}
                      </span>
                    )}
                    {log.user && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-sky-400 shrink-0" />
                        {log.user.name}
                      </span>
                    )}
                    {log.ip_address && <span className="font-mono text-slate-500">IP: {log.ip_address}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleString('es-BO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

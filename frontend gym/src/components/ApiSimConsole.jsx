import { useState } from 'react';
import { Terminal, X, Trash2 } from 'lucide-react';
import { useApiSimLog } from '../context/ApiSimLogContext';

const TABS = [
  { key: 'request', label: 'Request' },
  { key: 'code', label: 'Backend' },
  { key: 'sql', label: 'SQL' },
  { key: 'response', label: 'Response' },
];

const METHOD_CLASS = {
  GET: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  POST: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PUT: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PATCH: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  DELETE: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function relativeTime(iso) {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 5) return 'ahora';
  if (diffSec < 60) return `hace ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  return `hace ${Math.floor(diffMin / 60)}h`;
}

function EventItem({ event, expanded, onToggle }) {
  const [tab, setTab] = useState('request');

  return (
    <div className="px-4 py-3">
      <button className="w-full flex items-center gap-2 text-left" onClick={() => { onToggle(event.id); setTab('request'); }}>
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${METHOD_CLASS[event.method] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`}>
          {event.method}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-xs font-mono text-slate-200 truncate">{event.route}</span>
          <span className="block text-[11px] text-slate-500 truncate">{event.operationLabel}</span>
        </span>
        <span className="text-[10px] text-slate-500 whitespace-nowrap">{relativeTime(event.timestamp)}</span>
      </button>

      {expanded && (
        <div className="mt-3 rounded-md border border-white/10 bg-black/30">
          <div className="flex text-[11px] border-b border-white/10">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-1.5 ${tab === t.key ? 'text-violet-400' : 'text-slate-500'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-3 max-h-64 overflow-auto">
            {tab === 'request' && (
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                {event.method} {event.route}
                {'\n'}Status: {event.statusCode} · {event.durationMs}ms{'\n'}
                {event.requestBody ? JSON.stringify(event.requestBody, null, 2) : '(sin cuerpo)'}
              </pre>
            )}
            {tab === 'code' && <pre className="text-[11px] font-mono text-emerald-300 whitespace-pre-wrap">{event.controllerCode}</pre>}
            {tab === 'sql' && <pre className="text-[11px] font-mono text-sky-300 whitespace-pre-wrap">{event.sqlQuery}</pre>}
            {tab === 'response' && <pre className="text-[11px] font-mono text-amber-200 whitespace-pre-wrap">{JSON.stringify(event.responseBody, null, 2)}</pre>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiSimConsole() {
  const log = useApiSimLog();
  const [expandedId, setExpandedId] = useState(null);

  if (!log) return null;

  return (
    <>
      <button
        onClick={log.toggle}
        className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 px-4 py-3 transition-all"
        title="Consola de simulación API"
      >
        <Terminal size={18} />
        <span className="text-sm font-semibold">API</span>
        {log.events.length > 0 && (
          <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-white text-violet-700 text-xs font-bold">
            {log.events.length}
          </span>
        )}
      </button>

      {log.isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40" onClick={log.toggle}></div>
          <div className="relative w-full max-w-md h-full bg-slate-950 text-slate-100 border-l border-white/10 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <h3 className="font-semibold text-sm">Consola API Simulada</h3>
                <p className="text-[11px] text-slate-400">Peticiones que el backend real habría recibido</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={log.clear} className="text-[11px] px-2 py-1 rounded border border-white/10 text-slate-300 hover:bg-white/5 flex items-center gap-1">
                  <Trash2 size={12} /> Limpiar
                </button>
                <button onClick={log.toggle} className="text-slate-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {log.events.length === 0 && (
                <p className="text-xs text-slate-500 p-4">
                  Aún no hay actividad. Interactúa con la app (escanea un código, cobra una inscripción...) para ver aquí las peticiones simuladas.
                </p>
              )}
              {log.events.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  expanded={expandedId === event.id}
                  onToggle={(id) => setExpandedId((cur) => (cur === id ? null : id))}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

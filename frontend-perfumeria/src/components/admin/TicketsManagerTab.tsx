"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { TicketPedido, MateriaPrimaSede, calcularTiempoRestanteTicket } from "@/lib/formulacion";
import { Perfume, Sucursal } from "@/types/perfume";
import {
  FlaskConical,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageCircle,
  Droplets,
  Sparkles,
  Layers,
  Plus,
  RefreshCw,
  QrCode,
  ArrowRight,
} from "lucide-react";

interface TicketsManagerTabProps {
  tickets: TicketPedido[];
  materiaPrimaSedes: Record<string, MateriaPrimaSede>;
  sucursalSeleccionadaId: string;
  sucursales: Sucursal[];
  perfumes: Perfume[];
  onIniciarFormulacion: (ticket: TicketPedido) => void;
  onCancelarTicket: (id: string, codigo: string) => void;
  onAbrirRecargaMateriaPrima: () => void;
  onAbrirEscanerQR: () => void;
}

export function TicketsManagerTab({
  tickets,
  materiaPrimaSedes,
  sucursalSeleccionadaId,
  sucursales,
  perfumes,
  onIniciarFormulacion,
  onCancelarTicket,
  onAbrirRecargaMateriaPrima,
  onAbrirEscanerQR,
}: TicketsManagerTabProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Filtrado de tickets por sucursal, estado y búsqueda
  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      // Filtro de sucursal
      if (sucursalSeleccionadaId !== "todas" && t.sucursalId !== sucursalSeleccionadaId) {
        return false;
      }

      // Cálculo de expiración
      const tiempo = calcularTiempoRestanteTicket(t.fechaExpiracion);

      // Filtro de estado
      if (filtroEstado === "pendiente") {
        if (t.estado !== "pendiente" || tiempo.expirado) return false;
      } else if (filtroEstado === "por_vencer") {
        if (t.estado !== "pendiente" || !tiempo.proximoAVencer || tiempo.expirado) return false;
      } else if (filtroEstado === "completado") {
        if (t.estado !== "completado") return false;
      } else if (filtroEstado === "expirado") {
        if (t.estado !== "expirado" && !tiempo.expirado) return false;
      }

      // Búsqueda por texto
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincideCodigo = t.codigoTicket.toLowerCase().includes(q);
        const coincideCliente = t.clienteNombre.toLowerCase().includes(q);
        const coincideTel = t.clienteTelefono.toLowerCase().includes(q);
        const coincidePerfume = t.items.some((i) => i.perfume.nombre.toLowerCase().includes(q));
        if (!coincideCodigo && !coincideCliente && !coincideTel && !coincidePerfume) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, sucursalSeleccionadaId, filtroEstado, busqueda]);

  // Métricas rápidas
  const metricas = useMemo(() => {
    const sedeTickets = sucursalSeleccionadaId === "todas"
      ? tickets
      : tickets.filter((t) => t.sucursalId === sucursalSeleccionadaId);

    const pendientes = sedeTickets.filter((t) => {
      const tiempo = calcularTiempoRestanteTicket(t.fechaExpiracion);
      return t.estado === "pendiente" && !tiempo.expirado;
    });

    const porVencer = pendientes.filter((t) => {
      const tiempo = calcularTiempoRestanteTicket(t.fechaExpiracion);
      return tiempo.proximoAVencer;
    });

    const completados = sedeTickets.filter((t) => t.estado === "completado");
    const expirados = sedeTickets.filter((t) => {
      const tiempo = calcularTiempoRestanteTicket(t.fechaExpiracion);
      return t.estado === "expirado" || (t.estado === "pendiente" && tiempo.expirado);
    });

    const totalPorCobrar = pendientes.reduce((acc, t) => acc + t.total, 0);

    return {
      totalPendientes: pendientes.length,
      totalPorVencer: porVencer.length,
      totalCompletados: completados.length,
      totalExpirados: expirados.length,
      montoPorCobrar: totalPorCobrar,
    };
  }, [tickets, sucursalSeleccionadaId]);

  // Materia prima de la sede activa
  const sedeActivaId = sucursalSeleccionadaId === "todas" ? "suc-1" : sucursalSeleccionadaId;
  const materiaPrimaActiva = materiaPrimaSedes[sedeActivaId] || materiaPrimaSedes["suc-1"];
  const sucursalNombre = sucursales.find((s) => s.id === sedeActivaId)?.nombre || "Atelier Equipetrol";

  return (
    <div className="space-y-6">
      
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-normal text-white">
              Tickets &amp; Pedidos en Mostrador
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold uppercase">
              Vigencia 24 Horas
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Monitoreo en vivo de proformas descargadas en la web. Los clientes tienen 24 horas para retirar su fórmula antes de la auto-cancelación.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onAbrirEscanerQR}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Escanear Ticket QR</span>
          </button>

          <button
            type="button"
            onClick={onAbrirRecargaMateriaPrima}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer font-mono shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Recargar Materia Prima</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Tickets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="p-4 bg-[#0E1528] rounded-xl border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
            En Espera (Vigentes)
          </span>
          <div className="font-mono text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{metricas.totalPendientes}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 mt-1 block">
            {metricas.montoPorCobrar} Bs por cobrar en caja
          </span>
        </div>

        <div className="p-4 bg-[#0E1528] rounded-xl border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
            Por Vencer (&lt;4 horas)
          </span>
          <div className="font-mono text-2xl font-bold text-amber-300 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{metricas.totalPorVencer}</span>
          </div>
          <span className="text-[11px] font-mono text-amber-400/90 mt-1 block">
            Avisar por WhatsApp
          </span>
        </div>

        <div className="p-4 bg-[#0E1528] rounded-xl border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
            Formulados &amp; Cobrados
          </span>
          <div className="font-mono text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{metricas.totalCompletados}</span>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8] mt-1 block">
            Entregados en mostrador
          </span>
        </div>

        <div className="p-4 bg-[#0E1528] rounded-xl border border-white/10">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
            Expirados / Cancelados
          </span>
          <div className="font-mono text-2xl font-bold text-[#64748B] flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-400/80" />
            <span>{metricas.totalExpirados}</span>
          </div>
          <span className="text-[11px] font-mono text-[#64748B] mt-1 block">
            Insumos liberados (+24h)
          </span>
        </div>

      </div>

      {/* Monitor de Tanques de Materia Prima Líquida en Mostrador */}
      <div className="p-5 bg-[#0E1528] rounded-xl border border-amber-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Nivel de Tanques &amp; Materia Prima Base en {sucursalNombre}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8]">
            Deducción milimétrica automatizada al pulsar &quot;Formular&quot;
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Tanque Alcohol */}
          <div className="p-3 bg-[#080C14] rounded-lg border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] font-mono text-[10px] uppercase">Alcohol 96º Desodorizado</span>
              <span className="font-mono text-sky-400 font-bold">{materiaPrimaActiva.alcoholMl} ml</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (materiaPrimaActiva.alcoholMl / 5000) * 100)}%` }}
                className="h-full bg-sky-500 rounded-full"
              />
            </div>
            <span className="text-[10px] text-[#64748B] block font-mono">
              ~{(materiaPrimaActiva.alcoholMl / 32.5).toFixed(0)} frascos de 50ml
            </span>
          </div>

          {/* Tanque Fijador */}
          <div className="p-3 bg-[#080C14] rounded-lg border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] font-mono text-[10px] uppercase">Fijador Molecular DPG</span>
              <span className="font-mono text-purple-400 font-bold">{materiaPrimaActiva.fijadorMl} ml</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (materiaPrimaActiva.fijadorMl / 1000) * 100)}%` }}
                className="h-full bg-purple-500 rounded-full"
              />
            </div>
            <span className="text-[10px] text-[#64748B] block font-mono">
              ~{(materiaPrimaActiva.fijadorMl / 2).toFixed(0)} frascos de 50ml
            </span>
          </div>

          {/* Dosificador Feromonas */}
          <div className="p-3 bg-[#080C14] rounded-lg border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] font-mono text-[10px] uppercase">Booster Feromonas</span>
              <span className="font-mono text-emerald-400 font-bold">{materiaPrimaActiva.feromonasMl} ml</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (materiaPrimaActiva.feromonasMl / 250) * 100)}%` }}
                className="h-full bg-emerald-400 rounded-full"
              />
            </div>
            <span className="text-[10px] text-[#64748B] block font-mono">
              ~{(materiaPrimaActiva.feromonasMl / 0.5).toFixed(0)} frascos de 50ml
            </span>
          </div>

          {/* Frascos de Cristal 50ml */}
          <div className="p-3 bg-[#080C14] rounded-lg border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8] font-mono text-[10px] uppercase">Frascos 50ml en Stock</span>
              <span className="font-mono text-amber-400 font-bold">{materiaPrimaActiva.frascos50ml} u</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (materiaPrimaActiva.frascos50ml / 100) * 100)}%` }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
            <span className="text-[10px] text-[#64748B] block font-mono">
              {materiaPrimaActiva.frascos30ml} de 30ml · {materiaPrimaActiva.frascos100ml} de 100ml
            </span>
          </div>

        </div>
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Pestañas de Estado */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0E1528] rounded-lg border border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: "todos", label: "Todos" },
            { id: "pendiente", label: "Pendientes (24h)", count: metricas.totalPendientes },
            { id: "por_vencer", label: "Por Vencer (<4h)", count: metricas.totalPorVencer },
            { id: "completado", label: "Completados", count: metricas.totalCompletados },
            { id: "expirado", label: "Expirados", count: metricas.totalExpirados },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroEstado(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filtroEstado === tab.id
                  ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-white">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar código, cliente o perfume..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#0E1528] border border-white/10 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder:text-[#64748B] focus:outline-hidden focus:border-white/30"
          />
          <button
            type="button"
            onClick={onAbrirEscanerQR}
            title="Escanear QR con cámara o pistola lectora"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-300 p-1 cursor-pointer transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Lista de Tickets en Mostrador */}
      {ticketsFiltrados.length === 0 ? (
        <div className="py-16 px-6 text-center bg-[#0E1528]/80 rounded-xl border border-white/[0.08] text-[#94A3B8] max-w-xl mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#C5A880]">
            <FlaskConical className="w-6 h-6 opacity-80" />
          </div>
          <h3 className="text-base font-serif font-normal text-white mb-1.5">
            Cola de Mostrador sin Pedidos Pendientes
          </h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
            {busqueda || filtroEstado !== "todos" || sucursalSeleccionadaId !== "todas"
              ? "No se encontraron tickets con los filtros actuales. Intenta restablecer el buscador o los filtros."
              : "No hay órdenes de retiro en espera. Las nuevas solicitudes que generen los clientes en la tienda pública ingresarán aquí automáticamente en tiempo real."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ticketsFiltrados.map((ticket) => {
            const tiempo = calcularTiempoRestanteTicket(ticket.fechaExpiracion);
            const esPendiente = ticket.estado === "pendiente" && !tiempo.expirado;
            const esExpirado = ticket.estado === "expirado" || tiempo.expirado;
            const esCompletado = ticket.estado === "completado";

            // Mensaje para alertar al cliente por WhatsApp si está por vencer
            const textoWhatsAppAviso = encodeURIComponent(
              `Hola ${ticket.clienteNombre}, te escribimos de L'Atelier Haute Parfumerie (${ticket.sucursalNombre}). Notamos que generaste tu ticket ${ticket.codigoTicket} para retirar ${ticket.items.map((i) => `${i.cantidad}x ${i.perfume.nombre} (${i.presentacion.mililitros}ml)`).join(", ")}. Te recordamos que la reserva vence en ${tiempo.horasRestantes} horas. ¿Confirmas si pasarás a retirarlo hoy? ¡Te esperamos en mostrador!`
            );

            return (
              <div
                key={ticket.id}
                data-ticket-codigo={ticket.codigoTicket}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  esPendiente
                    ? tiempo.proximoAVencer
                      ? "bg-[#0E1528] border-amber-500/40 shadow-lg shadow-amber-500/5"
                      : "bg-[#0E1528] border-white/10 hover:border-white/20"
                    : esCompletado
                    ? "bg-[#0A1220]/60 border-emerald-500/20 opacity-80"
                    : "bg-[#0A0D14]/80 border-white/5 opacity-60"
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Cabecera del Ticket */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-white tracking-wider">
                        {ticket.codigoTicket}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B] uppercase">
                        · {ticket.sucursalNombre}
                      </span>
                    </div>

                    {/* Badge de Estado & Temporizador 24h */}
                    <div>
                      {esCompletado ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ENTREGADO</span>
                        </span>
                      ) : esExpirado ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>EXPIRADO (+24h)</span>
                        </span>
                      ) : tiempo.proximoAVencer ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>VENCE EN {tiempo.horasRestantes}h {tiempo.minutosRestantes}m</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{tiempo.etiquetaTiempo}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Datos del Cliente y Contacto */}
                  <div className="p-3 bg-[#080C14] rounded-lg border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white block font-medium">
                        {ticket.clienteNombre}
                      </strong>
                      <span className="text-[11px] font-mono text-[#94A3B8]">
                        WhatsApp: {ticket.clienteTelefono || "Sin número registrado"}
                      </span>
                    </div>

                    {ticket.clienteTelefono && esPendiente && (
                      <a
                        href={`https://wa.me/${ticket.clienteTelefono}?text=${textoWhatsAppAviso}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                        title="Enviar mensaje de cortesía sobre su reserva"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>Avisar</span>
                      </a>
                    )}
                  </div>

                  {/* Desglose de Fragancias del Pedido */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block">
                      Fórmulas a Preparar:
                    </span>
                    <div className="space-y-1">
                      {ticket.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] flex items-center justify-center font-bold">
                              {item.cantidad}x
                            </span>
                            <div>
                              <strong className="text-white block">{item.perfume.nombre}</strong>
                              <span className="text-[10px] text-[#94A3B8]">
                                {item.perfume.marcaReferencia} · {item.presentacion.mililitros}ml
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-white text-xs">
                            {item.presentacion.precio * item.cantidad} Bs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total y Promoción */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <div>
                      {ticket.comboNombre && (
                        <span className="text-[10px] text-emerald-400 block font-semibold">
                          PROMO: {ticket.comboNombre}
                        </span>
                      )}
                      <span className="text-[#64748B] text-[10px]">
                        Emisión: {new Date(ticket.fechaEmision).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#94A3B8] block uppercase">Total a Cobrar</span>
                      <strong className="text-base text-amber-300">{ticket.total} Bs</strong>
                    </div>
                  </div>

                </div>

                {/* Footer de Acciones */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  {esPendiente ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onCancelarTicket(ticket.id, ticket.codigoTicket)}
                        className="text-xs text-[#64748B] hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Anular Ticket
                      </button>

                      <button
                        type="button"
                        onClick={() => onIniciarFormulacion(ticket)}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-mono shadow-md"
                      >
                        <FlaskConical className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Formular en Mostrador</span>
                      </button>
                    </>
                  ) : esCompletado ? (
                    <div className="w-full text-right text-[11px] text-[#64748B] font-mono">
                      Atendido por: <strong className="text-[#CBD5E1]">{ticket.atendidoPor || "Perfumista"}</strong>
                    </div>
                  ) : (
                    <div className="w-full text-right text-[11px] text-rose-400/80 font-mono">
                      Reserva caducada · Frascos liberados
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}


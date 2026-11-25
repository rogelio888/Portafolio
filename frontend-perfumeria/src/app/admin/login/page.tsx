"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { iniciarSesionDemo } from "@/lib/auth";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [rolEnIngreso, setRolEnIngreso] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ejecutarLogin = async (targetEmail: string, targetPassword: string, rolLabel?: string) => {
    setErrorMsg(null);
    setCargando(true);
    if (rolLabel) setRolEnIngreso(rolLabel);

    setTimeout(() => {
      const resultado = iniciarSesionDemo(targetEmail, targetPassword);
      if (!resultado.ok) {
        setErrorMsg(resultado.error || "Credenciales incorrectas.");
        setCargando(false);
        setRolEnIngreso(null);
        return;
      }
      router.push("/admin");
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutarLogin(email, password);
  };

  const handleAccesoRapido = (targetEmail: string, rolLabel: string) => {
    setEmail(targetEmail);
    setPassword("demo2026");
    ejecutarLogin(targetEmail, "demo2026", rolLabel);
  };

  return (
    <div className="min-h-screen bg-[#0C0B0A] flex flex-col items-center justify-center p-4 relative selection:bg-[#C5A880]/20">
      
      {/* Fondo sutil Haute Parfumerie */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C1A17]/60 via-[#0C0B0A] to-[#0C0B0A] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm bg-[#141312] border border-[#C5A880]/15 rounded-none p-7 sm:p-8 shadow-2xl space-y-6"
      >
        
        {/* Cabecera Minimalista de la Marca */}
        <div className="text-center space-y-1.5 pb-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.22em] text-[#F5EFEB] uppercase">
            L&apos;Atelier
          </h1>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880] font-light">
            Administración
          </p>
        </div>

        {/* Accesos Rápidos Demo */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#C5A880] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              Accesos Rápidos Demo
            </span>
            <span className="text-[9px] text-[#78716C] tracking-wider uppercase font-light">
              1-Clic
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Botón Admin */}
            <button
              type="button"
              disabled={cargando}
              onClick={() => handleAccesoRapido("admin@latelier.com", "Admin")}
              className="group p-2.5 bg-[#1A1816] hover:bg-[#23201C] border border-[#C5A880]/20 hover:border-[#C5A880]/60 transition-all text-left flex flex-col justify-between rounded-none cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1 bg-[#C5A880]/10 text-[#C5A880] group-hover:bg-[#C5A880]/20 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-[8px] uppercase tracking-wider text-[#A8A29E] bg-white/[0.04] px-1.5 py-0.5 border border-white/5">
                  Superadmin
                </span>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#F5EFEB] group-hover:text-[#C5A880] transition-colors leading-tight">
                  Admin
                </p>
                <p className="text-[9px] text-[#78716C] truncate mt-0.5">
                  admin@latelier.com
                </p>
              </div>
            </button>

            {/* Botón Recepcionista */}
            <button
              type="button"
              disabled={cargando}
              onClick={() => handleAccesoRapido("recepcion@latelier.com", "Recepcionista")}
              className="group p-2.5 bg-[#1A1816] hover:bg-[#23201C] border border-[#C5A880]/20 hover:border-[#C5A880]/60 transition-all text-left flex flex-col justify-between rounded-none cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1 bg-[#C5A880]/10 text-[#C5A880] group-hover:bg-[#C5A880]/20 transition-colors">
                  <UserCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-[8px] uppercase tracking-wider text-[#A8A29E] bg-white/[0.04] px-1.5 py-0.5 border border-white/5">
                  Mostrador
                </span>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#F5EFEB] group-hover:text-[#C5A880] transition-colors leading-tight">
                  Recepcionista
                </p>
                <p className="text-[9px] text-[#78716C] truncate mt-0.5">
                  recepcion@latelier.com
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Separador */}
        <div className="relative flex py-0.5 items-center">
          <div className="grow border-t border-white/[0.08]" />
          <span className="shrink mx-2 text-[9px] uppercase tracking-[0.15em] text-[#78716C] font-light">
            O con credenciales
          </span>
          <div className="grow border-t border-white/[0.08]" />
        </div>

        {/* Alerta de Error */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5 rounded-none"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#A8A29E] block mb-1.5 font-light">
              Correo
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@latelier.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0C0B0A] border border-white/10 rounded-none text-white placeholder-stone-600 focus:outline-hidden focus:border-[#C5A880]/50 transition-colors text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#A8A29E] block mb-1.5 font-light">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0C0B0A] border border-white/10 rounded-none text-white placeholder-stone-600 focus:outline-hidden focus:border-[#C5A880]/50 transition-colors text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A] font-semibold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none shadow-md disabled:opacity-50 mt-2"
          >
            {cargando ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {rolEnIngreso ? `Ingresando como ${rolEnIngreso}...` : "Verificando..."}
              </span>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <div className="pt-2 text-center border-t border-white/[0.06]">
          <Link
            href="/"
            className="text-[11px] text-[#A8A29E] hover:text-[#C5A880] transition-colors inline-flex items-center gap-1 font-light"
          >
            <span>Volver a la tienda</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

      </motion.div>

    </div>
  );
}

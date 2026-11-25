"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { obtenerSesionDemo, cerrarSesionDemo } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  Tag,
  MapPin,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Check,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Upload,
  CheckCircle2,
  Navigation,
  Menu,
  Save,
  Phone,
  RotateCcw,
  ShieldCheck,
  LogOut,
  UserCheck,
  UserX,
  UserPlus,
  KeyRound,
  ShieldAlert,
  FlaskConical,
  QrCode,
  Clock,
  Sparkles,
  Droplets,
  Eye,
  RefreshCw,
  Send,
  Sliders,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Perfume, Sucursal, ComboPromocion, TipoMecanicaPromocion, Genero, Presentacion, InsumosMostrador } from "@/types/perfume";
import { UsuarioSistema, SesionUsuario, RolUsuario } from "@/types/auth";
import {
  obtenerPromocionesDesdeSupabase,
  guardarPromocionEnSupabase,
  eliminarPromocionEnSupabase,
  togglePromocionEnSupabase,
  obtenerPromocionesDisponibles,
} from "@/lib/promociones";
import {
  obtenerSucursales,
  obtenerCatalogoPerfumes,
  guardarPerfumeEnSupabase,
  eliminarPerfumeEnSupabase,
  obtenerOrdenesRetiro,
  actualizarEstadoOrdenRetiro,
  obtenerMateriaPrimaTanques,
  actualizarMateriaPrimaSede,
  obtenerUsuariosSistema,
  guardarUsuarioEnSupabase,
  toggleEstadoUsuarioEnSupabase,
  suscribirCanalSupabase,
} from "@/lib/supabase";
import { sanitizeCantidad, sanitizeTexto, sanitizePrecio, sanitizeInsumo, LIMITES_SISTEMA } from "@/lib/validation";
import {
  TicketPedido,
  MateriaPrimaSede,
  obtenerReceta,
  calcularConsumoTotalPedido,
  calcularTiempoRestanteTicket,
} from "@/lib/formulacion";
import { TicketsManagerTab } from "@/components/admin/TicketsManagerTab";
import { FormulacionAssistantModal } from "@/components/admin/FormulacionAssistantModal";
import { QRScannerModal } from "@/components/admin/QRScannerModal";
import { BuscadorFraganciaModal } from "@/components/admin/BuscadorFraganciaModal";

type AdminTab = "dashboard" | "pedidos" | "catalogo" | "combos" | "sucursales" | "usuarios";

const TANQUE_BASE_VACIO: MateriaPrimaSede = {
  alcoholMl: 4500,
  fijadorMl: 650,
  feromonasMl: 180,
  frascos30ml: 110,
  frascos50ml: 85,
  frascos100ml: 40,
  bolsasConLogo: 250,
  esenciasMadreMl: {},
};

// Presets de imágenes de frascos estándar del negocio
const FRASCOS_PRESET = [
  { nombre: "Frasco Marino (Azul)", url: "/frontend-perfumeria/images/perfumes/bleu-de-chanel.png" },
  { nombre: "Frasco Ahumado (Negro)", url: "/frontend-perfumeria/images/perfumes/sauvage.png" },
  { nombre: "Frasco Ámbar / Rojo", url: "/frontend-perfumeria/images/perfumes/baccarat-rouge-540.png" },
  { nombre: "Cristal Clásico", url: "/frontend-perfumeria/images/perfumes/aventus.png" },
];

export default function AdminPage() {
  const router = useRouter();
  const [tabActiva, setTabActiva] = useState<AdminTab>("dashboard");
  const [sucursalFiltroGlobal, setSucursalFiltroGlobal] = useState<string>("todas");
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Estados de Autenticación y Sesión
  const [usuarioSesion, setUsuarioSesion] = useState<SesionUsuario | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);

  // Estados del Negocio (Sincronizados con Supabase Cloud)
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [combos, setCombos] = useState<ComboPromocion[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  // Disponibilidad de botellas madre en estantería por sede: perfumeId -> sucursalId -> boolean
  const [estanteDisponibilidad, setEstanteDisponibilidad] = useState<Record<string, Record<string, boolean>>>({});

  // Insumos de mostrador por sede (Envases vacíos y bolsas institucionales)
  const [insumosSede, setInsumosSede] = useState<Record<string, InsumosMostrador>>({
    "suc-1": { frascos30ml: 110, frascos50ml: 85, frascos100ml: 40, bolsasConLogo: 250 },
    "suc-2": { frascos30ml: 95, frascos50ml: 70, frascos100ml: 35, bolsasConLogo: 180 },
    "suc-3": { frascos30ml: 80, frascos50ml: 50, frascos100ml: 25, bolsasConLogo: 120 },
  });

  // Materia Prima Líquida y Envases por Sede (Laboratorio de Formulación en Supabase)
  const [materiaPrimaSedes, setMateriaPrimaSedes] = useState<Record<string, MateriaPrimaSede>>({});

  // Tickets de Pedidos y Proformas emitidas (consultados directamente desde Supabase)
  const [ticketsPedidos, setTicketsPedidos] = useState<TicketPedido[]>([]);

  // Filtros del módulo de Tickets
  const [filtroEstadoTicket, setFiltroEstadoTicket] = useState<string>("todos");
  const [busquedaTicket, setBusquedaTicket] = useState("");

  // Modal de Escáner QR de Tickets
  const [modalEscanerQR, setModalEscanerQR] = useState(false);

  // Modal de Búsqueda Inteligente de Fragancias (para recargas)
  const [modalBuscadorFraganciaAbierto, setModalBuscadorFraganciaAbierto] = useState(false);

  // Modal del Asistente Visual de Formulación en Mostrador
  const [modalFormulacionAbierto, setModalFormulacionAbierto] = useState(false);
  const [ticketEnFormulacion, setTicketEnFormulacion] = useState<TicketPedido | null>(null);
  const [indiceFrascoActual, setIndiceFrascoActual] = useState(0);

  // Modal de Recarga de Materia Prima
  const [modalRecargaMateriaPrimaAbierto, setModalRecargaMateriaPrimaAbierto] = useState(false);
  const [formRecargaTipo, setFormRecargaTipo] = useState<"alcohol" | "fijador" | "feromonas" | "esencia">("esencia");
  const [formRecargaPerfumeId, setFormRecargaPerfumeId] = useState("perf-1");
  const [formRecargaCantidadMl, setFormRecargaCantidadMl] = useState(500);

  // Filtros del Catálogo
  const [busqueda, setBusqueda] = useState("");
  const [filtroGenero, setFiltroGenero] = useState<string>("todos");
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<string>("todas");
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);

  // Modal de Crear / Editar Fragancia
  const [modalAbierto, setModalAbierto] = useState(false);
  const [perfumeEnEdicion, setPerfumeEnEdicion] = useState<Perfume | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formInspiracion, setFormInspiracion] = useState("");
  const [formMarca, setFormMarca] = useState("");
  const [formGenero, setFormGenero] = useState<Genero>("unisex");
  const [formFamilia, setFormFamilia] = useState("Ámbar Floral");
  const [formImagenUrl, setFormImagenUrl] = useState("/frontend-perfumeria/images/perfumes/bleu-de-chanel.png");
  const [formPrecio30, setFormPrecio30] = useState(120);
  const [formPrecio50, setFormPrecio50] = useState(180);
  const [formPrecio100, setFormPrecio100] = useState(280);
  const [formNotasSalida, setFormNotasSalida] = useState<string[]>([]);
  const [formNotasFondo, setFormNotasFondo] = useState<string[]>([]);
  const [inputNotaSalida, setInputNotaSalida] = useState("");
  const [inputNotaFondo, setInputNotaFondo] = useState("");

  // Modal de Crear Usuario (RBAC)
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [formUsuarioNombre, setFormUsuarioNombre] = useState("");
  const [formUsuarioEmail, setFormUsuarioEmail] = useState("");
  const [formUsuarioRol, setFormUsuarioRol] = useState<RolUsuario>("encargado_sede");
  const [formUsuarioSucursal, setFormUsuarioSucursal] = useState<string>("suc-2");

  // Estados para Gestor de Promociones Personalizables
  const [modalPromoAbierto, setModalPromoAbierto] = useState(false);
  const [promoEnEdicion, setPromoEnEdicion] = useState<ComboPromocion | null>(null);
  const [formPromoNombre, setFormPromoNombre] = useState("");
  const [formPromoDescripcion, setFormPromoDescripcion] = useState("");
  const [formPromoTipo, setFormPromoTipo] = useState<TipoMecanicaPromocion>("precio_fijo");
  const [formPromoFrascos, setFormPromoFrascos] = useState(2);
  const [formPromoFrascosPaga, setFormPromoFrascosPaga] = useState(1);
  const [formPromoMililitros, setFormPromoMililitros] = useState(50);
  const [formPromoPrecioCombo, setFormPromoPrecioCombo] = useState(300);
  const [formPromoDescuentoPorcentaje, setFormPromoDescuentoPorcentaje] = useState(50);
  const [formPromoAhorroEstimado, setFormPromoAhorroEstimado] = useState(60);
  const [formPromoBadge, setFormPromoBadge] = useState("");
  const [formPromoActiva, setFormPromoActiva] = useState(true);

  // Toast de feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notificar = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Verificación de Sesión Activa al Cargar (localStorage Demo)
  useEffect(() => {
    const sesion = obtenerSesionDemo();
    if (!sesion) {
      router.replace("/admin/login");
      return;
    }
    setUsuarioSesion(sesion);
    if (sesion.rol === "encargado_sede" && sesion.sucursalId) {
      setSucursalFiltroGlobal(sesion.sucursalId);
    }
  }, [router]);

  // Cierre de Sesión Seguro (Demo localStorage)
  const handleLogout = async () => {
    cerrarSesionDemo();
    router.push("/admin/login");
  };

  // Sincronización completa con Supabase Cloud y suscripciones WebSocket Realtime
  useEffect(() => {
    let activo = true;

    // 1. Cargar datos iniciales desde Supabase
    const cargarTodo = async () => {
      try {
        const [promos, tickets, tanques, listaPerfumes, listaSucursales, listaUsuarios] = await Promise.all([
          obtenerPromocionesDesdeSupabase(),
          obtenerOrdenesRetiro(),
          obtenerMateriaPrimaTanques(),
          obtenerCatalogoPerfumes(),
          obtenerSucursales(),
          obtenerUsuariosSistema(),
        ]);

        if (!activo) return;

        if (promos && promos.length > 0) setCombos(promos);
        if (tickets && tickets.length > 0) setTicketsPedidos(tickets);
        if (tanques && Object.keys(tanques).length > 0) setMateriaPrimaSedes(tanques);
        if (listaPerfumes && listaPerfumes.length > 0) setPerfumes(listaPerfumes);
        if (listaSucursales && listaSucursales.length > 0) setSucursales(listaSucursales);
        if (listaPerfumes?.length && listaSucursales?.length) {
          const initEstante: Record<string, Record<string, boolean>> = {};
          listaPerfumes.forEach((p) => {
            initEstante[p.id] = {};
            listaSucursales.forEach((s) => {
              initEstante[p.id][s.id] = true;
            });
          });
          setEstanteDisponibilidad(initEstante);
        }
        if (listaUsuarios && listaUsuarios.length > 0) setUsuarios(listaUsuarios);
      } catch (err) {
        console.error("Error cargando datos de Supabase en Admin:", err);
      }
    };

    cargarTodo();

    // 2. Suscribirse a cambios en tiempo real vía WebSocket
    const unsubTickets = suscribirCanalSupabase("ordenes_retiro", async () => {
      const tickets = await obtenerOrdenesRetiro();
      if (activo && tickets && tickets.length > 0) setTicketsPedidos(tickets);
    });

    const unsubPromos = suscribirCanalSupabase("promociones_combos", async () => {
      const promos = await obtenerPromocionesDesdeSupabase();
      if (activo && promos && promos.length > 0) setCombos(promos);
    });

    const unsubMateria = suscribirCanalSupabase("materia_prima_tanques", async () => {
      const tanques = await obtenerMateriaPrimaTanques();
      if (activo && tanques && Object.keys(tanques).length > 0) setMateriaPrimaSedes(tanques);
    });

    const unsubPerfumes = suscribirCanalSupabase("perfumes", async () => {
      const perfumesNube = await obtenerCatalogoPerfumes();
      if (activo && perfumesNube && perfumesNube.length > 0) setPerfumes(perfumesNube);
    });

    const unsubUsuarios = suscribirCanalSupabase("usuarios_sistema", async () => {
      const usuariosNube = await obtenerUsuariosSistema();
      if (activo && usuariosNube && usuariosNube.length > 0) setUsuarios(usuariosNube);
    });

    return () => {
      activo = false;
      unsubTickets();
      unsubPromos();
      unsubMateria();
      unsubPerfumes();
      unsubUsuarios();
    };
  }, []);

  // Conmutador de disponibilidad en estantería para una sede
  const toggleDisponibilidadEstante = (perfumeId: string, sucursalId: string) => {
    // Verificación de RBAC: si el usuario es encargado de sede, solo puede modificar su sede
    if (
      usuarioSesion?.rol === "encargado_sede" &&
      usuarioSesion.sucursalId &&
      usuarioSesion.sucursalId !== sucursalId
    ) {
      notificar("Acceso denegado: Solo puedes modificar la estantería de tu sede asignada.");
      return;
    }

    setEstanteDisponibilidad((prev) => {
      const actual = prev[perfumeId]?.[sucursalId] ?? true;
      const nuevo = !actual;
      const nombreSede = sucursales.find((s) => s.id === sucursalId)?.nombre || "Sede";
      notificar(`Fragancia marcada como ${nuevo ? "Disponible en Estante" : "Agotada"} en ${nombreSede}.`);
      return {
        ...prev,
        [perfumeId]: {
          ...prev[perfumeId],
          [sucursalId]: nuevo,
        },
      };
    });
  };

  // Ajuste de insumos de mostrador con sanitización
  const ajustarInsumo = (sucursalId: string, tipo: keyof InsumosMostrador, delta: number) => {
    setInsumosSede((prev) => {
      const actual = prev[sucursalId] || { frascos30ml: 0, frascos50ml: 0, frascos100ml: 0, bolsasConLogo: 0 };
      const nuevo = sanitizeInsumo(actual[tipo] + delta);
      return {
        ...prev,
        [sucursalId]: {
          ...actual,
          [tipo]: nuevo,
        },
      };
    });
  };

  // Métricas Consolidadas / por Sede
  const metricas = useMemo(() => {
    const totalFragancias = perfumes.length;

    let fraganciasEnEstante = 0;
    let envasesTotales30 = 0;
    let envasesTotales50 = 0;
    let envasesTotales100 = 0;
    let bolsasTotales = 0;

    if (sucursalFiltroGlobal === "todas") {
      perfumes.forEach((p) => {
        const dispEnAlguna = Object.values(estanteDisponibilidad[p.id] || {}).some((v) => v);
        if (dispEnAlguna) fraganciasEnEstante++;
      });
      Object.values(insumosSede).forEach((ins) => {
        envasesTotales30 += ins.frascos30ml;
        envasesTotales50 += ins.frascos50ml;
        envasesTotales100 += ins.frascos100ml;
        bolsasTotales += ins.bolsasConLogo;
      });
    } else {
      perfumes.forEach((p) => {
        if (estanteDisponibilidad[p.id]?.[sucursalFiltroGlobal]) {
          fraganciasEnEstante++;
        }
      });
      const ins = insumosSede[sucursalFiltroGlobal] || { frascos30ml: 0, frascos50ml: 0, frascos100ml: 0, bolsasConLogo: 0 };
      envasesTotales30 = ins.frascos30ml;
      envasesTotales50 = ins.frascos50ml;
      envasesTotales100 = ins.frascos100ml;
      bolsasTotales = ins.bolsasConLogo;
    }

    const totalEnvasesVacios = envasesTotales30 + envasesTotales50 + envasesTotales100;
    const valorEstimadoMostrador = envasesTotales30 * 22 + envasesTotales50 * 32 + envasesTotales100 * 52;

    return {
      totalFragancias,
      fraganciasEnEstante,
      fraganciasAgotadas: totalFragancias - fraganciasEnEstante,
      envasesTotales30,
      envasesTotales50,
      envasesTotales100,
      totalEnvasesVacios,
      bolsasTotales,
      valorEstimadoMostrador,
    };
  }, [perfumes, sucursalFiltroGlobal, estanteDisponibilidad, insumosSede]);

  // Filtrado y Búsqueda en Catálogo
  const perfumesFiltrados = useMemo(() => {
    return perfumes.filter((p) => {
      const q = busqueda.toLowerCase().trim();
      if (q) {
        const coincide =
          p.nombre.toLowerCase().includes(q) ||
          p.inspiracionEn.toLowerCase().includes(q) ||
          p.marcaReferencia.toLowerCase().includes(q) ||
          p.familiaOlfativa.toLowerCase().includes(q);
        if (!coincide) return false;
      }

      if (filtroGenero !== "todos" && p.genero !== filtroGenero) {
        return false;
      }

      if (filtroDisponibilidad !== "todas") {
        if (sucursalFiltroGlobal === "todas") {
          const tieneStockNacional = Object.values(estanteDisponibilidad[p.id] || {}).some((v) => v);
          if (filtroDisponibilidad === "disponibles" && !tieneStockNacional) return false;
          if (filtroDisponibilidad === "agotadas" && tieneStockNacional) return false;
        } else {
          const disponibleEnSede = estanteDisponibilidad[p.id]?.[sucursalFiltroGlobal] ?? true;
          if (filtroDisponibilidad === "disponibles" && !disponibleEnSede) return false;
          if (filtroDisponibilidad === "agotadas" && disponibleEnSede) return false;
        }
      }

      return true;
    });
  }, [perfumes, busqueda, filtroGenero, filtroDisponibilidad, sucursalFiltroGlobal, estanteDisponibilidad]);

  // Paginación del Catálogo
  const totalPaginas = Math.ceil(perfumesFiltrados.length / itemsPorPagina) || 1;
  const indexInicio = (paginaActual - 1) * itemsPorPagina;
  const perfumesPaginados = perfumesFiltrados.slice(indexInicio, indexInicio + itemsPorPagina);

  // Manejo de Modal de Fragancia
  const abrirNuevoPerfume = () => {
    setPerfumeEnEdicion(null);
    setFormNombre("");
    setFormInspiracion("");
    setFormMarca("");
    setFormGenero("unisex");
    setFormFamilia("Ámbar Floral");
    setFormImagenUrl("/frontend-perfumeria/images/perfumes/bleu-de-chanel.png");
    setFormPrecio30(120);
    setFormPrecio50(180);
    setFormPrecio100(280);
    setFormNotasSalida(["Bergamota", "Pimienta Rosa"]);
    setFormNotasFondo(["Ámbar Gris", "Cedro"]);
    setModalAbierto(true);
  };

  const abrirEditarPerfume = (perfume: Perfume) => {
    setPerfumeEnEdicion(perfume);
    setFormNombre(perfume.nombre);
    setFormInspiracion(perfume.inspiracionEn);
    setFormMarca(perfume.marcaReferencia);
    setFormGenero(perfume.genero);
    setFormFamilia(perfume.familiaOlfativa);
    setFormImagenUrl(perfume.imagenUrl || "/frontend-perfumeria/images/perfumes/bleu-de-chanel.png");
    setFormPrecio30(perfume.presentaciones.find((p) => p.mililitros === 30)?.precio || 120);
    setFormPrecio50(perfume.presentaciones.find((p) => p.mililitros === 50)?.precio || 180);
    setFormPrecio100(perfume.presentaciones.find((p) => p.mililitros === 100)?.precio || 280);
    setFormNotasSalida([...perfume.notas.salida]);
    setFormNotasFondo([...perfume.notas.fondo]);
    setModalAbierto(true);
  };

  const handleSubirArchivoImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notificar("Error: La imagen no debe superar los 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormImagenUrl(reader.result);
          notificar("Imagen cargada en previsualización.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardarPerfume = (e: React.FormEvent) => {
    e.preventDefault();
    const nombreLimpio = sanitizeTexto(formNombre, LIMITES_SISTEMA.MAX_LONGITUD_TEXTO);
    const inspiracionLimpia = sanitizeTexto(formInspiracion, LIMITES_SISTEMA.MAX_LONGITUD_TEXTO);
    const marcaLimpia = sanitizeTexto(formMarca, LIMITES_SISTEMA.MAX_LONGITUD_TEXTO);

    if (!nombreLimpio || !inspiracionLimpia) {
      notificar("Nombre e inspiración son obligatorios.");
      return;
    }

    const p30 = sanitizePrecio(formPrecio30);
    const p50 = sanitizePrecio(formPrecio50);
    const p100 = sanitizePrecio(formPrecio100);

    const pres: Presentacion[] = [
      { id: `p-${Date.now()}-30`, mililitros: 30, precio: p30 },
      { id: `p-${Date.now()}-50`, mililitros: 50, precio: p50 },
      { id: `p-${Date.now()}-100`, mililitros: 100, precio: p100 },
    ];

    if (perfumeEnEdicion) {
      const perfumeActualizado: Perfume = {
        ...perfumeEnEdicion,
        nombre: nombreLimpio,
        inspiracionEn: inspiracionLimpia,
        marcaReferencia: marcaLimpia,
        genero: formGenero,
        familiaOlfativa: sanitizeTexto(formFamilia, 50),
        imagenUrl: formImagenUrl,
        notas: {
          ...perfumeEnEdicion.notas,
          salida: formNotasSalida.map((n) => sanitizeTexto(n, 40)),
          fondo: formNotasFondo.map((n) => sanitizeTexto(n, 40)),
        },
        presentaciones: pres,
      };

      setPerfumes((prev) =>
        prev.map((p) => (p.id === perfumeEnEdicion.id ? perfumeActualizado : p))
      );
      guardarPerfumeEnSupabase(perfumeActualizado);
      notificar(`Fragancia "${nombreLimpio}" actualizada en el catálogo.`);
    } else {
      const nuevoId = `perf-${Date.now()}`;
      const nuevo: Perfume = {
        id: nuevoId,
        nombre: nombreLimpio,
        inspiracionEn: inspiracionLimpia,
        marcaReferencia: marcaLimpia,
        genero: formGenero,
        familiaOlfativa: sanitizeTexto(formFamilia, 50),
        estela: "Pesada · +12h",
        descripcion: `Fórmula artesanal inspirada en ${inspiracionLimpia} de ${marcaLimpia}.`,
        imagenUrl: formImagenUrl,
        destacado: false,
        notas: {
          salida: formNotasSalida.map((n) => sanitizeTexto(n, 40)),
          corazon: ["Acorde Floral Artesanal"],
          fondo: formNotasFondo.map((n) => sanitizeTexto(n, 40)),
        },
        presentaciones: pres,
      };

      setPerfumes((prev) => [nuevo, ...prev]);
      guardarPerfumeEnSupabase(nuevo);

      setEstanteDisponibilidad((prev) => ({
        ...prev,
        [nuevoId]: { "suc-1": true, "suc-2": true, "suc-3": true },
      }));

      notificar(`Nueva fragancia "${nombreLimpio}" incorporada al catálogo maestro.`);
    }

    setModalAbierto(false);
  };

  const handleEliminarPerfume = (id: string, nombre: string) => {
    if (usuarioSesion?.rol === "vendedor") {
      notificar("Acceso denegado: Los vendedores no pueden eliminar fragancias.");
      return;
    }
    if (confirm(`¿Estás seguro de retirar "${nombre}" del catálogo comercial?`)) {
      setPerfumes((prev) => prev.filter((p) => p.id !== id));
      eliminarPerfumeEnSupabase(id);
      notificar(`Fragancia "${nombre}" eliminada.`);
    }
  };

  // Creación de Usuario (RBAC)
  const handleCrearUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    const nombreLimpio = sanitizeTexto(formUsuarioNombre, 60);
    const emailLimpio = sanitizeTexto(formUsuarioEmail, 80).toLowerCase();

    if (!nombreLimpio || !emailLimpio.includes("@")) {
      notificar("Nombre y correo válido requeridos.");
      return;
    }

    const nuevoUsr: UsuarioSistema = {
      id: `usr-${Date.now()}`,
      nombre: nombreLimpio,
      email: emailLimpio,
      rol: formUsuarioRol,
      sucursalId: formUsuarioRol === "superadmin" ? undefined : formUsuarioSucursal,
      activo: true,
      ultimoAcceso: "Pendiente primer ingreso",
      creadoEn: new Date().toISOString().split("T")[0],
    };

    setUsuarios((prev) => [nuevoUsr, ...prev]);
    guardarUsuarioEnSupabase(nuevoUsr);
    notificar(`Usuario "${nombreLimpio}" registrado con rol ${formUsuarioRol}.`);
    setModalUsuarioAbierto(false);
    setFormUsuarioNombre("");
    setFormUsuarioEmail("");
  };

  const handleToggleEstadoUsuario = (usuarioId: string) => {
    if (usuarioId === "usr-1") {
      notificar("No se puede desactivar la cuenta principal del Superadmin.");
      return;
    }
    const usr = usuarios.find((u) => u.id === usuarioId);
    if (!usr) return;
    const nuevoEstado = !usr.activo;

    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioId ? { ...u, activo: nuevoEstado } : u))
    );
    toggleEstadoUsuarioEnSupabase(usuarioId, nuevoEstado);
    notificar("Estado de cuenta actualizado.");
  };

  // Handlers para Gestor de Promociones Personalizables
  const handleAbrirCrearPromo = () => {
    setPromoEnEdicion(null);
    setFormPromoNombre("");
    setFormPromoDescripcion("");
    setFormPromoTipo("lleva_x_paga_y");
    setFormPromoFrascos(4);
    setFormPromoFrascosPaga(3);
    setFormPromoMililitros(50);
    setFormPromoPrecioCombo(420);
    setFormPromoDescuentoPorcentaje(50);
    setFormPromoAhorroEstimado(180);
    setFormPromoBadge("4x3 DE REGALO");
    setFormPromoActiva(true);
    setModalPromoAbierto(true);
  };

  const handleAbrirEditarPromo = (promo: ComboPromocion) => {
    setPromoEnEdicion(promo);
    setFormPromoNombre(promo.nombre);
    setFormPromoDescripcion(promo.descripcion);
    setFormPromoTipo(promo.tipo || "precio_fijo");
    setFormPromoFrascos(promo.cantidadFrascos);
    setFormPromoFrascosPaga(promo.cantidadPaga || (promo.cantidadFrascos - 1));
    setFormPromoMililitros(promo.mililitrosRequeridos);
    setFormPromoPrecioCombo(promo.precioCombo || 300);
    setFormPromoDescuentoPorcentaje(promo.descuentoPorcentaje || 50);
    setFormPromoAhorroEstimado(promo.ahorroEstimado || 0);
    setFormPromoBadge(promo.etiquetaBadge || "");
    setFormPromoActiva(promo.activa !== false);
    setModalPromoAbierto(true);
  };

  const handleTogglePromoActiva = (promoId: string) => {
    const promo = combos.find((p) => p.id === promoId);
    if (!promo) return;
    const nuevaActiva = !(promo.activa !== false);

    setCombos((prev) =>
      prev.map((p) => (p.id === promoId ? { ...p, activa: nuevaActiva } : p))
    );
    togglePromocionEnSupabase(promoId, nuevaActiva);
    window.dispatchEvent(new Event("latelier_promos_updated"));
    notificar(`Promoción "${promo.nombre}" ${nuevaActiva ? "activada" : "pausada"}.`);
  };

  const handleEliminarPromo = (promoId: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la promoción "${nombre}"?`)) {
      setCombos((prev) => prev.filter((p) => p.id !== promoId));
      eliminarPromocionEnSupabase(promoId);
      window.dispatchEvent(new Event("latelier_promos_updated"));
      notificar(`Promoción "${nombre}" eliminada.`);
    }
  };

  const handleGuardarPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const nombreLimpio = sanitizeTexto(formPromoNombre, 100);
    if (!nombreLimpio) {
      notificar("Por favor ingresa un nombre para la promoción.");
      return;
    }

    const promoData: ComboPromocion = {
      id: promoEnEdicion ? promoEnEdicion.id : `promo-${Date.now()}`,
      nombre: nombreLimpio,
      descripcion: sanitizeTexto(formPromoDescripcion, 250) || `Promoción especial en fragancias de ${formPromoMililitros || "mostrador"}ml.`,
      tipo: formPromoTipo,
      cantidadFrascos: Math.max(1, formPromoFrascos),
      cantidadPaga: formPromoTipo === "lleva_x_paga_y" ? Math.max(1, formPromoFrascosPaga) : undefined,
      descuentoPorcentaje: (formPromoTipo === "segundo_descuento" || formPromoTipo === "descuento_porcentaje") ? formPromoDescuentoPorcentaje : undefined,
      mililitrosRequeridos: formPromoMililitros,
      precioCombo: formPromoTipo === "precio_fijo" ? formPromoPrecioCombo : undefined,
      ahorroEstimado: formPromoAhorroEstimado,
      activa: formPromoActiva,
      etiquetaBadge: formPromoBadge.trim() || undefined,
    };

    if (promoEnEdicion) {
      setCombos((prev) => prev.map((p) => (p.id === promoEnEdicion.id ? promoData : p)));
      notificar(`Promoción "${nombreLimpio}" actualizada.`);
    } else {
      setCombos((prev) => [promoData, ...prev]);
      notificar(`Nueva promoción "${nombreLimpio}" creada con éxito.`);
    }

    guardarPromocionEnSupabase(promoData);
    window.dispatchEvent(new Event("latelier_promos_updated"));
    setModalPromoAbierto(false);
  };

  // Handlers para Tickets de Mostrador y Formulación en Vivo
  const handleIniciarFormulacion = (ticket: TicketPedido) => {
    setTicketEnFormulacion(ticket);
    setIndiceFrascoActual(0);
    setModalFormulacionAbierto(true);
  };

  const handleCompletarFormulacion = () => {
    if (!ticketEnFormulacion) return;

    const consumo = calcularConsumoTotalPedido(ticketEnFormulacion.items);
    const sedeId = ticketEnFormulacion.sucursalId;

    // Descontar materias primas
    setMateriaPrimaSedes((prev) => {
      const actual = prev[sedeId] || TANQUE_BASE_VACIO;
      const nuevasEsencias = { ...actual.esenciasMadreMl };

      Object.entries(consumo.esenciasPorPerfume).forEach(([perfumeId, data]) => {
        const actualMl = nuevasEsencias[perfumeId] ?? 400;
        nuevasEsencias[perfumeId] = Math.max(0, actualMl - data.mlTotal);
      });

      const actualizada: MateriaPrimaSede = {
        ...actual,
        alcoholMl: Math.max(0, actual.alcoholMl - consumo.alcoholTotalMl),
        fijadorMl: Math.max(0, actual.fijadorMl - consumo.fijadorTotalMl),
        feromonasMl: Math.max(0, actual.feromonasMl - consumo.feromonasTotalMl),
        frascos30ml: Math.max(0, actual.frascos30ml - consumo.frascos30ml),
        frascos50ml: Math.max(0, actual.frascos50ml - consumo.frascos50ml),
        frascos100ml: Math.max(0, actual.frascos100ml - consumo.frascos100ml),
        bolsasConLogo: Math.max(0, actual.bolsasConLogo - 1),
        esenciasMadreMl: nuevasEsencias,
      };

      // Guardar en Supabase Cloud
      actualizarMateriaPrimaSede(sedeId, actualizada);

      return {
        ...prev,
        [sedeId]: actualizada,
      };
    });

    // Sincronizar envases en insumosSede
    setInsumosSede((prev) => {
      const actual = prev[sedeId] || { frascos30ml: 0, frascos50ml: 0, frascos100ml: 0, bolsasConLogo: 0 };
      return {
        ...prev,
        [sedeId]: {
          frascos30ml: Math.max(0, actual.frascos30ml - consumo.frascos30ml),
          frascos50ml: Math.max(0, actual.frascos50ml - consumo.frascos50ml),
          frascos100ml: Math.max(0, actual.frascos100ml - consumo.frascos100ml),
          bolsasConLogo: Math.max(0, actual.bolsasConLogo - 1),
        },
      };
    });

    // Actualizar estado del ticket en Supabase Cloud
    const atendido = usuarioSesion ? `${usuarioSesion.nombre} (${usuarioSesion.rol})` : "Perfumista en Mostrador";
    const fechaComp = new Date().toISOString();

    setTicketsPedidos((prev) =>
      prev.map((t) =>
        t.id === ticketEnFormulacion.id
          ? { ...t, estado: "completado" as const, atendidoPor: atendido, fechaCompletado: fechaComp }
          : t
      )
    );

    actualizarEstadoOrdenRetiro(ticketEnFormulacion.id, "completado", atendido);

    notificar(`¡Pedido ${ticketEnFormulacion.codigoTicket} formulado y entregado con éxito!`);
    setModalFormulacionAbierto(false);
  };

  const handleCancelarTicket = (id: string, codigo: string) => {
    if (confirm(`¿Deseas cancelar el ticket ${codigo}? La reserva de insumos será liberada.`)) {
      setTicketsPedidos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, estado: "cancelado" as const } : t))
      );
      actualizarEstadoOrdenRetiro(id, "cancelado");
      notificar(`Ticket ${codigo} cancelado.`);
    }
  };

  const handleRecargarMateriaPrima = (e: React.FormEvent) => {
    e.preventDefault();
    const sedeId = sucursalFiltroGlobal === "todas" ? "suc-1" : sucursalFiltroGlobal;
    const cantidad = Math.max(10, formRecargaCantidadMl);

    setMateriaPrimaSedes((prev) => {
      const actual = prev[sedeId] || TANQUE_BASE_VACIO;
      let actualizada: MateriaPrimaSede = { ...actual };

      if (formRecargaTipo === "alcohol") {
        actualizada = { ...actual, alcoholMl: actual.alcoholMl + cantidad };
      } else if (formRecargaTipo === "fijador") {
        actualizada = { ...actual, fijadorMl: actual.fijadorMl + cantidad };
      } else if (formRecargaTipo === "feromonas") {
        actualizada = { ...actual, feromonasMl: actual.feromonasMl + cantidad };
      } else if (formRecargaTipo === "esencia") {
        actualizada = {
          ...actual,
          esenciasMadreMl: {
            ...actual.esenciasMadreMl,
            [formRecargaPerfumeId]: (actual.esenciasMadreMl[formRecargaPerfumeId] ?? 0) + cantidad,
          },
        };
      }

      actualizarMateriaPrimaSede(sedeId, actualizada);
      return { ...prev, [sedeId]: actualizada };
    });

    notificar(`Se añadieron ${cantidad} ml al stock de materia prima.`);
    setModalRecargaMateriaPrimaAbierto(false);
  };

  const sucursalSeleccionadaObj = sucursales.find((s) => s.id === sucursalFiltroGlobal);

  return (
    <div className="h-screen overflow-hidden bg-[#080C14] text-[#E2E8F0] flex flex-col lg:flex-row font-sans selection:bg-white/20">
      
      {/* Toast de Notificaciones */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#0F172A] border border-white/20 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-mono backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          BARRA LATERAL (OPERATIONAL SIDEBAR)
      ========================================================================= */}
      <aside className="hidden lg:flex w-64 bg-[#0A0F1D] border-r border-white/[0.06] flex-col justify-between shrink-0 h-full overflow-y-auto">
        
        <div className="p-5 space-y-6">
          {/* Cabecera / Identidad */}
          <div className="pb-4 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="font-serif tracking-widest text-lg font-semibold text-white">
                L&apos;ATELIER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Seguro
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#64748B] block mt-1">
              Consola Operativa Multisede
            </span>
          </div>

          {/* Selector de Sede Operativa (Bloqueado si es encargado_sede) */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1.5 font-semibold">
              Boutique Activa
            </label>
            <select
              value={sucursalFiltroGlobal}
              disabled={usuarioSesion?.rol === "encargado_sede"}
              onChange={(e) => {
                setSucursalFiltroGlobal(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full bg-[#0E1528] border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-hidden focus:border-white/30 cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {usuarioSesion?.rol !== "encargado_sede" && (
                <option value="todas">Todas las Sedes (Consolidado)</option>
              )}
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.ciudad})
                </option>
              ))}
            </select>
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="space-y-4">
            <div>
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1 font-semibold">
                Navegación
              </span>
              <div className="space-y-0.5">
                
                {/* 1. Dashboard */}
                <button
                  onClick={() => setTabActiva("dashboard")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tabActiva === "dashboard"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-[#94A3B8]" />
                    <span>Dashboard</span>
                  </div>
                </button>

                {/* 2. Tickets & Pedidos en Mostrador (Validez 24h) */}
                <button
                  onClick={() => setTabActiva("pedidos")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tabActiva === "pedidos"
                      ? "bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlaskConical className="w-4 h-4 text-amber-400" />
                    <span>Tickets &amp; Mostrador</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {ticketsPedidos.filter((t) => t.estado === "pendiente").length}
                  </span>
                </button>

                {/* 2. Catálogo Maestro */}
                <button
                  onClick={() => setTabActiva("catalogo")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tabActiva === "catalogo"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-[#94A3B8]" />
                    <span>Catálogo Maestro</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">{perfumes.length}</span>
                </button>

                {/* 3. Combos & Promociones */}
                <button
                  onClick={() => setTabActiva("combos")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tabActiva === "combos"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-[#94A3B8]" />
                    <span>Combos &amp; Promociones</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">{combos.length}</span>
                </button>

                {/* 4. Sedes & Ubicaciones */}
                <button
                  onClick={() => setTabActiva("sucursales")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tabActiva === "sucursales"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#94A3B8]" />
                    <span>Sedes &amp; Ubicaciones</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">3</span>
                </button>

                {/* 5. Usuarios & Seguridad (RBAC) */}
                <button
                  onClick={() => setTabActiva("usuarios")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tabActiva === "usuarios"
                      ? "bg-white/10 text-white font-semibold"
                      : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Usuarios &amp; Permisos</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">{usuarios.length}</span>
                </button>

              </div>
            </div>
          </nav>
        </div>

        {/* Pie del Sidebar: Usuario Autenticado & Logout */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#CBD5E1] hover:text-white flex items-center justify-between transition-colors"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#94A3B8]" />
          </Link>

          {/* Tarjeta de Sesión Activa */}
          <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-xs font-semibold text-white block truncate">
                {usuarioSesion?.nombre || "Alejandro Morales"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block truncate uppercase">
                {usuarioSesion?.rol || "superadmin"}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              title="Cerrar sesión e invalidar JWT"
              className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* =========================================================================
          ÁREA CENTRAL DE TRABAJO (WORKSPACE)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-14 border-b border-white/[0.06] bg-[#0A0F1D]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="lg:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Menú Operativo"
            >
              {menuMovilAbierto ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#94A3B8] font-mono">
                Consola /
              </span>
              <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                {tabActiva}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón Rápido de Escáner QR de Mostrador */}
            <button
              type="button"
              onClick={() => setModalEscanerQR(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Abrir Escáner de Tickets y Proformas QR"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Escanear QR</span>
            </button>

            {sucursalSeleccionadaObj ? (
              <span className="text-xs font-mono text-[#94A3B8] bg-white/5 px-2.5 py-1 rounded-md border border-white/10 hidden sm:inline">
                Sede: <strong className="text-white">{sucursalSeleccionadaObj.nombre}</strong>
              </span>
            ) : (
              <span className="text-xs font-mono text-[#94A3B8] bg-white/5 px-2.5 py-1 rounded-md border border-white/10 hidden sm:inline">
                Red Nacional (3 Boutiques)
              </span>
            )}

            <button
              onClick={handleLogout}
              className="text-xs font-mono text-[#94A3B8] hover:text-red-400 flex items-center gap-1 py-1 px-2 rounded hover:bg-white/5 transition-colors cursor-pointer lg:hidden"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>

        </header>

        {/* Drawer Móvil Lateral Completo */}
        <AnimatePresence>
          {menuMovilAbierto && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuMovilAbierto(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative w-72 max-w-[85vw] h-full bg-[#0A0F1D] border-r border-white/10 flex flex-col justify-between p-5 z-10 shadow-2xl overflow-y-auto"
              >
                <div className="space-y-6">
                  {/* Cabecera Drawer */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div>
                      <span className="font-serif tracking-widest text-lg font-semibold text-white block">
                        L&apos;ATELIER
                      </span>
                      <span className="text-[11px] font-mono text-[#64748B]">
                        Consola Multisede
                      </span>
                    </div>
                    <button
                      onClick={() => setMenuMovilAbierto(false)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sede selector móvil */}
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] block mb-1.5 font-semibold">
                      Boutique Activa
                    </label>
                    <select
                      value={sucursalFiltroGlobal}
                      disabled={usuarioSesion?.rol === "encargado_sede"}
                      onChange={(e) => {
                        setSucursalFiltroGlobal(e.target.value);
                        setPaginaActual(1);
                        setMenuMovilAbierto(false);
                      }}
                      className="w-full bg-[#0E1528] border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-hidden focus:border-white/30 cursor-pointer disabled:opacity-60"
                    >
                      {usuarioSesion?.rol !== "encargado_sede" && (
                        <option value="todas">Todas las Sedes</option>
                      )}
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.ciudad})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pestañas de Navegación */}
                  <nav className="space-y-1">
                    {[
                      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                      { id: "pedidos", label: "Tickets Mostrador", icon: FlaskConical, count: ticketsPedidos.filter((t) => t.estado === "pendiente").length },
                      { id: "catalogo", label: "Catálogo Fragancias", icon: Package, count: perfumes.length },
                      { id: "combos", label: "Promociones & Combos", icon: Tag, count: combos.length },
                      { id: "sucursales", label: "Boutiques & Ateliers", icon: MapPin, count: sucursales.length },
                      { id: "usuarios", label: "Personal & Permisos", icon: ShieldCheck, count: usuarios.length },
                    ].map((item) => {
                      const Icon = item.icon;
                      const esActivo = tabActiva === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setTabActiva(item.id as AdminTab);
                            setMenuMovilAbierto(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            esActivo
                              ? "bg-white/10 text-white font-semibold"
                              : "text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${esActivo ? "text-white" : "text-[#64748B]"}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.count !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-white">
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Pie del Drawer */}
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-xs font-semibold text-white block truncate">
                        {usuarioSesion?.nombre || "Alejandro Morales"}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 block truncate uppercase">
                        {usuarioSesion?.rol || "superadmin"}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      title="Cerrar sesión"
                      className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Barra de Navegación Rápida en Móviles */}
        <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#080C14] overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "pedidos", label: "Tickets (24h)", count: ticketsPedidos.filter((t) => t.estado === "pendiente").length },
            { id: "catalogo", label: "Catálogo", count: perfumes.length },
            { id: "combos", label: "Combos" },
            { id: "sucursales", label: "Sedes" },
            { id: "usuarios", label: "Usuarios" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTabActiva(item.id as AdminTab);
                setMenuMovilAbierto(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                tabActiva === item.id
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-white/[0.04] text-[#94A3B8] hover:text-white border border-white/[0.06]"
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  tabActiva === item.id ? "bg-black/15 text-black" : "bg-white/10 text-white"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido Dinámico */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-6">
          
          {/* =====================================================================
              VISTA 1: DASHBOARD
          ===================================================================== */}
          {tabActiva === "dashboard" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
                <div>
                  <h1 className="font-serif text-2xl font-normal text-white">
                    Dashboard Operativo
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {sucursalSeleccionadaObj
                      ? `Monitoreo de estantería e insumos para ${sucursalSeleccionadaObj.nombre} (${sucursalSeleccionadaObj.ciudad}).`
                      : "Métricas consolidadas de las 3 boutiques en Santa Cruz: Equipetrol, Las Brisas y Urubó."}
                  </p>
                </div>
              </div>

              {/* 4 Tarjetas de Métricas Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-4 bg-[#0E1424] rounded-xl border border-white/[0.06]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Fragancias en Catálogo
                  </span>
                  <div className="font-mono text-2xl font-bold text-white tracking-tight">
                    {metricas.totalFragancias}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                    {metricas.fraganciasEnEstante} disponibles en estante
                  </span>
                </div>

                <div className="p-4 bg-[#0E1424] rounded-xl border border-white/[0.06]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Alertas de Estantería
                  </span>
                  <div className="font-mono text-2xl font-bold text-white tracking-tight">
                    {metricas.fraganciasAgotadas}
                  </div>
                  <span className="text-[11px] text-amber-400 mt-1 block font-mono">
                    {metricas.fraganciasAgotadas === 0 ? "Estantería 100% abastecida" : "Botellas de esencia agotadas"}
                  </span>
                </div>

                <div className="p-4 bg-[#0E1424] rounded-xl border border-white/[0.06]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Frascos de Cristal Vacíos
                  </span>
                  <div className="font-mono text-2xl font-bold text-white tracking-tight">
                    {metricas.totalEnvasesVacios} <span className="text-xs text-[#94A3B8] font-normal">uds</span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] mt-1 block font-mono">
                    30ml: {metricas.envasesTotales30} · 50ml: {metricas.envasesTotales50} · 100ml: {metricas.envasesTotales100}
                  </span>
                </div>

                <div className="p-4 bg-[#0E1424] rounded-xl border border-white/[0.06]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Bolsas con Logo
                  </span>
                  <div className="font-mono text-2xl font-bold text-white tracking-tight">
                    {metricas.bolsasTotales} <span className="text-xs text-[#94A3B8] font-normal">uds</span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] mt-1 block font-mono">
                    Para entrega individual y combos
                  </span>
                </div>

              </div>

              {/* Paneles de Control de Estantería y Acceso Rápido */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-[#0E1424] rounded-xl border border-white/[0.06] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Estado de Estantería por Boutique</h3>
                      <p className="text-xs text-[#94A3B8]">Disponibilidad de botellas madre en cada tienda</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {sucursales.map((s) => {
                      const disponibles = perfumes.filter((p) => estanteDisponibilidad[p.id]?.[s.id]).length;
                      const ins = insumosSede[s.id] || { frascos30ml: 0, frascos50ml: 0, frascos100ml: 0, bolsasConLogo: 0 };
                      const totalEnvases = ins.frascos30ml + ins.frascos50ml + ins.frascos100ml;

                      return (
                        <div
                          key={s.id}
                          className="p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <span className="text-xs font-semibold text-white block">{s.nombre}</span>
                            <span className="text-[11px] text-[#64748B] font-mono block">{s.ciudad} · {s.direccion}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-400 block">
                                {disponibles}/{perfumes.length} en estante
                              </span>
                              <span className="text-[10px] font-mono text-[#94A3B8]">
                                {totalEnvases} frascos vacíos
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setSucursalFiltroGlobal(s.id);
                                setTabActiva("catalogo");
                              }}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-white transition-colors cursor-pointer border border-white/10"
                            >
                              Ver Estante →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#0E1424] rounded-xl border border-white/[0.06] p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">Seguridad &amp; Privilegios (RBAC)</h3>
                    <p className="text-xs text-[#94A3B8]">
                      Sesión activa bajo protocolo criptográfico HMAC-SHA256 con protección de cookies HttpOnly.
                    </p>

                    <div className="p-3.5 bg-[#080C14] border border-white/10 rounded-lg space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Usuario Conectado:</span>
                        <span className="text-white font-bold">{usuarioSesion?.email || "admin@latelier.com"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Nivel de Rol:</span>
                        <span className="text-emerald-400 font-bold uppercase">{usuarioSesion?.rol || "superadmin"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Caducidad de Sesión:</span>
                        <span className="text-[#CBD5E1]">24 horas (renovación segura)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setTabActiva("usuarios")}
                      className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Gestionar Cuentas y Permisos</span>
                    </button>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#64748B] font-mono">
                    <span>L&apos;Atelier Haute Parfumerie</span>
                    <span>Consola Segura</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =====================================================================
              VISTA: TICKETS & PEDIDOS EN MOSTRADOR (VALIDEZ 24H)
          ===================================================================== */}
          {tabActiva === "pedidos" && (
            <TicketsManagerTab
              tickets={ticketsPedidos}
              materiaPrimaSedes={materiaPrimaSedes}
              sucursalSeleccionadaId={sucursalFiltroGlobal}
              sucursales={sucursales}
              perfumes={perfumes}
              onIniciarFormulacion={handleIniciarFormulacion}
              onCancelarTicket={handleCancelarTicket}
              onAbrirRecargaMateriaPrima={() => setModalRecargaMateriaPrimaAbierto(true)}
              onAbrirEscanerQR={() => setModalEscanerQR(true)}
            />
          )}

          {/* =====================================================================
              VISTA 2: CATÁLOGO MAESTRO & ESTANTERÍA
          ===================================================================== */}
          {tabActiva === "catalogo" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div>
                  <h1 className="font-serif text-2xl font-normal text-white">
                    Catálogo de Fragancias &amp; Disponibilidad
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {sucursalSeleccionadaObj
                      ? `Gestionando estantería de: ${sucursalSeleccionadaObj.nombre} (${sucursalSeleccionadaObj.ciudad}).`
                      : "Catálogo general nacional. Selecciona una boutique para alternar botellas agotadas."}
                  </p>
                </div>

                <button
                  onClick={abrirNuevoPerfume}
                  className="px-3.5 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nueva Fragancia</span>
                </button>
              </div>

              {/* Fila de Insumos de Mostrador */}
              {sucursalSeleccionadaObj && (
                <div className="p-4 bg-[#0E1528] rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Insumos de Mostrador en {sucursalSeleccionadaObj.nombre}:
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">Envases vacíos listos para preparación</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#94A3B8] block">Frascos 30ml</span>
                        <span className="text-base font-mono font-bold text-white">
                          {insumosSede[sucursalSeleccionadaObj.id]?.frascos30ml ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "frascos30ml", -5)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "frascos30ml", 5)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#94A3B8] block">Frascos 50ml</span>
                        <span className="text-base font-mono font-bold text-white">
                          {insumosSede[sucursalSeleccionadaObj.id]?.frascos50ml ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "frascos50ml", -5)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "frascos50ml", 5)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#94A3B8] block">Frascos 100ml</span>
                        <span className="text-base font-mono font-bold text-white">
                          {insumosSede[sucursalSeleccionadaObj.id]?.frascos100ml ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "frascos100ml", -5)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "frascos100ml", 5)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.04] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#94A3B8] block">Bolsas con Logo</span>
                        <span className="text-base font-mono font-bold text-white">
                          {insumosSede[sucursalSeleccionadaObj.id]?.bolsasConLogo ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "bolsasConLogo", -10)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => ajustarInsumo(sucursalSeleccionadaObj.id, "bolsasConLogo", 10)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-mono text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Barra de Búsqueda y Filtros */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0E1424] p-3 rounded-xl border border-white/[0.06]">
                
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setPaginaActual(1);
                    }}
                    placeholder="Buscar por fragancia, inspiración dupe (Sauvage, Baccarat, etc.) o familia..."
                    className="w-full pl-9 pr-4 py-2 bg-[#080C14] border border-white/10 rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-hidden focus:border-white/30"
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <div className="flex items-center bg-[#080C14] rounded-lg p-1 border border-white/10 shrink-0">
                    {["todos", "unisex", "masculino", "femenino"].map((gen) => (
                      <button
                        key={gen}
                        onClick={() => {
                          setFiltroGenero(gen);
                          setPaginaActual(1);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                          filtroGenero === gen
                            ? "bg-white text-black font-semibold"
                            : "text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {gen === "todos" ? "Todos" : gen.slice(0, 3)}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center bg-[#080C14] rounded-lg p-1 border border-white/10 shrink-0">
                    {[
                      { id: "todas", label: "Todas" },
                      { id: "disponibles", label: "En Estante" },
                      { id: "agotadas", label: "Agotadas" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setFiltroDisponibilidad(d.id);
                          setPaginaActual(1);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          filtroDisponibilidad === d.id
                            ? "bg-white/20 text-white font-semibold"
                            : "text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Tabla del Catálogo Maestro */}
              <div className="bg-[#0E1424] rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[#64748B] font-mono uppercase tracking-wider text-[11px] bg-white/[0.01]">
                        <th className="py-3 px-4">Foto / SKU</th>
                        <th className="py-3 px-4">Fragancia &amp; Dupe Original</th>
                        <th className="py-3 px-4">Género &amp; Familia</th>
                        <th className="py-3 px-4">Pirámide</th>
                        <th className="py-3 px-4">Precios (30 · 50 · 100ml)</th>
                        <th className="py-3 px-4 text-center">
                          {sucursalSeleccionadaObj
                            ? `Estantería (${sucursalSeleccionadaObj.ciudad})`
                            : "Estantería (3 Sedes)"}
                        </th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {perfumesPaginados.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-[#64748B]">
                            No se encontraron fragancias con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        perfumesPaginados.map((p, idx) => {
                          const sku = `LAT-${p.genero[0].toUpperCase()}-${String(indexInicio + idx + 1).padStart(2, "0")}`;
                          const p30 = p.presentaciones.find((x) => x.mililitros === 30)?.precio ?? 120;
                          const p50 = p.presentaciones.find((x) => x.mililitros === 50)?.precio ?? 180;
                          const p100 = p.presentaciones.find((x) => x.mililitros === 100)?.precio ?? 280;

                          return (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 rounded-lg bg-[#080C14] border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center p-0.5">
                                    <Image
                                      src={p.imagenUrl || "/frontend-perfumeria/images/perfumes/bleu-de-chanel.png"}
                                      alt={p.nombre}
                                      width={40}
                                      height={40}
                                      className="object-contain w-full h-full"
                                    />
                                  </div>
                                  <div>
                                    <span className="font-mono text-[11px] text-[#64748B] block">{sku}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-semibold text-white block text-sm">{p.nombre}</span>
                                <span className="text-[11px] text-[#C5A880] uppercase tracking-wider block font-medium">
                                  {p.marcaReferencia}
                                </span>
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="text-white block">{p.familiaOlfativa}</span>
                                <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                                  {p.genero}
                                </span>
                              </td>

                              <td className="py-3 px-4 max-w-[200px] truncate text-[#94A3B8] text-[11px]">
                                <div><strong className="text-white/80">Sal:</strong> {p.notas.salida.slice(0, 2).join(", ")}</div>
                                <div><strong className="text-white/80">Fon:</strong> {p.notas.fondo.slice(0, 2).join(", ")}</div>
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                                <span className="text-[#94A3B8]">{p30} Bs</span>
                                <span className="text-white font-bold mx-1.5">{p50} Bs</span>
                                <span className="text-[#94A3B8]">{p100} Bs</span>
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                {sucursalSeleccionadaObj ? (
                                  (() => {
                                    const disponible = estanteDisponibilidad[p.id]?.[sucursalSeleccionadaObj.id] ?? true;
                                    return (
                                      <button
                                        onClick={() => toggleDisponibilidadEstante(p.id, sucursalSeleccionadaObj.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                                          disponible
                                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                                            : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30"
                                        }`}
                                      >
                                        {disponible ? "En Estante" : "Agotada"}
                                      </button>
                                    );
                                  })()
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    {sucursales.map((s) => {
                                      const disp = estanteDisponibilidad[p.id]?.[s.id] ?? true;
                                      const etiqueta = s.nombre.includes("Equipetrol") ? "EQP" : s.nombre.includes("Brisas") ? "BRS" : "URB";
                                      return (
                                        <button
                                          key={s.id}
                                          onClick={() => toggleDisponibilidadEstante(p.id, s.id)}
                                          title={`${s.nombre}: ${disp ? "Disponible" : "Agotada"} (Clic para cambiar)`}
                                          className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                            disp
                                              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
                                              : "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 line-through"
                                          }`}
                                        >
                                          {etiqueta}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => abrirEditarPerfume(p)}
                                    className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded cursor-pointer transition-colors"
                                    title="Editar Ficha Técnica & Foto"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleEliminarPerfume(p.id, p.nombre)}
                                    className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer transition-colors"
                                    title="Eliminar Fragancia"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Barra de Paginación */}
                <div className="p-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#94A3B8]">
                  
                  <div className="flex items-center gap-3">
                    <span>
                      Mostrando {perfumesFiltrados.length === 0 ? 0 : indexInicio + 1} a{" "}
                      {Math.min(indexInicio + itemsPorPagina, perfumesFiltrados.length)} de{" "}
                      <strong className="text-white">{perfumesFiltrados.length}</strong> fragancias
                    </span>

                    <select
                      value={itemsPorPagina}
                      onChange={(e) => {
                        setItemsPorPagina(Number(e.target.value));
                        setPaginaActual(1);
                      }}
                      className="bg-[#080C14] border border-white/10 rounded px-2 py-1 text-white text-xs cursor-pointer"
                    >
                      <option value={10}>10 por pág</option>
                      <option value={25}>25 por pág</option>
                      <option value={50}>50 por pág</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                      disabled={paginaActual === 1}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setPaginaActual(num)}
                        className={`w-7 h-7 rounded text-xs font-mono transition-colors cursor-pointer ${
                          paginaActual === num
                            ? "bg-white text-black font-bold"
                            : "bg-white/5 text-[#94A3B8] hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =====================================================================
              VISTA 3: GESTOR DE PROMOCIONES & OFERTAS PERSONALIZABLES
          ===================================================================== */}
          {tabActiva === "combos" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div>
                  <h1 className="font-serif text-2xl font-normal text-white">
                    Gestor de Promociones &amp; Ofertas
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Crea y personaliza ofertas como 4x3 (el 4to gratis), 2do al 50%, packs a precio fijo o descuentos por volumen.
                  </p>
                </div>

                <button
                  onClick={handleAbrirCrearPromo}
                  className="px-4 py-2.5 bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm rounded-none self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nueva Promoción</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {combos.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl border p-6 space-y-4 relative transition-all ${
                      c.activa !== false
                        ? "bg-[#0E1424] border-white/[0.08]"
                        : "bg-[#0A0E18] border-white/[0.04] opacity-70"
                    }`}
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A880] font-bold bg-[#C5A880]/10 px-2.5 py-1 rounded-none border border-[#C5A880]/20">
                        {c.tipo === "lleva_x_paga_y"
                          ? `LLEVA ${c.cantidadFrascos} PAGA ${c.cantidadPaga || c.cantidadFrascos - 1} · ${c.cantidadFrascos}º GRATIS`
                          : c.tipo === "segundo_descuento"
                          ? `2DO FRASCO AL ${c.descuentoPorcentaje || 50}% OFF`
                          : c.tipo === "descuento_porcentaje"
                          ? `${c.descuentoPorcentaje}% DE DESCUENTO`
                          : `${c.cantidadFrascos} x ${c.mililitrosRequeridos || 50}ML POR ${c.precioCombo} Bs`}
                      </span>

                      {/* Switch Activa / Pausada */}
                      <button
                        onClick={() => handleTogglePromoActiva(c.id)}
                        className={`px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider rounded-full border cursor-pointer transition-colors ${
                          c.activa !== false
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-white/5 text-[#94A3B8] border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {c.activa !== false ? "● ACTIVA" : "○ PAUSADA"}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white">{c.nombre}</h3>
                      <p className="text-xs text-[#94A3B8] mt-1">{c.descripcion}</p>
                    </div>

                    {/* Resumen de Condiciones */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-[#080C14] rounded-lg border border-white/5 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-[#64748B] block uppercase">Condición</span>
                        <strong className="text-white block mt-0.5">
                          {c.cantidadFrascos} frascos
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block uppercase">Presentación</span>
                        <strong className="text-[#C5A880] block mt-0.5">
                          {c.mililitrosRequeridos ? `${c.mililitrosRequeridos}ml` : "Cualquiera"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block uppercase">Beneficio</span>
                        <strong className="text-emerald-400 block mt-0.5">
                          {c.tipo === "lleva_x_paga_y"
                            ? "1 Gratis"
                            : c.tipo === "segundo_descuento"
                            ? `${c.descuentoPorcentaje || 50}% en 2do`
                            : c.precioCombo
                            ? `${c.precioCombo} Bs final`
                            : `${c.descuentoPorcentaje}% OFF`}
                        </strong>
                      </div>
                    </div>

                    {/* Footer de Acciones */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-mono text-[#64748B]">
                        Ahorro cliente: ~{c.ahorroEstimado || 0} Bs
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAbrirEditarPromo(c)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleEliminarPromo(c.id, c.nombre)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                          title="Eliminar promoción"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* =====================================================================
              VISTA 4: SEDES & GOOGLE MAPS REAL
          ===================================================================== */}
          {tabActiva === "sucursales" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
                <div>
                  <h1 className="font-serif text-2xl font-normal text-white">
                    Boutiques &amp; Ubicaciones Google Maps
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Configuración de contacto, WhatsApp de asesores y enlaces exactos a Google Maps.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {sucursales.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#0E1424] rounded-xl border border-white/[0.06] p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block">
                            SEDE {s.ciudad.toUpperCase()}
                          </span>
                          <h3 className="text-base font-semibold text-white">{s.nombre}</h3>
                        </div>
                        <MapPin className="w-4 h-4 text-emerald-400" />
                      </div>

                      {/* WhatsApp Asesor */}
                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                          WhatsApp Asesor (con prefijo)
                        </label>
                        <input
                          type="text"
                          value={s.whatsapp}
                          onChange={(e) => {
                            const val = sanitizeTexto(e.target.value, 20);
                            setSucursales((prev) =>
                              prev.map((item) => (item.id === s.id ? { ...item, whatsapp: val } : item))
                            );
                          }}
                          className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-white/30"
                        />
                      </div>

                      {/* Dirección física */}
                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                          Dirección Física
                        </label>
                        <input
                          type="text"
                          value={s.direccion}
                          onChange={(e) => {
                            const val = sanitizeTexto(e.target.value, 100);
                            setSucursales((prev) =>
                              prev.map((item) => (item.id === s.id ? { ...item, direccion: val } : item))
                            );
                          }}
                          className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white/30"
                        />
                      </div>

                      {/* Horario */}
                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                          Horario Comercial
                        </label>
                        <input
                          type="text"
                          value={s.horario}
                          onChange={(e) => {
                            const val = sanitizeTexto(e.target.value, 60);
                            setSucursales((prev) =>
                              prev.map((item) => (item.id === s.id ? { ...item, horario: val } : item))
                            );
                          }}
                          className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-white/30"
                        />
                      </div>

                      {/* Enlace Exacto de Google Maps */}
                      <div>
                        <label className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block mb-1 flex items-center justify-between">
                          <span>Link Directo Google Maps</span>
                          <Navigation className="w-3 h-3 text-emerald-400" />
                        </label>
                        <input
                          type="url"
                          value={s.mapsUrl || ""}
                          placeholder="https://maps.app.goo.gl/..."
                          onChange={(e) => {
                            const val = sanitizeTexto(e.target.value, 200);
                            setSucursales((prev) =>
                              prev.map((item) => (item.id === s.id ? { ...item, mapsUrl: val } : item))
                            );
                          }}
                          className="w-full bg-[#080C14] border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-hidden focus:border-emerald-400"
                        />
                        <span className="text-[10px] text-[#64748B] font-mono block mt-1">
                          Pega el enlace de compartir de Google Maps de la boutique.
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] space-y-2">
                      <a
                        href={s.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.direccion + ", " + s.ciudad)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Abrir y Verificar en Google Maps</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                      </a>

                      <button
                        onClick={() => notificar(`Datos de ${s.nombre} guardados exitosamente.`)}
                        className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-white" />
                        <span>Guardar Cambios</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* =====================================================================
              VISTA 5: USUARIOS & CONTROL DE ACCESOS (RBAC)
          ===================================================================== */}
          {tabActiva === "usuarios" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div>
                  <h1 className="font-serif text-2xl font-normal text-white">
                    Usuarios &amp; Control de Accesos (RBAC)
                  </h1>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Administración de credenciales corporativas, asignación de roles y privilegios por sede.
                  </p>
                </div>

                {usuarioSesion?.rol === "superadmin" && (
                  <button
                    onClick={() => setModalUsuarioAbierto(true)}
                    className="px-3.5 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>Nuevo Usuario</span>
                  </button>
                )}
              </div>

              {/* Matriz de Roles y Privilegios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0E1424] rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase">Superadmin</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Control total nacional: edición de catálogo maestro, gestión de precios, creación de usuarios y auditoría.
                  </p>
                </div>

                <div className="p-4 bg-[#0E1424] rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase">Encargado de Sede</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Acceso limitado a su boutique: ajusta disponibilidad de estante y frascos vacíos de su propia ciudad.
                  </p>
                </div>

                <div className="p-4 bg-[#0E1424] rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase">Vendedor / Cajero</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Consulta en mostrador: visualiza fórmulas y disponibilidad sin privilegios para alterar precios o usuarios.
                  </p>
                </div>
              </div>

              {/* Tabla de Usuarios Registrados */}
              <div className="bg-[#0E1424] rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] text-[#64748B] font-mono uppercase tracking-wider text-[11px] bg-white/[0.01]">
                        <th className="py-3 px-4">Usuario / Nombre</th>
                        <th className="py-3 px-4">Correo Corporativo</th>
                        <th className="py-3 px-4">Rol Asignado</th>
                        <th className="py-3 px-4">Boutique Autorizada</th>
                        <th className="py-3 px-4">Último Acceso</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {usuarios.map((usr) => {
                        const sedeObj = sucursales.find((s) => s.id === usr.sucursalId);
                        return (
                          <tr key={usr.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                              {usr.nombre}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[#94A3B8] whitespace-nowrap">
                              {usr.email}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  usr.rol === "superadmin"
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : usr.rol === "encargado_sede"
                                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                    : "bg-white/10 text-[#CBD5E1]"
                                }`}
                              >
                                {usr.rol.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[#CBD5E1] whitespace-nowrap">
                              {sedeObj ? `${sedeObj.nombre} (${sedeObj.ciudad})` : "Todas las Sedes (Nacional)"}
                            </td>
                            <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px] whitespace-nowrap">
                              {usr.ultimoAcceso || "Sin registro"}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                                  usr.activo
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${usr.activo ? "bg-emerald-400" : "bg-red-400"}`} />
                                {usr.activo ? "Activo" : "Suspendido"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {usr.id !== "usr-1" && usuarioSesion?.rol === "superadmin" ? (
                                <button
                                  onClick={() => handleToggleEstadoUsuario(usr.id)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                                    usr.activo
                                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                  }`}
                                >
                                  {usr.activo ? "Suspender" : "Reactivar"}
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono text-[#64748B]">Protegido</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* =========================================================================
          MODAL DE CREACIÓN / EDICIÓN DE FRAGANCIA
      ========================================================================= */}
      <AnimatePresence>
        {modalAbierto && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0F1D] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl text-xs"
            >
              
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {perfumeEnEdicion ? `Editar Fragancia: ${perfumeEnEdicion.nombre}` : "Alta de Nueva Fragancia"}
                  </h2>
                  <p className="text-[11px] text-[#94A3B8]">
                    Define la inspiración, el diseñador, las notas, los precios y la fotografía del frasco.
                  </p>
                </div>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGuardarPerfume} className="space-y-5">
                
                {/* 1. SECCIÓN DE IMAGEN / FOTOGRAFÍA CON PREVIEW */}
                <div className="p-4 bg-[#0E1528] rounded-xl border border-white/10 space-y-3">
                  <span className="text-xs font-semibold text-white block">
                    Fotografía del Frasco (Imagen Pública)
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-24 rounded-xl bg-[#080C14] border border-white/20 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner p-1">
                      {formImagenUrl ? (
                        <Image
                          src={formImagenUrl}
                          alt="Vista previa"
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="text-[10px] text-[#64748B]">Sin Foto</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2.5 w-full">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                          Subir imagen desde tu equipo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSubirArchivoImagen}
                          className="w-full text-xs text-[#94A3B8] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                          O pegar URL directa de imagen
                        </label>
                        <input
                          type="text"
                          value={formImagenUrl}
                          onChange={(e) => setFormImagenUrl(sanitizeTexto(e.target.value, 300))}
                          placeholder="https://... o /images/perfume-..."
                          className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-white/30"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#64748B] block mb-1">
                          Frascos estándar de la marca:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {FRASCOS_PRESET.map((fp) => (
                            <button
                              key={fp.url}
                              type="button"
                              onClick={() => setFormImagenUrl(fp.url)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                                formImagenUrl === fp.url
                                  ? "bg-white text-black font-semibold border-white"
                                  : "bg-white/5 text-[#94A3B8] hover:text-white border-white/10"
                              }`}
                            >
                              {fp.nombre}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DATOS DE IDENTIDAD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Nombre Propio de la Fragancia *
                    </label>
                    <input
                      type="text"
                      required
                      value={formNombre}
                      onChange={(e) => setFormNombre(e.target.value)}
                      placeholder="Ej: Rouge Sublime Nº 07"
                      className="w-full bg-[#0E1528] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Perfume de Inspiración (Dupe) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formInspiracion}
                      onChange={(e) => setFormInspiracion(e.target.value)}
                      placeholder="Ej: Baccarat Rouge 540"
                      className="w-full bg-[#0E1528] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Marca / Diseñador Original
                    </label>
                    <input
                      type="text"
                      value={formMarca}
                      onChange={(e) => setFormMarca(e.target.value)}
                      placeholder="Ej: Maison Francis Kurkdjian"
                      className="w-full bg-[#0E1528] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Género
                    </label>
                    <select
                      value={formGenero}
                      onChange={(e) => setFormGenero(e.target.value as Genero)}
                      className="w-full bg-[#0E1528] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-white/30"
                    >
                      <option value="unisex">Unisex</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Familia Olfativa
                    </label>
                    <input
                      type="text"
                      value={formFamilia}
                      onChange={(e) => setFormFamilia(e.target.value)}
                      placeholder="Ej: Ámbar Floral"
                      className="w-full bg-[#0E1528] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-white/30"
                    />
                  </div>
                </div>

                {/* 3. PRECIOS SEGMENTADOS */}
                <div className="p-4 bg-[#0E1528] rounded-xl border border-white/10 space-y-2">
                  <span className="text-xs font-semibold text-white block">Precios de Venta por Presentación</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-1">Frasco 30ml (Bs)</label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={formPrecio30}
                        onChange={(e) => setFormPrecio30(Number(e.target.value))}
                        className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-1.5 font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-1">Frasco 50ml (Bs)</label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={formPrecio50}
                        onChange={(e) => setFormPrecio50(Number(e.target.value))}
                        className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-1.5 font-mono text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[#94A3B8] uppercase block mb-1">Frasco 100ml (Bs)</label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={formPrecio100}
                        onChange={(e) => setFormPrecio100(Number(e.target.value))}
                        className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-1.5 font-mono text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. NOTAS OLFATIVAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                      Notas de Salida (Salida)
                    </label>
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#0E1528] rounded-lg border border-white/10">
                      {formNotasSalida.map((n, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px] text-white">
                          {n}
                          <button
                            type="button"
                            onClick={() => setFormNotasSalida(formNotasSalida.filter((_, idx) => idx !== i))}
                            className="text-[#94A3B8] hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputNotaSalida}
                        onChange={(e) => setInputNotaSalida(e.target.value)}
                        placeholder="Añadir nota..."
                        className="flex-1 bg-[#0E1528] border border-white/10 rounded-lg px-3 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inputNotaSalida.trim()) {
                            setFormNotasSalida([...formNotasSalida, sanitizeTexto(inputNotaSalida.trim(), 40)]);
                            setInputNotaSalida("");
                          }
                        }}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center justify-center cursor-pointer"
                        title="Añadir nota de salida"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block">
                      Notas de Fondo (Fijación)
                    </label>
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#0E1528] rounded-lg border border-white/10">
                      {formNotasFondo.map((n, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px] text-white">
                          {n}
                          <button
                            type="button"
                            onClick={() => setFormNotasFondo(formNotasFondo.filter((_, idx) => idx !== i))}
                            className="text-[#94A3B8] hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputNotaFondo}
                        onChange={(e) => setInputNotaFondo(e.target.value)}
                        placeholder="Añadir nota..."
                        className="flex-1 bg-[#0E1528] border border-white/10 rounded-lg px-3 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (inputNotaFondo.trim()) {
                            setFormNotasFondo([...formNotasFondo, sanitizeTexto(inputNotaFondo.trim(), 40)]);
                            setInputNotaFondo("");
                          }
                        }}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs flex items-center justify-center cursor-pointer"
                        title="Añadir nota de fondo"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    {perfumeEnEdicion ? "Guardar Cambios" : "Dar de Alta Fragancia"}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL DE CREACIÓN DE USUARIO (RBAC)
      ========================================================================= */}
      <AnimatePresence>
        {modalUsuarioAbierto && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0F1D] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    Nuevo Usuario Corporativo
                  </h3>
                  <p className="text-[11px] text-[#94A3B8]">
                    Asigna credenciales y delimita el radio de acción en la red.
                  </p>
                </div>
                <button
                  onClick={() => setModalUsuarioAbierto(false)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCrearUsuario} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsuarioNombre}
                    onChange={(e) => setFormUsuarioNombre(e.target.value)}
                    placeholder="Ej. Rodrigo Mendoza"
                    className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                    Correo Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formUsuarioEmail}
                    onChange={(e) => setFormUsuarioEmail(e.target.value)}
                    placeholder="nombre@latelier.com"
                    className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                    Rol en el Sistema
                  </label>
                  <select
                    value={formUsuarioRol}
                    onChange={(e) => setFormUsuarioRol(e.target.value as RolUsuario)}
                    className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                  >
                    <option value="superadmin">Superadmin (Acceso Total)</option>
                    <option value="encargado_sede">Encargado de Sede (Solo su Boutique)</option>
                    <option value="vendedor">Vendedor / Mostrador (Consulta)</option>
                  </select>
                </div>

                {formUsuarioRol !== "superadmin" && (
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1">
                      Boutique Asignada
                    </label>
                    <select
                      value={formUsuarioSucursal}
                      onChange={(e) => setFormUsuarioSucursal(e.target.value)}
                      className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.ciudad})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg text-[11px] font-mono text-[#94A3B8]">
                  <span>Acceso seguro: </span>
                  <span className="text-stone-300">La credencial inicial será configurada según las políticas de acceso corporativas.</span>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalUsuarioAbierto(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-semibold cursor-pointer shadow-xs"
                  >
                    Registrar Usuario
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Crear / Editar Promoción Personalizable */}
      <AnimatePresence>
        {modalPromoAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#0E1424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {promoEnEdicion ? "Editar Promoción" : "Nueva Promoción Personalizable"}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Configura la regla matemática de ahorro para el catálogo y WhatsApp
                  </p>
                </div>
                <button
                  onClick={() => setModalPromoAbierto(false)}
                  className="p-2 text-[#94A3B8] hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleGuardarPromo} className="p-6 space-y-4 overflow-y-auto">
                {/* Nombre */}
                <div>
                  <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                    Nombre Comercial de la Oferta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Colección 4x3 (El 4to es GRATIS), 2do al 50%..."
                    value={formPromoNombre}
                    onChange={(e) => setFormPromoNombre(e.target.value)}
                    className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-white/30"
                  />
                </div>

                {/* Tipo de Mecánica Promocional */}
                <div>
                  <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                    Mecánica / Tipo de Promoción *
                  </label>
                  <select
                    value={formPromoTipo}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value as TipoMecanicaPromocion;
                      setFormPromoTipo(nuevoTipo);
                      if (nuevoTipo === "lleva_x_paga_y") {
                        setFormPromoFrascos(4);
                        setFormPromoFrascosPaga(3);
                        setFormPromoAhorroEstimado(32);
                        setFormPromoBadge("4x3 DE REGALO");
                      } else if (nuevoTipo === "segundo_descuento") {
                        setFormPromoFrascos(2);
                        setFormPromoDescuentoPorcentaje(50);
                        setFormPromoAhorroEstimado(90);
                        setFormPromoBadge("2DO AL 50% OFF");
                      } else if (nuevoTipo === "precio_fijo") {
                        setFormPromoFrascos(2);
                        setFormPromoPrecioCombo(300);
                        setFormPromoAhorroEstimado(60);
                        setFormPromoBadge("COMBO PACK");
                      } else if (nuevoTipo === "descuento_porcentaje") {
                        setFormPromoFrascos(3);
                        setFormPromoDescuentoPorcentaje(15);
                        setFormPromoAhorroEstimado(80);
                        setFormPromoBadge("15% OFF");
                      }
                    }}
                    className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-white/30"
                  >
                    <option value="lleva_x_paga_y">Lleva X, Paga Y (ej: 4x3 - El 4to es GRATIS)</option>
                    <option value="segundo_descuento">2do Frasco a Mitad de Precio (50% OFF)</option>
                    <option value="precio_fijo">Pack a Precio Fijo (ej: Combo 2x50ml por 300 Bs, 3x50ml por 420 Bs)</option>
                    <option value="descuento_porcentaje">Descuento Porcentual por Volumen (ej: 15% en 3+)</option>
                  </select>
                </div>

                {/* Parámetros según tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                      Frascos Requeridos *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formPromoFrascos}
                      onChange={(e) => setFormPromoFrascos(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-white/30 font-mono"
                    />
                  </div>

                  {formPromoTipo === "lleva_x_paga_y" && (
                    <div>
                      <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                        Frascos que Paga *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={formPromoFrascos}
                        value={formPromoFrascosPaga}
                        onChange={(e) => setFormPromoFrascosPaga(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-white/30 font-mono"
                      />
                    </div>
                  )}

                  {formPromoTipo === "precio_fijo" && (
                    <div>
                      <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                        Precio Combo (Bs) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formPromoPrecioCombo}
                        onChange={(e) => setFormPromoPrecioCombo(sanitizePrecio(e.target.value))}
                        className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-white/30 font-mono"
                      />
                    </div>
                  )}

                  {(formPromoTipo === "segundo_descuento" || formPromoTipo === "descuento_porcentaje") && (
                    <div>
                      <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                        % de Descuento *
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={100}
                        value={formPromoDescuentoPorcentaje}
                        onChange={(e) => setFormPromoDescuentoPorcentaje(Math.min(100, Math.max(1, parseInt(e.target.value) || 50)))}
                        className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-white/30 font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Mililitros aplicables */}
                  <div>
                    <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                      Tamaño Aplicable
                    </label>
                    <select
                      value={formPromoMililitros}
                      onChange={(e) => setFormPromoMililitros(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-white/30"
                    >
                      <option value={50}>Solo 50ml (Estándar)</option>
                      <option value={30}>Solo 30ml</option>
                      <option value={100}>Solo 100ml</option>
                      <option value={0}>Cualquier tamaño</option>
                    </select>
                  </div>

                  {/* Ahorro Estimado para mostrar al cliente */}
                  <div>
                    <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                      Ahorro Estimado (Bs)
                    </label>
                    <input
                      type="number"
                      value={formPromoAhorroEstimado}
                      onChange={(e) => setFormPromoAhorroEstimado(sanitizePrecio(e.target.value))}
                      className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-emerald-400 focus:outline-hidden focus:border-white/30 font-mono"
                    />
                  </div>
                </div>

                {/* Badge y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                      Etiqueta / Badge
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 4x3 DE REGALO, 2DO AL 50%..."
                      value={formPromoBadge}
                      onChange={(e) => setFormPromoBadge(e.target.value)}
                      className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                      Estado de la Oferta
                    </label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="inline-flex items-center gap-2 text-xs text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formPromoActiva}
                          onChange={(e) => setFormPromoActiva(e.target.checked)}
                          className="w-4 h-4 accent-[#C5A880] rounded cursor-pointer"
                        />
                        <span>{formPromoActiva ? "Activa para Clientes" : "Pausada"}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                    Descripción / Términos de la Oferta
                  </label>
                  <textarea
                    rows={2}
                    value={formPromoDescripcion}
                    onChange={(e) => setFormPromoDescripcion(e.target.value)}
                    placeholder="Detalle de la promoción para el cliente y ticket de retiro..."
                    className="w-full bg-[#080C14] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-hidden focus:border-white/30"
                  />
                </div>

                {/* Botones de acción */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalPromoAbierto(false)}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-[#C5A880] hover:bg-[#D4AF37] text-[#0C0B0A] transition-colors cursor-pointer shadow-md"
                  >
                    {promoEnEdicion ? "Guardar Cambios" : "Crear Promoción"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL DEL ASISTENTE VISUAL DE FORMULACIÓN EN MOSTRADOR
      ========================================================================= */}
      <FormulacionAssistantModal
        isOpen={modalFormulacionAbierto}
        onClose={() => setModalFormulacionAbierto(false)}
        ticket={ticketEnFormulacion}
        onCompletar={handleCompletarFormulacion}
      />

      {/* =========================================================================
          MODAL DE RECARGA DE MATERIA PRIMA (LABORATORIO)
      ========================================================================= */}
      <AnimatePresence>
        {modalRecargaMateriaPrimaAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0E1528] border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-white font-medium">
                      Recargar Tanques de Materia Prima
                    </h3>
                    <p className="text-[11px] text-[#94A3B8]">
                      Reabastecimiento en {sucursalSeleccionadaObj?.nombre || "Atelier Equipetrol"}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalRecargaMateriaPrimaAbierto(false)}
                  className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecargarMateriaPrima} className="space-y-4">
                {/* Selector Visual de Materia Prima */}
                <div>
                  <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                    Materia Prima a Ingresar:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "esencia", label: "Esencia Pura (30%)", icon: Droplets, color: "text-amber-400" },
                      { id: "alcohol", label: "Alcohol 96º Desod.", icon: Sparkles, color: "text-sky-400" },
                      { id: "fijador", label: "Fijador Molecular DPG", icon: Layers, color: "text-purple-400" },
                      { id: "feromonas", label: "Booster Feromonas", icon: Sparkles, color: "text-emerald-400" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const esActivo = formRecargaTipo === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormRecargaTipo(item.id as "alcohol" | "fijador" | "feromonas" | "esencia")}
                          className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 text-left cursor-pointer ${
                            esActivo
                              ? "bg-amber-500/15 border-amber-500/50 text-white font-semibold shadow-xs"
                              : "bg-[#080C14] border-white/5 text-[#94A3B8] hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Si es esencia pura: Card con Buscador Inteligente de Fragancias */}
                {formRecargaTipo === "esencia" && (
                  <div>
                    <label className="text-xs font-mono text-[#94A3B8] uppercase block mb-1.5">
                      Fragancia Madre a Reabastecer:
                    </label>

                    {(() => {
                      const perf = perfumes.find((p) => p.id === formRecargaPerfumeId) || perfumes[0];
                      const sedeId = sucursalFiltroGlobal === "todas" ? "suc-1" : sucursalFiltroGlobal;
                      const stockActual = materiaPrimaSedes[sedeId]?.esenciasMadreMl?.[perf.id] ?? 400;

                      return (
                        <div className="p-3 bg-[#080C14] rounded-xl border border-white/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-[#0E1528] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-1 relative">
                              <Image
                                src={perf.imagenUrl || "/frontend-perfumeria/images/perfumes/bleu-de-chanel.png"}
                                alt={perf.nombre}
                                width={44}
                                height={44}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <strong className="text-sm font-serif text-white block truncate">
                                {perf.nombre}
                              </strong>
                              <span className="text-[11px] font-mono text-[#94A3B8] block truncate">
                                Inspiración: <span className="text-amber-300">{perf.marcaReferencia}</span> · {stockActual} ml en tanque
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setModalBuscadorFraganciaAbierto(true)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Buscar...</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Cantidad en mililitros con Botones Rápidos de Incremento */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-[#94A3B8] uppercase">
                      Volumen a Ingresar (ml):
                    </label>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {formRecargaTipo === "esencia" ? "Lote de Esencia" : "Bidón de Insumo"}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      step={10}
                      value={formRecargaCantidadMl}
                      onChange={(e) => setFormRecargaCantidadMl(Number(e.target.value))}
                      className="w-full bg-[#080C14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-400/50"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748B]">
                      ml
                    </span>
                  </div>

                  {/* Botones de incremento rápido */}
                  <div className="flex items-center gap-1.5 pt-2">
                    {[100, 250, 500, 1000].map((cant) => (
                      <button
                        key={cant}
                        type="button"
                        onClick={() => setFormRecargaCantidadMl(cant)}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                          formRecargaCantidadMl === cant
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                            : "bg-white/[0.02] border-white/5 text-[#94A3B8] hover:text-white"
                        }`}
                      >
                        +{cant} ml
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumen de Nuevo Nivel de Tanque */}
                <div className="p-3 rounded-xl bg-[#080C14] border border-white/5 flex items-center justify-between text-xs font-mono">
                  {(() => {
                    const sedeId = sucursalFiltroGlobal === "todas" ? "suc-1" : sucursalFiltroGlobal;
                    const tanque = materiaPrimaSedes[sedeId] || TANQUE_BASE_VACIO;
                    let nivelActual = 0;
                    if (formRecargaTipo === "alcohol") nivelActual = tanque.alcoholMl;
                    else if (formRecargaTipo === "fijador") nivelActual = tanque.fijadorMl;
                    else if (formRecargaTipo === "feromonas") nivelActual = tanque.feromonasMl;
                    else if (formRecargaTipo === "esencia") nivelActual = tanque.esenciasMadreMl[formRecargaPerfumeId] ?? 400;

                    const nuevoNivel = nivelActual + (formRecargaCantidadMl || 0);

                    return (
                      <>
                        <div className="text-[#94A3B8]">
                          <span>Nivel Actual: </span>
                          <strong className="text-white">{nivelActual} ml</strong>
                        </div>
                        <div className="text-amber-400 font-bold">
                          <span>Nuevo Nivel: </span>
                          <span>{nuevoNivel} ml</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Acciones */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalRecargaMateriaPrimaAbierto(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer font-mono shadow-md"
                  >
                    Confirmar Recarga (+{formRecargaCantidadMl} ml)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL DE BÚSQUEDA INTELIGENTE DE FRAGANCIAS
      ========================================================================= */}
      <BuscadorFraganciaModal
        isOpen={modalBuscadorFraganciaAbierto}
        onClose={() => setModalBuscadorFraganciaAbierto(false)}
        perfumes={perfumes}
        esenciasStockMl={materiaPrimaSedes[sucursalFiltroGlobal === "todas" ? "suc-1" : sucursalFiltroGlobal]?.esenciasMadreMl}
        fraganciaSeleccionadaId={formRecargaPerfumeId}
        onSeleccionar={(perfume) => {
          setFormRecargaPerfumeId(perfume.id);
        }}
      />

      {/* =========================================================================
          MODAL DE ESCÁNER DE TICKETS & PROFORMAS QR
      ========================================================================= */}
      <QRScannerModal
        isOpen={modalEscanerQR}
        onClose={() => setModalEscanerQR(false)}
        tickets={ticketsPedidos}
        onSeleccionarTicketParaFormular={(ticket) => {
          setTicketEnFormulacion(ticket);
          setIndiceFrascoActual(0);
          setModalFormulacionAbierto(true);
        }}
      />

    </div>
  );
}

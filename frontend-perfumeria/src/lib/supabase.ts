import { Perfume, Sucursal } from "@/types/perfume";
import { TicketPedido, MateriaPrimaSede, EstadoTicket } from "@/lib/formulacion";
import { UsuarioSistema } from "@/types/auth";

export const estaConfiguradoSupabase = true;
export const supabase = null;

const STORAGE_KEYS = {
  sucursales: "latelier_demo_sucursales",
  perfumes: "latelier_demo_perfumes",
  tickets: "latelier_demo_tickets",
  tanques: "latelier_demo_tanques",
  usuarios: "latelier_demo_usuarios",
};

const SUCURSALES_MOCK: Sucursal[] = [
  {
    id: "suc-1",
    nombre: "Atelier Equipetrol",
    ciudad: "Santa Cruz",
    direccion: "Av. San Martín esq. Calle 7 Este, Barrio Equipetrol",
    whatsapp: "59170044556",
    horario: "Lun a Dom: 10:00 - 21:00",
    mapsUrl: "https://maps.google.com/?q=Equipetrol+Santa+Cruz",
  },
  {
    id: "suc-2",
    nombre: "Atelier Las Brisas",
    ciudad: "Santa Cruz",
    direccion: "Centro Comercial Las Brisas, Planta Baja Local 14",
    whatsapp: "59170044557",
    horario: "Lun a Dom: 10:30 - 21:30",
    mapsUrl: "https://maps.google.com/?q=Las+Brisas+Santa+Cruz",
  },
];

const PERFUMES_MOCK: Perfume[] = [
  {
    id: "perf-1",
    nombre: "Emperor Aventus Elixir",
    inspiracionEn: "Aventus",
    marcaReferencia: "Creed",
    genero: "masculino",
    familiaOlfativa: "Chipre Frutal",
    estela: "Intensa (10-12h)",
    descripcion: "Piña ahumada, abedul seco y almizcle blanco en concentración Extrait al 30%.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/aventus.png",
    destacado: true,
    notas: {
      salida: ["Piña", "Bergamota", "Grosellas Negras", "Manzana"],
      corazon: ["Abedul", "Pachulí", "Jazmín de Marruecos"],
      fondo: ["Almizcle", "Musgo de Roble", "Ámbar Gris", "Vainilla"],
    },
    presentaciones: [
      { id: "perf-1-30", mililitros: 30, precio: 130, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-1-50", mililitros: 50, precio: 195, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-1-100", mililitros: 100, precio: 310, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
  {
    id: "perf-2",
    nombre: "Rouge Cristallin 540",
    inspiracionEn: "Baccarat Rouge 540",
    marcaReferencia: "Maison Francis Kurkdjian",
    genero: "unisex",
    familiaOlfativa: "Ámbar Floral",
    estela: "Nuclear (12h+)",
    descripcion: "Azafrán luminoso, resina de abeto y azúcar caramelizada sobre maderas ambaradas.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/baccarat-rouge-540.png",
    destacado: true,
    notas: {
      salida: ["Azafrán", "Jazmín Egipcio"],
      corazon: ["Amberwood", "Ámbar Gris"],
      fondo: ["Resina de Abeto", "Cedro"],
    },
    presentaciones: [
      { id: "perf-2-30", mililitros: 30, precio: 140, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-2-50", mililitros: 50, precio: 210, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-2-100", mililitros: 100, precio: 330, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
  {
    id: "perf-3",
    nombre: "Nocturne Sauvage",
    inspiracionEn: "Sauvage Elixir",
    marcaReferencia: "Dior",
    genero: "masculino",
    familiaOlfativa: "Aromática Especiada",
    estela: "Muy Intensa (10h+)",
    descripcion: "Lavanda intensa con nuez moscada, canela cálida y sándalo profundo.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/sauvage.png",
    destacado: true,
    notas: {
      salida: ["Canela", "Nuez Moscada", "Cardamomo", "Pomelo"],
      corazon: ["Lavanda"],
      fondo: ["Regaliz", "Sándalo", "Ámbar", "Pachulí"],
    },
    presentaciones: [
      { id: "perf-3-30", mililitros: 30, precio: 125, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-3-50", mililitros: 50, precio: 185, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-3-100", mililitros: 100, precio: 290, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
  {
    id: "perf-4",
    nombre: "L'Ange Cognac",
    inspiracionEn: "Angels' Share",
    marcaReferencia: "Kilian",
    genero: "unisex",
    familiaOlfativa: "Ámbar Vainilla",
    estela: "Intensa (10-12h)",
    descripcion: "Coñac añejo macerado en barrica de roble, canela dulce, haba tonka y praliné.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/angels-share.png",
    destacado: true,
    notas: {
      salida: ["Coñac"],
      corazon: ["Canela", "Haba Tonka", "Roble"],
      fondo: ["Praliné", "Vainilla", "Sándalo"],
    },
    presentaciones: [
      { id: "perf-4-30", mililitros: 30, precio: 135, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-4-50", mililitros: 50, precio: 200, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-4-100", mililitros: 100, precio: 320, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
  {
    id: "perf-5",
    nombre: "Rose Impériale Exclusif",
    inspiracionEn: "Delina Exclusif",
    marcaReferencia: "Parfums de Marly",
    genero: "femenino",
    familiaOlfativa: "Floral Oriental",
    estela: "Alta (10h)",
    descripcion: "Rosa turca aterciopelada con lichi, pera jugosa, incienso suave y vainilla cremosa.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/delina-exclusif.png",
    destacado: true,
    notas: {
      salida: ["Lichi", "Pera", "Bergamota"],
      corazon: ["Rosa Turca", "Madera de Oud", "Incienso"],
      fondo: ["Vainilla", "Ámbar", "Notas Amaderadas"],
    },
    presentaciones: [
      { id: "perf-5-30", mililitros: 30, precio: 135, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-5-50", mililitros: 50, precio: 205, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-5-100", mililitros: 100, precio: 320, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
  {
    id: "perf-6",
    nombre: "Bois Santal 33",
    inspiracionEn: "Santal 33",
    marcaReferencia: "Le Labo",
    genero: "unisex",
    familiaOlfativa: "Amaderada Aromática",
    estela: "Moderada-Alta (8-10h)",
    descripcion: "Sándalo australiano cremoso, cardamomo especiado, iris violeta y cuero limpio.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/santal-33.png",
    destacado: false,
    notas: {
      salida: ["Cardamomo", "Violeta"],
      corazon: ["Iris", "Ambroxan"],
      fondo: ["Sándalo", "Cedro", "Cuero"],
    },
    presentaciones: [
      { id: "perf-6-30", mililitros: 30, precio: 130, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-6-50", mililitros: 50, precio: 190, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-6-100", mililitros: 100, precio: 300, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
  {
    id: "perf-7",
    nombre: "Cerise Obsession",
    inspiracionEn: "Lost Cherry",
    marcaReferencia: "Tom Ford",
    genero: "femenino",
    familiaOlfativa: "Ámbar Floral",
    estela: "Alta (8-10h)",
    descripcion: "Licor de cereza negra, almendra amarga y bálsamo del Perú sobre haba tonka.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/lost-cherry.png",
    destacado: false,
    notas: {
      salida: ["Cereza Ácida", "Almendra Amarga", "Licor"],
      corazon: ["Ciruela", "Rosa Turca", "Jazmín Sambac"],
      fondo: ["Haba Tonka", "Vainilla", "Sándalo", "Canela"],
    },
    presentaciones: [
      { id: "perf-7-30", mililitros: 30, precio: 130, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-7-50", mililitros: 50, precio: 195, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-7-100", mililitros: 100, precio: 310, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
  {
    id: "perf-8",
    nombre: "Bleu Élégance",
    inspiracionEn: "Bleu de Chanel Parfum",
    marcaReferencia: "Chanel",
    genero: "masculino",
    familiaOlfativa: "Amaderada Aromática",
    estela: "Elegante (8-10h)",
    descripcion: "Ralladura cítrica vibrante, menta fresca y sándalo cremoso de Nueva Caledonia.",
    imagenUrl: "/frontend-perfumeria/images/perfumes/bleu-de-chanel.png",
    destacado: false,
    notas: {
      salida: ["Entrecorte de Limón", "Bergamota", "Menta"],
      corazon: ["Lavanda", "Piña", "Geranio"],
      fondo: ["Sándalo", "Cedro", "Amberwood"],
    },
    presentaciones: [
      { id: "perf-8-30", mililitros: 30, precio: 120, envaseTipo: "Frasco Cristal 30ml" },
      { id: "perf-8-50", mililitros: 50, precio: 180, envaseTipo: "Frasco Cristal 50ml" },
      { id: "perf-8-100", mililitros: 100, precio: 280, envaseTipo: "Frasco Cristal 100ml" },
    ],
  },
];

const TANQUES_MOCK: Record<string, MateriaPrimaSede> = {
  "suc-1": {
    alcoholMl: 6200,
    fijadorMl: 840,
    feromonasMl: 210,
    frascos30ml: 145,
    frascos50ml: 98,
    frascos100ml: 54,
    bolsasConLogo: 320,
    esenciasMadreMl: {
      "perf-1": 480,
      "perf-2": 520,
      "perf-3": 410,
      "perf-4": 340,
      "perf-5": 390,
      "perf-6": 280,
      "perf-7": 250,
      "perf-8": 440,
    },
  },
  "suc-2": {
    alcoholMl: 4800,
    fijadorMl: 620,
    feromonasMl: 145,
    frascos30ml: 95,
    frascos50ml: 72,
    frascos100ml: 38,
    bolsasConLogo: 210,
    esenciasMadreMl: {
      "perf-1": 310,
      "perf-2": 360,
      "perf-3": 290,
      "perf-4": 220,
      "perf-5": 240,
      "perf-6": 190,
      "perf-7": 180,
      "perf-8": 320,
    },
  },
};

const ahora = Date.now();
const TICKETS_MOCK: TicketPedido[] = [
  {
    id: "ORD-849201",
    codigoTicket: "ORD-849201",
    fechaEmision: new Date(ahora - 2 * 60 * 60 * 1000).toISOString(),
    fechaExpiracion: new Date(ahora + 22 * 60 * 60 * 1000).toISOString(),
    sucursalId: "suc-1",
    sucursalNombre: "Atelier Equipetrol",
    clienteNombre: "Sebastián Vargas",
    clienteTelefono: "59177612345",
    items: [
      { perfume: PERFUMES_MOCK[0], presentacion: PERFUMES_MOCK[0].presentaciones[1], cantidad: 1 },
      { perfume: PERFUMES_MOCK[1], presentacion: PERFUMES_MOCK[1].presentaciones[0], cantidad: 1 },
    ],
    subtotal: 335,
    descuento: 35,
    total: 300,
    comboNombre: "Dúo Signature",
    estado: "pendiente",
    qrPayload: JSON.stringify({ ticket: "ORD-849201", sucursal: "suc-1", total: 300 }),
  },
  {
    id: "ORD-849198",
    codigoTicket: "ORD-849198",
    fechaEmision: new Date(ahora - 5 * 60 * 60 * 1000).toISOString(),
    fechaExpiracion: new Date(ahora + 19 * 60 * 60 * 1000).toISOString(),
    sucursalId: "suc-2",
    sucursalNombre: "Atelier Las Brisas",
    clienteNombre: "Luciana Pérez",
    clienteTelefono: "59175598765",
    items: [
      { perfume: PERFUMES_MOCK[4], presentacion: PERFUMES_MOCK[4].presentaciones[1], cantidad: 1 },
    ],
    subtotal: 205,
    descuento: 0,
    total: 205,
    estado: "completado",
    atendidoPor: "Camila Mendoza",
    fechaCompletado: new Date(ahora - 3 * 60 * 60 * 1000).toISOString(),
    qrPayload: JSON.stringify({ ticket: "ORD-849198", sucursal: "suc-2", total: 205 }),
  },
];

const USUARIOS_MOCK: UsuarioSistema[] = [
  {
    id: "usr-admin-1",
    nombre: "Camila Mendoza",
    email: "admin@latelier.com",
    rol: "superadmin",
    activo: true,
    ultimoAcceso: "Activo ahora",
    creadoEn: "2026-01-15",
  },
  {
    id: "usr-recep-2",
    nombre: "Mateo Rojas",
    email: "recepcion@latelier.com",
    rol: "encargado_sede",
    sucursalId: "suc-1",
    activo: true,
    ultimoAcceso: "Hoy, 09:45",
    creadoEn: "2026-02-01",
  },
  {
    id: "usr-vend-3",
    nombre: "Sofía Arancibia",
    email: "sofia.brisas@latelier.com",
    rol: "vendedor",
    sucursalId: "suc-2",
    activo: true,
    ultimoAcceso: "Ayer, 18:20",
    creadoEn: "2026-03-10",
  },
];

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota limits
  }
}

export async function obtenerSucursales(): Promise<Sucursal[]> {
  return readLocal(STORAGE_KEYS.sucursales, SUCURSALES_MOCK);
}

export async function obtenerCatalogoPerfumes(): Promise<Perfume[]> {
  return readLocal(STORAGE_KEYS.perfumes, PERFUMES_MOCK);
}

export async function guardarPerfumeEnSupabase(perfume: Perfume): Promise<{ exito: boolean; error?: string }> {
  const actuales = readLocal<Perfume[]>(STORAGE_KEYS.perfumes, PERFUMES_MOCK);
  const idx = actuales.findIndex((p) => p.id === perfume.id);
  const actualizados = idx >= 0
    ? actuales.map((p, i) => (i === idx ? perfume : p))
    : [perfume, ...actuales];
  writeLocal(STORAGE_KEYS.perfumes, actualizados);
  return { exito: true };
}

export async function eliminarPerfumeEnSupabase(id: string): Promise<{ exito: boolean; error?: string }> {
  const actuales = readLocal<Perfume[]>(STORAGE_KEYS.perfumes, PERFUMES_MOCK);
  writeLocal(STORAGE_KEYS.perfumes, actuales.filter((p) => p.id !== id));
  return { exito: true };
}

export async function registrarOrdenRetiro(orden: {
  codigoTicket: string;
  sucursalId: string;
  sucursalNombre?: string;
  clienteNombre: string;
  clienteTelefono: string;
  items: unknown[];
  subtotal: number;
  descuento: number;
  total: number;
  comboNombre?: string;
  qrPayload: string;
  fechaEmision?: string;
  fechaExpiracion?: string;
}): Promise<{ exito: boolean; id?: string; error?: string }> {
  const ahoraMs = Date.now();
  const nuevoTicket: TicketPedido = {
    id: orden.codigoTicket,
    codigoTicket: orden.codigoTicket,
    fechaEmision: orden.fechaEmision || new Date(ahoraMs).toISOString(),
    fechaExpiracion: orden.fechaExpiracion || new Date(ahoraMs + 24 * 60 * 60 * 1000).toISOString(),
    sucursalId: orden.sucursalId,
    sucursalNombre: orden.sucursalNombre || "Atelier Equipetrol",
    clienteNombre: orden.clienteNombre,
    clienteTelefono: orden.clienteTelefono,
    items: orden.items as TicketPedido["items"],
    subtotal: orden.subtotal,
    descuento: orden.descuento || 0,
    total: orden.total,
    comboNombre: orden.comboNombre,
    estado: "pendiente",
    qrPayload: orden.qrPayload,
  };
  const actuales = readLocal<TicketPedido[]>(STORAGE_KEYS.tickets, TICKETS_MOCK);
  writeLocal(STORAGE_KEYS.tickets, [nuevoTicket, ...actuales.filter((t) => t.id !== nuevoTicket.id)]);
  return { exito: true, id: nuevoTicket.id };
}

export async function obtenerOrdenesRetiro(): Promise<TicketPedido[]> {
  return readLocal<TicketPedido[]>(STORAGE_KEYS.tickets, TICKETS_MOCK);
}

export async function actualizarEstadoOrdenRetiro(
  id: string,
  nuevoEstado: EstadoTicket,
  atendidoPor?: string
): Promise<{ exito: boolean; error?: string }> {
  const actuales = readLocal<TicketPedido[]>(STORAGE_KEYS.tickets, TICKETS_MOCK);
  const actualizados = actuales.map((t) =>
    t.id === id
      ? {
          ...t,
          estado: nuevoEstado,
          atendidoPor: atendidoPor || t.atendidoPor,
          fechaCompletado: nuevoEstado === "completado" ? new Date().toISOString() : t.fechaCompletado,
        }
      : t
  );
  writeLocal(STORAGE_KEYS.tickets, actualizados);
  return { exito: true };
}

export async function obtenerMateriaPrimaTanques(): Promise<Record<string, MateriaPrimaSede>> {
  return readLocal<Record<string, MateriaPrimaSede>>(STORAGE_KEYS.tanques, TANQUES_MOCK);
}

export async function actualizarMateriaPrimaSede(
  sucursalId: string,
  datos: MateriaPrimaSede
): Promise<{ exito: boolean; error?: string }> {
  const actuales = readLocal<Record<string, MateriaPrimaSede>>(STORAGE_KEYS.tanques, TANQUES_MOCK);
  actuales[sucursalId] = datos;
  writeLocal(STORAGE_KEYS.tanques, actuales);
  return { exito: true };
}

export function suscribirCanalSupabase(_tabla: string, _callback: () => void): () => void {
  return () => {};
}

export async function obtenerUsuariosSistema(): Promise<UsuarioSistema[]> {
  return readLocal<UsuarioSistema[]>(STORAGE_KEYS.usuarios, USUARIOS_MOCK);
}

export async function guardarUsuarioEnSupabase(
  usuario: UsuarioSistema
): Promise<{ exito: boolean; error?: string }> {
  const actuales = readLocal<UsuarioSistema[]>(STORAGE_KEYS.usuarios, USUARIOS_MOCK);
  const idx = actuales.findIndex((u) => u.id === usuario.id);
  const actualizados = idx >= 0
    ? actuales.map((u, i) => (i === idx ? usuario : u))
    : [...actuales, usuario];
  writeLocal(STORAGE_KEYS.usuarios, actualizados);
  return { exito: true };
}

export async function toggleEstadoUsuarioEnSupabase(
  id: string,
  activo: boolean
): Promise<{ exito: boolean; error?: string }> {
  const actuales = readLocal<UsuarioSistema[]>(STORAGE_KEYS.usuarios, USUARIOS_MOCK);
  writeLocal(
    STORAGE_KEYS.usuarios,
    actuales.map((u) => (u.id === id ? { ...u, activo } : u))
  );
  return { exito: true };
}

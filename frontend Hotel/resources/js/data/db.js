// Repositorio localStorage que reemplaza al backend Laravel real de este proyecto.
// Consolida hoteles/pisos/tipos/habitaciones/huéspedes/reservas/servicios/consumos/
// pagos/empleados/roles/permisos/mantenimientos/auditoría/solicitudes de autorización
// en un único módulo. Cada operación mutante registra un evento en Auditoría (igual
// que el trait Auditable real) y emite un evento en apiSimBus como último paso.
// Las fechas sembradas siempre se calculan relativas a "hoy" via relDate()/relDateTime()
// para que el dashboard, reportes y folios nunca luzcan vacíos sin importar cuándo se
// abra la demo.
import { emitApiSim } from '../api-sim/templates';
import * as Seg from '../api-sim/catalogs/seguridad.catalog';
import * as Cat from '../api-sim/catalogs/catalogo.catalog';
import * as Ops from '../api-sim/catalogs/operaciones.catalog';
import * as Fol from '../api-sim/catalogs/folio.catalog';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || 'Error simulado');
    this.status = status;
    this.body = body;
  }
}

const KEYS = {
  hoteles: 'hotel_hoteles', pisos: 'hotel_pisos', tipos: 'hotel_tipos', habitaciones: 'hotel_habitaciones',
  huespedes: 'hotel_huespedes', reservas: 'hotel_reservas', reservaHabitaciones: 'hotel_reserva_habitaciones',
  huespedesReserva: 'hotel_huespedes_reserva', servicios: 'hotel_servicios', consumos: 'hotel_consumos',
  pagos: 'hotel_pagos', empleados: 'hotel_empleados', roles: 'hotel_roles', permisos: 'hotel_permisos',
  rolPermisos: 'hotel_rol_permisos', mantenimientos: 'hotel_mantenimientos', auditoria: 'hotel_auditoria',
  solicitudes: 'hotel_solicitudes', seeded: 'hotel_seeded_v1',
};

function load(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function nextId(arr) {
  return arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}
function toLocalDateStr(date = new Date()) {
  return date.toLocaleDateString('en-CA');
}
function relDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toLocalDateStr(d);
}
function relDateTime(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}
function diffNights(entrada, salida) {
  const a = new Date(`${entrada}T00:00:00`);
  const b = new Date(`${salida}T00:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000));
}
function todayISO() { return relDate(0); }

let hoteles = load(KEYS.hoteles, []);
let pisos = load(KEYS.pisos, []);
let tipos = load(KEYS.tipos, []);
let habitaciones = load(KEYS.habitaciones, []);
let huespedes = load(KEYS.huespedes, []);
let reservas = load(KEYS.reservas, []);
let reservaHabitaciones = load(KEYS.reservaHabitaciones, []);
let huespedesReserva = load(KEYS.huespedesReserva, []);
let servicios = load(KEYS.servicios, []);
let consumos = load(KEYS.consumos, []);
let pagos = load(KEYS.pagos, []);
let empleados = load(KEYS.empleados, []);
let roles = load(KEYS.roles, []);
let permisos = load(KEYS.permisos, []);
let rolPermisos = load(KEYS.rolPermisos, []);
let mantenimientos = load(KEYS.mantenimientos, []);
let auditoria = load(KEYS.auditoria, []);
let solicitudes = load(KEYS.solicitudes, []);

let currentEmpleadoId = null;

function persistAll() {
  save(KEYS.hoteles, hoteles); save(KEYS.pisos, pisos); save(KEYS.tipos, tipos);
  save(KEYS.habitaciones, habitaciones); save(KEYS.huespedes, huespedes); save(KEYS.reservas, reservas);
  save(KEYS.reservaHabitaciones, reservaHabitaciones); save(KEYS.huespedesReserva, huespedesReserva);
  save(KEYS.servicios, servicios); save(KEYS.consumos, consumos); save(KEYS.pagos, pagos);
  save(KEYS.empleados, empleados); save(KEYS.roles, roles); save(KEYS.permisos, permisos);
  save(KEYS.rolPermisos, rolPermisos); save(KEYS.mantenimientos, mantenimientos);
  save(KEYS.auditoria, auditoria); save(KEYS.solicitudes, solicitudes);
  localStorage.setItem(KEYS.seeded, '1');
}

function resolveCurrentEmpleado() {
  const emp = empleados.find((e) => e.id === currentEmpleadoId);
  if (emp) return emp;
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      return empleados.find((e) => e.id === u.id) || null;
    }
  } catch { /* ignore */ }
  return null;
}

function logAuditoria(accion, modeloClass, modeloId, valoresAntiguos, valoresNuevos) {
  const emp = resolveCurrentEmpleado();
  auditoria = [
    {
      id: nextId(auditoria), user_id: emp?.id ?? null, accion, modelo: `App\\Models\\${modeloClass}`,
      modelo_id: modeloId, valores_antiguos: valoresAntiguos ?? null, valores_nuevos: valoresNuevos ?? null,
      ip_address: '127.0.0.1', user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'simulated',
      created_at: new Date().toISOString(),
    },
    ...auditoria,
  ];
}

const PERMISO_NAMES = [
  'ver_hoteles', 'crear_hoteles', 'editar_hoteles', 'eliminar_hoteles',
  'ver_habitaciones', 'crear_habitaciones', 'editar_habitaciones', 'eliminar_habitaciones',
  'crear_tipos_habitaciones', 'editar_tipos_habitaciones', 'eliminar_tipos_habitaciones',
  'ver_huespedes', 'gestionar_huespedes',
  'ver_reservas', 'crear_reservas', 'gestionar_reservas',
  'ver_reportes', 'ver_auditoria',
  'gestionar_empleados', 'gestionar_roles',
  'gestionar_servicios', 'gestionar_mantenimientos',
];

function seed() {
  permisos = PERMISO_NAMES.map((nombre, i) => ({ id: i + 1, nombre, descripcion: `Permite ${nombre.replace(/_/g, ' ')}` }));
  const pid = (nombre) => permisos.find((p) => p.nombre === nombre).id;

  roles = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
    { id: 2, nombre: 'Gerente', descripcion: 'Gestión operativa de un hotel' },
    { id: 3, nombre: 'Recepcionista', descripcion: 'Atención de huéspedes y reservas' },
    { id: 4, nombre: 'Empleado', descripcion: 'Acceso de solo lectura' },
  ];
  rolPermisos = [
    ...PERMISO_NAMES.map((n) => ({ id_rol: 1, id_permiso: pid(n) })),
    ...['ver_hoteles', 'editar_hoteles', 'ver_habitaciones', 'crear_habitaciones', 'editar_habitaciones', 'eliminar_habitaciones',
      'crear_tipos_habitaciones', 'editar_tipos_habitaciones', 'eliminar_tipos_habitaciones', 'ver_huespedes', 'gestionar_huespedes',
      'ver_reservas', 'crear_reservas', 'gestionar_reservas', 'ver_reportes', 'ver_auditoria', 'gestionar_servicios', 'gestionar_mantenimientos']
      .map((n) => ({ id_rol: 2, id_permiso: pid(n) })),
    ...['ver_hoteles', 'ver_habitaciones', 'ver_huespedes', 'ver_reservas', 'crear_reservas', 'gestionar_reservas']
      .map((n) => ({ id_rol: 3, id_permiso: pid(n) })),
    ...['ver_hoteles', 'ver_habitaciones', 'ver_huespedes', 'ver_reservas', 'ver_reportes']
      .map((n) => ({ id_rol: 4, id_permiso: pid(n) })),
  ];

  hoteles = [
    { id: 1, nombre: 'Hotel Plaza Grande', direccion: 'Av. Camacho #1234', ciudad: 'La Paz', estado: 'ACTIVO' },
    { id: 2, nombre: 'Hotel Vista Verde', direccion: 'Av. San Martín #567', ciudad: 'Santa Cruz', estado: 'ACTIVO' },
  ];

  empleados = [
    { id: 1, id_rol: 1, id_hotel: null, nombre: 'Elena', apellido: 'Vargas', usuario: 'admin', password: 'admin123', estado: 'ACTIVO' },
    { id: 2, id_rol: 2, id_hotel: 1, nombre: 'Mario', apellido: 'Suárez', usuario: 'gerente', password: 'gerente123', estado: 'ACTIVO' },
    { id: 3, id_rol: 3, id_hotel: 1, nombre: 'Daniela', apellido: 'Choque', usuario: 'recepcion', password: 'recepcion123', estado: 'ACTIVO' },
  ];

  pisos = [
    { id: 1, id_hotel: 1, numero: 1, estado: 'ACTIVO' }, { id: 2, id_hotel: 1, numero: 2, estado: 'ACTIVO' }, { id: 3, id_hotel: 1, numero: 3, estado: 'ACTIVO' },
    { id: 4, id_hotel: 2, numero: 1, estado: 'ACTIVO' }, { id: 5, id_hotel: 2, numero: 2, estado: 'ACTIVO' },
  ];

  tipos = [
    { id: 1, nombre: 'Individual', descripcion: 'Habitación para 1 persona', capacidad: 1, precio_base: 250, estado: 'ACTIVO' },
    { id: 2, nombre: 'Doble', descripcion: 'Habitación para 2 personas', capacidad: 2, precio_base: 350, estado: 'ACTIVO' },
    { id: 3, nombre: 'Suite', descripcion: 'Suite ejecutiva con sala de estar', capacidad: 3, precio_base: 600, estado: 'ACTIVO' },
    { id: 4, nombre: 'Familiar', descripcion: 'Habitación amplia para familias', capacidad: 4, precio_base: 500, estado: 'ACTIVO' },
  ];

  habitaciones = [
    { id: 1, id_hotel: 1, id_piso: 1, id_tipo: 1, numero: '101', estado: 'DISPONIBLE', descripcion: '' },
    { id: 2, id_hotel: 1, id_piso: 1, id_tipo: 2, numero: '102', estado: 'DISPONIBLE', descripcion: '' },
    { id: 3, id_hotel: 1, id_piso: 1, id_tipo: 2, numero: '103', estado: 'OCUPADA', descripcion: '' },
    { id: 4, id_hotel: 1, id_piso: 2, id_tipo: 3, numero: '201', estado: 'DISPONIBLE', descripcion: '' },
    { id: 5, id_hotel: 1, id_piso: 2, id_tipo: 1, numero: '202', estado: 'MANTENIMIENTO', descripcion: 'Aire acondicionado en reparación' },
    { id: 6, id_hotel: 1, id_piso: 2, id_tipo: 4, numero: '203', estado: 'RESERVADA', descripcion: '' },
    { id: 7, id_hotel: 1, id_piso: 3, id_tipo: 2, numero: '301', estado: 'DISPONIBLE', descripcion: '' },
    { id: 8, id_hotel: 1, id_piso: 3, id_tipo: 3, numero: '302', estado: 'RESERVADA', descripcion: '' },
    { id: 9, id_hotel: 2, id_piso: 4, id_tipo: 1, numero: '101', estado: 'DISPONIBLE', descripcion: '' },
    { id: 10, id_hotel: 2, id_piso: 4, id_tipo: 2, numero: '102', estado: 'OCUPADA', descripcion: '' },
    { id: 11, id_hotel: 2, id_piso: 5, id_tipo: 4, numero: '201', estado: 'RESERVADA', descripcion: '' },
  ];

  huespedes = [
    { id: 1, nombre: 'Carlos', apellido: 'Mamani', ci: '5551111', telefono: '70011223', email: 'carlos.mamani@mail.com', estado: 'ACTIVO' },
    { id: 2, nombre: 'Ana', apellido: 'Quispe', ci: '5552222', telefono: '70022334', email: 'ana.quispe@mail.com', estado: 'ACTIVO' },
    { id: 3, nombre: 'Jorge', apellido: 'Flores', ci: '5553333', telefono: '70033445', email: 'jorge.flores@mail.com', estado: 'ACTIVO' },
    { id: 4, nombre: 'Lucía', apellido: 'Vargas', ci: '5554444', telefono: '70044556', email: 'lucia.vargas@mail.com', estado: 'ACTIVO' },
    { id: 5, nombre: 'Pedro', apellido: 'Rojas', ci: '5555555', telefono: '70055667', email: 'pedro.rojas@mail.com', estado: 'ACTIVO' },
  ];

  servicios = [
    { id: 1, nombre: 'Desayuno Buffet', descripcion: 'Desayuno completo en restaurante', tipo: 'PERSONA', frecuencia: 'DIARIO', precio: 45, estado: 'ACTIVO' },
    { id: 2, nombre: 'Lavandería', descripcion: 'Servicio de lavado y planchado', tipo: 'HABITACION', frecuencia: 'POR_USO', precio: 60, estado: 'ACTIVO' },
    { id: 3, nombre: 'Spa', descripcion: 'Sesión de spa y masajes', tipo: 'PERSONA', frecuencia: 'UNICO', precio: 200, estado: 'ACTIVO' },
    { id: 4, nombre: 'Minibar', descripcion: 'Consumo de minibar', tipo: 'HABITACION', frecuencia: 'UNICO', precio: 80, estado: 'ACTIVO' },
    { id: 5, nombre: 'Room Service', descripcion: 'Servicio a la habitación', tipo: 'HABITACION', frecuencia: 'POR_USO', precio: 50, estado: 'ACTIVO' },
  ];

  reservas = []; reservaHabitaciones = []; huespedesReserva = []; consumos = []; pagos = [];

  const crearReservaSeed = ({ id_huesped, id_hotel, entrada, salida, adultos, ninos, estado, habitacionId }) => {
    const reservaId = nextId(reservas);
    const habitacion = habitaciones.find((h) => h.id === habitacionId);
    const noches = diffNights(entrada, salida);
    const precioPorNoche = tipos.find((t) => t.id === habitacion.id_tipo).precio_base;
    const totalHabitacion = precioPorNoche * noches;
    reservas.push({ id: reservaId, id_huesped, id_hotel, fecha_entrada: entrada, fecha_salida: salida, adultos, ninos, estado, total: totalHabitacion, created_at: relDateTime(-noches - 1) });
    reservaHabitaciones.push({ id: nextId(reservaHabitaciones), id_reserva: reservaId, id_habitacion: habitacionId, precio_por_noche: precioPorNoche, noches, total: totalHabitacion });
    return reservaId;
  };
  const recalcular = (reservaId) => {
    const totalHab = reservaHabitaciones.filter((rh) => rh.id_reserva === reservaId).reduce((s, rh) => s + rh.total, 0);
    const totalCons = consumos.filter((c) => c.id_reserva === reservaId).reduce((s, c) => s + c.subtotal, 0);
    const r = reservas.find((rr) => rr.id === reservaId);
    r.total = totalHab + totalCons;
  };

  // R1: COMPLETADA, en el pasado, habitación 301 (ya liberada -> DISPONIBLE)
  const r1 = crearReservaSeed({ id_huesped: 1, id_hotel: 1, entrada: relDate(-10), salida: relDate(-7), adultos: 2, ninos: 0, estado: 'COMPLETADA', habitacionId: 7 });
  consumos.push({ id: nextId(consumos), id_reserva: r1, id_servicio: 1, cantidad: 1, fecha: relDate(-9), subtotal: 45 });
  consumos.push({ id: nextId(consumos), id_reserva: r1, id_servicio: 1, cantidad: 1, fecha: relDate(-8), subtotal: 45 });
  recalcular(r1);
  pagos.push({ id: nextId(pagos), id_reserva: r1, tipo_pago: 'EFECTIVO', monto: reservas.find((r) => r.id === r1).total, fecha: relDate(-7), estado: 'ACTIVO', motivo_anulacion: null, fecha_anulacion: null });

  // R2: EN_PROCESO, huésped hospedado, checkout HOY, habitación 103 -> OCUPADA
  const r2 = crearReservaSeed({ id_huesped: 2, id_hotel: 1, entrada: relDate(-4), salida: relDate(0), adultos: 2, ninos: 0, estado: 'EN_PROCESO', habitacionId: 3 });
  consumos.push({ id: nextId(consumos), id_reserva: r2, id_servicio: 1, cantidad: 1, fecha: relDate(-1), subtotal: 45 });
  consumos.push({ id: nextId(consumos), id_reserva: r2, id_servicio: 4, cantidad: 1, fecha: relDate(-1), subtotal: 80 });
  recalcular(r2);
  pagos.push({ id: nextId(pagos), id_reserva: r2, tipo_pago: 'TARJETA', monto: 800, fecha: relDate(0), estado: 'ACTIVO', motivo_anulacion: null, fecha_anulacion: null });

  // R3: CONFIRMADA, check-in HOY, habitación 203 -> RESERVADA
  const r3 = crearReservaSeed({ id_huesped: 3, id_hotel: 1, entrada: relDate(0), salida: relDate(3), adultos: 3, ninos: 1, estado: 'CONFIRMADA', habitacionId: 6 });

  // R4: CONFIRMADA, futura, hotel 2, habitación 201 -> RESERVADA
  crearReservaSeed({ id_huesped: 1, id_hotel: 2, entrada: relDate(6), salida: relDate(9), adultos: 2, ninos: 0, estado: 'CONFIRMADA', habitacionId: 11 });

  // R5: EN_PROCESO, hotel 2, habitación 102 -> OCUPADA
  const r5 = crearReservaSeed({ id_huesped: 5, id_hotel: 2, entrada: relDate(-1), salida: relDate(4), adultos: 1, ninos: 0, estado: 'EN_PROCESO', habitacionId: 10 });
  consumos.push({ id: nextId(consumos), id_reserva: r5, id_servicio: 5, cantidad: 1, fecha: relDate(0), subtotal: 50 });
  recalcular(r5);
  pagos.push({ id: nextId(pagos), id_reserva: r5, tipo_pago: 'EFECTIVO', monto: reservas.find((r) => r.id === r5).total, fecha: relDate(-1), estado: 'ACTIVO', motivo_anulacion: null, fecha_anulacion: null });

  // R6: PENDIENTE (recién creada, sin confirmar), habitación 302 -> RESERVADA
  crearReservaSeed({ id_huesped: 4, id_hotel: 1, entrada: relDate(1), salida: relDate(2), adultos: 1, ninos: 0, estado: 'PENDIENTE', habitacionId: 8 });

  // R7: CANCELADA, en el pasado
  const r7 = crearReservaSeed({ id_huesped: 2, id_hotel: 1, entrada: relDate(-15), salida: relDate(-12), adultos: 2, ninos: 0, estado: 'CANCELADA', habitacionId: 4 });
  void r7;

  mantenimientos = [
    { id: 1, id_habitacion: 5, descripcion: 'Reparación de aire acondicionado', fecha: relDate(-3), costo: 350, completado: false },
  ];

  solicitudes = [
    {
      id: 1, solicitante_id: 3, autorizador_id: null, tipo: 'editar_huesped', modelo: 'App\\Models\\Huesped', modelo_id: 2,
      motivo: 'Corregir número de teléfono mal digitado en el registro del huésped.', datos_nuevos: null,
      estado: 'PENDIENTE', comentario_autorizador: null, fecha_respuesta: null, used_at: null, created_at: relDateTime(0),
    },
  ];

  auditoria = [
    { id: 1, user_id: 1, accion: 'CREATE', modelo: 'App\\Models\\Empleado', modelo_id: 2, valores_antiguos: null, valores_nuevos: { usuario: 'gerente' }, ip_address: '127.0.0.1', user_agent: 'simulated', created_at: relDateTime(-20) },
    { id: 2, user_id: 2, accion: 'CREATE', modelo: 'App\\Models\\Reserva', modelo_id: r1, valores_antiguos: null, valores_nuevos: { id_huesped: 1 }, ip_address: '127.0.0.1', user_agent: 'simulated', created_at: relDateTime(-10) },
  ];

  currentEmpleadoId = null;
  persistAll();
}

if (!localStorage.getItem(KEYS.seeded)) {
  seed();
}

export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  currentEmpleadoId = null;
  seed();
}

// ---------- Helpers de dominio ----------
function rolOf(idRol) { return roles.find((r) => r.id === idRol); }
function permisosDeRol(idRol) {
  return rolPermisos.filter((rp) => rp.id_rol === idRol).map((rp) => permisos.find((p) => p.id === rp.id_permiso)).filter(Boolean);
}
function isUnrestricted(rolNombre) { return rolNombre === 'Administrador' || rolNombre === 'Gerente'; }
function effectiveHotelFilter(requestedIdHotel) {
  const emp = resolveCurrentEmpleado();
  const rol = emp ? rolOf(emp.id_rol) : null;
  if (emp && rol && !isUnrestricted(rol.nombre)) return emp.id_hotel;
  return requestedIdHotel !== undefined && requestedIdHotel !== null && requestedIdHotel !== '' ? Number(requestedIdHotel) : undefined;
}
function empleadoTienePermiso(nombre) {
  const emp = resolveCurrentEmpleado();
  if (!emp) return false;
  const rol = rolOf(emp.id_rol);
  if (!rol) return false;
  if (rol.nombre === 'Administrador') return true;
  return permisosDeRol(rol.id).some((p) => p.nombre === nombre);
}

function tieneAutorizacionVigente(huespedId) {
  const emp = resolveCurrentEmpleado();
  if (!emp) return false;
  const hace24h = Date.now() - 24 * 60 * 60 * 1000;
  return solicitudes.some((s) =>
    s.solicitante_id === emp.id && s.modelo === 'App\\Models\\Huesped' && s.modelo_id === huespedId &&
    s.estado === 'APROBADA' && !s.used_at && new Date(s.created_at).getTime() >= hace24h
  );
}

// ---------- DTOs ----------
function rolBasicDTO(idRol) {
  const r = rolOf(idRol);
  return r ? { id: r.id, nombre: r.nombre, descripcion: r.descripcion } : null;
}
function rolConPermisosDTO(idRol) {
  const r = rolOf(idRol);
  if (!r) return null;
  return { id: r.id, nombre: r.nombre, descripcion: r.descripcion, permisos: permisosDeRol(idRol) };
}
function hotelBasicDTO(idHotel) {
  const h = hoteles.find((hh) => hh.id === idHotel);
  return h ? { id: h.id, nombre: h.nombre, direccion: h.direccion, ciudad: h.ciudad, estado: h.estado } : null;
}
function empleadoDTO(emp, { withPermisos = false } = {}) {
  return {
    id: emp.id, id_rol: emp.id_rol, id_hotel: emp.id_hotel, nombre: emp.nombre, apellido: emp.apellido,
    usuario: emp.usuario, estado: emp.estado,
    rol: withPermisos ? rolConPermisosDTO(emp.id_rol) : rolBasicDTO(emp.id_rol),
    hotel: emp.id_hotel ? hotelBasicDTO(emp.id_hotel) : null,
  };
}
function tipoDTO(t) { return { ...t }; }
function habitacionDTO(h) {
  return { ...h, hotel: hotelBasicDTO(h.id_hotel), piso: pisos.find((p) => p.id === h.id_piso) ? { id: h.id_piso, numero: pisos.find((p) => p.id === h.id_piso).numero } : null, tipo: tipoDTO(tipos.find((t) => t.id === h.id_tipo)) };
}
function pisoDTO(p) {
  return { ...p, hotel: hotelBasicDTO(p.id_hotel), habitaciones: habitaciones.filter((h) => h.id_piso === p.id).map(habitacionDTO) };
}
function hotelDTO(h) {
  return { ...h, pisos: pisos.filter((p) => p.id_hotel === h.id), habitaciones: habitaciones.filter((hh) => hh.id_hotel === h.id).map(habitacionDTO) };
}
function huespedDTO(h) {
  return { ...h, can_edit: empleadoTienePermiso('gestionar_huespedes') || tieneAutorizacionVigente(h.id) };
}
function habitacionConPivotDTO(rh) {
  const hab = habitacionDTO(habitaciones.find((h) => h.id === rh.id_habitacion));
  return { ...hab, pivot: { precio_por_noche: rh.precio_por_noche, noches: rh.noches, total: rh.total } };
}
function reservaListDTO(r) {
  return {
    ...r, huesped: huespedes.find((h) => h.id === r.id_huesped) || null, hotel: hotelBasicDTO(r.id_hotel),
    habitaciones: reservaHabitaciones.filter((rh) => rh.id_reserva === r.id).map(habitacionConPivotDTO),
  };
}
function calcularNochesReserva(r) { return diffNights(r.fecha_entrada, r.fecha_salida); }
function calcularTotalHabitacionesReserva(id) { return reservaHabitaciones.filter((rh) => rh.id_reserva === id).reduce((s, rh) => s + rh.total, 0); }
function calcularTotalConsumosReserva(id) { return consumos.filter((c) => c.id_reserva === id).reduce((s, c) => s + c.subtotal, 0); }
function calcularTotalPagosReserva(id) { return pagos.filter((p) => p.id_reserva === id && p.estado === 'ACTIVO').reduce((s, p) => s + p.monto, 0); }
function calcularSaldoReserva(id) {
  const r = reservas.find((rr) => rr.id === id);
  return r.total - calcularTotalPagosReserva(id);
}
function reservaShowDTO(r) {
  return {
    ...r, huesped: huespedes.find((h) => h.id === r.id_huesped) || null, hotel: hotelBasicDTO(r.id_hotel),
    habitaciones: reservaHabitaciones.filter((rh) => rh.id_reserva === r.id).map(habitacionConPivotDTO),
    huespedes_adicionales: huespedesReserva.filter((hr) => hr.id_reserva === r.id).map((hr) => huespedes.find((h) => h.id === hr.id_huesped)).filter(Boolean),
    consumos: consumos.filter((c) => c.id_reserva === r.id).map(consumoDTO),
    pagos: pagos.filter((p) => p.id_reserva === r.id).map(pagoDTO),
    noches: calcularNochesReserva(r), total_habitaciones: calcularTotalHabitacionesReserva(r.id),
    total_consumos: calcularTotalConsumosReserva(r.id), total_pagos: calcularTotalPagosReserva(r.id), saldo: calcularSaldoReserva(r.id),
  };
}
function servicioDTO(s) { return { ...s }; }
function consumoDTO(c) {
  const reserva = reservas.find((r) => r.id === c.id_reserva);
  return {
    ...c, servicio: servicioDTO(servicios.find((s) => s.id === c.id_servicio)),
    reserva: reserva ? { id: reserva.id, huesped: huespedes.find((h) => h.id === reserva.id_huesped) || null, habitacion: reservaHabitaciones.filter((rh) => rh.id_reserva === reserva.id).map((rh) => habitaciones.find((h) => h.id === rh.id_habitacion)) } : null,
  };
}
function pagoDTO(p) {
  const reserva = reservas.find((r) => r.id === p.id_reserva);
  return {
    ...p, reserva: reserva ? { id: reserva.id, huesped: huespedes.find((h) => h.id === reserva.id_huesped) || null, habitaciones: reservaHabitaciones.filter((rh) => rh.id_reserva === reserva.id).map((rh) => habitaciones.find((h) => h.id === rh.id_habitacion)) } : null,
  };
}
function mantenimientoDTO(m) {
  const hab = habitaciones.find((h) => h.id === m.id_habitacion);
  return { ...m, estado: m.completado ? 'COMPLETADO' : 'ACTIVO', habitacion: hab ? { ...hab, hotel: hotelBasicDTO(hab.id_hotel) } : null };
}
function auditoriaDTO(a) {
  const emp = empleados.find((e) => e.id === a.user_id);
  return { ...a, user: emp ? { id: emp.id, name: `${emp.nombre} ${emp.apellido}`, usuario: emp.usuario } : null };
}
function solicitudDTO(s) {
  const solicitante = empleados.find((e) => e.id === s.solicitante_id);
  const autorizador = empleados.find((e) => e.id === s.autorizador_id);
  return {
    ...s,
    solicitante: solicitante ? { id: solicitante.id, nombre: `${solicitante.nombre} ${solicitante.apellido}` } : null,
    autorizador: autorizador ? { id: autorizador.id, nombre: `${autorizador.nombre} ${autorizador.apellido}` } : null,
  };
}

// ---------- Auth ----------
export function authenticate(usuario, password) {
  const emp = empleados.find((e) => e.usuario === usuario);
  if (!emp || emp.password !== password) {
    emitApiSim(Seg.AUTH_LOGIN_FAILED, { usuario, message: 'Credenciales incorrectas' }, { statusCode: 401, requestBody: { usuario, password: '••••••' } });
    throw new ApiError(401, { success: false, message: 'Credenciales incorrectas' });
  }
  if (emp.estado !== 'ACTIVO') {
    emitApiSim(Seg.AUTH_LOGIN_FAILED, { usuario, message: 'Usuario inactivo' }, { statusCode: 403, requestBody: { usuario, password: '••••••' } });
    throw new ApiError(403, { success: false, message: 'Usuario inactivo, contacte al administrador' });
  }
  currentEmpleadoId = emp.id;
  const token = `demo-token-${crypto.randomUUID()}`;
  const dto = empleadoDTO(emp, { withPermisos: true });
  persistAll();
  emitApiSim(Seg.AUTH_LOGIN, { usuario, empleadoId: emp.id, token: token.slice(0, 18), empleado: dto }, { requestBody: { usuario, password: '••••••' } });
  return { success: true, data: { empleado: dto, token } };
}

export function logout() {
  currentEmpleadoId = null;
  emitApiSim(Seg.AUTH_LOGOUT, {});
  return { success: true, message: 'Sesión cerrada' };
}

export function fetchMe() {
  const emp = resolveCurrentEmpleado();
  if (!emp) throw new ApiError(401, { success: false, message: 'No autenticado' });
  const dto = empleadoDTO(emp, { withPermisos: true });
  emitApiSim(Seg.AUTH_ME, { empleadoId: emp.id, empleado: dto });
  return { success: true, data: dto };
}

export function cambiarPassword({ password_actual, password_nuevo }) {
  const emp = resolveCurrentEmpleado();
  if (!emp) throw new ApiError(401, { success: false, message: 'No autenticado' });
  if (emp.password !== password_actual) {
    throw new ApiError(422, { success: false, message: 'La contraseña actual no coincide' });
  }
  emp.password = password_nuevo;
  persistAll();
  emitApiSim(Seg.AUTH_CAMBIAR_PASSWORD, { empleadoId: emp.id });
  return { success: true, message: 'Contraseña actualizada' };
}

// ---------- Hoteles ----------
export function listHoteles(filtros = {}) {
  let list = [...hoteles];
  if (filtros.estado) list = list.filter((h) => h.estado === filtros.estado);
  if (filtros.buscar) {
    const term = filtros.buscar.toLowerCase();
    list = list.filter((h) => h.nombre.toLowerCase().includes(term) || h.ciudad.toLowerCase().includes(term));
  }
  const dto = list.map(hotelDTO);
  emitApiSim(Cat.HOTEL_LIST, { hoteles: dto });
  return { success: true, data: dto };
}
export function createHotel(datos) {
  const nuevo = { id: nextId(hoteles), nombre: datos.nombre, direccion: datos.direccion, ciudad: datos.ciudad, estado: datos.estado || 'ACTIVO' };
  hoteles.push(nuevo);
  logAuditoria('CREATE', 'Hotel', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Cat.HOTEL_CREATE, { ...datos, hotel: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: hotelDTO(nuevo) };
}
export function updateHotel(id, datos) {
  const h = hoteles.find((hh) => hh.id === id);
  if (!h) throw new ApiError(404, { success: false, message: 'Hotel no encontrado' });
  const antes = { ...h };
  Object.assign(h, datos);
  logAuditoria('UPDATE', 'Hotel', id, antes, datos);
  persistAll();
  emitApiSim(Cat.HOTEL_UPDATE, { id, fields: Object.keys(datos).join(', '), hotel: h }, { requestBody: datos });
  return { success: true, data: hotelDTO(h) };
}
export function deleteHotel(id) {
  const h = hoteles.find((hh) => hh.id === id);
  if (!h) throw new ApiError(404, { success: false, message: 'Hotel no encontrado' });
  h.estado = 'CERRADO';
  logAuditoria('UPDATE', 'Hotel', id, null, { estado: 'CERRADO' });
  persistAll();
  emitApiSim(Cat.HOTEL_DELETE, { id });
  return { success: true };
}
export function hotelDashboardData(id) {
  const hotel = hoteles.find((h) => h.id === id);
  if (!hotel) throw new ApiError(404, { success: false, message: 'Hotel no encontrado' });
  const habs = habitaciones.filter((h) => h.id_hotel === id);
  const data = {
    hotel: hotelDTO(hotel), total_habitaciones: habs.length,
    habitaciones_disponibles: habs.filter((h) => h.estado === 'DISPONIBLE').length,
    habitaciones_ocupadas: habs.filter((h) => h.estado === 'OCUPADA').length,
    reservas_hoy: reservas.filter((r) => r.id_hotel === id && r.fecha_entrada === todayISO()).length,
    reservas_activas: reservas.filter((r) => r.id_hotel === id && r.estado === 'EN_PROCESO').length,
  };
  emitApiSim(Cat.HOTEL_DASHBOARD, { id, data });
  return { success: true, data };
}

// ---------- Pisos ----------
export function listPisos(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  let list = [...pisos];
  if (idHotel !== undefined) list = list.filter((p) => p.id_hotel === idHotel);
  if (filtros.estado) list = list.filter((p) => p.estado === filtros.estado);
  const dto = list.map(pisoDTO);
  emitApiSim(Cat.PISO_LIST, { pisos: dto });
  return { success: true, data: dto };
}
export function createPiso(datos) {
  if (pisos.some((p) => p.id_hotel === Number(datos.id_hotel) && p.numero === Number(datos.numero))) {
    throw new ApiError(422, { success: false, message: 'Ya existe un piso con ese número en el hotel' });
  }
  const nuevo = { id: nextId(pisos), id_hotel: Number(datos.id_hotel), numero: Number(datos.numero), estado: datos.estado || 'ACTIVO' };
  pisos.push(nuevo);
  logAuditoria('CREATE', 'Piso', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Cat.PISO_CREATE, { ...datos, piso: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: pisoDTO(nuevo) };
}
export function updatePiso(id, datos) {
  const p = pisos.find((pp) => pp.id === id);
  if (!p) throw new ApiError(404, { success: false, message: 'Piso no encontrado' });
  Object.assign(p, datos.numero !== undefined ? { ...datos, numero: Number(datos.numero) } : datos);
  logAuditoria('UPDATE', 'Piso', id, null, datos);
  persistAll();
  emitApiSim(Cat.PISO_UPDATE, { id, fields: Object.keys(datos).join(', '), piso: p }, { requestBody: datos });
  return { success: true, data: pisoDTO(p) };
}
export function deletePiso(id) {
  if (habitaciones.some((h) => h.id_piso === id)) {
    throw new ApiError(422, { success: false, message: 'El piso tiene habitaciones asociadas' });
  }
  pisos = pisos.filter((p) => p.id !== id);
  logAuditoria('DELETE', 'Piso', id, null, null);
  persistAll();
  emitApiSim(Cat.PISO_DELETE, { id });
  return { success: true };
}

// ---------- Tipos de habitación ----------
export function listTipos(filtros = {}) {
  let list = [...tipos];
  if (filtros.estado) list = list.filter((t) => t.estado === filtros.estado);
  const dto = list.map(tipoDTO);
  emitApiSim(Cat.TIPO_LIST, { tipos: dto });
  return { success: true, data: dto };
}
export function createTipo(datos) {
  const nuevo = { id: nextId(tipos), nombre: datos.nombre, descripcion: datos.descripcion || '', capacidad: Number(datos.capacidad), precio_base: Number(datos.precio_base), estado: datos.estado || 'ACTIVO' };
  tipos.push(nuevo);
  logAuditoria('CREATE', 'TipoHabitacion', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Cat.TIPO_CREATE, { ...datos, tipo: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: nuevo };
}
export function updateTipo(id, datos) {
  const t = tipos.find((tt) => tt.id === id);
  if (!t) throw new ApiError(404, { success: false, message: 'Tipo no encontrado' });
  Object.assign(t, datos);
  logAuditoria('UPDATE', 'TipoHabitacion', id, null, datos);
  persistAll();
  emitApiSim(Cat.TIPO_UPDATE, { id, fields: Object.keys(datos).join(', '), tipo: t }, { requestBody: datos });
  return { success: true, data: t };
}
export function deleteTipo(id) {
  if (habitaciones.some((h) => h.id_tipo === id)) {
    throw new ApiError(422, { success: false, message: 'El tipo tiene habitaciones asociadas' });
  }
  tipos = tipos.filter((t) => t.id !== id);
  logAuditoria('DELETE', 'TipoHabitacion', id, null, null);
  persistAll();
  emitApiSim(Cat.TIPO_DELETE, { id });
  return { success: true };
}

// ---------- Habitaciones ----------
export function listHabitaciones(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  let list = [...habitaciones];
  if (idHotel !== undefined) list = list.filter((h) => h.id_hotel === idHotel);
  if (filtros.id_piso) list = list.filter((h) => h.id_piso === Number(filtros.id_piso));
  if (filtros.estado) list = list.filter((h) => h.estado === filtros.estado);
  if (filtros.buscar) list = list.filter((h) => h.numero.includes(filtros.buscar));
  const dto = list.map(habitacionDTO);
  emitApiSim(Cat.HABITACION_LIST, { habitaciones: dto });
  return { success: true, data: dto };
}
export function listHabitacionesDisponibles(idHotel) {
  let list = habitaciones.filter((h) => h.estado === 'DISPONIBLE');
  if (idHotel) list = list.filter((h) => h.id_hotel === Number(idHotel));
  const dto = list.map(habitacionDTO);
  emitApiSim(Cat.HABITACION_DISPONIBLES, { idHotel, habitaciones: dto });
  return { success: true, data: dto };
}
export function createHabitacion(datos) {
  if (habitaciones.some((h) => h.id_hotel === Number(datos.id_hotel) && h.numero === datos.numero)) {
    throw new ApiError(422, { success: false, message: 'Ya existe una habitación con ese número en el hotel' });
  }
  const nuevo = { id: nextId(habitaciones), id_hotel: Number(datos.id_hotel), id_piso: Number(datos.id_piso), id_tipo: Number(datos.id_tipo), numero: datos.numero, estado: datos.estado || 'DISPONIBLE', descripcion: datos.descripcion || '' };
  habitaciones.push(nuevo);
  logAuditoria('CREATE', 'Habitacion', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Cat.HABITACION_CREATE, { ...datos, habitacion: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: habitacionDTO(nuevo) };
}
export function updateHabitacion(id, datos) {
  const h = habitaciones.find((hh) => hh.id === id);
  if (!h) throw new ApiError(404, { success: false, message: 'Habitación no encontrada' });
  Object.assign(h, datos);
  logAuditoria('UPDATE', 'Habitacion', id, null, datos);
  persistAll();
  emitApiSim(Cat.HABITACION_UPDATE, { id, fields: Object.keys(datos).join(', '), habitacion: h }, { requestBody: datos });
  return { success: true, data: habitacionDTO(h) };
}
export function cambiarEstadoHabitacion(id, estado) {
  const h = habitaciones.find((hh) => hh.id === id);
  if (!h) throw new ApiError(404, { success: false, message: 'Habitación no encontrada' });
  h.estado = estado;
  logAuditoria('UPDATE', 'Habitacion', id, null, { estado });
  persistAll();
  emitApiSim(Cat.HABITACION_CAMBIAR_ESTADO, { id, estado, habitacion: h });
  return { success: true, data: habitacionDTO(h) };
}
export function deleteHabitacion(id) {
  const h = habitaciones.find((hh) => hh.id === id);
  if (!h) throw new ApiError(404, { success: false, message: 'Habitación no encontrada' });
  h.estado = 'DEMOLIDA';
  logAuditoria('UPDATE', 'Habitacion', id, null, { estado: 'DEMOLIDA' });
  persistAll();
  emitApiSim(Cat.HABITACION_DELETE, { id });
  return { success: true };
}

// ---------- Huéspedes ----------
export function listHuespedes(filtros = {}) {
  let list = [...huespedes];
  if (filtros.estado) list = list.filter((h) => h.estado === filtros.estado);
  if (filtros.buscar) {
    const term = filtros.buscar.toLowerCase();
    list = list.filter((h) => h.nombre.toLowerCase().includes(term) || h.apellido.toLowerCase().includes(term) || h.ci.includes(term) || (h.email || '').toLowerCase().includes(term));
  }
  const dto = list.map(huespedDTO);
  emitApiSim(Ops.HUESPED_LIST, { huespedes: dto });
  return { success: true, data: dto };
}
export function createHuesped(datos) {
  if (huespedes.some((h) => h.ci === datos.ci)) {
    throw new ApiError(422, { success: false, message: 'Ya existe un huésped registrado con ese CI' });
  }
  const nuevo = { id: nextId(huespedes), nombre: datos.nombre, apellido: datos.apellido, ci: datos.ci, telefono: datos.telefono || '', email: datos.email || '', estado: 'ACTIVO' };
  huespedes.push(nuevo);
  logAuditoria('CREATE', 'Huesped', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Ops.HUESPED_CREATE, { ...datos, huesped: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: huespedDTO(nuevo) };
}
export function updateHuesped(id, datos) {
  const h = huespedes.find((hh) => hh.id === id);
  if (!h) throw new ApiError(404, { success: false, message: 'Huésped no encontrado' });
  const autorizado = empleadoTienePermiso('gestionar_huespedes') || tieneAutorizacionVigente(id);
  if (!autorizado) throw new ApiError(403, { success: false, message: 'No autorizado para editar este huésped' });
  if (datos.ci && huespedes.some((hh) => hh.ci === datos.ci && hh.id !== id)) {
    throw new ApiError(422, { success: false, message: 'Ese CI ya está registrado en otro huésped' });
  }
  Object.assign(h, datos);
  const solicitud = solicitudes.find((s) => s.solicitante_id === resolveCurrentEmpleado()?.id && s.modelo === 'App\\Models\\Huesped' && s.modelo_id === id && s.estado === 'APROBADA' && !s.used_at);
  if (solicitud && !empleadoTienePermiso('gestionar_huespedes')) solicitud.used_at = new Date().toISOString();
  logAuditoria('UPDATE', 'Huesped', id, null, datos);
  persistAll();
  emitApiSim(Ops.HUESPED_UPDATE, { id, fields: Object.keys(datos).join(', '), huesped: h }, { requestBody: datos });
  return { success: true, data: huespedDTO(h) };
}
export function deleteHuesped(id) {
  const h = huespedes.find((hh) => hh.id === id);
  if (!h) throw new ApiError(404, { success: false, message: 'Huésped no encontrado' });
  h.estado = 'INACTIVO';
  logAuditoria('UPDATE', 'Huesped', id, null, { estado: 'INACTIVO' });
  persistAll();
  emitApiSim(Ops.HUESPED_DELETE, { id });
  return { success: true };
}
export function buscarHuespedPorCi(ci) {
  const h = huespedes.find((hh) => hh.ci === ci);
  emitApiSim(Ops.HUESPED_BUSCAR_CI, { ci, huesped: h ? huespedDTO(h) : null });
  if (!h) throw new ApiError(404, { success: false, message: 'No encontrado' });
  return { success: true, data: huespedDTO(h) };
}

// ---------- Reservas ----------
export function listReservas(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  let list = [...reservas];
  if (idHotel !== undefined) list = list.filter((r) => r.id_hotel === idHotel);
  if (filtros.estado) {
    const estados = filtros.estado.split(',');
    list = list.filter((r) => estados.includes(r.estado));
  }
  if (filtros.fecha_entrada) list = list.filter((r) => r.fecha_entrada === filtros.fecha_entrada);
  list = [...list].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  const dto = list.map(reservaListDTO);
  emitApiSim(Ops.RESERVA_LIST, { reservas: dto });
  return { success: true, data: dto };
}
export function createReserva(datos) {
  const noches = diffNights(datos.fecha_entrada, datos.fecha_salida);
  const reservaId = nextId(reservas);
  const nueva = { id: reservaId, id_huesped: Number(datos.id_huesped), id_hotel: Number(datos.id_hotel), fecha_entrada: datos.fecha_entrada, fecha_salida: datos.fecha_salida, adultos: Number(datos.adultos), ninos: Number(datos.ninos || 0), estado: 'PENDIENTE', total: 0, created_at: new Date().toISOString() };
  reservas.push(nueva);
  const habitacionesSqlParts = [];
  const habitacionIds = [];
  (datos.habitaciones || []).forEach((item) => {
    const idHabitacion = Number(item.id_habitacion);
    const habitacion = habitaciones.find((h) => h.id === idHabitacion);
    const tipo = tipos.find((t) => t.id === habitacion.id_tipo);
    const total = tipo.precio_base * noches;
    reservaHabitaciones.push({ id: nextId(reservaHabitaciones), id_reserva: reservaId, id_habitacion: idHabitacion, precio_por_noche: tipo.precio_base, noches, total });
    habitacion.estado = 'RESERVADA';
    habitacionesSqlParts.push(`(${reservaId}, ${idHabitacion}, ${tipo.precio_base}, ${noches}, ${total})`);
    habitacionIds.push(idHabitacion);
  });
  (datos.huespedes_adicionales || []).forEach((idHuesped) => {
    huespedesReserva.push({ id_reserva: reservaId, id_huesped: Number(idHuesped) });
  });
  nueva.total = calcularTotalHabitacionesReserva(reservaId) + calcularTotalConsumosReserva(reservaId);
  logAuditoria('CREATE', 'Reserva', reservaId, null, nueva);
  persistAll();
  emitApiSim(Ops.RESERVA_CREATE, { ...datos, habitacionesSql: habitacionesSqlParts.join(', '), habitacionIds: habitacionIds.join(', '), reserva: nueva }, { statusCode: 201, requestBody: datos });
  return { success: true, data: nueva };
}
export function showReserva(id) {
  const r = reservas.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  const data = reservaShowDTO(r);
  emitApiSim(Ops.RESERVA_SHOW, { id, data });
  return { success: true, data };
}
export function updateReserva(id, datos) {
  const r = reservas.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  Object.assign(r, datos);
  logAuditoria('UPDATE', 'Reserva', id, null, datos);
  persistAll();
  emitApiSim(Ops.RESERVA_UPDATE, { id, fields: Object.keys(datos).join(', '), reserva: r }, { requestBody: datos });
  return { success: true, data: r };
}
export function cancelarReserva(id) {
  const r = reservas.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  r.estado = 'CANCELADA';
  const habitacionIds = [];
  reservaHabitaciones.filter((rh) => rh.id_reserva === id).forEach((rh) => {
    const hab = habitaciones.find((h) => h.id === rh.id_habitacion);
    if (hab.estado === 'RESERVADA') { hab.estado = 'DISPONIBLE'; habitacionIds.push(hab.id); }
  });
  logAuditoria('UPDATE', 'Reserva', id, null, { estado: 'CANCELADA' });
  persistAll();
  emitApiSim(Ops.RESERVA_CANCELAR, { id, habitacionIds: habitacionIds.join(', ') });
  return { success: true };
}
export function confirmarReserva(id) {
  const r = reservas.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  if (r.estado !== 'PENDIENTE') throw new ApiError(422, { success: false, message: 'La reserva no está pendiente' });
  r.estado = 'CONFIRMADA';
  reservaHabitaciones.filter((rh) => rh.id_reserva === id).forEach((rh) => { habitaciones.find((h) => h.id === rh.id_habitacion).estado = 'RESERVADA'; });
  logAuditoria('UPDATE', 'Reserva', id, null, { estado: 'CONFIRMADA' });
  persistAll();
  emitApiSim(Ops.RESERVA_CONFIRMAR, { id, reserva: r });
  return { success: true, data: r };
}
export function checkInReserva(id) {
  const r = reservas.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  if (r.estado !== 'CONFIRMADA') throw new ApiError(422, { success: false, message: 'La reserva no está confirmada' });
  r.estado = 'EN_PROCESO';
  const habitacionIds = [];
  reservaHabitaciones.filter((rh) => rh.id_reserva === id).forEach((rh) => { habitaciones.find((h) => h.id === rh.id_habitacion).estado = 'OCUPADA'; habitacionIds.push(rh.id_habitacion); });
  logAuditoria('UPDATE', 'Reserva', id, null, { estado: 'EN_PROCESO' });
  persistAll();
  emitApiSim(Ops.RESERVA_CHECKIN, { id, habitacionIds: habitacionIds.join(', '), reserva: r });
  return { success: true, data: r };
}
export function checkOutReserva(id) {
  const r = reservas.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  if (r.estado !== 'EN_PROCESO') throw new ApiError(422, { success: false, message: 'La reserva no está en proceso' });
  r.estado = 'COMPLETADA';
  const habitacionIds = [];
  reservaHabitaciones.filter((rh) => rh.id_reserva === id).forEach((rh) => { habitaciones.find((h) => h.id === rh.id_habitacion).estado = 'DISPONIBLE'; habitacionIds.push(rh.id_habitacion); });
  logAuditoria('UPDATE', 'Reserva', id, null, { estado: 'COMPLETADA' });
  persistAll();
  emitApiSim(Ops.RESERVA_CHECKOUT, { id, habitacionIds: habitacionIds.join(', '), reserva: r });
  return { success: true, data: r };
}

// ---------- Mantenimientos ----------
export function listMantenimientos(filtros = {}) {
  let list = [...mantenimientos];
  if (filtros.id_habitacion) list = list.filter((m) => m.id_habitacion === Number(filtros.id_habitacion));
  if (filtros.fecha_inicio && filtros.fecha_fin) list = list.filter((m) => m.fecha >= filtros.fecha_inicio && m.fecha <= filtros.fecha_fin);
  list = [...list].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const dto = list.map(mantenimientoDTO);
  emitApiSim(Ops.MANTENIMIENTO_LIST, { mantenimientos: dto });
  return { success: true, data: dto };
}
export function createMantenimiento(datos) {
  const nuevo = { id: nextId(mantenimientos), id_habitacion: Number(datos.id_habitacion), descripcion: datos.descripcion, fecha: datos.fecha, costo: datos.costo != null ? Number(datos.costo) : null, completado: false };
  mantenimientos.push(nuevo);
  const hab = habitaciones.find((h) => h.id === nuevo.id_habitacion);
  hab.estado = 'MANTENIMIENTO';
  logAuditoria('CREATE', 'Mantenimiento', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Ops.MANTENIMIENTO_CREATE, { ...datos, mantenimiento: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: mantenimientoDTO(nuevo) };
}
export function updateMantenimiento(id, datos) {
  const m = mantenimientos.find((mm) => mm.id === id);
  if (!m) throw new ApiError(404, { success: false, message: 'Mantenimiento no encontrado' });
  Object.assign(m, datos);
  logAuditoria('UPDATE', 'Mantenimiento', id, null, datos);
  persistAll();
  emitApiSim(Ops.MANTENIMIENTO_UPDATE, { id, fields: Object.keys(datos).join(', '), mantenimiento: m }, { requestBody: datos });
  return { success: true, data: mantenimientoDTO(m) };
}
export function deleteMantenimiento(id) {
  mantenimientos = mantenimientos.filter((m) => m.id !== id);
  logAuditoria('DELETE', 'Mantenimiento', id, null, null);
  persistAll();
  emitApiSim(Ops.MANTENIMIENTO_DELETE, { id });
  return { success: true };
}
export function completarMantenimiento(id) {
  const m = mantenimientos.find((mm) => mm.id === id);
  if (!m) throw new ApiError(404, { success: false, message: 'Mantenimiento no encontrado' });
  m.completado = true;
  const hab = habitaciones.find((h) => h.id === m.id_habitacion);
  hab.estado = 'DISPONIBLE';
  logAuditoria('UPDATE', 'Habitacion', hab.id, null, { estado: 'DISPONIBLE' });
  persistAll();
  emitApiSim(Ops.MANTENIMIENTO_COMPLETAR, { idHabitacion: hab.id });
  return { success: true };
}

// ---------- Solicitudes de autorización ----------
export function listSolicitudes() {
  const emp = resolveCurrentEmpleado();
  const rol = emp ? rolOf(emp.id_rol) : null;
  const esRevisor = rol && (rol.nombre === 'Administrador' || rol.nombre === 'Gerente');
  const list = esRevisor ? solicitudes.filter((s) => s.estado === 'PENDIENTE') : solicitudes.filter((s) => s.solicitante_id === emp?.id);
  const dto = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(solicitudDTO);
  emitApiSim(Ops.SOLICITUD_LIST, { esRevisor, userId: emp?.id, solicitudes: dto });
  return { success: true, data: dto };
}
export function createSolicitud(datos) {
  const emp = resolveCurrentEmpleado();
  const nueva = { id: nextId(solicitudes), solicitante_id: emp?.id ?? null, autorizador_id: null, tipo: datos.tipo, modelo: datos.modelo, modelo_id: Number(datos.modelo_id), motivo: datos.motivo, datos_nuevos: datos.datos_nuevos || null, estado: 'PENDIENTE', comentario_autorizador: null, fecha_respuesta: null, used_at: null, created_at: new Date().toISOString() };
  solicitudes.push(nueva);
  logAuditoria('CREATE', 'SolicitudAutorizacion', nueva.id, null, nueva);
  persistAll();
  emitApiSim(Ops.SOLICITUD_CREATE, { ...datos, solicitanteId: emp?.id, solicitud: solicitudDTO(nueva) }, { statusCode: 201, requestBody: datos });
  return { success: true, data: solicitudDTO(nueva) };
}
export function aprobarSolicitud(id, comentario) {
  const s = solicitudes.find((ss) => ss.id === id);
  if (!s) throw new ApiError(404, { success: false, message: 'Solicitud no encontrada' });
  if (s.estado !== 'PENDIENTE') throw new ApiError(422, { success: false, message: 'La solicitud ya fue procesada' });
  const emp = resolveCurrentEmpleado();
  s.estado = 'APROBADA'; s.autorizador_id = emp?.id ?? null; s.comentario_autorizador = comentario || null; s.fecha_respuesta = new Date().toISOString();
  logAuditoria('UPDATE', 'SolicitudAutorizacion', id, null, { estado: 'APROBADA' });
  persistAll();
  emitApiSim(Ops.SOLICITUD_APROBAR, { id, autorizadorId: emp?.id, solicitud: solicitudDTO(s) });
  return { success: true, data: solicitudDTO(s) };
}
export function rechazarSolicitud(id, comentario) {
  const s = solicitudes.find((ss) => ss.id === id);
  if (!s) throw new ApiError(404, { success: false, message: 'Solicitud no encontrada' });
  if (s.estado !== 'PENDIENTE') throw new ApiError(422, { success: false, message: 'La solicitud ya fue procesada' });
  const emp = resolveCurrentEmpleado();
  s.estado = 'RECHAZADA'; s.autorizador_id = emp?.id ?? null; s.comentario_autorizador = comentario || null; s.fecha_respuesta = new Date().toISOString();
  logAuditoria('UPDATE', 'SolicitudAutorizacion', id, null, { estado: 'RECHAZADA' });
  persistAll();
  emitApiSim(Ops.SOLICITUD_RECHAZAR, { id, autorizadorId: emp?.id, solicitud: solicitudDTO(s) });
  return { success: true, data: solicitudDTO(s) };
}

// ---------- Servicios ----------
export function listServicios(filtros = {}) {
  let list = [...servicios];
  if (filtros.estado) list = list.filter((s) => s.estado === filtros.estado);
  if (filtros.tipo) list = list.filter((s) => s.tipo === filtros.tipo);
  if (filtros.frecuencia) list = list.filter((s) => s.frecuencia === filtros.frecuencia);
  const dto = list.map(servicioDTO);
  emitApiSim(Fol.SERVICIO_LIST, { servicios: dto });
  return { success: true, data: dto };
}
export function createServicio(datos) {
  const nuevo = { id: nextId(servicios), nombre: datos.nombre, descripcion: datos.descripcion || '', tipo: datos.tipo, frecuencia: datos.frecuencia, precio: Number(datos.precio), estado: datos.estado || 'ACTIVO' };
  servicios.push(nuevo);
  logAuditoria('CREATE', 'Servicio', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Fol.SERVICIO_CREATE, { ...datos, servicio: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: nuevo };
}
export function updateServicio(id, datos) {
  const s = servicios.find((ss) => ss.id === id);
  if (!s) throw new ApiError(404, { success: false, message: 'Servicio no encontrado' });
  Object.assign(s, datos);
  logAuditoria('UPDATE', 'Servicio', id, null, datos);
  persistAll();
  emitApiSim(Fol.SERVICIO_UPDATE, { id, fields: Object.keys(datos).join(', '), servicio: s }, { requestBody: datos });
  return { success: true, data: s };
}
export function deleteServicio(id) {
  if (consumos.some((c) => c.id_servicio === id)) {
    throw new ApiError(422, { success: false, message: 'El servicio tiene consumos registrados' });
  }
  servicios = servicios.filter((s) => s.id !== id);
  logAuditoria('DELETE', 'Servicio', id, null, null);
  persistAll();
  emitApiSim(Fol.SERVICIO_DELETE, { id });
  return { success: true };
}

// ---------- Consumos ----------
function paginate(list, page, perPage) {
  const total = list.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), lastPage);
  const start = (current - 1) * perPage;
  return { data: list.slice(start, start + perPage), total, per_page: perPage, current_page: current, last_page: lastPage };
}
export function listConsumos(filtros = {}) {
  let list = [...consumos];
  if (filtros.id_reserva) list = list.filter((c) => c.id_reserva === Number(filtros.id_reserva));
  if (filtros.fecha_inicio && filtros.fecha_fin) list = list.filter((c) => c.fecha >= filtros.fecha_inicio && c.fecha <= filtros.fecha_fin);
  else if (filtros.fecha) list = list.filter((c) => c.fecha === filtros.fecha);
  list = [...list].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const page = Number(filtros.page) || 1;
  const result = paginate(list.map(consumoDTO), page, 10);
  emitApiSim(Fol.CONSUMO_LIST, { page_response: { success: true, data: result } });
  return { success: true, data: result };
}
function recalcularTotalReserva(idReserva) {
  const r = reservas.find((rr) => rr.id === idReserva);
  if (r) r.total = calcularTotalHabitacionesReserva(idReserva) + calcularTotalConsumosReserva(idReserva);
}
export function createConsumo(datos) {
  const reserva = reservas.find((r) => r.id === Number(datos.id_reserva));
  if (!reserva) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  if (!['CONFIRMADA', 'EN_PROCESO'].includes(reserva.estado)) {
    throw new ApiError(422, { success: false, message: 'La reserva no admite cargos adicionales en su estado actual' });
  }
  const servicio = servicios.find((s) => s.id === Number(datos.id_servicio));
  const cantidad = Number(datos.cantidad);
  const fechas = datos.fechas && datos.fechas.length ? datos.fechas : [datos.fecha];
  const nuevos = fechas.map((fecha) => {
    const row = { id: nextId(consumos), id_reserva: reserva.id, id_servicio: servicio.id, cantidad, fecha, subtotal: servicio.precio * cantidad };
    consumos.push(row);
    return row;
  });
  recalcularTotalReserva(reserva.id);
  logAuditoria('CREATE', 'Consumo', nuevos[0].id, null, { count: nuevos.length });
  persistAll();
  const rowsSql = nuevos.map((c) => `(${c.id_reserva}, ${c.id_servicio}, ${c.cantidad}, '${c.fecha}', ${c.subtotal})`).join(', ');
  emitApiSim(Fol.CONSUMO_CREATE, { ...datos, rowsSql, consumos: nuevos.length > 1 ? nuevos.map(consumoDTO) : consumoDTO(nuevos[0]) }, { statusCode: 201, requestBody: datos });
  return { success: true, data: nuevos.length > 1 ? nuevos.map(consumoDTO) : consumoDTO(nuevos[0]) };
}
export function updateConsumo(id, datos) {
  const c = consumos.find((cc) => cc.id === id);
  if (!c) throw new ApiError(404, { success: false, message: 'Consumo no encontrado' });
  const reserva = reservas.find((r) => r.id === c.id_reserva);
  if (!['CONFIRMADA', 'EN_PROCESO'].includes(reserva.estado)) {
    throw new ApiError(422, { success: false, message: 'La reserva no admite cambios en su estado actual' });
  }
  const servicio = servicios.find((s) => s.id === c.id_servicio);
  if (datos.cantidad != null) { c.cantidad = Number(datos.cantidad); c.subtotal = servicio.precio * c.cantidad; }
  if (datos.fecha) c.fecha = datos.fecha;
  recalcularTotalReserva(c.id_reserva);
  logAuditoria('UPDATE', 'Consumo', id, null, datos);
  persistAll();
  emitApiSim(Fol.CONSUMO_UPDATE, { id, cantidad: c.cantidad, subtotal: c.subtotal, consumo: consumoDTO(c) }, { requestBody: datos });
  return { success: true, data: consumoDTO(c) };
}
export function deleteConsumo(id) {
  const c = consumos.find((cc) => cc.id === id);
  if (!c) throw new ApiError(404, { success: false, message: 'Consumo no encontrado' });
  const reserva = reservas.find((r) => r.id === c.id_reserva);
  if (!['CONFIRMADA', 'EN_PROCESO'].includes(reserva.estado)) {
    throw new ApiError(422, { success: false, message: 'La reserva no admite cambios en su estado actual' });
  }
  consumos = consumos.filter((cc) => cc.id !== id);
  recalcularTotalReserva(c.id_reserva);
  logAuditoria('DELETE', 'Consumo', id, null, null);
  persistAll();
  emitApiSim(Fol.CONSUMO_DELETE, { id });
  return { success: true };
}
export function consumosPorReserva(idReserva) {
  const list = consumos.filter((c) => c.id_reserva === idReserva).map(consumoDTO);
  const total = list.reduce((s, c) => s + c.subtotal, 0);
  return { success: true, data: list, total };
}

// ---------- Pagos ----------
export function listPagos(filtros = {}) {
  let list = filtros.incluir_anulados ? [...pagos] : pagos.filter((p) => p.estado === 'ACTIVO');
  if (filtros.id_reserva) list = list.filter((p) => p.id_reserva === Number(filtros.id_reserva));
  if (filtros.tipo_pago) list = list.filter((p) => p.tipo_pago === filtros.tipo_pago);
  if (filtros.estado) list = list.filter((p) => p.estado === filtros.estado);
  if (filtros.fecha_inicio && filtros.fecha_fin) list = list.filter((p) => p.fecha >= filtros.fecha_inicio && p.fecha <= filtros.fecha_fin);
  list = [...list].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const page = Number(filtros.page) || 1;
  const result = paginate(list.map(pagoDTO), page, 10);
  emitApiSim(Fol.PAGO_LIST, { page_response: { success: true, data: result } });
  return { success: true, data: result };
}
export function createPago(datos) {
  const reserva = reservas.find((r) => r.id === Number(datos.id_reserva));
  if (!reserva) throw new ApiError(404, { success: false, message: 'Reserva no encontrada' });
  if (!['CONFIRMADA', 'EN_PROCESO'].includes(reserva.estado)) {
    throw new ApiError(422, { success: false, message: 'La reserva no admite pagos en su estado actual' });
  }
  const monto = Number(datos.monto);
  const saldo = calcularSaldoReserva(reserva.id);
  if (monto > saldo) {
    throw new ApiError(422, { success: false, message: 'El monto excede el saldo pendiente de la reserva' });
  }
  const nuevo = { id: nextId(pagos), id_reserva: reserva.id, tipo_pago: datos.tipo_pago, monto, fecha: datos.fecha, estado: 'ACTIVO', motivo_anulacion: null, fecha_anulacion: null };
  pagos.push(nuevo);
  logAuditoria('CREATE', 'Pago', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Fol.PAGO_CREATE, { ...datos, id_reserva: reserva.id, pago: pagoDTO(nuevo), saldoRestante: calcularSaldoReserva(reserva.id) }, { statusCode: 201, requestBody: datos });
  return { success: true, data: pagoDTO(nuevo), saldo_restante: calcularSaldoReserva(reserva.id) };
}
export function anularPago(id, motivo) {
  const p = pagos.find((pp) => pp.id === id);
  if (!p) throw new ApiError(404, { success: false, message: 'Pago no encontrado' });
  if (p.estado === 'ANULADO') throw new ApiError(422, { success: false, message: 'El pago ya está anulado' });
  if (!motivo || motivo.length < 10) throw new ApiError(422, { success: false, message: 'El motivo de anulación debe tener al menos 10 caracteres' });
  p.estado = 'ANULADO'; p.motivo_anulacion = motivo; p.fecha_anulacion = new Date().toISOString();
  logAuditoria('UPDATE', 'Pago', id, null, { estado: 'ANULADO', motivo_anulacion: motivo });
  persistAll();
  const saldoActualizado = calcularSaldoReserva(p.id_reserva);
  emitApiSim(Fol.PAGO_ANULAR, { id, motivo, pago: pagoDTO(p), saldoActualizado }, { requestBody: { motivo_anulacion: motivo } });
  return { success: true, data: pagoDTO(p), saldo_actualizado: saldoActualizado };
}
export function pagosPorReserva(idReserva) {
  const list = pagos.filter((p) => p.id_reserva === idReserva).map(pagoDTO);
  const reserva = reservas.find((r) => r.id === idReserva);
  return { success: true, data: list, total_pagado: calcularTotalPagosReserva(idReserva), total_reserva: reserva?.total ?? 0, saldo: calcularSaldoReserva(idReserva) };
}

// ---------- Empleados ----------
export function listEmpleados(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  let list = [...empleados];
  if (idHotel !== undefined) list = list.filter((e) => e.id_hotel === idHotel);
  if (filtros.id_rol) list = list.filter((e) => e.id_rol === Number(filtros.id_rol));
  if (filtros.estado) list = list.filter((e) => e.estado === filtros.estado);
  const dto = list.map((e) => empleadoDTO(e));
  emitApiSim(Seg.EMPLEADO_LIST, { empleados: dto });
  return { success: true, data: dto };
}
export function createEmpleado(datos) {
  if (empleados.some((e) => e.usuario === datos.usuario)) {
    throw new ApiError(422, { success: false, message: 'Ya existe un empleado con ese nombre de usuario' });
  }
  const nuevo = { id: nextId(empleados), id_rol: Number(datos.id_rol), id_hotel: datos.id_hotel ? Number(datos.id_hotel) : null, nombre: datos.nombre, apellido: datos.apellido, usuario: datos.usuario, password: datos.password, estado: datos.estado || 'ACTIVO' };
  empleados.push(nuevo);
  logAuditoria('CREATE', 'Empleado', nuevo.id, null, { ...nuevo, password: '<hashed>' });
  persistAll();
  emitApiSim(Seg.EMPLEADO_CREATE, { ...datos, empleado: empleadoDTO(nuevo) }, { statusCode: 201, requestBody: { ...datos, password: '••••••' } });
  return { success: true, data: empleadoDTO(nuevo) };
}
export function updateEmpleado(id, datos) {
  const e = empleados.find((ee) => ee.id === id);
  if (!e) throw new ApiError(404, { success: false, message: 'Empleado no encontrado' });
  if (datos.usuario && empleados.some((ee) => ee.usuario === datos.usuario && ee.id !== id)) {
    throw new ApiError(422, { success: false, message: 'Ese nombre de usuario ya está en uso' });
  }
  if (!datos.password) delete datos.password;
  Object.assign(e, datos);
  logAuditoria('UPDATE', 'Empleado', id, null, { ...datos, password: datos.password ? '<hashed>' : undefined });
  persistAll();
  emitApiSim(Seg.EMPLEADO_UPDATE, { id, fields: Object.keys(datos).join(', '), empleado: empleadoDTO(e) }, { requestBody: { ...datos, password: datos.password ? '••••••' : undefined } });
  return { success: true, data: empleadoDTO(e) };
}
export function deleteEmpleado(id) {
  const e = empleados.find((ee) => ee.id === id);
  if (!e) throw new ApiError(404, { success: false, message: 'Empleado no encontrado' });
  e.estado = 'INACTIVO';
  logAuditoria('UPDATE', 'Empleado', id, null, { estado: 'INACTIVO' });
  persistAll();
  emitApiSim(Seg.EMPLEADO_DELETE, { id });
  return { success: true };
}
export function permisosDeEmpleado(id) {
  const e = empleados.find((ee) => ee.id === id);
  if (!e) throw new ApiError(404, { success: false, message: 'Empleado no encontrado' });
  const rol = rolOf(e.id_rol);
  const data = { empleado: `${e.nombre} ${e.apellido}`, rol: rol ? rol.nombre : 'Sin Rol', permisos: rol ? permisosDeRol(rol.id) : [] };
  emitApiSim(Seg.EMPLEADO_PERMISOS, { id, data });
  return { success: true, data };
}

// ---------- Roles y permisos ----------
export function listRoles() {
  const dto = roles.map((r) => rolConPermisosDTO(r.id));
  emitApiSim(Seg.ROL_LIST, { roles: dto });
  return { success: true, data: dto };
}
export function createRol(datos) {
  if (roles.some((r) => r.nombre.toLowerCase() === datos.nombre.toLowerCase())) {
    throw new ApiError(422, { success: false, message: 'Ya existe un rol con ese nombre' });
  }
  const nuevo = { id: nextId(roles), nombre: datos.nombre, descripcion: datos.descripcion || '' };
  roles.push(nuevo);
  logAuditoria('CREATE', 'Rol', nuevo.id, null, nuevo);
  persistAll();
  emitApiSim(Seg.ROL_CREATE, { ...datos, rol: nuevo }, { statusCode: 201, requestBody: datos });
  return { success: true, data: rolConPermisosDTO(nuevo.id) };
}
export function updateRol(id, datos) {
  const r = roles.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Rol no encontrado' });
  if (datos.nombre && roles.some((rr) => rr.nombre.toLowerCase() === datos.nombre.toLowerCase() && rr.id !== id)) {
    throw new ApiError(422, { success: false, message: 'Ya existe un rol con ese nombre' });
  }
  Object.assign(r, datos);
  logAuditoria('UPDATE', 'Rol', id, null, datos);
  persistAll();
  emitApiSim(Seg.ROL_UPDATE, { id, nombre: r.nombre, rol: r }, { requestBody: datos });
  return { success: true, data: rolConPermisosDTO(id) };
}
export function deleteRol(id) {
  if (empleados.some((e) => e.id_rol === id)) {
    throw new ApiError(422, { success: false, message: 'El rol tiene empleados asignados' });
  }
  roles = roles.filter((r) => r.id !== id);
  rolPermisos = rolPermisos.filter((rp) => rp.id_rol !== id);
  logAuditoria('DELETE', 'Rol', id, null, null);
  persistAll();
  emitApiSim(Seg.ROL_DELETE, { id });
  return { success: true };
}
export function asignarPermisosRol(id, permisosIds) {
  const r = roles.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { success: false, message: 'Rol no encontrado' });
  rolPermisos = rolPermisos.filter((rp) => rp.id_rol !== id);
  (permisosIds || []).forEach((pid) => rolPermisos.push({ id_rol: id, id_permiso: Number(pid) }));
  logAuditoria('UPDATE', 'Rol', id, null, { permisos: permisosIds });
  persistAll();
  emitApiSim(Seg.ROL_ASIGNAR_PERMISOS, { id, permisos: permisosIds, rol: rolConPermisosDTO(id) }, { requestBody: { permisos: permisosIds } });
  return { success: true, data: rolConPermisosDTO(id) };
}
export function listPermisos() {
  emitApiSim(Seg.PERMISO_LIST, { permisos });
  return { success: true, data: [...permisos] };
}

// ---------- Auditoría ----------
export function listAuditoria(filtros = {}) {
  let list = [...auditoria];
  if (filtros.user_id) list = list.filter((a) => a.user_id === Number(filtros.user_id));
  if (filtros.accion) list = list.filter((a) => a.accion === filtros.accion);
  if (filtros.modelo) list = list.filter((a) => a.modelo.toLowerCase().includes(filtros.modelo.toLowerCase()));
  if (filtros.fecha_inicio) list = list.filter((a) => a.created_at.slice(0, 10) >= filtros.fecha_inicio);
  if (filtros.fecha_fin) list = list.filter((a) => a.created_at.slice(0, 10) <= filtros.fecha_fin);
  list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const page = Number(filtros.page) || 1;
  const result = paginate(list.map(auditoriaDTO), page, 20);
  emitApiSim(Seg.AUDITORIA_LIST, { userId: filtros.user_id, accion: filtros.accion, page, page_response: { success: true, data: result } });
  return { success: true, data: result };
}
export function listLogs() {
  return { success: true, data: [] };
}

// ---------- Dashboard ----------
export function dashboardData(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  const habs = idHotel !== undefined ? habitaciones.filter((h) => h.id_hotel === idHotel) : habitaciones;
  const resv = idHotel !== undefined ? reservas.filter((r) => r.id_hotel === idHotel) : reservas;
  const today = todayISO();
  const totalHab = habs.length;
  const ocupadas = habs.filter((h) => h.estado === 'OCUPADA').length;
  const hoyStr = today;
  const pagosDe = (dateFrom) => pagos.filter((p) => p.fecha >= dateFrom).reduce((s, p) => s + p.monto, 0);
  const inicioSemana = relDate(-((new Date(`${today}T00:00:00`).getDay() + 6) % 7));
  const inicioMes = `${today.slice(0, 7)}-01`;
  const inicioAnio = `${today.slice(0, 4)}-01-01`;
  const data = {
    habitaciones: {
      total: totalHab, disponibles: habs.filter((h) => h.estado === 'DISPONIBLE').length, ocupadas,
      reservadas: habs.filter((h) => h.estado === 'RESERVADA').length, mantenimiento: habs.filter((h) => h.estado === 'MANTENIMIENTO').length,
      tasa_ocupacion: Math.round((ocupadas / Math.max(totalHab, 1)) * 10000) / 100,
    },
    reservas: {
      hoy: resv.filter((r) => r.fecha_entrada === hoyStr).length, activas: resv.filter((r) => r.estado === 'EN_PROCESO').length,
      pendientes: resv.filter((r) => r.estado === 'PENDIENTE').length, mes_actual: resv.filter((r) => (r.created_at || '').slice(0, 7) === today.slice(0, 7)).length,
    },
    ingresos: { hoy: pagosDe(hoyStr), semana: pagosDe(inicioSemana), mes: pagosDe(inicioMes), anio: pagosDe(inicioAnio) },
    operaciones: {
      huespedes_actuales: resv.filter((r) => r.estado === 'EN_PROCESO').reduce((s, r) => s + r.adultos, 0),
      checkins_hoy: resv.filter((r) => r.fecha_entrada === hoyStr && r.estado === 'CONFIRMADA').length,
      checkouts_hoy: resv.filter((r) => r.fecha_salida === hoyStr && r.estado === 'EN_PROCESO').length,
    },
  };
  emitApiSim(Fol.DASHBOARD, { data });
  return { success: true, data };
}
export function ingresosMensuales(anio) {
  const year = anio || Number(todayISO().slice(0, 4));
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const data = meses.map((nombre, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
    const total = pagos.filter((p) => p.fecha.startsWith(prefix)).reduce((s, p) => s + p.monto, 0);
    return { mes: i + 1, mes_nombre: nombre, total };
  });
  return { success: true, data };
}
export function reservasProximas(dias = 7) {
  const desde = todayISO();
  const hasta = relDate(Number(dias));
  const list = reservas.filter((r) => r.estado === 'CONFIRMADA' && r.fecha_entrada >= desde && r.fecha_entrada <= hasta).map(reservaListDTO);
  return { success: true, data: list };
}
export function habitacionesPorEstado() {
  const estados = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO', 'INACTIVA', 'DEMOLIDA'];
  const data = estados.map((estado) => ({ estado, total: habitaciones.filter((h) => h.estado === estado).length })).filter((r) => r.total > 0);
  return { success: true, data };
}
export function topServicios(limit = 10) {
  const data = servicios.map((s) => {
    const cs = consumos.filter((c) => c.id_servicio === s.id);
    return { servicio: s.nombre, total_consumos: cs.length, total_ingresos: cs.reduce((sum, c) => sum + c.subtotal, 0) };
  }).sort((a, b) => b.total_consumos - a.total_consumos).slice(0, Number(limit));
  return { success: true, data };
}

// ---------- Reportes ----------
export function reporteReservas(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  let list = [...reservas];
  if (idHotel !== undefined) list = list.filter((r) => r.id_hotel === idHotel);
  if (filtros.estado) list = list.filter((r) => r.estado === filtros.estado);
  if (filtros.fecha_inicio && filtros.fecha_fin) list = list.filter((r) => r.fecha_entrada >= filtros.fecha_inicio && r.fecha_entrada <= filtros.fecha_fin);
  const dto = list.map(reservaListDTO);
  const data = {
    data: dto,
    totales: { total_reservas: dto.length, total_ingresos: list.reduce((s, r) => s + r.total, 0), adultos: list.reduce((s, r) => s + r.adultos, 0), ninos: list.reduce((s, r) => s + r.ninos, 0) },
  };
  emitApiSim(Fol.REPORTE, { tipo: 'reservas', fechaInicio: filtros.fecha_inicio, fechaFin: filtros.fecha_fin, data });
  return { success: true, ...data };
}
export function reporteIngresos(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  let list = pagos.map((p) => ({ ...p, reserva: reservas.find((r) => r.id === p.id_reserva) }));
  if (idHotel !== undefined) list = list.filter((p) => p.reserva && p.reserva.id_hotel === idHotel);
  if (filtros.tipo_pago) list = list.filter((p) => p.tipo_pago === filtros.tipo_pago);
  if (filtros.fecha_inicio && filtros.fecha_fin) list = list.filter((p) => p.fecha >= filtros.fecha_inicio && p.fecha <= filtros.fecha_fin);
  const porTipo = (tipo) => list.filter((p) => p.tipo_pago === tipo).reduce((s, p) => s + p.monto, 0);
  const data = {
    data: list.map((p) => pagoDTO(p)),
    totales: { total_pagos: list.length, total_efectivo: porTipo('EFECTIVO'), total_tarjeta: porTipo('TARJETA'), total_transferencia: porTipo('TRANSFERENCIA'), total_general: list.reduce((s, p) => s + p.monto, 0) },
  };
  emitApiSim(Fol.REPORTE, { tipo: 'ingresos', fechaInicio: filtros.fecha_inicio, fechaFin: filtros.fecha_fin, data });
  return { success: true, ...data };
}
export function reporteOcupacion(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  const habs = idHotel !== undefined ? habitaciones.filter((h) => h.id_hotel === idHotel) : habitaciones;
  const total = habs.length;
  const contar = (estado) => habs.filter((h) => h.estado === estado).length;
  const disponibles = contar('DISPONIBLE'); const ocupadas = contar('OCUPADA'); const reservadas = contar('RESERVADA'); const mantenimiento = contar('MANTENIMIENTO');
  const pct = (n) => Math.round((n / Math.max(total, 1)) * 10000) / 100;
  const data = {
    total_habitaciones: total, disponibles, ocupadas, reservadas, mantenimiento, tasa_ocupacion: pct(ocupadas),
    porcentajes: { disponibles: pct(disponibles), ocupadas: pct(ocupadas), reservadas: pct(reservadas), mantenimiento: pct(mantenimiento) },
  };
  emitApiSim(Fol.REPORTE, { tipo: 'ocupacion', data });
  return { success: true, ...data };
}
export function reporteConsumos(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  let list = consumos.map((c) => ({ ...c, reserva: reservas.find((r) => r.id === c.id_reserva) }));
  if (idHotel !== undefined) list = list.filter((c) => c.reserva && c.reserva.id_hotel === idHotel);
  if (filtros.fecha_inicio && filtros.fecha_fin) list = list.filter((c) => c.fecha >= filtros.fecha_inicio && c.fecha <= filtros.fecha_fin);
  const data = { data: list.map((c) => consumoDTO(c)), totales: { total_consumos: list.length, total_ingresos: list.reduce((s, c) => s + c.subtotal, 0) } };
  emitApiSim(Fol.REPORTE, { tipo: 'consumos', data });
  return { success: true, ...data };
}
export function reporteConsolidado(filtros = {}) {
  const idHotel = effectiveHotelFilter(filtros.id_hotel);
  const today = todayISO();
  const fechaInicio = filtros.fecha_inicio || `${today.slice(0, 7)}-01`;
  const fechaFin = filtros.fecha_fin || today;
  let resv = reservas;
  if (idHotel !== undefined) resv = resv.filter((r) => r.id_hotel === idHotel);
  const reservasEnRango = resv.filter((r) => (r.created_at || '').slice(0, 10) >= fechaInicio && (r.created_at || '').slice(0, 10) <= fechaFin);
  let pagosScope = pagos.map((p) => ({ ...p, reserva: reservas.find((r) => r.id === p.id_reserva) }));
  if (idHotel !== undefined) pagosScope = pagosScope.filter((p) => p.reserva && p.reserva.id_hotel === idHotel);
  const pagosEnRango = pagosScope.filter((p) => p.fecha >= fechaInicio && p.fecha <= fechaFin);
  let consumosScope = consumos.map((c) => ({ ...c, reserva: reservas.find((r) => r.id === c.id_reserva) }));
  if (idHotel !== undefined) consumosScope = consumosScope.filter((c) => c.reserva && c.reserva.id_hotel === idHotel);
  const consumosEnRango = consumosScope.filter((c) => c.fecha >= fechaInicio && c.fecha <= fechaFin);
  const habs = idHotel !== undefined ? habitaciones.filter((h) => h.id_hotel === idHotel) : habitaciones;
  const data = {
    periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    data: {
      reservas: reservasEnRango.length, ingresos_totales: pagosEnRango.reduce((s, p) => s + p.monto, 0),
      ingresos_consumos: consumosEnRango.reduce((s, c) => s + c.subtotal, 0),
      tasa_ocupacion: Math.round((habs.filter((h) => h.estado === 'OCUPADA').length / Math.max(habs.length, 1)) * 10000) / 100,
    },
  };
  emitApiSim(Fol.REPORTE, { tipo: 'consolidado', fechaInicio, fechaFin, data });
  return data;
}

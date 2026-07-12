import { emitApiSim } from '../api-sim/templates';
import { apiSimBus } from '../api-sim/bus';
import {
  AUTH_LOGIN, AUTH_LOGIN_FAILED, AUTH_LOGOUT,
  USUARIO_CREATE, USUARIO_UPDATE, USUARIO_TOGGLE,
  ROL_CREATE, ROL_UPDATE, ROL_DELETE, ROL_PERMISOS_UPDATE,
} from '../api-sim/catalogs/seguridad.catalog';
import {
  CLIENTE_CREATE, CLIENTE_UPDATE, CLIENTE_DELETE,
  PLAN_CREATE, PLAN_UPDATE, PLAN_TOGGLE,
} from '../api-sim/catalogs/clientes.catalog';
import {
  INSCRIPCION_CREATE, ASISTENCIA_CREATE, ASISTENCIA_DENEGADA,
  METODO_PAGO_CREATE, METODO_PAGO_UPDATE, METODO_PAGO_TOGGLE, METODO_PAGO_DELETE,
} from '../api-sim/catalogs/caja.catalog';

const KEYS = {
  clientes: 'powerfit_clientes',
  planes: 'powerfit_planes',
  usuarios: 'powerfit_usuarios',
  roles: 'powerfit_roles',
  inscripciones: 'powerfit_inscripciones',
  asistencias: 'powerfit_asistencias',
  metodosPago: 'powerfit_metodos_pago',
  bitacora: 'powerfit_bitacora',
};

export const APP_MODULES = ['Recepción', 'Usuarios', 'Roles', 'Clientes', 'Membresías', 'Cobros', 'Reportes'];

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function toDateStr(date) {
  return date.toLocaleDateString('en-CA');
}

function relDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return toDateStr(d);
}

function nowTimeStr() {
  return new Date().toLocaleTimeString('es-ES', { hour12: false });
}

let state = null;
let currentActor = { name: 'Sistema', role: '—' };

export function setCurrentActor(user) {
  currentActor = user ? { name: user.name, role: user.role } : { name: 'Sistema', role: '—' };
}

function allPermissions() {
  return APP_MODULES.reduce((acc, mod) => {
    acc[mod] = { view: true, create: true, edit: true, delete: true };
    return acc;
  }, {});
}

function defaultPermissions() {
  return APP_MODULES.reduce((acc, mod) => {
    acc[mod] = { view: false, create: false, edit: false, delete: false };
    return acc;
  }, {});
}

function seed() {
  state.roles = [
    { id: 1, name: 'Administrador', description: 'Acceso total a todos los módulos del sistema', permissions: allPermissions() },
    {
      id: 2, name: 'Recepcionista', description: 'Acceso a cobros, inscripciones y asistencia',
      permissions: {
        ...defaultPermissions(),
        'Recepción': { view: true, create: true, edit: false, delete: false },
        'Clientes': { view: true, create: true, edit: true, delete: false },
        'Membresías': { view: true, create: false, edit: false, delete: false },
        'Cobros': { view: true, create: true, edit: false, delete: false },
      },
    },
    {
      id: 3, name: 'Entrenador', description: 'Acceso limitado para ver rutinas y asistencias',
      permissions: { ...defaultPermissions(), 'Clientes': { view: true, create: false, edit: false, delete: false } },
    },
  ];

  state.usuarios = [
    { id: 1, name: 'Administrador Principal', email: 'admin@powerfit.com', password: 'admin123', roleId: 1, status: 'Activo' },
    { id: 2, name: 'Recepcionista Mañana', email: 'recepcion@powerfit.com', password: 'recepcion123', roleId: 2, status: 'Activo' },
  ];

  state.planes = [
    { id: 1, name: 'Pase Diario', price: 20, days: 1, features: ['Acceso a pesas', 'Sin inscripción'], isActive: true },
    { id: 2, name: 'Mensualidad Regular', price: 150, days: 30, features: ['Acceso total', 'Guía básica', 'Uso de casilleros'], isActive: true },
    { id: 3, name: 'Plan Trimestral', price: 400, days: 90, features: ['Acceso total', 'Rutina personalizada', '10% Dcto suplementos'], isActive: true },
    { id: 4, name: 'VIP Anual', price: 1200, days: 365, features: ['Acceso ilimitado', 'Toalla gratis', 'Entrenador personal'], isActive: false },
  ];

  state.clientes = [
    { id: 1, code: 'BIO-001', name: 'Carlos Díaz', phone: '77712345', email: 'carlos@email.com', address: 'Av. Las Américas 123', planId: 2, fechaVencimiento: relDate(15) },
    { id: 2, code: 'BIO-002', name: 'Ana Gómez', phone: '76543210', email: 'ana.gomez@email.com', address: 'Calle 10, Obrajes', planId: 4, fechaVencimiento: relDate(2) },
    { id: 3, code: 'BIO-003', name: 'Luis Fernandez', phone: '71122334', email: 'luis.f@email.com', address: 'Zona Sur, #45', planId: 1, fechaVencimiento: relDate(-5) },
    { id: 4, code: 'BIO-004', name: 'Pedro Perez', phone: '70011223', email: 'pedro.perez@email.com', address: 'Av. Busch, 2do anillo', planId: 2, fechaVencimiento: relDate(40) },
  ];

  state.metodosPago = [
    { id: 1, name: 'Efectivo', type: 'cash', active: true },
    { id: 2, name: 'QR Simple', type: 'qr', active: true },
    { id: 3, name: 'Transferencia Bancaria', type: 'transfer', active: false },
  ];

  // Inscripciones/asistencias de los últimos días, para que Reportes y el
  // gráfico de afluencia no aparezcan vacíos sin importar cuándo se abra la demo.
  state.inscripciones = [
    { id: 1, clienteId: 1, planId: 2, metodoPagoId: 1, fecha: relDate(-20), fechaInicio: relDate(-20), fechaFin: relDate(10), monto: 150 },
    { id: 2, clienteId: 2, planId: 4, metodoPagoId: 2, fecha: relDate(-28), fechaInicio: relDate(-28), fechaFin: relDate(2), monto: 1200 },
    { id: 3, clienteId: 3, planId: 1, metodoPagoId: 1, fecha: relDate(-5), fechaInicio: relDate(-5), fechaFin: relDate(-4), monto: 20 },
    { id: 4, clienteId: 4, planId: 2, metodoPagoId: 2, fecha: relDate(-3), fechaInicio: relDate(-3), fechaFin: relDate(27), monto: 150 },
  ];

  state.asistencias = [];
  let asisId = 1;
  [
    { clienteId: 1, days: [-6, -5, -4, -2, -1, 0] },
    { clienteId: 2, days: [-5, -3, -2, 0] },
    { clienteId: 4, days: [-4, -1] },
  ].forEach(({ clienteId, days }) => {
    days.forEach((d) => {
      state.asistencias.push({ id: asisId++, clienteId, fecha: relDate(d), hora: '18:30:00' });
    });
  });

  state.bitacora = [
    { id: 1, date: relDate(-1), time: '08:15:32', user: 'Administrador Principal', role: 'Administrador', module: 'Sistema', action: 'Demo inicializada con datos de ejemplo.' },
  ];

  saveAll();
}

function saveAll() {
  Object.entries(KEYS).forEach(([k, key]) => save(key, state[k]));
}

function ensureLoaded() {
  if (state) return;
  state = {};
  let missing = false;
  Object.entries(KEYS).forEach(([k, key]) => {
    const data = load(key);
    if (data) {
      state[k] = data;
    } else {
      state[k] = [];
      missing = true;
    }
  });
  if (missing || state.usuarios.length === 0) {
    seed();
  }
}

function logBitacora(module, action) {
  const entry = {
    id: state.bitacora.length > 0 ? Math.max(...state.bitacora.map((b) => b.id)) + 1 : 1,
    date: relDate(0),
    time: nowTimeStr(),
    user: currentActor.name,
    role: currentActor.role,
    module,
    action,
  };
  state.bitacora = [entry, ...state.bitacora].slice(0, 200);
  save(KEYS.bitacora, state.bitacora);
}

export function resetDemoData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  state = null;
  ensureLoaded();
  apiSimBus.clearHistory();
}

// ---------- ROLES ----------
export function getRoles() {
  ensureLoaded();
  return state.roles.map((r) => ({ ...r, inUse: state.usuarios.some((u) => u.roleId === r.id) }));
}

export function getRole(id) {
  return getRoles().find((r) => r.id === id);
}

export function createRole({ name, description }) {
  ensureLoaded();
  const newId = state.roles.length > 0 ? Math.max(...state.roles.map((r) => r.id)) + 1 : 1;
  const newRole = { id: newId, name, description, permissions: defaultPermissions() };
  state.roles.push(newRole);
  save(KEYS.roles, state.roles);
  logBitacora('Roles', `Creó el rol "${name}".`);
  emitApiSim(ROL_CREATE, { ...newRole, permissions: newRole.permissions }, { statusCode: 201, requestBody: { name, description } });
  return newRole;
}

export function updateRole(id, { name, description }) {
  ensureLoaded();
  const idx = state.roles.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  state.roles[idx] = { ...state.roles[idx], name, description };
  save(KEYS.roles, state.roles);
  logBitacora('Roles', `Actualizó el rol "${name}".`);
  emitApiSim(ROL_UPDATE, state.roles[idx], { requestBody: { name, description } });
  return state.roles[idx];
}

export function updateRolePermissions(id, permissions) {
  ensureLoaded();
  const idx = state.roles.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  state.roles[idx] = { ...state.roles[idx], permissions };
  save(KEYS.roles, state.roles);
  logBitacora('Roles', `Actualizó los permisos del rol "${state.roles[idx].name}".`);
  emitApiSim(ROL_PERMISOS_UPDATE, { id, permissions });
  return state.roles[idx];
}

export function deleteRole(id) {
  ensureLoaded();
  const role = getRole(id);
  if (!role) return { success: false, message: 'Rol no encontrado.' };
  if (role.inUse) {
    return { success: false, message: `No se puede eliminar el rol "${role.name}" porque hay usuarios activos asignados a él.` };
  }
  state.roles = state.roles.filter((r) => r.id !== id);
  save(KEYS.roles, state.roles);
  logBitacora('Roles', `Eliminó el rol "${role.name}".`);
  emitApiSim(ROL_DELETE, { id });
  return { success: true };
}

// ---------- USUARIOS ----------
function toUsuarioDTO(u) {
  const { password, ...rest } = u;
  const role = state.roles.find((r) => r.id === u.roleId);
  return { ...rest, roleName: role?.name ?? 'Sin rol' };
}

export function getUsuarios() {
  ensureLoaded();
  return state.usuarios.map(toUsuarioDTO);
}

export function authenticate(email, password) {
  ensureLoaded();
  const user = state.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.status === 'Activo');
  if (!user) {
    emitApiSim(AUTH_LOGIN_FAILED, { email }, { statusCode: 400 });
    return null;
  }
  const token = `demo-token-${user.id}-${Date.now()}`;
  const dto = { ...toUsuarioDTO(user), role: toUsuarioDTO(user).roleName };
  emitApiSim(AUTH_LOGIN, { user: dto, token }, { requestBody: { email } });
  logBitacora('Usuarios', `${user.name} inició sesión en el sistema.`);
  return { token, user: dto };
}

export function registerLogout(user) {
  emitApiSim(AUTH_LOGOUT, {});
  if (user) logBitacora('Usuarios', `${user.name} cerró sesión.`);
}

function isLastActiveAdmin(usuario) {
  const role = state.roles.find((r) => r.id === usuario.roleId);
  if (role?.name !== 'Administrador' || usuario.status !== 'Activo') return false;
  const activeAdmins = state.usuarios.filter((u) => u.status === 'Activo' && state.roles.find((r) => r.id === u.roleId)?.name === 'Administrador');
  return activeAdmins.length <= 1;
}

export function createUsuario({ name, email, password, roleId }) {
  ensureLoaded();
  const emailExists = state.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) return { success: false, message: 'Ya existe un usuario registrado con este correo electrónico.' };

  const newId = state.usuarios.length > 0 ? Math.max(...state.usuarios.map((u) => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email, password: password || 'cambio123', roleId, status: 'Activo' };
  state.usuarios.push(newUser);
  save(KEYS.usuarios, state.usuarios);
  logBitacora('Usuarios', `Creó el usuario "${name}".`);
  const dto = toUsuarioDTO(newUser);
  emitApiSim(USUARIO_CREATE, dto, { statusCode: 201, requestBody: { name, email, roleId } });
  return { success: true, data: dto };
}

export function updateUsuario(id, { name, email, roleId }) {
  ensureLoaded();
  const emailExists = state.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id);
  if (emailExists) return { success: false, message: 'Ya existe un usuario registrado con este correo electrónico.' };

  const idx = state.usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, message: 'Usuario no encontrado.' };
  state.usuarios[idx] = { ...state.usuarios[idx], name, email, roleId };
  save(KEYS.usuarios, state.usuarios);
  logBitacora('Usuarios', `Actualizó el usuario "${name}".`);
  const dto = toUsuarioDTO(state.usuarios[idx]);
  emitApiSim(USUARIO_UPDATE, dto, { requestBody: { name, email, roleId } });
  return { success: true, data: dto };
}

export function toggleUsuarioStatus(id) {
  ensureLoaded();
  const idx = state.usuarios.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, message: 'Usuario no encontrado.' };

  const usuario = state.usuarios[idx];
  if (usuario.status === 'Activo' && isLastActiveAdmin(usuario)) {
    return { success: false, message: 'No se puede dar de baja al último administrador activo.' };
  }

  usuario.status = usuario.status === 'Activo' ? 'Inactivo' : 'Activo';
  save(KEYS.usuarios, state.usuarios);
  logBitacora('Usuarios', `Cambió el estado de "${usuario.name}" a ${usuario.status}.`);
  const dto = toUsuarioDTO(usuario);
  emitApiSim(USUARIO_TOGGLE, dto);
  return { success: true, data: dto };
}

// ---------- PLANES (Membresías) ----------
export function getPlanes() {
  ensureLoaded();
  return state.planes;
}

export function getPlan(id) {
  ensureLoaded();
  return state.planes.find((p) => p.id === id);
}

export function createPlan({ name, price, days, features }) {
  ensureLoaded();
  const newId = state.planes.length > 0 ? Math.max(...state.planes.map((p) => p.id)) + 1 : 1;
  const newPlan = { id: newId, name, price, days, features, isActive: true };
  state.planes.push(newPlan);
  save(KEYS.planes, state.planes);
  logBitacora('Membresías', `Creó el plan "${name}".`);
  emitApiSim(PLAN_CREATE, newPlan, { statusCode: 201, requestBody: { name, price, days, features } });
  return newPlan;
}

export function updatePlan(id, { name, price, days, features }) {
  ensureLoaded();
  const idx = state.planes.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  state.planes[idx] = { ...state.planes[idx], name, price, days, features };
  save(KEYS.planes, state.planes);
  logBitacora('Membresías', `Actualizó el plan "${name}".`);
  emitApiSim(PLAN_UPDATE, state.planes[idx], { requestBody: { name, price, days, features } });
  return state.planes[idx];
}

export function togglePlanStatus(id) {
  ensureLoaded();
  const idx = state.planes.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  state.planes[idx].isActive = !state.planes[idx].isActive;
  save(KEYS.planes, state.planes);
  logBitacora('Membresías', `${state.planes[idx].isActive ? 'Activó' : 'Desactivó'} el plan "${state.planes[idx].name}".`);
  emitApiSim(PLAN_TOGGLE, state.planes[idx]);
  return state.planes[idx];
}

// ---------- CLIENTES (con estado derivado, nunca cacheado en localStorage) ----------
function clienteStatus(cliente) {
  if (!cliente.planId || !cliente.fechaVencimiento) return { status: 'Sin Plan', daysRemaining: 0, planName: 'Sin Plan Activo' };
  const plan = state.planes.find((p) => p.id === cliente.planId);
  const diffDays = Math.ceil((new Date(cliente.fechaVencimiento) - new Date(relDate(0))) / (1000 * 60 * 60 * 24));
  let status = 'Activo';
  if (diffDays < 0) status = 'Vencido';
  else if (diffDays <= 3) status = 'Por Vencer';
  return { status, daysRemaining: Math.max(diffDays, 0), planName: plan?.name ?? 'Plan eliminado' };
}

function toClienteDTO(c) {
  return { ...c, ...clienteStatus(c) };
}

export function getClientes() {
  ensureLoaded();
  return state.clientes.map(toClienteDTO);
}

export function getCliente(id) {
  ensureLoaded();
  const c = state.clientes.find((c) => c.id === id);
  return c ? toClienteDTO(c) : undefined;
}

export function getClienteByCode(code) {
  ensureLoaded();
  const c = state.clientes.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return c ? toClienteDTO(c) : undefined;
}

export function createCliente({ name, phone, email, address }) {
  ensureLoaded();
  const maxSeq = state.clientes.reduce((max, c) => {
    const n = parseInt(c.code.replace('BIO-', ''), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  const code = `BIO-${String(maxSeq + 1).padStart(3, '0')}`;
  const newId = state.clientes.length > 0 ? Math.max(...state.clientes.map((c) => c.id)) + 1 : 1;
  const newClient = { id: newId, code, name, phone, email, address, planId: null, fechaVencimiento: null };
  state.clientes.push(newClient);
  save(KEYS.clientes, state.clientes);
  logBitacora('Clientes', `Registró nuevo cliente: ${name} (${code}).`);
  emitApiSim(CLIENTE_CREATE, newClient, { statusCode: 201, requestBody: { name, phone, email, address } });
  return toClienteDTO(newClient);
}

export function updateCliente(id, { name, phone, email, address }) {
  ensureLoaded();
  const idx = state.clientes.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  state.clientes[idx] = { ...state.clientes[idx], name, phone, email, address };
  save(KEYS.clientes, state.clientes);
  logBitacora('Clientes', `Actualizó los datos de ${name}.`);
  emitApiSim(CLIENTE_UPDATE, state.clientes[idx], { requestBody: { name, phone, email, address } });
  return toClienteDTO(state.clientes[idx]);
}

export function deleteCliente(id) {
  ensureLoaded();
  const cliente = state.clientes.find((c) => c.id === id);
  state.clientes = state.clientes.filter((c) => c.id !== id);
  save(KEYS.clientes, state.clientes);
  if (cliente) logBitacora('Clientes', `Eliminó al cliente ${cliente.name} (${cliente.code}).`);
  emitApiSim(CLIENTE_DELETE, { id });
}

// ---------- MÉTODOS DE PAGO ----------
function metodoPagoDTO(m) {
  const transactionsCount = state.inscripciones.filter((i) => i.metodoPagoId === m.id).length;
  return { ...m, transactionsCount };
}

export function getMetodosPago() {
  ensureLoaded();
  return state.metodosPago.map(metodoPagoDTO);
}

export function createMetodoPago({ name, type }) {
  ensureLoaded();
  const newId = state.metodosPago.length > 0 ? Math.max(...state.metodosPago.map((m) => m.id)) + 1 : 1;
  const newMethod = { id: newId, name, type, active: true };
  state.metodosPago.push(newMethod);
  save(KEYS.metodosPago, state.metodosPago);
  logBitacora('Cobros', `Creó el método de pago "${name}".`);
  emitApiSim(METODO_PAGO_CREATE, newMethod, { statusCode: 201, requestBody: { name, type } });
  return metodoPagoDTO(newMethod);
}

export function updateMetodoPago(id, { name, type }) {
  ensureLoaded();
  const idx = state.metodosPago.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  state.metodosPago[idx] = { ...state.metodosPago[idx], name, type };
  save(KEYS.metodosPago, state.metodosPago);
  logBitacora('Cobros', `Actualizó el método de pago "${name}".`);
  emitApiSim(METODO_PAGO_UPDATE, state.metodosPago[idx], { requestBody: { name, type } });
  return metodoPagoDTO(state.metodosPago[idx]);
}

export function toggleMetodoPago(id) {
  ensureLoaded();
  const idx = state.metodosPago.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  state.metodosPago[idx].active = !state.metodosPago[idx].active;
  save(KEYS.metodosPago, state.metodosPago);
  logBitacora('Cobros', `${state.metodosPago[idx].active ? 'Habilitó' : 'Deshabilitó'} el método de pago "${state.metodosPago[idx].name}".`);
  emitApiSim(METODO_PAGO_TOGGLE, metodoPagoDTO(state.metodosPago[idx]));
  return metodoPagoDTO(state.metodosPago[idx]);
}

export function deleteMetodoPago(id) {
  ensureLoaded();
  const method = metodoPagoDTO(state.metodosPago.find((m) => m.id === id));
  if (!method) return { success: false, message: 'Método no encontrado.' };
  if (method.transactionsCount > 0) {
    return { success: false, message: `No se puede eliminar "${method.name}" porque tiene ${method.transactionsCount} transacciones asociadas.` };
  }
  state.metodosPago = state.metodosPago.filter((m) => m.id !== id);
  save(KEYS.metodosPago, state.metodosPago);
  logBitacora('Cobros', `Eliminó el método de pago "${method.name}".`);
  emitApiSim(METODO_PAGO_DELETE, { id });
  return { success: true };
}

// ---------- INSCRIPCIONES (materializa el cobro + extiende la membresía) ----------
export function crearInscripcion({ clienteId, planId, metodoPagoId }) {
  ensureLoaded();
  const cliente = state.clientes.find((c) => c.id === clienteId);
  const plan = state.planes.find((p) => p.id === planId);
  if (!cliente || !plan) return { success: false, message: 'Cliente o plan no encontrado.' };

  const fecha = relDate(0);
  const fechaFin = relDate(plan.days);
  const newId = state.inscripciones.length > 0 ? Math.max(...state.inscripciones.map((i) => i.id)) + 1 : 1;
  const inscripcion = { id: newId, clienteId, planId, metodoPagoId, fecha, fechaInicio: fecha, fechaFin, monto: plan.price };
  state.inscripciones.push(inscripcion);

  const clienteIdx = state.clientes.findIndex((c) => c.id === clienteId);
  state.clientes[clienteIdx] = { ...state.clientes[clienteIdx], planId, fechaVencimiento: fechaFin };

  save(KEYS.inscripciones, state.inscripciones);
  save(KEYS.clientes, state.clientes);

  const metodo = state.metodosPago.find((m) => m.id === metodoPagoId);
  logBitacora('Cobros', `Registró el pago de "${plan.name}" (${metodo?.name ?? 'método'}) del cliente ${cliente.name}.`);
  emitApiSim(INSCRIPCION_CREATE, inscripcion, { statusCode: 201, requestBody: { clienteId, planId, metodoPagoId } });

  return { success: true, data: { ...inscripcion, cliente: toClienteDTO(state.clientes[clienteIdx]), plan } };
}

export function getInscripciones() {
  ensureLoaded();
  return state.inscripciones.map((i) => ({
    ...i,
    cliente: state.clientes.find((c) => c.id === i.clienteId),
    plan: state.planes.find((p) => p.id === i.planId),
    metodoPago: state.metodosPago.find((m) => m.id === i.metodoPagoId),
  }));
}

// ---------- ASISTENCIAS (check-in) ----------
export function registrarAsistencia(code) {
  ensureLoaded();
  const cliente = state.clientes.find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (!cliente) return { success: false, notFound: true };

  const dto = toClienteDTO(cliente);
  if (dto.status === 'Vencido' || dto.status === 'Sin Plan') {
    emitApiSim(ASISTENCIA_DENEGADA, { clienteId: cliente.id }, { statusCode: 403 });
    logBitacora('Recepción', `Acceso denegado a ${cliente.name} (membresía ${dto.status.toLowerCase()}).`);
    return { success: false, denied: true, cliente: dto };
  }

  const fecha = relDate(0);
  const hora = nowTimeStr();
  const newId = state.asistencias.length > 0 ? Math.max(...state.asistencias.map((a) => a.id)) + 1 : 1;
  const asistencia = { id: newId, clienteId: cliente.id, fecha, hora };
  state.asistencias.push(asistencia);
  save(KEYS.asistencias, state.asistencias);

  logBitacora('Recepción', `Registró el ingreso de ${cliente.name} (${cliente.code}).`);
  emitApiSim(ASISTENCIA_CREATE, asistencia, { statusCode: 201, requestBody: { code } });

  return { success: true, cliente: dto, asistencia };
}

export function getAsistenciasDelCliente(clienteId) {
  ensureLoaded();
  return state.asistencias.filter((a) => a.clienteId === clienteId);
}

export function getAsistenciasUltimos7Dias() {
  ensureLoaded();
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = relDate(-i);
    const count = state.asistencias.filter((a) => a.fecha === dateStr).length;
    const dow = new Date(dateStr + 'T00:00:00').getDay();
    days.push({ name: dayNames[dow], asistencias: count });
  }
  return days;
}

export function getClientesDestacados(limit = 3) {
  ensureLoaded();
  const counts = new Map();
  state.asistencias.forEach((a) => counts.set(a.clienteId, (counts.get(a.clienteId) || 0) + 1));
  return [...counts.entries()]
    .map(([clienteId, count]) => ({ cliente: state.clientes.find((c) => c.id === clienteId), count }))
    .filter((r) => r.cliente)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ---------- BITÁCORA ----------
export function getBitacora() {
  ensureLoaded();
  return state.bitacora;
}

// ---------- REPORTES (vistas derivadas) ----------
export function getReporteFinanzas() {
  ensureLoaded();
  return getInscripciones()
    .map((i) => ({
      id: i.id,
      fecha: i.fecha,
      cliente: i.cliente?.name ?? '—',
      plan: i.plan?.name ?? '—',
      metodo: i.metodoPago?.name ?? '—',
      metodoType: i.metodoPago?.type,
      monto: i.monto,
    }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function getReporteEstadoClientes() {
  ensureLoaded();
  return getClientes().map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    status: c.status,
    expiration: c.fechaVencimiento || '—',
  }));
}

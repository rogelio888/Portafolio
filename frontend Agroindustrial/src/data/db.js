import { emitApiSim } from '../api-sim/templates';
import { apiSimBus } from '../api-sim/bus';
import {
  AUTH_LOGIN, AUTH_LOGIN_FAILED, AUTH_LOGOUT, AUTH_ME,
  ROL_CREATE, ROL_UPDATE, ROL_DELETE,
  USUARIO_CREATE, USUARIO_UPDATE, USUARIO_TOGGLE,
} from '../api-sim/catalogs/seguridad.catalog';
import {
  MAQUINARIA_CREATE, MAQUINARIA_UPDATE, MAQUINARIA_DELETE, MAQUINARIA_HOROMETRO,
  MECANICO_CREATE, MECANICO_UPDATE, MECANICO_DELETE,
  CLASIFICACION_CREATE, CLASIFICACION_UPDATE, CLASIFICACION_DELETE,
  FICHA_CREATE, FICHA_UPDATE, FICHA_DELETE,
} from '../api-sim/catalogs/flota.catalog';
import { OT_CREATE, OT_UPDATE, OT_CERRAR, OT_DELETE } from '../api-sim/catalogs/mantenimiento.catalog';

export const PERMISSION_KEYS = [
  'usuarios', 'roles', 'bitacora', 'clasificaciones', 'fichas',
  'maquinaria', 'mecanicos', 'preventivos', 'ordenes', 'historial',
  'reporte_gasto', 'reporte_vencido',
];

const PROTECTED_ROLES = ['Administrador', 'Encargado de Mantenimiento', 'Gerente General'];

const KEYS = {
  categories: 'agroflota_categories',
  machines: 'agroflota_machines',
  mechanics: 'agroflota_mechanics',
  sheets: 'agroflota_sheets',
  workOrders: 'agroflota_work_orders',
  users: 'agroflota_users',
  roles: 'agroflota_roles',
  bitacora: 'agroflota_bitacora',
};

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
  return PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {});
}

function seed() {
  state.categories = [
    { id: 1, name: 'Tractores', prefix: 'TRAC', description: 'Equipos de arrastre y labranza de suelo agrícola.' },
    { id: 2, name: 'Cosechadoras', prefix: 'COSE', description: 'Equipos de recolección y trilla de cultivos.' },
    { id: 3, name: 'Fumigadoras', prefix: 'FUMI', description: 'Equipos de aspersión y control fitosanitario.' },
    { id: 4, name: 'Sembradoras', prefix: 'SEMB', description: 'Implementos de siembra directa de precisión.' },
  ];

  state.machines = [
    { id: 1, code: 'TRAC-001', brand: 'John Deere', model: '6125J', category: 'Tractores', vin: 'JD6125J12457814XX', initialHours: 0, hours: 265, status: 'Operativo' },
    { id: 2, code: 'COSE-001', brand: 'Case IH', model: '8120', category: 'Cosechadoras', vin: 'CIH812036582414YY', initialHours: 50, hours: 490, status: 'En Mantenimiento' },
    { id: 3, code: 'TRAC-002', brand: 'John Deere', model: '6125J', category: 'Tractores', vin: 'JD6125J98217743ZZ', initialHours: 0, hours: 105, status: 'Operativo' },
    { id: 4, code: 'FUMI-001', brand: 'Jacto', model: 'Uniport 3030', category: 'Fumigadoras', vin: 'JCT3030001125AB', initialHours: 0, hours: 60, status: 'Operativo' },
  ];

  state.mechanics = [
    { id: 1, name: 'Taller Central Montero', specialty: 'Transmisión e Hidráulica', phone: '+591 78012457', address: 'Av. Circunvalación N.º 250, Montero', available: false },
    { id: 2, name: 'Taller Diesel Hnos. Vargas', specialty: 'Sistemas de Combustible', phone: '+591 75014859', address: 'Barrio La Florida, Montero', available: true },
    { id: 3, name: 'Ing. Pedro Ortiz', specialty: 'Electricidad y Sensores', phone: '+591 77098231', address: 'Zona Norte, Santa Cruz', available: true },
  ];

  state.sheets = [
    {
      id: 1, brand: 'John Deere', model: '6125J', category: 'Tractores', year: 2023, powerHp: 125,
      motorType: 'PowerTech 4.5L', tankCapacity: 240,
      intervals: [
        { taskName: 'Cambio de Aceite de Motor', hours: 250 },
        { taskName: 'Cambio de Filtro de Combustible', hours: 250 },
        { taskName: 'Servicio de Sistema Hidráulico', hours: 500 },
      ],
    },
    {
      id: 2, brand: 'Case IH', model: '8120', category: 'Cosechadoras', year: 2022, powerHp: 470,
      motorType: 'FPT Cursor 9', tankCapacity: 650,
      intervals: [
        { taskName: 'Cambio de Aceite de Motor', hours: 300 },
        { taskName: 'Inspección de Trilla', hours: 400 },
        { taskName: 'Servicio de Sistema Hidráulico', hours: 450 },
      ],
    },
  ];

  state.roles = [
    { id: 1, name: 'Administrador', description: 'Acceso total a todos los módulos del sistema.', permissions: allPermissions() },
    {
      id: 2, name: 'Encargado de Mantenimiento', description: 'Gestiona flota, mecánicos y órdenes de trabajo.',
      permissions: {
        usuarios: false, roles: false, bitacora: false,
        clasificaciones: true, fichas: true, maquinaria: true, mecanicos: true,
        preventivos: true, ordenes: true, historial: true, reporte_gasto: true, reporte_vencido: true,
      },
    },
    {
      id: 3, name: 'Gerente General', description: 'Visión operativa y reportes, sin edición de configuración.',
      permissions: {
        usuarios: false, roles: false, bitacora: true,
        clasificaciones: false, fichas: false, maquinaria: true, mecanicos: false,
        preventivos: true, ordenes: false, historial: true, reporte_gasto: true, reporte_vencido: true,
      },
    },
  ];

  state.users = [
    { id: 1, name: 'Administrador Principal', email: 'admin@agroflota.com', password: 'admin123', role: 'Administrador', active: true, createdAt: relDate(-90) },
    { id: 2, name: 'Jefe de Taller', email: 'mantenimiento@agroflota.com', password: 'mant123', role: 'Encargado de Mantenimiento', active: true, createdAt: relDate(-60) },
  ];

  // Órdenes de trabajo: históricas cerradas (relativas a "hoy" para que Reporte de
  // Gasto y el Historial de Intervenciones nunca aparezcan vacíos) + una abierta.
  state.workOrders = [
    { id: 1, code: 'OT-001', machineCode: 'TRAC-001', mechanicId: 1, taskDescription: 'Cambio de Aceite de Motor e inspección de filtros hidráulicos.', fecha: relDate(-28), openHours: 250, closeHours: 258, fechaCierre: relDate(-27), laborCost: 100, partsCost: 200, status: 'Cerrada' },
    { id: 2, code: 'OT-002', machineCode: 'COSE-001', mechanicId: 2, taskDescription: 'Servicio de sistema hidráulico completo.', fecha: relDate(-20), openHours: 470, closeHours: 480, fechaCierre: relDate(-18), laborCost: 350, partsCost: 900, status: 'Cerrada' },
    { id: 3, code: 'OT-003', machineCode: 'TRAC-002', mechanicId: 3, taskDescription: 'Diagnóstico eléctrico y cambio de sensores.', fecha: relDate(-10), openHours: 98, closeHours: 105, fechaCierre: relDate(-9), laborCost: 150, partsCost: 350, status: 'Cerrada' },
    { id: 4, code: 'OT-004', machineCode: 'TRAC-001', mechanicId: 1, taskDescription: 'Cambio de inyectores y sensores de presión de rampa.', fecha: relDate(-4), openHours: 260, closeHours: 265, fechaCierre: relDate(-3), laborCost: 150, partsCost: 350, status: 'Cerrada' },
    { id: 5, code: 'OT-005', machineCode: 'COSE-001', mechanicId: 2, taskDescription: 'Revisión de fugas en bomba hidráulica principal.', fecha: relDate(-1), openHours: 490, closeHours: null, fechaCierre: null, laborCost: 0, partsCost: 0, status: 'Abierta' },
  ];

  state.bitacora = [
    { id: 1, dateTime: `${relDate(-1)} 08:15:32`, userName: 'Administrador Principal', userRole: 'Administrador', module: 'Configuración', type: 'Inicio de Sesión', action: 'Demo inicializada con datos de ejemplo.', ip: '192.168.1.10', device: 'Sistema' },
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
  if (missing || state.users.length === 0) {
    seed();
  }
}

function logBitacora(module, type, action, actorOverride) {
  const actor = actorOverride || currentActor;
  const entry = {
    id: state.bitacora.length > 0 ? Math.max(...state.bitacora.map((b) => b.id)) + 1 : 1,
    dateTime: `${relDate(0)} ${nowTimeStr()}`,
    userName: actor.name,
    userRole: actor.role,
    module,
    type,
    action,
    ip: '192.168.1.10',
    device: 'Chrome / Windows',
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

// ---------- AUTH ----------
function toUserDTO(u) {
  const { password, ...rest } = u;
  const role = state.roles.find((r) => r.name === u.role);
  return { ...rest, permissions: role?.permissions ?? {} };
}

export function authenticate(email, password) {
  ensureLoaded();
  const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.active);
  if (!user) {
    emitApiSim(AUTH_LOGIN_FAILED, { email }, { statusCode: 401 });
    const err = new Error('Credenciales inválidas. Verifique su correo y contraseña.');
    throw err;
  }
  const token = `demo-token-${user.id}-${Date.now()}`;
  const dto = toUserDTO(user);
  emitApiSim(AUTH_LOGIN, { user: dto, token }, { statusCode: 201, requestBody: { email } });
  logBitacora('Configuración', 'Inicio de Sesión', `${user.name} inició sesión en el sistema.`, { name: user.name, role: user.role });
  return { token, user: dto };
}

export function registerLogout(user) {
  emitApiSim(AUTH_LOGOUT, {});
  if (user) logBitacora('Configuración', 'Edición', `${user.name} cerró sesión.`);
}

export function getCurrentUserProfile(id) {
  ensureLoaded();
  const user = state.users.find((u) => u.id === id);
  if (!user) return null;
  const dto = toUserDTO(user);
  emitApiSim(AUTH_ME, dto);
  return dto;
}

// ---------- ROLES ----------
export function getRoles() {
  ensureLoaded();
  return state.roles.map((r) => ({ ...r, usersCount: state.users.filter((u) => u.role === r.name).length }));
}

export function createRole({ name, description }) {
  ensureLoaded();
  const newId = state.roles.length > 0 ? Math.max(...state.roles.map((r) => r.id)) + 1 : 1;
  const newRole = { id: newId, name, description, permissions: PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {}) };
  state.roles.push(newRole);
  save(KEYS.roles, state.roles);
  logBitacora('Configuración', 'Creación', `Creó el rol "${name}".`);
  emitApiSim(ROL_CREATE, newRole, { statusCode: 201, requestBody: { name, description } });
  return newRole;
}

export function updateRole(id, { name, description, permissions }) {
  ensureLoaded();
  const idx = state.roles.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Rol no encontrado.');
  state.roles[idx] = { ...state.roles[idx], name, description, permissions: permissions ?? state.roles[idx].permissions };
  save(KEYS.roles, state.roles);
  logBitacora('Configuración', 'Edición', `Actualizó el rol "${name}" y sus permisos.`);
  emitApiSim(ROL_UPDATE, state.roles[idx], { requestBody: { name, description, permissions } });
  return state.roles[idx];
}

export function deleteRole(id) {
  ensureLoaded();
  const role = state.roles.find((r) => r.id === id);
  if (!role) throw new Error('Rol no encontrado.');
  if (PROTECTED_ROLES.includes(role.name)) {
    throw new Error(`El rol "${role.name}" es un rol protegido del sistema y no se puede eliminar.`);
  }
  state.roles = state.roles.filter((r) => r.id !== id);
  save(KEYS.roles, state.roles);
  logBitacora('Configuración', 'Inhabilitación', `Eliminó el rol "${role.name}".`);
  emitApiSim(ROL_DELETE, { id });
  return { success: true };
}

// ---------- USUARIOS ----------
export function getUsuarios() {
  ensureLoaded();
  return state.users.map(toUserDTO);
}

function isLastActiveAdmin(user) {
  if (user.role !== 'Administrador' || !user.active) return false;
  const activeAdmins = state.users.filter((u) => u.role === 'Administrador' && u.active);
  return activeAdmins.length <= 1;
}

export function createUsuario({ name, email, password, role, active }) {
  ensureLoaded();
  if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Ya existe un usuario registrado con este correo electrónico.');
  }
  const newId = state.users.length > 0 ? Math.max(...state.users.map((u) => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email, password: password || 'cambio123', role, active: active !== false, createdAt: relDate(0) };
  state.users.push(newUser);
  save(KEYS.users, state.users);
  logBitacora('Configuración', 'Creación', `Creó el usuario "${name}" (${role}).`);
  const dto = toUserDTO(newUser);
  emitApiSim(USUARIO_CREATE, dto, { statusCode: 201, requestBody: { name, email, role } });
  return dto;
}

export function updateUsuario(id, { name, email, role, password }) {
  ensureLoaded();
  if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== id)) {
    throw new Error('Ya existe un usuario registrado con este correo electrónico.');
  }
  const idx = state.users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  state.users[idx] = { ...state.users[idx], name, email, role, ...(password ? { password } : {}) };
  save(KEYS.users, state.users);
  logBitacora('Configuración', 'Edición', `Actualizó el usuario "${name}".`);
  const dto = toUserDTO(state.users[idx]);
  emitApiSim(USUARIO_UPDATE, dto, { requestBody: { name, email, role } });
  return dto;
}

export function toggleUsuarioStatus(id) {
  ensureLoaded();
  const idx = state.users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  const user = state.users[idx];
  if (user.active && isLastActiveAdmin(user)) {
    throw new Error('No se puede inhabilitar al último administrador activo.');
  }
  user.active = !user.active;
  save(KEYS.users, state.users);
  logBitacora('Configuración', 'Inhabilitación', `${user.active ? 'Habilitó' : 'Inhabilitó'} al usuario "${user.name}".`);
  emitApiSim(USUARIO_TOGGLE, { id, active: user.active });
  return { active: user.active };
}

// ---------- CLASIFICACIONES ----------
export function getClasificaciones() {
  ensureLoaded();
  return state.categories.map((c) => ({ ...c, machinesCount: state.machines.filter((m) => m.category === c.name).length }));
}

export function createClasificacion({ name, prefix, description }) {
  ensureLoaded();
  const newId = state.categories.length > 0 ? Math.max(...state.categories.map((c) => c.id)) + 1 : 1;
  const newCat = { id: newId, name, prefix, description };
  state.categories.push(newCat);
  save(KEYS.categories, state.categories);
  logBitacora('Flota Agrícola', 'Creación', `Creó la clasificación "${name}".`);
  emitApiSim(CLASIFICACION_CREATE, newCat, { statusCode: 201, requestBody: { name, prefix, description } });
  return newCat;
}

export function updateClasificacion(id, { name, prefix, description }) {
  ensureLoaded();
  const idx = state.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Clasificación no encontrada.');
  state.categories[idx] = { ...state.categories[idx], name, prefix, description };
  save(KEYS.categories, state.categories);
  logBitacora('Flota Agrícola', 'Edición', `Actualizó la clasificación "${name}".`);
  emitApiSim(CLASIFICACION_UPDATE, state.categories[idx], { requestBody: { name, prefix, description } });
  return state.categories[idx];
}

export function deleteClasificacion(id) {
  ensureLoaded();
  const cat = getClasificaciones().find((c) => c.id === id);
  if (!cat) throw new Error('Clasificación no encontrada.');
  if (cat.machinesCount > 0) {
    throw new Error(`No se puede eliminar "${cat.name}" porque tiene ${cat.machinesCount} máquina(s) asociada(s).`);
  }
  state.categories = state.categories.filter((c) => c.id !== id);
  save(KEYS.categories, state.categories);
  logBitacora('Flota Agrícola', 'Inhabilitación', `Eliminó la clasificación "${cat.name}".`);
  emitApiSim(CLASIFICACION_DELETE, { id });
  return { success: true };
}

// ---------- MAQUINARIA ----------
export function getMaquinarias() {
  ensureLoaded();
  return state.machines;
}

export function getMaquinariaByCode(code) {
  ensureLoaded();
  return state.machines.find((m) => m.code === code);
}

function nextMachineCode(category) {
  const cat = state.categories.find((c) => c.name === category);
  const prefix = cat?.prefix ?? 'MAQ';
  const seq = state.machines.filter((m) => m.code.startsWith(prefix)).length + 1;
  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

export function createMaquinaria({ brand, model, category, vin, initialHours, status }) {
  ensureLoaded();
  const newId = state.machines.length > 0 ? Math.max(...state.machines.map((m) => m.id)) + 1 : 1;
  const code = nextMachineCode(category);
  const newMachine = { id: newId, code, brand, model, category, vin, initialHours: Number(initialHours) || 0, hours: Number(initialHours) || 0, status: status || 'Operativo' };
  state.machines.push(newMachine);
  save(KEYS.machines, state.machines);
  logBitacora('Flota Agrícola', 'Creación', `Registró la maquinaria "${code}" (${brand} ${model}).`);
  emitApiSim(MAQUINARIA_CREATE, newMachine, { statusCode: 201, requestBody: { brand, model, category, vin } });
  return newMachine;
}

export function updateMaquinaria(id, { brand, model, vin, status, hours }) {
  ensureLoaded();
  const idx = state.machines.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Maquinaria no encontrada.');
  state.machines[idx] = {
    ...state.machines[idx], brand, model, vin, status,
    hours: hours !== undefined ? Number(hours) : state.machines[idx].hours,
  };
  save(KEYS.machines, state.machines);
  logBitacora('Flota Agrícola', 'Edición', `Actualizó la maquinaria "${state.machines[idx].code}".`);
  emitApiSim(MAQUINARIA_UPDATE, state.machines[idx], { requestBody: { brand, model, vin, status, hours } });
  return state.machines[idx];
}

export function deleteMaquinaria(id) {
  ensureLoaded();
  const machine = state.machines.find((m) => m.id === id);
  state.machines = state.machines.filter((m) => m.id !== id);
  save(KEYS.machines, state.machines);
  if (machine) logBitacora('Flota Agrícola', 'Inhabilitación', `Eliminó la maquinaria "${machine.code}".`);
  emitApiSim(MAQUINARIA_DELETE, { id });
  return { success: true };
}

function updateMachineHours(code, hours) {
  const idx = state.machines.findIndex((m) => m.code === code);
  if (idx === -1) return;
  state.machines[idx].hours = hours;
  save(KEYS.machines, state.machines);
  emitApiSim(MAQUINARIA_HOROMETRO, state.machines[idx]);
}

// Corrección manual del horómetro (ej. desde el panel de Mantenimiento Preventivo),
// distinta de la actualización automática que ocurre al cerrar una OT.
export function actualizarHorometroManual(code, hours) {
  ensureLoaded();
  updateMachineHours(code, Number(hours));
  logBitacora('Mantenimiento', 'Edición', `Actualizó manualmente el horómetro de "${code}" a ${hours}h.`);
}

// ---------- MECÁNICOS ----------
export function getMecanicos() {
  ensureLoaded();
  return state.mechanics;
}

export function createMecanico({ name, specialty, phone, address, available }) {
  ensureLoaded();
  const newId = state.mechanics.length > 0 ? Math.max(...state.mechanics.map((m) => m.id)) + 1 : 1;
  const newMech = { id: newId, name, specialty, phone, address, available: available !== false };
  state.mechanics.push(newMech);
  save(KEYS.mechanics, state.mechanics);
  logBitacora('Flota Agrícola', 'Creación', `Registró al mecánico externo "${name}".`);
  emitApiSim(MECANICO_CREATE, newMech, { statusCode: 201, requestBody: { name, specialty, phone, address } });
  return newMech;
}

export function updateMecanico(id, { name, specialty, phone, address, available }) {
  ensureLoaded();
  const idx = state.mechanics.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error('Mecánico no encontrado.');
  state.mechanics[idx] = { ...state.mechanics[idx], name, specialty, phone, address, available };
  save(KEYS.mechanics, state.mechanics);
  logBitacora('Flota Agrícola', 'Edición', `Actualizó al mecánico "${name}".`);
  emitApiSim(MECANICO_UPDATE, state.mechanics[idx], { requestBody: { name, specialty, phone, address, available } });
  return state.mechanics[idx];
}

export function deleteMecanico(id) {
  ensureLoaded();
  const mech = state.mechanics.find((m) => m.id === id);
  state.mechanics = state.mechanics.filter((m) => m.id !== id);
  save(KEYS.mechanics, state.mechanics);
  if (mech) logBitacora('Flota Agrícola', 'Inhabilitación', `Eliminó al mecánico "${mech.name}".`);
  emitApiSim(MECANICO_DELETE, { id });
  return { success: true };
}

// ---------- FICHAS TÉCNICAS ----------
export function getFichas() {
  ensureLoaded();
  return state.sheets;
}

export function createFicha({ brand, model, category, year, powerHp, motorType, tankCapacity, intervals }) {
  ensureLoaded();
  const newId = state.sheets.length > 0 ? Math.max(...state.sheets.map((s) => s.id)) + 1 : 1;
  const newSheet = { id: newId, brand, model, category, year: Number(year), powerHp: Number(powerHp), motorType, tankCapacity: Number(tankCapacity), intervals: intervals || [] };
  state.sheets.push(newSheet);
  save(KEYS.sheets, state.sheets);
  logBitacora('Flota Agrícola', 'Creación', `Creó la ficha técnica de ${brand} ${model}.`);
  emitApiSim(FICHA_CREATE, newSheet, { statusCode: 201, requestBody: { brand, model, category, intervals } });
  return newSheet;
}

export function updateFicha(id, { brand, model, category, year, powerHp, motorType, tankCapacity, intervals }) {
  ensureLoaded();
  const idx = state.sheets.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Ficha técnica no encontrada.');
  state.sheets[idx] = { ...state.sheets[idx], brand, model, category, year: Number(year), powerHp: Number(powerHp), motorType, tankCapacity: Number(tankCapacity), intervals: intervals || [] };
  save(KEYS.sheets, state.sheets);
  logBitacora('Flota Agrícola', 'Edición', `Actualizó la ficha técnica de ${brand} ${model}.`);
  emitApiSim(FICHA_UPDATE, state.sheets[idx], { requestBody: { brand, model, intervals } });
  return state.sheets[idx];
}

export function deleteFicha(id) {
  ensureLoaded();
  const sheet = state.sheets.find((s) => s.id === id);
  state.sheets = state.sheets.filter((s) => s.id !== id);
  save(KEYS.sheets, state.sheets);
  if (sheet) logBitacora('Flota Agrícola', 'Inhabilitación', `Eliminó la ficha técnica de ${sheet.brand} ${sheet.model}.`);
  emitApiSim(FICHA_DELETE, { id });
  return { success: true };
}

// ---------- ÓRDENES DE TRABAJO ----------
function toOtDTO(ot) {
  const machine = state.machines.find((m) => m.code === ot.machineCode);
  const mechanic = state.mechanics.find((m) => m.id === ot.mechanicId);
  return {
    ...ot,
    brand: machine?.brand ?? '—',
    model: machine?.model ?? '—',
    category: machine?.category ?? '—',
    mechanicName: mechanic?.name ?? '—',
    totalCost: (ot.laborCost || 0) + (ot.partsCost || 0),
  };
}

export function getOrdenesTrabajo() {
  ensureLoaded();
  return state.workOrders.map(toOtDTO).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function crearOrdenTrabajo({ machineCode, mechanicId, taskDescription, openHours, laborCost, partsCost }) {
  ensureLoaded();
  const machine = state.machines.find((m) => m.code === machineCode);
  if (!machine) throw new Error('Maquinaria no encontrada.');
  const newId = state.workOrders.length > 0 ? Math.max(...state.workOrders.map((o) => o.id)) + 1 : 1;
  const code = `OT-${String(newId).padStart(3, '0')}`;
  const newOt = {
    id: newId, code, machineCode, mechanicId, taskDescription,
    fecha: relDate(0), openHours: openHours !== undefined ? Number(openHours) : machine.hours, closeHours: null, fechaCierre: null,
    laborCost: Number(laborCost) || 0, partsCost: Number(partsCost) || 0, status: 'Abierta',
  };
  state.workOrders.push(newOt);
  save(KEYS.workOrders, state.workOrders);
  logBitacora('Mantenimiento', 'Creación', `Generó la orden de trabajo "${code}" para ${machineCode}.`);
  emitApiSim(OT_CREATE, toOtDTO(newOt), { statusCode: 201, requestBody: { machineCode, mechanicId, taskDescription } });
  return toOtDTO(newOt);
}

export function updateOrdenTrabajo(id, { machineCode, mechanicId, taskDescription, openHours, laborCost, partsCost }) {
  ensureLoaded();
  const idx = state.workOrders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error('Orden de trabajo no encontrada.');
  state.workOrders[idx] = {
    ...state.workOrders[idx], machineCode, mechanicId, taskDescription,
    openHours: Number(openHours), laborCost: Number(laborCost) || 0, partsCost: Number(partsCost) || 0,
  };
  save(KEYS.workOrders, state.workOrders);
  logBitacora('Mantenimiento', 'Edición', `Actualizó la orden de trabajo "${state.workOrders[idx].code}".`);
  const dto = toOtDTO(state.workOrders[idx]);
  emitApiSim(OT_UPDATE, dto, { requestBody: { machineCode, mechanicId, taskDescription } });
  return dto;
}

export function cerrarOrdenTrabajo(id, { closeHours }) {
  ensureLoaded();
  const idx = state.workOrders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error('Orden de trabajo no encontrada.');
  state.workOrders[idx] = {
    ...state.workOrders[idx],
    closeHours: Number(closeHours),
    fechaCierre: relDate(0), status: 'Cerrada',
  };
  save(KEYS.workOrders, state.workOrders);
  updateMachineHours(state.workOrders[idx].machineCode, Number(closeHours));
  logBitacora('Mantenimiento', 'Edición', `Cerró la orden de trabajo "${state.workOrders[idx].code}".`);
  const dto = toOtDTO(state.workOrders[idx]);
  emitApiSim(OT_CERRAR, dto, { requestBody: { closeHours } });
  return dto;
}

export function deleteOrdenTrabajo(id) {
  ensureLoaded();
  const ot = state.workOrders.find((o) => o.id === id);
  state.workOrders = state.workOrders.filter((o) => o.id !== id);
  save(KEYS.workOrders, state.workOrders);
  if (ot) logBitacora('Mantenimiento', 'Inhabilitación', `Eliminó la orden de trabajo "${ot.code}".`);
  emitApiSim(OT_DELETE, { id });
  return { success: true };
}

export function existeOrdenAbierta(machineCode) {
  ensureLoaded();
  return state.workOrders.some((o) => o.machineCode === machineCode && o.status === 'Abierta');
}

// ---------- HISTORIAL DE INTERVENCIONES (derivado de OT cerradas) ----------
export function getHistorialIntervenciones() {
  ensureLoaded();
  return getOrdenesTrabajo()
    .filter((ot) => ot.status === 'Cerrada')
    .map((ot) => ({
      id: ot.id,
      machineCode: ot.machineCode,
      code: ot.code,
      date: ot.fechaCierre,
      taskTitle: ot.taskDescription,
      mechanicName: ot.mechanicName,
      brand: ot.brand,
      model: ot.model,
      openHours: ot.openHours,
      closeHours: ot.closeHours,
      description: ot.taskDescription,
      laborCost: ot.laborCost,
      partsCost: ot.partsCost,
      totalCost: ot.totalCost,
    }));
}

// ---------- ALERTAS PREVENTIVAS (derivado de Maquinaria + FichaTécnica) ----------
export function getAlertasPreventivas() {
  ensureLoaded();
  const alerts = [];
  let seq = 1;
  state.machines.forEach((machine) => {
    const sheet = state.sheets.find((s) => s.brand === machine.brand && s.model === machine.model);
    if (!sheet) return;
    sheet.intervals.forEach((interval) => {
      const remaining = interval.hours - machine.hours;
      let alertStatus = 'Al Día';
      if (remaining <= 0) alertStatus = 'Vencido';
      else if (remaining <= 25) alertStatus = 'Próximo';
      alerts.push({
        id: seq++, code: machine.code, brand: machine.brand, model: machine.model,
        taskName: interval.taskName, limitHours: interval.hours, hours: machine.hours, alertStatus,
      });
    });
  });
  return alerts;
}

export function getMaquinariaVencida() {
  ensureLoaded();
  return getAlertasPreventivas()
    .filter((a) => a.alertStatus === 'Vencido')
    .map((a) => ({ ...a, hasOpenOrder: existeOrdenAbierta(a.code) }));
}

// ---------- REPORTE DE GASTO (derivado de OT cerradas) ----------
export function getReporteGasto() {
  ensureLoaded();
  return getHistorialIntervenciones().map((h) => ({
    code: h.code,
    machineCode: h.machineCode,
    brand: h.brand,
    model: h.model,
    category: state.machines.find((m) => m.code === h.machineCode)?.category ?? '—',
    date: h.date,
    laborCost: h.laborCost,
    partsCost: h.partsCost,
  }));
}

// ---------- BITÁCORA ----------
export function getBitacora() {
  ensureLoaded();
  return state.bitacora;
}

// ---------- DASHBOARD (agregados) ----------
export function getDashboardStats() {
  ensureLoaded();
  const total = state.machines.length;
  const operativas = state.machines.filter((m) => m.status === 'Operativo').length;
  const enMantenimiento = state.machines.filter((m) => m.status === 'En Mantenimiento').length;
  const alertasVencidas = getMaquinariaVencida().length;
  const tallesActivos = state.mechanics.filter((m) => m.available).length;
  const alertas = getAlertasPreventivas().filter((a) => a.alertStatus !== 'Al Día').slice(0, 5);
  return { total, operativas, enMantenimiento, alertasVencidas, tallesActivos, alertas };
}

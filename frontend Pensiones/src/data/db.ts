// Repositorio localStorage que reemplaza al backend Laravel real. Cada operación
// pública emite un evento en apiSimBus (vía emitApiSim) como último paso, para
// alimentar la consola de simulación API. Los estados derivados (estado de cuota,
// estado de estudiante, morosidad) se calculan siempre en vivo a partir de la
// fecha de vencimiento vs. "hoy" — nunca se persisten como campos redundantes,
// así la demo nunca luce vacía u obsoleta sin importar cuándo se visite.
import { emitApiSim } from '../api-sim/templates';
import * as Seg from '../api-sim/catalogs/seguridad.catalog';
import * as Aca from '../api-sim/catalogs/academico.catalog';
import * as Caja from '../api-sim/catalogs/caja.catalog';

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(body?.message || 'Error simulado');
    this.status = status;
    this.body = body;
  }
}

// ---------- Modelo ----------
interface Curso { id: number; level: string; grade: string; parallel: string; shift: string; }
interface Estudiante {
  id: number; codigo: string; firstName: string; lastName: string; ci: string; cursoId: number;
  guardianName: string; guardianCi: string; phone: string; estado: 'Activo' | 'Retirado';
}
interface Periodo { id: number; year: number; isActive: boolean; feesTemplate: string[]; courseAmounts: Record<number, number>; }
interface Cuota { id: number; estudianteId: number; periodoId: number; mesIndex: number; monto: number; dueDate: string; paymentId: number | null; }
interface Pago {
  id: number; studentId: number; method: 'Efectivo' | 'QR'; totalAmount: number;
  status: 'Pagado' | 'Pendiente'; transactionId: string | null; debtIds: number[]; createdAt: string;
}
interface Usuario { id: number; nombre: string; correo: string; password: string; rolId: number; estado: 'Activo' | 'Suspendido'; }
interface Rol { id: number; nombre: string; permisos: number[]; }
interface BitacoraEntry { id: number; createdAt: string; userName: string; userRole: string; module: string; action: string; description: string; }

export const PERMISOS = [
  { id: 1, code: 'gestion_usuarios', label: 'Gestión de Usuarios' },
  { id: 2, code: 'gestion_bitacora', label: 'Gestión de Bitácora' },
  { id: 3, code: 'gestion_estudiantes', label: 'Gestión de Estudiantes y Cursos' },
  { id: 4, code: 'gestion_periodos', label: 'Gestión de Periodos y Pensiones' },
  { id: 5, code: 'gestion_pagos', label: 'Gestión de Caja y Pagos' },
  { id: 6, code: 'gestion_morosidad', label: 'Gestión de Morosidad' },
  { id: 7, code: 'gestion_reportes', label: 'Gestión de Reportes' },
];

const FEE_LABELS = ['1ra Cuota (Matrícula)', '2da Cuota', '3ra Cuota', '4ta Cuota', '5ta Cuota', '6ta Cuota', '7ma Cuota', '8va Cuota', '9na Cuota', '10ma Cuota'];
const CUOTA_OFFSETS = [-150, -120, -90, -60, -30, -5, 25, 55, 85, 115];

const KEYS = {
  cursos: 'pensiones_cursos', estudiantes: 'pensiones_estudiantes', periodos: 'pensiones_periodos',
  cuotas: 'pensiones_cuotas', pagos: 'pensiones_pagos', usuarios: 'pensiones_usuarios',
  roles: 'pensiones_roles', bitacora: 'pensiones_bitacora', seeded: 'pensiones_seeded_v1',
  currentUserId: 'pensiones_current_user_id',
};

function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
function nextId<T extends { id: number }>(arr: T[]) {
  return arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}
function relDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}
function relDateTime(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}
function todayISO() { return relDate(0); }
function mesNombre(iso: string) {
  const nombre = new Date(`${iso}T00:00:00`).toLocaleDateString('es-BO', { month: 'long' });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

let cursos: Curso[] = load(KEYS.cursos, []);
let estudiantes: Estudiante[] = load(KEYS.estudiantes, []);
let periodos: Periodo[] = load(KEYS.periodos, []);
let cuotas: Cuota[] = load(KEYS.cuotas, []);
let pagos: Pago[] = load(KEYS.pagos, []);
let usuarios: Usuario[] = load(KEYS.usuarios, []);
let roles: Rol[] = load(KEYS.roles, []);
let bitacora: BitacoraEntry[] = load(KEYS.bitacora, []);

let currentUserId: number | null = load(KEYS.currentUserId, null);
let currentActor: { name: string; role: string } | null = null;

function persistAll() {
  save(KEYS.cursos, cursos);
  save(KEYS.estudiantes, estudiantes);
  save(KEYS.periodos, periodos);
  save(KEYS.cuotas, cuotas);
  save(KEYS.pagos, pagos);
  save(KEYS.usuarios, usuarios);
  save(KEYS.roles, roles);
  save(KEYS.bitacora, bitacora);
  save(KEYS.currentUserId, currentUserId);
  localStorage.setItem(KEYS.seeded, '1');
}

function logBitacora(module: string, action: string, description: string) {
  bitacora.unshift({
    id: nextId(bitacora),
    createdAt: new Date().toISOString(),
    userName: currentActor?.name ?? 'Sistema',
    userRole: currentActor?.role ?? 'Auto',
    module, action, description,
  });
}

function seed() {
  cursos = [
    { id: 1, level: 'Primaria', grade: '1ro', parallel: 'A', shift: 'Mañana' },
    { id: 2, level: 'Primaria', grade: '5to', parallel: 'A', shift: 'Mañana' },
    { id: 3, level: 'Secundaria', grade: '3ro', parallel: 'A', shift: 'Tarde' },
    { id: 4, level: 'Secundaria', grade: '5to', parallel: 'A', shift: 'Tarde' },
  ];

  estudiantes = [
    { id: 1, codigo: 'CC-2026-001', firstName: 'Carlos', lastName: 'Mamani Rojas', ci: '9988776', cursoId: 1, guardianName: 'Rosa Rojas', guardianCi: '1122334', phone: '70011223', estado: 'Activo' },
    { id: 2, codigo: 'CC-2026-002', firstName: 'Ana', lastName: 'Pérez López', ci: '9876543', cursoId: 3, guardianName: 'Carlos Pérez', guardianCi: '1234567', phone: '70011224', estado: 'Activo' },
    { id: 3, codigo: 'CC-2026-003', firstName: 'Luis', lastName: 'Quispe Flores', ci: '9876500', cursoId: 2, guardianName: 'Elena Flores', guardianCi: '1234500', phone: '70011225', estado: 'Activo' },
    { id: 4, codigo: 'CC-2026-004', firstName: 'María', lastName: 'Fernández Cruz', ci: '9876511', cursoId: 4, guardianName: 'Jorge Fernández', guardianCi: '1234511', phone: '70011226', estado: 'Activo' },
    { id: 5, codigo: 'CC-2026-005', firstName: 'Pedro', lastName: 'Choque Vargas', ci: '9876522', cursoId: 1, guardianName: 'Sonia Vargas', guardianCi: '1234522', phone: '70011227', estado: 'Retirado' },
  ];

  const dueDates = CUOTA_OFFSETS.map((o) => relDate(o));
  const courseAmountsByCurso: Record<number, number> = { 1: 250, 2: 250, 3: 350, 4: 350 };

  periodos = [{ id: 1, year: new Date().getFullYear(), isActive: true, feesTemplate: dueDates, courseAmounts: { ...courseAmountsByCurso } }];

  cuotas = [];
  let cuotaId = 1;
  for (const est of estudiantes) {
    const monto = courseAmountsByCurso[est.cursoId];
    for (let i = 0; i < 10; i++) {
      cuotas.push({ id: cuotaId++, estudianteId: est.id, periodoId: 1, mesIndex: i, monto, dueDate: dueDates[i], paymentId: null });
    }
  }

  pagos = [];
  let pagoId = 1;
  const cuotaByEstMes = (estId: number, mesIndex: number) => cuotas.find((c) => c.estudianteId === estId && c.mesIndex === mesIndex)!;
  const registrarPagoHistorico = (estId: number, mesIndices: number[], method: 'Efectivo' | 'QR', createdAtOverride?: string) => {
    const relevantCuotas = mesIndices.map((m) => cuotaByEstMes(estId, m));
    const debtIds = relevantCuotas.map((c) => c.id);
    const total = relevantCuotas.reduce((sum, c) => sum + c.monto, 0);
    const lastOffset = Math.max(...mesIndices.map((m) => CUOTA_OFFSETS[m]));
    const createdAt = createdAtOverride ?? relDateTime(Math.min(lastOffset + 3, -1));
    const pago: Pago = { id: pagoId++, studentId: estId, method, totalAmount: total, status: 'Pagado', transactionId: method === 'QR' ? crypto.randomUUID() : null, debtIds, createdAt };
    pagos.push(pago);
    relevantCuotas.forEach((c) => { c.paymentId = pago.id; });
  };

  // Carlos: al día (6 cuotas pagadas, 4 futuras pendientes)
  registrarPagoHistorico(1, [0, 1], 'Efectivo');
  registrarPagoHistorico(1, [2, 3], 'QR');
  registrarPagoHistorico(1, [4, 5], 'Efectivo');

  // Ana: 4 pagadas, 2 en mora -> aparece en Morosos
  registrarPagoHistorico(2, [0, 1], 'QR');
  registrarPagoHistorico(2, [2, 3], 'Efectivo');

  // Luis: 3 pagadas, 3 en mora -> el caso más grave de Morosos
  registrarPagoHistorico(3, [0, 1], 'Efectivo');
  registrarPagoHistorico(3, [2], 'QR');

  // María: al día, con un pago registrado HOY para poblar el reporte diario
  registrarPagoHistorico(4, [0, 1], 'Efectivo');
  registrarPagoHistorico(4, [2, 3], 'QR');
  registrarPagoHistorico(4, [4, 5], 'QR', relDateTime(0));

  // Pedro: retirado, con historial parcial (no aparece en listados activos)
  registrarPagoHistorico(5, [0, 1], 'Efectivo');

  usuarios = [
    { id: 1, nombre: 'Directora Marisol Vega', correo: 'directora@colegiocentral.edu.bo', password: 'directora123', rolId: 1, estado: 'Activo' },
    { id: 2, nombre: 'Secretaria Rosa Choque', correo: 'caja@colegiocentral.edu.bo', password: 'caja123', rolId: 2, estado: 'Activo' },
  ];

  roles = [
    { id: 1, nombre: 'Directora', permisos: [1, 2, 3, 4, 5, 6, 7] },
    { id: 2, nombre: 'Secretaria', permisos: [3, 5, 6, 7] },
  ];

  bitacora = [
    { id: 1, createdAt: relDateTime(-3), userName: 'Directora Marisol Vega', userRole: 'Directora', module: 'Periodos', action: 'Gestión aperturada', description: `Se aperturó la gestión escolar ${periodos[0].year}.` },
  ];

  persistAll();
}

if (!localStorage.getItem(KEYS.seeded)) {
  seed();
}

export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  currentUserId = null;
  currentActor = null;
  seed();
}

// ---------- Derivados ----------
function cursoLabel(cursoId: number) {
  const c = cursos.find((cc) => cc.id === cursoId);
  return c ? `${c.grade} ${c.level} - ${c.parallel}` : 'Sin Asignar';
}
function estudianteCuotas(estId: number): Cuota[] {
  return cuotas.filter((c) => c.estudianteId === estId).sort((a, b) => a.mesIndex - b.mesIndex);
}
function estadoCuota(c: Cuota): 'Pagado' | 'Mora' | 'Pendiente' {
  if (c.paymentId) return 'Pagado';
  return c.dueDate < todayISO() ? 'Mora' : 'Pendiente';
}
function estadoPortal(c: Cuota): 'pagado' | 'pendiente' | 'vencido' | 'proximo' {
  if (c.paymentId) return 'pagado';
  const today = todayISO();
  if (c.dueDate < today) return 'vencido';
  const dias = Math.round((new Date(c.dueDate).getTime() - new Date(today).getTime()) / 86400000);
  return dias > 15 ? 'proximo' : 'pendiente';
}
function estudianteEstado(e: Estudiante): 'Activo' | 'Moroso' | 'Retirado' {
  if (e.estado === 'Retirado') return 'Retirado';
  return estudianteCuotas(e.id).some((c) => estadoCuota(c) === 'Mora') ? 'Moroso' : 'Activo';
}
function toEstudianteDTO(e: Estudiante) {
  return {
    id: e.id, codigo: e.codigo, first_name: e.firstName, last_name: e.lastName,
    nombre: `${e.lastName} ${e.firstName}`, ci: e.ci, curso_id: e.cursoId, curso: cursoLabel(e.cursoId),
    apoderado: e.guardianName || 'Sin Asignar', guardian_ci: e.guardianCi, celular: e.phone || 'Sin Número',
    estado: estudianteEstado(e),
  };
}
function toCuotaDTO(c: Cuota) {
  return { id: c.id, mes: mesNombre(c.dueDate), nombre: FEE_LABELS[c.mesIndex], monto: c.monto, vencimiento: c.dueDate, estado: estadoCuota(c), recibo: c.paymentId };
}
function toCursoDTO(c: Curso) {
  const alumnosCount = estudiantes.filter((e) => e.cursoId === c.id && e.estado !== 'Retirado').length;
  return { id: c.id, nivel: c.level, grado: c.grade, paralelo: c.parallel, alumnosCount };
}
function activePeriodo(): Periodo | undefined {
  return periodos.find((p) => p.isActive);
}
function periodoByYear(year: number): Periodo | undefined {
  return periodos.find((p) => p.year === year);
}
function periodoPayload(p: Periodo) {
  return {
    period: { id: p.id, year: p.year, is_active: p.isActive },
    fees_template: p.feesTemplate.map((d) => ({ due_date: d })),
    course_amounts: cursos.map((c) => ({ course_id: c.id, amount: p.courseAmounts[c.id] ?? 0, course_name: `${c.grade} ${c.level} - ${c.parallel}` })),
  };
}
function toReciboDTO(p: Pago) {
  const est = estudiantes.find((e) => e.id === p.studentId)!;
  return {
    recibo: String(p.id).padStart(6, '0'),
    fecha: new Date(p.createdAt).toLocaleDateString('es-BO'),
    metodo: p.method,
    estudiante: toEstudianteDTO(est),
    cuotasPagadas: cuotas.filter((c) => p.debtIds.includes(c.id)).map(toCuotaDTO),
    total: p.totalAmount,
  };
}
function toMorosoDTO(e: Estudiante) {
  const cuotasMora = estudianteCuotas(e.id).filter((c) => estadoCuota(c) === 'Mora');
  return {
    id: e.id, codigo: e.codigo, nombre: `${e.lastName} ${e.firstName}`, curso: cursoLabel(e.cursoId),
    tutor: e.guardianName || 'Sin Asignar', celular: e.phone || 'Sin Número',
    cuotasMora: cuotasMora.length, montoDeuda: cuotasMora.reduce((sum, c) => sum + c.monto, 0),
  };
}
function getMorosos() {
  return estudiantes.filter((e) => e.estado !== 'Retirado' && estudianteEstado(e) === 'Moroso').map(toMorosoDTO);
}
function toPortalStudentDTO(e: Estudiante) {
  return { id: e.id, nombre: `${e.firstName} ${e.lastName}`, curso: cursoLabel(e.cursoId), tutor: e.guardianName || 'Sin Asignar' };
}
function toPortalPensionDTO(c: Cuota) {
  return { id: c.id, mes: mesNombre(c.dueDate), vencimiento: c.dueDate, monto: c.monto, estado: estadoPortal(c), payment_id: c.paymentId };
}
function toPortalReceiptDTO(p: Pago) {
  const est = estudiantes.find((e) => e.id === p.studentId)!;
  return {
    recibo_id: String(p.id).padStart(6, '0'),
    fecha_pago: new Date(p.createdAt).toLocaleDateString('es-BO'),
    estudiante: `${est.firstName} ${est.lastName}`,
    curso: cursoLabel(est.cursoId),
    metodo: p.method,
    conceptos: cuotas.filter((c) => p.debtIds.includes(c.id)).map((c) => ({ id: c.id, mes: mesNombre(c.dueDate), monto: c.monto })),
    monto_total: p.totalAmount,
  };
}
function rolNombre(rolId: number) { return roles.find((r) => r.id === rolId)?.nombre ?? '—'; }
function toUsuarioAdminDTO(u: Usuario) {
  return { id: u.id, nombre: u.nombre, correo: u.correo, rol: rolNombre(u.rolId), estado: u.estado };
}
function toAuthUserDTO(u: Usuario) {
  const rol = roles.find((r) => r.id === u.rolId);
  return {
    id: u.id, name: u.nombre,
    roles: rol ? [rol.nombre] : [],
    permissions: rol ? rol.permisos.map((pid) => PERMISOS.find((p) => p.id === pid)?.code).filter(Boolean) : [],
  };
}
function toAuditLogDTO(b: BitacoraEntry) {
  return { id: b.id, created_at: b.createdAt, user: { name: b.userName, roles: [{ name: b.userRole }] }, module: b.module, action: b.action, description: b.description };
}
function isLastActiveDirectora(userId: number): boolean {
  const activas = usuarios.filter((u) => u.estado === 'Activo' && rolNombre(u.rolId) === 'Directora');
  return activas.length === 1 && activas[0].id === userId;
}
function makePlaceholderPdfBlob(title: string, lines: string[]) {
  const text = `${title}\n${'='.repeat(title.length)}\n\n${lines.join('\n')}\n\n(Documento simulado generado por el sistema de demostración)`;
  return new Blob([text], { type: 'application/pdf' });
}

// ---------- Auth ----------
export function authenticate(correo: string, password: string) {
  const user = usuarios.find((u) => u.correo.toLowerCase() === (correo || '').toLowerCase());
  if (!user || user.password !== password || user.estado !== 'Activo') {
    emitApiSim(Seg.AUTH_LOGIN_FAILED, { correo }, { statusCode: 401, requestBody: { email: correo, password: '••••••' } });
    throw new ApiError(401, { message: user && user.estado !== 'Activo' ? 'Tu cuenta ha sido suspendida. Contacta a dirección.' : 'Credenciales incorrectas.' });
  }
  currentUserId = user.id;
  currentActor = { name: user.nombre, role: rolNombre(user.rolId) };
  logBitacora('Seguridad', 'Inicio de sesión', `${user.nombre} inició sesión en el sistema.`);
  const dto = toAuthUserDTO(user);
  const token = `demo-token-${crypto.randomUUID()}`;
  persistAll();
  emitApiSim(Seg.AUTH_LOGIN, { correo, userId: user.id, token: token.slice(0, 18), user: dto }, { requestBody: { email: correo, password: '••••••' } });
  return { access_token: token, user: dto };
}

export function fetchAuthenticatedUser() {
  const user = usuarios.find((u) => u.id === currentUserId);
  if (!user) throw new ApiError(401, { message: 'No autenticado.' });
  const dto = toAuthUserDTO(user);
  emitApiSim(Seg.AUTH_FETCH_USER, { userId: user.id, user: dto });
  return dto;
}

export function logout() {
  const user = usuarios.find((u) => u.id === currentUserId);
  if (user) logBitacora('Seguridad', 'Cierre de sesión', `${user.nombre} cerró sesión.`);
  emitApiSim(Seg.AUTH_LOGOUT, { userId: currentUserId ?? 0 });
  currentUserId = null;
  currentActor = null;
  persistAll();
  return { message: 'Sesión cerrada.' };
}

// ---------- Estudiantes / Cursos ----------
export function listStudents(q?: string) {
  let list = estudiantes;
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter((e) =>
      e.firstName.toLowerCase().includes(term) || e.lastName.toLowerCase().includes(term) ||
      e.ci.toLowerCase().includes(term) || e.codigo.toLowerCase().includes(term)
    );
  }
  const dto = list.map(toEstudianteDTO);
  emitApiSim(Aca.STUDENT_LIST, { q, students: dto });
  return dto;
}

export function getStudentDebts(id: number) {
  const est = estudiantes.find((e) => e.id === id);
  if (!est) throw new ApiError(404, { message: 'Estudiante no encontrado.' });
  const dto = estudianteCuotas(id).map(toCuotaDTO);
  emitApiSim(Aca.STUDENT_DEBTS, { studentId: id, debts: dto });
  return dto;
}

export function createStudent(payload: any) {
  if (!payload.first_name || !payload.last_name || !payload.course_id) {
    throw new ApiError(422, { message: 'Nombres, apellidos y curso son obligatorios.' });
  }
  const year = new Date().getFullYear();
  const codigo = `CC-${year}-${String(estudiantes.length + 1).padStart(3, '0')}`;
  const nuevo: Estudiante = {
    id: nextId(estudiantes), codigo, firstName: payload.first_name, lastName: payload.last_name,
    ci: payload.ci || '', cursoId: Number(payload.course_id), guardianName: payload.guardian_name || '',
    guardianCi: payload.guardian_ci || '', phone: payload.phone || '', estado: 'Activo',
  };
  estudiantes.push(nuevo);
  const periodo = activePeriodo();
  if (periodo) {
    const monto = periodo.courseAmounts[nuevo.cursoId] ?? 0;
    periodo.feesTemplate.forEach((dueDate, i) => {
      cuotas.push({ id: nextId(cuotas), estudianteId: nuevo.id, periodoId: periodo.id, mesIndex: i, monto, dueDate, paymentId: null });
    });
  }
  logBitacora('Estudiantes', 'Estudiante inscrito', `Se inscribió a ${nuevo.firstName} ${nuevo.lastName} (${codigo}) en ${cursoLabel(nuevo.cursoId)}.`);
  persistAll();
  const dto = toEstudianteDTO(nuevo);
  emitApiSim(Aca.STUDENT_CREATE, { ...payload, codigo, student: dto }, { statusCode: 201, requestBody: payload });
  return dto;
}

export function updateStudent(id: number, payload: any) {
  const est = estudiantes.find((e) => e.id === id);
  if (!est) throw new ApiError(404, { message: 'Estudiante no encontrado.' });
  if (payload.status === 'Retirado') {
    est.estado = 'Retirado';
    logBitacora('Estudiantes', 'Estudiante dado de baja', `${est.firstName} ${est.lastName} (${est.codigo}) fue dado de baja.`);
    persistAll();
    const dto = toEstudianteDTO(est);
    emitApiSim(Aca.STUDENT_BAJA, { id, student: dto }, { requestBody: payload });
    return dto;
  }
  if (payload.first_name) est.firstName = payload.first_name;
  if (payload.last_name) est.lastName = payload.last_name;
  if (payload.ci !== undefined) est.ci = payload.ci;
  if (payload.course_id) est.cursoId = Number(payload.course_id);
  if (payload.guardian_name !== undefined) est.guardianName = payload.guardian_name;
  if (payload.guardian_ci !== undefined) est.guardianCi = payload.guardian_ci;
  if (payload.phone !== undefined) est.phone = payload.phone;
  logBitacora('Estudiantes', 'Estudiante actualizado', `Se actualizaron los datos de ${est.firstName} ${est.lastName} (${est.codigo}).`);
  persistAll();
  const dto = toEstudianteDTO(est);
  emitApiSim(Aca.STUDENT_UPDATE, { id, fields: Object.keys(payload).join(', '), student: dto }, { requestBody: payload });
  return dto;
}

export function listCourses() {
  const dto = cursos.map(toCursoDTO);
  emitApiSim(Aca.COURSE_LIST, { courses: dto });
  return dto;
}

export function createCourse(payload: any) {
  if (!payload.grade || !payload.parallel || !payload.level) {
    throw new ApiError(422, { message: 'Nivel, grado y paralelo son obligatorios.' });
  }
  const nuevo: Curso = { id: nextId(cursos), level: payload.level, grade: payload.grade, parallel: payload.parallel, shift: payload.shift || 'Mañana' };
  cursos.push(nuevo);
  const periodo = activePeriodo();
  if (periodo) periodo.courseAmounts[nuevo.id] = 0;
  logBitacora('Estudiantes', 'Curso aperturado', `Se aperturó el curso ${nuevo.grade} ${nuevo.level} - Paralelo ${nuevo.parallel}.`);
  persistAll();
  const dto = toCursoDTO(nuevo);
  emitApiSim(Aca.COURSE_CREATE, { ...payload, course: dto }, { statusCode: 201, requestBody: payload });
  return dto;
}

export function deleteCourse(id: number) {
  const activos = estudiantes.filter((e) => e.cursoId === id && e.estado !== 'Retirado').length;
  if (activos > 0) {
    throw new ApiError(400, { message: `No se puede eliminar: el curso tiene ${activos} alumno(s) inscrito(s).` });
  }
  cursos = cursos.filter((c) => c.id !== id);
  logBitacora('Estudiantes', 'Curso eliminado', `Se eliminó un curso sin alumnos inscritos.`);
  persistAll();
  emitApiSim(Aca.COURSE_DELETE, { id });
  return { success: true };
}

// ---------- Periodos ----------
export function listPeriods() {
  const dto = periodos.map((p) => ({ id: p.id, year: p.year, is_active: p.isActive }));
  emitApiSim(Aca.PERIOD_LIST, { periods: dto });
  return dto;
}

export function getActivePeriod() {
  const p = activePeriodo();
  if (!p) throw new ApiError(404, { message: 'No hay una gestión activa.' });
  const payload = periodoPayload(p);
  emitApiSim(Aca.PERIOD_ACTIVE, { payload });
  return payload;
}

export function getPeriodByYear(year: number) {
  const p = periodoByYear(year);
  if (!p) throw new ApiError(404, { message: 'Gestión no encontrada.' });
  const payload = periodoPayload(p);
  emitApiSim(Aca.PERIOD_BY_YEAR, { year, payload });
  return payload;
}

export function createPeriod(payload: any) {
  const year = Number(payload.year);
  if (periodoByYear(year)) {
    throw new ApiError(422, { errors: { year: [`Ya existe una gestión para el año ${year}.`] } });
  }
  periodos.forEach((p) => { p.isActive = false; });
  const courseAmounts: Record<number, number> = {};
  (payload.course_amounts || []).forEach((ca: any) => { courseAmounts[Number(ca.course_id)] = Number(ca.amount); });
  const nuevo: Periodo = { id: nextId(periodos), year, isActive: true, feesTemplate: payload.due_dates || [], courseAmounts };
  periodos.push(nuevo);
  logBitacora('Periodos', 'Gestión aperturada', `Se aperturó la gestión escolar ${year}.`);
  persistAll();
  emitApiSim(Aca.PERIOD_CREATE, { year }, { statusCode: 201, requestBody: payload });
  return { id: nuevo.id, year: nuevo.year, is_active: nuevo.isActive };
}

export function updatePeriod(year: number, payload: any) {
  const p = periodoByYear(year);
  if (!p) throw new ApiError(404, { message: 'Gestión no encontrada.' });
  if (payload.due_dates) p.feesTemplate = payload.due_dates;
  if (payload.course_amounts) {
    payload.course_amounts.forEach((ca: any) => { p.courseAmounts[Number(ca.course_id)] = Number(ca.amount); });
  }
  cuotas.filter((c) => c.periodoId === p.id).forEach((c) => {
    const est = estudiantes.find((e) => e.id === c.estudianteId);
    if (!est) return;
    if (p.feesTemplate[c.mesIndex]) c.dueDate = p.feesTemplate[c.mesIndex];
    if (!c.paymentId) c.monto = p.courseAmounts[est.cursoId] ?? c.monto;
  });
  logBitacora('Periodos', 'Gestión actualizada', `Se actualizó el cronograma de la gestión ${year}.`);
  persistAll();
  emitApiSim(Aca.PERIOD_UPDATE, { periodId: p.id }, { requestBody: payload });
  return { id: p.id, year: p.year, is_active: p.isActive };
}

export function updateCourseFee(year: number, courseId: number, amount: number) {
  const p = periodoByYear(year);
  if (!p) throw new ApiError(404, { message: 'Gestión no encontrada.' });
  p.courseAmounts[courseId] = amount;
  cuotas.filter((c) => c.periodoId === p.id && !c.paymentId).forEach((c) => {
    const est = estudiantes.find((e) => e.id === c.estudianteId);
    if (est && est.cursoId === courseId) c.monto = amount;
  });
  persistAll();
  emitApiSim(Aca.PERIOD_COURSE_FEE_UPDATE, { periodId: p.id, courseId, amount });
  return { success: true };
}

// ---------- Caja / Pagos ----------
export function createPayment(payload: any) {
  const studentId = Number(payload.student_id);
  const debtIds = (payload.debt_ids || []).map(Number);
  const method: 'Efectivo' | 'QR' = payload.payment_method;
  const status: 'Pagado' | 'Pendiente' = method === 'Efectivo' ? 'Pagado' : 'Pendiente';
  const transactionId = method === 'QR' ? crypto.randomUUID() : null;
  const pago: Pago = { id: nextId(pagos), studentId, method, totalAmount: Number(payload.total_amount), status, transactionId, debtIds, createdAt: new Date().toISOString() };
  pagos.push(pago);
  if (status === 'Pagado') {
    debtIds.forEach((id: number) => { const c = cuotas.find((cc) => cc.id === id); if (c) c.paymentId = pago.id; });
    const est = estudiantes.find((e) => e.id === studentId);
    logBitacora('Caja', 'Pago registrado', `Pago de Bs. ${pago.totalAmount.toFixed(2)} (${method}) registrado para ${est ? `${est.firstName} ${est.lastName}` : `estudiante #${studentId}`}.`);
  }
  persistAll();
  emitApiSim(Caja.PAYMENT_CREATE, { studentId, method, total: pago.totalAmount, status, transactionId, debtIdsSql: debtIds.map((id: number) => `(${pago.id}, ${id})`).join(', '), response: status === 'Pagado' ? { id: pago.id } : { id: pago.id, transaction_id: transactionId } }, { statusCode: 201, requestBody: payload });
  return status === 'Pagado' ? { id: pago.id } : { id: pago.id, transaction_id: transactionId };
}

export function getPaymentStatus(id: number) {
  const p = pagos.find((pp) => pp.id === id);
  if (!p) throw new ApiError(404, { message: 'Pago no encontrado.' });
  emitApiSim(Caja.PAYMENT_STATUS, { id, status: p.status });
  return { status: p.status };
}

export function getPaymentReceipt(id: number) {
  const p = pagos.find((pp) => pp.id === id);
  if (!p) throw new ApiError(404, { message: 'Pago no encontrado.' });
  const dto = toReciboDTO(p);
  emitApiSim(Caja.PAYMENT_SHOW, { id, receipt: dto });
  return dto;
}

export function bankWebhook(payload: any) {
  const pago = pagos.find((p) => p.transactionId === payload.transaction_id);
  if (!pago) throw new ApiError(404, { message: 'Transacción no encontrada.' });
  pago.status = payload.status;
  if (payload.status === 'Pagado') {
    pago.debtIds.forEach((id) => { const c = cuotas.find((cc) => cc.id === id); if (c) c.paymentId = pago.id; });
    const est = estudiantes.find((e) => e.id === pago.studentId);
    logBitacora('Caja', 'Pago confirmado por banco', `Transacción ${payload.transaction_id} confirmada para ${est ? `${est.firstName} ${est.lastName}` : `estudiante #${pago.studentId}`}.`);
  }
  persistAll();
  emitApiSim(Caja.BANK_WEBHOOK, { transactionId: payload.transaction_id, paymentId: pago.id, debtIds: pago.debtIds.join(', ') }, { requestBody: payload });
  return { message: 'Webhook procesado.' };
}

export function fetchMorosos() {
  const dto = getMorosos();
  emitApiSim(Caja.MOROSOS_LIST, { morosos: dto });
  return dto;
}

export function forceMorososCheck() {
  const count = cuotas.filter((c) => !c.paymentId && c.dueDate < todayISO()).length;
  const message = `Verificación completada: ${count} cuota(s) en mora detectada(s).`;
  emitApiSim(Caja.MOROSOS_FORCE_CHECK, { message });
  return { message };
}

export function getDailyReport(date: string) {
  const rows = pagos
    .filter((p) => p.status === 'Pagado' && p.createdAt.startsWith(date))
    .map((p) => {
      const est = estudiantes.find((e) => e.id === p.studentId)!;
      const concepto = cuotas.filter((c) => p.debtIds.includes(c.id)).map((c) => FEE_LABELS[c.mesIndex]).join(', ');
      return {
        id: p.id,
        hora: new Date(p.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
        estudiante: `${est.firstName} ${est.lastName}`,
        concepto, metodo: p.method, monto: p.totalAmount,
      };
    });
  emitApiSim(Caja.REPORT_DAILY, { date, rows });
  return rows;
}

export function generateEstadoCuentaPdf(studentId: number) {
  const est = estudiantes.find((e) => e.id === studentId);
  if (!est) throw new ApiError(404, { message: 'Estudiante no encontrado.' });
  const lines = estudianteCuotas(est.id).map((c) => `${FEE_LABELS[c.mesIndex]} (${mesNombre(c.dueDate)}): Bs. ${c.monto.toFixed(2)} - ${estadoCuota(c)}`);
  emitApiSim(Caja.REPORT_PDF, { tipo: `estado-cuenta/${studentId}` });
  return makePlaceholderPdfBlob(`Estado de Cuenta - ${est.firstName} ${est.lastName}`, lines);
}

export function generateMorosidadPdf() {
  const lines = getMorosos().map((m) => `${m.nombre} (${m.codigo}) - ${m.curso} - ${m.cuotasMora} cuota(s) - Bs. ${m.montoDeuda.toFixed(2)}`);
  emitApiSim(Caja.REPORT_PDF, { tipo: 'morosidad' });
  return makePlaceholderPdfBlob('Reporte de Morosidad', lines);
}

export function generateDailyPdf(date: string) {
  const rows = getDailyReport(date);
  const lines = rows.map((r) => `${r.hora} - ${r.estudiante} - ${r.concepto} (${r.metodo}): Bs. ${r.monto.toFixed(2)}`);
  emitApiSim(Caja.REPORT_PDF, { tipo: 'daily' });
  return makePlaceholderPdfBlob(`Reporte de Ingresos - ${date}`, lines);
}

export function getDashboardStats() {
  const now = new Date();
  const currentMonthPrefix = now.toISOString().slice(0, 7);
  const recaudadoMes = pagos.filter((p) => p.status === 'Pagado' && p.createdAt.startsWith(currentMonthPrefix)).reduce((s, p) => s + p.totalAmount, 0);
  const cuotasActivas = cuotas.filter((c) => estudiantes.find((e) => e.id === c.estudianteId)?.estado !== 'Retirado');
  const cuotasMora = cuotasActivas.filter((c) => estadoCuota(c) === 'Mora');
  const morosidadPromedio = cuotasActivas.length ? Math.round((cuotasMora.length / cuotasActivas.length) * 1000) / 10 : 0;
  const pagosHoy = pagos.filter((p) => p.status === 'Pagado' && p.createdAt.startsWith(todayISO())).length;
  const periodoActivo = activePeriodo();
  const metaMensual = cursos.reduce((sum, c) => {
    const amount = periodoActivo?.courseAmounts[c.id] ?? 0;
    const count = estudiantes.filter((e) => e.cursoId === c.id && e.estado !== 'Retirado').length;
    return sum + amount * count;
  }, 0);

  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const prefix = d.toISOString().slice(0, 7);
    const valor = pagos.filter((p) => p.status === 'Pagado' && p.createdAt.startsWith(prefix)).reduce((s, p) => s + p.totalAmount, 0);
    const nombreMes = d.toLocaleDateString('es-BO', { month: 'short' }).replace('.', '');
    chartData.push({ mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1), valor });
  }
  const maxValor = Math.max(1, ...chartData.map((c) => c.valor));
  const chartDataConPorcentaje = chartData.map((c) => ({ ...c, porcentaje: c.valor > 0 ? Math.max(8, Math.round((c.valor / maxValor) * 100)) : 0 }));

  const moraDeNivel = (level: string) => cuotasMora.filter((c) => {
    const est = estudiantes.find((e) => e.id === c.estudianteId);
    const curso = est && cursos.find((cc) => cc.id === est.cursoId);
    return curso?.level === level;
  }).reduce((s, c) => s + c.monto, 0);
  const moraPrimaria = moraDeNivel('Primaria');
  const moraSecundaria = moraDeNivel('Secundaria');
  const moraTotal = moraPrimaria + moraSecundaria || 1;

  const stats = {
    recaudadoMes, morosidadPromedio, pagosHoy, metaMensual, chartData: chartDataConPorcentaje,
    moraPorNivel: {
      primaria: { monto: moraPrimaria, porcentaje: Math.round((moraPrimaria / moraTotal) * 100) },
      secundaria: { monto: moraSecundaria, porcentaje: Math.round((moraSecundaria / moraTotal) * 100) },
    },
  };
  emitApiSim(Caja.REPORT_DASHBOARD, { stats });
  return stats;
}

// ---------- Portal público ----------
export function portalGetStudent(codigo: string) {
  const est = estudiantes.find((e) => e.codigo.toLowerCase() === codigo.trim().toLowerCase());
  if (!est) throw new ApiError(404, { message: 'Estudiante no encontrado.' });
  const payload = { estudiante: toPortalStudentDTO(est), pensiones: estudianteCuotas(est.id).map(toPortalPensionDTO) };
  emitApiSim(Caja.PORTAL_STUDENT_LOOKUP, { codigo, payload });
  return payload;
}

export function portalCreateQrPayment(codigo: string, debtIds: number[]) {
  const est = estudiantes.find((e) => e.codigo.toLowerCase() === codigo.trim().toLowerCase());
  if (!est) throw new ApiError(404, { message: 'Estudiante no encontrado.' });
  const relevant = cuotas.filter((c) => debtIds.includes(c.id));
  const total = relevant.reduce((s, c) => s + c.monto, 0);
  const transactionId = crypto.randomUUID();
  const pago: Pago = { id: nextId(pagos), studentId: est.id, method: 'QR', totalAmount: total, status: 'Pendiente', transactionId, debtIds, createdAt: new Date().toISOString() };
  pagos.push(pago);
  persistAll();
  emitApiSim(Caja.PORTAL_PAYMENT_QR, { studentId: est.id, total, transactionId, paymentId: pago.id }, { statusCode: 201, requestBody: { codigo, debt_ids: debtIds } });
  return { payment_id: pago.id, transaction_id: transactionId };
}

export function portalGetReceipt(paymentId: number) {
  const p = pagos.find((pp) => pp.id === paymentId);
  if (!p) throw new ApiError(404, { message: 'Comprobante no encontrado.' });
  const dto = toPortalReceiptDTO(p);
  emitApiSim(Caja.PORTAL_RECEIPT, { id: paymentId, receipt: dto });
  return dto;
}

// ---------- Usuarios / Roles ----------
export function listUsuarios() {
  const list = usuarios.map(toUsuarioAdminDTO);
  emitApiSim(Seg.USER_LIST, { users: list });
  return list;
}

export function createUsuario(payload: any) {
  if (!payload.nombre || !payload.correo || !payload.password) {
    throw new ApiError(422, { errors: { nombre: ['Todos los campos son obligatorios.'] } });
  }
  if (usuarios.some((u) => u.correo.toLowerCase() === payload.correo.toLowerCase())) {
    throw new ApiError(422, { errors: { correo: ['El correo ya está registrado.'] } });
  }
  const rol = roles.find((r) => r.nombre === payload.rol) || roles[0];
  const nuevo: Usuario = { id: nextId(usuarios), nombre: payload.nombre, correo: payload.correo, password: payload.password, rolId: rol.id, estado: 'Activo' };
  usuarios.push(nuevo);
  logBitacora('Usuarios', 'Usuario creado', `Se registró el usuario ${nuevo.nombre} (${rol.nombre}).`);
  persistAll();
  const dto = toUsuarioAdminDTO(nuevo);
  emitApiSim(Seg.USER_CREATE, { nombre: nuevo.nombre, correo: nuevo.correo, rolId: nuevo.rolId, user: dto }, { statusCode: 201, requestBody: { ...payload, password: '••••••' } });
  return dto;
}

export function updateUsuario(id: number, payload: any) {
  const u = usuarios.find((uu) => uu.id === id);
  if (!u) throw new ApiError(404, { message: 'Usuario no encontrado.' });
  if (payload.estado === 'Suspendido' && isLastActiveDirectora(id)) {
    throw new ApiError(400, { message: 'No puedes suspender a la última Directora activa del sistema.' });
  }
  if (payload.correo && payload.correo !== u.correo && usuarios.some((uu) => uu.id !== id && uu.correo.toLowerCase() === payload.correo.toLowerCase())) {
    throw new ApiError(422, { errors: { correo: ['El correo ya está registrado.'] } });
  }
  const fields: string[] = [];
  if (payload.nombre) { u.nombre = payload.nombre; fields.push('nombre'); }
  if (payload.correo) { u.correo = payload.correo; fields.push('correo'); }
  if (payload.password) { u.password = payload.password; fields.push('password'); }
  if (payload.rol) { const rol = roles.find((r) => r.nombre === payload.rol); if (rol) { u.rolId = rol.id; fields.push('rol_id'); } }
  if (payload.estado) { u.estado = payload.estado; fields.push('estado'); }
  logBitacora('Usuarios', payload.estado ? 'Estado de usuario actualizado' : 'Usuario actualizado', `${u.nombre}: ${payload.estado ? `estado cambiado a ${payload.estado}.` : 'datos actualizados.'}`);
  persistAll();
  const dto = toUsuarioAdminDTO(u);
  emitApiSim(Seg.USER_UPDATE, { fields: fields.join(', ') || 'estado', id, user: dto }, { requestBody: payload });
  return dto;
}

export function listRoles() {
  const rolesDto = roles.map((r) => ({ id: r.id, nombre: r.nombre, permisos: [...r.permisos] }));
  emitApiSim(Seg.ROLE_LIST, { roles: rolesDto, permisos: PERMISOS });
  return { roles: rolesDto, permisosDisponibles: PERMISOS };
}

export function createRole(payload: any) {
  const nombre = (payload.nombre || '').trim();
  if (!nombre) throw new ApiError(422, { errors: { nombre: ['El nombre es obligatorio.'] } });
  if (roles.some((r) => r.nombre.toLowerCase() === nombre.toLowerCase())) {
    throw new ApiError(422, { errors: { nombre: ['Ya existe un rol con ese nombre.'] } });
  }
  const nuevo: Rol = { id: nextId(roles), nombre, permisos: [] };
  roles.push(nuevo);
  logBitacora('Usuarios', 'Rol creado', `Se creó el rol ${nombre}.`);
  persistAll();
  emitApiSim(Seg.ROLE_CREATE, { nombre }, { statusCode: 201, requestBody: payload });
  return { id: nuevo.id, nombre: nuevo.nombre, permisos: [...nuevo.permisos] };
}

export function updateRolePermissions(id: number, permisos: number[]) {
  const r = roles.find((rr) => rr.id === id);
  if (!r) throw new ApiError(404, { message: 'Rol no encontrado.' });
  r.permisos = permisos;
  logBitacora('Usuarios', 'Permisos actualizados', `Se actualizaron los permisos del rol ${r.nombre}.`);
  persistAll();
  const dto = { id: r.id, nombre: r.nombre, permisos: [...r.permisos] };
  emitApiSim(Seg.ROLE_UPDATE_PERMISSIONS, { id, permisos }, { requestBody: { permisos } });
  return dto;
}

// ---------- Bitácora ----------
export function getAuditLogs(params: { page?: number; search?: string; start_date?: string; end_date?: string }) {
  const page = Number(params.page) || 1;
  const perPage = 20;
  let filtered = [...bitacora].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter((b) => b.userName.toLowerCase().includes(term) || b.action.toLowerCase().includes(term) || b.description.toLowerCase().includes(term));
  }
  if (params.start_date) filtered = filtered.filter((b) => b.createdAt.split('T')[0] >= params.start_date!);
  if (params.end_date) filtered = filtered.filter((b) => b.createdAt.split('T')[0] <= params.end_date!);
  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * perPage;
  const result = { data: filtered.slice(start, start + perPage).map(toAuditLogDTO), total, per_page: perPage, current_page: currentPage, last_page: lastPage };
  emitApiSim(Seg.BITACORA_LIST, { search: params.search, startDate: params.start_date, endDate: params.end_date, page: currentPage, perPage, page_response: result });
  return result;
}

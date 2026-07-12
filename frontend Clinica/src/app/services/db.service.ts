// Repositorio localStorage que reemplaza al backend NestJS/Prisma real. Consolida
// las 11 fuentes de datos que antes vivían repartidas entre servicios HTTP rotos
// y servicios ya-locales sin instrumentar. Cada operación pública mutante llama a
// emitApiSim(...) como último paso para alimentar la consola de simulación API.
// Los servicios originales (auth/rol/usuario/bitacora/backup/especialidad/medico/
// paciente/horario/cita/comprobante) se reescriben como fachadas de este servicio,
// preservando exactamente sus signals/métodos públicos para no tocar componentes.
import { Injectable } from '@angular/core';
import { emitApiSim } from './api-sim/templates';
import * as Seg from './api-sim/catalogs/seguridad.catalog';
import * as Cli from './api-sim/catalogs/clinica.catalog';
import * as Age from './api-sim/catalogs/agenda.catalog';
import { relDate, toLocalDateStr } from '../shared/date-utils';
import type {
  Especialidad, EstadoEspecialidad, Medico, EstadoMedico, HorarioRegular, ExcepcionHorario,
  Paciente, EstadoPaciente, Cita, EstadoCita, Comprobante,
} from '../core/models/clinica.model';
import type { BloqueHorario, SlotCita } from '../core/models/agenda.model';
import type { Rol, Usuario, EstadoUsuario } from '../core/models/usuario.model';
import type { RegistroBitacora, AccionBitacora } from '../core/models/bitacora.model';
import type { RespaldoHistorial } from '../core/models/backup.model';
import type { UserSession } from '../core/models/auth.model';

export const MODULOS_SISTEMA = [
  { id: 'usuarios', nombre: 'Gestión de Usuarios' },
  { id: 'roles', nombre: 'Gestión de Roles y Permisos' },
  { id: 'administracion', nombre: 'Administración Clínica (Pacientes, Médicos)' },
  { id: 'reportes', nombre: 'Reportes y Estadísticas' },
];

const KEYS = {
  especialidades: 'clinica_especialidades', medicos: 'clinica_medicos', pacientes: 'clinica_pacientes',
  horarios: 'clinica_horarios', excepciones: 'clinica_excepciones', citas: 'clinica_citas',
  comprobantes: 'clinica_comprobantes', correlativo: 'clinica_comprobantes_correlativo',
  roles: 'clinica_roles', usuarios: 'clinica_usuarios', bitacora: 'clinica_bitacora',
  backup: 'clinica_backup', seeded: 'clinica_seeded_v1',
};

function load<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
function nextId<T extends { id: number }>(arr: T[]): number {
  return arr.length ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}
function nextWeekday(fromOffset: number, allowedDays: number[]): string {
  let offset = fromOffset;
  for (let i = 0; i < 21; i++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    if (allowedDays.includes(d.getDay())) return toLocalDateStr(d);
    offset++;
  }
  return relDate(fromOffset);
}

@Injectable({ providedIn: 'root' })
export class DbService {
  private especialidades: Especialidad[] = load(KEYS.especialidades, []);
  private medicos: Medico[] = load(KEYS.medicos, []);
  private pacientes: Paciente[] = load(KEYS.pacientes, []);
  private horariosRegulares: HorarioRegular[] = load(KEYS.horarios, []);
  private excepciones: ExcepcionHorario[] = load(KEYS.excepciones, []);
  private citas: Cita[] = load(KEYS.citas, []);
  private comprobantes: Comprobante[] = load(KEYS.comprobantes, []);
  private correlativo: number = load(KEYS.correlativo, 1);
  private roles: Rol[] = load(KEYS.roles, []);
  private usuarios: Usuario[] = load(KEYS.usuarios, []);
  private bitacora: RegistroBitacora[] = load(KEYS.bitacora, []);
  private backupHistorial: RespaldoHistorial[] = load(KEYS.backup, []);

  private currentActor: { nombre: string; rolNombre: string } | null = null;

  constructor() {
    if (!localStorage.getItem(KEYS.seeded)) {
      this.seed();
    }
  }

  // ---------- Seed ----------
  private seed(): void {
    this.especialidades = [
      { id: 1, nombre: 'Cardiología', descripcion: 'Estudio, diagnóstico y tratamiento de las enfermedades del corazón.', estado: 'Vigente' },
      { id: 2, nombre: 'Pediatría', descripcion: 'Atención médica de bebés, niños y adolescentes.', estado: 'Vigente' },
      { id: 3, nombre: 'Neurología', descripcion: 'Trastornos del sistema nervioso central y periférico.', estado: 'Vigente' },
      { id: 4, nombre: 'Dermatología', descripcion: 'Enfermedades de la piel, cabello y uñas.', estado: 'Vigente' },
    ];

    this.roles = [
      { id: 1, nombre: 'Administrador', permisos: ['usuarios', 'roles', 'administracion', 'reportes'] },
      { id: 2, nombre: 'Médico', permisos: ['administracion'] },
      { id: 3, nombre: 'Recepcionista', permisos: ['administracion', 'reportes'] },
    ];

    this.usuarios = [
      { id: 1, nombre: 'Valeria Rojas', correo: 'admin@saludintegral.com', clave: 'admin123', rolId: 1, rolNombre: 'Administrador', estado: 'Activo' },
      { id: 2, nombre: 'Dr. Roberto Silva', correo: 'roberto@saludintegral.com', clave: 'Med-4567891', rolId: 2, rolNombre: 'Médico', estado: 'Activo' },
      { id: 3, nombre: 'Fernanda Mamani', correo: 'recepcion@saludintegral.com', clave: 'recepcion123', rolId: 3, rolNombre: 'Recepcionista', estado: 'Activo' },
      { id: 4, nombre: 'Dra. Carla Castro', correo: 'carla@saludintegral.com', clave: 'Med-5551234', rolId: 2, rolNombre: 'Médico', estado: 'Activo' },
    ];

    this.medicos = [
      { id: 1, nombre: 'Dr. Roberto Silva', ci: '4567891', telefono: '70011223', especialidadId: 1, usuarioId: 2, estado: 'Activo' },
      { id: 2, nombre: 'Dra. Carla Castro', ci: '5551234', telefono: '70055566', especialidadId: 2, usuarioId: 4, estado: 'Activo' },
    ];

    this.pacientes = [
      { id: 1, nombre: 'María López Vargas', ci: '9876543', telefono: '60012345', correo: 'maria.lopez@email.com', fechaNacimiento: '1990-05-15', genero: 'Femenino', estado: 'Activo', fechaRegistro: relDate(-40) + 'T09:00:00.000Z' },
      { id: 2, nombre: 'Juan Pérez Mamani', ci: '5551111', telefono: '70099887', correo: 'juan.perez@email.com', fechaNacimiento: '1985-03-20', genero: 'Masculino', estado: 'Activo', fechaRegistro: relDate(-25) + 'T11:30:00.000Z' },
      { id: 3, nombre: 'Sofía Rodríguez', ci: '5552222', telefono: '70044556', correo: '', fechaNacimiento: '2015-08-10', genero: 'Femenino', estado: 'Activo', fechaRegistro: relDate(-10) + 'T15:00:00.000Z' },
    ];

    this.horariosRegulares = [
      ...[1, 2, 3, 4, 5].map((dia) => ({ medicoId: 1, diaSemana: dia, horaInicio: '08:00', horaFin: '14:00', duracionConsulta: 30 })),
      ...[1, 3, 5].map((dia) => ({ medicoId: 2, diaSemana: dia, horaInicio: '09:00', horaFin: '13:00', duracionConsulta: 20 })),
    ];
    this.excepciones = [
      { id: 1, medicoId: 1, fecha: nextWeekday(10, [1, 2, 3, 4, 5]), motivo: 'Feriado' },
    ];

    this.citas = [];
    this.comprobantes = [];
    this.correlativo = 1;

    const hoyMed1 = nextWeekday(0, [1, 2, 3, 4, 5]);
    const hoyMed2 = nextWeekday(0, [1, 3, 5]);
    const seedCitas: Array<Omit<Cita, 'id'>> = [
      { pacienteId: 1, medicoId: 1, fecha: hoyMed1, horaInicio: '08:00', horaFin: '08:30', estado: 'Completada', estadoPago: 'Pagado', metodoPago: 'Efectivo', tarifa: 150, cajeroId: 3 },
      { pacienteId: 2, medicoId: 1, fecha: hoyMed1, horaInicio: '09:00', horaFin: '09:30', estado: 'Programada', estadoPago: 'Pendiente' },
      { pacienteId: 3, medicoId: 2, fecha: hoyMed2, horaInicio: '09:00', horaFin: '09:20', estado: 'Completada', estadoPago: 'Pagado', metodoPago: 'QR', tarifa: 150, cajeroId: 3 },
      { pacienteId: 1, medicoId: 2, fecha: nextWeekday(-4, [1, 3, 5]), horaInicio: '09:20', horaFin: '09:40', estado: 'Completada', estadoPago: 'Pagado', metodoPago: 'Tarjeta', tarifa: 150, cajeroId: 1 },
      { pacienteId: 2, medicoId: 1, fecha: nextWeekday(-8, [1, 2, 3, 4, 5]), horaInicio: '10:00', horaFin: '10:30', estado: 'Completada', estadoPago: 'Pagado', metodoPago: 'Efectivo', tarifa: 150, cajeroId: 3 },
      { pacienteId: 3, medicoId: 1, fecha: nextWeekday(-2, [1, 2, 3, 4, 5]), horaInicio: '11:00', horaFin: '11:30', estado: 'Cancelada', motivoCancelacion: 'El paciente reagendó por otro motivo.', estadoPago: 'Pendiente' },
      { pacienteId: 1, medicoId: 1, fecha: nextWeekday(3, [1, 2, 3, 4, 5]), horaInicio: '08:30', horaFin: '09:00', estado: 'Programada', estadoPago: 'Pendiente' },
      { pacienteId: 2, medicoId: 2, fecha: nextWeekday(5, [1, 3, 5]), horaInicio: '09:40', horaFin: '10:00', estado: 'Programada', estadoPago: 'Pendiente', esControl: true },
    ];
    seedCitas.forEach((c) => {
      this.citas.push({ ...c, id: nextId(this.citas) });
    });
    this.citas
      .filter((c) => c.estadoPago === 'Pagado')
      .forEach((c) => {
        const numCorrelativo = `COMP-${String(this.correlativo).padStart(6, '0')}`;
        this.correlativo++;
        this.comprobantes.push({
          id: nextId(this.comprobantes), numeroCorrelativo: numCorrelativo, citaId: c.id,
          pacienteId: c.pacienteId, medicoId: c.medicoId, monto: c.tarifa ?? 150,
          metodoPago: c.metodoPago ?? 'Efectivo', fechaEmision: `${c.fecha}T${c.horaInicio}:00.000Z`, cajeroId: c.cajeroId ?? 1,
        });
      });

    this.bitacora = [
      { id: 1, usuario: 'Valeria Rojas', fechaHora: new Date(relDate(-25)), modulo: 'Médicos', accion: 'Creación', detalle: 'Se registró al médico Dra. Carla Castro y se le creó la cuenta de acceso carla@saludintegral.com' },
      { id: 2, usuario: 'Fernanda Mamani', fechaHora: new Date(relDate(-2)), modulo: 'Pacientes', accion: 'Creación', detalle: 'Se registró al paciente: Sofía Rodríguez (CI: 5552222)' },
    ];

    this.backupHistorial = [
      { id: 1, fechaHora: new Date(relDate(-7)), usuario: 'Valeria Rojas', tamanoBytes: 18_874_368, estado: 'Exitoso', nombreArchivo: `backup_${relDate(-7)}.sql` },
      { id: 2, fechaHora: new Date(relDate(-1)), usuario: 'Valeria Rojas', tamanoBytes: 19_495_936, estado: 'Exitoso', nombreArchivo: `backup_${relDate(-1)}.sql` },
    ];

    this.persistAll();
  }

  resetDemoData(): void {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    this.currentActor = null;
    this.seed();
  }

  private persistAll(): void {
    save(KEYS.especialidades, this.especialidades);
    save(KEYS.medicos, this.medicos);
    save(KEYS.pacientes, this.pacientes);
    save(KEYS.horarios, this.horariosRegulares);
    save(KEYS.excepciones, this.excepciones);
    save(KEYS.citas, this.citas);
    save(KEYS.comprobantes, this.comprobantes);
    save(KEYS.correlativo, this.correlativo);
    save(KEYS.roles, this.roles);
    save(KEYS.usuarios, this.usuarios);
    save(KEYS.bitacora, this.bitacora);
    save(KEYS.backup, this.backupHistorial);
    localStorage.setItem(KEYS.seeded, '1');
  }

  // Si la página se recargó (F5), este servicio pierde el actor en memoria aunque
  // la sesión siga activa (AuthService restaura sus signals desde localStorage).
  // Recurrimos a la misma clave que usa AuthService para no perder la atribución.
  private resolveActorNombre(): string {
    if (this.currentActor) return this.currentActor.nombre;
    try {
      const raw = localStorage.getItem('clinica_usuario');
      if (raw) return (JSON.parse(raw) as UserSession).nombre;
    } catch {
      // ignore
    }
    return 'Sistema';
  }

  private registrarBitacora(modulo: string, accion: AccionBitacora, detalle: string): void {
    this.bitacora = [
      { id: nextId(this.bitacora), usuario: this.resolveActorNombre(), fechaHora: new Date(), modulo, accion, detalle },
      ...this.bitacora,
    ];
  }

  // ---------- Auth ----------
  authenticate(correo: string, clave: string): { success: boolean; token?: string; usuario?: UserSession; error?: string } {
    const user = this.usuarios.find((u) => u.correo.toLowerCase() === (correo || '').toLowerCase());
    if (!user || user.clave !== clave || user.estado !== 'Activo') {
      emitApiSim(Seg.AUTH_LOGIN_FAILED, { correo }, { statusCode: 401, requestBody: { correo, clave: '••••••' } });
      return { success: false, error: user && user.estado !== 'Activo' ? 'Tu cuenta ha sido suspendida.' : 'Credenciales incorrectas.' };
    }
    const rol = this.roles.find((r) => r.id === user.rolId);
    const sesion: UserSession = { id: user.id, nombre: user.nombre, correo: user.correo, rolId: user.rolId, rolNombre: rol?.nombre ?? '—', permisos: rol ? [...rol.permisos] : [], estado: user.estado };
    this.currentActor = { nombre: user.nombre, rolNombre: sesion.rolNombre };
    this.registrarBitacora('Seguridad', 'Autenticación', `${user.nombre} inició sesión en el sistema.`);
    const token = `demo-token-${crypto.randomUUID()}`;
    this.persistAll();
    emitApiSim(Seg.AUTH_LOGIN, { correo, userId: user.id, token: token.slice(0, 18), usuario: sesion }, { requestBody: { correo, clave: '••••••' } });
    return { success: true, token, usuario: sesion };
  }

  logout(nombreUsuario?: string): { success: boolean } {
    if (nombreUsuario) this.registrarBitacora('Seguridad', 'Autenticación', `${nombreUsuario} cerró sesión.`);
    this.currentActor = null;
    this.persistAll();
    emitApiSim(Seg.AUTH_LOGOUT, { nombreUsuario });
    return { success: true };
  }

  // ---------- Especialidades ----------
  getEspecialidades(): Especialidad[] {
    const list = [...this.especialidades];
    emitApiSim(Cli.ESPECIALIDAD_LIST, { especialidades: list });
    return list;
  }

  crearEspecialidad(nombre: string, descripcion: string): { success: boolean; error?: string; especialidad?: Especialidad } {
    if (this.especialidades.some((e) => e.nombre.toLowerCase() === nombre.toLowerCase())) {
      return { success: false, error: 'La especialidad ya está registrada en el sistema.' };
    }
    const nueva: Especialidad = { id: nextId(this.especialidades), nombre, descripcion, estado: 'Vigente' };
    this.especialidades = [...this.especialidades, nueva];
    this.registrarBitacora('Especialidades', 'Creación', `Se registró la especialidad: ${nombre}`);
    this.persistAll();
    emitApiSim(Cli.ESPECIALIDAD_CREATE, { nombre, descripcion, especialidad: nueva }, { statusCode: 201, requestBody: { nombre, descripcion } });
    return { success: true, especialidad: nueva };
  }

  actualizarEspecialidad(id: number, datos: Partial<Especialidad>): { success: boolean; error?: string } {
    if (datos.nombre && this.especialidades.some((e) => e.nombre.toLowerCase() === datos.nombre!.toLowerCase() && e.id !== id)) {
      return { success: false, error: 'El nombre ya está siendo utilizado por otra especialidad.' };
    }
    this.especialidades = this.especialidades.map((e) => (e.id === id ? { ...e, ...datos } : e));
    this.registrarBitacora('Especialidades', 'Actualización', `Se modificó la especialidad ID ${id}`);
    this.persistAll();
    emitApiSim(Cli.ESPECIALIDAD_UPDATE, { id, datos });
    return { success: true };
  }

  cambiarEstadoEspecialidad(id: number, nuevoEstado: EstadoEspecialidad): boolean {
    const esp = this.especialidades.find((e) => e.id === id);
    if (!esp) return false;
    this.especialidades = this.especialidades.map((e) => (e.id === id ? { ...e, estado: nuevoEstado } : e));
    this.registrarBitacora('Especialidades', 'Actualización', `Se marcó la especialidad "${esp.nombre}" como ${nuevoEstado}`);
    this.persistAll();
    emitApiSim(Cli.ESPECIALIDAD_UPDATE, { id, datos: { estado: nuevoEstado } });
    return true;
  }

  obtenerNombreEspecialidad(id: number): string {
    return this.especialidades.find((e) => e.id === id)?.nombre ?? 'Sin asignar';
  }

  // ---------- Médicos ----------
  getMedicos(): Medico[] {
    const list = [...this.medicos];
    emitApiSim(Cli.MEDICO_LIST, { medicos: list });
    return list;
  }

  crearMedico(datos: Omit<Medico, 'id' | 'usuarioId' | 'estado'>): { success: boolean; error?: string; medico?: Medico } {
    if (this.medicos.some((m) => m.ci === datos.ci)) {
      return { success: false, error: 'Ya existe un médico registrado con ese Carnet de Identidad.' };
    }
    const primerNombre = datos.nombre.split(' ')[0].toLowerCase().replace('dr.', '').replace('dra.', '').trim();
    const primerApellido = (datos.nombre.split(' ')[1] || '').toLowerCase().trim();
    const correoGenerado = `${primerNombre.charAt(0)}${primerApellido}@saludintegral.com`;
    const claveGenerada = `Med-${datos.ci}`;

    const rolMedico = this.roles.find((r) => r.nombre === 'Médico');
    const nuevoUsuario: Usuario = {
      id: nextId(this.usuarios), nombre: datos.nombre, correo: correoGenerado, clave: claveGenerada,
      rolId: rolMedico?.id ?? 2, rolNombre: rolMedico?.nombre ?? 'Médico', estado: 'Activo',
    };
    this.usuarios = [...this.usuarios, nuevoUsuario];

    const nuevoMedico: Medico = { ...datos, id: nextId(this.medicos), usuarioId: nuevoUsuario.id, estado: 'Activo' };
    this.medicos = [...this.medicos, nuevoMedico];

    this.registrarBitacora('Médicos', 'Creación', `Se registró al médico ${datos.nombre} y se le creó la cuenta de acceso ${correoGenerado}`);
    this.persistAll();
    emitApiSim(Cli.MEDICO_CREATE, { ...datos, correoGenerado, medico: nuevoMedico, usuario: nuevoUsuario }, { statusCode: 201, requestBody: datos });
    return { success: true, medico: nuevoMedico };
  }

  actualizarMedico(id: number, datos: Partial<Medico>): { success: boolean; error?: string } {
    if (datos.ci && this.medicos.some((m) => m.ci === datos.ci && m.id !== id)) {
      return { success: false, error: 'Ese Carnet de Identidad pertenece a otro médico.' };
    }
    this.medicos = this.medicos.map((m) => (m.id === id ? { ...m, ...datos } : m));
    this.registrarBitacora('Médicos', 'Actualización', `Se actualizaron los datos del médico ID ${id}`);
    this.persistAll();
    emitApiSim(Cli.MEDICO_UPDATE, { id, datos });
    return { success: true };
  }

  eliminarMedico(id: number): boolean {
    const med = this.medicos.find((m) => m.id === id);
    if (!med) return false;
    this.medicos = this.medicos.filter((m) => m.id !== id);
    this.registrarBitacora('Médicos', 'Eliminación', `Se eliminó al médico ${med.nombre}`);
    this.persistAll();
    emitApiSim(Cli.MEDICO_DELETE, { id });
    return true;
  }

  cambiarEstadoMedico(id: number, nuevoEstado: EstadoMedico): boolean {
    const med = this.medicos.find((m) => m.id === id);
    if (!med) return false;
    if (nuevoEstado === 'Inactivo') {
      this.cambiarEstadoUsuario(med.usuarioId, 'Suspendido');
    } else if (nuevoEstado === 'Activo') {
      this.cambiarEstadoUsuario(med.usuarioId, 'Activo');
    }
    this.medicos = this.medicos.map((m) => (m.id === id ? { ...m, estado: nuevoEstado } : m));
    this.registrarBitacora('Médicos', 'Actualización', `El médico ${med.nombre} cambió su estado a ${nuevoEstado}`);
    this.persistAll();
    emitApiSim(Cli.MEDICO_UPDATE, { id, datos: { estado: nuevoEstado } });
    return true;
  }

  // ---------- Pacientes ----------
  getPacientes(): Paciente[] {
    const list = [...this.pacientes];
    emitApiSim(Cli.PACIENTE_LIST, { pacientes: list });
    return list;
  }

  crearPaciente(datos: Omit<Paciente, 'id' | 'estado' | 'fechaRegistro'>): { success: boolean; error?: string; paciente?: Paciente } {
    if (this.pacientes.some((p) => p.ci === datos.ci)) {
      return { success: false, error: 'Ya existe un paciente registrado con ese CI.' };
    }
    const nuevo: Paciente = { ...datos, id: nextId(this.pacientes), estado: 'Activo', fechaRegistro: new Date().toISOString() };
    this.pacientes = [...this.pacientes, nuevo];
    this.registrarBitacora('Pacientes', 'Creación', `Se registró al paciente: ${datos.nombre} (CI: ${datos.ci})`);
    this.persistAll();
    emitApiSim(Cli.PACIENTE_CREATE, { ...datos, paciente: nuevo }, { statusCode: 201, requestBody: datos });
    return { success: true, paciente: nuevo };
  }

  actualizarPaciente(id: number, datos: Partial<Paciente>): { success: boolean; error?: string } {
    if (datos.ci && this.pacientes.some((p) => p.ci === datos.ci && p.id !== id)) {
      return { success: false, error: 'Ese CI ya está registrado en otra historia clínica.' };
    }
    this.pacientes = this.pacientes.map((p) => (p.id === id ? { ...p, ...datos } : p));
    this.registrarBitacora('Pacientes', 'Actualización', `Se modificó el expediente del paciente ID ${id}`);
    this.persistAll();
    emitApiSim(Cli.PACIENTE_UPDATE, { id, datos });
    return { success: true };
  }

  cambiarEstadoPaciente(id: number, nuevoEstado: EstadoPaciente): boolean {
    const pac = this.pacientes.find((p) => p.id === id);
    if (!pac) return false;
    this.pacientes = this.pacientes.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p));
    this.registrarBitacora('Pacientes', 'Actualización', `Paciente ${pac.nombre} cambió su estado a ${nuevoEstado}`);
    this.persistAll();
    emitApiSim(Cli.PACIENTE_UPDATE, { id, datos: { estado: nuevoEstado } });
    return true;
  }

  // ---------- Horarios ----------
  obtenerHorarioMedico(medicoId: number): HorarioRegular[] {
    return this.horariosRegulares.filter((h) => h.medicoId === medicoId);
  }

  obtenerExcepcionesMedico(medicoId: number): ExcepcionHorario[] {
    return this.excepciones.filter((e) => e.medicoId === medicoId);
  }

  guardarHorarioMedico(medicoId: number, horarios: HorarioRegular[]): void {
    this.horariosRegulares = [...this.horariosRegulares.filter((h) => h.medicoId !== medicoId), ...horarios];
    this.registrarBitacora('Horarios', 'Actualización', `Se actualizaron los horarios regulares del médico ID ${medicoId}`);
    this.persistAll();
    emitApiSim(Age.HORARIO_SAVE, { medicoId, horarios });
  }

  agregarExcepcion(excepcion: Omit<ExcepcionHorario, 'id'>): boolean {
    if (this.excepciones.some((e) => e.medicoId === excepcion.medicoId && e.fecha === excepcion.fecha)) return false;
    const nueva: ExcepcionHorario = { ...excepcion, id: nextId(this.excepciones) };
    this.excepciones = [...this.excepciones, nueva];
    this.registrarBitacora('Horarios', 'Creación', `Se bloqueó el día ${excepcion.fecha} para el médico ID ${excepcion.medicoId}`);
    this.persistAll();
    emitApiSim(Age.EXCEPCION_CREATE, { excepcion: nueva }, { statusCode: 201, requestBody: excepcion });
    return true;
  }

  eliminarExcepcion(id: number): void {
    this.excepciones = this.excepciones.filter((e) => e.id !== id);
    this.persistAll();
    emitApiSim(Age.EXCEPCION_DELETE, { id });
  }

  generarBloquesDisponibles(medicoId: number, fechaStr: string): BloqueHorario[] {
    if (this.excepciones.some((e) => e.medicoId === medicoId && e.fecha === fechaStr)) return [];
    const diaSemana = new Date(`${fechaStr}T00:00:00`).getDay();
    const horarioDia = this.horariosRegulares.find((h) => h.medicoId === medicoId && h.diaSemana === diaSemana);
    if (!horarioDia) return [];

    const bloques: BloqueHorario[] = [];
    const [horaInicio, minInicio] = horarioDia.horaInicio.split(':').map(Number);
    const [horaFin, minFin] = horarioDia.horaFin.split(':').map(Number);
    let actualMins = horaInicio * 60 + minInicio;
    const finMins = horaFin * 60 + minFin;
    const duracion = horarioDia.duracionConsulta;

    while (actualMins + duracion <= finMins) {
      const hIniStr = Math.floor(actualMins / 60).toString().padStart(2, '0');
      const mIniStr = (actualMins % 60).toString().padStart(2, '0');
      const sigMins = actualMins + duracion;
      const hFinStr = Math.floor(sigMins / 60).toString().padStart(2, '0');
      const mFinStr = (sigMins % 60).toString().padStart(2, '0');
      bloques.push({ horaInicio: `${hIniStr}:${mIniStr}`, horaFin: `${hFinStr}:${mFinStr}` });
      actualMins = sigMins;
    }
    return bloques;
  }

  // ---------- Citas ----------
  getCitas(): Cita[] {
    return [...this.citas];
  }

  obtenerDisponibilidad(medicoId: number, fecha: string): SlotCita[] {
    const bloquesTeoricos = this.generarBloquesDisponibles(medicoId, fecha);
    const citasDelDia = this.citas.filter((c) => c.medicoId === medicoId && c.fecha === fecha && (c.estado === 'Programada' || c.estado === 'Completada'));
    const slots = bloquesTeoricos.map((bloque) => {
      const citaOcupante = citasDelDia.find((c) => c.horaInicio === bloque.horaInicio);
      return { horaInicio: bloque.horaInicio, horaFin: bloque.horaFin, disponible: !citaOcupante, citaId: citaOcupante?.id, pacienteId: citaOcupante?.pacienteId, esControl: citaOcupante?.esControl };
    });
    emitApiSim(Age.CITA_DISPONIBILIDAD, { medicoId, fecha, slots });
    return slots;
  }

  crearCita(datos: Omit<Cita, 'id' | 'estado'>): { success: boolean; error?: string; citaId?: number } {
    const ocupado = this.citas.find((c) => c.medicoId === datos.medicoId && c.fecha === datos.fecha && c.horaInicio === datos.horaInicio && (c.estado === 'Programada' || c.estado === 'Completada'));
    if (ocupado) {
      return { success: false, error: 'Este espacio horario ya acaba de ser reservado por otro paciente.' };
    }
    const nueva: Cita = { ...datos, id: nextId(this.citas), estado: 'Programada', estadoPago: 'Pendiente', tarifa: 150 };
    this.citas = [...this.citas, nueva];
    this.registrarBitacora('Citas', 'Creación', `Se programó cita (Med: ${datos.medicoId}, Pac: ${datos.pacienteId}) para el ${datos.fecha} a las ${datos.horaInicio}`);
    this.persistAll();
    emitApiSim(Age.CITA_CREATE, { ...datos, citaId: nueva.id }, { statusCode: 201, requestBody: datos });
    return { success: true, citaId: nueva.id };
  }

  cancelarCita(id: number, motivo: string): boolean {
    const cita = this.citas.find((c) => c.id === id);
    if (!cita) return false;
    this.citas = this.citas.map((c) => (c.id === id ? { ...c, estado: 'Cancelada' as EstadoCita, motivoCancelacion: motivo } : c));
    this.registrarBitacora('Citas', 'Actualización', `Se canceló la cita ${id}. Motivo: ${motivo}`);
    this.persistAll();
    emitApiSim(Age.CITA_CANCEL, { id, motivo });
    return true;
  }

  completarCita(id: number): boolean {
    const cita = this.citas.find((c) => c.id === id);
    if (!cita) return false;
    this.citas = this.citas.map((c) => (c.id === id ? { ...c, estado: 'Completada' as EstadoCita } : c));
    this.registrarBitacora('Citas', 'Actualización', `Se marcó como completada la cita ${id}.`);
    this.persistAll();
    emitApiSim(Age.CITA_COMPLETE, { id });
    return true;
  }

  pagarCita(id: number, cajeroId: number, tarifaFinal: number, metodoPago: 'Efectivo' | 'Tarjeta' | 'QR'): boolean {
    const cita = this.citas.find((c) => c.id === id);
    if (!cita) return false;
    this.citas = this.citas.map((c) => (c.id === id ? { ...c, estadoPago: 'Pagado' as const, cajeroId, tarifa: tarifaFinal, metodoPago } : c));
    this.registrarBitacora('Citas', 'Actualización', `Cobro registrado para la cita ${id} vía ${metodoPago} por cajero ${cajeroId}. Monto: ${tarifaFinal} Bs.`);
    this.persistAll();
    emitApiSim(Age.CITA_PAGAR, { id, cajeroId, tarifaFinal, metodoPago });
    return true;
  }

  // ---------- Comprobantes ----------
  getComprobantes(): Comprobante[] {
    return [...this.comprobantes];
  }

  generarComprobante(citaId: number, pacienteId: number, medicoId: number, monto: number, metodoPago: 'Efectivo' | 'Tarjeta' | 'QR', cajeroId: number): Comprobante {
    const numCorrelativo = `COMP-${String(this.correlativo).padStart(6, '0')}`;
    this.correlativo++;
    const comprobante: Comprobante = { id: nextId(this.comprobantes), numeroCorrelativo: numCorrelativo, citaId, pacienteId, medicoId, monto, metodoPago, fechaEmision: new Date().toISOString(), cajeroId };
    this.comprobantes = [...this.comprobantes, comprobante];
    this.registrarBitacora('Comprobantes', 'Creación', `Comprobante ${numCorrelativo} emitido por ${monto} Bs. (${metodoPago})`);
    this.persistAll();
    emitApiSim(Age.COMPROBANTE_CREATE, { comprobante }, { statusCode: 201, requestBody: { citaId, pacienteId, medicoId, monto, metodoPago, cajeroId } });
    return comprobante;
  }

  // ---------- Roles ----------
  getRoles(): Rol[] {
    const list = this.roles.map((r) => ({ ...r, permisos: [...r.permisos] }));
    emitApiSim(Seg.ROL_LIST, { roles: list });
    return list;
  }

  crearRol(nombre: string): { success: boolean; error?: string; rol?: Rol } {
    if (this.roles.some((r) => r.nombre.toLowerCase() === nombre.toLowerCase())) {
      return { success: false, error: 'Ya existe un rol con ese nombre.' };
    }
    const nuevo: Rol = { id: nextId(this.roles), nombre, permisos: [] };
    this.roles = [...this.roles, nuevo];
    this.registrarBitacora('Roles', 'Creación', `Se creó el rol ${nombre}`);
    this.persistAll();
    emitApiSim(Seg.ROL_CREATE, { nombre, rol: nuevo }, { statusCode: 201, requestBody: { nombre } });
    return { success: true, rol: nuevo };
  }

  actualizarRol(id: number, nombre: string): { success: boolean; error?: string } {
    if (this.roles.some((r) => r.nombre.toLowerCase() === nombre.toLowerCase() && r.id !== id)) {
      return { success: false, error: 'Ya existe un rol con ese nombre.' };
    }
    this.roles = this.roles.map((r) => (r.id === id ? { ...r, nombre } : r));
    this.persistAll();
    emitApiSim(Seg.ROL_UPDATE, { id, nombre });
    return { success: true };
  }

  actualizarPermisosRol(id: number, permisos: string[]): { success: boolean; error?: string } {
    if (id === 1) return { success: false, error: 'Los permisos del rol Administrador no pueden modificarse.' };
    this.roles = this.roles.map((r) => (r.id === id ? { ...r, permisos } : r));
    this.registrarBitacora('Roles', 'Permisos', `Se actualizaron los permisos del rol ID ${id}`);
    this.persistAll();
    emitApiSim(Seg.ROL_PERMISOS, { id, permisos }, { requestBody: { permisos } });
    return { success: true };
  }

  eliminarRol(id: number): { success: boolean; error?: string } {
    if (id === 1) return { success: false, error: 'El rol Administrador no puede eliminarse.' };
    if (this.usuarios.some((u) => u.rolId === id)) {
      return { success: false, error: 'No puedes eliminar un rol que tiene usuarios asignados.' };
    }
    this.roles = this.roles.filter((r) => r.id !== id);
    this.persistAll();
    emitApiSim(Seg.ROL_DELETE, { id });
    return { success: true };
  }

  obtenerNombreRol(id: number): string {
    return this.roles.find((r) => r.id === id)?.nombre ?? 'Desconocido';
  }

  // ---------- Usuarios ----------
  private toUsuarioDTO(u: Usuario): Usuario {
    return { ...u, rolNombre: this.obtenerNombreRol(u.rolId) };
  }

  getUsuarios(): Usuario[] {
    const list = this.usuarios.map((u) => this.toUsuarioDTO(u));
    emitApiSim(Seg.USUARIO_LIST, { usuarios: list });
    return list;
  }

  crearUsuario(nuevoUsuario: Omit<Usuario, 'id'>): { success: boolean; error?: string; usuario?: Usuario } {
    if (this.usuarios.some((u) => u.correo.toLowerCase() === nuevoUsuario.correo.toLowerCase())) {
      return { success: false, error: 'Ya existe un usuario registrado con ese correo.' };
    }
    const nuevo: Usuario = { ...nuevoUsuario, id: nextId(this.usuarios) };
    this.usuarios = [...this.usuarios, nuevo];
    this.registrarBitacora('Usuarios', 'Creación', `Se registró el usuario ${nuevo.nombre} (${this.obtenerNombreRol(nuevo.rolId)})`);
    this.persistAll();
    const dto = this.toUsuarioDTO(nuevo);
    emitApiSim(Seg.USUARIO_CREATE, { ...nuevoUsuario, usuario: dto }, { statusCode: 201, requestBody: { ...nuevoUsuario, clave: '••••••' } });
    return { success: true, usuario: dto };
  }

  actualizarUsuario(id: number, datos: Partial<Usuario>): { success: boolean; error?: string; usuario?: Usuario } {
    if (datos.correo && this.usuarios.some((u) => u.id !== id && u.correo.toLowerCase() === datos.correo!.toLowerCase())) {
      return { success: false, error: 'Ya existe un usuario registrado con ese correo.' };
    }
    if (!datos.clave) delete datos.clave;
    this.usuarios = this.usuarios.map((u) => (u.id === id ? { ...u, ...datos } : u));
    this.registrarBitacora('Usuarios', 'Actualización', `Se actualizaron los datos del usuario ID ${id}`);
    this.persistAll();
    const u = this.usuarios.find((uu) => uu.id === id);
    emitApiSim(Seg.USUARIO_UPDATE, { id, datos }, { requestBody: { ...datos, clave: datos.clave ? '••••••' : undefined } });
    return { success: true, usuario: u ? this.toUsuarioDTO(u) : undefined };
  }

  cambiarEstadoUsuario(id: number, nuevoEstado: EstadoUsuario): { success: boolean; error?: string; usuario?: Usuario } {
    if (nuevoEstado === 'Suspendido') {
      const esUnicoAdminActivo = this.usuarios.filter((u) => u.rolId === 1 && u.estado === 'Activo').length === 1
        && this.usuarios.find((u) => u.id === id)?.rolId === 1;
      if (esUnicoAdminActivo) {
        return { success: false, error: 'No puedes suspender al único administrador activo del sistema.' };
      }
    }
    this.usuarios = this.usuarios.map((u) => (u.id === id ? { ...u, estado: nuevoEstado } : u));
    this.persistAll();
    const u = this.usuarios.find((uu) => uu.id === id);
    emitApiSim(Seg.USUARIO_ESTADO, { id, estado: nuevoEstado }, { requestBody: { estado: nuevoEstado } });
    return { success: true, usuario: u ? this.toUsuarioDTO(u) : undefined };
  }

  // ---------- Bitácora ----------
  getBitacora(): RegistroBitacora[] {
    const list = [...this.bitacora];
    emitApiSim(Seg.BITACORA_LIST, { logs: list });
    return list;
  }

  // ---------- Backup ----------
  getBackupHistorial(): RespaldoHistorial[] {
    return [...this.backupHistorial];
  }

  generarRespaldo(): { success: boolean } {
    const tamanoBytes = 15_000_000 + Math.floor(Math.random() * 10_000_000);
    const registro: RespaldoHistorial = {
      id: nextId(this.backupHistorial), fechaHora: new Date(),
      usuario: this.resolveActorNombre(), tamanoBytes, estado: 'Exitoso',
      nombreArchivo: `backup_${toLocalDateStr()}_${String(this.backupHistorial.length + 1).padStart(3, '0')}.sql`,
    };
    this.backupHistorial = [registro, ...this.backupHistorial];
    this.registrarBitacora('Backup', 'Creación', `Se generó una copia de seguridad manual: ${registro.nombreArchivo}`);
    this.persistAll();
    emitApiSim(Age.BACKUP_CREATE, { registro }, { statusCode: 201 });
    return { success: true };
  }
}

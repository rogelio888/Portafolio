import { ApiSimTemplate } from '../templates';

export const ESPECIALIDAD_LIST: ApiSimTemplate<any> = {
  method: 'GET',
  route: '/api/especialidades',
  entity: 'Especialidad',
  operationLabel: 'Listar especialidades',
  controllerCode: `// especialidades.controller.ts (NestJS)
@Get()
findAll() {
  return this.prisma.especialidad.findMany({ orderBy: { nombre: 'asc' } });
}`,
  sqlQuery: () => `SELECT * FROM especialidades ORDER BY nombre ASC;`,
  responseBody: (ctx) => ctx.especialidades,
};

export const ESPECIALIDAD_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/especialidades',
  entity: 'Especialidad',
  operationLabel: 'Crear especialidad',
  controllerCode: `// especialidades.controller.ts (NestJS)
@Post()
create(@Body() dto: CreateEspecialidadDto) {
  return this.prisma.especialidad.create({ data: { ...dto, estado: 'Vigente' } });
}`,
  sqlQuery: (ctx) => `INSERT INTO especialidades (nombre, descripcion, estado) VALUES ('${ctx.nombre}', '${ctx.descripcion}', 'Vigente');`,
  responseBody: (ctx) => ({ success: true, ...ctx.especialidad }),
};

export const ESPECIALIDAD_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/especialidades/{id}',
  entity: 'Especialidad',
  operationLabel: 'Actualizar especialidad',
  controllerCode: `// especialidades.controller.ts (NestJS)
@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdateEspecialidadDto) {
  return this.prisma.especialidad.update({ where: { id: Number(id) }, data: dto });
}`,
  sqlQuery: (ctx) => `UPDATE especialidades SET ${Object.keys(ctx.datos ?? {}).map((k) => `${k} = ?`).join(', ')} WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const MEDICO_LIST: ApiSimTemplate<any> = {
  method: 'GET',
  route: '/api/medicos',
  entity: 'Médico',
  operationLabel: 'Listar médicos',
  controllerCode: `// medicos.controller.ts (NestJS)
@Get()
findAll() {
  return this.prisma.medico.findMany({ include: { especialidad: true } });
}`,
  sqlQuery: () => `SELECT m.*, e.nombre AS especialidad_nombre FROM medicos m JOIN especialidades e ON e.id = m.especialidad_id;`,
  responseBody: (ctx) => ctx.medicos,
};

export const MEDICO_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/medicos',
  entity: 'Médico',
  operationLabel: 'Registrar médico (+ cuenta de acceso automática)',
  controllerCode: `// medicos.controller.ts (NestJS)
@Post()
async create(@Body() dto: CreateMedicoDto) {
  return this.prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: { nombre: dto.nombre, correo: this.generarCorreo(dto.nombre), claveHash: await bcrypt.hash(\`Med-\${dto.ci}\`, 10), rolId: ROL_MEDICO },
    });
    return tx.medico.create({ data: { ...dto, usuarioId: usuario.id, estado: 'Activo' } });
  });
}`,
  sqlQuery: (ctx) => `INSERT INTO usuarios (nombre, correo, clave_hash, rol_id, estado) VALUES ('${ctx.nombre}', '${ctx.correoGenerado}', '<hashed>', 2, 'Activo');
INSERT INTO medicos (nombre, ci, telefono, especialidad_id, usuario_id, estado) VALUES ('${ctx.nombre}', '${ctx.ci}', '${ctx.telefono}', ${ctx.especialidadId}, LAST_INSERT_ID(), 'Activo');`,
  responseBody: (ctx) => ({ success: true, ...ctx.medico }),
};

export const MEDICO_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/medicos/{id}',
  entity: 'Médico',
  operationLabel: 'Actualizar médico',
  controllerCode: `// medicos.controller.ts (NestJS)
@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdateMedicoDto) {
  return this.prisma.medico.update({ where: { id: Number(id) }, data: dto });
}`,
  sqlQuery: (ctx) => `UPDATE medicos SET ${Object.keys(ctx.datos ?? {}).map((k) => `${k} = ?`).join(', ')} WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const MEDICO_DELETE: ApiSimTemplate<any> = {
  method: 'DELETE',
  route: '/api/medicos/{id}',
  entity: 'Médico',
  operationLabel: 'Eliminar médico',
  controllerCode: `// medicos.controller.ts (NestJS)
@Delete(':id')
remove(@Param('id') id: string) {
  return this.prisma.medico.delete({ where: { id: Number(id) } });
}`,
  sqlQuery: (ctx) => `DELETE FROM medicos WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const PACIENTE_LIST: ApiSimTemplate<any> = {
  method: 'GET',
  route: '/api/pacientes',
  entity: 'Paciente',
  operationLabel: 'Listar pacientes',
  controllerCode: `// pacientes.controller.ts (NestJS)
@Get()
findAll() {
  return this.prisma.paciente.findMany({ orderBy: { nombre: 'asc' } });
}`,
  sqlQuery: () => `SELECT * FROM pacientes ORDER BY nombre ASC;`,
  responseBody: (ctx) => ctx.pacientes,
};

export const PACIENTE_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/pacientes',
  entity: 'Paciente',
  operationLabel: 'Registrar paciente',
  controllerCode: `// pacientes.controller.ts (NestJS)
@Post()
create(@Body() dto: CreatePacienteDto) {
  return this.prisma.paciente.create({ data: { ...dto, estado: 'Activo', fechaRegistro: new Date() } });
}`,
  sqlQuery: (ctx) => `INSERT INTO pacientes (nombre, ci, telefono, correo, fecha_nacimiento, genero, estado, fecha_registro) VALUES ('${ctx.nombre}', '${ctx.ci}', '${ctx.telefono}', '${ctx.correo ?? ''}', '${ctx.fechaNacimiento ?? ''}', '${ctx.genero ?? ''}', 'Activo', NOW());`,
  responseBody: (ctx) => ({ success: true, ...ctx.paciente }),
};

export const PACIENTE_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/pacientes/{id}',
  entity: 'Paciente',
  operationLabel: 'Actualizar paciente',
  controllerCode: `// pacientes.controller.ts (NestJS)
@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdatePacienteDto) {
  return this.prisma.paciente.update({ where: { id: Number(id) }, data: dto });
}`,
  sqlQuery: (ctx) => `UPDATE pacientes SET ${Object.keys(ctx.datos ?? {}).map((k) => `${k} = ?`).join(', ')} WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

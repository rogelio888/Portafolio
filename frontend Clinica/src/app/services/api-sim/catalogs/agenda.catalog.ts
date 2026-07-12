import { ApiSimTemplate } from '../templates';

export const HORARIO_SAVE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/horarios/{medicoId}',
  entity: 'Horario',
  operationLabel: 'Guardar horario regular del médico',
  controllerCode: `// horarios.controller.ts (NestJS)
@Put(':medicoId')
async guardar(@Param('medicoId') medicoId: string, @Body() dto: HorarioRegularDto[]) {
  await this.prisma.horarioRegular.deleteMany({ where: { medicoId: Number(medicoId) } });
  return this.prisma.horarioRegular.createMany({ data: dto.map((h) => ({ ...h, medicoId: Number(medicoId) })) });
}`,
  sqlQuery: (ctx) => `DELETE FROM horarios_regulares WHERE medico_id = ${ctx.medicoId};
INSERT INTO horarios_regulares (medico_id, dia_semana, hora_inicio, hora_fin, duracion_consulta) VALUES ${(ctx.horarios ?? []).map((h: any) => `(${ctx.medicoId}, ${h.diaSemana}, '${h.horaInicio}', '${h.horaFin}', ${h.duracionConsulta})`).join(', ') || '(...)'};`,
  responseBody: () => ({ success: true }),
};

export const EXCEPCION_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/horarios/excepciones',
  entity: 'Excepción de Horario',
  operationLabel: 'Bloquear día (feriado / vacaciones / personal)',
  controllerCode: `// horarios.controller.ts (NestJS)
@Post('excepciones')
crear(@Body() dto: CreateExcepcionDto) {
  return this.prisma.excepcionHorario.create({ data: dto });
}`,
  sqlQuery: (ctx) => `INSERT INTO excepciones_horario (medico_id, fecha, motivo) VALUES (${ctx.excepcion.medicoId}, '${ctx.excepcion.fecha}', '${ctx.excepcion.motivo}');`,
  responseBody: (ctx) => ({ success: true, ...ctx.excepcion }),
};

export const EXCEPCION_DELETE: ApiSimTemplate<any> = {
  method: 'DELETE',
  route: '/api/horarios/excepciones/{id}',
  entity: 'Excepción de Horario',
  operationLabel: 'Eliminar bloqueo de día',
  controllerCode: `// horarios.controller.ts (NestJS)
@Delete('excepciones/:id')
eliminar(@Param('id') id: string) {
  return this.prisma.excepcionHorario.delete({ where: { id: Number(id) } });
}`,
  sqlQuery: (ctx) => `DELETE FROM excepciones_horario WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const CITA_DISPONIBILIDAD: ApiSimTemplate<any> = {
  method: 'GET',
  route: '/api/citas/disponibilidad',
  entity: 'Cita',
  operationLabel: 'Calcular disponibilidad de agenda (motor horario ∩ citas)',
  controllerCode: `// citas.controller.ts (NestJS)
@Get('disponibilidad')
async disponibilidad(@Query('medicoId') medicoId: string, @Query('fecha') fecha: string) {
  const bloques = await this.horariosService.generarBloques(Number(medicoId), fecha);
  const citas = await this.prisma.cita.findMany({
    where: { medicoId: Number(medicoId), fecha, estado: { in: ['Programada', 'Completada'] } },
  });
  return bloques.map((b) => ({ ...b, disponible: !citas.find((c) => c.horaInicio === b.horaInicio) }));
}`,
  sqlQuery: (ctx) => `SELECT * FROM horarios_regulares WHERE medico_id = ${ctx.medicoId} AND dia_semana = DAYOFWEEK('${ctx.fecha}') - 1;
SELECT * FROM citas WHERE medico_id = ${ctx.medicoId} AND fecha = '${ctx.fecha}' AND estado IN ('Programada','Completada');`,
  responseBody: (ctx) => ctx.slots,
};

export const CITA_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/citas',
  entity: 'Cita',
  operationLabel: 'Reservar cita',
  controllerCode: `// citas.controller.ts (NestJS)
@Post()
async crear(@Body() dto: CreateCitaDto) {
  const choque = await this.prisma.cita.findFirst({
    where: { medicoId: dto.medicoId, fecha: dto.fecha, horaInicio: dto.horaInicio, estado: { in: ['Programada', 'Completada'] } },
  });
  if (choque) throw new ConflictException('Este espacio horario ya fue reservado.');
  return this.prisma.cita.create({ data: { ...dto, estado: 'Programada', estadoPago: 'Pendiente', tarifa: 150 } });
}`,
  sqlQuery: (ctx) => `SELECT id FROM citas WHERE medico_id = ${ctx.medicoId} AND fecha = '${ctx.fecha}' AND hora_inicio = '${ctx.horaInicio}' AND estado IN ('Programada','Completada');
INSERT INTO citas (paciente_id, medico_id, fecha, hora_inicio, hora_fin, estado, estado_pago, tarifa) VALUES (${ctx.pacienteId}, ${ctx.medicoId}, '${ctx.fecha}', '${ctx.horaInicio}', '${ctx.horaFin}', 'Programada', 'Pendiente', 150);`,
  responseBody: (ctx) => ({ success: true, citaId: ctx.citaId }),
};

export const CITA_CANCEL: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/citas/{id}/cancelar',
  entity: 'Cita',
  operationLabel: 'Cancelar cita',
  controllerCode: `// citas.controller.ts (NestJS)
@Put(':id/cancelar')
cancelar(@Param('id') id: string, @Body() dto: { motivo: string }) {
  return this.prisma.cita.update({ where: { id: Number(id) }, data: { estado: 'Cancelada', motivoCancelacion: dto.motivo } });
}`,
  sqlQuery: (ctx) => `UPDATE citas SET estado = 'Cancelada', motivo_cancelacion = '${ctx.motivo}' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const CITA_COMPLETE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/citas/{id}/completar',
  entity: 'Cita',
  operationLabel: 'Marcar cita como atendida',
  controllerCode: `// citas.controller.ts (NestJS)
@Put(':id/completar')
completar(@Param('id') id: string) {
  return this.prisma.cita.update({ where: { id: Number(id) }, data: { estado: 'Completada' } });
}`,
  sqlQuery: (ctx) => `UPDATE citas SET estado = 'Completada' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const CITA_PAGAR: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/citas/{id}/pagar',
  entity: 'Cita',
  operationLabel: 'Registrar cobro de consulta',
  controllerCode: `// citas.controller.ts (NestJS)
@Put(':id/pagar')
pagar(@Param('id') id: string, @Body() dto: PagarCitaDto) {
  return this.prisma.cita.update({
    where: { id: Number(id) },
    data: { estadoPago: 'Pagado', cajeroId: dto.cajeroId, tarifa: dto.tarifaFinal, metodoPago: dto.metodoPago },
  });
}`,
  sqlQuery: (ctx) => `UPDATE citas SET estado_pago = 'Pagado', cajero_id = ${ctx.cajeroId}, tarifa = ${ctx.tarifaFinal}, metodo_pago = '${ctx.metodoPago}' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const COMPROBANTE_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/comprobantes',
  entity: 'Comprobante',
  operationLabel: 'Emitir comprobante de pago',
  controllerCode: `// comprobantes.controller.ts (NestJS)
@Post()
async crear(@Body() dto: CreateComprobanteDto) {
  const correlativo = await this.siguienteCorrelativo();
  return this.prisma.comprobante.create({
    data: { ...dto, numeroCorrelativo: \`COMP-\${String(correlativo).padStart(6, '0')}\`, fechaEmision: new Date() },
  });
}`,
  sqlQuery: (ctx) => `INSERT INTO comprobantes (numero_correlativo, cita_id, paciente_id, medico_id, monto, metodo_pago, fecha_emision, cajero_id)
VALUES ('${ctx.comprobante.numeroCorrelativo}', ${ctx.comprobante.citaId}, ${ctx.comprobante.pacienteId}, ${ctx.comprobante.medicoId}, ${ctx.comprobante.monto}, '${ctx.comprobante.metodoPago}', NOW(), ${ctx.comprobante.cajeroId});`,
  responseBody: (ctx) => ctx.comprobante,
};

export const BACKUP_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/backup',
  entity: 'Backup',
  operationLabel: 'Generar copia de seguridad manual',
  controllerCode: `// backup.controller.ts (NestJS)
@Post()
async generar() {
  const dump = await this.dbDumpService.exportar(); // pg_dump / sqlcmd BACKUP DATABASE
  const registro = await this.prisma.respaldoHistorial.create({
    data: { usuario: this.currentUser.nombre, tamanoBytes: dump.size, estado: 'Exitoso', nombreArchivo: dump.filename },
  });
  return { success: true, ...registro };
}`,
  sqlQuery: (ctx) => `BACKUP DATABASE SaludIntegral TO DISK = '${ctx.registro.nombreArchivo}';
INSERT INTO respaldos_historial (usuario, tamano_bytes, estado, nombre_archivo) VALUES ('${ctx.registro.usuario}', ${ctx.registro.tamanoBytes}, 'Exitoso', '${ctx.registro.nombreArchivo}');`,
  responseBody: (ctx) => ({ success: true, ...ctx.registro }),
};

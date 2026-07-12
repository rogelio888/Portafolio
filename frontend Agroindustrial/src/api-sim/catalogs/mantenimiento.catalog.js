export const OT_CREATE = {
  method: 'POST',
  route: '/api/work-orders',
  entity: 'OrdenTrabajo',
  operationLabel: 'Registrar orden de trabajo',
  controllerCode: `@Post('work-orders')
create(@Body() dto: CreateWorkOrderDto) {
  return this.workOrdersService.create(dto);
}`,
  sqlQuery: (ctx) => `INSERT INTO work_orders (code, machine_code, mechanic_id, task_description, open_hours, status) VALUES ('${ctx.code}', '${ctx.machineCode}', ${ctx.mechanicId}, '${ctx.taskDescription}', ${ctx.openHours}, 'Abierta');`,
  responseBody: (ctx) => ctx,
};

export const OT_UPDATE = {
  method: 'PUT',
  route: '/api/work-orders/{id}',
  entity: 'OrdenTrabajo',
  operationLabel: 'Actualizar orden de trabajo',
  controllerCode: `@Put('work-orders/:id')
update(@Param('id') id: number, @Body() dto: UpdateWorkOrderDto) {
  return this.workOrdersService.update(id, dto);
}`,
  sqlQuery: (ctx) => `UPDATE work_orders SET task_description='${ctx.taskDescription}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const OT_CERRAR = {
  method: 'PATCH',
  route: '/api/work-orders/{id}/close',
  entity: 'OrdenTrabajo',
  operationLabel: 'Cerrar orden de trabajo',
  controllerCode: `// Ejecutado dentro de una transacción TypeORM
@Patch('work-orders/:id/close')
async close(@Param('id') id: number, @Body() dto: CloseWorkOrderDto) {
  const ot = await this.workOrdersService.close(id, dto);
  await this.machinesService.updateHours(ot.machineCode, dto.closeHours);
  return ot;
}`,
  sqlQuery: (ctx) =>
    `UPDATE work_orders SET status='Cerrada', close_hours=${ctx.closeHours}, labor_cost=${ctx.laborCost}, parts_cost=${ctx.partsCost} WHERE id=${ctx.id};
UPDATE machines SET hours = ${ctx.closeHours} WHERE code = '${ctx.machineCode}';`,
  responseBody: (ctx) => ctx,
};

export const OT_DELETE = {
  method: 'DELETE',
  route: '/api/work-orders/{id}',
  entity: 'OrdenTrabajo',
  operationLabel: 'Eliminar orden de trabajo',
  controllerCode: `@Delete('work-orders/:id')
remove(@Param('id') id: number) {
  return this.workOrdersService.remove(id);
}`,
  sqlQuery: (ctx) => `DELETE FROM work_orders WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

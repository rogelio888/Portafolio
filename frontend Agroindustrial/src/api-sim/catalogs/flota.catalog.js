export const MAQUINARIA_CREATE = {
  method: 'POST',
  route: '/api/machines',
  entity: 'Maquinaria',
  operationLabel: 'Registrar maquinaria',
  controllerCode: `@Post('machines')
create(@Body() dto: CreateMachineDto) {
  return this.machinesService.create(dto);
}`,
  sqlQuery: (ctx) => `INSERT INTO machines (code, brand, model, category, vin, hours, status) VALUES ('${ctx.code}', '${ctx.brand}', '${ctx.model}', '${ctx.category}', '${ctx.vin}', ${ctx.hours}, '${ctx.status}');`,
  responseBody: (ctx) => ctx,
};

export const MAQUINARIA_UPDATE = {
  method: 'PUT',
  route: '/api/machines/{id}',
  entity: 'Maquinaria',
  operationLabel: 'Actualizar maquinaria',
  controllerCode: `@Put('machines/:id')
update(@Param('id') id: number, @Body() dto: UpdateMachineDto) {
  return this.machinesService.update(id, dto);
}`,
  sqlQuery: (ctx) => `UPDATE machines SET brand='${ctx.brand}', model='${ctx.model}', status='${ctx.status}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const MAQUINARIA_DELETE = {
  method: 'DELETE',
  route: '/api/machines/{id}',
  entity: 'Maquinaria',
  operationLabel: 'Eliminar maquinaria',
  controllerCode: `@Delete('machines/:id')
remove(@Param('id') id: number) {
  return this.machinesService.remove(id);
}`,
  sqlQuery: (ctx) => `DELETE FROM machines WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const MAQUINARIA_HOROMETRO = {
  method: 'PATCH',
  route: '/api/machines/{code}/hours',
  entity: 'Maquinaria',
  operationLabel: 'Actualizar horómetro',
  controllerCode: `@Patch('machines/:code/hours')
updateHours(@Param('code') code: string, @Body() dto: { hours: number }) {
  return this.machinesService.updateHours(code, dto.hours);
}`,
  sqlQuery: (ctx) => `UPDATE machines SET hours = ${ctx.hours} WHERE code = '${ctx.code}';`,
  responseBody: (ctx) => ctx,
};

export const MECANICO_CREATE = {
  method: 'POST',
  route: '/api/mechanics',
  entity: 'Mecánico',
  operationLabel: 'Registrar mecánico externo',
  controllerCode: `@Post('mechanics')
create(@Body() dto: CreateMechanicDto) {
  return this.mechanicsService.create(dto);
}`,
  sqlQuery: (ctx) => `INSERT INTO mechanics (name, specialty, phone, address, available) VALUES ('${ctx.name}', '${ctx.specialty}', '${ctx.phone}', '${ctx.address}', ${ctx.available});`,
  responseBody: (ctx) => ctx,
};

export const MECANICO_UPDATE = {
  method: 'PUT',
  route: '/api/mechanics/{id}',
  entity: 'Mecánico',
  operationLabel: 'Actualizar mecánico',
  controllerCode: `@Put('mechanics/:id')
update(@Param('id') id: number, @Body() dto: UpdateMechanicDto) {
  return this.mechanicsService.update(id, dto);
}`,
  sqlQuery: (ctx) => `UPDATE mechanics SET name='${ctx.name}', specialty='${ctx.specialty}', available=${ctx.available} WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const MECANICO_DELETE = {
  method: 'DELETE',
  route: '/api/mechanics/{id}',
  entity: 'Mecánico',
  operationLabel: 'Eliminar mecánico',
  controllerCode: `@Delete('mechanics/:id')
remove(@Param('id') id: number) {
  return this.mechanicsService.remove(id);
}`,
  sqlQuery: (ctx) => `DELETE FROM mechanics WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const CLASIFICACION_CREATE = {
  method: 'POST',
  route: '/api/categories',
  entity: 'Clasificación',
  operationLabel: 'Crear clasificación',
  controllerCode: `@Post('categories')
create(@Body() dto: CreateCategoryDto) {
  return this.categoriesService.create(dto);
}`,
  sqlQuery: (ctx) => `INSERT INTO categories (name, prefix, description) VALUES ('${ctx.name}', '${ctx.prefix}', '${ctx.description}');`,
  responseBody: (ctx) => ctx,
};

export const CLASIFICACION_UPDATE = {
  method: 'PUT',
  route: '/api/categories/{id}',
  entity: 'Clasificación',
  operationLabel: 'Actualizar clasificación',
  controllerCode: `@Put('categories/:id')
update(@Param('id') id: number, @Body() dto: UpdateCategoryDto) {
  return this.categoriesService.update(id, dto);
}`,
  sqlQuery: (ctx) => `UPDATE categories SET name='${ctx.name}', prefix='${ctx.prefix}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const CLASIFICACION_DELETE = {
  method: 'DELETE',
  route: '/api/categories/{id}',
  entity: 'Clasificación',
  operationLabel: 'Eliminar clasificación',
  controllerCode: `@Delete('categories/:id')
remove(@Param('id') id: number) {
  return this.categoriesService.remove(id);
}`,
  sqlQuery: (ctx) => `DELETE FROM categories WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const FICHA_CREATE = {
  method: 'POST',
  route: '/api/technical-sheets',
  entity: 'FichaTécnica',
  operationLabel: 'Crear ficha técnica',
  controllerCode: `@Post('technical-sheets')
create(@Body() dto: CreateTechnicalSheetDto) {
  return this.sheetsService.create(dto);
}`,
  sqlQuery: (ctx) => `INSERT INTO technical_sheets (brand, model, category, year, power_hp) VALUES ('${ctx.brand}', '${ctx.model}', '${ctx.category}', ${ctx.year}, ${ctx.powerHp});
INSERT INTO maintenance_intervals (sheet_id, task_name, hours) VALUES ... (${ctx.intervals?.length ?? 0} intervalos);`,
  responseBody: (ctx) => ctx,
};

export const FICHA_UPDATE = {
  method: 'PUT',
  route: '/api/technical-sheets/{id}',
  entity: 'FichaTécnica',
  operationLabel: 'Actualizar ficha técnica',
  controllerCode: `@Put('technical-sheets/:id')
update(@Param('id') id: number, @Body() dto: UpdateTechnicalSheetDto) {
  return this.sheetsService.update(id, dto);
}`,
  sqlQuery: (ctx) => `UPDATE technical_sheets SET brand='${ctx.brand}', model='${ctx.model}', power_hp=${ctx.powerHp} WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const FICHA_DELETE = {
  method: 'DELETE',
  route: '/api/technical-sheets/{id}',
  entity: 'FichaTécnica',
  operationLabel: 'Eliminar ficha técnica',
  controllerCode: `@Delete('technical-sheets/:id')
remove(@Param('id') id: number) {
  return this.sheetsService.remove(id);
}`,
  sqlQuery: (ctx) => `DELETE FROM technical_sheets WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

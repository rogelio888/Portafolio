export const INSCRIPCION_CREATE = {
  method: 'POST',
  route: '/rest/v1/inscripciones',
  entity: 'Inscripción',
  operationLabel: 'Registrar inscripción y cobro',
  controllerCode: `// Ejecutado dentro de una transacción (Postgres function via RPC)
const { data } = await supabase.rpc('registrar_inscripcion', {
  cliente_id: clienteId, plan_id: planId, metodo_pago_id: metodoPagoId
});
// La función actualiza clientes.plan_id / fecha_vencimiento y crea el registro de pago`,
  sqlQuery: (ctx) =>
    `INSERT INTO inscripciones (cliente_id, plan_id, metodo_pago_id, fecha, fecha_inicio, fecha_fin, monto) VALUES (${ctx.clienteId}, ${ctx.planId}, ${ctx.metodoPagoId}, '${ctx.fecha}', '${ctx.fechaInicio}', '${ctx.fechaFin}', ${ctx.monto});
UPDATE clientes SET plan_id = ${ctx.planId}, fecha_vencimiento = '${ctx.fechaFin}' WHERE id = ${ctx.clienteId};`,
  responseBody: (ctx) => ctx,
};

export const ASISTENCIA_CREATE = {
  method: 'POST',
  route: '/rest/v1/asistencias',
  entity: 'Asistencia',
  operationLabel: 'Registrar check-in',
  controllerCode: `const { data } = await supabase
  .from('asistencias')
  .insert({ cliente_id: clienteId, fecha, hora })
  .select()
  .single();`,
  sqlQuery: (ctx) => `INSERT INTO asistencias (cliente_id, fecha, hora) VALUES (${ctx.clienteId}, '${ctx.fecha}', '${ctx.hora}');`,
  responseBody: (ctx) => ctx,
};

export const ASISTENCIA_DENEGADA = {
  method: 'POST',
  route: '/rest/v1/asistencias',
  entity: 'Asistencia',
  operationLabel: 'Check-in denegado (membresía vencida)',
  controllerCode: `// Row Level Security bloquea el insert si el cliente no tiene membresía activa
const { error } = await supabase.from('asistencias').insert({ cliente_id: clienteId });
// error.code === '42501' (RLS policy violation)`,
  sqlQuery: (ctx) => `-- Política RLS "solo_clientes_activos" rechaza el INSERT para cliente_id = ${ctx.clienteId} (status != 'Activo')`,
  responseBody: () => ({ error: 'RLS_VIOLATION', message: 'Membresía vencida.' }),
};

export const METODO_PAGO_CREATE = {
  method: 'POST',
  route: '/rest/v1/metodos_pago',
  entity: 'MétodoPago',
  operationLabel: 'Crear método de pago',
  controllerCode: `await supabase.from('metodos_pago').insert({ name, type, active: true });`,
  sqlQuery: (ctx) => `INSERT INTO metodos_pago (name, type, active) VALUES ('${ctx.name}', '${ctx.type}', true);`,
  responseBody: (ctx) => ctx,
};

export const METODO_PAGO_UPDATE = {
  method: 'PATCH',
  route: '/rest/v1/metodos_pago?id=eq.{id}',
  entity: 'MétodoPago',
  operationLabel: 'Actualizar método de pago',
  controllerCode: `await supabase.from('metodos_pago').update({ name, type }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE metodos_pago SET name='${ctx.name}', type='${ctx.type}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const METODO_PAGO_TOGGLE = {
  method: 'PATCH',
  route: '/rest/v1/metodos_pago?id=eq.{id}',
  entity: 'MétodoPago',
  operationLabel: 'Activar/desactivar método de pago',
  controllerCode: `await supabase.from('metodos_pago').update({ active }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE metodos_pago SET active = ${ctx.active} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const METODO_PAGO_DELETE = {
  method: 'DELETE',
  route: '/rest/v1/metodos_pago?id=eq.{id}',
  entity: 'MétodoPago',
  operationLabel: 'Eliminar método de pago',
  controllerCode: `await supabase.from('metodos_pago').delete().eq('id', id);`,
  sqlQuery: (ctx) => `DELETE FROM metodos_pago WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

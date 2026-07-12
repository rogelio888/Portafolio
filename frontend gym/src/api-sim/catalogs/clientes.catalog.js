export const CLIENTE_CREATE = {
  method: 'POST',
  route: '/rest/v1/clientes',
  entity: 'Cliente',
  operationLabel: 'Registrar cliente',
  controllerCode: `const { data } = await supabase
  .from('clientes')
  .insert({ code, name, phone, email, address })
  .select()
  .single();`,
  sqlQuery: (ctx) => `INSERT INTO clientes (code, name, phone, email, address) VALUES ('${ctx.code}', '${ctx.name}', '${ctx.phone}', '${ctx.email}', '${ctx.address}');`,
  responseBody: (ctx) => ctx,
};

export const CLIENTE_UPDATE = {
  method: 'PATCH',
  route: '/rest/v1/clientes?id=eq.{id}',
  entity: 'Cliente',
  operationLabel: 'Actualizar cliente',
  controllerCode: `await supabase.from('clientes').update({ name, phone, email, address }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE clientes SET name='${ctx.name}', phone='${ctx.phone}', email='${ctx.email}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const CLIENTE_DELETE = {
  method: 'DELETE',
  route: '/rest/v1/clientes?id=eq.{id}',
  entity: 'Cliente',
  operationLabel: 'Eliminar cliente',
  controllerCode: `await supabase.from('clientes').delete().eq('id', id);`,
  sqlQuery: (ctx) => `DELETE FROM clientes WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const PLAN_CREATE = {
  method: 'POST',
  route: '/rest/v1/planes',
  entity: 'Plan',
  operationLabel: 'Crear plan de membresía',
  controllerCode: `const { data } = await supabase
  .from('planes')
  .insert({ name, price, days, features })
  .select()
  .single();`,
  sqlQuery: (ctx) => `INSERT INTO planes (name, price, days, features) VALUES ('${ctx.name}', ${ctx.price}, ${ctx.days}, ARRAY[${(ctx.features || []).map((f) => `'${f}'`).join(', ')}]);`,
  responseBody: (ctx) => ctx,
};

export const PLAN_UPDATE = {
  method: 'PATCH',
  route: '/rest/v1/planes?id=eq.{id}',
  entity: 'Plan',
  operationLabel: 'Actualizar plan de membresía',
  controllerCode: `await supabase.from('planes').update({ name, price, days, features }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE planes SET name='${ctx.name}', price=${ctx.price}, days=${ctx.days} WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const PLAN_TOGGLE = {
  method: 'PATCH',
  route: '/rest/v1/planes?id=eq.{id}',
  entity: 'Plan',
  operationLabel: 'Activar/desactivar plan',
  controllerCode: `await supabase.from('planes').update({ is_active: isActive }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE planes SET is_active = ${ctx.isActive} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

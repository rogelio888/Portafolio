export const AUTH_LOGIN = {
  method: 'POST',
  route: '/auth/v1/token?grant_type=password',
  entity: 'Auth',
  operationLabel: 'Iniciar sesión',
  controllerCode: `// supabase-js
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});
if (error) throw error;
const { data: profile } = await supabase
  .from('usuarios')
  .select('*, roles(*)')
  .eq('id', data.user.id)
  .single();`,
  sqlQuery: (ctx) =>
    `SELECT * FROM usuarios WHERE email = '${ctx.user.email}' AND status = 'Activo' LIMIT 1;
-- auth.users: verifica password (bcrypt) vía GoTrue`,
  responseBody: (ctx) => ({ access_token: ctx.token, user: ctx.user }),
};

export const AUTH_LOGIN_FAILED = {
  method: 'POST',
  route: '/auth/v1/token?grant_type=password',
  entity: 'Auth',
  operationLabel: 'Intento de inicio de sesión fallido',
  controllerCode: `const { error } = await supabase.auth.signInWithPassword({ email, password });
// error.message === 'Invalid login credentials'`,
  sqlQuery: (ctx) => `SELECT * FROM usuarios WHERE email = '${ctx.email}' LIMIT 1; -- 0 filas coinciden con la contraseña`,
  responseBody: () => ({ error: 'invalid_grant', message: 'Credenciales inválidas.' }),
};

export const AUTH_LOGOUT = {
  method: 'POST',
  route: '/auth/v1/logout',
  entity: 'Auth',
  operationLabel: 'Cerrar sesión',
  controllerCode: `await supabase.auth.signOut();`,
  sqlQuery: () => `-- invalida el refresh_token activo en auth.sessions`,
  responseBody: () => ({ message: 'Sesión cerrada.' }),
};

export const USUARIO_CREATE = {
  method: 'POST',
  route: '/rest/v1/usuarios',
  entity: 'Usuario',
  operationLabel: 'Crear usuario del sistema',
  controllerCode: `const { data, error } = await supabase
  .from('usuarios')
  .insert({ name, email, role_id: roleId, status: 'Activo' })
  .select()
  .single();`,
  sqlQuery: (ctx) => `INSERT INTO usuarios (name, email, role_id, status) VALUES ('${ctx.name}', '${ctx.email}', ${ctx.roleId}, 'Activo');`,
  responseBody: (ctx) => ctx,
};

export const USUARIO_UPDATE = {
  method: 'PATCH',
  route: '/rest/v1/usuarios?id=eq.{id}',
  entity: 'Usuario',
  operationLabel: 'Actualizar usuario',
  controllerCode: `const { data } = await supabase
  .from('usuarios')
  .update({ name, email, role_id: roleId })
  .eq('id', id)
  .select()
  .single();`,
  sqlQuery: (ctx) => `UPDATE usuarios SET name='${ctx.name}', email='${ctx.email}', role_id=${ctx.roleId} WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const USUARIO_TOGGLE = {
  method: 'PATCH',
  route: '/rest/v1/usuarios?id=eq.{id}',
  entity: 'Usuario',
  operationLabel: 'Cambiar estado de usuario',
  controllerCode: `await supabase.from('usuarios').update({ status }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE usuarios SET status = '${ctx.status}' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const ROL_CREATE = {
  method: 'POST',
  route: '/rest/v1/roles',
  entity: 'Rol',
  operationLabel: 'Crear rol',
  controllerCode: `const { data } = await supabase
  .from('roles')
  .insert({ name, description, permissions })
  .select()
  .single();`,
  sqlQuery: (ctx) => `INSERT INTO roles (name, description, permissions) VALUES ('${ctx.name}', '${ctx.description}', '${JSON.stringify(ctx.permissions)}'::jsonb);`,
  responseBody: (ctx) => ctx,
};

export const ROL_UPDATE = {
  method: 'PATCH',
  route: '/rest/v1/roles?id=eq.{id}',
  entity: 'Rol',
  operationLabel: 'Actualizar rol',
  controllerCode: `await supabase.from('roles').update({ name, description }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE roles SET name='${ctx.name}', description='${ctx.description}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const ROL_DELETE = {
  method: 'DELETE',
  route: '/rest/v1/roles?id=eq.{id}',
  entity: 'Rol',
  operationLabel: 'Eliminar rol',
  controllerCode: `await supabase.from('roles').delete().eq('id', id);`,
  sqlQuery: (ctx) => `DELETE FROM roles WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const ROL_PERMISOS_UPDATE = {
  method: 'PATCH',
  route: '/rest/v1/roles?id=eq.{id}',
  entity: 'Rol',
  operationLabel: 'Actualizar permisos del rol',
  controllerCode: `await supabase.from('roles').update({ permissions }).eq('id', id);`,
  sqlQuery: (ctx) => `UPDATE roles SET permissions = '${JSON.stringify(ctx.permissions)}'::jsonb WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

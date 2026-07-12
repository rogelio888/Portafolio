export const AUTH_LOGIN = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Iniciar sesión',
  controllerCode: `// auth.controller.ts (NestJS)
@Post('login')
async login(@Body() dto: LoginDto) {
  const user = await this.authService.validateUser(dto.email, dto.password);
  if (!user) throw new UnauthorizedException('Credenciales inválidas');
  return this.authService.issueToken(user);
}`,
  sqlQuery: (ctx) => `SELECT * FROM users WHERE email = '${ctx.user.email}' AND active = true LIMIT 1;`,
  responseBody: (ctx) => ({ token: ctx.token, user: ctx.user }),
};

export const AUTH_LOGIN_FAILED = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Intento de inicio de sesión fallido',
  controllerCode: `const user = await this.authService.validateUser(dto.email, dto.password);
// user === null -> UnauthorizedException`,
  sqlQuery: (ctx) => `SELECT * FROM users WHERE email = '${ctx.email}' LIMIT 1; -- 0 filas coinciden con la contraseña`,
  responseBody: () => ({ statusCode: 401, message: 'Credenciales inválidas.' }),
};

export const AUTH_LOGOUT = {
  method: 'POST',
  route: '/api/logout',
  entity: 'Auth',
  operationLabel: 'Cerrar sesión',
  controllerCode: `@Post('logout')
async logout(@Req() req) {
  await this.authService.revokeToken(req.user.tokenId);
}`,
  sqlQuery: () => `DELETE FROM personal_access_tokens WHERE id = :tokenId;`,
  responseBody: () => ({ message: 'Sesión cerrada.' }),
};

export const AUTH_ME = {
  method: 'GET',
  route: '/api/user',
  entity: 'Auth',
  operationLabel: 'Refrescar perfil de sesión',
  controllerCode: `@Get('user')
async me(@Req() req) {
  return this.usersService.findOne(req.user.id, { relations: ['role'] });
}`,
  sqlQuery: (ctx) => `SELECT * FROM users WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const ROL_CREATE = {
  method: 'POST',
  route: '/api/roles',
  entity: 'Rol',
  operationLabel: 'Crear rol',
  controllerCode: `@Post('roles')
create(@Body() dto: CreateRoleDto) {
  return this.rolesService.create(dto);
}`,
  sqlQuery: (ctx) => `INSERT INTO roles (name, description, permissions) VALUES ('${ctx.name}', '${ctx.description}', '${JSON.stringify(ctx.permissions)}'::jsonb);`,
  responseBody: (ctx) => ctx,
};

export const ROL_UPDATE = {
  method: 'PUT',
  route: '/api/roles/{id}',
  entity: 'Rol',
  operationLabel: 'Actualizar rol y permisos',
  controllerCode: `@Put('roles/:id')
update(@Param('id') id: number, @Body() dto: UpdateRoleDto) {
  return this.rolesService.update(id, dto);
}`,
  sqlQuery: (ctx) => `UPDATE roles SET name='${ctx.name}', description='${ctx.description}', permissions='${JSON.stringify(ctx.permissions)}'::jsonb WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const ROL_DELETE = {
  method: 'DELETE',
  route: '/api/roles/{id}',
  entity: 'Rol',
  operationLabel: 'Eliminar rol',
  controllerCode: `@Delete('roles/:id')
remove(@Param('id') id: number) {
  return this.rolesService.remove(id);
}`,
  sqlQuery: (ctx) => `DELETE FROM roles WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const USUARIO_CREATE = {
  method: 'POST',
  route: '/api/users',
  entity: 'Usuario',
  operationLabel: 'Crear usuario',
  controllerCode: `@Post('users')
create(@Body() dto: CreateUserDto) {
  return this.usersService.create({ ...dto, password: bcrypt.hashSync(dto.password) });
}`,
  sqlQuery: (ctx) => `INSERT INTO users (name, email, role, active) VALUES ('${ctx.name}', '${ctx.email}', '${ctx.role}', true);`,
  responseBody: (ctx) => ctx,
};

export const USUARIO_UPDATE = {
  method: 'PUT',
  route: '/api/users/{id}',
  entity: 'Usuario',
  operationLabel: 'Actualizar usuario',
  controllerCode: `@Put('users/:id')
update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
  return this.usersService.update(id, dto);
}`,
  sqlQuery: (ctx) => `UPDATE users SET name='${ctx.name}', email='${ctx.email}', role='${ctx.role}' WHERE id=${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const USUARIO_TOGGLE = {
  method: 'PATCH',
  route: '/api/users/{id}/toggle',
  entity: 'Usuario',
  operationLabel: 'Activar/inhabilitar usuario',
  controllerCode: `@Patch('users/:id/toggle')
toggle(@Param('id') id: number) {
  return this.usersService.toggleActive(id);
}`,
  sqlQuery: (ctx) => `UPDATE users SET active = ${ctx.active} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ active: ctx.active }),
};

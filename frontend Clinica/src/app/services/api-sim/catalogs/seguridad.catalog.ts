import { ApiSimTemplate } from '../templates';

export const AUTH_LOGIN: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Iniciar sesión',
  controllerCode: `// auth.controller.ts (NestJS)
@Post('login')
async login(@Body() dto: LoginDto) {
  const usuario = await this.prisma.usuario.findUnique({
    where: { correo: dto.correo },
    include: { rol: true },
  });
  if (!usuario || !(await bcrypt.compare(dto.clave, usuario.claveHash)) || usuario.estado !== 'Activo') {
    throw new UnauthorizedException('Credenciales incorrectas.');
  }
  const token = this.jwt.sign({ sub: usuario.id, rolId: usuario.rolId });
  return { success: true, token, usuario: this.toSession(usuario) };
}`,
  sqlQuery: (ctx) =>
    `SELECT u.*, r.nombre AS rol_nombre, r.permisos FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.correo = '${ctx.correo}';
INSERT INTO tokens (usuario_id, token) VALUES (${ctx.userId ?? '?'}, '${ctx.token ?? '...'}...');`,
  responseBody: (ctx) => ({ success: true, token: ctx.token, usuario: ctx.usuario }),
};

export const AUTH_LOGIN_FAILED: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Intento de inicio de sesión fallido',
  controllerCode: `// auth.controller.ts (NestJS)
@Post('login')
async login(@Body() dto: LoginDto) {
  const usuario = await this.prisma.usuario.findUnique({ where: { correo: dto.correo } });
  if (!usuario || !(await bcrypt.compare(dto.clave, usuario.claveHash))) {
    throw new UnauthorizedException('Credenciales incorrectas.');
  }
  // ...
}`,
  sqlQuery: (ctx) => `SELECT * FROM usuarios WHERE correo = '${ctx.correo}'; -- clave no coincide o usuario suspendido`,
  responseBody: () => ({ success: false, error: 'Credenciales incorrectas.' }),
};

export const AUTH_LOGOUT: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/logout',
  entity: 'Auth',
  operationLabel: 'Cerrar sesión',
  controllerCode: `// auth.controller.ts (NestJS)
@Post('logout')
@UseGuards(JwtAuthGuard)
async logout(@Req() req) {
  await this.prisma.token.deleteMany({ where: { usuarioId: req.user.sub } });
  return { success: true };
}`,
  sqlQuery: (ctx) => `DELETE FROM tokens WHERE usuario_id = (SELECT id FROM usuarios WHERE nombre = '${ctx.nombreUsuario ?? ''}');`,
  responseBody: () => ({ success: true }),
};

export const ROL_LIST: ApiSimTemplate<any> = {
  method: 'GET',
  route: '/api/roles',
  entity: 'Rol',
  operationLabel: 'Listar roles',
  controllerCode: `// roles.controller.ts (NestJS)
@Get()
@UseGuards(JwtAuthGuard)
findAll() {
  return this.prisma.rol.findMany({ orderBy: { id: 'asc' } });
}`,
  sqlQuery: () => `SELECT * FROM roles ORDER BY id ASC;`,
  responseBody: (ctx) => ctx.roles,
};

export const ROL_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/roles',
  entity: 'Rol',
  operationLabel: 'Crear rol',
  controllerCode: `// roles.controller.ts (NestJS)
@Post()
create(@Body() dto: CreateRolDto) {
  return this.prisma.rol.create({ data: { nombre: dto.nombre, permisos: [] } });
}`,
  sqlQuery: (ctx) => `INSERT INTO roles (nombre, permisos) VALUES ('${ctx.nombre}', '[]');`,
  responseBody: (ctx) => ({ success: true, ...ctx.rol }),
};

export const ROL_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/roles/{id}',
  entity: 'Rol',
  operationLabel: 'Renombrar rol',
  controllerCode: `// roles.controller.ts (NestJS)
@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdateRolDto) {
  return this.prisma.rol.update({ where: { id: Number(id) }, data: { nombre: dto.nombre } });
}`,
  sqlQuery: (ctx) => `UPDATE roles SET nombre = '${ctx.nombre}' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const ROL_PERMISOS: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/roles/{id}/permisos',
  entity: 'Rol',
  operationLabel: 'Actualizar permisos de rol',
  controllerCode: `// roles.controller.ts (NestJS)
@Put(':id/permisos')
updatePermisos(@Param('id') id: string, @Body() dto: UpdatePermisosDto) {
  return this.prisma.rol.update({ where: { id: Number(id) }, data: { permisos: dto.permisos } });
}`,
  sqlQuery: (ctx) => `UPDATE roles SET permisos = '${JSON.stringify(ctx.permisos)}' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const ROL_DELETE: ApiSimTemplate<any> = {
  method: 'DELETE',
  route: '/api/roles/{id}',
  entity: 'Rol',
  operationLabel: 'Eliminar rol',
  controllerCode: `// roles.controller.ts (NestJS)
@Delete(':id')
remove(@Param('id') id: string) {
  return this.prisma.rol.delete({ where: { id: Number(id) } });
}`,
  sqlQuery: (ctx) => `DELETE FROM roles WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const USUARIO_LIST: ApiSimTemplate<any> = {
  method: 'GET',
  route: '/api/users',
  entity: 'Usuario',
  operationLabel: 'Listar usuarios',
  controllerCode: `// users.controller.ts (NestJS)
@Get()
@UseGuards(JwtAuthGuard)
findAll() {
  return this.prisma.usuario.findMany({ include: { rol: true } });
}`,
  sqlQuery: () => `SELECT u.*, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON r.id = u.rol_id;`,
  responseBody: (ctx) => ctx.usuarios,
};

export const USUARIO_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/users',
  entity: 'Usuario',
  operationLabel: 'Crear usuario',
  controllerCode: `// users.controller.ts (NestJS)
@Post()
async create(@Body() dto: CreateUserDto) {
  const claveHash = await bcrypt.hash(dto.clave, 10);
  const usuario = await this.prisma.usuario.create({ data: { ...dto, claveHash } });
  return { success: true, ...usuario };
}`,
  sqlQuery: (ctx) => `INSERT INTO usuarios (nombre, correo, clave_hash, rol_id, estado) VALUES ('${ctx.nombre}', '${ctx.correo}', '<hashed>', ${ctx.rolId}, 'Activo');`,
  responseBody: (ctx) => ({ success: true, ...ctx.usuario }),
};

export const USUARIO_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/users/{id}',
  entity: 'Usuario',
  operationLabel: 'Actualizar usuario',
  controllerCode: `// users.controller.ts (NestJS)
@Put(':id')
update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
  return this.prisma.usuario.update({ where: { id: Number(id) }, data: dto });
}`,
  sqlQuery: (ctx) => `UPDATE usuarios SET ${Object.keys(ctx.datos ?? {}).map((k) => `${k} = ?`).join(', ')} WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const USUARIO_ESTADO: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/users/{id}/estado',
  entity: 'Usuario',
  operationLabel: 'Cambiar estado de usuario',
  controllerCode: `// users.controller.ts (NestJS)
@Put(':id/estado')
cambiarEstado(@Param('id') id: string, @Body() dto: { estado: string }) {
  return this.prisma.usuario.update({ where: { id: Number(id) }, data: { estado: dto.estado } });
}`,
  sqlQuery: (ctx) => `UPDATE usuarios SET estado = '${ctx.estado}' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const BITACORA_LIST: ApiSimTemplate<any> = {
  method: 'GET',
  route: '/api/bitacora',
  entity: 'Bitácora',
  operationLabel: 'Listar registros de auditoría',
  controllerCode: `// bitacora.controller.ts (NestJS)
@Get()
@UseGuards(JwtAuthGuard)
findAll() {
  return this.prisma.registroBitacora.findMany({ orderBy: { fechaHora: 'desc' } });
}`,
  sqlQuery: () => `SELECT * FROM registros_bitacora ORDER BY fecha_hora DESC;`,
  responseBody: (ctx) => ctx.logs,
};

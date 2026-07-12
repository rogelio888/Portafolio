export const AUTH_LOGIN = {
  method: 'POST', route: '/api/auth/login', entity: 'Auth', operationLabel: 'Iniciar sesión',
  controllerCode: `// AuthController.php
public function login(Request $request) {
    $empleado = Empleado::where('usuario', $request->usuario)->first();
    if (!$empleado || !Hash::check($request->password, $empleado->password)) {
        return response()->json(['success' => false, 'message' => 'Credenciales incorrectas'], 401);
    }
    if ($empleado->estado !== 'ACTIVO') {
        return response()->json(['success' => false, 'message' => 'Usuario inactivo, contacte al administrador'], 403);
    }
    $token = $empleado->createToken('hotel-token')->plainTextToken;
    return response()->json(['success' => true, 'data' => ['empleado' => $empleado->load(['rol.permisos', 'hotel']), 'token' => $token]]);
}`,
  sqlQuery: (ctx) => `SELECT * FROM empleados WHERE usuario = '${ctx.usuario}' LIMIT 1;
SELECT * FROM roles WHERE id = ?; SELECT * FROM permisos WHERE id IN (SELECT id_permiso FROM rol_permiso WHERE id_rol = ?);
INSERT INTO personal_access_tokens (tokenable_id, name, token) VALUES (${ctx.empleadoId}, 'hotel-token', '${ctx.token}...');`,
  responseBody: (ctx) => ({ success: true, data: { empleado: ctx.empleado, token: ctx.token } }),
};

export const AUTH_LOGIN_FAILED = {
  method: 'POST', route: '/api/auth/login', entity: 'Auth', operationLabel: 'Intento de inicio de sesión fallido',
  controllerCode: `// AuthController.php\nif (!$empleado || !Hash::check($request->password, $empleado->password)) {\n    return response()->json(['success' => false, 'message' => 'Credenciales incorrectas'], 401);\n}`,
  sqlQuery: (ctx) => `SELECT * FROM empleados WHERE usuario = '${ctx.usuario}' LIMIT 1; -- contraseña no coincide o usuario inactivo`,
  responseBody: (ctx) => ({ success: false, message: ctx.message }),
};

export const AUTH_LOGOUT = {
  method: 'POST', route: '/api/auth/logout', entity: 'Auth', operationLabel: 'Cerrar sesión',
  controllerCode: `// AuthController.php\npublic function logout(Request $request) {\n    $request->user()->currentAccessToken()->delete();\n    return response()->json(['success' => true, 'message' => 'Sesión cerrada']);\n}`,
  sqlQuery: () => `DELETE FROM personal_access_tokens WHERE id = ?;`,
  responseBody: () => ({ success: true, message: 'Sesión cerrada' }),
};

export const AUTH_ME = {
  method: 'GET', route: '/api/auth/me', entity: 'Auth', operationLabel: 'Obtener usuario autenticado',
  controllerCode: `// AuthController.php\npublic function me(Request $request) {\n    return response()->json(['success' => true, 'data' => $request->user()->load(['rol.permisos', 'hotel'])]);\n}`,
  sqlQuery: (ctx) => `SELECT * FROM empleados WHERE id = ${ctx.empleadoId};`,
  responseBody: (ctx) => ({ success: true, data: ctx.empleado }),
};

export const AUTH_CAMBIAR_PASSWORD = {
  method: 'POST', route: '/api/auth/cambiar-password', entity: 'Auth', operationLabel: 'Cambiar contraseña',
  controllerCode: `// AuthController.php
public function cambiarPassword(Request $request) {
    if (!Hash::check($request->password_actual, $request->user()->password)) {
        return response()->json(['success' => false, 'message' => 'La contraseña actual no coincide'], 422);
    }
    $request->user()->update(['password' => $request->password_nuevo]);
    return response()->json(['success' => true, 'message' => 'Contraseña actualizada']);
}`,
  sqlQuery: (ctx) => `UPDATE empleados SET password = '<hashed>' WHERE id = ${ctx.empleadoId};`,
  responseBody: () => ({ success: true, message: 'Contraseña actualizada' }),
};

export const EMPLEADO_LIST = {
  method: 'GET', route: '/api/empleados', entity: 'Empleado', operationLabel: 'Listar empleados',
  controllerCode: `// EmpleadoController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => Empleado::with(['rol', 'hotel'])->porHotel($request->id_hotel)->get()]);\n}`,
  sqlQuery: () => `SELECT e.*, r.nombre AS rol_nombre, h.nombre AS hotel_nombre FROM empleados e JOIN roles r ON r.id = e.id_rol LEFT JOIN hoteles h ON h.id = e.id_hotel;`,
  responseBody: (ctx) => ({ success: true, data: ctx.empleados }),
};

export const EMPLEADO_CREATE = {
  method: 'POST', route: '/api/empleados', entity: 'Empleado', operationLabel: 'Crear empleado',
  controllerCode: `// EmpleadoController.php\npublic function store(Request $request) {\n    $data = $request->validate([...]);\n    $data['password'] = Hash::make($data['password']);\n    $empleado = Empleado::create($data);\n    return response()->json(['success' => true, 'data' => $empleado], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO empleados (id_rol, id_hotel, nombre, apellido, usuario, password, estado) VALUES (${ctx.id_rol}, ${ctx.id_hotel ?? 'NULL'}, '${ctx.nombre}', '${ctx.apellido}', '${ctx.usuario}', '<hashed>', 'ACTIVO');`,
  responseBody: (ctx) => ({ success: true, data: ctx.empleado }),
};

export const EMPLEADO_UPDATE = {
  method: 'PUT', route: '/api/empleados/{id}', entity: 'Empleado', operationLabel: 'Actualizar empleado',
  controllerCode: `// EmpleadoController.php\npublic function update(Request $request, Empleado $empleado) {\n    $empleado->update($request->validated());\n    return response()->json(['success' => true, 'data' => $empleado]);\n}`,
  sqlQuery: (ctx) => `UPDATE empleados SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.empleado }),
};

export const EMPLEADO_DELETE = {
  method: 'DELETE', route: '/api/empleados/{id}', entity: 'Empleado', operationLabel: 'Dar de baja empleado',
  controllerCode: `// EmpleadoController.php\npublic function destroy(Empleado $empleado) {\n    $empleado->update(['estado' => 'INACTIVO']);\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `UPDATE empleados SET estado = 'INACTIVO' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const EMPLEADO_PERMISOS = {
  method: 'GET', route: '/api/empleados/{id}/permisos', entity: 'Empleado', operationLabel: 'Consultar permisos efectivos',
  controllerCode: `// EmpleadoController.php\npublic function permisos(Empleado $empleado) {\n    return response()->json(['success' => true, 'data' => ['empleado' => $empleado->nombreCompleto(), 'rol' => $empleado->rol->nombre ?? 'Sin Rol', 'permisos' => $empleado->rol->permisos ?? []]]);\n}`,
  sqlQuery: (ctx) => `SELECT p.* FROM permisos p JOIN rol_permiso rp ON rp.id_permiso = p.id WHERE rp.id_rol = (SELECT id_rol FROM empleados WHERE id = ${ctx.id});`,
  responseBody: (ctx) => ({ success: true, data: ctx.data }),
};

export const ROL_LIST = {
  method: 'GET', route: '/api/roles', entity: 'Rol', operationLabel: 'Listar roles',
  controllerCode: `// RolController.php\npublic function index() {\n    return response()->json(['success' => true, 'data' => Rol::with('permisos')->get()]);\n}`,
  sqlQuery: () => `SELECT * FROM roles; SELECT * FROM permisos p JOIN rol_permiso rp ON rp.id_permiso = p.id;`,
  responseBody: (ctx) => ({ success: true, data: ctx.roles }),
};

export const ROL_CREATE = {
  method: 'POST', route: '/api/roles', entity: 'Rol', operationLabel: 'Crear rol',
  controllerCode: `// RolController.php\npublic function store(Request $request) {\n    $rol = Rol::create($request->validate(['nombre' => 'required|unique:roles', 'descripcion' => 'nullable']));\n    return response()->json(['success' => true, 'data' => $rol], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO roles (nombre, descripcion) VALUES ('${ctx.nombre}', '${ctx.descripcion ?? ''}');`,
  responseBody: (ctx) => ({ success: true, data: ctx.rol }),
};

export const ROL_UPDATE = {
  method: 'PUT', route: '/api/roles/{id}', entity: 'Rol', operationLabel: 'Actualizar rol',
  controllerCode: `// RolController.php\npublic function update(Request $request, Rol $rol) {\n    $rol->update($request->validated());\n    return response()->json(['success' => true, 'data' => $rol]);\n}`,
  sqlQuery: (ctx) => `UPDATE roles SET nombre = '${ctx.nombre}' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.rol }),
};

export const ROL_DELETE = {
  method: 'DELETE', route: '/api/roles/{id}', entity: 'Rol', operationLabel: 'Eliminar rol',
  controllerCode: `// RolController.php\npublic function destroy(Rol $rol) {\n    if ($rol->empleados()->count() > 0) {\n        return response()->json(['success' => false, 'message' => 'El rol tiene empleados asignados'], 422);\n    }\n    $rol->delete();\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `SELECT COUNT(*) FROM empleados WHERE id_rol = ${ctx.id}; -- si 0: DELETE FROM roles WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const ROL_ASIGNAR_PERMISOS = {
  method: 'POST', route: '/api/roles/{id}/asignar-permisos', entity: 'Rol', operationLabel: 'Asignar permisos a rol',
  controllerCode: `// RolController.php\npublic function asignarPermisos(Request $request, Rol $rol) {\n    $rol->permisos()->sync($request->permisos);\n    return response()->json(['success' => true, 'data' => $rol->load('permisos')]);\n}`,
  sqlQuery: (ctx) => `DELETE FROM rol_permiso WHERE id_rol = ${ctx.id};\nINSERT INTO rol_permiso (id_rol, id_permiso) VALUES ${(ctx.permisos || []).map((p) => `(${ctx.id}, ${p})`).join(', ') || '(...)'};`,
  responseBody: (ctx) => ({ success: true, data: ctx.rol }),
};

export const PERMISO_LIST = {
  method: 'GET', route: '/api/permisos', entity: 'Permiso', operationLabel: 'Listar permisos disponibles',
  controllerCode: `// PermisoController.php\npublic function index() {\n    return response()->json(['success' => true, 'data' => Permiso::all()]);\n}`,
  sqlQuery: () => `SELECT * FROM permisos ORDER BY nombre ASC;`,
  responseBody: (ctx) => ({ success: true, data: ctx.permisos }),
};

export const AUDITORIA_LIST = {
  method: 'GET', route: '/api/auditoria', entity: 'Auditoría', operationLabel: 'Listar registros de auditoría',
  controllerCode: `// AuditoriaController.php
public function index(Request $request) {
    return Auditoria::with('empleado')
        ->when($request->user_id, fn($q, $v) => $q->where('user_id', $v))
        ->when($request->accion, fn($q, $v) => $q->where('accion', $v))
        ->when($request->modelo, fn($q, $v) => $q->where('modelo', 'like', "%{$v}%"))
        ->when($request->fecha_inicio, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
        ->when($request->fecha_fin, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
        ->latest()->paginate(20);
}`,
  sqlQuery: (ctx) => `SELECT * FROM auditoria WHERE 1=1
  ${ctx.userId ? `AND user_id = ${ctx.userId}` : ''} ${ctx.accion ? `AND accion = '${ctx.accion}'` : ''}
  ORDER BY created_at DESC LIMIT 20 OFFSET ${(ctx.page - 1) * 20};`,
  responseBody: (ctx) => ctx.page_response,
};

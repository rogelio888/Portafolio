import type { ApiSimTemplate } from '../templates';

export const AUTH_LOGIN: ApiSimTemplate = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Iniciar sesión',
  controllerCode: `// AuthController.php
public function login(LoginRequest $request)
{
    $credentials = $request->validated();
    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Credenciales incorrectas.'], 401);
    }
    $user = Auth::user()->load('rol');
    $token = $user->createToken('pensiones-token')->plainTextToken;
    return response()->json(['access_token' => $token, 'user' => [
        'id' => $user->id, 'name' => $user->name,
        'roles' => [$user->rol->nombre],
        'permissions' => $user->rol->permisos,
    ]]);
}`,
  sqlQuery: (ctx) => `SELECT u.*, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.correo = '${ctx.correo}' LIMIT 1;
INSERT INTO personal_access_tokens (tokenable_id, name, token) VALUES (${ctx.userId}, 'pensiones-token', '${ctx.token}...');`,
  responseBody: (ctx) => ({ access_token: ctx.token, user: ctx.user }),
};

export const AUTH_LOGIN_FAILED: ApiSimTemplate = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Intento de inicio de sesión fallido',
  controllerCode: `// AuthController.php
public function login(LoginRequest $request)
{
    if (!Auth::attempt($request->validated())) {
        return response()->json(['message' => 'Credenciales incorrectas.'], 401);
    }
    // ...
}`,
  sqlQuery: (ctx) => `SELECT * FROM usuarios WHERE correo = '${ctx.correo}' LIMIT 1; -- contraseña no coincide o usuario suspendido`,
  responseBody: () => ({ message: 'Credenciales incorrectas o usuario suspendido.' }),
};

export const AUTH_LOGOUT: ApiSimTemplate = {
  method: 'POST',
  route: '/api/logout',
  entity: 'Auth',
  operationLabel: 'Cerrar sesión',
  controllerCode: `// AuthController.php
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Sesión cerrada.']);
}`,
  sqlQuery: (ctx) => `DELETE FROM personal_access_tokens WHERE tokenable_id = ${ctx.userId};`,
  responseBody: () => ({ message: 'Sesión cerrada.' }),
};

export const AUTH_FETCH_USER: ApiSimTemplate = {
  method: 'GET',
  route: '/api/user',
  entity: 'Auth',
  operationLabel: 'Obtener usuario autenticado',
  controllerCode: `// AuthController.php
public function me(Request $request)
{
    $user = $request->user()->load('rol');
    return response()->json([
        'id' => $user->id, 'name' => $user->name,
        'roles' => [$user->rol->nombre], 'permissions' => $user->rol->permisos,
    ]);
}`,
  sqlQuery: (ctx) => `SELECT u.*, r.nombre, r.permisos FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ${ctx.userId};`,
  responseBody: (ctx) => ctx.user,
};

export const USER_LIST: ApiSimTemplate = {
  method: 'GET',
  route: '/api/users',
  entity: 'Usuario',
  operationLabel: 'Listar usuarios',
  controllerCode: `// UserController.php
public function index()
{
    return response()->json(Usuario::with('rol')->get()->map->toAdminArray());
}`,
  sqlQuery: () => `SELECT u.*, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.nombre ASC;`,
  responseBody: (ctx) => ctx.users,
};

export const USER_CREATE: ApiSimTemplate = {
  method: 'POST',
  route: '/api/users',
  entity: 'Usuario',
  operationLabel: 'Crear usuario',
  controllerCode: `// UserController.php
public function store(StoreUserRequest $request)
{
    $data = $request->validated();
    $data['password'] = Hash::make($data['password']);
    $user = Usuario::create($data);
    return response()->json($user->load('rol'), 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO usuarios (nombre, correo, password, rol_id, estado) VALUES ('${ctx.nombre}', '${ctx.correo}', '<hashed>', ${ctx.rolId}, 'Activo');`,
  responseBody: (ctx) => ctx.user,
};

export const USER_UPDATE: ApiSimTemplate = {
  method: 'PUT',
  route: '/api/users/{id}',
  entity: 'Usuario',
  operationLabel: 'Actualizar usuario',
  controllerCode: `// UserController.php
public function update(UpdateUserRequest $request, Usuario $usuario)
{
    $data = $request->validated();
    if (!empty($data['password'])) {
        $data['password'] = Hash::make($data['password']);
    }
    $usuario->update($data);
    return response()->json($usuario->load('rol'));
}`,
  sqlQuery: (ctx) => `UPDATE usuarios SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx.user,
};

export const ROLE_LIST: ApiSimTemplate = {
  method: 'GET',
  route: '/api/roles',
  entity: 'Rol',
  operationLabel: 'Listar roles y permisos disponibles',
  controllerCode: `// RoleController.php
public function index()
{
    return response()->json([
        'roles' => Role::all(),
        'permisosDisponibles' => Permiso::all(),
    ]);
}`,
  sqlQuery: () => `SELECT * FROM roles; SELECT * FROM permisos;`,
  responseBody: (ctx) => ({ roles: ctx.roles, permisosDisponibles: ctx.permisos }),
};

export const ROLE_CREATE: ApiSimTemplate = {
  method: 'POST',
  route: '/api/roles',
  entity: 'Rol',
  operationLabel: 'Crear rol',
  controllerCode: `// RoleController.php
public function store(StoreRoleRequest $request)
{
    $role = Role::create(['nombre' => $request->nombre, 'permisos' => []]);
    return response()->json($role, 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO roles (nombre, permisos) VALUES ('${ctx.nombre}', '[]');`,
  responseBody: (ctx) => ctx.role,
};

export const ROLE_UPDATE_PERMISSIONS: ApiSimTemplate = {
  method: 'PUT',
  route: '/api/roles/{id}/permissions',
  entity: 'Rol',
  operationLabel: 'Actualizar permisos de rol',
  controllerCode: `// RoleController.php
public function updatePermissions(Request $request, Role $role)
{
    $role->update(['permisos' => $request->input('permisos')]);
    return response()->json($role);
}`,
  sqlQuery: (ctx) => `UPDATE roles SET permisos = '${JSON.stringify(ctx.permisos)}' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx.role,
};

export const BITACORA_LIST: ApiSimTemplate = {
  method: 'GET',
  route: '/api/audit-logs',
  entity: 'Bitácora',
  operationLabel: 'Listar registros de auditoría (paginado)',
  controllerCode: `// AuditLogController.php
public function index(Request $request)
{
    return AuditLog::with('user.roles')
        ->when($request->search, fn ($q, $s) => $q->buscar($s))
        ->when($request->start_date, fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
        ->when($request->end_date, fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
        ->latest()
        ->paginate(20);
}`,
  sqlQuery: (ctx) => `SELECT * FROM audit_logs
WHERE (:search IS NULL OR descripcion LIKE '%${ctx.search || ''}%')
  AND (:start IS NULL OR DATE(created_at) >= '${ctx.startDate || ''}')
  AND (:end IS NULL OR DATE(created_at) <= '${ctx.endDate || ''}')
ORDER BY created_at DESC LIMIT ${ctx.perPage} OFFSET ${(ctx.page - 1) * ctx.perPage};`,
  responseBody: (ctx) => ctx.page_response,
};

import { ApiSimTemplate } from '../templates';

export const AUTH_LOGIN: ApiSimTemplate<{ user: any; token: string }> = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Iniciar sesión',
  controllerCode: `// AuthController.php
public function login(LoginRequest $request)
{
    $credentials = $request->validated();
    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Credenciales inválidas.'], 401);
    }
    $user = Auth::user()->load('role');
    $token = $user->createToken('farmacia-token')->plainTextToken;
    return response()->json(['token' => $token, 'user' => $user]);
}`,
  sqlQuery: (ctx) =>
    `SELECT * FROM users WHERE email = '${ctx.user.email}' LIMIT 1;
INSERT INTO personal_access_tokens (tokenable_id, name, token) VALUES (${ctx.user.id}, 'farmacia-token', '${ctx.token.slice(0, 12)}...');`,
  responseBody: (ctx) => ({ token: ctx.token, user: ctx.user }),
};

export const AUTH_LOGIN_FAILED: ApiSimTemplate<{ email: string }> = {
  method: 'POST',
  route: '/api/login',
  entity: 'Auth',
  operationLabel: 'Intento de inicio de sesión fallido',
  controllerCode: `// AuthController.php
public function login(LoginRequest $request)
{
    if (!Auth::attempt($request->validated())) {
        return response()->json(['message' => 'Credenciales inválidas.'], 401);
    }
    // ...
}`,
  sqlQuery: (ctx) => `SELECT * FROM users WHERE email = '${ctx.email}' LIMIT 1; -- 0 filas coinciden con la contraseña`,
  responseBody: () => ({ message: 'Credenciales inválidas. Por favor verifique sus datos.' }),
};

export const AUTH_LOGOUT: ApiSimTemplate<{ userId: number }> = {
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

export const ROLE_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/roles',
  entity: 'Rol',
  operationLabel: 'Crear rol',
  controllerCode: `// RoleController.php
public function store(StoreRoleRequest $request)
{
    $role = Role::create($request->validated());
    return response()->json($role, 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO roles (name, permissions) VALUES ('${ctx.name}', '${JSON.stringify(ctx.permissions)}');`,
  responseBody: (ctx) => ctx,
};

export const ROLE_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/roles/{id}',
  entity: 'Rol',
  operationLabel: 'Actualizar rol',
  controllerCode: `// RoleController.php
public function update(UpdateRoleRequest $request, Role $role)
{
    $role->update($request->validated());
    return response()->json($role);
}`,
  sqlQuery: (ctx) => `UPDATE roles SET name = '${ctx.name}', permissions = '${JSON.stringify(ctx.permissions)}' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const ROLE_DELETE: ApiSimTemplate<{ id: number }> = {
  method: 'DELETE',
  route: '/api/roles/{id}',
  entity: 'Rol',
  operationLabel: 'Eliminar rol',
  controllerCode: `// RoleController.php
public function destroy(Role $role)
{
    $role->delete();
    return response()->json(null, 204);
}`,
  sqlQuery: (ctx) => `DELETE FROM roles WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const USER_CREATE: ApiSimTemplate<any> = {
  method: 'POST',
  route: '/api/users',
  entity: 'Usuario',
  operationLabel: 'Crear usuario',
  controllerCode: `// UserController.php
public function store(StoreUserRequest $request)
{
    $data = $request->validated();
    $data['password'] = Hash::make($data['password']);
    $user = User::create($data);
    return response()->json($user->load('role'), 201);
}`,
  sqlQuery: (ctx) =>
    `INSERT INTO users (name, email, password, role_id, status) VALUES ('${ctx.name}', '${ctx.email}', '<hashed>', ${ctx.role_id}, 'activo');`,
  responseBody: (ctx) => ctx,
};

export const USER_UPDATE: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/users/{id}',
  entity: 'Usuario',
  operationLabel: 'Actualizar usuario',
  controllerCode: `// UserController.php
public function update(UpdateUserRequest $request, User $user)
{
    $data = $request->validated();
    if (!empty($data['password'])) {
        $data['password'] = Hash::make($data['password']);
    }
    $user->update($data);
    return response()->json($user->load('role'));
}`,
  sqlQuery: (ctx) => `UPDATE users SET name = '${ctx.name}', email = '${ctx.email}', role_id = ${ctx.role_id} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

export const USER_STATUS: ApiSimTemplate<any> = {
  method: 'PUT',
  route: '/api/users/{id}/status',
  entity: 'Usuario',
  operationLabel: 'Cambiar estado de usuario',
  controllerCode: `// UserController.php
public function changeStatus(Request $request, User $user)
{
    $user->update(['status' => $request->input('status')]);
    return response()->json($user->load('role'));
}`,
  sqlQuery: (ctx) => `UPDATE users SET status = '${ctx.status}' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ctx,
};

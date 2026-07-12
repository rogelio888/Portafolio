<?php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Login de empleados
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'usuario' => 'required|string',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar empleado
            $empleado = Empleado::where('usuario', $request->usuario)->first();

            if (!$empleado || !Hash::check($request->password, $empleado->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            // Verificar que esté activo
            if ($empleado->estado !== 'ACTIVO') {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario inactivo. Contacte al administrador.'
                ], 403);
            }

            // Crear token
            $token = $empleado->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'empleado' => $empleado->load(['rol.permisos', 'hotel']),
                    'token' => $token,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el servidor: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        $empleado = $request->user()->load(['rol.permisos', 'hotel']);

        return response()->json([
            'success' => true,
            'data' => $empleado
        ]);
    }

    /**
     * Cambiar contraseña
     */
    public function cambiarPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password_actual' => 'required|string',
            'password_nuevo' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $empleado = $request->user();

        // Verificar password actual
        if (!Hash::check($request->password_actual, $empleado->password)) {
            return response()->json([
                'success' => false,
                'message' => 'La contraseña actual es incorrecta'
            ], 422);
        }

        // Actualizar password
        $empleado->password = $request->password_nuevo;
        $empleado->save();

        return response()->json([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ]);
    }

    /**
     * Verificar permiso
     */
    public function verificarPermiso(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'permiso' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $empleado = $request->user();
        $tienePermiso = $empleado->tienePermiso($request->permiso);

        return response()->json([
            'success' => true,
            'data' => [
                'permiso' => $request->permiso,
                'tiene_permiso' => $tienePermiso
            ]
        ]);
    }
}

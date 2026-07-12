<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    /**
     * Verificar si el usuario tiene el permiso necesario
     */
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        }

        // El administrador tiene todos los permisos
        if ($user->rol && $user->rol->nombre === 'Administrador') {
            return $next($request);
        }

        // Verificar permiso específico
        if (!$user->tienePermiso($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para realizar esta acción. Solicita autorización a un gerente o administrador.'
            ], 403);
        }

        return $next($request);
    }
}

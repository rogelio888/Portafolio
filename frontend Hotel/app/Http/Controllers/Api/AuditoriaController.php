<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        $query = Auditoria::with('empleado');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('accion')) {
            $query->where('accion', $request->accion);
        }

        if ($request->filled('modelo')) {
            $query->where('modelo', 'like', '%' . $request->modelo . '%');
        }

        // Fecha de inicio (>=) y fin (<=) usando whereDate
        if ($request->filled('fecha_inicio')) {
            $query->whereDate('created_at', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $query->whereDate('created_at', '<=', $request->fecha_fin);
        }

        $auditorias = $query->orderBy('created_at', 'desc')->paginate(20);

        // Transformar datos para que coincidan con lo que espera el frontend
        $auditorias->getCollection()->transform(function ($auditoria) {
            $auditoria->user = $auditoria->empleado ? [
                'id' => $auditoria->empleado->id,
                'name' => $auditoria->empleado->getNombreCompleto(),
                'usuario' => $auditoria->empleado->usuario
            ] : null;
            return $auditoria;
        });

        return response()->json([
            'success' => true,
            'data' => $auditorias,
        ]);
    }
}

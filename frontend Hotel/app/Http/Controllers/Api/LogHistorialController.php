<?php
// app/Http/Controllers/Api/LogHistorialController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LogHistorial;
use Illuminate\Http\Request;

class LogHistorialController extends Controller
{
    public function index(Request $request)
    {
        $query = LogHistorial::with('empleado');

        if ($request->has('tabla')) {
            $query->porTabla($request->tabla);
        }

        if ($request->has('accion')) {
            $query->porAccion($request->accion);
        }

        if ($request->has('usuario')) {
            $query->porUsuario($request->usuario);
        }

        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->entreFechas($request->fecha_inicio, $request->fecha_fin);
        }

        $logs = $query->orderBy('fecha', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    public function show($id)
    {
        $log = LogHistorial::with('empleado')->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Log no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $log
        ]);
    }
}
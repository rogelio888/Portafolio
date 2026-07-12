<?php
// app/Http/Controllers/Api/PermisoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permiso;
use Illuminate\Http\Request;

class PermisoController extends Controller
{
    public function index()
    {
        $permisos = Permiso::all();

        return response()->json([
            'success' => true,
            'data' => $permisos
        ]);
    }

    public function show($id)
    {
        $permiso = Permiso::with('roles')->find($id);

        if (!$permiso) {
            return response()->json([
                'success' => false,
                'message' => 'Permiso no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $permiso
        ]);
    }
}
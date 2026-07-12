<?php
// app/Http/Controllers/Api/PisoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Piso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PisoController extends Controller
{
    public function index(Request $request)
    {
        // Seguridad: Scoping por hotel
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Piso::with(['hotel', 'habitaciones']);

        if ($request->filled('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        $pisos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $pisos
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_hotel' => 'required|exists:hoteles,id',
            'numero' => 'required|integer',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que no exista el piso en ese hotel
        $existe = Piso::where('id_hotel', $request->id_hotel)
            ->where('numero', $request->numero)
            ->exists();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe un piso con ese número en este hotel'
            ], 422);
        }

        $piso = Piso::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Piso creado exitosamente',
            'data' => $piso->load('hotel')
        ], 201);
    }

    public function show($id)
    {
        $piso = Piso::with(['hotel', 'habitaciones.tipo'])->find($id);

        if (!$piso) {
            return response()->json([
                'success' => false,
                'message' => 'Piso no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $piso
        ]);
    }

    public function update(Request $request, $id)
    {
        $piso = Piso::find($id);

        if (!$piso) {
            return response()->json([
                'success' => false,
                'message' => 'Piso no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'numero' => 'integer',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $piso->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Piso actualizado exitosamente',
            'data' => $piso
        ]);
    }

    public function destroy($id)
    {
        $piso = Piso::find($id);

        if (!$piso) {
            return response()->json([
                'success' => false,
                'message' => 'Piso no encontrado'
            ], 404);
        }

        // Verificar si tiene habitaciones
        if ($piso->habitaciones()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un piso con habitaciones asignadas'
            ], 422);
        }

        $piso->delete();

        return response()->json([
            'success' => true,
            'message' => 'Piso eliminado exitosamente'
        ]);
    }
}

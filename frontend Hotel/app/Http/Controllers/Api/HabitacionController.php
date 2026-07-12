<?php
// app/Http/Controllers/Api/HabitacionController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Habitacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HabitacionController extends Controller
{
    public function index(Request $request)
    {
        // Seguridad: Scoping por hotel
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Habitacion::with(['hotel', 'piso', 'tipo']);

        if ($request->filled('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        if ($request->filled('id_piso')) {
            $query->where('id_piso', $request->id_piso);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('buscar')) {
            $query->where('numero', 'like', "%{$request->buscar}%");
        }

        $habitaciones = $query->get();

        return response()->json([
            'success' => true,
            'data' => $habitaciones
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_hotel' => 'required|exists:hoteles,id',
            'id_piso' => 'required|exists:pisos,id',
            'id_tipo' => 'required|exists:tipo_habitaciones,id',
            'numero' => 'required|string|max:20',
            'estado' => 'in:DISPONIBLE,OCUPADA,RESERVADA,MANTENIMIENTO,INACTIVA,DEMOLIDA',
            'descripcion' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que no exista habitación con ese número en el hotel
        $existe = Habitacion::where('id_hotel', $request->id_hotel)
            ->where('numero', $request->numero)
            ->exists();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una habitación con ese número en este hotel'
            ], 422);
        }

        $habitacion = Habitacion::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Habitación creada exitosamente',
            'data' => $habitacion->load(['hotel', 'piso', 'tipo'])
        ], 201);
    }

    public function show($id)
    {
        $habitacion = Habitacion::with(['hotel', 'piso', 'tipo', 'mantenimientos'])
            ->find($id);

        if (!$habitacion) {
            return response()->json([
                'success' => false,
                'message' => 'Habitación no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $habitacion
        ]);
    }

    public function update(Request $request, $id)
    {
        $habitacion = Habitacion::find($id);

        if (!$habitacion) {
            return response()->json([
                'success' => false,
                'message' => 'Habitación no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'numero' => 'string|max:20',
            'estado' => 'in:DISPONIBLE,OCUPADA,RESERVADA,MANTENIMIENTO,INACTIVA,DEMOLIDA',
            'descripcion' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $habitacion->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Habitación actualizada exitosamente',
            'data' => $habitacion
        ]);
    }

    public function cambiarEstado(Request $request, $id)
    {
        $habitacion = Habitacion::find($id);

        if (!$habitacion) {
            return response()->json([
                'success' => false,
                'message' => 'Habitación no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:DISPONIBLE,OCUPADA,RESERVADA,MANTENIMIENTO,INACTIVA,DEMOLIDA',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $habitacion->cambiarEstado($request->estado);

        return response()->json([
            'success' => true,
            'message' => 'Estado de habitación cambiado exitosamente',
            'data' => $habitacion
        ]);
    }

    public function destroy($id)
    {
        $habitacion = Habitacion::find($id);

        if (!$habitacion) {
            return response()->json([
                'success' => false,
                'message' => 'Habitación no encontrada'
            ], 404);
        }

        $habitacion->estado = 'DEMOLIDA';
        $habitacion->save();

        return response()->json([
            'success' => true,
            'message' => 'Habitación marcada como demolida'
        ]);
    }

    /**
     * Obtener habitaciones disponibles
     */
    public function disponibles(Request $request)
    {
        $query = Habitacion::with(['hotel', 'piso', 'tipo'])
            ->disponibles();

        if ($request->filled('id_hotel')) {
            $query->porHotel($request->id_hotel);
        }

        $habitaciones = $query->get();

        return response()->json([
            'success' => true,
            'data' => $habitaciones
        ]);
    }
}

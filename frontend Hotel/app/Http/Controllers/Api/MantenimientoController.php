<?php
// app/Http/Controllers/Api/MantenimientoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mantenimiento;
use App\Models\Habitacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MantenimientoController extends Controller
{
    public function index(Request $request)
    {
        $query = Mantenimiento::with(['habitacion.hotel']);

        if ($request->filled('id_habitacion')) {
            $query->porHabitacion($request->id_habitacion);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->entreFechas($request->fecha_inicio, $request->fecha_fin);
        }

        $mantenimientos = $query->orderBy('fecha', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $mantenimientos
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_habitacion' => 'required|exists:habitaciones,id',
            'descripcion' => 'required|string',
            'fecha' => 'required|date',
            'costo' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mantenimiento = Mantenimiento::create($request->all());

        // Cambiar estado de la habitación a MANTENIMIENTO
        $habitacion = Habitacion::find($request->id_habitacion);
        $habitacion->cambiarEstado('MANTENIMIENTO');

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento registrado exitosamente',
            'data' => $mantenimiento->load('habitacion')
        ], 201);
    }

    public function show($id)
    {
        $mantenimiento = Mantenimiento::with(['habitacion.hotel'])->find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $mantenimiento
        ]);
    }

    public function update(Request $request, $id)
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'descripcion' => 'string',
            'fecha' => 'date',
            'costo' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $mantenimiento->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento actualizado exitosamente',
            'data' => $mantenimiento
        ]);
    }

    public function destroy($id)
    {
        $mantenimiento = Mantenimiento::find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        $mantenimiento->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento eliminado exitosamente'
        ]);
    }

    /**
     * Completar mantenimiento (cambiar habitación a DISPONIBLE)
     */
    public function completar($id)
    {
        $mantenimiento = Mantenimiento::with('habitacion')->find($id);

        if (!$mantenimiento) {
            return response()->json([
                'success' => false,
                'message' => 'Mantenimiento no encontrado'
            ], 404);
        }

        // Cambiar estado de habitación a DISPONIBLE
        $mantenimiento->habitacion->cambiarEstado('DISPONIBLE');

        return response()->json([
            'success' => true,
            'message' => 'Mantenimiento completado. Habitación disponible nuevamente.',
            'data' => $mantenimiento
        ]);
    }
}
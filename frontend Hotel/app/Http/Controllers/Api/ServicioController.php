<?php
// app/Http/Controllers/Api/ServicioController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServicioController extends Controller
{
    public function index(Request $request)
    {
        $query = Servicio::query();

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('tipo')) {
            $query->porTipo($request->tipo);
        }

        if ($request->filled('frecuencia')) {
            $query->porFrecuencia($request->frecuencia);
        }

        $servicios = $query->get();

        return response()->json([
            'success' => true,
            'data' => $servicios
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'tipo' => 'required|in:PERSONA,HABITACION,ESTANCIA',
            'frecuencia' => 'required|in:DIARIO,UNICO,POR_USO',
            'precio' => 'required|numeric|min:0',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $servicio = Servicio::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Servicio creado exitosamente',
            'data' => $servicio
        ], 201);
    }

    public function show($id)
    {
        $servicio = Servicio::with('consumos')->find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $servicio
        ]);
    }

    public function update(Request $request, $id)
    {
        $servicio = Servicio::find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:150',
            'descripcion' => 'nullable|string',
            'tipo' => 'in:PERSONA,HABITACION,ESTANCIA',
            'frecuencia' => 'in:DIARIO,UNICO,POR_USO',
            'precio' => 'numeric|min:0',
            'estado' => 'in:ACTIVO,INACTIVO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $servicio->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Servicio actualizado exitosamente',
            'data' => $servicio
        ]);
    }

    public function destroy($id)
    {
        $servicio = Servicio::find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        // Verificar si tiene consumos
        if ($servicio->consumos()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un servicio con consumos registrados'
            ], 422);
        }

        $servicio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Servicio eliminado exitosamente'
        ]);
    }

    /**
     * Calcular precio de un servicio
     */
    public function calcularPrecio(Request $request, $id)
    {
        $servicio = Servicio::find($id);

        if (!$servicio) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|min:1',
            'dias' => 'integer|min:1',
            'personas' => 'integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $precio = $servicio->calcularPrecio(
            $request->cantidad,
            $request->dias ?? 1,
            $request->personas ?? 1
        );

        return response()->json([
            'success' => true,
            'data' => [
                'servicio' => $servicio->nombre,
                'precio_unitario' => $servicio->precio,
                'cantidad' => $request->cantidad,
                'dias' => $request->dias ?? 1,
                'personas' => $request->personas ?? 1,
                'precio_total' => $precio
            ]
        ]);
    }
}
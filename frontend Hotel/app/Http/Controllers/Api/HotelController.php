<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HotelController extends Controller
{
    /**
     * Listar todos los hoteles
     */
    public function index(Request $request)
    {
        $query = Hotel::with(['pisos', 'habitaciones']);

        // Filtro por estado
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        // Búsqueda
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('ciudad', 'like', "%{$buscar}%");
            });
        }

        $hoteles = $query->get();

        return response()->json([
            'success' => true,
            'data' => $hoteles
        ]);
    }

    /**
     * Crear un nuevo hotel
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:150',
            'direccion' => 'required|string|max:255',
            'ciudad' => 'required|string|max:100',
            'estado' => 'in:ACTIVO,INACTIVO,CERRADO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $hotel = Hotel::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Hotel creado exitosamente',
            'data' => $hotel
        ], 201);
    }

    /**
     * Mostrar un hotel específico
     */
    public function show($id)
    {
        $hotel = Hotel::with(['pisos', 'habitaciones.tipo', 'reservas', 'empleados'])
            ->find($id);

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $hotel
        ]);
    }

    /**
     * Actualizar un hotel
     */
    public function update(Request $request, $id)
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:150',
            'direccion' => 'string|max:255',
            'ciudad' => 'string|max:100',
            'estado' => 'in:ACTIVO,INACTIVO,CERRADO',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $hotel->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Hotel actualizado exitosamente',
            'data' => $hotel
        ]);
    }

    /**
     * Eliminar un hotel (soft delete cambiando estado)
     */
    public function destroy($id)
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel no encontrado'
            ], 404);
        }

        $hotel->estado = 'CERRADO';
        $hotel->save();

        return response()->json([
            'success' => true,
            'message' => 'Hotel cerrado exitosamente'
        ]);
    }

    /**
     * Dashboard del hotel
     */
    public function dashboard($id)
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel no encontrado'
            ], 404);
        }

        $data = [
            'hotel' => $hotel,
            'total_habitaciones' => $hotel->habitaciones()->count(),
            'habitaciones_disponibles' => $hotel->habitacionesDisponibles(),
            'habitaciones_ocupadas' => $hotel->habitacionesOcupadas(),
            'reservas_hoy' => $hotel->reservas()
                ->whereDate('fecha_entrada', today())
                ->count(),
            'reservas_activas' => $hotel->reservas()
                ->where('estado', 'EN_PROCESO')
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
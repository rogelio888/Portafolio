<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Habitacion;
use App\Models\ReservaHabitacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ReservaController extends Controller
{
    public function index(Request $request)
    {
        // Seguridad: Scoping por hotel
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Reserva::with(['huesped', 'hotel', 'habitaciones.tipo']);

        if ($request->filled('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        if ($request->filled('estado')) {
            $estados = explode(',', $request->estado);
            if (count($estados) > 1) {
                $query->whereIn('estado', $estados);
            } else {
                $query->where('estado', $request->estado);
            }
        }

        if ($request->filled('fecha_entrada')) {
            $query->whereDate('fecha_entrada', $request->fecha_entrada);
        }

        $reservas = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $reservas
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_huesped' => 'required|exists:huespedes,id',
            'id_hotel' => 'required|exists:hoteles,id',
            'fecha_entrada' => 'required|date',
            'fecha_salida' => 'required|date|after:fecha_entrada',
            'adultos' => 'required|integer|min:1',
            'ninos' => 'integer|min:0',
            'habitaciones' => 'required|array|min:1',
            'habitaciones.*.id_habitacion' => 'required|exists:habitaciones,id',
            'huespedes_adicionales' => 'array',
            'huespedes_adicionales.*' => 'exists:huespedes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Crear la reserva
            $reserva = Reserva::create([
                'id_huesped' => $request->id_huesped,
                'id_hotel' => $request->id_hotel,
                'fecha_entrada' => $request->fecha_entrada,
                'fecha_salida' => $request->fecha_salida,
                'adultos' => $request->adultos,
                'ninos' => $request->ninos ?? 0,
                'estado' => 'PENDIENTE',
                'total' => 0,
            ]);

            // Calcular noches
            $noches = $reserva->calcularNoches();

            // Agregar habitaciones
            foreach ($request->habitaciones as $hab) {
                $habitacion = Habitacion::find($hab['id_habitacion']);
                $precioNoche = $habitacion->getPrecio();
                $total = $precioNoche * $noches;

                ReservaHabitacion::create([
                    'id_reserva' => $reserva->id,
                    'id_habitacion' => $habitacion->id,
                    'precio_por_noche' => $precioNoche,
                    'noches' => $noches,
                    'total' => $total,
                ]);

                // Cambiar estado de habitación a RESERVADA
                $habitacion->cambiarEstado('RESERVADA');
            }

            // Agregar huéspedes adicionales
            if ($request->has('huespedes_adicionales')) {
                foreach ($request->huespedes_adicionales as $idHuesped) {
                    $reserva->huespedesAdicionales()->attach($idHuesped);
                }
            }

            // Recalcular total
            $reserva->recalcularTotal();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reserva creada exitosamente',
                'data' => $reserva->load(['huesped', 'habitaciones', 'huespedesAdicionales'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al crear la reserva: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $reserva = Reserva::with([
            'huesped',
            'hotel',
            'habitaciones.tipo',
            'huespedesAdicionales',
            'consumos.servicio',
            'pagos'
        ])->find($id);

        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        // Agregar cálculos
        $data = $reserva->toArray();
        $data['noches'] = $reserva->calcularNoches();
        $data['total_consumos'] = $reserva->calcularTotalConsumos();
        $data['total_pagos'] = $reserva->calcularTotalPagos();
        $data['saldo'] = $reserva->calcularSaldo();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'fecha_entrada' => 'date',
            'fecha_salida' => 'date|after:fecha_entrada',
            'adultos' => 'integer|min:1',
            'ninos' => 'integer|min:0',
            'estado' => 'in:PENDIENTE,CONFIRMADA,EN_PROCESO,CANCELADA,COMPLETADA',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $reserva->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Reserva actualizada exitosamente',
            'data' => $reserva
        ]);
    }

    public function destroy($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        $reserva->cancelar();

        return response()->json([
            'success' => true,
            'message' => 'Reserva cancelada exitosamente'
        ]);
    }

    /**
     * Realizar check-in
     */
    public function checkIn($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        if ($reserva->estado !== 'CONFIRMADA') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se puede hacer check-in de reservas confirmadas'
            ], 422);
        }

        $reserva->realizarCheckIn();

        return response()->json([
            'success' => true,
            'message' => 'Check-in realizado exitosamente',
            'data' => $reserva
        ]);
    }

    /**
     * Realizar check-out
     */
    public function checkOut($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        if ($reserva->estado !== 'EN_PROCESO') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se puede hacer check-out de reservas en proceso'
            ], 422);
        }

        $reserva->realizarCheckOut();

        return response()->json([
            'success' => true,
            'message' => 'Check-out realizado exitosamente',
            'data' => $reserva
        ]);
    }

    /**
     * Confirmar reserva
     */
    public function confirmar($id)
    {
        $reserva = Reserva::find($id);

        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        if ($reserva->estado !== 'PENDIENTE') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden confirmar reservas pendientes'
            ], 422);
        }

        $reserva->confirmar();

        return response()->json([
            'success' => true,
            'message' => 'Reserva confirmada exitosamente',
            'data' => $reserva
        ]);
    }
}

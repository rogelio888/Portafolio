<?php
// app/Http/Controllers/Api/ConsumoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consumo;
use App\Models\Reserva;
use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConsumoController extends Controller
{
    public function index(Request $request)
    {
        $query = Consumo::with(['reserva.habitacion', 'reserva.huesped', 'servicio']);

        if ($request->has('id_reserva')) {
            $query->porReserva($request->id_reserva);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin]);
        } elseif ($request->has('fecha')) {
            $query->porFecha($request->fecha);
        }

        $consumos = $query->orderBy('id_reserva', 'desc')->orderBy('id', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $consumos
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_reserva' => 'required|exists:reservas,id',
            'id_servicio' => 'required|exists:servicios,id',
            'cantidad' => 'required|integer|min:1',
            'fecha' => 'required_without:fechas|date',
            'fechas' => 'required_without:fecha|array',
            'fechas.*' => 'date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que la reserva esté activa
        $reserva = Reserva::find($request->id_reserva);
        if (!in_array($reserva->estado, ['CONFIRMADA', 'EN_PROCESO'])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden registrar consumos en reservas confirmadas o en proceso'
            ], 422);
        }

        $servicio = Servicio::find($request->id_servicio);
        $subtotal = $servicio->precio * $request->cantidad;
        $consumosCreados = [];

        if ($request->has('fechas') && is_array($request->fechas)) {
            foreach ($request->fechas as $fecha) {
                $consumo = Consumo::create([
                    'id_reserva' => $request->id_reserva,
                    'id_servicio' => $request->id_servicio,
                    'cantidad' => $request->cantidad,
                    'fecha' => $fecha,
                    'subtotal' => $subtotal,
                ]);
                $consumosCreados[] = $consumo;
            }
        } else {
            $consumo = Consumo::create([
                'id_reserva' => $request->id_reserva,
                'id_servicio' => $request->id_servicio,
                'cantidad' => $request->cantidad,
                'fecha' => $request->fecha,
                'subtotal' => $subtotal,
            ]);
            $consumosCreados[] = $consumo;
        }

        // Recalcular total de la reserva
        $reserva->recalcularTotal();

        return response()->json([
            'success' => true,
            'message' => count($consumosCreados) > 1 ? 'Consumos registrados exitosamente' : 'Consumo registrado exitosamente',
            'data' => count($consumosCreados) > 1 ? $consumosCreados : $consumosCreados[0]
        ], 201);
    }

    public function show($id)
    {
        $consumo = Consumo::with(['reserva', 'servicio'])->find($id);

        if (!$consumo) {
            return response()->json([
                'success' => false,
                'message' => 'Consumo no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $consumo
        ]);
    }

    public function update(Request $request, $id)
    {
        $consumo = Consumo::find($id);

        if (!$consumo) {
            return response()->json([
                'success' => false,
                'message' => 'Consumo no encontrado'
            ], 404);
        }

        // Verificar que la reserva esté activa
        $reserva = $consumo->reserva;
        if (!in_array($reserva->estado, ['CONFIRMADA', 'EN_PROCESO'])) {
            return response()->json([
                'success' => false,
                'message' => 'No se pueden modificar consumos de reservas finalizadas o canceladas'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'cantidad' => 'integer|min:1',
            'fecha' => 'date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Si cambia la cantidad, recalcular subtotal
        if ($request->has('cantidad')) {
            $consumo->cantidad = $request->cantidad;
            $consumo->calcularSubtotal();
        }

        if ($request->has('fecha')) {
            $consumo->fecha = $request->fecha;
        }

        $consumo->save();

        // Recalcular total de la reserva
        $consumo->reserva->recalcularTotal();

        return response()->json([
            'success' => true,
            'message' => 'Consumo actualizado exitosamente',
            'data' => $consumo
        ]);
    }

    public function destroy($id)
    {
        $consumo = Consumo::find($id);

        if (!$consumo) {
            return response()->json([
                'success' => false,
                'message' => 'Consumo no encontrado'
            ], 404);
        }

        // Verificar que la reserva esté activa
        $reserva = $consumo->reserva;
        if (!in_array($reserva->estado, ['CONFIRMADA', 'EN_PROCESO'])) {
            return response()->json([
                'success' => false,
                'message' => 'No se pueden eliminar consumos de reservas finalizadas o canceladas'
            ], 422);
        }

        $consumo->delete();

        // Recalcular total de la reserva
        $reserva->recalcularTotal();

        return response()->json([
            'success' => true,
            'message' => 'Consumo eliminado exitosamente'
        ]);
    }

    /**
     * Obtener consumos por reserva
     */
    public function porReserva($idReserva)
    {
        $reserva = Reserva::find($idReserva);

        if (!$reserva) {
            return response()->json([
                'success' => false,
                'message' => 'Reserva no encontrada'
            ], 404);
        }

        $consumos = $reserva->consumos()->with('servicio')->get();

        return response()->json([
            'success' => true,
            'data' => $consumos,
            'total' => $consumos->sum('subtotal')
        ]);
    }
}
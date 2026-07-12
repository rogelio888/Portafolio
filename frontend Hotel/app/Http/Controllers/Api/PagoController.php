<?php
// app/Http/Controllers/Api/PagoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PagoController extends Controller
{
    public function index(Request $request)
    {
        $query = Pago::with(['reserva.huesped', 'reserva.habitaciones']);

        // Por defecto solo mostrar pagos activos
        if (!$request->has('incluir_anulados') || !$request->incluir_anulados) {
            $query->activos();
        }

        if ($request->has('id_reserva')) {
            $query->porReserva($request->id_reserva);
        }

        if ($request->has('tipo_pago')) {
            $query->porTipo($request->tipo_pago);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
            $query->entreFechas($request->fecha_inicio, $request->fecha_fin);
        }

        $pagos = $query->orderBy('id_reserva', 'desc')->orderBy('id', 'desc')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $pagos
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_reserva' => 'required|exists:reservas,id',
            'tipo_pago' => 'required|in:EFECTIVO,TARJETA,TRANSFERENCIA',
            'monto' => 'required|numeric|min:0.01',
            'fecha' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que la reserva existe y está activa
        $reserva = Reserva::find($request->id_reserva);

        if (!in_array($reserva->estado, ['CONFIRMADA', 'EN_PROCESO'])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden registrar pagos en reservas confirmadas o en proceso'
            ], 422);
        }

        // Verificar que el monto no exceda el saldo
        $saldo = $reserva->calcularSaldo();
        if ($request->monto > $saldo) {
            return response()->json([
                'success' => false,
                'message' => "El monto excede el saldo pendiente (Bs. " . number_format($saldo, 2) . ")"
            ], 422);
        }

        $pago = Pago::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Pago registrado exitosamente',
            'data' => $pago->load('reserva'),
            'saldo_restante' => $reserva->calcularSaldo()
        ], 201);
    }

    public function show($id)
    {
        $pago = Pago::with(['reserva.huesped', 'reserva.habitaciones'])->find($id);

        if (!$pago) {
            return response()->json([
                'success' => false,
                'message' => 'Pago no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $pago
        ]);
    }

    /**
     * Anular un pago
     */
    public function anular(Request $request, $id)
    {
        $pago = Pago::find($id);

        if (!$pago) {
            return response()->json([
                'success' => false,
                'message' => 'Pago no encontrado'
            ], 404);
        }

        // Verificar que el pago esté activo
        if ($pago->estaAnulado()) {
            return response()->json([
                'success' => false,
                'message' => 'Este pago ya está anulado'
            ], 422);
        }

        // Verificar que la reserva no esté finalizada
        $reserva = $pago->reserva;
        if ($reserva->estado === 'FINALIZADA') {
            return response()->json([
                'success' => false,
                'message' => 'No se pueden anular pagos de reservas finalizadas'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'motivo_anulacion' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $pago->anular($request->motivo_anulacion);

        return response()->json([
            'success' => true,
            'message' => 'Pago anulado exitosamente',
            'data' => $pago->fresh(),
            'saldo_actualizado' => $reserva->calcularSaldo()
        ]);
    }

    /**
     * Obtener pagos por reserva
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

        $pagos = $reserva->pagos;
        $pagosActivos = $pagos->where('estado', 'ACTIVO');

        return response()->json([
            'success' => true,
            'data' => $pagos,
            'total_pagado' => $pagosActivos->sum('monto'),
            'total_reserva' => $reserva->total,
            'saldo' => $reserva->calcularSaldo()
        ]);
    }
}
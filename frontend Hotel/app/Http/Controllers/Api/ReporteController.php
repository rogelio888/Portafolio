<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Pago;
use App\Models\Consumo;
use App\Models\Habitacion;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReporteController extends Controller
{
    /**
     * Reporte de reservas
     */
    public function reservas(Request $request)
    {
        // Seguridad: Scoping por hotel para no admins
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Reserva::with(['huesped', 'hotel', 'habitaciones']);

        // Filtros
        if ($request->filled('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha_entrada', [
                $request->fecha_inicio,
                $request->fecha_fin
            ]);
        }

        $reservas = $query->get();

        $totales = [
            'total_reservas' => $reservas->count(),
            'total_ingresos' => $reservas->sum('total'),
            'adultos' => $reservas->sum('adultos'),
            'ninos' => $reservas->sum('ninos'),
        ];

        return response()->json([
            'success' => true,
            'data' => $reservas,
            'totales' => $totales
        ]);
    }

    /**
     * Reporte de ingresos
     */
    public function ingresos(Request $request)
    {
        // Seguridad
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Pago::with(['reserva.hotel']);

        if ($request->filled('id_hotel')) {
            $query->whereHas('reserva', function ($q) use ($request) {
                $q->where('id_hotel', $request->id_hotel);
            });
        }

        if ($request->filled('tipo_pago')) {
            $query->where('tipo_pago', $request->tipo_pago);
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha', [
                $request->fecha_inicio,
                $request->fecha_fin
            ]);
        }

        $pagos = $query->get();

        $totales = [
            'total_pagos' => $pagos->count(),
            'total_efectivo' => $pagos->where('tipo_pago', 'EFECTIVO')->sum('monto'),
            'total_tarjeta' => $pagos->where('tipo_pago', 'TARJETA')->sum('monto'),
            'total_transferencia' => $pagos->where('tipo_pago', 'TRANSFERENCIA')->sum('monto'),
            'total_general' => $pagos->sum('monto'),
        ];

        return response()->json([
            'success' => true,
            'data' => $pagos,
            'totales' => $totales
        ]);
    }

    /**
     * Reporte de ocupación
     */
    public function ocupacion(Request $request)
    {
        // Seguridad
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Habitacion::query();

        if ($request->filled('id_hotel')) {
            $query->where('id_hotel', $request->id_hotel);
        }

        $total = $query->count();
        $disponibles = (clone $query)->where('estado', 'DISPONIBLE')->count();
        $ocupadas = (clone $query)->where('estado', 'OCUPADA')->count();
        $reservadas = (clone $query)->where('estado', 'RESERVADA')->count();
        $mantenimiento = (clone $query)->where('estado', 'MANTENIMIENTO')->count();

        $tasaOcupacion = $total > 0 ? round(($ocupadas / $total) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_habitaciones' => $total,
                'disponibles' => $disponibles,
                'ocupadas' => $ocupadas,
                'reservadas' => $reservadas,
                'mantenimiento' => $mantenimiento,
                'tasa_ocupacion' => $tasaOcupacion,
                'porcentajes' => [
                    'disponibles' => $total > 0 ? round(($disponibles / $total) * 100, 2) : 0,
                    'ocupadas' => $tasaOcupacion,
                    'reservadas' => $total > 0 ? round(($reservadas / $total) * 100, 2) : 0,
                    'mantenimiento' => $total > 0 ? round(($mantenimiento / $total) * 100, 2) : 0,
                ]
            ]
        ]);
    }

    /**
     * Reporte de servicios consumidos
     */
    public function consumos(Request $request)
    {
        // Seguridad
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $query = Consumo::with(['servicio', 'reserva.hotel']);

        if ($request->filled('id_hotel')) {
            $query->whereHas('reserva', function ($q) use ($request) {
                $q->where('id_hotel', $request->id_hotel);
            });
        }

        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha', [
                $request->fecha_inicio,
                $request->fecha_fin
            ]);
        }

        $consumos = $query->get();

        $totales = [
            'total_consumos' => $consumos->count(),
            'total_ingresos' => $consumos->sum('subtotal'),
        ];

        return response()->json([
            'success' => true,
            'data' => $consumos,
            'totales' => $totales
        ]);
    }

    /**
     * Reporte consolidado
     */
    public function consolidado(Request $request)
    {
        // Seguridad
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->startOfMonth());
        $fechaFin = $request->input('fecha_fin', Carbon::now()->endOfMonth());
        $idHotel = $request->input('id_hotel');

        // Reservas
        $reservasQuery = Reserva::whereBetween('created_at', [$fechaInicio, $fechaFin]);
        if ($request->filled('id_hotel'))
            $reservasQuery->where('id_hotel', $idHotel);
        $totalReservas = $reservasQuery->count();

        // Ingresos por pagos
        $pagosQuery = Pago::whereBetween('fecha', [$fechaInicio, $fechaFin]);
        if ($request->filled('id_hotel')) {
            $pagosQuery->whereHas('reserva', function ($q) use ($idHotel) {
                $q->where('id_hotel', $idHotel);
            });
        }
        $totalIngresos = $pagosQuery->sum('monto');

        // Consumos
        $consumosQuery = Consumo::whereBetween('fecha', [$fechaInicio, $fechaFin]);
        if ($request->filled('id_hotel')) {
            $consumosQuery->whereHas('reserva', function ($q) use ($idHotel) {
                $q->where('id_hotel', $idHotel);
            });
        }
        $totalConsumos = $consumosQuery->sum('subtotal');

        // Habitaciones
        $habitacionesQuery = Habitacion::query();
        if ($request->filled('id_hotel'))
            $habitacionesQuery->where('id_hotel', $idHotel);
        $ocupadas = (clone $habitacionesQuery)->where('estado', 'OCUPADA')->count();
        $total = $habitacionesQuery->count();
        $tasaOcupacion = $total > 0 ? round(($ocupadas / $total) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'periodo' => [
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
            ],
            'data' => [
                'reservas' => $totalReservas,
                'ingresos_totales' => $totalIngresos,
                'ingresos_consumos' => $totalConsumos,
                'tasa_ocupacion' => $tasaOcupacion,
            ]
        ]);
    }
}

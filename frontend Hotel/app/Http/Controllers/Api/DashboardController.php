<?php
// app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Habitacion;
use App\Models\Reserva;
use App\Models\Pago;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Dashboard general del sistema
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $idHotel = $request->input('id_hotel');

        // Seguridad: Si no es Admin/Gerente, solo ve su propio hotel
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $idHotel = $user->id_hotel;
            // Actualizamos request para coherencia interna si se pasa a otros métodos
            $request->merge(['id_hotel' => $idHotel]);
        }

        // Filtrar por hotel si se especifica
        $habitacionesQuery = Habitacion::query();
        $reservasQuery = Reserva::query();
        $pagosQuery = Pago::query();

        if ($idHotel) {
            $habitacionesQuery->where('id_hotel', $idHotel);
            $reservasQuery->where('id_hotel', $idHotel);
            $pagosQuery->whereHas('reserva', function ($q) use ($idHotel) {
                $q->where('id_hotel', $idHotel);
            });
        }

        // Estadísticas de habitaciones
        $totalHabitaciones = $habitacionesQuery->count();
        $habitacionesDisponibles = (clone $habitacionesQuery)->where('estado', 'DISPONIBLE')->count();
        $habitacionesOcupadas = (clone $habitacionesQuery)->where('estado', 'OCUPADA')->count();
        $habitacionesReservadas = (clone $habitacionesQuery)->where('estado', 'RESERVADA')->count();
        $habitacionesMantenimiento = (clone $habitacionesQuery)->where('estado', 'MANTENIMIENTO')->count();

        // Estadísticas de reservas
        $reservasHoy = (clone $reservasQuery)
            ->whereDate('fecha_entrada', Carbon::today())
            ->count();

        $reservasActivas = (clone $reservasQuery)
            ->where('estado', 'EN_PROCESO')
            ->count();

        $reservasPendientes = (clone $reservasQuery)
            ->where('estado', 'PENDIENTE')
            ->count();

        $reservasMes = (clone $reservasQuery)
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Ingresos
        $ingresosHoy = (clone $pagosQuery)
            ->whereDate('fecha', Carbon::today())
            ->sum('monto');

        $ingresosSemana = (clone $pagosQuery)
            ->whereBetween('fecha', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('monto');

        $ingresosMes = (clone $pagosQuery)
            ->whereMonth('fecha', Carbon::now()->month)
            ->whereYear('fecha', Carbon::now()->year)
            ->sum('monto');

        $ingresosAnio = (clone $pagosQuery)
            ->whereYear('fecha', Carbon::now()->year)
            ->sum('monto');

        // Huéspedes actuales
        $huespedesActuales = (clone $reservasQuery)
            ->where('estado', 'EN_PROCESO')
            ->sum('adultos');

        // Check-ins y check-outs de hoy
        $checkinsHoy = (clone $reservasQuery)
            ->whereDate('fecha_entrada', Carbon::today())
            ->where('estado', 'CONFIRMADA')
            ->count();

        $checkoutsHoy = (clone $reservasQuery)
            ->whereDate('fecha_salida', Carbon::today())
            ->where('estado', 'EN_PROCESO')
            ->count();

        // Tasa de ocupación
        $tasaOcupacion = $totalHabitaciones > 0
            ? round(($habitacionesOcupadas / $totalHabitaciones) * 100, 2)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'habitaciones' => [
                    'total' => $totalHabitaciones,
                    'disponibles' => $habitacionesDisponibles,
                    'ocupadas' => $habitacionesOcupadas,
                    'reservadas' => $habitacionesReservadas,
                    'mantenimiento' => $habitacionesMantenimiento,
                    'tasa_ocupacion' => $tasaOcupacion,
                ],
                'reservas' => [
                    'hoy' => $reservasHoy,
                    'activas' => $reservasActivas,
                    'pendientes' => $reservasPendientes,
                    'mes_actual' => $reservasMes,
                ],
                'ingresos' => [
                    'hoy' => $ingresosHoy,
                    'semana' => $ingresosSemana,
                    'mes' => $ingresosMes,
                    'anio' => $ingresosAnio,
                ],
                'operaciones' => [
                    'huespedes_actuales' => $huespedesActuales,
                    'checkins_hoy' => $checkinsHoy,
                    'checkouts_hoy' => $checkoutsHoy,
                ],
            ]
        ]);
    }

    /**
     * Gráfica de ingresos mensuales
     */
    public function ingresosMensuales(Request $request)
    {
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $anio = $request->input('anio', Carbon::now()->year);
        $idHotel = $request->input('id_hotel');

        $ingresosPorMes = [];

        for ($mes = 1; $mes <= 12; $mes++) {
            $query = Pago::whereMonth('fecha', $mes)
                ->whereYear('fecha', $anio);

            if ($idHotel) {
                $query->whereHas('reserva', function ($q) use ($idHotel) {
                    $q->where('id_hotel', $idHotel);
                });
            }

            $ingresosPorMes[] = [
                'mes' => $mes,
                'mes_nombre' => Carbon::create()->month($mes)->locale('es')->monthName,
                'total' => $query->sum('monto')
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $ingresosPorMes
        ]);
    }

    /**
     * Reservas próximas
     */
    public function reservasProximas(Request $request)
    {
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
            // Aseguramos que el input local también se actualice si usamos request->input después
        }

        $idHotel = $request->input('id_hotel');
        $dias = $request->input('dias', 7);

        $query = Reserva::with(['huesped', 'hotel', 'habitaciones'])
            ->where('estado', 'CONFIRMADA')
            ->whereBetween('fecha_entrada', [
                Carbon::today(),
                Carbon::today()->addDays($dias)
            ]);

        if ($idHotel) {
            $query->where('id_hotel', $idHotel);
        }

        $reservas = $query->orderBy('fecha_entrada', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $reservas
        ]);
    }

    /**
     * Habitaciones por estado
     */
    public function habitacionesPorEstado(Request $request)
    {
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $idHotel = $request->input('id_hotel');

        $query = Habitacion::select('estado', \DB::raw('count(*) as total'))
            ->groupBy('estado');

        if ($idHotel) {
            $query->where('id_hotel', $idHotel);
        }

        $estadisticas = $query->get();

        return response()->json([
            'success' => true,
            'data' => $estadisticas
        ]);
    }

    /**
     * Top servicios más consumidos
     */
    public function topServicios(Request $request)
    {
        $user = $request->user();
        if ($user->rol && !in_array($user->rol->nombre, ['Administrador', 'Gerente'])) {
            $request->merge(['id_hotel' => $user->id_hotel]);
        }

        $idHotel = $request->input('id_hotel');
        $limite = $request->input('limite', 10);

        $query = \DB::table('consumos')
            ->join('servicios', 'consumos.id_servicio', '=', 'servicios.id')
            ->select(
                'servicios.nombre',
                \DB::raw('COUNT(consumos.id) as total_consumos'),
                \DB::raw('SUM(consumos.subtotal) as total_ingresos')
            )
            ->groupBy('servicios.id', 'servicios.nombre')
            ->orderBy('total_consumos', 'desc')
            ->limit($limite);

        if ($idHotel) {
            $query->join('reservas', 'consumos.id_reserva', '=', 'reservas.id')
                ->where('reservas.id_hotel', $idHotel);
        }

        $servicios = $query->get();

        return response()->json([
            'success' => true,
            'data' => $servicios
        ]);
    }
}

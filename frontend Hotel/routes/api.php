<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\PisoController;
use App\Http\Controllers\Api\TipoHabitacionController;
use App\Http\Controllers\Api\HabitacionController;
use App\Http\Controllers\Api\HuespedController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\ConsumoController;
use App\Http\Controllers\Api\PagoController;
use App\Http\Controllers\Api\EmpleadoController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\PermisoController;
use App\Http\Controllers\Api\MantenimientoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\LogHistorialController;
use App\Http\Controllers\Api\AuditoriaController;

/*
|--------------------------------------------------------------------------
| API Routes - Sistema Hotelero
|--------------------------------------------------------------------------
| Todas las rutas API del sistema hotelero
| Base URL: /api
*/

// =====================================================
// RUTAS PÚBLICAS (Sin autenticación)
// =====================================================

// Ruta de prueba
Route::get('/test', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbStatus = 'Conexión a base de datos exitosa';
    } catch (\Exception $e) {
        $dbStatus = 'Error de conexión a base de datos: ' . $e->getMessage();
    }

    return response()->json([
        'success' => true,
        'message' => 'API Sistema Hotelero funcionando correctamente',
        'db_status' => $dbStatus,
        'version' => '1.0.0',
        'timestamp' => now()
    ]);
});

// Autenticación - Login
Route::post('/auth/login', [AuthController::class, 'login']);

// =====================================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// =====================================================

Route::middleware('auth:sanctum')->group(function () {

    // =================================================
    // AUTENTICACIÓN
    // =================================================
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/cambiar-password', [AuthController::class, 'cambiarPassword']);
        Route::post('/verificar-permiso', [AuthController::class, 'verificarPermiso']);
    });

    // =================================================
    // HOTELES
    // =================================================
    Route::apiResource('hoteles', HotelController::class);
    Route::get('hoteles/{id}/dashboard', [HotelController::class, 'dashboard']);

    // =================================================
    // PISOS
    // =================================================
    Route::apiResource('pisos', PisoController::class);

    // =================================================
    // TIPOS DE HABITACIONES
    // =================================================
    Route::apiResource('tipo-habitaciones', TipoHabitacionController::class);

    // =================================================
    // HABITACIONES
    // =================================================
    Route::apiResource('habitaciones', HabitacionController::class);
    Route::get('habitaciones-disponibles', [HabitacionController::class, 'disponibles']);
    Route::post('habitaciones/{id}/cambiar-estado', [HabitacionController::class, 'cambiarEstado']);

    // =================================================
    // HUÉSPEDES
    // =================================================
    Route::apiResource('huespedes', HuespedController::class);
    Route::post('huespedes/buscar-ci', [HuespedController::class, 'buscarPorCi']);

    // =================================================
    // RESERVAS (Módulo más importante)
    // =================================================
    Route::apiResource('reservas', ReservaController::class);
    Route::post('reservas/{id}/confirmar', [ReservaController::class, 'confirmar']);
    Route::post('reservas/{id}/checkin', [ReservaController::class, 'checkIn']);
    Route::post('reservas/{id}/checkout', [ReservaController::class, 'checkOut']);

    // =================================================
    // SERVICIOS
    // =================================================
    Route::apiResource('servicios', ServicioController::class);
    Route::post('servicios/{id}/calcular-precio', [ServicioController::class, 'calcularPrecio']);

    // =================================================
    // CONSUMOS
    // =================================================
    Route::apiResource('consumos', ConsumoController::class);
    Route::get('consumos/reserva/{id}', [ConsumoController::class, 'porReserva']);

    // =================================================
    // PAGOS
    // =================================================
    Route::apiResource('pagos', PagoController::class);
    Route::post('pagos/{id}/anular', [PagoController::class, 'anular']);
    Route::get('pagos/reserva/{id}', [PagoController::class, 'porReserva']);

    // =================================================
    // EMPLEADOS
    // =================================================
    Route::apiResource('empleados', EmpleadoController::class);
    Route::get('empleados/{id}/permisos', [EmpleadoController::class, 'permisos']);

    // =================================================
    // ROLES Y PERMISOS
    // =================================================
    Route::apiResource('roles', RolController::class);
    Route::post('roles/{id}/asignar-permisos', [RolController::class, 'asignarPermisos']);
    Route::apiResource('permisos', PermisoController::class)->only(['index', 'show']);

    // =================================================
    // MANTENIMIENTOS
    // =================================================
    Route::apiResource('mantenimientos', MantenimientoController::class);
    Route::post('mantenimientos/{id}/completar', [MantenimientoController::class, 'completar']);

    // =================================================
    // DASHBOARD
    // =================================================
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/ingresos-mensuales', [DashboardController::class, 'ingresosMensuales']);
        Route::get('/reservas-proximas', [DashboardController::class, 'reservasProximas']);
        Route::get('/habitaciones-estado', [DashboardController::class, 'habitacionesPorEstado']);
        Route::get('/top-servicios', [DashboardController::class, 'topServicios']);
    });

    // =================================================
    // REPORTES
    // =================================================
    Route::prefix('reportes')->group(function () {
        Route::get('/reservas', [ReporteController::class, 'reservas']);
        Route::get('/ingresos', [ReporteController::class, 'ingresos']);
        Route::get('/ocupacion', [ReporteController::class, 'ocupacion']);
        Route::get('/consumos', [ReporteController::class, 'consumos']);
        Route::get('/consolidado', [ReporteController::class, 'consolidado']);
    });

    // =================================================
    // AUDITORÍA (LOGS)
    // =================================================
    Route::apiResource('logs', LogHistorialController::class)->only(['index', 'show']);
    Route::middleware('permission:ver_auditoria')->group(function () {
        Route::get('/auditoria', [AuditoriaController::class, 'index']);
    });

    // =================================================
    // SOLICITUDES DE AUTORIZACIÓN
    // =================================================
    Route::get('solicitudes-autorizacion', [\App\Http\Controllers\Api\SolicitudAutorizacionController::class, 'index']);
    Route::post('solicitudes-autorizacion', [\App\Http\Controllers\Api\SolicitudAutorizacionController::class, 'store']);

    Route::middleware('permission:gestionar_huespedes')->group(function () {
        Route::post('solicitudes-autorizacion/{id}/aprobar', [\App\Http\Controllers\Api\SolicitudAutorizacionController::class, 'aprobar']);
        Route::post('solicitudes-autorizacion/{id}/rechazar', [\App\Http\Controllers\Api\SolicitudAutorizacionController::class, 'rechazar']);
    });

});

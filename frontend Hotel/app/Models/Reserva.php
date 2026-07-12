<?php
// app/Models/Reserva.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use App\Traits\Auditable;

class Reserva extends Model
{
    use HasFactory, Auditable;

    protected $table = 'reservas';

    protected $fillable = [
        'id_huesped',
        'id_hotel',
        'fecha_entrada',
        'fecha_salida',
        'adultos',
        'ninos',
        'estado',
        'total',
    ];

    protected $casts = [
        'fecha_entrada' => 'date',
        'fecha_salida' => 'date',
        'adultos' => 'integer',
        'ninos' => 'integer',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function huesped()
    {
        return $this->belongsTo(Huesped::class, 'id_huesped');
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function huespedesAdicionales()
    {
        return $this->belongsToMany(
            Huesped::class,
            'huespedes_reserva',
            'id_reserva',
            'id_huesped'
        );
    }

    public function habitaciones()
    {
        return $this->belongsToMany(
            Habitacion::class,
            'reserva_habitaciones',
            'id_reserva',
            'id_habitacion'
        )->withPivot('precio_por_noche', 'noches', 'total');
    }

    public function reservaHabitaciones()
    {
        return $this->hasMany(ReservaHabitacion::class, 'id_reserva');
    }

    // Relación singular para obtener la primera habitación (útil para vistas)
    public function habitacion()
    {
        return $this->belongsToMany(
            Habitacion::class,
            'reserva_habitaciones',
            'id_reserva',
            'id_habitacion'
        )->withPivot('precio_por_noche', 'noches', 'total')->limit(1);
    }

    public function consumos()
    {
        return $this->hasMany(Consumo::class, 'id_reserva');
    }

    public function pagos()
    {
        return $this->hasMany(Pago::class, 'id_reserva');
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', 'PENDIENTE');
    }

    public function scopeConfirmadas($query)
    {
        return $query->where('estado', 'CONFIRMADA');
    }

    public function scopeEnProceso($query)
    {
        return $query->where('estado', 'EN_PROCESO');
    }

    public function scopePorHotel($query, $hotelId)
    {
        return $query->where('id_hotel', $hotelId);
    }

    public function scopeEntreFechas($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha_entrada', [$inicio, $fin])
            ->orWhereBetween('fecha_salida', [$inicio, $fin]);
    }

    // Métodos auxiliares
    public function calcularNoches()
    {
        return Carbon::parse($this->fecha_entrada)
            ->diffInDays(Carbon::parse($this->fecha_salida));
    }

    public function calcularTotalHabitaciones()
    {
        return $this->reservaHabitaciones()->sum('total');
    }

    public function calcularTotalConsumos()
    {
        return $this->consumos()->sum('subtotal');
    }

    public function calcularTotalPagos()
    {
        return $this->pagos()->where('estado', 'ACTIVO')->sum('monto');
    }

    public function calcularSaldo()
    {
        return $this->total - $this->calcularTotalPagos();
    }

    public function recalcularTotal()
    {
        $totalHabitaciones = $this->calcularTotalHabitaciones();
        $totalConsumos = $this->calcularTotalConsumos();

        $this->total = $totalHabitaciones + $totalConsumos;
        $this->save();

        return $this->total;
    }

    public function confirmar()
    {
        $this->estado = 'CONFIRMADA';
        $this->save();

        // Cambiar estado de habitaciones a RESERVADA
        foreach ($this->habitaciones as $habitacion) {
            $habitacion->cambiarEstado('RESERVADA');
        }

        return true;
    }

    public function realizarCheckIn()
    {
        $this->estado = 'EN_PROCESO';
        $this->save();

        // Cambiar estado de habitaciones a OCUPADA
        foreach ($this->habitaciones as $habitacion) {
            $habitacion->cambiarEstado('OCUPADA');
        }

        return true;
    }

    public function realizarCheckOut()
    {
        $this->estado = 'COMPLETADA';
        $this->save();

        // Cambiar estado de habitaciones a DISPONIBLE
        foreach ($this->habitaciones as $habitacion) {
            $habitacion->cambiarEstado('DISPONIBLE');
        }

        return true;
    }

    public function cancelar()
    {
        $this->estado = 'CANCELADA';
        $this->save();

        // Liberar habitaciones
        foreach ($this->habitaciones as $habitacion) {
            if ($habitacion->estado === 'RESERVADA') {
                $habitacion->cambiarEstado('DISPONIBLE');
            }
        }

        return true;
    }
}
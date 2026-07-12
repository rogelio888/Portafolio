<?php
// app/Models/ReservaHabitacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservaHabitacion extends Model
{
    use HasFactory;

    protected $table = 'reserva_habitaciones';
    
    public $timestamps = false;

    protected $fillable = [
        'id_reserva',
        'id_habitacion',
        'precio_por_noche',
        'noches',
        'total',
    ];

    protected $casts = [
        'precio_por_noche' => 'decimal:2',
        'noches' => 'integer',
        'total' => 'decimal:2',
    ];

    // Relaciones
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva');
    }

    public function habitacion()
    {
        return $this->belongsTo(Habitacion::class, 'id_habitacion');
    }

    // Métodos auxiliares
    public function calcularTotal()
    {
        $this->total = $this->precio_por_noche * $this->noches;
        return $this->total;
    }
}
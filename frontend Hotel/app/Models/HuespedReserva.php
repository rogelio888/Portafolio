<?php
// app/Models/HuespedReserva.php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class HuespedReserva extends Pivot
{
    protected $table = 'huespedes_reserva';
    
    public $timestamps = false;

    protected $fillable = [
        'id_reserva',
        'id_huesped',
    ];

    // Relaciones
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva');
    }

    public function huesped()
    {
        return $this->belongsTo(Huesped::class, 'id_huesped');
    }
}
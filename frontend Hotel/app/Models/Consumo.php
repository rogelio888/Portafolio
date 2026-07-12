<?php
// app/Models/Consumo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Consumo extends Model
{
    use HasFactory, Auditable;

    protected $table = 'consumos';

    protected $fillable = [
        'id_reserva',
        'id_servicio',
        'cantidad',
        'fecha',
        'subtotal',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'fecha' => 'date',
        'subtotal' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio');
    }

    // Scopes
    public function scopePorReserva($query, $reservaId)
    {
        return $query->where('id_reserva', $reservaId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha', $fecha);
    }

    // Métodos auxiliares
    public function calcularSubtotal()
    {
        $this->subtotal = $this->servicio->precio * $this->cantidad;
        return $this->subtotal;
    }
}
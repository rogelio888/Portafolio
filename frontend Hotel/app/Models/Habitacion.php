<?php
// app/Models/Habitacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Habitacion extends Model
{
    use HasFactory, Auditable;

    protected $table = 'habitaciones';

    protected $fillable = [
        'id_hotel',
        'id_piso',
        'id_tipo',
        'numero',
        'estado',
        'descripcion',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function piso()
    {
        return $this->belongsTo(Piso::class, 'id_piso');
    }

    public function tipo()
    {
        return $this->belongsTo(TipoHabitacion::class, 'id_tipo');
    }

    public function reservaHabitaciones()
    {
        return $this->hasMany(ReservaHabitacion::class, 'id_habitacion');
    }

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'id_habitacion');
    }

    // Scopes
    public function scopeDisponibles($query)
    {
        return $query->where('estado', 'DISPONIBLE');
    }

    public function scopeOcupadas($query)
    {
        return $query->where('estado', 'OCUPADA');
    }

    public function scopeReservadas($query)
    {
        return $query->where('estado', 'RESERVADA');
    }

    public function scopePorHotel($query, $hotelId)
    {
        return $query->where('id_hotel', $hotelId);
    }

    // Métodos auxiliares
    public function estaDisponible()
    {
        return $this->estado === 'DISPONIBLE';
    }

    public function cambiarEstado($nuevoEstado)
    {
        $this->estado = $nuevoEstado;
        return $this->save();
    }

    public function getPrecio()
    {
        return $this->tipo->precio_base;
    }
}
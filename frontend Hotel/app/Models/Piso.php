<?php
// app/Models/Piso.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Piso extends Model
{
    use HasFactory, Auditable;

    protected $table = 'pisos';

    protected $fillable = [
        'id_hotel',
        'numero',
        'estado',
    ];

    protected $casts = [
        'numero' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    public function habitaciones()
    {
        return $this->hasMany(Habitacion::class, 'id_piso');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Métodos auxiliares
    public function totalHabitaciones()
    {
        return $this->habitaciones()->count();
    }
}
<?php
// app/Models/TipoHabitacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class TipoHabitacion extends Model
{
    use HasFactory, Auditable;

    protected $table = 'tipo_habitaciones';

    protected $fillable = [
        'nombre',
        'descripcion',
        'capacidad',
        'precio_base',
        'estado',
    ];

    protected $casts = [
        'capacidad' => 'integer',
        'precio_base' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function habitaciones()
    {
        return $this->hasMany(Habitacion::class, 'id_tipo');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Métodos auxiliares
    public function precioFormateado()
    {
        return 'Bs. ' . number_format($this->precio_base, 2);
    }
}
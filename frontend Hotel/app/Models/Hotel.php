<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Hotel extends Model
{
    use HasFactory, Auditable;

    protected $table = 'hoteles';

    protected $fillable = [
        'nombre',
        'direccion',
        'ciudad',
        'estado',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function pisos()
    {
        return $this->hasMany(Piso::class, 'id_hotel');
    }

    public function habitaciones()
    {
        return $this->hasMany(Habitacion::class, 'id_hotel');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'id_hotel');
    }

    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'id_hotel');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    // Métodos auxiliares
    public function habitacionesDisponibles()
    {
        return $this->habitaciones()->where('estado', 'DISPONIBLE')->count();
    }

    public function habitacionesOcupadas()
    {
        return $this->habitaciones()->where('estado', 'OCUPADA')->count();
    }
}
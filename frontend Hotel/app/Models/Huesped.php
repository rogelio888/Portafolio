<?php
// app/Models/Huesped.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Huesped extends Model
{
    use HasFactory, Auditable;

    protected $table = 'huespedes';

    protected $fillable = [
        'nombre',
        'apellido',
        'ci',
        'telefono',
        'email',
        'estado',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function reservasPrincipales()
    {
        return $this->hasMany(Reserva::class, 'id_huesped');
    }

    public function reservasAdicionales()
    {
        return $this->belongsToMany(
            Reserva::class,
            'huespedes_reserva',
            'id_huesped',
            'id_reserva'
        );
    }

    // Todas las reservas (principal + adicionales)
    public function todasReservas()
    {
        return $this->reservasPrincipales->merge($this->reservasAdicionales);
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('nombre', 'like', "%{$termino}%")
                ->orWhere('apellido', 'like', "%{$termino}%")
                ->orWhere('ci', 'like', "%{$termino}%")
                ->orWhere('email', 'like', "%{$termino}%");
        });
    }

    // Métodos auxiliares
    public function getNombreCompleto()
    {
        return "{$this->nombre} {$this->apellido}";
    }

    public function totalReservas()
    {
        return $this->reservasPrincipales()->count();
    }
}
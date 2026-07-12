<?php
// app/Models/Empleado.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Auditable;

class Empleado extends Authenticatable
{
    use HasFactory, HasApiTokens, Auditable;

    protected $table = 'empleados';

    protected $fillable = [
        'id_rol',
        'id_hotel',
        'nombre',
        'apellido',
        'usuario',
        'password',
        'estado',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class, 'id_hotel');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopePorHotel($query, $hotelId)
    {
        return $query->where('id_hotel', $hotelId);
    }

    // Métodos auxiliares
    public function getNombreCompleto()
    {
        return "{$this->nombre} {$this->apellido}";
    }

    public function tienePermiso($permisoNombre)
    {
        return $this->rol->tienePermiso($permisoNombre);
    }

    public function esAdministrador()
    {
        return $this->rol->nombre === 'Administrador';
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }
}
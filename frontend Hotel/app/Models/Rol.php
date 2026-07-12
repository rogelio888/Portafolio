<?php
// app/Models/Rol.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Rol extends Model
{
    use HasFactory, Auditable;

    protected $table = 'roles';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    // Relaciones
    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'id_rol');
    }

    public function permisos()
    {
        return $this->belongsToMany(
            Permiso::class,
            'rol_permiso',
            'id_rol',
            'id_permiso'
        );
    }

    // Métodos auxiliares
    public function tienePermiso($permisoNombre)
    {
        return $this->permisos()->where('nombre', $permisoNombre)->exists();
    }

    public function asignarPermiso($permisoId)
    {
        if (!$this->permisos()->where('id_permiso', $permisoId)->exists()) {
            $this->permisos()->attach($permisoId);
        }
    }

    public function removerPermiso($permisoId)
    {
        $this->permisos()->detach($permisoId);
    }
}
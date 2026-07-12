<?php
// app/Models/Permiso.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Permiso extends Model
{
    use HasFactory, Auditable;

    protected $table = 'permisos';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    // Relaciones
    public function roles()
    {
        return $this->belongsToMany(
            Rol::class,
            'rol_permiso',
            'id_permiso',
            'id_rol'
        );
    }
}
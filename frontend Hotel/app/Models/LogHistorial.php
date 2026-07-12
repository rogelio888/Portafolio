<?php
// app/Models/LogHistorial.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogHistorial extends Model
{
    use HasFactory;

    protected $table = 'logs_historial';
    
    public $timestamps = false;

    protected $fillable = [
        'tabla',
        'id_registro',
        'accion',
        'usuario',
        'descripcion',
        'fecha',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    // Relaciones
    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'usuario');
    }

    // Scopes
    public function scopePorTabla($query, $tabla)
    {
        return $query->where('tabla', $tabla);
    }

    public function scopePorUsuario($query, $usuarioId)
    {
        return $query->where('usuario', $usuarioId);
    }

    public function scopePorAccion($query, $accion)
    {
        return $query->where('accion', $accion);
    }

    public function scopeEntreFechas($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha', [$inicio, $fin]);
    }

    // Método estático para registrar log
    public static function registrar($tabla, $idRegistro, $accion, $usuarioId, $descripcion = null)
    {
        return self::create([
            'tabla' => $tabla,
            'id_registro' => $idRegistro,
            'accion' => $accion,
            'usuario' => $usuarioId,
            'descripcion' => $descripcion,
            'fecha' => now(),
        ]);
    }
}
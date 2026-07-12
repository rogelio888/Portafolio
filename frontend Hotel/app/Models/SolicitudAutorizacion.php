<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SolicitudAutorizacion extends Model
{
    use HasFactory;

    protected $table = 'solicitudes_autorizacion';

    protected $fillable = [
        'solicitante_id',
        'autorizador_id',
        'tipo',
        'modelo',
        'modelo_id',
        'motivo',
        'datos_nuevos',
        'estado',
        'comentario_autorizador',
        'fecha_respuesta',
        'used_at',
    ];

    protected $casts = [
        'datos_nuevos' => 'array',
        'fecha_respuesta' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function solicitante()
    {
        return $this->belongsTo(Empleado::class, 'solicitante_id');
    }

    public function autorizador()
    {
        return $this->belongsTo(Empleado::class, 'autorizador_id');
    }
}

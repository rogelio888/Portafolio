<?php
// app/Models/Mantenimiento.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Mantenimiento extends Model
{
    use HasFactory, Auditable;

    protected $table = 'mantenimientos';

    public $timestamps = false;

    protected $fillable = [
        'id_habitacion',
        'descripcion',
        'fecha',
        'costo',
    ];

    protected $casts = [
        'fecha' => 'date',
        'costo' => 'decimal:2',
    ];

    // Relaciones
    public function habitacion()
    {
        return $this->belongsTo(Habitacion::class, 'id_habitacion');
    }

    // Scopes
    public function scopePorHabitacion($query, $habitacionId)
    {
        return $query->where('id_habitacion', $habitacionId);
    }

    public function scopeEntreFechas($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha', [$inicio, $fin]);
    }

    // Métodos auxiliares
    public function costoFormateado()
    {
        return 'Bs. ' . number_format($this->costo, 2);
    }
}
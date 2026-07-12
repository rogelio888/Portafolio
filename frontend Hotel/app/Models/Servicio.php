<?php
// app/Models/Servicio.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Servicio extends Model
{
    use HasFactory, Auditable;

    protected $table = 'servicios';

    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo',
        'frecuencia',
        'precio',
        'estado',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function consumos()
    {
        return $this->hasMany(Consumo::class, 'id_servicio');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopePorFrecuencia($query, $frecuencia)
    {
        return $query->where('frecuencia', $frecuencia);
    }

    // Métodos auxiliares
    public function esDiario()
    {
        return $this->frecuencia === 'DIARIO';
    }

    public function esPorPersona()
    {
        return $this->tipo === 'PERSONA';
    }

    public function calcularPrecio($cantidad, $dias = 1, $personas = 1)
    {
        $precio = $this->precio * $cantidad;

        if ($this->esDiario()) {
            $precio *= $dias;
        }

        if ($this->esPorPersona()) {
            $precio *= $personas;
        }

        return $precio;
    }
}
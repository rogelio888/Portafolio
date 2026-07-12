<?php
// app/Models/Pago.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Pago extends Model
{
    use HasFactory, Auditable;

    protected $table = 'pagos';

    protected $fillable = [
        'id_reserva',
        'tipo_pago',
        'monto',
        'fecha',
        'estado',
        'motivo_anulacion',
        'fecha_anulacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha' => 'datetime',
        'fecha_anulacion' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reserva');
    }

    // Scopes
    public function scopePorReserva($query, $reservaId)
    {
        return $query->where('id_reserva', $reservaId);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_pago', $tipo);
    }

    public function scopeEntreFechas($query, $inicio, $fin)
    {
        return $query->whereBetween('fecha', [$inicio, $fin]);
    }

    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeAnulados($query)
    {
        return $query->where('estado', 'ANULADO');
    }

    // Métodos auxiliares
    public function montoFormateado()
    {
        return 'Bs. ' . number_format($this->monto, 2);
    }

    public function anular($motivo)
    {
        $this->estado = 'ANULADO';
        $this->motivo_anulacion = $motivo;
        $this->fecha_anulacion = now();
        $this->save();

        return $this;
    }

    public function estaActivo()
    {
        return $this->estado === 'ACTIVO';
    }

    public function estaAnulado()
    {
        return $this->estado === 'ANULADO';
    }
}
<?php

namespace App\Traits;

use App\Models\Auditoria;
use Illuminate\Support\Facades\Auth;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            self::audit('CREATE', $model);
        });

        static::updated(function ($model) {
            self::audit('UPDATE', $model);
        });

        static::deleted(function ($model) {
            self::audit('DELETE', $model);
        });
    }

    protected static function audit($accion, $model)
    {
        // Obtener el usuario autenticado (compatible con Sanctum)
        $user = request()->user();
        $userId = $user ? $user->id : null;

        $valoresAntiguos = null;
        $valoresNuevos = null;

        if ($accion === 'UPDATE') {
            $valoresAntiguos = $model->getOriginal();
            $valoresNuevos = $model->getChanges();
        } elseif ($accion === 'CREATE') {
            $valoresNuevos = $model->toArray();
        } elseif ($accion === 'DELETE') {
            $valoresAntiguos = $model->toArray();
        }

        Auditoria::create([
            'user_id' => $userId,
            'accion' => $accion,
            'modelo' => get_class($model),
            'modelo_id' => $model->id,
            'valores_antiguos' => $valoresAntiguos,
            'valores_nuevos' => $valoresNuevos,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}

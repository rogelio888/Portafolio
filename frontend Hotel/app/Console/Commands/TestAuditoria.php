<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Servicio;
use App\Models\Auditoria;

class TestAuditoria extends Command
{
    protected $signature = 'test:auditoria';
    protected $description = 'Prueba el sistema de auditoría';

    public function handle()
    {
        $this->info('=== PRUEBA DE AUDITORÍA ===');
        $this->newLine();

        // Test 1: CREATE
        $this->info('1. Creando servicio...');
        $servicio = Servicio::create([
            'nombre' => 'Test Auditoría',
            'descripcion' => 'Prueba de auditoría',
            'tipo' => 'HABITACION',
            'frecuencia' => 'UNICO',
            'precio' => 100,
            'estado' => 'ACTIVO'
        ]);
        $this->line("   Servicio creado: ID {$servicio->id}");

        $auditCreate = Auditoria::where('modelo', 'App\\Models\\Servicio')
            ->where('modelo_id', $servicio->id)
            ->where('accion', 'CREATE')
            ->latest()
            ->first();

        if ($auditCreate) {
            $this->line("   <fg=green>✓</> Auditoría CREATE registrada");
            $this->line("   - IP: {$auditCreate->ip_address}");
        } else {
            $this->line("   <fg=red>✗</> NO se registró auditoría CREATE");
        }

        $this->newLine();

        // Test 2: UPDATE
        $this->info('2. Actualizando servicio...');
        $servicio->update(['precio' => 150]);
        $this->line("   Precio actualizado: 100 -> 150");

        $auditUpdate = Auditoria::where('modelo', 'App\\Models\\Servicio')
            ->where('modelo_id', $servicio->id)
            ->where('accion', 'UPDATE')
            ->latest()
            ->first();

        if ($auditUpdate) {
            $this->line("   <fg=green>✓</> Auditoría UPDATE registrada");
            $this->line("   - Precio antiguo: " . $auditUpdate->valores_antiguos['precio']);
            $this->line("   - Precio nuevo: " . $auditUpdate->valores_nuevos['precio']);
        } else {
            $this->line("   <fg=red>✗</> NO se registró auditoría UPDATE");
        }

        $this->newLine();

        // Test 3: DELETE
        $this->info('3. Eliminando servicio...');
        $servicioId = $servicio->id;
        $servicio->delete();
        $this->line("   Servicio eliminado");

        $auditDelete = Auditoria::where('modelo', 'App\\Models\\Servicio')
            ->where('modelo_id', $servicioId)
            ->where('accion', 'DELETE')
            ->latest()
            ->first();

        if ($auditDelete) {
            $this->line("   <fg=green>✓</> Auditoría DELETE registrada");
        } else {
            $this->line("   <fg=red>✗</> NO se registró auditoría DELETE");
        }

        $this->newLine();

        // Resumen
        $this->info('=== RESUMEN ===');
        $totalAudits = Auditoria::where('modelo', 'App\\Models\\Servicio')
            ->where('modelo_id', $servicioId)
            ->count();
        $this->line("Total de auditorías registradas: {$totalAudits}/3");

        if ($totalAudits === 3) {
            $this->line("<fg=green>✓ TODAS LAS OPERACIONES FUERON AUDITADAS CORRECTAMENTE</>");
            return 0;
        } else {
            $this->line("<fg=red>✗ FALTAN AUDITORÍAS</>");
            return 1;
        }
    }
}

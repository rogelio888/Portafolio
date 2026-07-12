<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermisosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Permisos del sistema
        $permisos = [
            ['nombre' => 'gestionar_habitaciones', 'descripcion' => 'Crear, editar y eliminar habitaciones'],
            ['nombre' => 'gestionar_huespedes', 'descripcion' => 'Editar y eliminar huéspedes'],
            ['nombre' => 'gestionar_reservas', 'descripcion' => 'Gestionar reservas'],
            ['nombre' => 'gestionar_pagos', 'descripcion' => 'Registrar pagos'],
            ['nombre' => 'anular_pagos', 'descripcion' => 'Anular pagos registrados'],
            ['nombre' => 'gestionar_empleados', 'descripcion' => 'Gestionar empleados del sistema'],
            ['nombre' => 'gestionar_roles', 'descripcion' => 'Gestionar roles y permisos'],
            ['nombre' => 'gestionar_hoteles', 'descripcion' => 'Gestionar hoteles'],
            ['nombre' => 'gestionar_pisos', 'descripcion' => 'Gestionar pisos'],
            ['nombre' => 'gestionar_tipos_habitacion', 'descripcion' => 'Gestionar tipos de habitación'],
            ['nombre' => 'gestionar_servicios', 'descripcion' => 'Gestionar servicios'],
            ['nombre' => 'gestionar_mantenimientos', 'descripcion' => 'Gestionar mantenimientos'],
            ['nombre' => 'gestionar_consumos', 'descripcion' => 'Gestionar consumos'],
            ['nombre' => 'ver_reportes', 'descripcion' => 'Acceso a reportes'],
            ['nombre' => 'ver_auditoria', 'descripcion' => 'Ver auditoría del sistema'],
        ];

        foreach ($permisos as $permiso) {
            DB::table('permisos')->updateOrInsert(
                ['nombre' => $permiso['nombre']],
                $permiso
            );
        }

        // Limpiar permisos anteriores de roles
        DB::table('rol_permiso')->whereIn('id_rol', function ($query) {
            $query->select('id')
                ->from('roles')
                ->whereIn('nombre', ['Recepcionista', 'Gerente']);
        })->delete();

        // RECEPCIONISTA: Solo gestionar reservas y pagos
        $recepcionistaPermisos = ['gestionar_reservas', 'gestionar_pagos', 'ver_reportes'];
        $this->asignarPermisosARol('Recepcionista', $recepcionistaPermisos);

        // GERENTE: Todos EXCEPTO ver auditoría y gestionar roles
        $gerentePermisos = [
            'gestionar_habitaciones',
            'gestionar_huespedes',
            'gestionar_reservas',
            'gestionar_pagos',
            'anular_pagos',
            'gestionar_empleados',
            'gestionar_hoteles',
            'gestionar_pisos',
            'gestionar_tipos_habitacion',
            'gestionar_servicios',
            'gestionar_mantenimientos',
            'gestionar_consumos',
            'ver_reportes',
        ];
        $this->asignarPermisosARol('Gerente', $gerentePermisos);

        $this->command->info('Permisos creados y asignados correctamente');
    }

    private function asignarPermisosARol($rolNombre, $permisos)
    {
        $rol = DB::table('roles')->where('nombre', $rolNombre)->first();

        if (!$rol) {
            $this->command->warn("Rol '{$rolNombre}' no encontrado");
            return;
        }

        foreach ($permisos as $permisoNombre) {
            $permiso = DB::table('permisos')->where('nombre', $permisoNombre)->first();

            if ($permiso) {
                DB::table('rol_permiso')->insert([
                    'id_rol' => $rol->id,
                    'id_permiso' => $permiso->id,
                ]);
            }
        }
    }
}

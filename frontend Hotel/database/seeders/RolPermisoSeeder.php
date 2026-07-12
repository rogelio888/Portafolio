<?php
// database/seeders/RolPermisoSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolPermisoSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener IDs de roles
        $adminId = DB::table('roles')->where('nombre', 'Administrador')->value('id');
        $gerenteId = DB::table('roles')->where('nombre', 'Gerente')->value('id');
        $recepcionistaId = DB::table('roles')->where('nombre', 'Recepcionista')->value('id');
        $empleadoId = DB::table('roles')->where('nombre', 'Empleado')->value('id');

        // Obtener TODOS los permisos
        $todosPermisos = DB::table('permisos')->pluck('id')->toArray();

        // ADMINISTRADOR: Todos los permisos
        foreach ($todosPermisos as $permisoId) {
            DB::table('rol_permiso')->insert([
                'id_rol' => $adminId,
                'id_permiso' => $permisoId,
            ]);
        }

        // GERENTE: Permisos de gestión operativa (sin crear/eliminar hoteles ni empleados)
        $permisosGerente = [
            'ver_hoteles',
            'ver_pisos',
            'crear_pisos',
            'editar_pisos',
            'ver_tipos_habitaciones',
            'ver_habitaciones',
            'crear_habitaciones',
            'editar_habitaciones',
            'cambiar_estado_habitaciones',
            'ver_huespedes',
            'crear_huespedes',
            'editar_huespedes',
            'ver_reservas',
            'crear_reservas',
            'editar_reservas',
            'cancelar_reservas',
            'checkin',
            'checkout',
            'ver_servicios',
            'ver_consumos',
            'registrar_consumos',
            'ver_pagos',
            'registrar_pagos',
            'ver_empleados',
            'ver_mantenimientos',
            'crear_mantenimientos',
            'editar_mantenimientos',
            'ver_dashboard',
            'ver_reportes',
            'exportar_reportes',
        ];

        foreach ($permisosGerente as $permisoNombre) {
            $permisoId = DB::table('permisos')->where('nombre', $permisoNombre)->value('id');
            if ($permisoId) {
                DB::table('rol_permiso')->insert([
                    'id_rol' => $gerenteId,
                    'id_permiso' => $permisoId,
                ]);
            }
        }

        // RECEPCIONISTA: Permisos básicos de reservas y atención
        $permisosRecepcionista = [
            'ver_hoteles',
            'ver_pisos',
            'ver_tipos_habitaciones',
            'ver_habitaciones',
            'ver_huespedes',
            'crear_huespedes',
            'editar_huespedes',
            'ver_reservas',
            'crear_reservas',
            'editar_reservas',
            'checkin',
            'checkout',
            'ver_servicios',
            'ver_consumos',
            'registrar_consumos',
            'ver_pagos',
            'registrar_pagos',
            'ver_dashboard',
        ];

        foreach ($permisosRecepcionista as $permisoNombre) {
            $permisoId = DB::table('permisos')->where('nombre', $permisoNombre)->value('id');
            if ($permisoId) {
                DB::table('rol_permiso')->insert([
                    'id_rol' => $recepcionistaId,
                    'id_permiso' => $permisoId,
                ]);
            }
        }

        // EMPLEADO: Permisos de solo lectura
        $permisosEmpleado = [
            'ver_hoteles',
            'ver_habitaciones',
            'ver_reservas',
            'ver_dashboard',
        ];

        foreach ($permisosEmpleado as $permisoNombre) {
            $permisoId = DB::table('permisos')->where('nombre', $permisoNombre)->value('id');
            if ($permisoId) {
                DB::table('rol_permiso')->insert([
                    'id_rol' => $empleadoId,
                    'id_permiso' => $permisoId,
                ]);
            }
        }
    }
}
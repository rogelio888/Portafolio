<?php
// database/seeders/PermisoSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermisoSeeder extends Seeder
{
    public function run(): void
    {
        $permisos = [
            // HOTELES
            ['nombre' => 'ver_hoteles', 'descripcion' => 'Ver listado de hoteles'],
            ['nombre' => 'crear_hoteles', 'descripcion' => 'Crear nuevos hoteles'],
            ['nombre' => 'editar_hoteles', 'descripcion' => 'Editar información de hoteles'],
            ['nombre' => 'eliminar_hoteles', 'descripcion' => 'Eliminar hoteles'],

            // PISOS
            ['nombre' => 'ver_pisos', 'descripcion' => 'Ver pisos de hoteles'],
            ['nombre' => 'crear_pisos', 'descripcion' => 'Crear pisos'],
            ['nombre' => 'editar_pisos', 'descripcion' => 'Editar pisos'],
            ['nombre' => 'eliminar_pisos', 'descripcion' => 'Eliminar pisos'],

            // TIPOS DE HABITACIONES
            ['nombre' => 'ver_tipos_habitaciones', 'descripcion' => 'Ver tipos de habitaciones'],
            ['nombre' => 'crear_tipos_habitaciones', 'descripcion' => 'Crear tipos de habitaciones'],
            ['nombre' => 'editar_tipos_habitaciones', 'descripcion' => 'Editar tipos de habitaciones'],
            ['nombre' => 'eliminar_tipos_habitaciones', 'descripcion' => 'Eliminar tipos de habitaciones'],

            // HABITACIONES
            ['nombre' => 'ver_habitaciones', 'descripcion' => 'Ver habitaciones'],
            ['nombre' => 'crear_habitaciones', 'descripcion' => 'Crear habitaciones'],
            ['nombre' => 'editar_habitaciones', 'descripcion' => 'Editar habitaciones'],
            ['nombre' => 'eliminar_habitaciones', 'descripcion' => 'Eliminar habitaciones'],
            ['nombre' => 'cambiar_estado_habitaciones', 'descripcion' => 'Cambiar estado de habitaciones'],

            // HUÉSPEDES
            ['nombre' => 'ver_huespedes', 'descripcion' => 'Ver huéspedes'],
            ['nombre' => 'crear_huespedes', 'descripcion' => 'Registrar huéspedes'],
            ['nombre' => 'editar_huespedes', 'descripcion' => 'Editar información de huéspedes'],
            ['nombre' => 'eliminar_huespedes', 'descripcion' => 'Eliminar huéspedes'],

            // RESERVAS
            ['nombre' => 'ver_reservas', 'descripcion' => 'Ver reservas'],
            ['nombre' => 'crear_reservas', 'descripcion' => 'Crear reservas'],
            ['nombre' => 'editar_reservas', 'descripcion' => 'Editar reservas'],
            ['nombre' => 'cancelar_reservas', 'descripcion' => 'Cancelar reservas'],
            ['nombre' => 'checkin', 'descripcion' => 'Realizar check-in'],
            ['nombre' => 'checkout', 'descripcion' => 'Realizar check-out'],

            // SERVICIOS
            ['nombre' => 'ver_servicios', 'descripcion' => 'Ver servicios'],
            ['nombre' => 'crear_servicios', 'descripcion' => 'Crear servicios'],
            ['nombre' => 'editar_servicios', 'descripcion' => 'Editar servicios'],
            ['nombre' => 'eliminar_servicios', 'descripcion' => 'Eliminar servicios'],

            // CONSUMOS
            ['nombre' => 'ver_consumos', 'descripcion' => 'Ver consumos'],
            ['nombre' => 'registrar_consumos', 'descripcion' => 'Registrar consumos'],
            ['nombre' => 'eliminar_consumos', 'descripcion' => 'Eliminar consumos'],

            // PAGOS
            ['nombre' => 'ver_pagos', 'descripcion' => 'Ver pagos'],
            ['nombre' => 'registrar_pagos', 'descripcion' => 'Registrar pagos'],
            ['nombre' => 'eliminar_pagos', 'descripcion' => 'Eliminar pagos'],

            // EMPLEADOS
            ['nombre' => 'ver_empleados', 'descripcion' => 'Ver empleados'],
            ['nombre' => 'crear_empleados', 'descripcion' => 'Crear empleados'],
            ['nombre' => 'editar_empleados', 'descripcion' => 'Editar empleados'],
            ['nombre' => 'eliminar_empleados', 'descripcion' => 'Eliminar empleados'],

            // ROLES Y PERMISOS
            ['nombre' => 'ver_roles', 'descripcion' => 'Ver roles'],
            ['nombre' => 'crear_roles', 'descripcion' => 'Crear roles'],
            ['nombre' => 'editar_roles', 'descripcion' => 'Editar roles'],
            ['nombre' => 'eliminar_roles', 'descripcion' => 'Eliminar roles'],
            ['nombre' => 'asignar_permisos', 'descripcion' => 'Asignar permisos a roles'],

            // MANTENIMIENTOS
            ['nombre' => 'ver_mantenimientos', 'descripcion' => 'Ver mantenimientos'],
            ['nombre' => 'crear_mantenimientos', 'descripcion' => 'Crear mantenimientos'],
            ['nombre' => 'editar_mantenimientos', 'descripcion' => 'Editar mantenimientos'],
            ['nombre' => 'eliminar_mantenimientos', 'descripcion' => 'Eliminar mantenimientos'],

            // REPORTES
            ['nombre' => 'ver_dashboard', 'descripcion' => 'Ver dashboard principal'],
            ['nombre' => 'ver_reportes', 'descripcion' => 'Ver reportes generales'],
            ['nombre' => 'exportar_reportes', 'descripcion' => 'Exportar reportes a PDF/Excel'],

            // AUDITORÍA
            ['nombre' => 'ver_auditoria', 'descripcion' => 'Ver logs de auditoría'],
        ];

        foreach ($permisos as $permiso) {
            DB::table('permisos')->insert($permiso);
        }
    }
}
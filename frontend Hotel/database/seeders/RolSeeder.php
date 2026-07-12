<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso total al sistema. Puede gestionar hoteles, empleados, configuraciones y ver todos los reportes.'
            ],
            [
                'nombre' => 'Gerente',
                'descripcion' => 'Gestiona operaciones del hotel asignado. Puede crear reservas, ver reportes y administrar habitaciones.'
            ],
            [
                'nombre' => 'Recepcionista',
                'descripcion' => 'Gestiona reservas, check-in, check-out y atención al cliente.'
            ],
            [
                'nombre' => 'Empleado',
                'descripcion' => 'Acceso limitado para consultas y tareas específicas asignadas.'
            ],
        ];

        foreach ($roles as $rol) {
            DB::table('roles')->insert($rol);
        }
    }
}
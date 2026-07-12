<?php
// database/seeders/EmpleadoSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmpleadoSeeder extends Seeder
{
    public function run(): void
    {
        $adminRolId = DB::table('roles')->where('nombre', 'Administrador')->value('id');
        $gerenteRolId = DB::table('roles')->where('nombre', 'Gerente')->value('id');
        $recepcionistaRolId = DB::table('roles')->where('nombre', 'Recepcionista')->value('id');
        $hotelId = DB::table('hoteles')->where('nombre', 'Hotel Plaza Grande')->value('id');

        $empleados = [
            [
                'id_rol' => $adminRolId,
                'id_hotel' => null, // Admin general sin hotel específico
                'nombre' => 'Juan',
                'apellido' => 'Pérez',
                'usuario' => 'admin',
                'password' => Hash::make('admin123'),
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_rol' => $gerenteRolId,
                'id_hotel' => $hotelId,
                'nombre' => 'María',
                'apellido' => 'González',
                'usuario' => 'gerente',
                'password' => Hash::make('gerente123'),
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_rol' => $recepcionistaRolId,
                'id_hotel' => $hotelId,
                'nombre' => 'Carlos',
                'apellido' => 'López',
                'usuario' => 'recepcion',
                'password' => Hash::make('recepcion123'),
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($empleados as $empleado) {
            DB::table('empleados')->insert($empleado);
        }
    }
}
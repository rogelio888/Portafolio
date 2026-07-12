<?php
// database/seeders/TipoHabitacionSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoHabitacionSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            [
                'nombre' => 'Suite Presidencial',
                'descripcion' => 'Habitación de lujo con sala de estar, jacuzzi y vista panorámica',
                'capacidad' => 4,
                'precio_base' => 1500.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Suite Ejecutiva',
                'descripcion' => 'Habitación espaciosa con área de trabajo y sala de estar',
                'capacidad' => 3,
                'precio_base' => 800.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Habitación Doble',
                'descripcion' => 'Habitación con dos camas matrimoniales',
                'capacidad' => 4,
                'precio_base' => 400.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Habitación Simple',
                'descripcion' => 'Habitación con una cama matrimonial',
                'capacidad' => 2,
                'precio_base' => 250.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Habitación Familiar',
                'descripcion' => 'Habitación amplia con cama matrimonial y literas',
                'capacidad' => 6,
                'precio_base' => 600.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipo_habitaciones')->insert($tipo);
        }
    }
}
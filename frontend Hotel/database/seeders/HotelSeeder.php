<?php
// database/seeders/HotelSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HotelSeeder extends Seeder
{
    public function run(): void
    {
        $hoteles = [
            [
                'nombre' => 'Hotel Plaza Grande',
                'direccion' => 'Av. 16 de Julio #1234',
                'ciudad' => 'Santa Cruz',
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Hotel Camino Real',
                'direccion' => 'Calle Libertad #567',
                'ciudad' => 'La Paz',
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($hoteles as $hotel) {
            DB::table('hoteles')->insert($hotel);
        }
    }
}
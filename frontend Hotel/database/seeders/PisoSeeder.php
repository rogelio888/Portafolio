<?php
// database/seeders/PisoSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PisoSeeder extends Seeder
{
    public function run(): void
    {
        $hotelId = DB::table('hoteles')->where('nombre', 'Hotel Plaza Grande')->value('id');

        if ($hotelId) {
            $pisos = [
                ['id_hotel' => $hotelId, 'numero' => 1, 'estado' => 'ACTIVO', 'created_at' => now(), 'updated_at' => now()],
                ['id_hotel' => $hotelId, 'numero' => 2, 'estado' => 'ACTIVO', 'created_at' => now(), 'updated_at' => now()],
                ['id_hotel' => $hotelId, 'numero' => 3, 'estado' => 'ACTIVO', 'created_at' => now(), 'updated_at' => now()],
            ];

            foreach ($pisos as $piso) {
                DB::table('pisos')->insert($piso);
            }
        }
    }
}
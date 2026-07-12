<?php
// database/seeders/HabitacionSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HabitacionSeeder extends Seeder
{
    public function run(): void
    {
        $hotelId = DB::table('hoteles')->where('nombre', 'Hotel Plaza Grande')->value('id');
        $pisos = DB::table('pisos')->where('id_hotel', $hotelId)->get();
        $tipos = DB::table('tipo_habitaciones')->get();

        if ($hotelId && $pisos->count() > 0 && $tipos->count() > 0) {
            $habitaciones = [];

            // Crear 10 habitaciones por piso
            foreach ($pisos as $piso) {
                for ($i = 1; $i <= 10; $i++) {
                    $numero = ($piso->numero * 100) + $i; // 101, 102, 201, 202, etc.
                    $tipoAleatorio = $tipos->random();

                    $habitaciones[] = [
                        'id_hotel' => $hotelId,
                        'id_piso' => $piso->id,
                        'id_tipo' => $tipoAleatorio->id,
                        'numero' => (string)$numero,
                        'estado' => 'DISPONIBLE',
                        'descripcion' => "Habitación {$numero} tipo {$tipoAleatorio->nombre}",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            foreach ($habitaciones as $habitacion) {
                DB::table('habitaciones')->insert($habitacion);
            }
        }
    }
}
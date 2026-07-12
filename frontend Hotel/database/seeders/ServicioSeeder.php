<?php
// database/seeders/ServicioSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicioSeeder extends Seeder
{
    public function run(): void
    {
        $servicios = [
            // Servicios DIARIOS por PERSONA
            [
                'nombre' => 'Desayuno Buffet',
                'descripcion' => 'Desayuno buffet internacional',
                'tipo' => 'PERSONA',
                'frecuencia' => 'DIARIO',
                'precio' => 50.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Almuerzo',
                'descripcion' => 'Almuerzo tipo menú del día',
                'tipo' => 'PERSONA',
                'frecuencia' => 'DIARIO',
                'precio' => 80.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Cena',
                'descripcion' => 'Cena tipo buffet o a la carta',
                'tipo' => 'PERSONA',
                'frecuencia' => 'DIARIO',
                'precio' => 90.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Servicios DIARIOS por HABITACIÓN
            [
                'nombre' => 'Limpieza Diaria',
                'descripcion' => 'Servicio de limpieza y cambio de sábanas',
                'tipo' => 'HABITACION',
                'frecuencia' => 'DIARIO',
                'precio' => 30.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Servicios ÚNICOS por PERSONA
            [
                'nombre' => 'Masaje Spa',
                'descripcion' => 'Masaje relajante de 60 minutos',
                'tipo' => 'PERSONA',
                'frecuencia' => 'UNICO',
                'precio' => 200.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Traslado Aeropuerto',
                'descripcion' => 'Servicio de transporte al aeropuerto',
                'tipo' => 'PERSONA',
                'frecuencia' => 'UNICO',
                'precio' => 100.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Servicios por USO
            [
                'nombre' => 'Minibar',
                'descripcion' => 'Consumo de minibar',
                'tipo' => 'HABITACION',
                'frecuencia' => 'POR_USO',
                'precio' => 50.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Lavandería',
                'descripcion' => 'Servicio de lavandería por prenda',
                'tipo' => 'HABITACION',
                'frecuencia' => 'POR_USO',
                'precio' => 15.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Servicios por ESTANCIA
            [
                'nombre' => 'WiFi Premium',
                'descripcion' => 'Acceso a internet de alta velocidad durante toda la estancia',
                'tipo' => 'ESTANCIA',
                'frecuencia' => 'UNICO',
                'precio' => 100.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Parking',
                'descripcion' => 'Estacionamiento durante toda la estancia',
                'tipo' => 'ESTANCIA',
                'frecuencia' => 'UNICO',
                'precio' => 150.00,
                'estado' => 'ACTIVO',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($servicios as $servicio) {
            DB::table('servicios')->insert($servicio);
        }
    }
}
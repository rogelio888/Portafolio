<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolSeeder::class,
            PermisoSeeder::class,
            RolPermisoSeeder::class,
            HotelSeeder::class,
            PisoSeeder::class,
            TipoHabitacionSeeder::class,
            HabitacionSeeder::class,
            ServicioSeeder::class,
            EmpleadoSeeder::class,
        ]);

        $this->command->info('✅ Base de datos poblada correctamente!');
        $this->command->info('');
        $this->command->info('👤 USUARIOS CREADOS:');
        $this->command->info('   Admin: usuario=admin, password=admin123');
        $this->command->info('   Gerente: usuario=gerente, password=gerente123');
        $this->command->info('   Recepcionista: usuario=recepcion, password=recepcion123');
    }
}
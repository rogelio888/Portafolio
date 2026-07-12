<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AsignarPermisosAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener el rol de Administrador
        $adminRol = DB::table('roles')->where('nombre', 'Administrador')->first();

        if (!$adminRol) {
            $this->command->error('Rol Administrador no encontrado');
            return;
        }

        // Obtener todos los permisos
        $permisos = DB::table('permisos')->get();

        // Limpiar permisos anteriores del admin
        DB::table('rol_permiso')->where('id_rol', $adminRol->id)->delete();

        // Asignar TODOS los permisos al admin
        foreach ($permisos as $permiso) {
            DB::table('rol_permiso')->insert([
                'id_rol' => $adminRol->id,
                'id_permiso' => $permiso->id,
            ]);
        }

        $this->command->info('Todos los permisos asignados al Administrador correctamente');
    }
}

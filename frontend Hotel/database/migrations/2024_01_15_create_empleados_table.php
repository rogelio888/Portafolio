<?php
// database/migrations/2024_01_15_create_empleados_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empleados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_rol')->constrained('roles')->onDelete('restrict');
            $table->foreignId('id_hotel')->nullable()->constrained('hoteles')->onDelete('set null');
            $table->string('nombre', 150);
            $table->string('apellido', 150);
            $table->string('usuario', 100)->unique();
            $table->string('password', 255);
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            $table->timestamps();
            
            $table->index('usuario');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empleados');
    }
};
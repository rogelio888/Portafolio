<?php
// database/migrations/2024_01_09_create_servicios_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->enum('tipo', ['PERSONA', 'HABITACION', 'ESTANCIA']);
            $table->enum('frecuencia', ['DIARIO', 'UNICO', 'POR_USO']);
            $table->decimal('precio', 10, 2);
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            $table->timestamps();
            
            $table->index('estado');
            $table->index(['tipo', 'frecuencia']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
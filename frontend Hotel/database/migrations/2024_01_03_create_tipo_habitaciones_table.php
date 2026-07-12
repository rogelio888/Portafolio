<?php
// database/migrations/2024_01_03_create_tipo_habitaciones_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipo_habitaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->integer('capacidad');
            $table->decimal('precio_base', 10, 2);
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            $table->timestamps();
            
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipo_habitaciones');
    }
};
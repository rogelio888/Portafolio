<?php
// database/migrations/2024_01_04_create_habitaciones_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habitaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_hotel')->constrained('hoteles')->onDelete('cascade');
            $table->foreignId('id_piso')->constrained('pisos')->onDelete('cascade');
            $table->foreignId('id_tipo')->constrained('tipo_habitaciones')->onDelete('restrict');
            $table->string('numero', 20);
            $table->enum('estado', ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO', 'INACTIVA', 'DEMOLIDA'])->default('DISPONIBLE');
            $table->text('descripcion')->nullable();
            $table->timestamps();
            
            $table->index(['id_hotel', 'estado']);
            $table->unique(['id_hotel', 'numero']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habitaciones');
    }
};
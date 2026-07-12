<?php
// database/migrations/2024_01_02_create_pisos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pisos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_hotel')->constrained('hoteles')->onDelete('cascade');
            $table->integer('numero');
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            $table->timestamps();
            
            $table->index(['id_hotel', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pisos');
    }
};
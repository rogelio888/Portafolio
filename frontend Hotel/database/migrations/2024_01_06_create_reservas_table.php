<?php
// database/migrations/2024_01_06_create_reservas_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_huesped')->constrained('huespedes')->onDelete('restrict');
            $table->foreignId('id_hotel')->constrained('hoteles')->onDelete('restrict');
            $table->date('fecha_entrada');
            $table->date('fecha_salida');
            $table->integer('adultos')->default(1);
            $table->integer('ninos')->default(0);
            $table->enum('estado', ['PENDIENTE', 'CONFIRMADA', 'EN_PROCESO', 'CANCELADA', 'COMPLETADA'])->default('PENDIENTE');
            $table->decimal('total', 12, 2)->default(0);
            $table->timestamps();
            
            $table->index(['id_hotel', 'estado']);
            $table->index(['fecha_entrada', 'fecha_salida']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
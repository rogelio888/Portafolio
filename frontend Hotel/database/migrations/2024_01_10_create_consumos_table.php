<?php
// database/migrations/2024_01_10_create_consumos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consumos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_reserva')->constrained('reservas')->onDelete('cascade');
            $table->foreignId('id_servicio')->constrained('servicios')->onDelete('restrict');
            $table->integer('cantidad')->default(1);
            $table->date('fecha');
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();
            
            $table->index('id_reserva');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consumos');
    }
};
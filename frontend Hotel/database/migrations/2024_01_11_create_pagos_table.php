<?php
// database/migrations/2024_01_11_create_pagos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_reserva')->constrained('reservas')->onDelete('cascade');
            $table->enum('tipo_pago', ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']);
            $table->decimal('monto', 12, 2);
            $table->dateTime('fecha');
            $table->timestamps();
            
            $table->index('id_reserva');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
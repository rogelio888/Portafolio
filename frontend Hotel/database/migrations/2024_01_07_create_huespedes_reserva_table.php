<?php
// database/migrations/2024_01_07_create_huespedes_reserva_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('huespedes_reserva', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_reserva')->constrained('reservas')->onDelete('cascade');
            $table->foreignId('id_huesped')->constrained('huespedes')->onDelete('restrict');
            
            $table->unique(['id_reserva', 'id_huesped']);
            $table->index('id_reserva');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('huespedes_reserva');
    }
};
<?php
// database/migrations/2024_01_08_create_reserva_habitaciones_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserva_habitaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_reserva')->constrained('reservas')->onDelete('cascade');
            $table->foreignId('id_habitacion')->constrained('habitaciones')->onDelete('restrict');
            $table->decimal('precio_por_noche', 10, 2);
            $table->integer('noches');
            $table->decimal('total', 12, 2);
            
            $table->index('id_reserva');
            $table->index('id_habitacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reserva_habitaciones');
    }
};
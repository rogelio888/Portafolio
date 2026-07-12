<?php
// database/migrations/2024_01_16_create_mantenimientos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mantenimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_habitacion')->constrained('habitaciones')->onDelete('cascade');
            $table->text('descripcion');
            $table->date('fecha');
            $table->decimal('costo', 10, 2)->nullable();
            
            $table->index('id_habitacion');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mantenimientos');
    }
};
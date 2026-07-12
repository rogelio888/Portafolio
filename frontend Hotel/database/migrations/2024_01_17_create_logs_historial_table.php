<?php
// database/migrations/2024_01_17_create_logs_historial_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logs_historial', function (Blueprint $table) {
            $table->id();
            $table->string('tabla', 100);
            $table->unsignedBigInteger('id_registro');
            $table->enum('accion', ['CREAR', 'MODIFICAR', 'ELIMINAR']);
            $table->unsignedBigInteger('usuario')->nullable();
            $table->text('descripcion')->nullable();
            $table->dateTime('fecha');
            
            $table->index(['tabla', 'id_registro']);
            $table->index('usuario');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs_historial');
    }
};
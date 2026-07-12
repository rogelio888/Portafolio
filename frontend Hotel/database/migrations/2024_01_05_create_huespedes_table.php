<?php
// database/migrations/2024_01_05_create_huespedes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('huespedes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('apellido', 150);
            $table->string('ci', 30)->unique();
            $table->string('telefono', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO');
            $table->timestamps();
            
            $table->index('estado');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('huespedes');
    }
};
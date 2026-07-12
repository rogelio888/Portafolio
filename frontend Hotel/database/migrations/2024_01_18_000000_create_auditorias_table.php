<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        if (!Schema::hasTable('auditorias')) {
            Schema::create('auditorias', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('empleados')->nullOnDelete();
                $table->string('accion'); // CREATE, UPDATE, DELETE
                $table->string('modelo'); // App\Models\Reserva
                $table->unsignedBigInteger('modelo_id');
                $table->json('valores_antiguos')->nullable();
                $table->json('valores_nuevos')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('user_agent')->nullable();
                $table->timestamps();

                $table->index(['modelo', 'modelo_id']);
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('auditorias');
    }
};

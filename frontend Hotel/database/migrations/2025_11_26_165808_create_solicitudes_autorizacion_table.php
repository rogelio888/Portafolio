<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('solicitudes_autorizacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitante_id')->constrained('empleados')->onDelete('cascade');
            $table->foreignId('autorizador_id')->nullable()->constrained('empleados')->onDelete('set null');
            $table->string('tipo'); // 'editar_huesped', 'editar_habitacion', etc.
            $table->string('modelo'); // 'App\Models\Huesped'
            $table->unsignedBigInteger('modelo_id'); // ID del registro a editar
            $table->text('motivo')->nullable(); // Por qué necesita editar
            $table->json('datos_nuevos')->nullable(); // Datos que quiere cambiar
            $table->enum('estado', ['PENDIENTE', 'APROBADA', 'RECHAZADA'])->default('PENDIENTE');
            $table->text('comentario_autorizador')->nullable();
            $table->timestamp('fecha_respuesta')->nullable();
            $table->timestamps();

            $table->index(['estado', 'solicitante_id']);
            $table->index(['modelo', 'modelo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes_autorizacion');
    }
};

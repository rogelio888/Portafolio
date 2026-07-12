-- Script para crear tabla de solicitudes de autorización
-- Ejecutar en la base de datos del sistema hotelero

CREATE TABLE IF NOT EXISTS solicitudes_autorizacion (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    solicitante_id BIGINT UNSIGNED NOT NULL,
    autorizador_id BIGINT UNSIGNED NULL,
    tipo VARCHAR(255) NOT NULL COMMENT 'Tipo de solicitud: editar_huesped, editar_habitacion, etc.',
    modelo VARCHAR(255) NOT NULL COMMENT 'Clase del modelo: App\\Models\\Huesped',
    modelo_id BIGINT UNSIGNED NOT NULL COMMENT 'ID del registro a editar',
    motivo TEXT NULL COMMENT 'Razón de la solicitud',
    datos_nuevos JSON NULL COMMENT 'Datos que se quieren cambiar',
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA') DEFAULT 'PENDIENTE',
    comentario_autorizador TEXT NULL COMMENT 'Comentario del gerente/admin',
    fecha_respuesta TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (solicitante_id) REFERENCES empleados(id) ON DELETE CASCADE,
    FOREIGN KEY (autorizador_id) REFERENCES empleados(id) ON DELETE SET NULL,
    
    INDEX idx_estado_solicitante (estado, solicitante_id),
    INDEX idx_modelo (modelo, modelo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

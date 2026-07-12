ALTER TABLE solicitudes_autorizacion ADD COLUMN used_at TIMESTAMP NULL DEFAULT NULL AFTER fecha_respuesta;

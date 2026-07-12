-- Script para crear permisos del sistema hotelero

-- Insertar permisos si no existen
INSERT INTO permisos (nombre, descripcion) VALUES
('gestionar_habitaciones', 'Crear, editar y eliminar habitaciones'),
('gestionar_huespedes', 'Editar y eliminar huéspedes'),
('gestionar_reservas', 'Gestionar reservas'),
('gestionar_pagos', 'Registrar pagos'),
('anular_pagos', 'Anular pagos registrados'),
('gestionar_empleados', 'Gestionar empleados del sistema'),
('gestionar_roles', 'Gestionar roles y permisos'),
('gestionar_hoteles', 'Gestionar hoteles'),
('gestionar_pisos', 'Gestionar pisos'),
('gestionar_tipos_habitacion', 'Gestionar tipos de habitación'),
('gestionar_servicios', 'Gestionar servicios'),
('gestionar_mantenimientos', 'Gestionar mantenimientos'),
('gestionar_consumos', 'Gestionar consumos'),
('ver_reportes', 'Acceso a reportes'),
('ver_auditoria', 'Ver auditoría del sistema')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Limpiar permisos anteriores de los roles
DELETE FROM rol_permiso WHERE id_rol IN (
    SELECT id FROM roles WHERE nombre IN ('Recepcionista', 'Gerente')
);

-- RECEPCIONISTA: Solo crear huéspedes, gestionar reservas y pagos
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'Recepcionista'
AND p.nombre IN ('gestionar_reservas', 'gestionar_pagos', 'ver_reportes');

-- GERENTE: Todos los permisos EXCEPTO ver auditoría y gestionar roles
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'Gerente'
AND p.nombre NOT IN ('ver_auditoria', 'gestionar_roles');

-- ADMINISTRADOR: Todos los permisos (manejado en el middleware, no necesita registros)

-- Verificar permisos asignados
SELECT r.nombre as rol, p.nombre as permiso, p.descripcion
FROM roles r
LEFT JOIN rol_permiso rp ON r.id = rp.id_rol
LEFT JOIN permisos p ON rp.id_permiso = p.id
WHERE r.nombre IN ('Recepcionista', 'Gerente', 'Administrador')
ORDER BY r.nombre, p.nombre;

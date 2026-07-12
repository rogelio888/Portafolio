export const HUESPED_LIST = {
  method: 'GET', route: '/api/huespedes', entity: 'Huésped', operationLabel: 'Listar huéspedes',
  controllerCode: `// HuespedController.php\npublic function index(Request $request) {\n    $huespedes = Huesped::filtrar($request)->get();\n    $huespedes->each(fn($h) => $h->can_edit = Auth::user()->tienePermiso('gestionar_huespedes') || $this->tieneAutorizacionVigente($h));\n    return response()->json(['success' => true, 'data' => $huespedes]);\n}`,
  sqlQuery: () => `SELECT * FROM huespedes;
SELECT * FROM solicitudes_autorizacion WHERE modelo_id = ? AND estado = 'APROBADA' AND used_at IS NULL AND created_at >= NOW() - INTERVAL 24 HOUR;`,
  responseBody: (ctx) => ({ success: true, data: ctx.huespedes }),
};
export const HUESPED_CREATE = {
  method: 'POST', route: '/api/huespedes', entity: 'Huésped', operationLabel: 'Registrar huésped',
  controllerCode: `// HuespedController.php\npublic function store(Request $request) {\n    $huesped = Huesped::create($request->validate(['ci' => 'required|unique:huespedes', ...]));\n    return response()->json(['success' => true, 'data' => $huesped], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO huespedes (nombre, apellido, ci, telefono, email, estado) VALUES ('${ctx.nombre}', '${ctx.apellido}', '${ctx.ci}', '${ctx.telefono ?? ''}', '${ctx.email ?? ''}', 'ACTIVO');`,
  responseBody: (ctx) => ({ success: true, data: ctx.huesped }),
};
export const HUESPED_UPDATE = {
  method: 'PUT', route: '/api/huespedes/{id}', entity: 'Huésped', operationLabel: 'Actualizar huésped',
  controllerCode: `// HuespedController.php
public function update(Request $request, Huesped $huesped) {
    $autorizado = Auth::user()->tienePermiso('gestionar_huespedes') || $this->tieneAutorizacionVigente($huesped, $request->user());
    if (!$autorizado) return response()->json(['success' => false, 'message' => 'No autorizado para editar este huésped'], 403);
    $huesped->update($request->validated());
    $this->consumirSolicitudSiAplica($huesped, $request->user());
    return response()->json(['success' => true, 'data' => $huesped]);
}`,
  sqlQuery: (ctx) => `UPDATE huespedes SET ${ctx.fields} WHERE id = ${ctx.id};
UPDATE solicitudes_autorizacion SET used_at = NOW() WHERE modelo_id = ${ctx.id} AND estado = 'APROBADA' AND used_at IS NULL;`,
  responseBody: (ctx) => ({ success: true, data: ctx.huesped }),
};
export const HUESPED_DELETE = {
  method: 'DELETE', route: '/api/huespedes/{id}', entity: 'Huésped', operationLabel: 'Desactivar huésped',
  controllerCode: `// HuespedController.php\npublic function destroy(Huesped $huesped) {\n    $huesped->update(['estado' => 'INACTIVO']);\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `UPDATE huespedes SET estado = 'INACTIVO' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};
export const HUESPED_BUSCAR_CI = {
  method: 'POST', route: '/api/huespedes/buscar-ci', entity: 'Huésped', operationLabel: 'Buscar huésped por CI',
  controllerCode: `// HuespedController.php\npublic function buscarPorCi(Request $request) {\n    $huesped = Huesped::where('ci', $request->ci)->first();\n    if (!$huesped) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);\n    return response()->json(['success' => true, 'data' => $huesped]);\n}`,
  sqlQuery: (ctx) => `SELECT * FROM huespedes WHERE ci = '${ctx.ci}' LIMIT 1;`,
  responseBody: (ctx) => (ctx.huesped ? { success: true, data: ctx.huesped } : { success: false, message: 'No encontrado' }),
};

export const RESERVA_LIST = {
  method: 'GET', route: '/api/reservas', entity: 'Reserva', operationLabel: 'Listar reservas',
  controllerCode: `// ReservaController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => Reserva::with(['huesped', 'hotel', 'habitaciones.tipo'])->filtrar($request)->latest()->get()]);\n}`,
  sqlQuery: () => `SELECT r.*, hu.nombre AS huesped_nombre FROM reservas r JOIN huespedes hu ON hu.id = r.id_huesped ORDER BY r.created_at DESC;`,
  responseBody: (ctx) => ({ success: true, data: ctx.reservas }),
};
export const RESERVA_CREATE = {
  method: 'POST', route: '/api/reservas', entity: 'Reserva', operationLabel: 'Crear reserva',
  controllerCode: `// ReservaController.php
public function store(Request $request) {
    return DB::transaction(function () use ($request) {
        $reserva = Reserva::create(['id_huesped' => $request->id_huesped, 'id_hotel' => $request->id_hotel, 'fecha_entrada' => $request->fecha_entrada, 'fecha_salida' => $request->fecha_salida, 'adultos' => $request->adultos, 'ninos' => $request->ninos ?? 0, 'estado' => 'PENDIENTE', 'total' => 0]);
        $noches = $reserva->calcularNoches();
        foreach ($request->habitaciones as $h) {
            $habitacion = Habitacion::find($h['id_habitacion']);
            $precio = $habitacion->tipo->precio_base;
            $reserva->reservaHabitaciones()->create(['id_habitacion' => $habitacion->id, 'precio_por_noche' => $precio, 'noches' => $noches, 'total' => $precio * $noches]);
            $habitacion->cambiarEstado('RESERVADA');
        }
        $reserva->huespedesAdicionales()->attach($request->huespedes_adicionales ?? []);
        $reserva->recalcularTotal();
        return response()->json(['success' => true, 'data' => $reserva], 201);
    });
}`,
  sqlQuery: (ctx) => `INSERT INTO reservas (id_huesped, id_hotel, fecha_entrada, fecha_salida, adultos, ninos, estado, total) VALUES (${ctx.id_huesped}, ${ctx.id_hotel}, '${ctx.fecha_entrada}', '${ctx.fecha_salida}', ${ctx.adultos}, ${ctx.ninos}, 'PENDIENTE', 0);
INSERT INTO reserva_habitaciones (id_reserva, id_habitacion, precio_por_noche, noches, total) VALUES ${ctx.habitacionesSql};
UPDATE habitaciones SET estado = 'RESERVADA' WHERE id IN (${ctx.habitacionIds});`,
  responseBody: (ctx) => ({ success: true, data: ctx.reserva }),
};
export const RESERVA_SHOW = {
  method: 'GET', route: '/api/reservas/{id}', entity: 'Reserva', operationLabel: 'Ver detalle de reserva (folio)',
  controllerCode: `// ReservaController.php
public function show(Reserva $reserva) {
    $reserva->load(['huesped', 'hotel', 'habitaciones.tipo', 'huespedesAdicionales', 'consumos.servicio', 'pagos']);
    $data = $reserva->toArray();
    $data['noches'] = $reserva->calcularNoches();
    $data['total_habitaciones'] = $reserva->calcularTotalHabitaciones();
    $data['total_consumos'] = $reserva->calcularTotalConsumos();
    $data['total_pagos'] = $reserva->calcularTotalPagos();
    $data['saldo'] = $reserva->calcularSaldo();
    return response()->json(['success' => true, 'data' => $data]);
}`,
  sqlQuery: (ctx) => `SELECT * FROM reservas WHERE id = ${ctx.id};
SELECT SUM(total) FROM reserva_habitaciones WHERE id_reserva = ${ctx.id};
SELECT SUM(subtotal) FROM consumos WHERE id_reserva = ${ctx.id};
SELECT SUM(monto) FROM pagos WHERE id_reserva = ${ctx.id} AND estado = 'ACTIVO';`,
  responseBody: (ctx) => ({ success: true, data: ctx.data }),
};
export const RESERVA_UPDATE = {
  method: 'PUT', route: '/api/reservas/{id}', entity: 'Reserva', operationLabel: 'Actualizar reserva',
  controllerCode: `// ReservaController.php\npublic function update(Request $request, Reserva $reserva) {\n    $reserva->update($request->validated());\n    return response()->json(['success' => true, 'data' => $reserva]);\n}`,
  sqlQuery: (ctx) => `UPDATE reservas SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.reserva }),
};
export const RESERVA_CANCELAR = {
  method: 'DELETE', route: '/api/reservas/{id}', entity: 'Reserva', operationLabel: 'Cancelar reserva',
  controllerCode: `// ReservaController.php\npublic function destroy(Reserva $reserva) {\n    $reserva->cancelar();\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `UPDATE reservas SET estado = 'CANCELADA' WHERE id = ${ctx.id};
UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE id IN (${ctx.habitacionIds}) AND estado = 'RESERVADA';`,
  responseBody: () => ({ success: true }),
};
export const RESERVA_CONFIRMAR = {
  method: 'POST', route: '/api/reservas/{id}/confirmar', entity: 'Reserva', operationLabel: 'Confirmar reserva',
  controllerCode: `// ReservaController.php\npublic function confirmar(Reserva $reserva) {\n    if ($reserva->estado !== 'PENDIENTE') return response()->json(['success' => false, 'message' => 'La reserva no está pendiente'], 422);\n    $reserva->confirmar();\n    return response()->json(['success' => true, 'data' => $reserva]);\n}`,
  sqlQuery: (ctx) => `UPDATE reservas SET estado = 'CONFIRMADA' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.reserva }),
};
export const RESERVA_CHECKIN = {
  method: 'POST', route: '/api/reservas/{id}/checkin', entity: 'Reserva', operationLabel: 'Realizar check-in',
  controllerCode: `// ReservaController.php\npublic function checkIn(Reserva $reserva) {\n    if ($reserva->estado !== 'CONFIRMADA') return response()->json(['success' => false, 'message' => 'La reserva no está confirmada'], 422);\n    $reserva->realizarCheckIn();\n    return response()->json(['success' => true, 'data' => $reserva]);\n}`,
  sqlQuery: (ctx) => `UPDATE reservas SET estado = 'EN_PROCESO' WHERE id = ${ctx.id};
UPDATE habitaciones SET estado = 'OCUPADA' WHERE id IN (${ctx.habitacionIds});`,
  responseBody: (ctx) => ({ success: true, data: ctx.reserva }),
};
export const RESERVA_CHECKOUT = {
  method: 'POST', route: '/api/reservas/{id}/checkout', entity: 'Reserva', operationLabel: 'Realizar check-out',
  controllerCode: `// ReservaController.php\npublic function checkOut(Reserva $reserva) {\n    if ($reserva->estado !== 'EN_PROCESO') return response()->json(['success' => false, 'message' => 'La reserva no está en proceso'], 422);\n    $reserva->realizarCheckOut();\n    return response()->json(['success' => true, 'data' => $reserva]);\n}`,
  sqlQuery: (ctx) => `UPDATE reservas SET estado = 'COMPLETADA' WHERE id = ${ctx.id};
UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE id IN (${ctx.habitacionIds});`,
  responseBody: (ctx) => ({ success: true, data: ctx.reserva }),
};

export const MANTENIMIENTO_LIST = {
  method: 'GET', route: '/api/mantenimientos', entity: 'Mantenimiento', operationLabel: 'Listar mantenimientos',
  controllerCode: `// MantenimientoController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => Mantenimiento::with('habitacion.hotel')->filtrar($request)->orderByDesc('fecha')->get()]);\n}`,
  sqlQuery: () => `SELECT m.*, h.numero FROM mantenimientos m JOIN habitaciones h ON h.id = m.id_habitacion ORDER BY m.fecha DESC;`,
  responseBody: (ctx) => ({ success: true, data: ctx.mantenimientos }),
};
export const MANTENIMIENTO_CREATE = {
  method: 'POST', route: '/api/mantenimientos', entity: 'Mantenimiento', operationLabel: 'Registrar mantenimiento',
  controllerCode: `// MantenimientoController.php\npublic function store(Request $request) {\n    $mantenimiento = Mantenimiento::create($request->validate([...]));\n    $mantenimiento->habitacion->cambiarEstado('MANTENIMIENTO');\n    return response()->json(['success' => true, 'data' => $mantenimiento], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO mantenimientos (id_habitacion, descripcion, fecha, costo) VALUES (${ctx.id_habitacion}, '${ctx.descripcion}', '${ctx.fecha}', ${ctx.costo ?? 'NULL'});
UPDATE habitaciones SET estado = 'MANTENIMIENTO' WHERE id = ${ctx.id_habitacion};`,
  responseBody: (ctx) => ({ success: true, data: ctx.mantenimiento }),
};
export const MANTENIMIENTO_UPDATE = {
  method: 'PUT', route: '/api/mantenimientos/{id}', entity: 'Mantenimiento', operationLabel: 'Actualizar mantenimiento',
  controllerCode: `// MantenimientoController.php\npublic function update(Request $request, Mantenimiento $mantenimiento) {\n    $mantenimiento->update($request->validated());\n    return response()->json(['success' => true, 'data' => $mantenimiento]);\n}`,
  sqlQuery: (ctx) => `UPDATE mantenimientos SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.mantenimiento }),
};
export const MANTENIMIENTO_DELETE = {
  method: 'DELETE', route: '/api/mantenimientos/{id}', entity: 'Mantenimiento', operationLabel: 'Eliminar mantenimiento',
  controllerCode: `// MantenimientoController.php\npublic function destroy(Mantenimiento $mantenimiento) {\n    $mantenimiento->delete();\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `DELETE FROM mantenimientos WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};
export const MANTENIMIENTO_COMPLETAR = {
  method: 'POST', route: '/api/mantenimientos/{id}/completar', entity: 'Mantenimiento', operationLabel: 'Completar mantenimiento',
  controllerCode: `// MantenimientoController.php\npublic function completar(Mantenimiento $mantenimiento) {\n    $mantenimiento->habitacion->cambiarEstado('DISPONIBLE');\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `UPDATE habitaciones SET estado = 'DISPONIBLE' WHERE id = ${ctx.idHabitacion};`,
  responseBody: () => ({ success: true }),
};

export const SOLICITUD_LIST = {
  method: 'GET', route: '/api/solicitudes-autorizacion', entity: 'Solicitud de Autorización', operationLabel: 'Listar solicitudes',
  controllerCode: `// SolicitudAutorizacionController.php
public function index(Request $request) {
    $user = $request->user();
    $query = in_array($user->rol->nombre, ['Administrador', 'Gerente'])
        ? SolicitudAutorizacion::where('estado', 'PENDIENTE')
        : SolicitudAutorizacion::where('solicitante_id', $user->id);
    return response()->json(['success' => true, 'data' => $query->with(['solicitante', 'autorizador'])->latest()->get()]);
}`,
  sqlQuery: (ctx) => ctx.esRevisor
    ? `SELECT * FROM solicitudes_autorizacion WHERE estado = 'PENDIENTE' ORDER BY created_at DESC;`
    : `SELECT * FROM solicitudes_autorizacion WHERE solicitante_id = ${ctx.userId} ORDER BY created_at DESC;`,
  responseBody: (ctx) => ({ success: true, data: ctx.solicitudes }),
};
export const SOLICITUD_CREATE = {
  method: 'POST', route: '/api/solicitudes-autorizacion', entity: 'Solicitud de Autorización', operationLabel: 'Crear solicitud de autorización',
  controllerCode: `// SolicitudAutorizacionController.php\npublic function store(Request $request) {\n    $solicitud = SolicitudAutorizacion::create($request->validate([...]) + ['solicitante_id' => $request->user()->id, 'estado' => 'PENDIENTE']);\n    return response()->json(['success' => true, 'data' => $solicitud], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO solicitudes_autorizacion (solicitante_id, tipo, modelo, modelo_id, motivo, estado) VALUES (${ctx.solicitanteId}, '${ctx.tipo}', '${ctx.modelo}', ${ctx.modelo_id}, '${ctx.motivo}', 'PENDIENTE');`,
  responseBody: (ctx) => ({ success: true, data: ctx.solicitud }),
};
export const SOLICITUD_APROBAR = {
  method: 'POST', route: '/api/solicitudes-autorizacion/{id}/aprobar', entity: 'Solicitud de Autorización', operationLabel: 'Aprobar solicitud',
  controllerCode: `// SolicitudAutorizacionController.php\npublic function aprobar(Request $request, SolicitudAutorizacion $solicitud) {\n    $solicitud->update(['estado' => 'APROBADA', 'autorizador_id' => $request->user()->id, 'comentario_autorizador' => $request->comentario, 'fecha_respuesta' => now()]);\n    return response()->json(['success' => true, 'data' => $solicitud]);\n}`,
  sqlQuery: (ctx) => `UPDATE solicitudes_autorizacion SET estado = 'APROBADA', autorizador_id = ${ctx.autorizadorId}, fecha_respuesta = NOW() WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.solicitud }),
};
export const SOLICITUD_RECHAZAR = {
  method: 'POST', route: '/api/solicitudes-autorizacion/{id}/rechazar', entity: 'Solicitud de Autorización', operationLabel: 'Rechazar solicitud',
  controllerCode: `// SolicitudAutorizacionController.php\npublic function rechazar(Request $request, SolicitudAutorizacion $solicitud) {\n    $solicitud->update(['estado' => 'RECHAZADA', 'autorizador_id' => $request->user()->id, 'comentario_autorizador' => $request->comentario, 'fecha_respuesta' => now()]);\n    return response()->json(['success' => true, 'data' => $solicitud]);\n}`,
  sqlQuery: (ctx) => `UPDATE solicitudes_autorizacion SET estado = 'RECHAZADA', autorizador_id = ${ctx.autorizadorId}, fecha_respuesta = NOW() WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.solicitud }),
};

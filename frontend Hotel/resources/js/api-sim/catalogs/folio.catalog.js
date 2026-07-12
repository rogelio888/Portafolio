export const SERVICIO_LIST = {
  method: 'GET', route: '/api/servicios', entity: 'Servicio', operationLabel: 'Listar servicios',
  controllerCode: `// ServicioController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => Servicio::filtrar($request)->get()]);\n}`,
  sqlQuery: () => `SELECT * FROM servicios;`,
  responseBody: (ctx) => ({ success: true, data: ctx.servicios }),
};
export const SERVICIO_CREATE = {
  method: 'POST', route: '/api/servicios', entity: 'Servicio', operationLabel: 'Crear servicio',
  controllerCode: `// ServicioController.php\npublic function store(Request $request) {\n    $servicio = Servicio::create($request->validate([...]));\n    return response()->json(['success' => true, 'data' => $servicio], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO servicios (nombre, tipo, frecuencia, precio, estado) VALUES ('${ctx.nombre}', '${ctx.tipo}', '${ctx.frecuencia}', ${ctx.precio}, 'ACTIVO');`,
  responseBody: (ctx) => ({ success: true, data: ctx.servicio }),
};
export const SERVICIO_UPDATE = {
  method: 'PUT', route: '/api/servicios/{id}', entity: 'Servicio', operationLabel: 'Actualizar servicio',
  controllerCode: `// ServicioController.php\npublic function update(Request $request, Servicio $servicio) {\n    $servicio->update($request->validated());\n    return response()->json(['success' => true, 'data' => $servicio]);\n}`,
  sqlQuery: (ctx) => `UPDATE servicios SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.servicio }),
};
export const SERVICIO_DELETE = {
  method: 'DELETE', route: '/api/servicios/{id}', entity: 'Servicio', operationLabel: 'Eliminar servicio',
  controllerCode: `// ServicioController.php\npublic function destroy(Servicio $servicio) {\n    if ($servicio->consumos()->count() > 0) return response()->json(['success' => false, 'message' => 'El servicio tiene consumos registrados'], 422);\n    $servicio->delete();\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `SELECT COUNT(*) FROM consumos WHERE id_servicio = ${ctx.id}; -- si 0: DELETE FROM servicios WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const CONSUMO_LIST = {
  method: 'GET', route: '/api/consumos', entity: 'Consumo', operationLabel: 'Listar consumos',
  controllerCode: `// ConsumoController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, ...Consumo::with(['reserva.habitacion', 'reserva.huesped', 'servicio'])->filtrar($request)->paginate(10)->toArray()]);\n}`,
  sqlQuery: () => `SELECT c.*, s.nombre AS servicio_nombre FROM consumos c JOIN servicios s ON s.id = c.id_servicio LIMIT 10 OFFSET ?;`,
  responseBody: (ctx) => ctx.page_response,
};
export const CONSUMO_CREATE = {
  method: 'POST', route: '/api/consumos', entity: 'Consumo', operationLabel: 'Registrar consumo',
  controllerCode: `// ConsumoController.php
public function store(Request $request) {
    if (!in_array($reserva->estado, ['CONFIRMADA', 'EN_PROCESO'])) return response()->json(['success' => false, 'message' => 'La reserva no admite cargos'], 422);
    $fechas = $request->fechas ?? [$request->fecha];
    $consumos = collect($fechas)->map(fn($fecha) => Consumo::create(['id_reserva' => $request->id_reserva, 'id_servicio' => $request->id_servicio, 'cantidad' => $request->cantidad, 'fecha' => $fecha, 'subtotal' => $servicio->precio * $request->cantidad]));
    $reserva->recalcularTotal();
    return response()->json(['success' => true, 'data' => $consumos->count() > 1 ? $consumos : $consumos->first()], 201);
}`,
  sqlQuery: (ctx) => `INSERT INTO consumos (id_reserva, id_servicio, cantidad, fecha, subtotal) VALUES ${ctx.rowsSql};
UPDATE reservas SET total = (SELECT SUM(total) FROM reserva_habitaciones WHERE id_reserva = ${ctx.id_reserva}) + (SELECT SUM(subtotal) FROM consumos WHERE id_reserva = ${ctx.id_reserva}) WHERE id = ${ctx.id_reserva};`,
  responseBody: (ctx) => ({ success: true, data: ctx.consumos }),
};
export const CONSUMO_UPDATE = {
  method: 'PUT', route: '/api/consumos/{id}', entity: 'Consumo', operationLabel: 'Actualizar consumo',
  controllerCode: `// ConsumoController.php\npublic function update(Request $request, Consumo $consumo) {\n    $consumo->update(['cantidad' => $request->cantidad, 'subtotal' => $consumo->servicio->precio * $request->cantidad]);\n    $consumo->reserva->recalcularTotal();\n    return response()->json(['success' => true, 'data' => $consumo]);\n}`,
  sqlQuery: (ctx) => `UPDATE consumos SET cantidad = ${ctx.cantidad}, subtotal = ${ctx.subtotal} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.consumo }),
};
export const CONSUMO_DELETE = {
  method: 'DELETE', route: '/api/consumos/{id}', entity: 'Consumo', operationLabel: 'Eliminar consumo',
  controllerCode: `// ConsumoController.php\npublic function destroy(Consumo $consumo) {\n    $reserva = $consumo->reserva;\n    $consumo->delete();\n    $reserva->recalcularTotal();\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `DELETE FROM consumos WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const PAGO_LIST = {
  method: 'GET', route: '/api/pagos', entity: 'Pago', operationLabel: 'Listar pagos',
  controllerCode: `// PagoController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, ...Pago::with(['reserva.huesped', 'reserva.habitaciones'])->when(!$request->incluir_anulados, fn($q) => $q->activos())->filtrar($request)->paginate(10)->toArray()]);\n}`,
  sqlQuery: () => `SELECT p.* FROM pagos p WHERE estado = 'ACTIVO' LIMIT 10 OFFSET ?;`,
  responseBody: (ctx) => ctx.page_response,
};
export const PAGO_CREATE = {
  method: 'POST', route: '/api/pagos', entity: 'Pago', operationLabel: 'Registrar pago',
  controllerCode: `// PagoController.php
public function store(Request $request) {
    $reserva = Reserva::findOrFail($request->id_reserva);
    if ($request->monto > $reserva->calcularSaldo()) return response()->json(['success' => false, 'message' => 'El monto excede el saldo pendiente'], 422);
    $pago = Pago::create(['id_reserva' => $reserva->id, 'tipo_pago' => $request->tipo_pago, 'monto' => $request->monto, 'fecha' => $request->fecha, 'estado' => 'ACTIVO']);
    return response()->json(['success' => true, 'data' => $pago, 'saldo_restante' => $reserva->calcularSaldo()], 201);
}`,
  sqlQuery: (ctx) => `SELECT (total - COALESCE((SELECT SUM(monto) FROM pagos WHERE id_reserva = ${ctx.id_reserva} AND estado='ACTIVO'),0)) AS saldo FROM reservas WHERE id = ${ctx.id_reserva};
INSERT INTO pagos (id_reserva, tipo_pago, monto, fecha, estado) VALUES (${ctx.id_reserva}, '${ctx.tipo_pago}', ${ctx.monto}, '${ctx.fecha}', 'ACTIVO');`,
  responseBody: (ctx) => ({ success: true, data: ctx.pago, saldo_restante: ctx.saldoRestante }),
};
export const PAGO_ANULAR = {
  method: 'POST', route: '/api/pagos/{id}/anular', entity: 'Pago', operationLabel: 'Anular pago',
  controllerCode: `// PagoController.php\npublic function anular(Request $request, Pago $pago) {\n    if ($pago->estaAnulado()) return response()->json(['success' => false, 'message' => 'El pago ya está anulado'], 422);\n    $pago->anular($request->motivo_anulacion);\n    return response()->json(['success' => true, 'data' => $pago, 'saldo_actualizado' => $pago->reserva->calcularSaldo()]);\n}`,
  sqlQuery: (ctx) => `UPDATE pagos SET estado = 'ANULADO', motivo_anulacion = '${ctx.motivo}', fecha_anulacion = NOW() WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.pago, saldo_actualizado: ctx.saldoActualizado }),
};

export const DASHBOARD = {
  method: 'GET', route: '/api/dashboard', entity: 'Dashboard', operationLabel: 'Obtener indicadores generales',
  controllerCode: `// DashboardController.php
public function index(Request $request) {
    return response()->json(['success' => true, 'data' => [
        'habitaciones' => [...counts por estado, 'tasa_ocupacion' => round($ocupadas / max($total,1) * 100, 2)],
        'reservas' => ['hoy' => ..., 'activas' => ..., 'pendientes' => ..., 'mes_actual' => ...],
        'ingresos' => ['hoy' => ..., 'semana' => ..., 'mes' => ..., 'anio' => ...],
        'operaciones' => ['huespedes_actuales' => ..., 'checkins_hoy' => ..., 'checkouts_hoy' => ...],
    ]]);
}`,
  sqlQuery: () => `SELECT estado, COUNT(*) FROM habitaciones GROUP BY estado;
SELECT COUNT(*) FROM reservas WHERE fecha_entrada = CURDATE();
SELECT SUM(monto) FROM pagos WHERE fecha = CURDATE();`,
  responseBody: (ctx) => ({ success: true, data: ctx.data }),
};

export const REPORTE = {
  method: 'GET', route: '/api/reportes/{tipo}', entity: 'Reporte', operationLabel: 'Generar reporte gerencial',
  controllerCode: `// ReporteController.php
public function \${tipo}(Request $request) {
    // reservas | ingresos | ocupacion | consolidado, filtrado por rango de fechas y hotel
    return response()->json(['data' => ..., 'totales' => [...]]);
}`,
  sqlQuery: (ctx) => `-- Reporte "${ctx.tipo}" agregando reservas/pagos/consumos entre ${ctx.fechaInicio} y ${ctx.fechaFin}`,
  responseBody: (ctx) => ctx.data,
};

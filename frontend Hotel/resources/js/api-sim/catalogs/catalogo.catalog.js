export const HOTEL_LIST = {
  method: 'GET', route: '/api/hoteles', entity: 'Hotel', operationLabel: 'Listar hoteles',
  controllerCode: `// HotelController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => Hotel::with(['pisos', 'habitaciones'])->filtrar($request)->get()]);\n}`,
  sqlQuery: () => `SELECT * FROM hoteles;`,
  responseBody: (ctx) => ({ success: true, data: ctx.hoteles }),
};
export const HOTEL_CREATE = {
  method: 'POST', route: '/api/hoteles', entity: 'Hotel', operationLabel: 'Crear hotel',
  controllerCode: `// HotelController.php\npublic function store(Request $request) {\n    $hotel = Hotel::create($request->validate([...]));\n    return response()->json(['success' => true, 'data' => $hotel], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO hoteles (nombre, direccion, ciudad, estado) VALUES ('${ctx.nombre}', '${ctx.direccion}', '${ctx.ciudad}', 'ACTIVO');`,
  responseBody: (ctx) => ({ success: true, data: ctx.hotel }),
};
export const HOTEL_UPDATE = {
  method: 'PUT', route: '/api/hoteles/{id}', entity: 'Hotel', operationLabel: 'Actualizar hotel',
  controllerCode: `// HotelController.php\npublic function update(Request $request, Hotel $hotel) {\n    $hotel->update($request->validated());\n    return response()->json(['success' => true, 'data' => $hotel]);\n}`,
  sqlQuery: (ctx) => `UPDATE hoteles SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.hotel }),
};
export const HOTEL_DELETE = {
  method: 'DELETE', route: '/api/hoteles/{id}', entity: 'Hotel', operationLabel: 'Cerrar hotel',
  controllerCode: `// HotelController.php\npublic function destroy(Hotel $hotel) {\n    $hotel->update(['estado' => 'CERRADO']);\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `UPDATE hoteles SET estado = 'CERRADO' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};
export const HOTEL_DASHBOARD = {
  method: 'GET', route: '/api/hoteles/{id}/dashboard', entity: 'Hotel', operationLabel: 'Dashboard del hotel',
  controllerCode: `// HotelController.php\npublic function dashboard(Hotel $hotel) {\n    return response()->json(['success' => true, 'data' => [\n        'hotel' => $hotel, 'total_habitaciones' => $hotel->habitaciones()->count(),\n        'habitaciones_disponibles' => $hotel->habitacionesDisponibles(),\n        'habitaciones_ocupadas' => $hotel->habitacionesOcupadas(),\n        'reservas_hoy' => $hotel->reservas()->whereDate('fecha_entrada', today())->count(),\n        'reservas_activas' => $hotel->reservas()->where('estado', 'EN_PROCESO')->count(),\n    ]]);\n}`,
  sqlQuery: (ctx) => `SELECT COUNT(*) FROM habitaciones WHERE id_hotel = ${ctx.id};
SELECT COUNT(*) FROM habitaciones WHERE id_hotel = ${ctx.id} AND estado = 'DISPONIBLE';
SELECT COUNT(*) FROM reservas WHERE id_hotel = ${ctx.id} AND fecha_entrada = CURDATE();`,
  responseBody: (ctx) => ({ success: true, data: ctx.data }),
};

export const PISO_LIST = {
  method: 'GET', route: '/api/pisos', entity: 'Piso', operationLabel: 'Listar pisos',
  controllerCode: `// PisoController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => Piso::with(['hotel', 'habitaciones'])->filtrar($request)->get()]);\n}`,
  sqlQuery: () => `SELECT p.*, h.nombre AS hotel_nombre FROM pisos p JOIN hoteles h ON h.id = p.id_hotel;`,
  responseBody: (ctx) => ({ success: true, data: ctx.pisos }),
};
export const PISO_CREATE = {
  method: 'POST', route: '/api/pisos', entity: 'Piso', operationLabel: 'Crear piso',
  controllerCode: `// PisoController.php\npublic function store(Request $request) {\n    $piso = Piso::create($request->validate([...]));\n    return response()->json(['success' => true, 'data' => $piso], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO pisos (id_hotel, numero, estado) VALUES (${ctx.id_hotel}, ${ctx.numero}, 'ACTIVO');`,
  responseBody: (ctx) => ({ success: true, data: ctx.piso }),
};
export const PISO_UPDATE = {
  method: 'PUT', route: '/api/pisos/{id}', entity: 'Piso', operationLabel: 'Actualizar piso',
  controllerCode: `// PisoController.php\npublic function update(Request $request, Piso $piso) {\n    $piso->update($request->validated());\n    return response()->json(['success' => true, 'data' => $piso]);\n}`,
  sqlQuery: (ctx) => `UPDATE pisos SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.piso }),
};
export const PISO_DELETE = {
  method: 'DELETE', route: '/api/pisos/{id}', entity: 'Piso', operationLabel: 'Eliminar piso',
  controllerCode: `// PisoController.php\npublic function destroy(Piso $piso) {\n    if ($piso->habitaciones()->count() > 0) return response()->json(['success' => false, 'message' => 'El piso tiene habitaciones'], 422);\n    $piso->delete();\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `SELECT COUNT(*) FROM habitaciones WHERE id_piso = ${ctx.id}; -- si 0: DELETE FROM pisos WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const TIPO_LIST = {
  method: 'GET', route: '/api/tipo-habitaciones', entity: 'TipoHabitacion', operationLabel: 'Listar tipos de habitación',
  controllerCode: `// TipoHabitacionController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => TipoHabitacion::filtrar($request)->get()]);\n}`,
  sqlQuery: () => `SELECT * FROM tipo_habitaciones;`,
  responseBody: (ctx) => ({ success: true, data: ctx.tipos }),
};
export const TIPO_CREATE = {
  method: 'POST', route: '/api/tipo-habitaciones', entity: 'TipoHabitacion', operationLabel: 'Crear tipo de habitación',
  controllerCode: `// TipoHabitacionController.php\npublic function store(Request $request) {\n    if (!Auth::user()->tienePermiso('crear_tipos_habitaciones')) abort(403);\n    $tipo = TipoHabitacion::create($request->validate([...]));\n    return response()->json(['success' => true, 'data' => $tipo], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO tipo_habitaciones (nombre, descripcion, capacidad, precio_base, estado) VALUES ('${ctx.nombre}', '${ctx.descripcion ?? ''}', ${ctx.capacidad}, ${ctx.precio_base}, 'ACTIVO');`,
  responseBody: (ctx) => ({ success: true, data: ctx.tipo }),
};
export const TIPO_UPDATE = {
  method: 'PUT', route: '/api/tipo-habitaciones/{id}', entity: 'TipoHabitacion', operationLabel: 'Actualizar tipo de habitación',
  controllerCode: `// TipoHabitacionController.php\npublic function update(Request $request, TipoHabitacion $tipo) {\n    if (!Auth::user()->tienePermiso('editar_tipos_habitaciones')) abort(403);\n    $tipo->update($request->validated());\n    return response()->json(['success' => true, 'data' => $tipo]);\n}`,
  sqlQuery: (ctx) => `UPDATE tipo_habitaciones SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.tipo }),
};
export const TIPO_DELETE = {
  method: 'DELETE', route: '/api/tipo-habitaciones/{id}', entity: 'TipoHabitacion', operationLabel: 'Eliminar tipo de habitación',
  controllerCode: `// TipoHabitacionController.php\npublic function destroy(TipoHabitacion $tipo) {\n    if (!Auth::user()->tienePermiso('eliminar_tipos_habitaciones')) abort(403);\n    if ($tipo->habitaciones()->count() > 0) return response()->json(['success' => false, 'message' => 'El tipo tiene habitaciones asociadas'], 422);\n    $tipo->delete();\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `SELECT COUNT(*) FROM habitaciones WHERE id_tipo = ${ctx.id}; -- si 0: DELETE FROM tipo_habitaciones WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

export const HABITACION_LIST = {
  method: 'GET', route: '/api/habitaciones', entity: 'Habitación', operationLabel: 'Listar habitaciones',
  controllerCode: `// HabitacionController.php\npublic function index(Request $request) {\n    return response()->json(['success' => true, 'data' => Habitacion::with(['hotel', 'piso', 'tipo'])->filtrar($request)->get()]);\n}`,
  sqlQuery: () => `SELECT h.*, t.nombre AS tipo_nombre, t.precio_base FROM habitaciones h JOIN tipo_habitaciones t ON t.id = h.id_tipo;`,
  responseBody: (ctx) => ({ success: true, data: ctx.habitaciones }),
};
export const HABITACION_DISPONIBLES = {
  method: 'GET', route: '/api/habitaciones-disponibles', entity: 'Habitación', operationLabel: 'Listar habitaciones disponibles',
  controllerCode: `// HabitacionController.php\npublic function disponibles(Request $request) {\n    return response()->json(['success' => true, 'data' => Habitacion::disponibles()->porHotel($request->id_hotel)->with('tipo')->get()]);\n}`,
  sqlQuery: (ctx) => `SELECT * FROM habitaciones WHERE estado = 'DISPONIBLE' ${ctx.idHotel ? `AND id_hotel = ${ctx.idHotel}` : ''};`,
  responseBody: (ctx) => ({ success: true, data: ctx.habitaciones }),
};
export const HABITACION_CREATE = {
  method: 'POST', route: '/api/habitaciones', entity: 'Habitación', operationLabel: 'Crear habitación',
  controllerCode: `// HabitacionController.php\npublic function store(Request $request) {\n    $habitacion = Habitacion::create($request->validate([...]));\n    return response()->json(['success' => true, 'data' => $habitacion], 201);\n}`,
  sqlQuery: (ctx) => `INSERT INTO habitaciones (id_hotel, id_piso, id_tipo, numero, estado, descripcion) VALUES (${ctx.id_hotel}, ${ctx.id_piso}, ${ctx.id_tipo}, '${ctx.numero}', 'DISPONIBLE', '${ctx.descripcion ?? ''}');`,
  responseBody: (ctx) => ({ success: true, data: ctx.habitacion }),
};
export const HABITACION_UPDATE = {
  method: 'PUT', route: '/api/habitaciones/{id}', entity: 'Habitación', operationLabel: 'Actualizar habitación',
  controllerCode: `// HabitacionController.php\npublic function update(Request $request, Habitacion $habitacion) {\n    $habitacion->update($request->validated());\n    return response()->json(['success' => true, 'data' => $habitacion]);\n}`,
  sqlQuery: (ctx) => `UPDATE habitaciones SET ${ctx.fields} WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.habitacion }),
};
export const HABITACION_CAMBIAR_ESTADO = {
  method: 'POST', route: '/api/habitaciones/{id}/cambiar-estado', entity: 'Habitación', operationLabel: 'Cambiar estado de habitación',
  controllerCode: `// HabitacionController.php\npublic function cambiarEstado(Request $request, Habitacion $habitacion) {\n    $habitacion->cambiarEstado($request->estado);\n    return response()->json(['success' => true, 'data' => $habitacion]);\n}`,
  sqlQuery: (ctx) => `UPDATE habitaciones SET estado = '${ctx.estado}' WHERE id = ${ctx.id};`,
  responseBody: (ctx) => ({ success: true, data: ctx.habitacion }),
};
export const HABITACION_DELETE = {
  method: 'DELETE', route: '/api/habitaciones/{id}', entity: 'Habitación', operationLabel: 'Dar de baja habitación',
  controllerCode: `// HabitacionController.php\npublic function destroy(Habitacion $habitacion) {\n    $habitacion->update(['estado' => 'DEMOLIDA']);\n    return response()->json(['success' => true]);\n}`,
  sqlQuery: (ctx) => `UPDATE habitaciones SET estado = 'DEMOLIDA' WHERE id = ${ctx.id};`,
  responseBody: () => ({ success: true }),
};

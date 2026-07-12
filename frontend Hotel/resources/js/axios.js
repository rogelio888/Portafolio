// Fachada que preserva la interfaz axios original (`.get/post/put/delete`, forma de
// respuesta `{ data }`, errores `{ response: { status, data } }`), pero resuelve contra
// el repositorio local (resources/js/data/db.js) en localStorage en vez del backend
// Laravel real. Los stores de Pinia y las vistas no necesitan ningún cambio.
import * as db from './data/db';
import { ApiError } from './data/db';

function parseUrl(url) {
  const [pathname, queryString] = url.split('?');
  const params = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => { params[k] = v; });
  }
  return { pathname, params };
}

function dispatch(method, pathname, body, params) {
  let m;

  // --- Auth ---
  if (method === 'POST' && pathname === '/auth/login') return db.authenticate(body?.usuario, body?.password);
  if (method === 'POST' && pathname === '/auth/logout') return db.logout();
  if (method === 'GET' && pathname === '/auth/me') return db.fetchMe();
  if (method === 'POST' && pathname === '/auth/cambiar-password') return db.cambiarPassword(body || {});
  if (method === 'POST' && pathname === '/auth/verificar-permiso') return { success: true, data: { permiso: body?.permiso, tiene_permiso: false } };

  // --- Hoteles ---
  if (method === 'GET' && pathname === '/hoteles') return db.listHoteles(params);
  if (method === 'POST' && pathname === '/hoteles') return db.createHotel(body);
  if ((m = pathname.match(/^\/hoteles\/(\d+)\/dashboard$/)) && method === 'GET') return db.hotelDashboardData(Number(m[1]));
  if ((m = pathname.match(/^\/hoteles\/(\d+)$/)) && method === 'PUT') return db.updateHotel(Number(m[1]), body);
  if ((m = pathname.match(/^\/hoteles\/(\d+)$/)) && method === 'DELETE') return db.deleteHotel(Number(m[1]));

  // --- Pisos ---
  if (method === 'GET' && pathname === '/pisos') return db.listPisos(params);
  if (method === 'POST' && pathname === '/pisos') return db.createPiso(body);
  if ((m = pathname.match(/^\/pisos\/(\d+)$/)) && method === 'PUT') return db.updatePiso(Number(m[1]), body);
  if ((m = pathname.match(/^\/pisos\/(\d+)$/)) && method === 'DELETE') return db.deletePiso(Number(m[1]));

  // --- Tipos de habitación ---
  if (method === 'GET' && pathname === '/tipo-habitaciones') return db.listTipos(params);
  if (method === 'POST' && pathname === '/tipo-habitaciones') return db.createTipo(body);
  if ((m = pathname.match(/^\/tipo-habitaciones\/(\d+)$/)) && method === 'PUT') return db.updateTipo(Number(m[1]), body);
  if ((m = pathname.match(/^\/tipo-habitaciones\/(\d+)$/)) && method === 'DELETE') return db.deleteTipo(Number(m[1]));

  // --- Habitaciones ---
  if (method === 'GET' && pathname === '/habitaciones-disponibles') return db.listHabitacionesDisponibles(params.id_hotel);
  if (method === 'GET' && pathname === '/habitaciones') return db.listHabitaciones(params);
  if (method === 'POST' && pathname === '/habitaciones') return db.createHabitacion(body);
  if ((m = pathname.match(/^\/habitaciones\/(\d+)\/cambiar-estado$/)) && method === 'POST') return db.cambiarEstadoHabitacion(Number(m[1]), body?.estado);
  if ((m = pathname.match(/^\/habitaciones\/(\d+)$/)) && method === 'PUT') return db.updateHabitacion(Number(m[1]), body);
  if ((m = pathname.match(/^\/habitaciones\/(\d+)$/)) && method === 'DELETE') return db.deleteHabitacion(Number(m[1]));

  // --- Huéspedes ---
  if (method === 'GET' && pathname === '/huespedes') return db.listHuespedes(params);
  if (method === 'POST' && pathname === '/huespedes') return db.createHuesped(body);
  if (method === 'POST' && pathname === '/huespedes/buscar-ci') return db.buscarHuespedPorCi(body?.ci);
  if ((m = pathname.match(/^\/huespedes\/(\d+)$/)) && method === 'PUT') return db.updateHuesped(Number(m[1]), body);
  if ((m = pathname.match(/^\/huespedes\/(\d+)$/)) && method === 'DELETE') return db.deleteHuesped(Number(m[1]));

  // --- Reservas (rutas correctas + variante con doble /api/ presente en el código fuente real) ---
  if (method === 'GET' && pathname === '/reservas') return db.listReservas(params);
  if (method === 'POST' && pathname === '/reservas') return db.createReserva(body);
  if ((m = pathname.match(/^\/(?:api\/)?reservas\/(\d+)\/confirmar$/)) && method === 'POST') return db.confirmarReserva(Number(m[1]));
  if ((m = pathname.match(/^\/(?:api\/)?reservas\/(\d+)\/checkin$/)) && method === 'POST') return db.checkInReserva(Number(m[1]));
  if ((m = pathname.match(/^\/(?:api\/)?reservas\/(\d+)\/checkout$/)) && method === 'POST') return db.checkOutReserva(Number(m[1]));
  if ((m = pathname.match(/^\/(?:api\/)?reservas\/(\d+)$/)) && method === 'GET') return db.showReserva(Number(m[1]));
  if ((m = pathname.match(/^\/(?:api\/)?reservas\/(\d+)$/)) && method === 'PUT') return db.updateReserva(Number(m[1]), body);
  if ((m = pathname.match(/^\/(?:api\/)?reservas\/(\d+)$/)) && method === 'DELETE') return db.cancelarReserva(Number(m[1]));

  // --- Servicios ---
  if (method === 'GET' && pathname === '/servicios') return db.listServicios(params);
  if (method === 'POST' && pathname === '/servicios') return db.createServicio(body);
  if ((m = pathname.match(/^\/servicios\/(\d+)\/calcular-precio$/)) && method === 'POST') {
    return { success: true, data: { precio_total: 0 } };
  }
  if ((m = pathname.match(/^\/servicios\/(\d+)$/)) && method === 'PUT') return db.updateServicio(Number(m[1]), body);
  if ((m = pathname.match(/^\/servicios\/(\d+)$/)) && method === 'DELETE') return db.deleteServicio(Number(m[1]));

  // --- Consumos ---
  if ((m = pathname.match(/^\/consumos\/reserva\/(\d+)$/)) && method === 'GET') return db.consumosPorReserva(Number(m[1]));
  if (method === 'GET' && pathname === '/consumos') return db.listConsumos(params);
  if (method === 'POST' && pathname === '/consumos') return db.createConsumo(body);
  if ((m = pathname.match(/^\/consumos\/(\d+)$/)) && method === 'GET') { const c = db.listConsumos({}).data.data; return { success: true, data: c.find((x) => x.id === Number(m[1])) }; }
  if ((m = pathname.match(/^\/consumos\/(\d+)$/)) && method === 'PUT') return db.updateConsumo(Number(m[1]), body);
  if ((m = pathname.match(/^\/consumos\/(\d+)$/)) && method === 'DELETE') return db.deleteConsumo(Number(m[1]));

  // --- Pagos (+ variante con doble /api/ presente en el código fuente real) ---
  if ((m = pathname.match(/^\/(?:api\/)?pagos\/reserva\/(\d+)$/)) && method === 'GET') return db.pagosPorReserva(Number(m[1]));
  if (method === 'GET' && pathname === '/pagos') return db.listPagos(params);
  if (method === 'POST' && pathname === '/pagos') return db.createPago(body);
  if ((m = pathname.match(/^\/pagos\/(\d+)\/anular$/)) && method === 'POST') return db.anularPago(Number(m[1]), body?.motivo_anulacion);

  // --- Empleados ---
  if (method === 'GET' && pathname === '/empleados') return db.listEmpleados(params);
  if (method === 'POST' && pathname === '/empleados') return db.createEmpleado(body);
  if ((m = pathname.match(/^\/empleados\/(\d+)\/permisos$/)) && method === 'GET') return db.permisosDeEmpleado(Number(m[1]));
  if ((m = pathname.match(/^\/empleados\/(\d+)$/)) && method === 'PUT') return db.updateEmpleado(Number(m[1]), body);
  if ((m = pathname.match(/^\/empleados\/(\d+)$/)) && method === 'DELETE') return db.deleteEmpleado(Number(m[1]));

  // --- Roles y permisos ---
  if (method === 'GET' && pathname === '/roles') return db.listRoles();
  if (method === 'POST' && pathname === '/roles') return db.createRol(body);
  if ((m = pathname.match(/^\/roles\/(\d+)\/asignar-permisos$/)) && method === 'POST') return db.asignarPermisosRol(Number(m[1]), body?.permisos);
  if ((m = pathname.match(/^\/roles\/(\d+)$/)) && method === 'GET') { const r = db.listRoles().data; return { success: true, data: r.find((x) => x.id === Number(m[1])) }; }
  if ((m = pathname.match(/^\/roles\/(\d+)$/)) && method === 'PUT') return db.updateRol(Number(m[1]), body);
  if ((m = pathname.match(/^\/roles\/(\d+)$/)) && method === 'DELETE') return db.deleteRol(Number(m[1]));
  if (method === 'GET' && pathname === '/permisos') return db.listPermisos();

  // --- Mantenimientos (+ variante con doble /api/ presente en el código fuente real) ---
  if (method === 'GET' && pathname === '/mantenimientos') return db.listMantenimientos(params);
  if (method === 'POST' && pathname === '/mantenimientos') return db.createMantenimiento(body);
  if ((m = pathname.match(/^\/(?:api\/)?mantenimientos\/(\d+)\/completar$/)) && method === 'POST') return db.completarMantenimiento(Number(m[1]));
  if ((m = pathname.match(/^\/(?:api\/)?mantenimientos\/(\d+)$/)) && method === 'GET') { const l = db.listMantenimientos({}).data; return { success: true, data: l.find((x) => x.id === Number(m[1])) }; }
  if ((m = pathname.match(/^\/(?:api\/)?mantenimientos\/(\d+)$/)) && method === 'PUT') return db.updateMantenimiento(Number(m[1]), body);
  if ((m = pathname.match(/^\/(?:api\/)?mantenimientos\/(\d+)$/)) && method === 'DELETE') return db.deleteMantenimiento(Number(m[1]));

  // --- Dashboard ---
  if (method === 'GET' && pathname === '/dashboard') return db.dashboardData(params);
  if (method === 'GET' && pathname === '/dashboard/ingresos-mensuales') return db.ingresosMensuales(params.anio ? Number(params.anio) : undefined);
  if (method === 'GET' && pathname === '/dashboard/reservas-proximas') return db.reservasProximas(params.dias);
  if (method === 'GET' && pathname === '/dashboard/habitaciones-estado') return db.habitacionesPorEstado();
  if (method === 'GET' && pathname === '/dashboard/top-servicios') return db.topServicios(params.limit);

  // --- Reportes ---
  if (method === 'GET' && pathname === '/reportes/reservas') return db.reporteReservas(params);
  if (method === 'GET' && pathname === '/reportes/ingresos') return db.reporteIngresos(params);
  if (method === 'GET' && pathname === '/reportes/ocupacion') return db.reporteOcupacion(params);
  if (method === 'GET' && pathname === '/reportes/consumos') return db.reporteConsumos(params);
  if (method === 'GET' && pathname === '/reportes/consolidado') return db.reporteConsolidado(params);

  // --- Auditoría / logs ---
  if (method === 'GET' && pathname === '/auditoria') return db.listAuditoria(params);
  if (method === 'GET' && pathname === '/logs') return db.listLogs();

  // --- Solicitudes de autorización ---
  if (method === 'GET' && pathname === '/solicitudes-autorizacion') return db.listSolicitudes();
  if (method === 'POST' && pathname === '/solicitudes-autorizacion') return db.createSolicitud(body);
  if ((m = pathname.match(/^\/solicitudes-autorizacion\/(\d+)\/aprobar$/)) && method === 'POST') return db.aprobarSolicitud(Number(m[1]), body?.comentario);
  if ((m = pathname.match(/^\/solicitudes-autorizacion\/(\d+)\/rechazar$/)) && method === 'POST') return db.rechazarSolicitud(Number(m[1]), body?.comentario);

  throw new ApiError(404, { success: false, message: `Endpoint simulado no reconocido: ${method} ${pathname}` });
}

async function request(method, url, body, config) {
  const { pathname, params: urlParams } = parseUrl(url);
  const params = { ...urlParams, ...(config?.params || {}) };
  try {
    const data = dispatch(method, pathname, body, params);
    return { data };
  } catch (error) {
    if (error instanceof ApiError) {
      return Promise.reject({ response: { status: error.status, data: error.body } });
    }
    console.error('Error simulado inesperado:', error);
    return Promise.reject({ response: { status: 500, data: { success: false, message: 'Error interno del servidor simulado.' } } });
  }
}

const axiosInstance = {
  get(url, config) { return request('GET', url, undefined, config); },
  post(url, body, config) { return request('POST', url, body, config); },
  put(url, body, config) { return request('PUT', url, body, config); },
  delete(url, config) { return request('DELETE', url, undefined, config); },
};

export default axiosInstance;

// Fachada que preserva la interfaz axios original (`api.get/post/put/delete`,
// forma de respuesta `{ data }`, errores `{ response: { status, data } }`,
// `responseType: 'blob'`), pero resuelve contra el repositorio local
// (src/data/db.ts) en localStorage en vez de un backend Laravel real.
// Las vistas y el store de auth no necesitan ningún cambio.
import * as db from '../data/db';
import { ApiError } from '../data/db';

interface RequestConfig {
  params?: Record<string, any>;
  responseType?: 'blob' | 'json';
}

function parseUrl(url: string) {
  const [pathname, queryString] = url.split('?');
  const params: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => { params[k] = v; });
  }
  return { pathname, params };
}

function dispatch(method: string, pathname: string, body: any, params: Record<string, any>, config?: RequestConfig): any {
  const asBlob = config?.responseType === 'blob';
  let m: RegExpMatchArray | null;

  // --- Auth ---
  if (method === 'POST' && pathname === '/login') return db.authenticate(body?.email, body?.password);
  if (method === 'POST' && pathname === '/logout') return db.logout();
  if (method === 'GET' && pathname === '/user') return db.fetchAuthenticatedUser();

  // --- Estudiantes ---
  if (method === 'GET' && pathname === '/students') return db.listStudents(params.q);
  if (method === 'POST' && pathname === '/students') return db.createStudent(body);
  if ((m = pathname.match(/^\/students\/(\d+)\/debts$/)) && method === 'GET') return db.getStudentDebts(Number(m[1]));
  if ((m = pathname.match(/^\/students\/(\d+)$/)) && method === 'PUT') return db.updateStudent(Number(m[1]), body);

  // --- Cursos ---
  if (method === 'GET' && pathname === '/courses') return db.listCourses();
  if (method === 'POST' && pathname === '/courses') return db.createCourse(body);
  if ((m = pathname.match(/^\/courses\/(\d+)$/)) && method === 'DELETE') return db.deleteCourse(Number(m[1]));

  // --- Periodos ---
  if (method === 'GET' && pathname === '/periods') return db.listPeriods();
  if (method === 'GET' && pathname === '/periods/active') return db.getActivePeriod();
  if ((m = pathname.match(/^\/periods\/by-year\/(\d+)$/)) && method === 'GET') return db.getPeriodByYear(Number(m[1]));
  if (method === 'POST' && pathname === '/periods') return db.createPeriod(body);
  if ((m = pathname.match(/^\/periods\/(\d+)\/courses\/(\d+)\/fees$/)) && method === 'PUT') return db.updateCourseFee(Number(m[1]), Number(m[2]), Number(body?.amount));
  if ((m = pathname.match(/^\/periods\/(\d+)$/)) && method === 'PUT') return db.updatePeriod(Number(m[1]), body);

  // --- Caja / Pagos ---
  if (method === 'POST' && pathname === '/payments') return db.createPayment(body);
  if ((m = pathname.match(/^\/payments\/(\d+)\/status$/)) && method === 'GET') return db.getPaymentStatus(Number(m[1]));
  if ((m = pathname.match(/^\/payments\/(\d+)$/)) && method === 'GET') return db.getPaymentReceipt(Number(m[1]));
  if (method === 'POST' && pathname === '/banco/webhook') return db.bankWebhook(body);
  if (method === 'GET' && pathname === '/morosos') return db.fetchMorosos();
  if (method === 'POST' && pathname === '/morosos/force-check') return db.forceMorososCheck();

  // --- Reportes ---
  if (method === 'GET' && pathname === '/reports/dashboard') return db.getDashboardStats();
  if (method === 'GET' && pathname === '/reports/daily') return asBlob ? db.generateDailyPdf(params.date) : db.getDailyReport(params.date);
  if ((m = pathname.match(/^\/reports\/estado-cuenta\/(\d+)$/)) && method === 'GET') return db.generateEstadoCuentaPdf(Number(m[1]));
  if (method === 'GET' && pathname === '/reports/morosidad') return db.generateMorosidadPdf();

  // --- Portal público ---
  if ((m = pathname.match(/^\/portal\/students\/([^/]+)$/)) && method === 'GET') return db.portalGetStudent(decodeURIComponent(m[1]));
  if (method === 'POST' && pathname === '/portal/payments/qr') return db.portalCreateQrPayment(body?.codigo, body?.debt_ids || []);
  if ((m = pathname.match(/^\/portal\/payments\/(\d+)\/status$/)) && method === 'GET') return db.getPaymentStatus(Number(m[1]));
  if ((m = pathname.match(/^\/portal\/payments\/(\d+)\/receipt$/)) && method === 'GET') return db.portalGetReceipt(Number(m[1]));
  if ((m = pathname.match(/^\/portal\/reports\/estado-cuenta\/(\d+)$/)) && method === 'GET') return db.generateEstadoCuentaPdf(Number(m[1]));

  // --- Usuarios / Roles ---
  if (method === 'GET' && pathname === '/users') return db.listUsuarios();
  if (method === 'POST' && pathname === '/users') return db.createUsuario(body);
  if ((m = pathname.match(/^\/users\/(\d+)$/)) && method === 'PUT') return db.updateUsuario(Number(m[1]), body);
  if (method === 'GET' && pathname === '/roles') return db.listRoles();
  if (method === 'POST' && pathname === '/roles') return db.createRole(body);
  if ((m = pathname.match(/^\/roles\/(\d+)\/permissions$/)) && method === 'PUT') return db.updateRolePermissions(Number(m[1]), body?.permisos || []);

  // --- Bitácora ---
  if (method === 'GET' && pathname === '/audit-logs') return db.getAuditLogs(params);

  throw new ApiError(404, { message: `Endpoint simulado no reconocido: ${method} ${pathname}` });
}

async function request(method: string, url: string, body?: any, config?: RequestConfig) {
  const { pathname, params: urlParams } = parseUrl(url);
  const params = { ...urlParams, ...(config?.params || {}) };
  try {
    const data = dispatch(method, pathname, body, params, config);
    if (config?.responseType === 'blob' && !(data instanceof Blob)) {
      return { data: new Blob([JSON.stringify(data)], { type: 'application/pdf' }) };
    }
    return { data };
  } catch (error: any) {
    if (error instanceof ApiError) {
      return Promise.reject({ response: { status: error.status, data: error.body } });
    }
    return Promise.reject({ response: { status: 500, data: { message: 'Error interno del servidor simulado.' } } });
  }
}

const api = {
  get(url: string, config?: RequestConfig) {
    return request('GET', url, undefined, config);
  },
  post(url: string, body?: any, config?: RequestConfig) {
    return request('POST', url, body, config);
  },
  put(url: string, body?: any, config?: RequestConfig) {
    return request('PUT', url, body, config);
  },
  delete(url: string, config?: RequestConfig) {
    return request('DELETE', url, undefined, config);
  },
};

export default api;

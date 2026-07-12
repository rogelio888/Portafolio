// Fachada que preserva la interfaz fetch-like original (`api.get/post/put/patch/delete`),
// pero resuelve contra el repositorio local (db.js) en localStorage en vez de un
// backend real. Las vistas que la consumen (Login, App, Roles, Usuarios, Bitácora)
// no necesitan cambios.
import * as db from '../data/db';

function currentUserId() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw).id : null;
  } catch {
    return null;
  }
}

function wrapError(message, errors) {
  const err = new Error(message);
  if (errors) err.errors = errors;
  return err;
}

async function route(method, endpoint, body) {
  // --- Auth ---
  if (method === 'POST' && endpoint === '/login') {
    return db.authenticate(body.email, body.password);
  }
  if (method === 'POST' && endpoint === '/logout') {
    const raw = localStorage.getItem('user');
    db.registerLogout(raw ? JSON.parse(raw) : null);
    return { message: 'Sesión cerrada.' };
  }
  if (method === 'GET' && endpoint === '/user') {
    const profile = db.getCurrentUserProfile(currentUserId());
    if (!profile) throw wrapError('Usuario no encontrado.');
    return profile;
  }

  // --- Roles ---
  if (method === 'GET' && endpoint === '/roles') {
    return db.getRoles();
  }
  if (method === 'POST' && endpoint === '/roles') {
    return db.createRole(body);
  }
  let m = endpoint.match(/^\/roles\/(\d+)$/);
  if (m && method === 'PUT') {
    return db.updateRole(Number(m[1]), body);
  }
  if (m && method === 'DELETE') {
    return db.deleteRole(Number(m[1]));
  }

  // --- Usuarios ---
  if (method === 'GET' && endpoint === '/users') {
    return db.getUsuarios();
  }
  if (method === 'POST' && endpoint === '/users') {
    return db.createUsuario(body);
  }
  m = endpoint.match(/^\/users\/(\d+)$/);
  if (m && method === 'PUT') {
    return db.updateUsuario(Number(m[1]), body);
  }
  m = endpoint.match(/^\/users\/(\d+)\/toggle$/);
  if (m && method === 'PATCH') {
    return db.toggleUsuarioStatus(Number(m[1]));
  }

  // --- Bitácora ---
  if (method === 'GET' && endpoint === '/audit-logs') {
    return db.getBitacora();
  }

  throw wrapError(`Endpoint simulado no reconocido: ${method} ${endpoint}`);
}

async function request(endpoint, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : undefined;
  try {
    return await route(method, endpoint, body);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw wrapError('Ha ocurrido un error en la solicitud.');
    }
    throw error;
  }
}

const api = {
  get(endpoint) {
    return request(endpoint, { method: 'GET' });
  },
  post(endpoint, body) {
    return request(endpoint, { method: 'POST', body: JSON.stringify(body ?? {}) });
  },
  put(endpoint, body) {
    return request(endpoint, { method: 'PUT', body: JSON.stringify(body ?? {}) });
  },
  patch(endpoint, body) {
    return request(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  },
  delete(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  },
};

export default api;

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const KEYS = {
  branches: 'fitscan_demo_branches',
  memberships: 'fitscan_demo_memberships',
  clients: 'fitscan_demo_clients',
  payments: 'fitscan_demo_payments',
  attendance: 'fitscan_demo_attendance',
  shifts: 'fitscan_demo_shifts',
  users: 'fitscan_demo_users',
  roles: 'fitscan_demo_roles',
  audit: 'fitscan_demo_audit',
};

const today = new Date().toISOString().split('T')[0];
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_BRANCHES = [
  {
    id: 'adf0af1a-d090-4dc2-a2ae-2ea18859c90b',
    name: 'Sucursal Central Equipetrol',
    code: 'EQP-01',
    address: 'Av. San Martín #450, Equipetrol',
    phone: '+591 3 3456789',
    email: 'equipetrol@fitscangym.demo',
    is_active: true,
    clients_count: 4,
    users_count: 2,
  },
  {
    id: '63501637-608c-4ca5-8c61-176b68dc907c',
    name: 'Sucursal Villa 1ro de Mayo',
    code: 'VIL-02',
    address: 'Av. Cumavi #120, Villa 1ro de Mayo',
    phone: '+591 3 3567890',
    email: 'villa@fitscangym.demo',
    is_active: true,
    clients_count: 2,
    users_count: 1,
  },
];

const INITIAL_MEMBERSHIPS = [
  {
    id: 'mem-1',
    name: 'Plan Mensual Pase Libre',
    duration_days: 30,
    price_bs: 250,
    description: 'Acceso ilimitado a sala de musculación, cardio y clases grupales.',
    features: ['Musculación ilimitada', 'Evaluación física inicial', 'Acceso QR Kiosco'],
    is_popular: true,
    is_multi_branch: false,
    is_active: true,
    active_clients_count: 3,
  },
  {
    id: 'mem-2',
    name: 'Plan Estudiante AM',
    duration_days: 30,
    price_bs: 180,
    description: 'Ingreso en horario matutino de 06:00 a 14:00 horas con carnet.',
    features: ['Horario 06:00 - 14:00', 'Rutina personalizada', 'Acceso QR'],
    is_popular: false,
    is_multi_branch: false,
    is_active: true,
    active_clients_count: 1,
  },
  {
    id: 'mem-3',
    name: 'Plan Trimestral Multi-Sede',
    duration_days: 90,
    price_bs: 650,
    description: 'Entrena en cualquier sucursal FitScan durante 3 meses continuos.',
    features: ['Acceso Multi-Sede', 'Congelamiento 10 días', 'Asesoría nutricional'],
    is_popular: false,
    is_multi_branch: true,
    is_active: true,
    active_clients_count: 1,
  },
  {
    id: 'mem-4',
    name: 'Plan Anual VIP',
    duration_days: 365,
    price_bs: 2200,
    description: 'Membresía anual completa con casillero privado y toallas.',
    features: ['Multi-Sede total', 'Invitados fines de semana', 'Locker privado'],
    is_popular: false,
    is_multi_branch: true,
    is_active: true,
    active_clients_count: 0,
  },
];

const INITIAL_CLIENTS = [
  {
    id: 'cli-1',
    qr_token: 'FITSCAN-QR-1001',
    first_name: 'Mateo',
    last_name: 'Vargas Peña',
    email: 'mateo.vargas@demo.bo',
    phone: '77011223',
    address: 'Barrio Equipetrol Calle 5',
    birth_date: '1997-04-12',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    branch_id: INITIAL_BRANCHES[0].id,
    branch: { id: INITIAL_BRANCHES[0].id, name: INITIAL_BRANCHES[0].name },
    status: 'active',
    computed_status: 'active',
    created_at: addDays(-45),
    active_membership: {
      id: 'cm-1',
      start_date: addDays(-12),
      end_date: addDays(18),
      membership: INITIAL_MEMBERSHIPS[0],
    },
    attendance_dates: [addDays(-3), addDays(-1)],
  },
  {
    id: 'cli-2',
    qr_token: 'FITSCAN-QR-1002',
    first_name: 'Luciana',
    last_name: 'Salazar',
    email: 'luciana.s@demo.bo',
    phone: '78543210',
    address: 'Av. Cristo Redentor 4to Anillo',
    birth_date: '1999-08-22',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    branch_id: INITIAL_BRANCHES[0].id,
    branch: { id: INITIAL_BRANCHES[0].id, name: INITIAL_BRANCHES[0].name },
    status: 'active',
    computed_status: 'active',
    created_at: addDays(-60),
    active_membership: {
      id: 'cm-2',
      start_date: addDays(-20),
      end_date: addDays(70),
      membership: INITIAL_MEMBERSHIPS[2],
    },
    attendance_dates: [today, addDays(-2)],
  },
  {
    id: 'cli-3',
    qr_token: 'FITSCAN-QR-1003',
    first_name: 'Diego',
    last_name: 'Morales',
    email: 'diego.m@demo.bo',
    phone: '76998877',
    address: 'Villa 1ro de Mayo Av. Cumavi',
    birth_date: '1995-11-03',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    branch_id: INITIAL_BRANCHES[1].id,
    branch: { id: INITIAL_BRANCHES[1].id, name: INITIAL_BRANCHES[1].name },
    status: 'expired',
    computed_status: 'expired',
    created_at: addDays(-90),
    latest_membership: {
      id: 'cm-3',
      start_date: addDays(-35),
      end_date: addDays(-5),
      membership: INITIAL_MEMBERSHIPS[0],
    },
    attendance_dates: [addDays(-10)],
  },
  {
    id: 'cli-4',
    qr_token: 'FITSCAN-QR-1004',
    first_name: 'Camila',
    last_name: 'Justiniano',
    email: 'camila.j@demo.bo',
    phone: '75012398',
    address: 'Urb. Las Palmas',
    birth_date: '2001-02-19',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    branch_id: INITIAL_BRANCHES[0].id,
    branch: { id: INITIAL_BRANCHES[0].id, name: INITIAL_BRANCHES[0].name },
    status: 'active',
    computed_status: 'active',
    created_at: addDays(-28),
    active_membership: {
      id: 'cm-4',
      start_date: addDays(-26),
      end_date: addDays(4),
      membership: INITIAL_MEMBERSHIPS[1],
    },
    attendance_dates: [addDays(-1)],
  },
];

const INITIAL_PAYMENTS = [
  {
    id: 'pay-1',
    receipt_number: 'REC-2026-0041',
    client_id: 'cli-1',
    client_name: 'Mateo Vargas Peña',
    client: { id: 'cli-1', full_name: 'Mateo Vargas Peña' },
    plan_name: 'Plan Mensual Pase Libre',
    concept: 'Renovación Plan Mensual Pase Libre',
    amount_bs: 250,
    amount: 250,
    payment_method: 'qr_transfer',
    paid_at: `${today} 08:45`,
    branch_id: INITIAL_BRANCHES[0].id,
    branch_name: INITIAL_BRANCHES[0].name,
    branch_address: INITIAL_BRANCHES[0].address,
    processed_by: 'Administrador FitScan',
  },
  {
    id: 'pay-2',
    receipt_number: 'REC-2026-0042',
    client_id: 'cli-2',
    client_name: 'Luciana Salazar',
    client: { id: 'cli-2', full_name: 'Luciana Salazar' },
    plan_name: 'Plan Trimestral Multi-Sede',
    concept: 'Inscripción Plan Trimestral Multi-Sede',
    amount_bs: 650,
    amount: 650,
    payment_method: 'cash',
    paid_at: `${addDays(-1)} 17:20`,
    branch_id: INITIAL_BRANCHES[0].id,
    branch_name: INITIAL_BRANCHES[0].name,
    branch_address: INITIAL_BRANCHES[0].address,
    processed_by: 'Ana Sofía (Recepcionista)',
  },
  {
    id: 'pay-3',
    receipt_number: 'REC-2026-0043',
    client_id: 'cli-4',
    client_name: 'Camila Justiniano',
    client: { id: 'cli-4', full_name: 'Camila Justiniano' },
    plan_name: 'Plan Estudiante AM',
    concept: 'Renovación Plan Estudiante AM',
    amount_bs: 180,
    amount: 180,
    payment_method: 'card',
    paid_at: `${addDays(-2)} 10:15`,
    branch_id: INITIAL_BRANCHES[1].id,
    branch_name: INITIAL_BRANCHES[1].name,
    branch_address: INITIAL_BRANCHES[1].address,
    processed_by: 'Ana Sofía (Recepcionista)',
  },
];

const INITIAL_ATTENDANCE = [
  {
    id: 'att-1',
    client: {
      id: 'cli-2',
      full_name: 'Luciana Salazar',
      photo_url: INITIAL_CLIENTS[1].photo_url,
    },
    client_name: 'Luciana Salazar',
    client_photo: INITIAL_CLIENTS[1].photo_url,
    membership_type: 'Plan Trimestral Multi-Sede',
    check_in_at: `${today} 07:35`,
    branch_id: INITIAL_BRANCHES[0].id,
    branch_name: INITIAL_BRANCHES[0].name,
    scan_method: 'qr',
    scanned_by: 'Kiosco QR Automático',
  },
];

const INITIAL_SHIFTS = [
  {
    id: 'shift-1',
    branch_id: INITIAL_BRANCHES[0].id,
    branch_name: INITIAL_BRANCHES[0].name,
    opened_by: 'Ana Sofía (Recepcionista)',
    opened_at: `${today} 07:00`,
    closed_at: null,
    initial_amount: 200,
    cash_sales: 0,
    qr_sales: 250,
    card_sales: 0,
    expected_cash: 200,
    expected_amount: 200,
    actual_amount: 0,
    difference: 0,
    status: 'open',
  },
  {
    id: 'shift-0',
    branch_id: INITIAL_BRANCHES[0].id,
    branch_name: INITIAL_BRANCHES[0].name,
    opened_by: 'Ana Sofía (Recepcionista)',
    opened_at: `${addDays(-1)} 07:00`,
    closed_at: `${addDays(-1)} 21:30`,
    initial_amount: 200,
    cash_sales: 650,
    qr_sales: 250,
    card_sales: 0,
    expected_cash: 850,
    expected_amount: 850,
    actual_amount: 850,
    difference: 0,
    status: 'closed',
  },
];

const INITIAL_ROLES = [
  {
    id: 'role-admin',
    name: 'admin',
    display_name: 'Administrador General',
    permissions: [{ id: 'p-all', name: '*' }],
  },
  {
    id: 'role-manager',
    name: 'manager',
    display_name: 'Gerente de Sucursal',
    permissions: [
      { id: 'p1', name: 'dashboard.view' },
      { id: 'p2', name: 'attendance.view' },
      { id: 'p3', name: 'attendance.scan' },
      { id: 'p4', name: 'clients.view' },
      { id: 'p5', name: 'clients.create' },
      { id: 'p6', name: 'clients.edit' },
      { id: 'p7', name: 'memberships.view' },
      { id: 'p8', name: 'payments.view' },
      { id: 'p9', name: 'payments.create' },
      { id: 'p10', name: 'reports.view' },
    ],
  },
  {
    id: 'role-recep',
    name: 'receptionist',
    display_name: 'Recepcionista / Kiosco',
    permissions: [
      { id: 'p1', name: 'dashboard.view' },
      { id: 'p2', name: 'attendance.view' },
      { id: 'p3', name: 'attendance.scan' },
      { id: 'p4', name: 'clients.view' },
      { id: 'p5', name: 'clients.create' },
      { id: 'p7', name: 'memberships.view' },
      { id: 'p9', name: 'payments.create' },
    ],
  },
];

const INITIAL_USERS = [
  {
    id: 'usr-3',
    name: 'Administrador FitScan',
    email: 'admin@fitscan.com',
    phone: '+591 77012345',
    branch_id: INITIAL_BRANCHES[0].id,
    branch: { id: INITIAL_BRANCHES[0].id, name: INITIAL_BRANCHES[0].name },
    is_active: true,
    roles: [{ id: 'role-admin', name: 'admin' }],
    permissions: ['*'],
  },
  {
    id: 'usr-1',
    name: 'Ana Sofía (Recepcionista)',
    email: 'recepcion@fitscan.com',
    phone: '+591 76543210',
    branch_id: INITIAL_BRANCHES[0].id,
    branch: { id: INITIAL_BRANCHES[0].id, name: INITIAL_BRANCHES[0].name },
    is_active: true,
    roles: [{ id: 'role-recep', name: 'receptionist' }],
    permissions: INITIAL_ROLES[2].permissions.map((p) => p.name),
  },
];

const INITIAL_AUDIT = [
  {
    id: 'aud-1',
    user_name: 'Ana Sofía (Recepcionista)',
    action: 'CASH_SHIFT_OPENED',
    description: 'Apertura de caja en Sucursal Central Equipetrol con Bs. 200.00',
    created_at: `${today} 07:00`,
  },
  {
    id: 'aud-2',
    user_name: 'Kiosco QR',
    action: 'ATTENDANCE_QR_OK',
    description: 'Ingreso validado: Luciana Salazar (FITSCAN-QR-1002)',
    created_at: `${today} 07:35`,
  },
];

function getStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStore<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota
  }
}

function makeResponse<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config,
  };
}

function parseBody(config: InternalAxiosRequestConfig): any {
  if (!config.data) return {};
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data);
    } catch {
      return {};
    }
  }
  return config.data;
}

export const fitscanMockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const rawUrl = config.url || '/';
  const url = rawUrl.replace(/^https?:\/\/[^/]+\/api/, '');
  const body = parseBody(config);
  const activeBranchId =
    (config.headers?.['X-Branch-Id'] as string) ||
    localStorage.getItem('fitscan_active_branch_id') ||
    'all';

  // Brief simulated latency for realistic UI loaders
  await new Promise((r) => setTimeout(r, 90));

  // Health
  if (url === '/health') {
    return makeResponse(config, { status: 'ok', mode: 'demo-localstorage' });
  }

  // Auth
  if (url === '/auth/login' && method === 'post') {
    const users = getStore(KEYS.users, INITIAL_USERS);
    const email = String(body.email || '').trim().toLowerCase();
    const matched = users.find((u: any) => u.email.toLowerCase() === email);
    if (!matched) {
      return Promise.reject({
        response: makeResponse(config, { message: 'Usa admin@fitscan.com o recepcion@fitscan.com (clave: demo2026)' }, 401),
      });
    }
    return makeResponse(config, {
      token: `demo-token-${matched.id}-${Date.now()}`,
      user: matched,
    });
  }

  if (url === '/auth/logout' && method === 'post') {
    return makeResponse(config, { message: 'Sesión demo finalizada' });
  }

  if (url === '/auth/me' && method === 'get') {
    const saved = localStorage.getItem('fitscan_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const users = getStore(KEYS.users, INITIAL_USERS);
      const found = users.find((u: any) => u.email === parsed.email) || users[0];
      return makeResponse(config, { user: found });
    }
    return makeResponse(config, { user: INITIAL_USERS[0] });
  }

  // Branches
  if (url === '/branches' && method === 'get') {
    return makeResponse(config, { data: getStore(KEYS.branches, INITIAL_BRANCHES) });
  }
  if (url === '/branches' && method === 'post') {
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    const newBranch = {
      id: crypto.randomUUID(),
      ...body,
      is_active: true,
      clients_count: 0,
      users_count: 0,
    };
    setStore(KEYS.branches, [...branches, newBranch]);
    return makeResponse(config, { data: newBranch });
  }
  if (url.match(/^\/branches\/[^/]+\/toggle-status$/) && method === 'put') {
    const id = url.split('/')[2];
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    const updated = branches.map((b: any) => (b.id === id ? { ...b, is_active: !b.is_active } : b));
    setStore(KEYS.branches, updated);
    return makeResponse(config, { success: true });
  }
  if (url.startsWith('/branches/') && method === 'put') {
    const id = url.split('/')[2];
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    setStore(KEYS.branches, branches.map((b: any) => (b.id === id ? { ...b, ...body } : b)));
    return makeResponse(config, { success: true });
  }
  if (url.startsWith('/branches/') && method === 'delete') {
    const id = url.split('/')[2];
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    setStore(KEYS.branches, branches.filter((b: any) => b.id !== id));
    return makeResponse(config, { success: true });
  }

  // Memberships
  if (url === '/memberships' && method === 'get') {
    return makeResponse(config, { data: getStore(KEYS.memberships, INITIAL_MEMBERSHIPS) });
  }
  if (url === '/memberships' && method === 'post') {
    const list = getStore(KEYS.memberships, INITIAL_MEMBERSHIPS);
    const created = { id: `mem-${Date.now()}`, ...body, active_clients_count: 0 };
    setStore(KEYS.memberships, [...list, created]);
    return makeResponse(config, { data: created });
  }
  if (url.startsWith('/memberships/') && method === 'put') {
    const id = url.split('/')[2];
    const list = getStore(KEYS.memberships, INITIAL_MEMBERSHIPS);
    setStore(KEYS.memberships, list.map((m: any) => (m.id === id ? { ...m, ...body } : m)));
    return makeResponse(config, { success: true });
  }
  if (url.startsWith('/memberships/') && method === 'delete') {
    const id = url.split('/')[2];
    const list = getStore(KEYS.memberships, INITIAL_MEMBERSHIPS);
    setStore(KEYS.memberships, list.filter((m: any) => m.id !== id));
    return makeResponse(config, { success: true });
  }

  // Clients
  if (url === '/clients' && method === 'get') {
    let clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    if (activeBranchId && activeBranchId !== 'all') {
      clients = clients.filter((c: any) => c.branch_id === activeBranchId);
    }
    const search = String(config.params?.search || '').toLowerCase();
    if (search) {
      clients = clients.filter((c: any) =>
        `${c.first_name} ${c.last_name} ${c.email} ${c.qr_token}`.toLowerCase().includes(search)
      );
    }
    const status = config.params?.status;
    if (status && status !== 'all') {
      clients = clients.filter((c: any) => c.status === status || c.computed_status === status);
    }
    return makeResponse(config, { data: clients });
  }

  if (url === '/clients' && method === 'post') {
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    const branch = branches.find((b: any) => b.id === body.branch_id) || branches[0];
    const newClient = {
      id: `cli-${Date.now()}`,
      qr_token: `FITSCAN-QR-${Math.floor(1000 + Math.random() * 9000)}`,
      first_name: body.first_name || 'Nuevo',
      last_name: body.last_name || 'Socio',
      email: body.email || '',
      phone: body.phone || '',
      address: body.address || '',
      birth_date: body.birth_date || '',
      photo_url: body.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      branch_id: branch.id,
      branch: { id: branch.id, name: branch.name },
      status: 'expired',
      computed_status: 'expired',
      created_at: today,
      attendance_dates: [],
    };
    setStore(KEYS.clients, [newClient, ...clients]);
    return makeResponse(config, { data: newClient, client: newClient });
  }

  if (url.match(/^\/clients\/[^/]+\/memberships$/) && method === 'post') {
    const clientId = url.split('/')[2];
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const memberships = getStore(KEYS.memberships, INITIAL_MEMBERSHIPS);
    const plan = memberships.find((m: any) => m.id === body.membership_id) || memberships[0];
    const startDate = body.start_date || today;
    const endDate = body.end_date || addDays(plan?.duration_days || 30);

    const updatedClients = clients.map((c: any) =>
      c.id === clientId
        ? {
            ...c,
            status: 'active',
            computed_status: 'active',
            active_membership: { id: `cm-${Date.now()}`, start_date: startDate, end_date: endDate, membership: plan },
          }
        : c
    );
    setStore(KEYS.clients, updatedClients);

    const payments = getStore(KEYS.payments, INITIAL_PAYMENTS);
    const targetClient = updatedClients.find((c: any) => c.id === clientId);
    const newPayment = {
      id: `pay-${Date.now()}`,
      receipt_number: `REC-2026-${String(payments.length + 45).padStart(4, '0')}`,
      client_id: clientId,
      client_name: targetClient ? `${targetClient.first_name} ${targetClient.last_name}` : 'Socio',
      client: { id: clientId, full_name: targetClient ? `${targetClient.first_name} ${targetClient.last_name}` : 'Socio' },
      plan_name: plan.name,
      concept: `Membresía ${plan.name}`,
      amount_bs: Number(body.amount_bs || plan.price_bs),
      amount: Number(body.amount_bs || plan.price_bs),
      payment_method: body.payment_method || 'cash',
      paid_at: `${today} ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      branch_id: targetClient?.branch_id || INITIAL_BRANCHES[0].id,
      branch_name: targetClient?.branch?.name || INITIAL_BRANCHES[0].name,
      branch_address: INITIAL_BRANCHES[0].address,
      processed_by: 'Usuario Demo',
    };
    setStore(KEYS.payments, [newPayment, ...payments]);
    return makeResponse(config, { success: true, payment: newPayment });
  }

  if (url.match(/^\/clients\/[^/]+\/transfer-branch$/) && method === 'put') {
    const clientId = url.split('/')[2];
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    const newBranch = branches.find((b: any) => b.id === body.branch_id) || branches[0];
    setStore(
      KEYS.clients,
      clients.map((c: any) =>
        c.id === clientId ? { ...c, branch_id: newBranch.id, branch: { id: newBranch.id, name: newBranch.name } } : c
      )
    );
    return makeResponse(config, { success: true });
  }

  if (url.startsWith('/clients/') && method === 'put') {
    const clientId = url.split('/')[2];
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    setStore(KEYS.clients, clients.map((c: any) => (c.id === clientId ? { ...c, ...body } : c)));
    return makeResponse(config, { success: true });
  }

  // Attendance
  if (url === '/attendance/today' && method === 'get') {
    return makeResponse(config, { data: getStore(KEYS.attendance, INITIAL_ATTENDANCE) });
  }

  if (url === '/attendance/history' && method === 'get') {
    const items = getStore(KEYS.attendance, INITIAL_ATTENDANCE);
    return makeResponse(config, { data: items, current_page: 1, last_page: 1, total: items.length });
  }

  if (url === '/attendance/scan' && method === 'post') {
    const qrToken = String(body.qr_token || '').trim().toLowerCase();
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const client = clients.find(
      (c: any) =>
        c.qr_token.toLowerCase() === qrToken ||
        c.id.toLowerCase() === qrToken ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(qrToken)
    );

    if (!client) {
      return makeResponse(config, { status: 'not_found', message: 'Código QR no encontrado en el padrón.' });
    }

    const mem = client.active_membership || client.latest_membership;
    const isExpired = client.status === 'expired' || (mem?.end_date && mem.end_date < today);

    if (isExpired) {
      return makeResponse(config, {
        status: 'expired',
        message: 'Membresía VENCIDA. Renueva en recepción.',
        client: {
          id: client.id,
          full_name: `${client.first_name} ${client.last_name}`,
          photo_url: client.photo_url,
          status: 'expired',
        },
        membership: mem ? { name: mem.membership?.name, start_date: mem.start_date, end_date: mem.end_date } : null,
      });
    }

    const attendance = getStore(KEYS.attendance, INITIAL_ATTENDANCE);
    const newAtt = {
      id: `att-${Date.now()}`,
      client: {
        id: client.id,
        full_name: `${client.first_name} ${client.last_name}`,
        photo_url: client.photo_url,
      },
      client_name: `${client.first_name} ${client.last_name}`,
      client_photo: client.photo_url,
      membership_type: mem?.membership?.name || 'Pase Libre',
      check_in_at: `${today} ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      branch_id: client.branch_id,
      branch_name: client.branch?.name || INITIAL_BRANCHES[0].name,
      scan_method: 'qr',
      scanned_by: 'Kiosco QR Automático',
    };
    setStore(KEYS.attendance, [newAtt, ...attendance]);

    return makeResponse(config, {
      status: 'success',
      message: `¡Bienvenido(a) ${client.first_name}! Acceso autorizado.`,
      attendance: newAtt,
      client: {
        id: client.id,
        full_name: `${client.first_name} ${client.last_name}`,
        photo_url: client.photo_url,
        status: 'active',
      },
      membership: mem ? { name: mem.membership?.name, start_date: mem.start_date, end_date: mem.end_date } : null,
    });
  }

  // Payments
  if (url === '/payments' && method === 'get') {
    const items = getStore(KEYS.payments, INITIAL_PAYMENTS);
    return makeResponse(config, { data: items, current_page: 1, last_page: 1, total: items.length });
  }

  if (url === '/payments' && method === 'post') {
    const payments = getStore(KEYS.payments, INITIAL_PAYMENTS);
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const c = clients.find((x: any) => x.id === body.client_id) || clients[0];
    const newPay = {
      id: `pay-${Date.now()}`,
      receipt_number: `REC-2026-${String(payments.length + 45).padStart(4, '0')}`,
      client_id: c?.id || body.client_id,
      client_name: c ? `${c.first_name} ${c.last_name}` : 'Socio Demo',
      client: { id: c?.id, full_name: c ? `${c.first_name} ${c.last_name}` : 'Socio Demo' },
      plan_name: body.concept || 'Pago en Recepción',
      concept: body.concept || 'Pago de Membresía',
      amount_bs: Number(body.amount_bs || body.amount || 250),
      amount: Number(body.amount_bs || body.amount || 250),
      payment_method: body.payment_method || 'cash',
      paid_at: `${today} ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      branch_id: INITIAL_BRANCHES[0].id,
      branch_name: INITIAL_BRANCHES[0].name,
      branch_address: INITIAL_BRANCHES[0].address,
      processed_by: 'Usuario Demo',
    };
    setStore(KEYS.payments, [newPay, ...payments]);
    return makeResponse(config, { data: newPay });
  }

  if (url.match(/^\/payments\/[^/]+\/receipt$/) && method === 'get') {
    const id = url.split('/')[2];
    const payments = getStore(KEYS.payments, INITIAL_PAYMENTS);
    const receipt = payments.find((p: any) => p.id === id) || payments[0];
    return makeResponse(config, { receipt });
  }

  // Cash shifts
  if (url === '/cash-shifts/active' && method === 'get') {
    const shifts = getStore(KEYS.shifts, INITIAL_SHIFTS);
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    if (activeBranchId === 'all') {
      return makeResponse(config, {
        is_consolidated: true,
        branches_summary: branches.map((b: any) => {
          const openShift = shifts.find((s: any) => s.branch_id === b.id && s.status === 'open') || null;
          return { branch: b, is_open: Boolean(openShift), shift: openShift };
        }),
      });
    }
    const openShift = shifts.find((s: any) => s.branch_id === activeBranchId && s.status === 'open') || null;
    return makeResponse(config, { is_consolidated: false, active_shift: openShift });
  }

  if (url === '/cash-shifts/history' && method === 'get') {
    const shifts = getStore(KEYS.shifts, INITIAL_SHIFTS);
    return makeResponse(config, { data: shifts, current_page: 1, last_page: 1, total: shifts.length });
  }

  if (url === '/cash-shifts/open' && method === 'post') {
    const shifts = getStore(KEYS.shifts, INITIAL_SHIFTS);
    const branches = getStore(KEYS.branches, INITIAL_BRANCHES);
    const b = branches.find((x: any) => x.id === (body.branch_id || activeBranchId)) || branches[0];
    const newShift = {
      id: `shift-${Date.now()}`,
      branch_id: b.id,
      branch_name: b.name,
      opened_by: 'Usuario Demo',
      opened_at: `${today} ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      closed_at: null,
      initial_amount: Number(body.initial_amount || 200),
      cash_sales: 0,
      qr_sales: 0,
      card_sales: 0,
      expected_cash: Number(body.initial_amount || 200),
      expected_amount: Number(body.initial_amount || 200),
      actual_amount: 0,
      difference: 0,
      status: 'open',
    };
    setStore(KEYS.shifts, [newShift, ...shifts]);
    return makeResponse(config, { data: newShift });
  }

  if (url === '/cash-shifts/close' && method === 'post') {
    const shifts = getStore(KEYS.shifts, INITIAL_SHIFTS);
    const actual = Number(body.actual_amount || 0);
    const updated = shifts.map((s: any) =>
      s.status === 'open'
        ? {
            ...s,
            status: 'closed',
            closed_at: `${today} ${new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
            actual_amount: actual,
            difference: actual - (s.expected_cash || s.initial_amount),
          }
        : s
    );
    setStore(KEYS.shifts, updated);
    return makeResponse(config, { success: true });
  }

  // Dashboard Stats
  if (url === '/dashboard/stats' && method === 'get') {
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const payments = getStore(KEYS.payments, INITIAL_PAYMENTS);
    const attendance = getStore(KEYS.attendance, INITIAL_ATTENDANCE);
    const shifts = getStore(KEYS.shifts, INITIAL_SHIFTS);

    const activeCount = clients.filter((c: any) => c.status === 'active').length;
    const expiredCount = clients.filter((c: any) => c.status === 'expired').length;
    const monthRev = payments.reduce((acc: number, p: any) => acc + Number(p.amount_bs || 0), 0);

    return makeResponse(config, {
      stats: {
        active_clients_count: activeCount,
        expired_clients_count: expiredCount,
        expiring_soon_count: 1,
        today_attendances_count: attendance.length + 14,
        total_clients_count: clients.length,
        month_revenue_bs: monthRev + 4200,
        prev_month_revenue_bs: 4650,
        revenue_growth_percent: 13.5,
        payment_breakdown: {
          cash: payments.filter((p: any) => p.payment_method === 'cash').reduce((a: number, b: any) => a + b.amount, 0) + 1850,
          qr_transfer: payments.filter((p: any) => p.payment_method === 'qr_transfer').reduce((a: number, b: any) => a + b.amount, 0) + 1650,
          card: payments.filter((p: any) => p.payment_method === 'card').reduce((a: number, b: any) => a + b.amount, 0) + 700,
        },
        cash_shift_active: shifts.some((s: any) => s.status === 'open'),
        cash_shift_opened_at: shifts.find((s: any) => s.status === 'open')?.opened_at?.split(' ')[1] || '07:00',
        open_shifts_count: shifts.filter((s: any) => s.status === 'open').length,
        active_branch_name: 'Todas las Sucursales',
      },
      weekly_chart: [
        { day: 'Lun', date: addDays(-6), asistencias: 34, ingresos: 750 },
        { day: 'Mar', date: addDays(-5), asistencias: 42, ingresos: 980 },
        { day: 'Mié', date: addDays(-4), asistencias: 39, ingresos: 620 },
        { day: 'Jue', date: addDays(-3), asistencias: 48, ingresos: 1120 },
        { day: 'Vie', date: addDays(-2), asistencias: 51, ingresos: 840 },
        { day: 'Sáb', date: addDays(-1), asistencias: 29, ingresos: 650 },
        { day: 'Hoy', date: today, asistencias: attendance.length + 14, ingresos: monthRev },
      ],
      peak_hours_chart: [
        { hour: '06:00', count: 12 },
        { hour: '08:00', count: 19 },
        { hour: '12:00', count: 14 },
        { hour: '17:00', count: 24 },
        { hour: '19:00', count: 31 },
        { hour: '21:00', count: 11 },
      ],
      branch_comparison: [
        { branch_id: INITIAL_BRANCHES[0].id, branch_name: INITIAL_BRANCHES[0].name, revenue_bs: 3450, attendances_today: 11, clients_count: 3 },
        { branch_id: INITIAL_BRANCHES[1].id, branch_name: INITIAL_BRANCHES[1].name, revenue_bs: 1830, attendances_today: 4, clients_count: 1 },
      ],
    });
  }

  // Reports
  if (url === '/reports/financial') {
    const payments = getStore(KEYS.payments, INITIAL_PAYMENTS);
    const total = payments.reduce((a: number, p: any) => a + p.amount, 0);
    return makeResponse(config, {
      summary: { total_revenue_bs: total, total_transactions: payments.length, cash_bs: 650, qr_bs: 250, card_bs: 180 },
      payments,
    });
  }
  if (url === '/reports/attendances') {
    const attendances = getStore(KEYS.attendance, INITIAL_ATTENDANCE);
    return makeResponse(config, {
      summary: { total_attendances: attendances.length, qr_scans_count: attendances.length, manual_scans_count: 0, unique_clients_count: attendances.length },
      attendances,
    });
  }
  if (url === '/reports/memberships') {
    const clients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const memberships = clients.map((c: any, idx: number) => ({
      id: `rep-m-${idx}`,
      client_name: `${c.first_name} ${c.last_name}`,
      plan_name: (c.active_membership || c.latest_membership)?.membership?.name || 'Pase Libre',
      start_date: (c.active_membership || c.latest_membership)?.start_date || today,
      end_date: (c.active_membership || c.latest_membership)?.end_date || today,
      paid_amount: (c.active_membership || c.latest_membership)?.membership?.price_bs || 250,
      status: c.status,
      activated_by: 'Recepción',
    }));
    return makeResponse(config, {
      summary: {
        total_memberships_assigned: memberships.length,
        total_revenue_bs: memberships.reduce((a: number, m: any) => a + m.paid_amount, 0),
        active_clients_count: clients.filter((c: any) => c.status === 'active').length,
        expired_clients_count: clients.filter((c: any) => c.status === 'expired').length,
      },
      memberships,
    });
  }
  if (url === '/reports/shifts') {
    const shifts = getStore(KEYS.shifts, INITIAL_SHIFTS);
    return makeResponse(config, {
      summary: {
        total_shifts: shifts.length,
        open_shifts_count: shifts.filter((s: any) => s.status === 'open').length,
        total_actual_bs: shifts.reduce((a: number, s: any) => a + s.actual_amount, 0),
        total_difference_bs: 0,
      },
      shifts,
    });
  }
  if (url === '/reports/clients') {
    const rawClients = getStore(KEYS.clients, INITIAL_CLIENTS);
    const clients = rawClients.map((c: any) => ({
      id: c.id,
      full_name: `${c.first_name} ${c.last_name}`,
      email: c.email,
      phone: c.phone,
      branch_name: c.branch?.name || INITIAL_BRANCHES[0].name,
      registered_at: c.created_at,
      last_attendance: c.attendance_dates?.[0] || 'Sin registros',
      status: c.status,
    }));
    return makeResponse(config, {
      summary: {
        new_clients_in_period: clients.length,
        active_clients_total: clients.filter((c: any) => c.status === 'active').length,
        expired_clients_total: clients.filter((c: any) => c.status === 'expired').length,
      },
      clients,
    });
  }
  if (url === '/reports/export') {
    return makeResponse(config, new Blob(['Comprobante,Cliente,Monto\nREC-2026-0041,Mateo Vargas,250.00\n'], { type: 'text/csv' }) as any);
  }

  // Users, Roles, Audit
  if (url === '/users' && method === 'get') {
    return makeResponse(config, { data: getStore(KEYS.users, INITIAL_USERS) });
  }
  if (url === '/users' && method === 'post') {
    const users = getStore(KEYS.users, INITIAL_USERS);
    const created = { id: `usr-${Date.now()}`, ...body, is_active: true };
    setStore(KEYS.users, [...users, created]);
    return makeResponse(config, { data: created });
  }
  if (url.startsWith('/users/') && method === 'put') {
    const id = url.split('/')[2];
    const users = getStore(KEYS.users, INITIAL_USERS);
    setStore(KEYS.users, users.map((u: any) => (u.id === id ? { ...u, ...body } : u)));
    return makeResponse(config, { success: true });
  }
  if (url.startsWith('/users/') && method === 'delete') {
    const id = url.split('/')[2];
    const users = getStore(KEYS.users, INITIAL_USERS);
    setStore(KEYS.users, users.filter((u: any) => u.id !== id));
    return makeResponse(config, { success: true });
  }
  if (url === '/roles' && method === 'get') {
    return makeResponse(config, { data: getStore(KEYS.roles, INITIAL_ROLES) });
  }
  if (url.startsWith('/roles/') && method === 'put') {
    return makeResponse(config, { success: true });
  }
  if (url === '/audit-logs' && method === 'get') {
    return makeResponse(config, { data: getStore(KEYS.audit, INITIAL_AUDIT) });
  }

  return makeResponse(config, { ok: true });
};

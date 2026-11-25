import { SesionUsuario } from "@/types/auth";

export const DEMO_SESSION_KEY = "latelier_demo_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24;

export interface DemoAccount {
  email: string;
  password: string;
  user: Omit<SesionUsuario, "exp">;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "admin@latelier.com",
    password: "demo2026",
    user: {
      id: "usr-admin-1",
      nombre: "Camila Mendoza (Superadmin)",
      email: "admin@latelier.com",
      rol: "superadmin",
    },
  },
  {
    email: "recepcion@latelier.com",
    password: "demo2026",
    user: {
      id: "usr-recep-2",
      nombre: "Mateo Rojas (Mostrador Equipetrol)",
      email: "recepcion@latelier.com",
      rol: "encargado_sede",
      sucursalId: "suc-1",
    },
  },
];

export function iniciarSesionDemo(email: string, password: string): {
  ok: boolean;
  sesion?: SesionUsuario;
  error?: string;
} {
  const normalized = email.trim().toLowerCase();
  const match = DEMO_ACCOUNTS.find((a) => a.email === normalized);

  if (!match) {
    return { ok: false, error: "Usa admin@latelier.com o recepcion@latelier.com (clave: demo2026)." };
  }

  if (password !== match.password) {
    return { ok: false, error: "Contraseña incorrecta. Para la demo usa: demo2026" };
  }

  const sesion: SesionUsuario = {
    ...match.user,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sesion));
    } catch {
      // Ignore storage errors
    }
  }

  return { ok: true, sesion };
}

export function obtenerSesionDemo(): SesionUsuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const sesion = JSON.parse(raw) as SesionUsuario;
    if (sesion.exp && sesion.exp < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

export function cerrarSesionDemo(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // Ignore
  }
}

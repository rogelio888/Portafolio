import { createContext, useContext, useState } from 'react';
import { authenticate, registerLogout, setCurrentActor } from '../data/db';

const AuthContext = createContext(null);

const SESSION_KEY = 'powerfit_current_user';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = loadSession();
    if (stored) setCurrentActor(stored);
    return stored;
  });

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = authenticate(email, password);
        if (!result) {
          reject(new Error('Credenciales inválidas. Por favor verifique sus datos.'));
          return;
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        setCurrentActor(result.user);
        setUser(result.user);
        resolve(result.user);
      }, 800);
    });
  };

  const logout = () => {
    registerLogout(user);
    localStorage.removeItem(SESSION_KEY);
    setCurrentActor(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

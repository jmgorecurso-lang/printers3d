import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | 'login' | 'registro'

  // Al cargar la web, comprueba si ya había una sesión activa (cookie previa)
  useEffect(() => {
    fetch('/api/auth/yo', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Sin sesión');
        return res.json();
      })
      .then((datos) => setUsuario(datos))
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  const login = async (email, contrasena) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, contrasena }),
    });
    const datos = await res.json();
    if (!res.ok) {
      return { ok: false, error: datos.error || 'No se pudo iniciar sesión' };
    }
    setUsuario(datos);
    setModal(null);
    return { ok: true };
  };

  const registro = async (nombre, email, contrasena) => {
    const res = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nombre, email, contrasena }),
    });
    const datos = await res.json();
    if (!res.ok) {
      return { ok: false, error: datos.error || 'No se pudo completar el registro' };
    }
    setUsuario(datos);
    setModal(null);
    return { ok: true };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUsuario(null);
  };
const actualizarUsuario = (datos) => setUsuario(datos);
  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        login,
        registro,
        logout,
        actualizarUsuario,
        modal,
        abrirLogin: () => setModal('login'),
        abrirRegistro: () => setModal('registro'),
        cerrarModal: () => setModal(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return contexto;
}
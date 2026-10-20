import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CampoContrasena from './CampoContrasena';

export default function AuthModal() {
  const { modal, cerrarModal, login, registro, abrirLogin, abrirRegistro } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [repetida, setRepetida] = useState('');

  if (!modal) return null;

  const esLogin = modal === 'login';


  const limpiarCampos = () => {
    setNombre('');
    setEmail('');
    setContrasena('');
    setRepetida('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Solo al registrarse: las dos contraseñas tienen que coincidir
    if (!esLogin && contrasena !== repetida) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);

    const resultado = esLogin
      ? await login(email, contrasena)
      : await registro(nombre, email, contrasena);

    setEnviando(false);

    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    limpiarCampos();
  };

  const cambiarModo = (nuevoModo) => {
    limpiarCampos();
    if (nuevoModo === 'login') abrirLogin();
    else abrirRegistro();
  };

  return (
    <div className="modal-fondo" onClick={cerrarModal}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-cerrar" onClick={cerrarModal} aria-label="Cerrar">
          ✕
        </button>

        <h2>{esLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {!esLogin && (
            <div className="calculadora-campo">
              <label>Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          )}

          <div className="calculadora-campo">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <CampoContrasena
            etiqueta="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            minLength={6}
            autoComplete={esLogin ? 'current-password' : 'new-password'}
          />
          {!esLogin && (
            <CampoContrasena
              etiqueta="Repite la contraseña"
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
              minLength={6}
              autoComplete="new-password"
            />
          )}


          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primario" disabled={enviando}>
            {enviando ? 'Enviando...' : esLogin ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <p className="auth-cambiar-modo">
          {esLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <span onClick={() => cambiarModo('registro')}>Regístrate</span>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <span onClick={() => cambiarModo('login')}>Inicia sesión</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
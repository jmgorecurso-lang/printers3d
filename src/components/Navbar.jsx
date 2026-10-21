import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { iniciales } from '../utils/iniciales';
import cubo from '../assets/Imagenes/cubo.svg';

function Navbar({ setVistaActual, modoOscuro, setModoOscuro }) {
  const { usuario, cargando, abrirLogin, abrirRegistro, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
const menuRef = useRef(null);

// Cierra el menú al hacer clic fuera o al pulsar Escape
useEffect(() => {
  if (!menuAbierto) return;

  const alHacerClic = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuAbierto(false);
    }
  };
  const alPulsarTecla = (e) => {
    if (e.key === 'Escape') setMenuAbierto(false);
  };

  document.addEventListener('mousedown', alHacerClic);
  document.addEventListener('keydown', alPulsarTecla);
  return () => {
    document.removeEventListener('mousedown', alHacerClic);
    document.removeEventListener('keydown', alPulsarTecla);
  };
}, [menuAbierto]);

const irAlPanel = () => {
  setMenuAbierto(false);
  setVistaActual('panel');
};

const cerrarSesion = () => {
  setMenuAbierto(false);
  logout();
};

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => setVistaActual('inicio')}>
        <img src={cubo} alt="cubo" /><h1 className='logoPrint'>PRINT </h1> <h1 className='logoLab'> LAB</h1>

      </div>

      <ul className="navbar-menu">
        <li onClick={() => setVistaActual('inicio')}>Tipo de Impresión</li>
        <li onClick={() => setVistaActual('impresoras')}>Impresoras</li>
        <li onClick={() => setVistaActual('materiales')}>Materiales</li>
        <li onClick={() => setVistaActual('configuraciones')}>
          Configuraciones
        </li>
        <li onClick={() => setVistaActual('calculadora')}>Calculadora</li>
        <li onClick={() => setVistaActual('novedades')}>Novedades</li>
              </ul>
         <button className="btn-login" onClick={abrirLogin}>Iniciar sesión</button>

      <div className="navbar-acciones">
        <button
          className="btn-tema"
          onClick={() => setModoOscuro(!modoOscuro)}
          aria-label="Cambiar modo oscuro"
        >
          {modoOscuro ? '☀️' : '🌙'}
        </button>

        {!cargando && usuario && (
  <div className="navbar-menu-usuario" ref={menuRef}>
    <button
      className="navbar-usuario-boton"
      onClick={() => setMenuAbierto(!menuAbierto)}
      aria-haspopup="menu"
      aria-expanded={menuAbierto}
    >
      <span className="panel-avatar">{iniciales(usuario.nombre)}</span>
      <span>{usuario.nombre}</span>
      <span className="navbar-chevron" aria-hidden="true">▾</span>
    </button>

    {menuAbierto && (
      <div className="navbar-desplegable" role="menu">
        <div className="navbar-desplegable-cabecera">
          <strong>{usuario.nombre}</strong>
          <small>{usuario.email}</small>
        </div>
        <button role="menuitem" onClick={irAlPanel}>
          Mi panel
        </button>
        <button
          role="menuitem"
          className="navbar-desplegable-salir"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>
    )}
  </div>
)}
      </div>
    </nav>
  );
}

export default Navbar;
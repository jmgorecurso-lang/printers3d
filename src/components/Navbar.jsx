// no se hace un import de CSS dentro de este archivo, ya está todo en el global.
import cubo from '../assets/Imagenes/cubo.png';
function Navbar({ setVistaActual, modoOscuro, setModoOscuro }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => setVistaActual('inicio')}>
        <img src={cubo} alt='logodia' /> <h1 className='logoPrint'>PRINT </h1> <h1 className='logoLab'> LAB</h1>
      </div>

      <ul className="navbar-menu">
        <li onClick={() => setVistaActual('inicio')}>Tipo de Impresión</li>
        <li onClick={() => setVistaActual('impresoras')}>Impresoras</li>
        <li onClick={() => setVistaActual('materiales')}>Materiales</li>
        <li onClick={() => setVistaActual('configuraciones')}>
          Configuraciones
        </li>
        <li className="navbar-item-deshabilitado">Post</li>
      </ul>

      <div className="navbar-acciones">
        <button
          className="btn-tema"
          onClick={() => setModoOscuro(!modoOscuro)}
          aria-label="Cambiar modo oscuro"
        >
          {modoOscuro ? '☀️' : '🌙'}
        </button>
        <button className="btn-texto">Iniciar sesión</button>
        <button className="btn-primario">Registrarse</button>
      </div>
    </nav>
  );
}

export default Navbar;
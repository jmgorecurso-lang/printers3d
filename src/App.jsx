import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TipoImpd from './components/TipoImpresion';
import Printers from './components/Printers';
import Materials from './components/Materials';
// import Settings from './components/Settings';

export default function App() {
  const [vista, setVista] = useState('inicio');
  const [modoOscuro, setModoOscuro] = useState(false);

  const renderContenido = () => {
    switch (vista) {
      case 'inicio':
        return <Home alSeleccionarTipo={setVista} />;
      case 'filamento':
      case 'resina':
      case 'otros':
        return <TipoImpd tipo={vista} volver={() => setVista('inicio')} />;
      case 'impresoras':
        return <Printers />;
      case 'materiales':
        return <Materials />;
      // case 'configuraciones':
      //   return <Settings />;
      default:
        return <Home alSeleccionarTipo={setVista} />;
    }
  };

  return (
    <div className="app-shell" data-theme={modoOscuro ? 'dark' : 'light'}>
      <Navbar
        setVistaActual={setVista}
        modoOscuro={modoOscuro}
        setModoOscuro={setModoOscuro}
      />
      {renderContenido()}
    </div>
  );
}
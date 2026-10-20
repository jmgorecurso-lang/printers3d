import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TipoImpd from './components/TipoImpresion';
import Printers from './components/Printers';
import Materials from './components/Materials';
import Calculadora from './components/Calculadora';
import ModalImpresora from './components/ModalImpresora';
import AuthModal from './components/AuthModal';
import { ModalImpresoraProvider } from './context/ModalImpresoraContext';
import { AuthProvider } from './context/AuthContext';
import Configuraciones from './components/Configuraciones';
import Footer from './components/Footer';

import Panel from './components/Panel';

export default function App() {
  // null = no abrir nada; { config: null } = formulario de creación;
  // { config: {...} } = formulario de edición de esa configuración
  const [formularioInicial, setFormularioInicial] = useState(null);
  const [vista, setVista] = useState('inicio');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [filtroCategoriaMateriales, setFiltroCategoriaMateriales] = useState(null);
  const [filtroProcesoImpresoras, setFiltroProcesoImpresoras] = useState(null);

  const irAVista = (nuevaVista) => {
    setFiltroCategoriaMateriales(null);
    setFiltroProcesoImpresoras(null);
    setFormularioInicial(null);
    setVista(nuevaVista);
  };

  const irAMaterialesFiltrados = (categoria) => {
    setFiltroCategoriaMateriales(categoria);
    setVista('materiales');
  };

  const irAImpresorasFiltradas = (proceso) => {
    setFiltroProcesoImpresoras(proceso);
    setVista('impresoras');
  };
  const irAFormularioConfiguracion = (config = null) => {
  setFormularioInicial({ config });
  setVista('configuraciones');
};

  const renderContenido = () => {
    switch (vista) {
      case 'inicio':
        return <Home alSeleccionarTipo={setVista} />;
      case 'filamento':
      case 'resina':
      case 'otros':
      case 'configuraciones':
        return <Configuraciones formularioInicial={formularioInicial} />;
      case 'panel':
        return <Panel irA={irAVista} irAFormulario={irAFormularioConfiguracion}/>;
        


        return (
          <TipoImpd
            tipo={vista}
            volver={() => irAVista('inicio')}
            irAMateriales={irAMaterialesFiltrados}
            irAImpresoras={irAImpresorasFiltradas}
          />
        );
      case 'impresoras':
        return <Printers filtroInicial={filtroProcesoImpresoras} />;
      case 'materiales':
        return (
          <Materials
            categoriaFiltro={filtroCategoriaMateriales}
            limpiarFiltro={() => setFiltroCategoriaMateriales(null)}
          />
        );
      case 'calculadora':
        return <Calculadora />;
      case 'configuraciones':
        return <Configuraciones />;
      case 'panel':
        return <Panel irA={irAVista} />;


      default:
        return <Home alSeleccionarTipo={setVista} />;
    }
  };

  return (
    <AuthProvider>
      <ModalImpresoraProvider>
        <div className="app-shell" data-theme={modoOscuro ? 'dark' : 'light'}>
          <Navbar
            setVistaActual={irAVista}
            modoOscuro={modoOscuro}
            setModoOscuro={setModoOscuro}
          />
          <main className="app-contenido">{renderContenido()}</main>
          <Footer setVistaActual={irAVista} />
          <ModalImpresora />
          <AuthModal />
        </div>
      </ModalImpresoraProvider>
    </AuthProvider>
  );
}
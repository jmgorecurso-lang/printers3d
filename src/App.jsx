import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import TipoImpd from './components/TipoImpresion';
import Printers from './components/Printers';
import Materials from './components/Materiales';
import ModalImpresora from './components/ModalImpresora';
import { ModalImpresoraProvider } from './context/ModalImpresoraContext';
// import Settings from './components/Settings';

export default function App() {
  const [vista, setVista] = useState('inicio');
  const [modoOscuro, setModoOscuro] = useState(false);
   const [filtroCategoriaMateriales, setFiltroCategoriaMateriales] = useState(null);
    const [filtroProcesoImpresoras, setFiltroProcesoImpresoras] = useState(null);

   // Navegación normal: siempre limpia cualquier filtro de materiales que quedara puesto
  const irAVista = (nuevaVista) => {
    setFiltroCategoriaMateriales(null);
     setFiltroProcesoImpresoras(null);
    setVista(nuevaVista);
  };

  // Navegación especial: va a Materiales YA filtrado por una categoría concreta
  const irAMaterialesFiltrados = (categoria) => {
    setFiltroCategoriaMateriales(categoria);
    setVista('materiales');
  };
  const irAImpresorasFiltradas = (proceso) => {
    setFiltroProcesoImpresoras(proceso);
    setVista('impresoras');
  };

   const renderContenido = () => {
    switch (vista) {
      case 'inicio':
        return <Home alSeleccionarTipo={setVista} />;
      case 'filamento':
      case 'resina':
      case 'otros':
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
      // case 'configuraciones':
      //   return <Settings />;
      default:
        return <Home alSeleccionarTipo={setVista} />;
    }
  };

  return (
    <ModalImpresoraProvider>
      <div className="app-shell" data-theme={modoOscuro ? 'dark' : 'light'}>
        <Navbar
          setVistaActual={irAVista}
          modoOscuro={modoOscuro}
          setModoOscuro={setModoOscuro}
        />
        {renderContenido()}
        <ModalImpresora />
      </div>
    </ModalImpresoraProvider>
  );
}
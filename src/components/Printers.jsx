import { useState, useEffect } from 'react';
import { useModalImpresora } from '../context/ModalImpresoraContext';
import { imagenesPorNombre } from '../utils/imagenesImpresoras';


const procesos = ['Todos', 'Filamento', 'Resina', 'Otros'];

export default function Printers() {
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState(null);
  const { abrirModal } = useModalImpresora();

  useEffect(() => {
    fetch('/api/impresoras')
      .then((res) => {
        if (!res.ok) throw new Error('Respuesta no válida');
        return res.json();
      })
      .then((datos) => setCatalogo(datos))
      .catch(() => setError('No se pudieron cargar las impresoras.'))
      .finally(() => setCargando(false));
  }, []);

  const destacadas = catalogo.filter((imp) => imp.destacada);

  const impresorasFiltradas =
    filtro === null
      ? destacadas
      : filtro === 'Todos'
      ? catalogo
      : catalogo.filter((imp) => imp.proceso === filtro);

  return (
    <div className="printers">
      <h1>🖨️ Catálogo General de Impresoras</h1>
      <p>
        Aquí se muestra la lista completa de maquinaria disponible, con sus
        especificaciones técnicas principales.
      </p>

      <div className="printers-filtros">
        {procesos.map((p) => (
          <button
            key={p}
            className={`chip ${filtro === p ? 'chip-activo' : ''}`}
            onClick={() => setFiltro(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {cargando && <p className="printers-vacio">Cargando impresoras...</p>}
      {error && <p className="printers-vacio">{error}</p>}
      {filtro === null && !cargando && !error && (
        <p className="printers-vacio">Las 4 impresoras más buscadas:</p>
      )}

      <div className="printers-grid">
        {impresorasFiltradas.map((imp) => (
          <article
            key={imp.modelo}
            className="printer-tarjeta"
            onClick={() => abrirModal(imp)}
          >
            <div className="printer-imagen">
              {imagenesPorNombre[imp.imagen] ? (
                <img src={imagenesPorNombre[imp.imagen]} alt={imp.modelo} />
              ) : (
                <span className="printer-imagen-placeholder">🖨️</span>
              )}
            </div>

            <div className="printer-info">
              <span className="printer-proceso-badge">{imp.proceso}</span>
              <h3>{imp.modelo}</h3>
              <p className="printer-marca">{imp.marca}</p>
              <p className="printer-subtipo">{imp.subtipo}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
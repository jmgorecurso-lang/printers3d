import { useState, useEffect } from 'react';
import catalogo from '../data/catalogoImpresoras.json';

const procesos = ['Todos', 'Filamento', 'Resina', 'Otros'];

const imagenesModulo = import.meta.glob('../assets/Imagenes/impresoras/*', {
  eager: true,
  import: 'default',
});

const imagenesPorNombre = Object.fromEntries(
  Object.entries(imagenesModulo).map(([ruta, url]) => [
    ruta.split('/').pop(),
    url,
  ])
);

export default function Printers() {
  const [filtro, setFiltro] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);

  const destacadas = catalogo.filter((imp) => imp.destacada);

  const impresorasFiltradas =
    filtro === null
      ? destacadas
      : filtro === 'Todos'
      ? catalogo
      : catalogo.filter((imp) => imp.proceso === filtro);

  // Cerrar el modal con la tecla Escape
  useEffect(() => {
    if (!seleccionada) return;

    const alPulsarTecla = (e) => {
      if (e.key === 'Escape') setSeleccionada(null);
    };

    window.addEventListener('keydown', alPulsarTecla);
    return () => window.removeEventListener('keydown', alPulsarTecla);
  }, [seleccionada]);

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

      {filtro === null && (
        <p className="printers-vacio">Las 4 impresoras más buscadas:</p>
      )}

      <div className="printers-grid">
        {impresorasFiltradas.map((imp) => (
          <article
            key={imp.modelo}
            className="printer-tarjeta"
            onClick={() => setSeleccionada(imp)}
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

      {seleccionada && (
        <div className="modal-fondo" onClick={() => setSeleccionada(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={seleccionada.modelo}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-cerrar"
              onClick={() => setSeleccionada(null)}
              aria-label="Cerrar"
            >
              ✕
            </button>

            <div className="modal-imagen">
              {imagenesPorNombre[seleccionada.imagen] ? (
                <img
                  src={imagenesPorNombre[seleccionada.imagen]}
                  alt={seleccionada.modelo}
                />
              ) : (
                <span className="printer-imagen-placeholder">🖨️</span>
              )}
            </div>
            <div className="modal-contenido">
            <span className="printer-proceso-badge">{seleccionada.proceso}</span>
            <h2>{seleccionada.modelo}</h2>

            <dl className="modal-datos">
              <div>
                <dt>Marca: </dt>
                <dd>{seleccionada.marca}</dd>
              </div>
              <div>
                <dt>Proceso: </dt>
                <dd>{seleccionada.proceso}</dd>
              </div>
              <div>
                <dt>Subtipo: </dt>
                <dd>{seleccionada.subtipo}</dd>
              </div>
               <div>
                <dt>Calibracion</dt>
                <dd>{seleccionada.calibracion}</dd>
              </div>
               <div>
                <dt>Extrusor:</dt>
                <dd>{seleccionada.extrusor}</dd>
              </div>
               <div>
                <dt>Boquilla:</dt>
                <dd>{seleccionada.boquilla}</dd>
              </div>
               <div>
                <dt>Plataforma:</dt>
                <dd>{seleccionada.plataforma}</dd>
              </div>
              <div>
                <dt>Precio</dt>
                <dd>{seleccionada.precio}</dd>
              </div>
              </dl>
              <dl className="modal-extra">
               <div>
                <dt>Materiales:</dt>
                <dd>{seleccionada.materiales}</dd>
              </div>
               <div>
                <dt>Utilización:</dt>
                <dd>{seleccionada.uso}</dd>
              </div>
            </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
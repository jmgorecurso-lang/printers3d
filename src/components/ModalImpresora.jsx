import { useEffect } from 'react';
import { useModalImpresora } from '../context/ModalImpresoraContext';
import { imagenesPorNombre } from '../utils/ImagenesImpresoras';


export default function ModalImpresora() {
  const { impresoraSeleccionada, cerrarModal } = useModalImpresora();

  useEffect(() => {
    if (!impresoraSeleccionada) return;

    const alPulsarTecla = (e) => {
      if (e.key === 'Escape') cerrarModal();
    };

    window.addEventListener('keydown', alPulsarTecla);
    return () => window.removeEventListener('keydown', alPulsarTecla);
  }, [impresoraSeleccionada, cerrarModal]);

  if (!impresoraSeleccionada) return null;

  return (
    <div className="modal-fondo" onClick={cerrarModal}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={impresoraSeleccionada.modelo}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-cerrar" onClick={cerrarModal} aria-label="Cerrar">
          ✕
        </button>

        <div className="modal-imagen">
          {imagenesPorNombre[impresoraSeleccionada.imagen] ? (
            <img
              src={imagenesPorNombre[impresoraSeleccionada.imagen]}
              alt={impresoraSeleccionada.modelo}
            />
          ) : (
            <span className="printer-imagen-placeholder">🖨️</span>
          )}
        </div>

        <div className="modal-contenido">
          <span className="printer-proceso-badge">
            {impresoraSeleccionada.proceso}
          </span>
          <h2>{impresoraSeleccionada.modelo}</h2>

          <dl className="modal-datos">
            <div>
              <dt>Marca</dt>
              <dd>{impresoraSeleccionada.marca}</dd>
            </div>
            <div>
              <dt>Proceso</dt>
              <dd>{impresoraSeleccionada.proceso}</dd>
            </div>
            <div>
              <dt>Subtipo</dt>
              <dd>{impresoraSeleccionada.subtipo}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
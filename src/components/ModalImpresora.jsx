import { useEffect } from 'react';
import { useModalImpresora } from '../context/ModalImpresoraContext';
import { imagenesPorNombre } from '../utils/ImagenesImpresoras';

const ETIQUETAS = {
  calibracion: 'Calibración',
  extrusor: 'Extrusor',
  boquilla: 'Boquilla',
  plataforma: 'Plataforma',
  materiales: 'Materiales',
  volumen: 'Volumen',
  precio: 'Precio',
};

// Campos que NO van en la lista de especificaciones porque ya se
// muestran en otra parte de la ficha (título, categoría, uso...)
const CAMPOS_OCULTOS = [
  'modelo',
  'imagen',
  'destacada',
  'marca',
  'proceso',
  'subtipo',
  'uso',
];

const CAMPOS_ANCHOS = ['materiales'];

function Icon({ name, size = 14 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  const paths = {
    home: (
      <>
        <path d="m3 12 2-2 7-7 7 7 2 2" />
        <path d="M5 10v10a1 1 0 0 0 1 1h3v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5h3a1 1 0 0 0 1-1V10" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    bolt: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
    cpu: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M4 20h16" />
      </>
    ),
    back: (
      <>
        <path d="m10 19-7-7 7-7" />
        <path d="M3 12h18" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

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

  const imp = impresoraSeleccionada;
  const filas = Object.entries(imp).filter(
    ([campo]) => !CAMPOS_OCULTOS.includes(campo)
  );
  const referencia = imp.modelo.toUpperCase().replace(/\s+/g, '-');
  const descripcion = `${imp.marca} ${imp.modelo} — impresora de tecnología ${imp.proceso} (${imp.subtipo}).`;

  const handleDescargar = () => {
    const lineas = [
      `FICHA TÉCNICA — ${imp.modelo}`,
      `Marca: ${imp.marca}`,
      `Tecnología: ${imp.proceso} / ${imp.subtipo}`,
      '',
      descripcion,
      '',
      'Especificaciones',
      ...filas.map(([campo, valor]) => `${ETIQUETAS[campo] || campo}: ${valor}`),
    ].join('\n');

    const blob = new Blob([lineas], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${referencia.toLowerCase()}-ficha-tecnica.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-fondo" onClick={cerrarModal}>
      <article
        className="product-card"
        role="dialog"
        aria-modal="true"
        aria-label={imp.modelo}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="topbar">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <span>
              <Icon name="home" size={13} /> Inicio
            </span>
            <span>/</span>
            <span>Impresoras</span>
            <span>/</span>
            <span>{imp.proceso}</span>
            <span>/</span>
            <strong>{imp.modelo}</strong>
          </nav>

          <div className="top-actions">
            {imp.calibracion && (
              <div className="status">
                <span className="status-dot" />
                Calibración {imp.calibracion}
              </div>
            )}
            <span className="reference">REF: {referencia}</span>
            <button
              className="close-button"
              aria-label="Cerrar"
              onClick={cerrarModal}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </header>

        <div className="dashboard">
          <section className="bambu-hero" aria-label="Imagen de producto">
            <div className="hero-label">
              <span>
                <i /> FICHA TÉCNICA
              </span>
              <span>{referencia}</span>
            </div>

            <div className="image-viewport">
              <span className="marker top-left">[CAD VIEW]</span>
              <span className="marker top-right">{imp.subtipo}</span>
              <span className="marker bottom-left">PRINTLAB</span>
              <span className="marker bottom-right">{imp.marca}</span>

              {imagenesPorNombre[imp.imagen] ? (
                <img
                  src={imagenesPorNombre[imp.imagen]}
                  alt={imp.modelo}
                  className="product-image"
                />
              ) : (
                <span className="printer-imagen-placeholder-grande">🖨️</span>
              )}
            </div>

            <div className="telemetry-grid">
              <div>
                <small>Proceso</small>
                <strong>{imp.proceso}</strong>
              </div>
              <div>
                <small>Volumen</small>
                <strong>{imp.volumen || '—'}</strong>
              </div>
              <div>
                <small>Precio</small>
                <strong>{imp.precio || '—'}</strong>
              </div>
            </div>
          </section>

          <section className="details">
            <div>
              <div className="metadata">
                <span className="category">
                  {imp.proceso} / {imp.subtipo}
                </span>
                {imp.destacada && (
                  <span className="destacada-tag">★ Destacada</span>
                )}
              </div>

              <div className="product-header">
                <h1>{imp.modelo}</h1>
                <p className="description">{descripcion}</p>
              </div>
            </div>

            {imp.uso && (
              <div className="purpose">
                <div className="purpose-icon">
                  <Icon name="bolt" size={16} />
                </div>
                <div>
                  <h2>Uso principal</h2>
                  <p>{imp.uso}</p>
                </div>
              </div>
            )}

            <section>
              <div className="section-heading">
                <h2>
                  <Icon name="cpu" size={14} />
                  Especificaciones
                </h2>
                <span>{filas.length} DATOS</span>
              </div>

              <div className="spec-grid">
                {filas.map(([campo, valor]) => (
                  <div
                    className={`spec ${CAMPOS_ANCHOS.includes(campo) ? 'wide' : ''}`}
                    key={campo}
                  >
                    <span>{ETIQUETAS[campo] || campo}</span>
                    <strong>{valor}</strong>
                  </div>
                ))}
              </div>
            </section>

            <div className="actions">
              <button className="secondary-button" onClick={cerrarModal}>
                <Icon name="back" size={14} />
                Volver
              </button>
              <button className="primary-button" onClick={handleDescargar}>
                <Icon name="download" size={15} />
                Descargar ficha técnica
              </button>
            </div>
          </section>
        </div>

        <footer className="footer">
          <span>ESTADO: SISTEMA EN LÍNEA</span>
          <span>PRINTLAB © 2026</span>
        </footer>
      </article>
    </div>
  );
}
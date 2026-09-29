import BuscadorImpresoras from './BuscadorImpresoras';

function Hero({ alSeleccionarTipo }) {
  return (
    <section className="hero">
      <span className="hero-badge">
        • Plataforma de calibración &amp; perfiles 3D
      </span>

      <h1 className="hero-titulo">
        Encuentra la configuración exacta para tu{' '}
        <span className="hero-titulo-destacado">impresión 3D</span>
      </h1>

      <p className="hero-subtitulo">
        Parámetros cinemáticos certificados, retracciones calibradas y curvas
        térmicas validadas para FDM, Resina SLA y Sinterizado SLS de grado
        industrial.
      </p>

      <BuscadorImpresoras alSeleccionarTipo={alSeleccionarTipo} />
    </section>
  );
}

export default Hero;
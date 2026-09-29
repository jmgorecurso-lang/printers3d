import { useState } from 'react';
import { buscarEnCatalogo } from '../utils/buscarEnCatalogo';

function Hero({ alSeleccionarTipo }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState(null);

  const atajos = [
    'Bambu Lab A1',
    'Elegoo Mars 4',
    'PETG',
    'Creality K2 SE',
    'Resina ABS-Like',
  ];

  const handleBuscar = (e) => {
    e.preventDefault();
    setResultados(buscarEnCatalogo(query));
  };

  const handleAtajo = (texto) => {
    setQuery(texto);
    setResultados(buscarEnCatalogo(texto));
  };

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

      <form className="hero-buscador" onSubmit={handleBuscar}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por impresora (ej. Bambu A1, K2 SE), material (PETG, Resina)..."
        />
        <button type="submit" className="btn-primario">
          Buscar →
        </button>
      </form>

      <div className="hero-atajos">
        <span className="hero-atajos-label">Atajos rápidos:</span>
        {atajos.map((atajo) => (
          <button
            key={atajo}
            type="button"
            className="chip"
            onClick={() => handleAtajo(atajo)}
          >
            • {atajo}
          </button>
        ))}
      </div>

      {resultados !== null && (
        <div className="hero-resultados">
          {resultados.length === 0 ? (
            <p className="hero-resultados-vacio">
              No se han encontrado coincidencias para "{query}".
            </p>
          ) : (
            <ul className="hero-resultados-lista">
              {resultados.map((r, i) => (
                <li
                  key={i}
                  className="hero-resultado-item"
                  onClick={r.clave ? () => alSeleccionarTipo(r.clave) : undefined}
                  style={{ cursor: r.clave ? 'pointer' : 'default' }}
                >
                  <span className="hero-resultado-tipo">
                    {r.tipo === 'impresora' ? '🖨️' : '🧪'}
                  </span>
                  <div>
                    <strong>{r.titulo}</strong>
                    <p>{r.detalle}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default Hero;
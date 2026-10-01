import { useState, useEffect } from 'react';

const ICONOS_CATEGORIA = {
  Filamento: '🧵',
  Resina: '💧',
  Otros: '⚙️',
};

export default function Materials({ categoriaFiltro, limpiarFiltro }) {
  const [materiales, setMateriales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/materiales')
      .then((res) => {
        if (!res.ok) throw new Error('Respuesta no válida');
        return res.json();
      })
      .then((datos) => setMateriales(datos))
      .catch(() => setError('No se pudieron cargar los materiales.'))
      .finally(() => setCargando(false));
  }, []);

  const materialesMostrados = categoriaFiltro
    ? materiales.filter((m) => m.categoria === categoriaFiltro)
    : materiales;
    console.log('categoriaFiltro recibido:', categoriaFiltro);
console.log('categorías en los datos:', materiales.map((m) => m.categoria));

  return (
    <div className="materials">
      <h1>🧪 Guía de Materiales</h1>
      <p>
        Explora las propiedades de cada material: temperaturas de impresión,
        resistencia al impacto y flexibilidad.
      </p>

      {categoriaFiltro && (
        <p className="printers-vacio">
          Mostrando solo materiales de <strong>{categoriaFiltro}</strong> —{' '}
          <span
            style={{ color: 'var(--color-primario)', cursor: 'pointer' }}
            onClick={limpiarFiltro}
          >
            ver todos
          </span>
        </p>
      )}

      {cargando && <p className="printers-vacio">Cargando materiales...</p>}
      {error && <p className="printers-vacio">{error}</p>}

      <div className="materials-grid">
        {materialesMostrados.map((info) => (
          <article key={info.nombre} className="material-tarjeta">
            <div className="material-imagen">
              <span className="material-icono">
                {ICONOS_CATEGORIA[info.categoria] || '🔬'}
              </span>
            </div>

            <div className="material-info">
              <span className="material-categoria-badge">{info.categoria}</span>
              <h3>{info.nombre}</h3>
              <p className="material-descripcion">{info.descripcion}</p>

              <ul className="material-specs">
                <li>
                  <strong>Temperatura:</strong> {info.temperaturaImpresion}
                </li>
                <li>
                  <strong>Resistencia al impacto:</strong>{' '}
                  {info.resistenciaImpacto}
                </li>
                <li>
                  <strong>Flexibilidad:</strong> {info.flexibilidad}
                </li>
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
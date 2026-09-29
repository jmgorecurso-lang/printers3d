import { useState, useEffect } from 'react';

export default function Materials() {
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

  return (
    <div className="materials">
      <h1>🧪 Guía de Materiales</h1>
      <p>
        Explora las propiedades de cada material: temperaturas de impresión,
        resistencia al impacto y flexibilidad.
      </p>

      {cargando && <p className="printers-vacio">Cargando materiales...</p>}
      {error && <p className="printers-vacio">{error}</p>}

      <div className="materials-grid">
        {materiales.map((info) => (
          <article key={info.nombre} className="material-tarjeta">
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
          </article>
        ))}
      </div>
    </div>
  );
}
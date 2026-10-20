import { useState, useEffect } from 'react';

import imgFilamento from '../assets/Imagenes/Materiales/filam.svg';
import imgResina from '../assets/Imagenes/Materiales/resina.svg';
import imgOtros from '../assets/Imagenes/Materiales/otros.svg';

const IMAGENES_TIPO = {
  filamento: imgFilamento,
  resina: imgResina,
  otros: imgOtros,
};



const ETIQUETA_TIPO = {
  filamento: 'Filamento',
  resina: 'Resina',
  otros: 'Otros',
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
    ? materiales.filter((m) => m.tipo === categoriaFiltro)
    : materiales;

  return (
    <div className="materials">
      <h1>🧪 Guía de Materiales</h1>
      <p>
        Explora las propiedades de cada material: temperaturas de impresión,
        resistencia al impacto y flexibilidad.
      </p>

      {categoriaFiltro && (
        <p className="printers-vacio">
          Mostrando solo materiales de{' '}
          <strong>{ETIQUETA_TIPO[categoriaFiltro] || categoriaFiltro}</strong> —{' '}
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
          <article key={info.nombre} className="material-tarjeta" data-tipo={info.tipo}>
            <div className="material-imagen">
              {IMAGENES_TIPO[info.tipo] ? (
                <img src={IMAGENES_TIPO[info.tipo]} alt="" />
              ) : (
                <span className="material-icono">🔬</span>
              )}
            </div>

            <div className="material-info">
               <span className="badge-tipo">{info.categoria}</span>
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
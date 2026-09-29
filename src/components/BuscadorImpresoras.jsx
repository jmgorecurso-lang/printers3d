import { useState } from 'react';
import catalogo from '../data/catalogoImpresoras.json';
import tipos from '../data/Tipos.json';

const atajos = [
  'Bambu Lab A1',
  'Elegoo Mars 4',
  'PETG',
  'Creality K2 SE',
  'Resina ABS-Like',
];

function BuscadorImpresoras({ alSeleccionarTipo }) {
  const [busqueda, setBusqueda] = useState('');

  const textoBusqueda = busqueda.trim().toLowerCase();

  const resultadosImpresoras = catalogo
    .filter((item) => {
      if (textoBusqueda === '') return false;
      return Object.values(item).some((valor) =>
        String(valor).toLowerCase().includes(textoBusqueda)
      );
    })
    .map((item) => ({
      tipo: 'impresora',
      titulo: item.modelo,
      detalle: `${item.marca} · ${item.proceso} · ${item.subtipo}`,
    }));

  const resultadosMateriales = [];
  if (textoBusqueda !== '') {
    Object.entries(tipos).forEach(([clave, info]) => {
      const materiales = Array.isArray(info.materiales)
        ? info.materiales
        : [info.materiales];
      materiales.forEach((mat) => {
        if (mat.toLowerCase().includes(textoBusqueda)) {
          resultadosMateriales.push({
            tipo: 'material',
            titulo: mat,
            detalle: info.nombre,
            clave,
          });
        }
      });
    });
  }

  const resultados = [...resultadosImpresoras, ...resultadosMateriales];

  return (
    <section className="buscador">
      <div className="hero-buscador">
        <input
          type="text"
          placeholder="Busca por impresora (ej. Bambu A1, K2 SE), material (PETG, Resina)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="barra-busqueda"
        />
        <button className="btn-primario">Buscar →</button>
      </div>

      <div className="hero-atajos">
        <span className="hero-atajos-label">Atajos rápidos:</span>
        {atajos.map((atajo) => (
          <button
            key={atajo}
            type="button"
            className="chip"
            onClick={() => setBusqueda(atajo)}
          >
            • {atajo}
          </button>
        ))}
      </div>

      {textoBusqueda !== '' && (
        <div className="hero-resultados">
          {resultados.length === 0 ? (
            <p className="hero-resultados-vacio">
              No se han encontrado coincidencias para "{busqueda}".
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

export default BuscadorImpresoras;
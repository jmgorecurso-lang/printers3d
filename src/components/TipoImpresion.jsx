import { useState, useEffect } from 'react';

export default function TipoImpd({ tipo, volver, irAMateriales, irAImpresoras }) {
  const [info, setInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);

    fetch('/api/tipos')
      .then((res) => {
        if (!res.ok) throw new Error('Respuesta no válida');
        return res.json();
      })
      .then((tipos) => {
        const encontrado = tipos.find((t) => t._id === tipo);
        if (!encontrado) throw new Error('Tipo no encontrado');
        setInfo(encontrado);
      })
      .catch(() => setError('No se pudo cargar la información de este tipo.'))
      .finally(() => setCargando(false));
  }, [tipo]);

  if (cargando) {
    return (
      <div style={{ padding: '2rem' }}>
        <p className="printers-vacio">Cargando...</p>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={volver} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
          ← Volver al inicio
        </button>
        <p className="printers-vacio">{error || 'No se encontró este tipo.'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={volver} style={{ marginBottom: '1rem', cursor: 'pointer' }}>
        ← Volver al inicio
      </button>
      <h1>{info.nombre}</h1>

      <div style={{ marginTop: '2rem' }}>
        <h3>⚙️ Unos datos</h3>
        <p>{info.descripcionCorta}</p>
      </div>

      {info.funcionamiento && (
        <div style={{ marginTop: '2rem' }}>
          <h3>🧩 ¿Qué es?</h3>
          <p>{info.funcionamiento}</p>
        </div>
      )}

      <div
        style={{ marginTop: '2rem', cursor: 'pointer' }}
        onClick={() => irAMateriales(tipo)}
      >
        <h3 style={{ color: 'var(--color-primario)' }}>
          🧪 Materiales comunes →
        </h3>
        <ul>
          {info.materiales.map((mat, index) => (
            <li key={index}>{mat}</li>
          ))}
        </ul>
      </div>

      {info.variantes && (
        <div
          style={{ marginTop: '2rem', cursor: 'pointer' }}
          onClick={() => irAImpresoras(tipo)}
        >
          <h3 style={{ color: 'var(--color-primario)' }}>
            🖨️ Impresoras compatibles →
          </h3>
          <ul>
            {(Array.isArray(info.variantes) ? info.variantes : [info.variantes]).map(
              (v, index) => (
                <li key={index}>{v}</li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
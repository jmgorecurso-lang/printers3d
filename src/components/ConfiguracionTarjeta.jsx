import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ETIQUETA_TIPO = {
  filamento: 'Filamento',
  resina: 'Resina',
  otros: 'Otros',
};

export default function ConfiguracionTarjeta({ config, onEditar, onBorrar, onAprobar }) {
  // ...lo que ya tenías...
  const pendiente = config.estado === 'pendiente';
  const { usuario, abrirLogin } = useAuth();

  const [votos, setVotos] = useState({ media: 0, total: 0, miVoto: null });
  const [hover, setHover] = useState(0);
  const [comentarios, setComentarios] = useState([]);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [avisoComentario, setAvisoComentario] = useState(null);

  const esAutor = usuario && usuario.email === config.autorId;
  const esAdmin = usuario && usuario.rol === 'admin';
  const puedeGestionar = esAutor || esAdmin;

  // Los votos se cargan siempre, en cuanto aparece la tarjeta (son ligeros: solo 2 números + tu voto)
  useEffect(() => {
    fetch(`/api/configuraciones/${config._id}/votos`, { credentials: 'include' })
      .then((res) => res.json())
      .then(setVotos)
      .catch(() => { });
  }, [config._id]);

  const cargarComentarios = () => {
    setCargandoComentarios(true);
    fetch(`/api/configuraciones/${config._id}/comentarios`)
      .then((res) => res.json())
      .then(setComentarios)
      .catch(() => setComentarios([]))
      .finally(() => setCargandoComentarios(false));
  };

  const alternarComentarios = () => {
    const seVaAMostrar = !mostrarComentarios;
    setMostrarComentarios(seVaAMostrar);
    if (seVaAMostrar && comentarios.length === 0) {
      cargarComentarios();
    }
  };

  const votar = async (valor) => {
    if (esAutor) return;
    if (!usuario) {
      abrirLogin();
      return;
    }
    try {
      const res = await fetch(`/api/configuraciones/${config._id}/votos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ valor }),
      });
      const datos = await res.json();
      if (res.ok) setVotos(datos);
    } catch {
      // Si falla, simplemente no se actualiza el contador; no es crítico avisar con un alert aquí
    }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch(`/api/configuraciones/${config._id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ texto }),
      });
      const datos = await res.json();
      // if (res.ok) {
      //   setComentarios((anteriores) => [...anteriores, datos]);
      //   setTexto('');
      //   setAvisoComentario(
      //     datos.estado === 'pendiente'
      //       ? 'Tu comentario se ha enviado y se mostrará a los demás cuando un administrador lo apruebe.'
      //       : null
      //   );
      // }
      // Nuevo estado para los comentarios
      if (res.ok) {
        setComentarios((anteriores) => [...anteriores, datos]);
        setTexto('');
        setAvisoComentario(
          datos.estado === 'pendiente'
            ? 'Tu comentario se ha enviado y se mostrará a los demás cuando el administrador lo apruebe.'
            : null
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  const borrarComentario = async (id) => {
    if (!confirm('¿Borrar este comentario?')) return;
    const res = await fetch(`/api/comentarios/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      setComentarios((anteriores) => anteriores.filter((c) => c._id !== id));
    }
  };

  return (
    <article className="configuracion-tarjeta" data-tipo={config.tipo}>
      <div className="configuracion-tarjeta-header">
        <div className="configuracion-etiquetas">
           <span className="badge-tipo">
            {ETIQUETA_TIPO[config.tipo] || config.tipo}
          </span>
          {pendiente && <span className="badge-pendiente">Pendiente de aprobación</span>}
        </div>
        {puedeGestionar && (
          <div className="configuracion-acciones">
            <button onClick={() => onEditar(config)}>✏️</button>
            <button onClick={() => onBorrar(config._id)}>🗑️</button>
          </div>
        )}
      </div>

      <h3>{config.titulo}</h3>

      <ul className="material-specs">
        {config.impresora && (
          <li><strong>Impresora:</strong> {config.impresora}</li>
        )}
        {config.material && (
          <li><strong>Material:</strong> {config.material}</li>
        )}
        {config.temperaturaBoquilla && (
          <li><strong>Boquilla:</strong> {config.temperaturaBoquilla}</li>
        )}
        {config.temperaturaCama && (
          <li><strong>Cama:</strong> {config.temperaturaCama}</li>
        )}
        {config.velocidad && (
          <li><strong>Velocidad:</strong> {config.velocidad}</li>
        )}
      </ul>

      {config.notas && <p className="configuracion-notas">{config.notas}</p>}

      <p className="configuracion-autor">
        Propuesto por <strong>{config.autorNombre}</strong>
      </p>
      {pendiente && esAdmin && (
        <button
          className="btn-primario configuracion-aprobar"
          onClick={() => onAprobar(config._id)}
        >
          Aprobar
        </button>
      )}

      {!pendiente && (
        <>
          <div className="configuracion-votos">
            <div
              className="estrellas"
              onMouseLeave={() => setHover(0)}
              title={esAutor ? 'No puedes valorar tu propia configuración' : undefined}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                // En tu configuración las estrellas no son un voto, enseñan la media de los demás
                const llenas = esAutor ? Math.round(votos.media) : hover || votos.miVoto || 0;

                return (
                  <button
                    key={n}
                    type="button"
                    className={`estrella ${n <= llenas ? 'estrella-activa' : ''}`}
                    disabled={esAutor}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => votar(n)}
                    aria-label={`Valorar con ${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <span className="valoracion-resumen">
              {votos.total > 0
                ? `${votos.media.toFixed(1)} (${votos.total} ${votos.total === 1 ? 'voto' : 'votos'})`
                : 'Sin valoraciones'}
            </span>

            <button
              className="btn-texto configuracion-toggle-comentarios"
              onClick={alternarComentarios}
            >
              💬 {mostrarComentarios ? 'Ocultar comentarios' : 'Ver comentarios'}
            </button>
          </div>
          {esAutor && (
            <p className="configuracion-nota-propia">
              No puedes valorar tu propia configuración.
            </p>
          )}

          {mostrarComentarios && (
            <div className="configuracion-comentarios">
              {cargandoComentarios && <p className="printers-vacio">Cargando...</p>}

              {!cargandoComentarios && comentarios.length === 0 && (
                <p className="printers-vacio">Todavía no hay comentarios.</p>
              )}

              {!cargandoComentarios && comentarios.length > 0 && (
                <ul className="comentarios-lista">
                  {comentarios.map((c) => {
                    const puedeBorrar = usuario && (usuario.id === c.autorId || usuario.rol === 'admin');
                    return (
                      <li key={c._id} className="comentario-item">
                        <div>
                          <strong>{c.autorNombre}</strong>
                          {c.estado === 'pendiente' && <span className="badge-pendiente">Pendiente</span>}
                          <p>{c.texto}</p>
                        </div>
                        {puedeBorrar && (
                          <button
                            className="comentario-borrar"
                            onClick={() => borrarComentario(c._id)}
                          >
                            🗑️
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {usuario ? (
                <form className="comentario-form" onSubmit={enviarComentario}>
                  <input
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe un comentario..."
                  />
                  <button type="submit" className="btn-primario" disabled={enviando}>
                    Enviar
                  </button>
                </form>
              ) : (
                <p className="configuracion-login-aviso">
                  {avisoComentario && <p className="configuracion-nota-propia">{avisoComentario}</p>}
                  <span onClick={abrirLogin}>Inicia sesión</span> para comentar.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
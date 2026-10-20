import { useState, useEffect, useCallback } from 'react';
import {
  FaHouse,
  FaTableCellsLarge,
  FaLayerGroup,
  FaRegStar,
  FaRegComment,
  FaRegUser,
  FaArrowRightFromBracket,
  FaPlus,
  FaPenToSquare,
  FaRegTrashCan,
  FaShieldHalved,
} from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { iniciales } from '../utils/iniciales';
import CampoContrasena from './CampoContrasena';

const PESTANAS = [
  { id: 'resumen', etiqueta: 'Resumen', Icono: FaTableCellsLarge },
  { id: 'configuraciones', etiqueta: 'Mis configuraciones', Icono: FaLayerGroup },
  { id: 'valoraciones', etiqueta: 'Mis valoraciones', Icono: FaRegStar },
  { id: 'comentarios', etiqueta: 'Mis comentarios', Icono: FaRegComment },
  { id: 'perfil', etiqueta: 'Perfil', Icono: FaRegUser },
];
const PESTANA_MODERACION = { id: 'moderacion', etiqueta: 'Moderación', Icono: FaShieldHalved };

const FILTROS = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'aprobada', etiqueta: 'Aprobadas' },
  { id: 'pendiente', etiqueta: 'Pendientes' },
];

const ETIQUETA_ROL = { usuario: 'Usuario', admin: 'Admin' };

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatoMedia = (n) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Petición GET con la cookie de sesión; lanza error si la respuesta no es correcta
const pedir = (url) =>
  fetch(url, { credentials: 'include' }).then((res) => {
    if (!res.ok) throw new Error('Respuesta no válida');
    return res.json();
  });
// Petición PUT con JSON y cookie de sesión; devuelve { ok, datos }
const enviarPut = async (url, cuerpo) => {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cuerpo),
  });
  return { ok: res.ok, datos: await res.json() };
};

// Estrellas de solo lectura (las interactivas están en ConfiguracionTarjeta)
function Estrellas({ valor }) {
  return (
    <span className="panel-estrellas" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= valor ? 'estrella-activa' : 'panel-estrella-vacia'}>
          ★
        </span>
      ))}
    </span>
  );
}

// La tabla de configuraciones, compartida por Resumen y "Mis configuraciones"
function TablaConfiguraciones({ configuraciones, irAFormulario, onBorrar }) {
  return (
    <div className="panel-tabla-scroll">
      <table className="panel-tabla">
        <thead>
          <tr>
            <th>Título</th>
            <th>Impresora</th>
            <th>Material</th>
            <th>Temperaturas</th>
            <th>Valoración</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {configuraciones.map((c) => (
            <tr key={c._id}>
              <td>
                <span className="panel-config-titulo">{c.titulo}</span>
              </td>
              <td>{c.impresora || '—'}</td>
              <td>
                {c.material ? <span className="panel-material">{c.material}</span> : '—'}
              </td>
              <td className="panel-temperaturas">
                {c.temperaturaBoquilla || '—'} / {c.temperaturaCama || '—'}
              </td>
              <td>
                {c.totalVotos > 0 ? (
                  <>
                    <span className="estrella-activa">★</span> {formatoMedia(c.media)}{' '}
                    <small className="panel-votos">
                      ({c.totalVotos} {c.totalVotos === 1 ? 'voto' : 'votos'})
                    </small>
                  </>
                ) : (
                  <span className="panel-votos">Sin votos</span>
                )}
              </td>
              <td>
                <span
                  className={`panel-estado ${c.estado === 'pendiente' ? 'panel-estado-pendiente' : 'panel-estado-aprobada'
                    }`}
                >
                  {c.estado === 'pendiente' ? 'Pendiente' : 'Aprobada'}
                </span>
              </td>
              <td>
                <div className="panel-acciones">
                  <button
                    className="panel-accion-editar"
                    onClick={() => irAFormulario(c)}
                    aria-label="Editar configuración"
                  >
                    <FaPenToSquare aria-hidden="true" />
                  </button>
                  <button
                    className="panel-accion-borrar"
                    onClick={() => onBorrar(c._id)}
                    aria-label="Borrar configuración"
                  >
                    <FaRegTrashCan aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Pestaña "Mis configuraciones": todas, con filtro por estado
function PestanaConfiguraciones({ configuraciones, irAFormulario, onBorrar }) {
  const [filtro, setFiltro] = useState('todas');

  const cuantas = (id) =>
    id === 'todas'
      ? configuraciones.length
      : configuraciones.filter((c) => c.estado === id).length;

  const mostradas =
    filtro === 'todas' ? configuraciones : configuraciones.filter((c) => c.estado === filtro);

  return (
    <section className="panel-seccion">
      <div className="panel-filtros">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            className={`chip ${filtro === f.id ? 'chip-activo' : ''}`}
            onClick={() => setFiltro(f.id)}
          >
            {f.etiqueta} ({cuantas(f.id)})
          </button>
        ))}
      </div>

      {mostradas.length === 0 ? (
        <p className="printers-vacio">No hay configuraciones en esta categoría.</p>
      ) : (
        <TablaConfiguraciones
          configuraciones={mostradas}
          irAFormulario={irAFormulario}
          onBorrar={onBorrar}
        />
      )}
    </section>
  );
}

// Pestaña "Mis valoraciones": las estrellas que he dado yo
function PestanaValoraciones() {
  const [valoraciones, setValoraciones] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    pedir('/api/panel/valoraciones')
      .then(setValoraciones)
      .catch(() => setError('No se pudieron cargar tus valoraciones.'));
  }, []);

  if (error) return <p className="printers-vacio">{error}</p>;
  if (!valoraciones) return <p className="printers-vacio">Cargando...</p>;

  return (
    <section className="panel-seccion">
      <div className="panel-seccion-cabecera">
        <h2>Mis valoraciones</h2>
        <span className="panel-contador">
          {valoraciones.length} {valoraciones.length === 1 ? 'valoración' : 'valoraciones'}
        </span>
      </div>

      {valoraciones.length === 0 ? (
        <p className="printers-vacio">Todavía no has valorado ninguna configuración.</p>
      ) : (
        <ul className="panel-lista">
          {valoraciones.map((v) => (
            <li key={v.configuracionId} className="panel-lista-item">
              <div className="panel-lista-cuerpo">
                <span className="panel-config-titulo">{v.configuracionTitulo}</span>
                {v.fecha && <time dateTime={v.fecha}>{formatearFecha(v.fecha)}</time>}
              </div>
              <Estrellas valor={v.valor} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Pestaña "Mis comentarios": los que he escrito yo, con opción de borrarlos

function PestanaComentarios({ recargarResumen }) {
  const [comentarios, setComentarios] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    pedir('/api/panel/comentarios')
      .then(setComentarios)
      .catch(() => setError('No se pudieron cargar tus comentarios.'));
  }, []);

  const borrar = async (id) => {
    if (!confirm('¿Borrar este comentario?')) return;

    try {
      const res = await fetch(`/api/comentarios/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const respuesta = await res.json();
        alert(respuesta.error || 'No se pudo borrar');
        return;
      }
      setComentarios((anteriores) => anteriores.filter((c) => c._id !== id));
      recargarResumen(); // para que el contador de la pestaña Resumen no se quede viejo
    } catch {
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  if (error) return <p className="printers-vacio">{error}</p>;
  if (!comentarios) return <p className="printers-vacio">Cargando...</p>;

  return (
    <section className="panel-seccion">
      <div className="panel-seccion-cabecera">
        <h2>Mis comentarios</h2>
        <span className="panel-contador">
          {comentarios.length} {comentarios.length === 1 ? 'comentario' : 'comentarios'}
        </span>
      </div>

      {comentarios.length === 0 ? (
        <p className="printers-vacio">Todavía no has escrito ningún comentario.</p>
      ) : (
        <ul className="panel-lista">
          {comentarios.map((c) => (
            <li key={c._id} className="panel-lista-item">
              <div className="panel-lista-cuerpo">
                <span className="panel-comentario-config">{c.configuracionTitulo}</span>
                {c.estado === 'pendiente' && (
                  <span className="badge-pendiente">Pendiente</span>
                )}
                <p className="panel-comentario-texto">"{c.texto}"</p>
                <time dateTime={c.creadoEn}>{formatearFecha(c.creadoEn)}</time>
              </div>
              <button
                className="panel-lista-borrar"
                onClick={() => borrar(c._id)}
                aria-label="Borrar comentario"
              >
                <FaRegTrashCan aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
// Pestaña "Perfil": cambiar el nombre y la contraseña
function PestanaPerfil({ usuario }) {
  const { actualizarUsuario } = useAuth();

  const [nombre, setNombre] = useState(usuario.nombre);
  const [mensajeNombre, setMensajeNombre] = useState(null); // { tipo: 'ok' | 'error', texto }
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [mensajeClave, setMensajeClave] = useState(null);
  const [guardandoClave, setGuardandoClave] = useState(false);

  const guardarNombre = async (e) => {
    e.preventDefault();
    setMensajeNombre(null);
    setGuardandoNombre(true);

    try {
      const { ok, datos } = await enviarPut('/api/auth/perfil', { nombre });
      if (!ok) {
        setMensajeNombre({ tipo: 'error', texto: datos.error || 'No se pudo guardar' });
        return;
      }
      actualizarUsuario(datos);
      setNombre(datos.nombre);
      setMensajeNombre({ tipo: 'ok', texto: 'Nombre actualizado.' });
    } catch {
      setMensajeNombre({ tipo: 'error', texto: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setGuardandoNombre(false);
    }
  };

  const cambiarClave = async (e) => {
    e.preventDefault();
    setMensajeClave(null);

    if (nueva !== repetida) {
      setMensajeClave({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden.' });
      return;
    }

    setGuardandoClave(true);
    try {
      const { ok, datos } = await enviarPut('/api/auth/contrasena', {
        contrasenaActual: actual,
        contrasenaNueva: nueva,
      });
      if (!ok) {
        setMensajeClave({ tipo: 'error', texto: datos.error || 'No se pudo cambiar' });
        return;
      }
      setActual('');
      setNueva('');
      setRepetida('');
      setMensajeClave({ tipo: 'ok', texto: 'Contraseña actualizada.' });
    } catch {
      setMensajeClave({ tipo: 'error', texto: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setGuardandoClave(false);
    }
  };

  return (
    <>
      <section className="panel-seccion">
        <div className="panel-seccion-cabecera">
          <h2>Datos personales</h2>
        </div>

        <form className="perfil-form" onSubmit={guardarNombre}>
          <div className="calculadora-campo">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={50}
              required
            />
          </div>

          <div className="calculadora-campo">
            <label>Email</label>
            <input type="email" value={usuario.email} disabled />
            <small className="perfil-ayuda">El email no se puede cambiar.</small>
          </div>

          {mensajeNombre && (
            <p className={`perfil-mensaje perfil-mensaje-${mensajeNombre.tipo}`}>
              {mensajeNombre.texto}
            </p>
          )}

          <button
            type="submit"
            className="btn-primario"
            disabled={guardandoNombre || nombre.trim() === usuario.nombre}
          >
            {guardandoNombre ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      <section className="panel-seccion">
        <div className="panel-seccion-cabecera">
          <h2>Cambiar contraseña</h2>
        </div>

        <form className="perfil-form" onSubmit={cambiarClave}>
          <div className="calculadora-campo">
            <label>Contraseña actual</label>
            <CampoContrasena
              etiqueta="Contraseña actual"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              autoComplete="current-password"
            />

            <CampoContrasena
              etiqueta="Contraseña nueva"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              ayuda="Mínimo 6 caracteres."
            />

            <CampoContrasena
              etiqueta="Repite la contraseña nueva"
              value={repetida}
              onChange={(e) => setRepetida(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {mensajeClave && (
            <p className={`perfil-mensaje perfil-mensaje-${mensajeClave.tipo}`}>
              {mensajeClave.texto}
            </p>
          )}

          <button type="submit" className="btn-primario" disabled={guardandoClave}>
            {guardandoClave ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </section>
    </>
  );
}
// Acción sobre un elemento (aprobar o rechazar); devuelve true si el servidor la aceptó
const enviar = async (metodo, url) => {
  try {
    const res = await fetch(url, { method: metodo, credentials: 'include' });
    if (!res.ok) {
      const datos = await res.json();
      alert(datos.error || 'No se pudo completar la acción');
      return false;
    }
    return true;
  } catch {
    alert('Error de conexión. Inténtalo de nuevo.');
    return false;
  }
};

// Pestaña "Moderación" (solo admin): la cola de lo que espera aprobación
function PestanaModeracion({ pendientes, onActualizar }) {
  const aprobar = async (url) => {
    if (await enviar('PATCH', url)) onActualizar();
  };

  const rechazar = async (url, mensaje) => {
    if (!confirm(mensaje)) return;
    if (await enviar('DELETE', url)) onActualizar();
  };

  const { configuraciones, comentarios } = pendientes;

  return (
    <>
      <section className="panel-seccion">
        <div className="panel-seccion-cabecera">
          <h2>Configuraciones pendientes</h2>
          <span className="panel-contador">{configuraciones.length}</span>
        </div>

        {configuraciones.length === 0 ? (
          <p className="printers-vacio">No hay configuraciones pendientes.</p>
        ) : (
          <ul className="moderacion-lista">
            {configuraciones.map((c) => (
              <li key={c._id} className="moderacion-item">
                <div className="moderacion-cuerpo">
                  <span className="panel-config-titulo">{c.titulo}</span>
                  <p className="moderacion-meta">
                    {c.autorNombre} · {formatearFecha(c.creadoEn)}
                  </p>
                  <p className="moderacion-detalle">
                    {[
                      c.impresora,
                      c.material,
                      c.temperaturaBoquilla &&
                      `${c.temperaturaBoquilla} / ${c.temperaturaCama || '—'}`,
                      c.velocidad,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {c.notas && <p className="moderacion-detalle">"{c.notas}"</p>}
                </div>
                <div className="moderacion-acciones">
                  <button
                    className="moderacion-aprobar"
                    onClick={() => aprobar(`/api/configuraciones/${c._id}/aprobar`)}
                  >
                    Aprobar
                  </button>
                  <button
                    className="moderacion-rechazar"
                    onClick={() =>
                      rechazar(
                        `/api/configuraciones/${c._id}`,
                        '¿Rechazar y borrar esta configuración? No se puede deshacer.'
                      )
                    }
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel-seccion">
        <div className="panel-seccion-cabecera">
          <h2>Comentarios pendientes</h2>
          <span className="panel-contador">{comentarios.length}</span>
        </div>

        {comentarios.length === 0 ? (
          <p className="printers-vacio">No hay comentarios pendientes.</p>
        ) : (
          <ul className="moderacion-lista">
            {comentarios.map((c) => (
              <li key={c._id} className="moderacion-item">
                <div className="moderacion-cuerpo">
                  <span className="panel-comentario-config">{c.configuracionTitulo}</span>
                  <p className="moderacion-meta">
                    {c.autorNombre} · {formatearFecha(c.creadoEn)}
                  </p>
                  <p className="moderacion-detalle">"{c.texto}"</p>
                </div>
                <div className="moderacion-acciones">
                  <button
                    className="moderacion-aprobar"
                    onClick={() => aprobar(`/api/comentarios/${c._id}/aprobar`)}
                  >
                    Aprobar
                  </button>
                  <button
                    className="moderacion-rechazar"
                    onClick={() =>
                      rechazar(
                        `/api/comentarios/${c._id}`,
                        '¿Rechazar y borrar este comentario? No se puede deshacer.'
                      )
                    }
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
function PanelContenido({ usuario, irA, irAFormulario }) {
  const { logout } = useAuth();
  const esAdmin = usuario.rol === 'admin';
  const [pestana, setPestana] = useState('resumen');
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(() => {
    Promise.all([
      pedir('/api/panel/resumen'),
      pedir('/api/panel/configuraciones'),
      pedir('/api/panel/comentarios-recibidos'),
      esAdmin ? pedir('/api/admin/pendientes') : Promise.resolve(null),
    ])
      .then(([resumen, configuraciones, recibidos, pendientes]) =>
        setDatos({ resumen, configuraciones, recibidos, pendientes })
      )
      .catch(() => setError('No se pudo cargar tu panel.'));
  }, [esAdmin]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const borrarConfiguracion = async (id) => {
    if (!confirm('¿Seguro que quieres borrar esta configuración?')) return;

    try {
      const res = await fetch(`/api/configuraciones/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const respuesta = await res.json();
        alert(respuesta.error || 'No se pudo borrar');
        return;
      }
      cargar(); // recarga todo: cambian la tabla y también las estadísticas
    } catch {
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  if (error) {
    return (
      <div className="panel">
        <p className="printers-vacio">{error}</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="panel">
        <p className="printers-vacio">Cargando tu panel...</p>
      </div>
    );
  }

  const { resumen, configuraciones, recibidos, pendientes } = datos;

  const totalPendientes = pendientes
    ? pendientes.configuraciones.length + pendientes.comentarios.length
    : 0;

  // El admin ve una pestaña más, justo después de Resumen
  const pestanas = esAdmin
    ? [PESTANAS[0], PESTANA_MODERACION, ...PESTANAS.slice(1)]
    : PESTANAS;

  return (
    <div className="panel">
      <nav className="panel-migas" aria-label="Ruta">
        <button onClick={() => irA('inicio')}>
          <FaHouse aria-hidden="true" />
          Inicio
        </button>
        <span>/</span>
        <span>Mi panel</span>
      </nav>

      <div className="panel-layout">
        <aside className="panel-pestanas">
          <div className="panel-pestanas-lista" role="tablist" aria-orientation="vertical">
            {pestanas.map(({ id, etiqueta, Icono }) => (
              <button id='pestanas'
                key={id}
                role="tab"
                aria-selected={pestana === id}
                className={`panel-pestana ${pestana === id ? 'panel-pestana-activa' : ''}`}
                onClick={() => setPestana(id)}
              >
                <Icono aria-hidden="true" />
                {etiqueta}
                {id === 'moderacion' && totalPendientes > 0 && (
                  <span className="panel-pestana-badge">{totalPendientes}</span>
                )}
              </button>
            ))}
          </div>

          <div className="panel-cerrar-sesion">
            <button id="cierra" onClick={logout}>
              <FaArrowRightFromBracket aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="panel-principal">
          <div className="panel-cabecera">
            <div>
              <div className="panel-titulo">
                <h1>Hola, {usuario.nombre.split(' ')[0]}</h1>
                <span className="panel-rol">{ETIQUETA_ROL[usuario.rol] || usuario.rol}</span>
              </div>
              <p className="panel-subtitulo">
                Gestiona tus configuraciones, valoraciones y comentarios.
              </p>
            </div>
            <button className="btn-primario" onClick={() => irAFormulario()}>
              <FaPlus aria-hidden="true" />
              Subir configuración
            </button>
          </div>

          {pestana === 'resumen' && (
            <>
              {esAdmin && totalPendientes > 0 && (
                <p className="configuracion-aviso">
                  Tienes {totalPendientes}{' '}
                  {totalPendientes === 1 ? 'elemento pendiente' : 'elementos pendientes'} de revisar.{' '}
                  <button className="panel-enlace" onClick={() => setPestana('moderacion')}>
                    Ir a moderación →
                  </button>
                </p>
              )}
              <div className="panel-stats">
                <div className="panel-stat">
                  <span>Configuraciones subidas</span>
                  <strong>{resumen.configuraciones}</strong>
                </div>
                <div className="panel-stat">
                  <span>Valoraciones dadas</span>
                  <strong>{resumen.valoracionesDadas}</strong>
                </div>
                <div className="panel-stat">
                  <span>Comentarios</span>
                  <strong>{resumen.comentarios}</strong>
                </div>
                <div className="panel-stat">
                  <span>Media recibida</span>
                  <strong>
                    {resumen.votosRecibidos > 0 ? formatoMedia(resumen.mediaRecibida) : '—'}{' '}
                    <span className="estrella-activa">★</span>
                  </strong>
                  <small>
                    sobre {resumen.votosRecibidos}{' '}
                    {resumen.votosRecibidos === 1 ? 'voto' : 'votos'}
                  </small>
                </div>
              </div>

              <section className="panel-seccion">
                <div className="panel-seccion-cabecera">
                  <h2>Mis configuraciones</h2>
                  <span className="panel-contador">
                    {configuraciones.length}{' '}
                    {configuraciones.length === 1 ? 'configuración' : 'configuraciones'}
                  </span>
                </div>

                {configuraciones.length === 0 ? (
                  <p className="printers-vacio">Todavía no has subido ninguna configuración.</p>
                ) : (
                  <>
                    <TablaConfiguraciones
                      configuraciones={configuraciones.slice(0, 5)}
                      irAFormulario={irAFormulario}
                      onBorrar={borrarConfiguracion}
                    />
                    {configuraciones.length > 5 && (
                      <button
                        className="panel-ver-todas"
                        onClick={() => setPestana('configuraciones')}
                      >
                        Ver todas ({configuraciones.length}) →
                      </button>
                    )}
                  </>
                )}
              </section>

              <section className="panel-seccion">
                <div className="panel-seccion-cabecera">
                  <h2>Comentarios recibidos</h2>
                </div>

                {recibidos.length === 0 ? (
                  <p className="printers-vacio">Todavía no has recibido comentarios.</p>
                ) : (
                  <>
                    <ul className="panel-comentarios">
                      {recibidos.slice(0, 5).map((c) => (
                        <li key={c._id} className="panel-comentario">
                          <div className="panel-comentario-cabecera">
                            <div className="panel-comentario-autor">
                              <div className="panel-avatar">{iniciales(c.autorNombre)}</div>
                              <strong>{c.autorNombre}</strong>
                            </div>
                            <time dateTime={c.creadoEn}>{formatearFecha(c.creadoEn)}</time>
                          </div>
                          <div className="panel-comentario-config">
                            <span>{c.configuracionTitulo}</span>
                            {c.valoracion && <Estrellas valor={c.valoracion} />}
                          </div>
                          <p className="panel-comentario-texto">"{c.texto}"</p>
                        </li>
                      ))}
                    </ul>
                    {recibidos.length > 5 && (
                      <p className="panel-votos panel-nota">
                        Mostrando los 5 más recientes de {recibidos.length}.
                      </p>
                    )}
                  </>
                )}
              </section>
            </>
          )}

          {pestana === 'configuraciones' && (
            <PestanaConfiguraciones
              configuraciones={configuraciones}
              irAFormulario={irAFormulario}
              onBorrar={borrarConfiguracion}
            />
          )}
          {pestana === 'moderacion' && esAdmin && (
            <PestanaModeracion pendientes={pendientes} onActualizar={cargar} />
          )}

          {pestana === 'valoraciones' && <PestanaValoraciones />}

          {pestana === 'comentarios' && <PestanaComentarios recargarResumen={cargar}
          />

          }

          {pestana === 'perfil' && <PestanaPerfil usuario={usuario} />}
        </div>
      </div>
    </div>
  );
}

// Puerta de entrada: solo deja ver el panel si hay sesión
export default function Panel({ irA, irAFormulario }) {
  const { usuario, cargando, abrirLogin } = useAuth();

  if (cargando) {
    return (
      <div className="panel">
        <p className="printers-vacio">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="panel panel-sin-sesion">
        <h1>Mi panel</h1>
        <p>Inicia sesión para ver tus configuraciones, valoraciones y comentarios.</p>
        <button className="btn-primario" onClick={abrirLogin}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  // key={usuario.id}: si cambia el usuario, React monta el panel desde cero
  return (
    <PanelContenido
      key={usuario.id}
      usuario={usuario}
      irA={irA}
      irAFormulario={irAFormulario}
    />
  );
}
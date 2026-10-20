import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ConfiguracionTarjeta from './ConfiguracionTarjeta';

const ETIQUETA_TIPO = {
    filamento: 'Filamento',
    resina: 'Resina',
    otros: 'Otros',
};

const CAMPOS_INICIALES = {
    titulo: '',
    tipo: 'filamento',
    impresora: '',
    material: '',
    temperaturaBoquilla: '',
    temperaturaCama: '',
    velocidad: '',
    notas: '',
};

const camposDesdeConfig = (config) => ({
    titulo: config.titulo,
    tipo: config.tipo,
    impresora: config.impresora,
    material: config.material,
    temperaturaBoquilla: config.temperaturaBoquilla,
    temperaturaCama: config.temperaturaCama,
    velocidad: config.velocidad,
    notas: config.notas,
});
export default function Configuraciones({ formularioInicial }) {
    const { usuario, abrirLogin } = useAuth();

    const [configuraciones, setConfiguraciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const configInicial = formularioInicial?.config ?? null;

    const [mostrarForm, setMostrarForm] = useState(Boolean(formularioInicial));
    const [editandoId, setEditandoId] = useState(configInicial ? configInicial._id : null);
    const [campos, setCampos] = useState(
        configInicial ? camposDesdeConfig(configInicial) : CAMPOS_INICIALES
    );
    const [enviando, setEnviando] = useState(false);
    const [errorForm, setErrorForm] = useState(null);
    const [impresorasDisponibles, setImpresorasDisponibles] = useState([]);
    const [materialDisponible, setMaterialDisponible] = useState([]);
    const [aviso, setAviso] = useState(null);
    const materialDelTipo = materialDisponible.filter(
        (mat) => mat.tipo?.toLowerCase() === campos.tipo?.toLowerCase()
    );
    const impresorasDelTipo = impresorasDisponibles.filter(
        (imp) => imp.tipo?.toLowerCase() === campos.tipo?.toLowerCase()
    );

    useEffect(() => {
        fetch('/api/impresoras')
            .then((res) => res.json())
            .then((datos) => setImpresorasDisponibles(datos))
            .catch(() => setImpresorasDisponibles([]));
    }, []);

    useEffect(() => {
        fetch('/api/materiales')
            .then((res) => res.json())
            .then((datos) => setMaterialDisponible(datos))
            .catch(() => setMaterialDisponible([]));
    }, []);

    const cargarConfiguraciones = () => {
        setCargando(true);
        fetch('/api/configuraciones')
            .then((res) => {
                if (!res.ok) throw new Error('Respuesta no válida');
                return res.json();
            })
            .then((datos) => setConfiguraciones(datos))
            .catch(() => setError('No se pudieron cargar las configuraciones.'))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarConfiguraciones();
    }, []);

    const actualizarCampo = (campo, valor) => {
        setCampos((anterior) => {
            if (campo === 'tipo') {
                return { ...anterior, tipo: valor, impresora: '', material: '' };
            }
            if (campo === 'impresora') {
                return { ...anterior, impresora: valor, material: '' };
            }
            return { ...anterior, [campo]: valor };
        });
    };

    const empezarCreacion = () => {
        setCampos(CAMPOS_INICIALES);
        setEditandoId(null);
        setErrorForm(null);
        setMostrarForm(true);
        setAviso(null);
    };

    const empezarEdicion = (config) => {
        setCampos(camposDesdeConfig(config));
        setEditandoId(config._id);
        setErrorForm(null);
        setAviso(null);
        setMostrarForm(true);
    };
   
const cancelarForm = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setErrorForm(null);
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm(null);
    setEnviando(true);

    const url = editandoId
        ? `/api/configuraciones/${editandoId}`
        : '/api/configuraciones';
    const metodo = editandoId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(campos),
        });
        const datos = await res.json();

        if (!res.ok) {
            setErrorForm(datos.error || 'No se pudo guardar la configuración');
            return;
        }

        setMostrarForm(false);
        setEditandoId(null);
        setAviso(
            datos.estado === 'pendiente'
                ? 'Tu configuración se ha enviado. Aparecerá para todos cuando un administrador la apruebe.'
                : null
        );
        cargarConfiguraciones();
    } catch {
        setErrorForm('Error de conexión. Inténtalo de nuevo.');
    } finally {
        setEnviando(false);
    }
};

const handleBorrar = async (id) => {
    if (!confirm('¿Seguro que quieres borrar esta configuración?')) return;

    try {
        const res = await fetch(`/api/configuraciones/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) {
            const datos = await res.json();
            alert(datos.error || 'No se pudo borrar');
            return;
        }
        cargarConfiguraciones();
    } catch {
        alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
        setEnviando(false);
    }
};
const handleAprobar = async (id) => {
    try {
        const res = await fetch(`/api/configuraciones/${id}/aprobar`, {
            method: 'PATCH',
            credentials: 'include',
        });
        if (!res.ok) {
            const datos = await res.json();
            alert(datos.error || 'No se pudo aprobar');
            return;
        }
        cargarConfiguraciones();
    } catch {
        alert('Error de conexión. Inténtalo de nuevo.');
    }
};

// Calcula cuántas hay pendientes
const pendientes = configuraciones.filter((c) => c.estado === 'pendiente').length;
return (
    <div className="configuraciones">
        <div className="configuraciones-encabezado">
            <div>
                <h1>⚙️ Configuraciones de la Comunidad</h1>
                <p>
                    Propuestas de ajustes compartidas por otros usuarios. Comenta y
                    vota las que te resulten útiles.
                </p>
            </div>

            {usuario ? (
                !mostrarForm && (
                    <button className="btn-primario" onClick={empezarCreacion}>
                        + Proponer configuración
                    </button>
                )
            ) : (
                <button className="btn-primario" onClick={abrirLogin}>
                    Inicia sesión para proponer
                </button>
            )}
        </div>

        {usuario && mostrarForm && (
            <form onSubmit={handleSubmit} className="configuracion-form">
                <h2>{editandoId ? 'Editar configuración' : 'Nueva configuración'}</h2>

                <div className="calculadora-campo">
                    <label>Título</label>
                    <input
                        type="text"
                        value={campos.titulo}
                        onChange={(e) => actualizarCampo('titulo', e.target.value)}
                        placeholder="ej. Ajustes PLA para piezas finas"
                        required
                    />
                </div>

                <div className="calculadora-fila">
                    <div className="calculadora-campo">
                        <label>Tipo</label>
                        <select
                            value={campos.tipo}
                            onChange={(e) => actualizarCampo('tipo', e.target.value)}
                        >
                            <option value="filamento">Filamento</option>
                            <option value="resina">Resina</option>
                            <option value="otros">Otros</option>
                        </select>
                    </div>
                    <div className="calculadora-campo">
                        <label>Impresora</label>
                        <select
                            value={campos.impresora}
                            onChange={(e) => actualizarCampo('impresora', e.target.value)}
                        >
                            <option value="">— Selecciona una impresora —</option>
                            {impresorasDelTipo.map((imp) => (
                                <option key={imp.modelo} value={imp.modelo}>
                                    {imp.modelo} ({imp.marca})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="calculadora-fila">
                    <div className="calculadora-campo">
                        <label>Material</label>
                        <select
                            value={campos.material}
                            onChange={(e) => actualizarCampo('material', e.target.value)}
                        >
                            <option value="">— Selecciona un material —</option>
                            {materialDelTipo.map((mat) => (
                                <option key={mat.nombre} value={mat.nombre}>
                                    {mat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>


                <div className="calculadora-fila">
                    <div className="calculadora-campo">
                        <label>Temperatura boquilla</label>
                        <input
                            type="text"
                            value={campos.temperaturaBoquilla}
                            onChange={(e) => actualizarCampo('temperaturaBoquilla', e.target.value)}
                            placeholder="ej. 210°C"
                        />
                    </div>
                    <div className="calculadora-campo">
                        <label>Temperatura cama</label>
                        <input
                            type="text"
                            value={campos.temperaturaCama}
                            onChange={(e) => actualizarCampo('temperaturaCama', e.target.value)}
                            placeholder="ej. 60°C"
                        />
                    </div>
                </div>

                <div className="calculadora-campo">
                    <label>Notas</label>
                    <textarea
                        value={campos.notas}
                        onChange={(e) => actualizarCampo('notas', e.target.value)}
                        rows={3}
                        placeholder="Cualquier detalle útil: retracción, adhesión, problemas evitados..."
                    />
                </div>

                {errorForm && <p className="auth-error">{errorForm}</p>}

                <div className="configuracion-form-acciones">
                    <button type="button" className="btn-texto" onClick={cancelarForm}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-primario" disabled={enviando}>
                        {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Publicar'}
                    </button>
                </div>
            </form>
        )}

        {cargando && <p className="printers-vacio">Cargando configuraciones...</p>}
        {error && <p className="printers-vacio">{error}</p>}
        {!cargando && !error && configuraciones.length === 0 && (
            <p className="printers-vacio">
                Todavía no hay configuraciones propuestas. ¡Sé el primero!
            </p>
        )}
        {aviso && <p className="configuracion-aviso">{aviso}</p>}

        {usuario?.rol === 'admin' && pendientes > 0 && (
            <p className="configuracion-aviso">
                Hay {pendientes} {pendientes === 1 ? 'configuración pendiente' : 'configuraciones pendientes'} de aprobar.
            </p>
        )}

        <div className="configuraciones-grid">
            {configuraciones.map((config) => (
                <ConfiguracionTarjeta
                    key={config._id}
                    config={config}
                    onEditar={empezarEdicion}
                    onBorrar={handleBorrar}
                    onAprobar={handleAprobar}
                />
            ))}
        </div>

    </div>
);
}

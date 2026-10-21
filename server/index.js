import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { conectarDB } from './db.js';
import {
  hashearContrasena,
  verificarContrasena,
  crearToken,
  verificarToken,
  requiereAuth,
  requiereRol,
  usuarioOpcional,
} from './auth.js';
import { ObjectId } from 'mongodb';

const app = express();
// Opciones de la cookie de sesión; en producción solo viaja por HTTPS
const opcionesCookie = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
};

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/salud', async (req, res) => {
  try {
    const db = await conectarDB();
    await db.command({ ping: 1 });
    res.json({ ok: true, mensaje: 'Conectado a MongoDB Atlas' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'No se pudo conectar' });
  }
});

app.get('/api/impresoras', async (req, res) => {
  try {
    const db = await conectarDB();
    const impresoras = await db
      .collection('impresoras')
      .find({}, { projection: { _id: 0 } })
      .toArray();
    res.json(impresoras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar las impresoras' });
  }
});

app.get('/api/materiales', async (req, res) => {
  try {
    const db = await conectarDB();
    const materiales = await db
      .collection('materiales')
      .find({}, { projection: { _id: 0 } })
      .toArray();
    res.json(materiales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los materiales' });
  }
});

app.get('/api/tipos', async (req, res) => {
  try {
    const db = await conectarDB();
    const tipos = await db.collection('tipos').find({}).toArray();
    res.json(tipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los tipos' });
  }
});
// Datos del usuario que se envían a la web (nunca incluyen la contraseña)
function datosPublicos(usuario) {
  return {
    id: usuario._id.toString(),
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol || 'usuario',
  };
}
// ===== Autenticación =====

app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body;

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const db = await conectarDB();
    const usuarios = db.collection('usuarios');

    const existente = await usuarios.findOne({ email: email.toLowerCase() });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const contrasenaHash = await hashearContrasena(contrasena);
    const resultado = await usuarios.insertOne({
      nombre,
      email: email.toLowerCase(),
      contrasenaHash,
      rol: 'usuario',
      creadoEn: new Date(),
    });

    const usuario = { _id: resultado.insertedId, nombre, email: email.toLowerCase(), rol: 'usuario' };
    const token = crearToken(usuario);

    res.cookie('token', token, opcionesCookie);

    res.status(201).json(datosPublicos(usuario));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo completar el registro' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    if (!email || !contrasena) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const db = await conectarDB();
    const usuarios = db.collection('usuarios');
    const usuario = await usuarios.findOne({ email: email.toLowerCase() });

    // Mismo mensaje tanto si el email no existe como si la contraseña es incorrecta,
    // para no dar pistas a quien intente adivinar cuentas existentes
    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const coincide = await verificarContrasena(contrasena, usuario.contrasenaHash);
    if (!coincide) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = crearToken(usuario);
   res.cookie('token', token, opcionesCookie);

    res.json(datosPublicos(usuario));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

// Permite a React comprobar, al cargar la página, si ya hay una sesión activa
app.get('/api/auth/yo', requiereAuth, (req, res) => {
  res.json({ nombre: req.usuario.nombre, email: req.usuario.email, rol: req.usuario.rol });
});
// ===== Perfil =====

// Cambiar el nombre
app.put('/api/auth/perfil', requiereAuth, async (req, res) => {
  try {
    const { nombre } = req.body;
    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';

    if (nombreLimpio.length < 2 || nombreLimpio.length > 50) {
      return res.status(400).json({ error: 'El nombre debe tener entre 2 y 50 caracteres' });
    }

    const db = await conectarDB();
    const usuario = await db
      .collection('usuarios')
      .findOneAndUpdate(
        { _id: new ObjectId(req.usuario.id) },
        { $set: { nombre: nombreLimpio } },
        { returnDocument: 'after' }
      );

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // El nombre está copiado en lo que ya has escrito: lo actualizamos también
    await db
      .collection('configuraciones')
      .updateMany({ autorId: req.usuario.id }, { $set: { autorNombre: nombreLimpio } });
    await db
      .collection('comentarios')
      .updateMany({ autorId: req.usuario.id }, { $set: { autorNombre: nombreLimpio } });

    // Token nuevo, porque el nombre viaja dentro del token
    res.cookie('token', token, opcionesCookie);

    res.json(datosPublicos(usuario));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
});

// Cambiar la contraseña
app.put('/api/auth/contrasena', requiereAuth, async (req, res) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (contrasenaNueva.length < 6) {
      return res
        .status(400)
        .json({ error: 'La contraseña nueva debe tener al menos 6 caracteres' });
    }
    if (contrasenaNueva === contrasenaActual) {
      return res
        .status(400)
        .json({ error: 'La contraseña nueva debe ser distinta de la actual' });
    }

    const db = await conectarDB();
    const usuarios = db.collection('usuarios');
    const usuario = await usuarios.findOne({ _id: new ObjectId(req.usuario.id) });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const coincide = await verificarContrasena(contrasenaActual, usuario.contrasenaHash);
    if (!coincide) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }

    await usuarios.updateOne(
      { _id: usuario._id },
      {
        $set: {
          contrasenaHash: await hashearContrasena(contrasenaNueva),
          contrasenaCambiadaEn: new Date(),
        },
      }
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo cambiar la contraseña' });
  }
});
// ===== Panel de usuario =====

// Dado un grupo de ids de configuración (texto), devuelve { id: título }
async function titulosPorId(db, idsTexto) {
  const validos = [...new Set(idsTexto)].filter((id) => ObjectId.isValid(id));
  const configs = await db
    .collection('configuraciones')
    .find(
      { _id: { $in: validos.map((id) => new ObjectId(id)) } },
      { projection: { titulo: 1 } }
    )
    .toArray();
  return Object.fromEntries(configs.map((c) => [c._id.toString(), c.titulo]));
}

// Las cuatro tarjetas de arriba del panel
app.get('/api/panel/resumen', requiereAuth, async (req, res) => {
  try {
    const db = await conectarDB();
    const usuarioId = req.usuario.id;

    const mias = await db
      .collection('configuraciones')
      .find({ autorId: usuarioId }, { projection: { _id: 1 } })
      .toArray();
    const ids = mias.map((c) => c._id.toString());

    // Las tres consultas son independientes, así que se lanzan a la vez
    const [valoracionesDadas, comentarios, recibidos] = await Promise.all([
      db.collection('votos').countDocuments({ usuarioId }),
      db.collection('comentarios').countDocuments({ autorId: usuarioId }),
      db
        .collection('votos')
        .aggregate([
          // votos de otras personas en mis configuraciones
          { $match: { configuracionId: { $in: ids }, usuarioId: { $ne: usuarioId } } },
          { $group: { _id: null, media: { $avg: '$valor' }, total: { $sum: 1 } } },
        ])
        .toArray(),
    ]);

    res.json({
      configuraciones: ids.length,
      valoracionesDadas,
      comentarios,
      mediaRecibida: recibidos[0] ? Math.round(recibidos[0].media * 10) / 10 : 0,
      votosRecibidos: recibidos[0] ? recibidos[0].total : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo cargar el resumen' });
  }
});

// Mis configuraciones, cada una con su media y su número de votos
app.get('/api/panel/configuraciones', requiereAuth, async (req, res) => {
  try {
    const db = await conectarDB();
    const usuarioId = req.usuario.id;

    const configuraciones = await db
      .collection('configuraciones')
      .find({ autorId: usuarioId })
      .sort({ creadoEn: -1 })
      .toArray();
    const ids = configuraciones.map((c) => c._id.toString());

    const medias = await db
      .collection('votos')
      .aggregate([
        { $match: { configuracionId: { $in: ids }, usuarioId: { $ne: usuarioId } } },
        {
          $group: {
            _id: '$configuracionId',
            media: { $avg: '$valor' },
            total: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const mediaPorId = Object.fromEntries(medias.map((m) => [m._id, m]));

    res.json(
      configuraciones.map((c) => {
        const m = mediaPorId[c._id.toString()];
        return {
          ...c,
          estado: c.estado || 'aprobada', // las antiguas, sin estado, cuentan como aprobadas
          media: m ? Math.round(m.media * 10) / 10 : null,
          totalVotos: m ? m.total : 0,
        };
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar tus configuraciones' });
  }
});

// Comentarios que han dejado otros en mis configuraciones
app.get('/api/panel/comentarios-recibidos', requiereAuth, async (req, res) => {
  try {
    const db = await conectarDB();
    const usuarioId = req.usuario.id;

    const mias = await db
      .collection('configuraciones')
      .find({ autorId: usuarioId }, { projection: { titulo: 1 } })
      .toArray();
    const titulos = Object.fromEntries(mias.map((c) => [c._id.toString(), c.titulo]));
    const ids = Object.keys(titulos);

    const comentarios = await db
      .collection('comentarios')
      .find({
        configuracionId: { $in: ids },
        autorId: { $ne: usuarioId },
        estado: { $ne: 'pendiente' },
      })
      .sort({ creadoEn: -1 })
      .toArray();

    // Las estrellas que puso cada persona en esa misma configuración
    const votos = await db
      .collection('votos')
      .find({
        configuracionId: { $in: ids },
        usuarioId: { $in: comentarios.map((c) => c.autorId) },
      })
      .toArray();
    const valorPorPar = Object.fromEntries(
      votos.map((v) => [`${v.configuracionId}:${v.usuarioId}`, v.valor])
    );

    res.json(
      comentarios.map((c) => ({
        _id: c._id,
        autorNombre: c.autorNombre,
        texto: c.texto,
        creadoEn: c.creadoEn,
        configuracionId: c.configuracionId,
        configuracionTitulo: titulos[c.configuracionId],
        valoracion: valorPorPar[`${c.configuracionId}:${c.autorId}`] ?? null,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los comentarios recibidos' });
  }
});

// Las valoraciones que he dado yo
app.get('/api/panel/valoraciones', requiereAuth, async (req, res) => {
  try {
    const db = await conectarDB();
    const votos = await db
      .collection('votos')
      .find({ usuarioId: req.usuario.id })
      .sort({ actualizadoEn: -1 })
      .toArray();

    const titulos = await titulosPorId(db, votos.map((v) => v.configuracionId));

    res.json(
      votos.map((v) => ({
        configuracionId: v.configuracionId,
        configuracionTitulo: titulos[v.configuracionId] ?? 'Configuración eliminada',
        valor: v.valor,
        fecha: v.actualizadoEn,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar tus valoraciones' });
  }
});

// Los comentarios que he escrito yo
app.get('/api/panel/comentarios', requiereAuth, async (req, res) => {
  try {
    const db = await conectarDB();
    const comentarios = await db
      .collection('comentarios')
      .find({ autorId: req.usuario.id })
      .sort({ creadoEn: -1 })
      .toArray();

    const titulos = await titulosPorId(db, comentarios.map((c) => c.configuracionId));

    res.json(
      comentarios.map((c) => ({
        _id: c._id,
        texto: c.texto,
        creadoEn: c.creadoEn,
        configuracionId: c.configuracionId,
        configuracionTitulo: titulos[c.configuracionId] ?? 'Configuración eliminada',
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar tus comentarios' });
  }
});

// ===== Cola del Admin =====
app.get(
  '/api/admin/pendientes',
  requiereAuth,
  requiereRol('admin'),
  async (req, res) => {
    try {
      const db = await conectarDB();

      const configuraciones = await db
        .collection('configuraciones')
        .find({ estado: 'pendiente' })
        .sort({ creadoEn: 1 })
        .toArray();

      const comentarios = await db
        .collection('comentarios')
        .find({ estado: 'pendiente' })
        .sort({ creadoEn: 1 })
        .toArray();

      // titulosPorId es la función auxiliar que ya tienes en el bloque del panel
      const titulos = await titulosPorId(db, comentarios.map((c) => c.configuracionId));

      res.json({
        configuraciones,
        comentarios: comentarios.map((c) => ({
          ...c,
          configuracionTitulo: titulos[c.configuracionId] ?? 'Configuración eliminada',
        })),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'No se pudieron cargar los pendientes' });
    }
  }
);

export default app;

// En local arrancamos nosotros el servidor; en Vercel lo hace la plataforma
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
}

// ===== Configuraciones =====

app.get('/api/configuraciones', async (req, res) => {
  try {
    const usuario = usuarioOpcional(req);

    // Público: todo lo que no esté pendiente (las antiguas, sin estado, cuentan como aprobadas)
    let filtro = { estado: { $ne: 'pendiente' } };

    if (usuario?.rol === 'admin') {
      filtro = {}; // el admin lo ve todo
    } else if (usuario) {
      // un usuario ve lo aprobado y, además, lo suyo aunque esté pendiente
      filtro = {
        $or: [{ estado: { $ne: 'pendiente' } }, { autorId: usuario.id }],
      };
    }

    const db = await conectarDB();
    const configuraciones = await db
      .collection('configuraciones')
      .find(filtro)
      .sort({ creadoEn: -1 })
      .toArray();
    res.json(configuraciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar las configuraciones' });
  }
});

app.post('/api/configuraciones', requiereAuth, async (req, res) => {
  try {
    const {
      titulo,
      tipo,
      impresora,
      material,
      temperaturaBoquilla,
      temperaturaCama,
      velocidad,
      notas,
    } = req.body;

    if (!titulo || !tipo) {
      return res.status(400).json({ error: 'Título y tipo son obligatorios' });
    }

    const db = await conectarDB();
    const nuevaConfiguracion = {
      titulo,
      tipo,
      impresora: impresora || '',
      material: material || '',
      temperaturaBoquilla: temperaturaBoquilla || '',
      temperaturaCama: temperaturaCama || '',
      velocidad: velocidad || '',
      notas: notas || '',
      estado: req.usuario.rol === 'admin' ? 'aprobada' : 'pendiente',
      autorId: req.usuario.id,
      autorNombre: req.usuario.nombre,
      autorEmail: req.usuario.email,
      creadoEn: new Date(),
    };

    const resultado = await db.collection('configuraciones').insertOne(nuevaConfiguracion);
    res.status(201).json({ _id: resultado.insertedId, ...nuevaConfiguracion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear la configuración' });
  }
});

app.put('/api/configuraciones/:id', requiereAuth, async (req, res) => {
  try {
    // Si no eres admin, tu edición vuelve a revisión; el admin no cambia el estado

    const db = await conectarDB();
    const coleccion = db.collection('configuraciones');
    const configuracion = await coleccion.findOne({ _id: new ObjectId(req.params.id) });

    if (!configuracion) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const esAutor = configuracion.autorId === req.usuario.id;
    const esAdmin = req.usuario.rol === 'admin';
    if (!esAutor && !esAdmin) {
      return res.status(403).json({ error: 'No puedes editar esta configuración' });
    }

    const {
      titulo,
      tipo,
      impresora,
      material,
      temperaturaBoquilla,
      temperaturaCama,
      velocidad,
      notas,
    } = req.body;
    const estado = esAdmin ? configuracion.estado || 'aprobada' : 'pendiente';

    await coleccion.updateOne(
      { _id: configuracion._id },
      {
        $set: {
          titulo,
          tipo,
          impresora,
          material,
          temperaturaBoquilla,
          temperaturaCama,
          velocidad,
          notas,
          estado,
        },
      }
    );

    res.json({ ok: true, estado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar la configuración' });
  }
});

app.delete('/api/configuraciones/:id', requiereAuth, async (req, res) => {
  try {
    const db = await conectarDB();
    const coleccion = db.collection('configuraciones');
    const configuracion = await coleccion.findOne({ _id: new ObjectId(req.params.id) });

    if (!configuracion) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    const esAutor = configuracion.autorId === req.usuario.id;
    const esAdmin = req.usuario.rol === 'admin';
    if (!esAutor && !esAdmin) {
      return res.status(403).json({ error: 'No puedes borrar esta configuración' });
    }

    await coleccion.deleteOne({ _id: configuracion._id });
    await db.collection('votos').deleteMany({ configuracionId: req.params.id });
    await db.collection('comentarios').deleteMany({ configuracionId: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo borrar la configuración' });
  }
});

// ruta nueva para aprobar
app.patch(
  '/api/configuraciones/:id/aprobar',
  requiereAuth,
  requiereRol('admin'),
  async (req, res) => {
    try {
      const db = await conectarDB();
      const resultado = await db
        .collection('configuraciones')
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { estado: 'aprobada', aprobadaEn: new Date() } }
        );

      if (resultado.matchedCount === 0) {
        return res.status(404).json({ error: 'Configuración no encontrada' });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'No se pudo aprobar la configuración' });
    }
  }
);

// ===== Comentarios =====

app.get('/api/configuraciones/:id/comentarios', async (req, res) => {
  try {
    const usuario = usuarioOpcional(req);

    let filtro = { configuracionId: req.params.id, estado: { $ne: 'pendiente' } };
    if (usuario?.rol === 'admin') {
      filtro = { configuracionId: req.params.id };
    } else if (usuario) {
      filtro = {
        configuracionId: req.params.id,
        $or: [{ estado: { $ne: 'pendiente' } }, { autorId: usuario.id }],
      };
    }

    const db = await conectarDB();
    const comentarios = await db
      .collection('comentarios')
      .find(filtro)
      .sort({ creadoEn: 1 })
      .toArray();
    res.json(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los comentarios' });
  }
});

app.post('/api/configuraciones/:id/comentarios', requiereAuth, async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: 'El comentario no puede estar vacío' });
    }

    const db = await conectarDB();

    // Comprobamos que la configuración existe antes de comentar en ella
    const configuracion = await db
      .collection('configuraciones')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!configuracion) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    if (configuracion.estado === 'pendiente') {
      return res.status(403).json({ error: 'Esta configuración aún no está aprobada' });
    }

    const nuevoComentario = {
      configuracionId: req.params.id,
      autorId: req.usuario.id,
      autorNombre: req.usuario.nombre,
      texto: texto.trim(),
      estado: req.usuario.rol === 'admin' ? 'aprobada' : 'pendiente',
      creadoEn: new Date(),
    };

    const resultado = await db.collection('comentarios').insertOne(nuevoComentario);
    res.status(201).json({ _id: resultado.insertedId, ...nuevoComentario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo publicar el comentario' });
  }
});
app.patch(
  '/api/comentarios/:id/aprobar',
  requiereAuth,
  requiereRol('admin'),
  async (req, res) => {
    try {
      const db = await conectarDB();
      const resultado = await db
        .collection('comentarios')
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { estado: 'aprobada', aprobadaEn: new Date() } }
        );

      if (resultado.matchedCount === 0) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'No se pudo aprobar el comentario' });
    }
  }
);

app.delete('/api/comentarios/:id', requiereAuth, async (req, res) => {
  try {
    const db = await conectarDB();
    const coleccion = db.collection('comentarios');
    const comentario = await coleccion.findOne({ _id: new ObjectId(req.params.id) });

    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    const esAutor = comentario.autorId === req.usuario.id;
    const esAdmin = req.usuario.rol === 'admin';
    if (!esAutor && !esAdmin) {
      return res.status(403).json({ error: 'No puedes borrar este comentario' });
    }

    await coleccion.deleteOne({ _id: comentario._id });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo borrar el comentario' });
  }
});


// ===== Votos (valoración de 1 a 5 estrellas) =====

async function resumenVotos(coleccion, configuracionId, usuarioId) {
  const [agregado] = await coleccion
    .aggregate([
      { $match: { configuracionId } },
      { $group: { _id: null, media: { $avg: '$valor' }, total: { $sum: 1 } } },
    ])
    .toArray();

  let miVoto = null;
  if (usuarioId) {
    const voto = await coleccion.findOne({ configuracionId, usuarioId });
    miVoto = voto ? voto.valor : null;
  }

  return {
    media: agregado ? Math.round(agregado.media * 10) / 10 : 0,
    total: agregado ? agregado.total : 0,
    miVoto,
  };
}

app.get('/api/configuraciones/:id/votos', async (req, res) => {
  try {
    const db = await conectarDB();

    // Si hay sesión, devolvemos también qué votó esta persona (sin exigir login)
    let usuarioId = null;
    const token = req.cookies?.token;
    if (token) {
      try {
        usuarioId = verificarToken(token).id;
      } catch {
        usuarioId = null;
      }
    }

    res.json(await resumenVotos(db.collection('votos'), req.params.id, usuarioId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar las valoraciones' });
  }
});

app.post('/api/configuraciones/:id/votos', requiereAuth, async (req, res) => {
  try {
    const { valor } = req.body;
    if (!Number.isInteger(valor) || valor < 1 || valor > 5) {
      return res.status(400).json({ error: 'La valoración debe ser un número del 1 al 5' });
    }

    const db = await conectarDB();
    const configuracion = await db
      .collection('configuraciones')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!configuracion) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    if (configuracion.estado === 'pendiente') {
      return res.status(403).json({ error: 'Esta configuración aún no está aprobada' });
    }
    if (configuracion.autorId === req.usuario.id) {
      return res.status(403).json({ error: 'No puedes valorar tu propia configuración' });
    }
    const coleccion = db.collection('votos');
    const filtro = { configuracionId: req.params.id, usuarioId: req.usuario.id };
    const existente = await coleccion.findOne(filtro);

    // Si pulsas la misma puntuación que ya tenías, se quita; si no, se fija o cambia
    if (existente && existente.valor === valor) {
      await coleccion.deleteOne(filtro);
    } else {
      await coleccion.updateOne(
        filtro,
        { $set: { ...filtro, valor, actualizadoEn: new Date() } },
        { upsert: true }
      );
    }

    res.json(await resumenVotos(coleccion, req.params.id, req.usuario.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo registrar la valoración' });
  }
});
